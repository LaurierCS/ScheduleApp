import { Response, NextFunction } from 'express';
import { isValidObjectId } from 'mongoose';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import User from '../../models/user';
import { PermissionChecker } from '../../utils/permissions';
import Group from '../../models/group';
import { toObjectId } from '../../validators/groupValidators';

/**
 * Remove member from group
 * @route DELETE /api/groups/:id/members/:userId
 * @access Private (Admin in same team)
 */
export const removeGroupMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

        // Validate userId parameter
        if (!isValidObjectId(req.params.userId)) {
            return ApiResponseUtil.error(res, 'Invalid userId format', 400);
        }

        const userId = toObjectId(req.params.userId);

        // Remove user from both members and candidates arrays (idempotent - no error if not present)
        await Group.findByIdAndUpdate(
            group._id,
            {
                $pull: {
                    members: userId,
                    candidates: userId,
                }
            }
        );

        // Remove group from user's groupIds (bidirectional sync cleanup)
        await User.findByIdAndUpdate(
            userId,
            { $pull: { groupIds: group._id } }
        );

        // Return updated group with populated fields
        const updatedGroup = await Group.findById(group._id)
            .populate('members', 'name email role')
            .populate('candidates', 'name email role')
            .populate('createdBy', 'name email');

        ApiResponseUtil.success(res, updatedGroup, 'Member removed from group successfully');
    } catch (error) {
        next(error);
    }
};
