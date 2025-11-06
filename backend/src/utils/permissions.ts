import { UserRole } from '../models/user';
import { AuthRequest } from '../middleware/authMiddleware';
import { AuthorizationError } from '../errors';

/**
 * Permission checking utilities for role-based access control
 * Provides helper methods for validating permissions in controllers and services
 */
export class PermissionChecker {
  /**
   * Check if user can access a specific team
   * Users can only access teams they belong to
   */
  static canAccessTeam(userId: string, userRole: UserRole, userTeamId: string | undefined, targetTeamId: string): boolean {
    // Admin can access their own team
    if (userRole === UserRole.ADMIN && userTeamId === targetTeamId) {
      return true;
    }
    
    // Interviewers and candidates can access their own team
    if ((userRole === UserRole.INTERVIEWER || userRole === UserRole.CANDIDATE) && userTeamId === targetTeamId) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if user can modify another user's data
   * Users can modify themselves, admins can modify users in their team
   */
  static canModifyUser(currentUserId: string, currentUserRole: UserRole, targetUserId: string, targetUserTeamId: string | undefined, currentUserTeamId: string | undefined): boolean {
    // Users can always modify themselves
    if (currentUserId === targetUserId) {
      return true;
    }
    
    // Admins can modify users in their team
    if (currentUserRole === UserRole.ADMIN && currentUserTeamId === targetUserTeamId) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if user can modify a team
   * Only the team admin can modify team settings
   */
  static canModifyTeam(userId: string, userRole: UserRole, teamAdminId: string): boolean {
    if (userRole === UserRole.ADMIN && userId === teamAdminId) {
      return true;
    }
    
    return false;
  }

  /**
   * Enforce team access requirement
   * Throws AuthorizationError if user cannot access the team
   */
  static requireTeamAccess(req: AuthRequest, teamId: string): void {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    if (!this.canAccessTeam(req.user.id, req.user.role, req.user.teamId, teamId)) {
      throw new AuthorizationError('Access denied: you do not have permission to access this team');
    }
  }

  /**
   * Enforce resource ownership requirement
   * Throws AuthorizationError if user is not the owner
   */
  static requireOwnership(req: AuthRequest, resourceOwnerId: string): void {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    if (req.user.id !== resourceOwnerId) {
      throw new AuthorizationError('Access denied: you can only modify your own resources');
    }
  }

  /**
   * Enforce team admin requirement
   * Throws AuthorizationError if user is not the team admin
   */
  static requireAdminOfTeam(req: AuthRequest, teamAdminId: string): void {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    if (req.user.role !== UserRole.ADMIN || req.user.id !== teamAdminId) {
      throw new AuthorizationError('Access denied: only the team admin can perform this action');
    }
  }
}