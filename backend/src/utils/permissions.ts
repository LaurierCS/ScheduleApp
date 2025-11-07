import { UserRole } from '../models/user';
import { AuthRequest } from '../middleware/authMiddleware';
import { AuthorizationError } from '../errors';

/**
 * Permission checking utilities for role-based access control
 * Provides helper methods for validating permissions in controllers and services
 * 
 * These utilities can be used in two ways:
 * 1. As boolean checks (canAccessTeam, canModifyUser, etc.) - for conditional logic
 * 2. As enforcement methods (requireTeamAccess, requireOwnership, etc.) - throws errors if check fails
 * 
 * Usage in controllers:
 * ```typescript
 * // Boolean check
 * if (!PermissionChecker.canAccessTeam(userId, userRole, userTeamId, targetTeamId)) {
 *   return res.status(403).json({ error: 'Access denied' });
 * }
 * 
 * // Enforcement (throws error)
 * PermissionChecker.requireTeamAccess(req, teamId);
 * ```
 */
export class PermissionChecker {
  /**
   * Check if user can access a specific team
   * Users can only access teams they belong to (admins, interviewers, candidates)
   * 
   * @param userId - Current user's ID
   * @param userRole - Current user's role
   * @param userTeamId - Current user's team ID
   * @param targetTeamId - Team ID being accessed
   * @returns true if user can access the team
   */
  static canAccessTeam(
    userId: string,
    userRole: UserRole,
    userTeamId: string | undefined,
    targetTeamId: string
  ): boolean {
    // Users can only access their own team
    if (userTeamId && userTeamId === targetTeamId) {
      return true;
    }

    return false;
  }

  /**
   * Check if user can modify another user's data
   * Rules:
   * - Users can always modify themselves
   * - Admins can modify users in their team
   * - Interviewers and Candidates cannot modify others
   * 
   * @param currentUserId - Current user's ID
   * @param currentUserRole - Current user's role
   * @param targetUserId - User ID being modified
   * @param targetUserTeamId - Target user's team ID
   * @param currentUserTeamId - Current user's team ID
   * @returns true if modification is allowed
   */
  static canModifyUser(
    currentUserId: string,
    currentUserRole: UserRole,
    targetUserId: string,
    targetUserTeamId: string | undefined,
    currentUserTeamId: string | undefined
  ): boolean {
    // Users can always modify themselves
    if (currentUserId === targetUserId) {
      return true;
    }

    // Admins can modify users in their team
    if (
      currentUserRole === UserRole.ADMIN &&
      currentUserTeamId &&
      targetUserTeamId &&
      currentUserTeamId === targetUserTeamId
    ) {
      return true;
    }

    return false;
  }

  /**
   * Check if user can view another user's resources (availability, meetings, etc.)
   * Rules:
   * - Users can always view their own resources
   * - Admins can view resources of users in their team
   * - Interviewers can view resources of team members (for scheduling coordination)
   * - Candidates can only view their own resources
   * 
   * @param currentUserId - Current user's ID
   * @param currentUserRole - Current user's role
   * @param targetUserId - User ID whose resources are being accessed
   * @param currentUserTeamId - Current user's team ID
   * @param targetUserTeamId - Target user's team ID
   * @returns true if viewing is allowed
   */
  static canViewUserResources(
    currentUserId: string,
    currentUserRole: UserRole,
    targetUserId: string,
    currentUserTeamId: string | undefined,
    targetUserTeamId: string | undefined
  ): boolean {
    // Users can always view their own resources
    if (currentUserId === targetUserId) {
      return true;
    }

    // Must be in the same team to view resources
    if (!currentUserTeamId || !targetUserTeamId || currentUserTeamId !== targetUserTeamId) {
      return false;
    }

    // Admins can view all team resources
    if (currentUserRole === UserRole.ADMIN) {
      return true;
    }

    // Interviewers can view team members' resources for scheduling
    if (currentUserRole === UserRole.INTERVIEWER) {
      return true;
    }

    return false;
  }

