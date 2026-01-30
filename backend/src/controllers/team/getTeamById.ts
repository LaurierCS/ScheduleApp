import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Team from '../../models/team';
import { objectIdSchema } from '../../validators/teamValidators';

/**
 * Get team by ID with optional population
 * @route GET /api/teams/:id
 * @access Private (Team Members)
 */
export const getTeamById = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const id = objectIdSchema.parse(req.params.id);
    const populate = String(req.query.populate ?? '0') === '1';

    // Use PermissionChecker to verify team access
    PermissionChecker.requireTeamAccess(req, req.params.id);

    const query = Team.findById(id);
    if (populate) {
        query.populate('adminId', '_id name email');
    }

    const team = await query;

    if (!team) {
        return ApiResponseUtil.error(res, 'Team not found', 404);
    }

    return ApiResponseUtil.success(res, team, 'Team retrieved successfully');
};
