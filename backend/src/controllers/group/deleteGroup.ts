import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import User from '../../models/user';
import { PermissionChecker } from '../../utils/permissions';
import Group from '../../models/group';

/**
 * Delete group by ID
 * @route DELETE /api/groups/:id
 * @access Private (Admin in same team)
 */
export const deleteGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const group = await Group.findById(req.params.id);

        if (!group) {
            return ApiResponseUtil.error(res, 'Group not found', 404);
        }

        const groupTeamId = group.teamId.toString();

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, groupTeamId);

        // Remove group reference from all users (members and candidates)
        // This cleans up the bidirectional sync
        await User.updateMany(
            { groupIds: group._id },
            { $pull: { groupIds: group._id } }
        );

        // Delete the group
        await Group.findByIdAndDelete(group._id);

        ApiResponseUtil.success(res, null, 'Group deleted successfully');
    } catch (error) {
        next(error);
    }
};
