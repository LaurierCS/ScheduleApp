import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { UserRole } from '../../models/user';
import { PermissionChecker } from '../../utils/permissions';
import Availability from '../../models/availability';
import User from '../../models/user';

/**
 * @route   GET /api/availability/:id
 * @desc    Get availability by ID
 * @access  Private (Owner and Team Members with proper roles)
 * @permissions User can view their own availability, admins/interviewers can view team members'
 */
export async function getAvailabilityById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const availability = await Availability.findById(req.params.id);

        if (!availability) {
            return ApiResponseUtil.error(res, 'Availability not found', 404);
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const availabilityOwnerId = availability.userId.toString();

        // Fetch the owner to get their team
        const owner = await User.findById(availabilityOwnerId);
        const ownerTeamId = owner?.teamId?.toString();

        // Check if user can view this availability
        if (!PermissionChecker.canViewUserResources(
            currentUserId,
            currentUserRole,
            availabilityOwnerId,
            currentUserTeamId,
            ownerTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only view availability of team members', 403);
        }

        ApiResponseUtil.success(res, availability, 'Availability retrieved successfully');
    } catch (error) {
        next(error);
    }
}
