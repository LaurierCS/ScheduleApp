import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Team from '../../models/team';
import User from '../../models/user';
import { objectIdSchema } from '../../validators/teamValidators';

/**
 * Get all team members
 * @route GET /api/teams/:id/members
 * @access Private (Team Members)
 */
export const getTeamMembers = async (req: AuthRequest, res: Response) => {
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

    // Get all users belonging to this team
    const members = await User.find({ teamId: id }).select('-password');

    return ApiResponseUtil.success(res, members, 'Team members retrieved successfully');
};
