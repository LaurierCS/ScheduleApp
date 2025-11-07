import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserRole, IUser } from '../models/user';
import { AuthenticationError } from '../errors';

/**
 * Extended Express Request interface to include authenticated user
 * This allows us to access req.user in protected routes
 */
export interface AuthRequest extends Request {
    user?: IUser;
}

/**
 * JWT payload structure
 * Contains the minimal user data needed for authentication
 */
interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 * 
 * This middleware:
 * 1. Extracts token from Authorization header
 * 2. Verifies the token signature
 * 3. Fetches the full user from database
 * 4. Attaches user to req.user for use in route handlers
 * 
 * Usage:
 * router.get('/protected', requireAuth, (req: AuthRequest, res) => {
 *   const user = req.user; // User is available here
 * });
 * 
 * @throws AuthenticationError if token is missing, invalid, or user not found
 */
export const requireAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Extract token from Authorization header (format: "Bearer <token>")
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError('No token provided. Please login first.');
        }

        const token = authHeader.split(' ')[1];

        // Verify token signature and decode payload
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(token, secret) as JwtPayload;

        // Fetch user from database (excluding password for security)
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            throw new AuthenticationError('User not found. Token may be invalid.');
        }

        // Attach user to request for use in route handlers
        req.user = user;
        next();
    } catch (error) {
        // Handle JWT-specific errors with meaningful messages
        if (error instanceof jwt.JsonWebTokenError) {
            next(new AuthenticationError('Invalid token. Please login again.'));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(new AuthenticationError('Token expired. Please login again.'));
        } else {
            next(error);
        }
    }
};

/**
 * Role-based authorization middleware factory
 * Creates middleware that checks if authenticated user has required role(s)
 * 
 * This middleware must be used AFTER requireAuth middleware
 * It checks if the authenticated user's role matches one of the allowed roles
 * 
 * Usage:
 * // Single role
 * router.post('/teams', requireAuth, requireRole([UserRole.ADMIN]), createTeam);
 * 
 * // Multiple roles
 * router.get('/availability', requireAuth, requireRole([UserRole.INTERVIEWER, UserRole.CANDIDATE]), getAvailability);
 * 
 * @param allowedRoles - Array of roles that are permitted to access the route
 * @returns Middleware function that validates user role
 * @throws AuthenticationError if user lacks required role
 */
export const requireRole = (allowedRoles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        // Ensure user is authenticated first
        if (!req.user) {
            return next(new AuthenticationError('Authentication required. Use requireAuth middleware first.'));
        }

        // Check if user's role is in the allowed roles list
        const userRole = req.user.role || UserRole.CANDIDATE; // Default to candidate if no role set

        if (!allowedRoles.includes(userRole)) {
            return next(
                new AuthenticationError(
                    `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}`
                )
            );
        }

        // User has required role, proceed to next middleware/handler
        next();
    };
};

