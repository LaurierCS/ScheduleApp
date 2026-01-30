import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Group from '../../models/group';

/**
 * Get all group members
 * @route GET /api/groups/:id/members
 * @access Private (Team Members)
 */
export const getGroupMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const group = await Group.findById(req.params.id)
            .populate('members', 'name email role');

        if (!group) {
            return ApiResponseUtil.error(res, 'Group not found', 404);
        }

        const groupTeamId = group.teamId.toString();

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, groupTeamId);

        ApiResponseUtil.success(res, group.members, 'Group members retrieved successfully');
    } catch (error) {
        next(error);
    }
};