  /**
   * Check if user can modify a team
   * Only the team admin can modify team settings
   * 
   * @param userId - Current user's ID
   * @param userRole - Current user's role
   * @param teamAdminId - ID of the team's admin
   * @returns true if modification is allowed
   */
  static canModifyTeam(userId: string, userRole: UserRole, teamAdminId: string): boolean {
    if (userRole === UserRole.ADMIN && userId === teamAdminId) {
      return true;
    }

    return false;
  }

  /**
   * Check if user can access meeting details
   * Rules:
   * - Meeting participants can always access
   * - Team admin can access all team meetings
   * - Other team members cannot access meetings they're not part of
   * 
   * @param userId - Current user's ID
   * @param userRole - Current user's role
   * @param meetingParticipantIds - Array of participant user IDs
   * @param userTeamId - Current user's team ID
   * @param meetingTeamId - Meeting's team ID
   * @returns true if access is allowed
   */
  static canAccessMeeting(
    userId: string,
    userRole: UserRole,
    meetingParticipantIds: string[],
    userTeamId: string | undefined,
    meetingTeamId: string | undefined
  ): boolean {
    // Check if user is a participant
    if (meetingParticipantIds.includes(userId)) {
      return true;
    }

    // Team admin can access all team meetings
    if (
      userRole === UserRole.ADMIN &&
      userTeamId &&
      meetingTeamId &&
      userTeamId === meetingTeamId
    ) {
      return true;
    }

    return false;
  }

  /**
   * Enforce team access requirement
   * Throws AuthorizationError if user cannot access the team
   * 
   * @param req - Express request with authenticated user
   * @param teamId - Team ID to validate access for
   * @throws AuthorizationError if access is denied
   */
  static requireTeamAccess(req: AuthRequest, teamId: string): void {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    const userId = (req.user as any)._id.toString();
    const userRole = req.user.role || UserRole.CANDIDATE;
    const userTeamId = req.user.teamId?.toString();

    if (!this.canAccessTeam(userId, userRole, userTeamId, teamId)) {
      throw new AuthorizationError('Access denied: you do not have permission to access this team');
    }
  }

  /**
   * Enforce resource ownership requirement
   * Throws AuthorizationError if user is not the owner and not an admin
   * 
   * @param req - Express request with authenticated user
   * @param resourceOwnerId - ID of the resource owner
   * @throws AuthorizationError if access is denied
   */
  static requireOwnership(req: AuthRequest, resourceOwnerId: string): void {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    const userId = (req.user as any)._id.toString();
    const userRole = req.user.role || UserRole.CANDIDATE;

    // Allow if user is the owner or is an admin
    if (userId !== resourceOwnerId && userRole !== UserRole.ADMIN) {
      throw new AuthorizationError('Access denied: you can only modify your own resources');
    }
  }

  /**
   * Enforce team admin requirement
   * Throws AuthorizationError if user is not the team admin
   * 
   * @param req - Express request with authenticated user
   * @param teamAdminId - ID of the team's admin
   * @throws AuthorizationError if access is denied
   */
  static requireAdminOfTeam(req: AuthRequest, teamAdminId: string): void {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    const userId = (req.user as any)._id.toString();
    const userRole = req.user.role || UserRole.CANDIDATE;

    if (!this.canModifyTeam(userId, userRole, teamAdminId)) {
      throw new AuthorizationError('Access denied: only the team admin can perform this action');
    }
  }

  /**
   * Enforce meeting access requirement
   * Throws AuthorizationError if user cannot access the meeting
   * 
   * @param req - Express request with authenticated user
   * @param meetingParticipantIds - Array of participant user IDs
   * @param meetingTeamId - Meeting's team ID
   * @throws AuthorizationError if access is denied
   */
  static requireMeetingAccess(
    req: AuthRequest,
    meetingParticipantIds: string[],
    meetingTeamId: string | undefined
  ): void {
    if (!req.user) {
      throw new AuthorizationError('Authentication required');
    }

    const userId = (req.user as any)._id.toString();
    const userRole = req.user.role || UserRole.CANDIDATE;
    const userTeamId = req.user.teamId?.toString();

    if (!this.canAccessMeeting(userId, userRole, meetingParticipantIds, userTeamId, meetingTeamId)) {
      throw new AuthorizationError('Access denied: you do not have permission to access this meeting');
    }
  }
}
