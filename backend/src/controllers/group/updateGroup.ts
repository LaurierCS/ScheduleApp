import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { PermissionChecker } from '../../utils/permissions';
import Group from '../../models/group';
import { updateGroupSchema } from '../../validators/groupValidators';

/**
 * Update group by ID
 * @route PUT /api/groups/:id
 * @access Private (Admin in same team)
 */
export const updateGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
        const data = updateGroupSchema.parse(req.body);

        // Build update object - only allowed fields (not teamId, members, candidates)
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.settings !== undefined) {
            if (data.settings.availabilityOverride !== undefined) {
                updateData['settings.availabilityOverride'] = data.settings.availabilityOverride;
            }
            if (data.settings.priority !== undefined) {
                updateData['settings.priority'] = data.settings.priority;
            }
        }

        // Update group with validated data
        const updatedGroup = await Group.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate('members', 'name email role')
            .populate('candidates', 'name email role')
            .populate('createdBy', 'name email');

        ApiResponseUtil.success(res, updatedGroup, 'Group updated successfully');
    } catch (error) {
        next(error);
    }
};
