import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Team from '../../models/team';
import User from '../../models/user';
import Group from '../../models/group';
import { objectIdSchema, removeGroupsSchema } from '../../validators/teamValidators';

/**
 * Delete multiple groups from a team (bulk)
 * @route DELETE /api/teams/:id/groups
 * @access Private (Team Admin only)
 */
export const deleteTeamGroups = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const id = objectIdSchema.parse(req.params.id);
    const { groupIds } = removeGroupsSchema.parse(req.body);

    const team = await Team.findById(id);

    if (!team) {
        return ApiResponseUtil.error(res, 'Team not found', 404);
    }

    const teamAdminId = team.adminId.toString();

    // Use PermissionChecker to verify admin access
    PermissionChecker.requireAdminOfTeam(req, teamAdminId);

    // Verify all groups belong to this team
    const groups = await Group.find({
        _id: { $in: groupIds },
        teamId: id,
    });

    if (groups.length !== groupIds.length) {
        return ApiResponseUtil.error(res, 'One or more groups do not belong to this team', 400);
    }

    // Remove group references from all users
    await User.updateMany({ groupIds: { $in: groupIds } }, { $pull: { groupIds: { $in: groupIds } } });

    // Delete the groups
    await Group.deleteMany({ _id: { $in: groupIds } });

    return ApiResponseUtil.success(res, null, 'Groups deleted successfully');
};
