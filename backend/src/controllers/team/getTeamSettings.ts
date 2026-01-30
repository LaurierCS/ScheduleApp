import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Team from '../../models/team';
import TeamSettings from '../../models/teamSettings';
import { objectIdSchema } from '../../validators/teamValidators';

/**
 * Get team settings
 * @route GET /api/teams/:id/settings
 * @access Private (Team Members)
 */
export const getTeamSettings = async (req: AuthRequest, res: Response) => {
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

    // Get team settings, create default if not exists
    let settings = await TeamSettings.findOne({ teamId: id });

    if (!settings) {
        // Create default settings for this team
        settings = await TeamSettings.create({ teamId: id });
    }

    return ApiResponseUtil.success(res, settings, 'Team settings retrieved successfully');
};
