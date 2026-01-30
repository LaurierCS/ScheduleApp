import { AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import { PermissionChecker } from './permissions';
import User from '../models/user';

/**
 * Checks if the current user can view a target user's availability
 */
export async function canViewUserAvailability(
    currentUserId: string,
    currentUserRole: UserRole,
    currentUserTeamId: string | undefined,
    targetUserId: string
): Promise<{ allowed: boolean; targetUserTeamId?: string }> {
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
        return { allowed: false };
    }

    const targetUserTeamId = targetUser.teamId?.toString();

    const allowed = PermissionChecker.canViewUserResources(
        currentUserId,
        currentUserRole,
        targetUserId,
        currentUserTeamId,
        targetUserTeamId
    );

    return { allowed, targetUserTeamId };
}

/**
 * Verifies that the current user owns the specified availability
 */
export function verifyAvailabilityOwnership(req: AuthRequest, availabilityOwnerId: string): void {
    PermissionChecker.requireOwnership(req, availabilityOwnerId);
}

/**
 * Verifies that the current user has access to the specified team
 */
export function verifyTeamAccess(req: AuthRequest, teamId: string): void {
    PermissionChecker.requireTeamAccess(req, teamId);
}
