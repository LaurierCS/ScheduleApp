import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Team from '../../models/team';
import { objectIdSchema, updateTeamSchema } from '../../validators/teamValidators';

/**
 * Update team details
 * @route PUT /api/teams/:id
 * @access Private (Team Admin only)
 */
export const updateTeam = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return ApiResponseUtil.error(res, 'Authentication required', 401);
    }

    const id = objectIdSchema.parse(req.params.id);
    const data = updateTeamSchema.parse(req.body);

    const team = await Team.findById(id);

    if (!team) {
        return ApiResponseUtil.error(res, 'Team not found', 404);
    }

    const teamAdminId = team.adminId.toString();

    // Use PermissionChecker to verify admin access
    PermissionChecker.requireAdminOfTeam(req, teamAdminId);

    // Update team fields
    const updatedTeam = await Team.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    ).populate('adminId', 'name email');

    return ApiResponseUtil.success(res, updatedTeam, 'Team updated successfully');
};
