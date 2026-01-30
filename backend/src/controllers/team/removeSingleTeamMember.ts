import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Team from '../../models/team';
import User, { UserRole } from '../../models/user';
import { objectIdSchema } from '../../validators/teamValidators';

/**
 * Remove a single member from team
 * @route DELETE /api/teams/:id/members/:userId
 * @access Private (Team Admin only)
 */
export const removeSingleTeamMember = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const id = objectIdSchema.parse(req.params.id);
    const userId = objectIdSchema.parse(req.params.userId);

    const team = await Team.findById(id);

    if (!team) {
        return ApiResponseUtil.error(res, 'Team not found', 404);
    }

    const teamAdminId = team.adminId.toString();

    // Use PermissionChecker to verify admin access
    PermissionChecker.requireAdminOfTeam(req, teamAdminId);

    // Prevent admin from removing themselves
    const currentUserIdStr = (req.user as any)._id.toString();
    if (userId.toString() === currentUserIdStr) {
        return ApiResponseUtil.error(res, 'Team admin cannot remove themselves from the team', 400);
    }

    // Verify user exists and is part of the team
    const user = await User.findById(userId);

    if (!user) {
        return ApiResponseUtil.error(res, 'User not found', 404);
    }

    if (user.teamId?.toString() !== id.toString()) {
        return ApiResponseUtil.error(res, 'User is not a member of this team', 400);
    }

    // Remove team reference and reset role
    await User.findByIdAndUpdate(userId, {
        $unset: { teamId: '' },
        role: UserRole.CANDIDATE,
    });

    return ApiResponseUtil.success(res, null, 'Member removed from team successfully');
};
