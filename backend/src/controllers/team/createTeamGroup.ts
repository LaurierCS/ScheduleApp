import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Team from '../../models/team';
import User from '../../models/user';
import Group from '../../models/group';
import { objectIdSchema, createTeamGroupSchema } from '../../validators/teamValidators';

/**
 * Create a new group within a team
 * @route POST /api/teams/:id/groups
 * @access Private (Team Admin only)
 */
export const createTeamGroup = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const id = objectIdSchema.parse(req.params.id);
    const data = createTeamGroupSchema.parse(req.body);

    const team = await Team.findById(id);

    if (!team) {
        return ApiResponseUtil.error(res, 'Team not found', 404);
    }

    const teamAdminId = team.adminId.toString();
    const userId = (req.user as any)._id;

    // Use PermissionChecker to verify admin access
    PermissionChecker.requireAdminOfTeam(req, teamAdminId);

    // Verify all members belong to this team if members are provided
    if (data.members && data.members.length > 0) {
        const members = await User.find({
            _id: { $in: data.members },
            teamId: id,
        });

        if (members.length !== data.members.length) {
            return ApiResponseUtil.error(
                res,
                'One or more members do not belong to this team',
                400
            );
        }
    }

    // Create the group
    const group = await Group.create({
        name: data.name,
        members: data.members ?? [],
        teamId: id,
        createdBy: userId,
    });

    // Update users' groupIds
    if (data.members && data.members.length > 0) {
        await User.updateMany(
            { _id: { $in: data.members } },
            { $addToSet: { groupIds: group._id } }
        );
    }

    const populatedGroup = await Group.findById(group._id)
        .populate('members', 'name email role')
        .populate('createdBy', 'name email');

    return ApiResponseUtil.success(res, populatedGroup, 'Group created successfully', 201);
};
