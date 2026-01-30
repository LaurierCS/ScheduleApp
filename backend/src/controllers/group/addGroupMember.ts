import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import User, { UserRole } from '../../models/user';
import { PermissionChecker } from '../../utils/permissions';
import Group from '../../models/group';
import { addMemberSchema } from '../../validators/groupValidators';

/**
 * Add member to group
 * @route POST /api/groups/:id/members
 * @access Private (Admin in same team)
 */
export const addGroupMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

        // Parse and validate request body
        const data = addMemberSchema.parse(req.body);
        const userId = data.userId;

        // Verify user exists and belongs to the same team
        const user = await User.findById(userId);
        if (!user) {
            return ApiResponseUtil.error(res, 'User not found', 404);
        }

        if (user.teamId?.toString() !== groupTeamId) {
            return ApiResponseUtil.error(res, 'User does not belong to the same team as this group', 400);
        }

        // Determine which array to add to based on user role
        // INTERVIEWER or ADMIN -> members array
        // CANDIDATE -> candidates array
        const updateField = user.role === UserRole.CANDIDATE ? 'candidates' : 'members';

        // Add user to the appropriate array using $addToSet (prevents duplicates)
        await Group.findByIdAndUpdate(
            group._id,
            { $addToSet: { [updateField]: userId } }
        );

        // Update user's groupIds (bidirectional sync)
        await User.findByIdAndUpdate(
            userId,
            { $addToSet: { groupIds: group._id } }
        );

        // Return updated group with populated fields
        const updatedGroup = await Group.findById(group._id)
            .populate('members', 'name email role')
            .populate('candidates', 'name email role')
            .populate('createdBy', 'name email');

        ApiResponseUtil.success(res, updatedGroup, 'Member added to group successfully');
    } catch (error) {
        next(error);
    }
};
