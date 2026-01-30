import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Team from '../../models/team';
import User from '../../models/user';
import { objectIdSchema, addMembersSchema } from '../../validators/teamValidators';

/**
 * Add members to team
 * @route POST /api/teams/:id/members
 * @access Private (Team Admin only)
 */
export const addTeamMembers = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const id = objectIdSchema.parse(req.params.id);
    const { members, role } = addMembersSchema.parse(req.body);

    const team = await Team.findById(id);

    if (!team) {
        return ApiResponseUtil.error(res, 'Team not found', 404);
    }

    const teamAdminId = team.adminId.toString();

    // Use PermissionChecker to verify admin access
    PermissionChecker.requireAdminOfTeam(req, teamAdminId);

    // Verify all users exist
    const users = await User.find({ _id: { $in: members } });

    if (users.length !== members.length) {
        return ApiResponseUtil.error(res, 'One or more users not found', 404);
    }

    // Update users' teamId and optionally their role
    const updateData: any = { teamId: id };
    if (role) {
        updateData.role = role;
    }

    await User.updateMany({ _id: { $in: members } }, { $set: updateData });

    // Get updated team with members
    const updatedMembers = await User.find({ teamId: id }).select('-password');

    return ApiResponseUtil.success(res, updatedMembers, 'Members added to team successfully');
};
