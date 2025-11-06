import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user';
import { AuthenticationError, AuthorizationError } from '../errors';

/**
 * Extended Request interface with authenticated user information
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    teamId?: string;
  };
}

/**
 * Role-based authorization middleware
 * Restricts route access to users with specific roles
 */
export const authorize = (allowedRoles: UserRole | UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    // Convert single role to array for consistent checking
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!req.user.role || !roles.includes(req.user.role)) {
      return next(new AuthorizationError(`Access denied: requires one of the following roles: ${roles.join(', ')}`));
    }

    next();
  };
};

/**
 * Team-based access control middleware
 * Ensures users can only access resources from their own team
 */
export const requireTeamAccess = (teamIdParam: string = 'id') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    // Extract team ID from params or body
    const teamId = req.params[teamIdParam] || req.body.teamId;
    
    if (!teamId) {
      return next(new AuthorizationError('Team ID is required'));
    }

    // Verify user belongs to the requested team
    if (!req.user.teamId || req.user.teamId !== teamId) {
      return next(new AuthorizationError('Access denied: you do not have permission to access this team'));
    }

    next();
  };
};

/**
 * Resource ownership validation middleware
 * Ensures users can only access/modify their own resources (admins can access all)
 */
export const requireOwnership = (userIdParam: string = 'userId') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    // Extract target user ID from params or body
    const targetUserId = req.params[userIdParam] || req.body.userId;
    
    if (!targetUserId) {
      return next(new AuthorizationError('User ID is required'));
    }

    // Allow access if user owns resource or is admin
    if (req.user.id !== targetUserId && req.user.role !== UserRole.ADMIN) {
      return next(new AuthorizationError('Access denied: you can only access your own resources'));
    }

    next();
  };
};

/**
 * Resource access validation middleware for team members
 * Allows access to resources owned by the user, admins, or team members (interviewers)
 * This is useful for viewing resources where team collaboration is needed
 */
export const requireOwnershipOrTeamMember = (userIdParam: string = 'userId') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    // Extract target user ID from params or body
    const targetUserId = req.params[userIdParam] || req.body.userId;
    
    if (!targetUserId) {
      return next(new AuthorizationError('User ID is required'));
    }

    // Allow access if:
    // 1. User owns the resource
    // 2. User is an admin
    // 3. User is an interviewer (can view team members' resources for scheduling)
    if (
      req.user.id === targetUserId ||
      req.user.role === UserRole.ADMIN ||
      req.user.role === UserRole.INTERVIEWER
    ) {
      return next();
    }

    return next(new AuthorizationError('Access denied: you can only access your own resources or team resources'));
  };
};