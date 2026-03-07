import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import Availability, { AvailabilityType } from '../../models/availability';
import Group from '../../models/group';
import { PermissionChecker } from '../../utils/permissions';

/**
 * GET /api/availability/group/:groupId
 * Returns availability for members of a group within a date range
 */
export async function getGroupAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) return next(new Error('Authentication required'));

        const group = await Group.findById(req.params.groupId);
        if (!group) return ApiResponseUtil.error(res, 'Group not found', 404);

        // Ensure user has access to the team
        PermissionChecker.requireTeamAccess(req, group.teamId.toString());

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

        const userIds = [ ...(group.members || []), ...(group.candidates || []) ];
        if (userIds.length === 0) {
            return ApiResponseUtil.success(res, [], 'Group has no members');
        }

        const query: any = {
            userId: { $in: userIds },
            $or: [ { startTime: { $lt: end }, endTime: { $gt: start } } ]
        };

        if (type) query.type = type as AvailabilityType;

        const availabilities = await Availability.find(query).populate('userId', 'name email role').sort({ startTime: 1 });

        ApiResponseUtil.success(res, availabilities, 'Group availability retrieved successfully');
    } catch (error) {
        next(error);
    }
}
