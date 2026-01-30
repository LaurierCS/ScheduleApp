import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { PermissionChecker } from '../../utils/permissions';
import Availability, { AvailabilityType } from '../../models/availability';

/**
 * @route   GET /api/availability/team/:teamId
 * @desc    Get availability for an entire team within a date range
 * @access  Private (Team Members)
 * @permissions Team members can view their team's availability
 * @query   {startTime, endTime, type?}
 */
export async function getTeamAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, req.params.teamId);

        // Parse query parameters
        const { startTime, endTime, type } = req.query;

        if (!startTime || !endTime) {
            return ApiResponseUtil.error(res, 'startTime and endTime query parameters are required', 400);
        }

        const start = new Date(startTime as string);
        const end = new Date(endTime as string);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return ApiResponseUtil.error(res, 'Invalid date format', 400);
        }

        if (end <= start) {
            return ApiResponseUtil.error(res, 'endTime must be after startTime', 400);
        }

        // Get team availability
        const availabilityType = type ? (type as AvailabilityType) : undefined;
        const teamId = req.params.teamId as any;

        const availabilities = await Availability.findTeamAvailability(
            teamId,
            start,
            end,
            availabilityType
        );

        ApiResponseUtil.success(res, availabilities, 'Team availability retrieved successfully');
    } catch (error) {
        next(error);
    }
}
