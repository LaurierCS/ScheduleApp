import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { UserRole } from '../../models/user';
import { PermissionChecker } from '../../utils/permissions';
import Availability, { AvailabilityType } from '../../models/availability';
import User from '../../models/user';

/**
 * @route   GET /api/availability
 * @desc    Get availability for current user or specific user (with proper permissions)
 * @access  Private (All authenticated users)
 * @permissions Users can get their own availability, admins/interviewers can query team members
 *
 * Supports optional query parameters: startTime, endTime, type
 */
export async function getUserAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const queryUserId = req.query.userId as string | undefined;

        const startTime = req.query.startTime as string | undefined;
        const endTime = req.query.endTime as string | undefined;
        const type = req.query.type as string | undefined;

        // Parse and validate date range if provided
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (startTime || endTime) {
            if (!startTime || !endTime) {
                return ApiResponseUtil.error(res, 'Both startTime and endTime are required when filtering by range', 400);
            }

            startDate = new Date(startTime);
            endDate = new Date(endTime);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return ApiResponseUtil.error(res, 'Invalid date format', 400);
            }

            if (endDate <= startDate) {
                return ApiResponseUtil.error(res, 'endTime must be after startTime', 400);
            }
        }

        // Helper to fetch availability for a given user with optional range/type filtering
        const fetchForUser = async (userId: string) => {
            if (startDate && endDate) {
                if (type === AvailabilityType.AVAILABLE) {
                    return await Availability.findAvailableSlots(userId as any, startDate!, endDate!, currentUserTeamId as any);
                }

                // Use findOverlapping to optionally filter by availability type
                const availabilityType = type ? (type as AvailabilityType) : undefined;
                return await Availability.findOverlapping(userId as any, startDate!, endDate!, currentUserTeamId as any, availabilityType);
            }

            // No range filters - return all availabilities for the user
            return await Availability.find({ userId });
        };

        // If no userId provided, return current user's availability (with optional filters)
        if (!queryUserId) {
            const availability = await fetchForUser(currentUserId);
            return ApiResponseUtil.success(res, availability, 'Availability retrieved successfully');
        }

        // Querying another user's availability - check permissions
        const targetUser = await User.findById(queryUserId);

        if (!targetUser) {
            return ApiResponseUtil.error(res, 'User not found', 404);
        }

        const targetUserTeamId = targetUser.teamId?.toString();

        if (!PermissionChecker.canViewUserResources(
            currentUserId,
            currentUserRole,
            queryUserId,
            currentUserTeamId,
            targetUserTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only view availability of team members', 403);
        }

        const availability = await fetchForUser(queryUserId);
        ApiResponseUtil.success(res, availability, 'Availability retrieved successfully');
    } catch (error) {
        next(error);
    }
}
