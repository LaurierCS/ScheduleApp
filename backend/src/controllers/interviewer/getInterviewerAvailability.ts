import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { UserRole } from '../../models/user';
import { PermissionChecker } from '../../utils/permissions';
import User from '../../models/user';
import Availability, { AvailabilityType } from '../../models/availability';

/**
 * @route   GET /api/interviewers/:id/availability
 * @desc    Get interviewer availability
 * @access  Private (Admin, Interviewer in same team, and Own User)
 * @permissions Team members can view interviewers' availability for scheduling, users can view their own
 */
export async function getInterviewerAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const interviewer = await User.findById(req.params.id);

        if (!interviewer) {
            return ApiResponseUtil.error(res, 'Interviewer not found', 404);
        }

        // Ensure target user is an interviewer
        if (interviewer.role !== UserRole.INTERVIEWER) {
            return ApiResponseUtil.error(res, 'User is not an interviewer', 400);
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const interviewerTeamId = interviewer.teamId?.toString();

        // Check if user can view this interviewer's availability
        if (!PermissionChecker.canViewUserResources(
            currentUserId,
            currentUserRole,
            req.params.id,
            currentUserTeamId,
            interviewerTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only view availability of interviewers in your team', 403);
        }

        // Parse query parameters for date range filtering
        const { startTime, endTime, type } = req.query;

        // Build query
        const query: any = { userId: req.params.id };

        // Add date range filters if provided
        if (startTime || endTime) {
            if (!startTime || !endTime) {
                return ApiResponseUtil.error(res, 'Both startTime and endTime are required for date range filtering', 400);
            }

            const start = new Date(startTime as string);
            const end = new Date(endTime as string);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return ApiResponseUtil.error(res, 'Invalid date format', 400);
            }

            if (end <= start) {
                return ApiResponseUtil.error(res, 'endTime must be after startTime', 400);
            }

            query.$or = [
                { startTime: { $lt: end }, endTime: { $gt: start } },
            ];
        }

        // Add type filter if provided
        if (type) {
            if (type !== AvailabilityType.AVAILABLE && type !== AvailabilityType.UNAVAILABLE) {
                return ApiResponseUtil.error(res, 'Invalid availability type', 400);
            }
            query.type = type;
        }

        // Query availability
        const availabilities = await Availability.find(query).sort({ startTime: 1 });

        ApiResponseUtil.success(
            res,
            availabilities,
            `Interviewer availability retrieved successfully`
        );
    } catch (error) {
        next(error);
    }
}
