import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Team from '../../models/team';
import User, { UserRole } from '../../models/user';
import { objectIdSchema, removeMembersSchema } from '../../validators/teamValidators';

/**
 * Remove multiple members from team (bulk)
 * @route DELETE /api/teams/:id/members
 * @access Private (Team Admin only)
 */
export const removeTeamMembers = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const id = objectIdSchema.parse(req.params.id);
    const { members } = removeMembersSchema.parse(req.body);

    const team = await Team.findById(id);

    if (!team) {
        return ApiResponseUtil.error(res, 'Team not found', 404);
    }

    const teamAdminId = team.adminId.toString();

    // Use PermissionChecker to verify admin access
    PermissionChecker.requireAdminOfTeam(req, teamAdminId);

    // Prevent admin from removing themselves
    const userIdStr = (req.user as any)._id.toString();
    const memberStrs = members.map((m) => m.toString());

    if (memberStrs.includes(userIdStr)) {
        return ApiResponseUtil.error(res, 'Team admin cannot remove themselves from the team', 400);
    }

    // Remove team reference from users and reset role to candidate
    await User.updateMany(
        { _id: { $in: members } },
        { $unset: { teamId: '' }, role: UserRole.CANDIDATE }
    );

    return ApiResponseUtil.success(res, null, 'Members removed from team successfully');
};
