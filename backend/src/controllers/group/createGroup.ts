import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import User, { UserRole } from '../../models/user';
import { PermissionChecker } from '../../utils/permissions';
import Group from '../../models/group';
import { createGroupSchema } from '../../validators/groupValidators';

/**
 * Create a new group
 * @route POST /api/groups
 * @access Private (Admin)
 */
export const createGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const data = createGroupSchema.parse(req.body);
        const userId = (req.user as any)._id;
        const teamId = data.teamId;

        // Verify user has access to this team
        PermissionChecker.requireTeamAccess(req, teamId.toString());

        // Verify all members belong to this team if provided
        if (data.members && data.members.length > 0) {
            const members = await User.find({
                _id: { $in: data.members },
                teamId: teamId,
            });

            if (members.length !== data.members.length) {
                return ApiResponseUtil.error(
                    res,
                    'One or more members do not belong to this team',
                    400
                );
            }
        }

        // Verify all candidates belong to this team and have candidate role if provided
        if (data.candidates && data.candidates.length > 0) {
            const candidates = await User.find({
                _id: { $in: data.candidates },
                teamId: teamId,
                role: UserRole.CANDIDATE,
            });

            if (candidates.length !== data.candidates.length) {
                return ApiResponseUtil.error(
                    res,
                    'One or more candidates do not belong to this team or are not candidates',
                    400
                );
            }
        }

        // Create the group
        const group = await Group.create({
            name: data.name,
            description: data.description,
            type: data.type,
            members: data.members ?? [],
            candidates: data.candidates ?? [],
            teamId: teamId,
            createdBy: userId,
            settings: data.settings ?? { availabilityOverride: false, priority: 0 },
        });

        // Update users' groupIds for members
        if (data.members && data.members.length > 0) {
            await User.updateMany(
                { _id: { $in: data.members } },
                { $addToSet: { groupIds: group._id } }
            );
        }

        // Update users' groupIds for candidates
        if (data.candidates && data.candidates.length > 0) {
            await User.updateMany(
                { _id: { $in: data.candidates } },
                { $addToSet: { groupIds: group._id } }
            );
        }

        const populatedGroup = await Group.findById(group._id)
            .populate('members', 'name email role')
            .populate('candidates', 'name email role')
            .populate('createdBy', 'name email');

        return ApiResponseUtil.success(res, populatedGroup, 'Group created successfully', 201);
    } catch (error) {
        next(error);
    }
};
