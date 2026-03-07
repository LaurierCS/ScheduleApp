import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import Availability, { AvailabilityType } from '../../models/availability';
import Group from '../../models/group';
import { PermissionChecker } from '../../utils/permissions';
import { convertToICal } from '../../utils/availabilityHelpers';

/**
 * @route   GET /api/groups/:id/availability
 * @desc    Get availability for all users in a group
 * @access  Private (Team Members)
 * @permissions Requester must belong to the same team; group members and
 *   admins/interviewers may view the results.
 * @query   {startTime, endTime, type?, format?}
 */
export async function getGroupAvailability(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const groupId = req.params.id;
        const group = await Group.findById(groupId);
        if (!group) {
            return ApiResponseUtil.error(res, 'Group not found', 404);
        }

        // ensure requester is in same team
        PermissionChecker.requireTeamAccess(req, group.teamId.toString());

        const requesterId = (req.user as any)._id.toString();
        const isMember = group.members.map(m => m.toString()).includes(requesterId) ||
            group.candidates.map(c => c.toString()).includes(requesterId);
        if (!isMember) {
            // allow admins or interviewers in the same team as well
            if (req.user.role !== 'admin' && req.user.role !== 'interviewer') {
                return ApiResponseUtil.error(res, 'Access denied: not a group member', 403);
            }
        }

        const { startTime, endTime, type, format } = req.query;
        const query: any = { userId: { $in: [...group.members, ...group.candidates] } };

        if (type) query.type = type;
        if (startTime || endTime) {
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
            query.$or = [
                { startTime: { $lt: end }, endTime: { $gt: start } }
            ];
        }

        const availabilities = await Availability.find(query).sort({ startTime: 1 });

        if (format === 'ical') {
            const ics = convertToICal(availabilities as any[]);
            res.type('text/calendar');
            return res.send(ics);
        }

        ApiResponseUtil.success(res, availabilities, 'Group availability retrieved successfully');
    } catch (error) {
        next(error);
    }
}
