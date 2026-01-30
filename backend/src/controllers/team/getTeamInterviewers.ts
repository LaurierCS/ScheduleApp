import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Team from '../../models/team';
import Interviewer from '../../models/interviewer';
import { objectIdSchema } from '../../validators/teamValidators';

/**
 * Get all interviewers for a team
 * @route GET /api/teams/:id/interviewers
 * @access Private (Team Members)
 */
export const getTeamInterviewers = async (req: AuthRequest, res: Response) => {
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

    // Get all interviewers for this team
    const interviewers = await Interviewer.find({ teamId: id })
        .select('-password')
        .lean();

    return ApiResponseUtil.success(res, interviewers, 'Team interviewers retrieved successfully');
};
