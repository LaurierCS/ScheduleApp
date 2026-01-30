import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Team from '../../models/team';
import Group from '../../models/group';
import { objectIdSchema } from '../../validators/teamValidators';

/**
 * Get all groups for a team
 * @route GET /api/teams/:id/groups
 * @access Private (Team Members)
 */
export const getTeamGroups = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const id = objectIdSchema.parse(req.params.id);

    const team = await Team.findById(id);

    if (!team) {
        return ApiResponseUtil.error(res, 'Team not found', 404);
    }

    // Use PermissionChecker to verify team access
    PermissionChecker.requireTeamAccess(req, req.params.id);

    // Get all groups for this team
    const groups = await Group.find({ teamId: id })
        .populate('members', 'name email role')
        .populate('createdBy', 'name email');

    return ApiResponseUtil.success(res, groups, 'Team groups retrieved successfully');
};
