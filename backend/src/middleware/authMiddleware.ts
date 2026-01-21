import { Request, Response, NextFunction } from 'express';
import JWTUtils, { JWTPayload } from '../utils/jwt';
import User, { UserRole, IUser } from '../models/user';
import { ValidationError } from '../errors';

/**
 * Extend Express Request interface to include user information
 * This allows us to access req.user in protected routes after authentication
 */
declare global {
    namespace Express {
        // Attach the full user document (IUser) to the Express Request when authenticated.
        // Keep it optional so handlers remain compatible with Express' Request type.
        interface Request {
            user?: IUser;
        }
    }
}

/**
 * Extended Express Request interface for routes that expect an authenticated user.
 * The `user` property is optional to stay compatible with Express handler types;
 * route handlers can assert presence (e.g. `if (!req.user) throw ...`).
 */
export interface AuthRequest extends Request {
    user?: IUser;
}

/**
 * Password Reset Rate Limiter Middleware
 * Enforces 24-hour rate limit on password resets per user
 * 
 * @throws ValidationError if user attempts password reset within 24 hours
 */
export const passwordResetRateLimiter = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(); // Let route handler deal with missing email
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return next(); // Let route handler deal with user not found
        }

        // Check if user has reset password in last 24 hours
        if (user.lastPasswordResetAt) {
            const lastResetTime = new Date(user.lastPasswordResetAt).getTime();
            const currentTime = new Date().getTime();
            const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

            if (currentTime - lastResetTime < oneDayMs) {
                throw new ValidationError('Password reset limited to once every 24 hours');
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Login Rate Limiter Middleware
 * Locks account after 5 failed login attempts for 15 minutes
 * 
 * @throws ValidationError if account is currently locked
 */
export const loginRateLimiter = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(); // Let route handler deal with missing email
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return next(); // Let route handler deal with user not found
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > new Date()) {
            const minutesRemaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
            throw new ValidationError(`Account locked. Try again in ${minutesRemaining} minutes`);
        }

        // Reset lock if expired
        if (user.lockUntil && user.lockUntil <= new Date()) {
            user.failedLoginAttempts = 0;
            user.lockUntil = undefined;
            await user.save();
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token using JWTUtils
        const payload: JWTPayload = JWTUtils.verifyAccessToken(token);

        // Check if user still exists and is active. Select full user document (exclude password).
        const user = await User.findById(payload.userId).select('-password');
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        // Attach full user document to request so downstream code (permissions, handlers)
        // can access fields like _id, teamId, groupIds, role, etc.
        req.user = user as IUser;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error instanceof Error ? error.message : 'Authentication failed'
        });
    }
};

/**
 * Role-based authorization middleware factory (RBAC)
 * Creates middleware that checks if authenticated user has required role(s)
 * 
 * This middleware must be used AFTER authenticate middleware
 * It checks if the authenticated user's role matches one of the allowed roles
 * 
 * Usage:
 * // Single role
 * router.post('/teams', authenticate, authorize(UserRole.ADMIN), createTeam);
 * 
 * // Multiple roles
 * router.get('/availability', authenticate, authorize(UserRole.INTERVIEWER, UserRole.CANDIDATE), getAvailability);
 * 
 * @param roles - One or more roles that are permitted to access the route
 * @returns Middleware function that validates user role
 * @returns 401 if user not authenticated, 403 if insufficient permissions
 */
export const authorize = (...roles: Array<UserRole | UserRole[]>) => {
    // Accept either an array (authorize([A,B])) or varargs (authorize(A,B))
    const allowed: UserRole[] = ([] as UserRole[]).concat(...roles as any);

    return (req: Request, res: Response, next: NextFunction) => {
        // Ensure user is authenticated first
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if user's role is in the allowed roles list (RBAC check)
        if (!allowed.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        // User has required role, proceed to next middleware/handler
        next();
    };
};

/**
 * Optional authentication middleware
 * Attempts to authenticate user but doesn't fail if no token is provided
 * Useful for routes that work differently for authenticated vs anonymous users
 * 
 * Usage:
 * router.get('/public-or-private', optionalAuth, (req, res) => {
 *   if (req.user) {
 *     // User is authenticated, provide personalized content
 *   } else {
 *     // User is anonymous, provide public content
 *   }
 * });
 */
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload: JWTPayload = JWTUtils.verifyAccessToken(token);

            // Select full user document (exclude password) so downstream code can use teamId etc.
            const user = await User.findById(payload.userId).select('-password');
            if (user && user.isActive) {
                req.user = user as IUser;
            }
        }

        next();
    } catch (error) {
        // Continue without authentication for optional auth
        next();
    }
};

// Backwards compatibility: Export old names as aliases to new names
// This prevents breaking changes for existing code using the old middleware
/**
 * @deprecated Use `authenticate` instead. This alias is for backwards compatibility.
 */
export const requireAuth = authenticate;

/**
 * @deprecated Use `authorize` instead. This alias is for backwards compatibility.
 */
export const requireRole = authorize;