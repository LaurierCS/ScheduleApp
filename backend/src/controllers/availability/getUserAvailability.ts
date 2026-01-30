import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { UserRole } from '../../models/user';
import { PermissionChecker } from '../../utils/permissions';
import Availability from '../../models/availability';
import User from '../../models/user';

/**
 * @route   GET /api/availability
 * @desc    Get availability for current user or specific user (with proper permissions)
 * @access  Private (All authenticated users)
 * @permissions Users can get their own availability, admins/interviewers can query team members
 */
export async function getUserAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const queryUserId = req.query.userId as string;

        // If no userId provided, return current user's availability
        if (!queryUserId) {
            const availability = await Availability.find({ userId: currentUserId });
            return ApiResponseUtil.success(res, availability, 'Availability retrieved successfully');
        }

        // If querying another user's availability, check permissions
        const targetUser = await User.findById(queryUserId);

        if (!targetUser) {
            return ApiResponseUtil.error(res, 'User not found', 404);
        }

        const targetUserTeamId = targetUser.teamId?.toString();

        // Check if user can view target user's availability
        if (!PermissionChecker.canViewUserResources(
            currentUserId,
            currentUserRole,
            queryUserId,
            currentUserTeamId,
            targetUserTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only view availability of team members', 403);
        }

        const availability = await Availability.find({ userId: queryUserId });
        ApiResponseUtil.success(res, availability, 'Availability retrieved successfully');
    } catch (error) {
        next(error);
    }
}
