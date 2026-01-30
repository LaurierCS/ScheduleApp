import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import User from '../../models/user';

/**
 * Get all users in team (with pagination)
 * @route GET /api/users
 * @access Private (Admin and Interviewer)
 */
export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const userTeamId = req.user.teamId?.toString();

        if (!userTeamId) {
            return ApiResponseUtil.success(res, [], 'No team assigned');
        }

        // Get all users in the same team
        const users = await User.find({ teamId: userTeamId })
            .select('-password')
            .lean();

        ApiResponseUtil.success(res, users, 'Users retrieved successfully');
    } catch (error) {
        next(error);
    }
};
