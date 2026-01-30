import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ApiResponseUtil } from '../../utils/apiResponse';
import User, { UserRole } from '../../models/user';
import { PermissionChecker } from '../../utils/permissions';

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private (Own user, or Admin/Interviewer for team members)
 */
export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const targetUser = await User.findById(req.params.id).select('-password');

        if (!targetUser) {
            return ApiResponseUtil.error(res, 'User not found', 404);
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const targetUserTeamId = targetUser.teamId?.toString();

        // Check if user can view this profile
        if (!PermissionChecker.canViewUserResources(
            currentUserId,
            currentUserRole,
            req.params.id,
            currentUserTeamId,
            targetUserTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only view your own profile or team members', 403);
        }

        ApiResponseUtil.success(res, targetUser, 'User retrieved successfully');
    } catch (error) {
        next(error);
    }
};
