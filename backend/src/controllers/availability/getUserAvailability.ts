import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { UserRole } from '../../models/user';
import { PermissionChecker } from '../../utils/permissions';
import Availability from '../../models/availability';
import User from '../../models/user';
import Group from '../../models/group';
import { convertToICal } from '../../utils/availabilityHelpers';

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
        const { startTime, endTime, type, groupId, format } = req.query;

        // Build base query depending on whether a target user is specified
        let targetId = currentUserId;
        if (queryUserId) {
            // If querying another user's availability, check permissions
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
            targetId = queryUserId;
        }

        const query: any = { userId: targetId };

        // Group filter overrides user filter when provided
        if (groupId) {
            const group = await Group.findById(groupId);
            if (!group) {
                return ApiResponseUtil.error(res, 'Group not found', 404);
            }
            PermissionChecker.requireTeamAccess(req, group.teamId.toString());
            const members = [...group.members.map(m => m.toString()), ...group.candidates.map(c => c.toString())];
            query.userId = { $in: members };
        }

        // Date range and type filtering
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
        if (type) {
            query.type = type;
        }

        const availability = await Availability.find(query).sort({ startTime: 1 });

        if (format === 'ical') {
            const ics = convertToICal(availability as any[]);
            res.type('text/calendar');
            return res.send(ics);
        }

        ApiResponseUtil.success(res, availability, 'Availability retrieved successfully');
    } catch (error) {
        next(error);
    }
}
