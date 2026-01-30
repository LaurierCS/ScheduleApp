import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Team from '../../models/team';
import User from '../../models/user';
import Group from '../../models/group';
import { objectIdSchema } from '../../validators/teamValidators';

/**
 * Delete a single group from a team
 * @route DELETE /api/teams/:id/groups/:groupId
 * @access Private (Team Admin only)
 */
export const deleteSingleTeamGroup = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const id = objectIdSchema.parse(req.params.id);
    const groupId = objectIdSchema.parse(req.params.groupId);

    const team = await Team.findById(id);

    if (!team) {
        return ApiResponseUtil.error(res, 'Team not found', 404);
    }

    const teamAdminId = team.adminId.toString();

    // Use PermissionChecker to verify admin access
    PermissionChecker.requireAdminOfTeam(req, teamAdminId);

    // Verify group exists and belongs to this team
    const group = await Group.findOne({ _id: groupId, teamId: id });

    if (!group) {
        return ApiResponseUtil.error(res, 'Group not found or does not belong to this team', 404);
    }

    // Remove group reference from all users
    await User.updateMany({ groupIds: groupId }, { $pull: { groupIds: groupId } });

    // Delete the group
    await Group.findByIdAndDelete(groupId);

    return ApiResponseUtil.success(res, null, 'Group deleted successfully');
};
