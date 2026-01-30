import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Group from '../../models/group';

/**
 * Get group by ID
 * @route GET /api/groups/:id
 * @access Private (Team Members)
 */
export const getGroupById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const group = await Group.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('members', 'name email role');

        if (!group) {
            return ApiResponseUtil.error(res, 'Group not found', 404);
        }

        const groupTeamId = group.teamId.toString();

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, groupTeamId);

        ApiResponseUtil.success(res, group, 'Group retrieved successfully');
    } catch (error) {
        next(error);
    }
};
