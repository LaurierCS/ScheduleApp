import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import Group from '../../models/group';
import { groupFilterSchema } from '../../validators/groupValidators';

/**
 * Get all groups in user's team (with pagination)
 * @route GET /api/groups
 * @access Private (All authenticated users)
 */
export const getGroups = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const userTeamId = req.user.teamId?.toString();

        if (!userTeamId) {
            return ApiResponseUtil.success(res, { items: [], page: 1, limit: 20, total: 0 }, 'No team assigned');
        }

        // Parse and validate query parameters
        const filters = groupFilterSchema.parse(req.query);
        const { type, search, page, limit } = filters;

        // Build filter query
        const filter: any = { teamId: userTeamId };

        // Filter by type if provided
        if (type) {
            filter.type = type;
        }

        // Search by name (case-insensitive partial match) if provided
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count for pagination metadata
        const total = await Group.countDocuments(filter);

        // Get paginated groups
        const groups = await Group.find(filter)
            .populate('createdBy', 'name email')
            .populate('members', 'name email role')
            .populate('candidates', 'name email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        ApiResponseUtil.success(res, { items: groups, page, limit, total }, 'Groups retrieved successfully');
    } catch (error) {
        next(error);
    }
};
