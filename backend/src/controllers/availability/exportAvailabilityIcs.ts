import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import Availability from '../../models/availability';
import Group from '../../models/group';
import User from '../../models/user';
import { PermissionChecker } from '../../utils/permissions';

function formatToIcsDate(d: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return d.getUTCFullYear().toString()
        + pad(d.getUTCMonth() + 1)
        + pad(d.getUTCDate())
        + 'T'
        + pad(d.getUTCHours())
        + pad(d.getUTCMinutes())
        + pad(d.getUTCSeconds())
        + 'Z';
}

function escapeText(s: string) {
    return s.replace(/\\/g, "\\\\").replace(/\n/g, '\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
}

/**
 * GET /api/availability/ics
 * Query params: userId | teamId | groupId, startTime, endTime
 */
export async function exportAvailabilityIcs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) return next(new Error('Authentication required'));

        const { userId, teamId, groupId, startTime, endTime } = req.query;

        if (!startTime || !endTime) {
            return ApiResponseUtil.error(res, 'startTime and endTime are required', 400);
        }

        const start = new Date(startTime as string);
        const end = new Date(endTime as string);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return ApiResponseUtil.error(res, 'Invalid date format', 400);
        }

        if (end <= start) {
            return ApiResponseUtil.error(res, 'endTime must be after startTime', 400);
        }

        // Determine scope
        let availabilities: any[] = [];

        if (userId) {
            // Permission check: user can view their own or team members
            const targetUser = await User.findById(userId as string);
            if (!targetUser) return ApiResponseUtil.error(res, 'User not found', 404);
            const allowed = PermissionChecker.canViewUserResources((req.user as any)._id.toString(), req.user.role, userId as string, req.user.teamId?.toString(), targetUser.teamId?.toString());
            if (!allowed) return ApiResponseUtil.error(res, 'Access denied', 403);
            const records = await Availability.findOverlapping(userId as any, start, end, targetUser.teamId);
            availabilities = records;
        } else if (groupId) {
            const group = await Group.findById(groupId as string);
            if (!group) return ApiResponseUtil.error(res, 'Group not found', 404);
            PermissionChecker.requireTeamAccess(req, group.teamId.toString());
            const userIds = [ ...(group.members || []), ...(group.candidates || []) ];
            availabilities = await Availability.find({ userId: { $in: userIds }, $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }] }).populate('userId', 'name email');
        } else if (teamId) {
            PermissionChecker.requireTeamAccess(req, teamId as string);
            availabilities = await Availability.findTeamAvailability(teamId as any, start, end);
        } else {
            // default: current user
            availabilities = await Availability.findOverlapping((req.user as any)._id, start, end, req.user.teamId);
        }

        // Expand recurring occurrences
        const events: string[] = [];
        for (const avail of availabilities) {
            const occs = (avail.recurring && avail.expandRecurrence)
                ? avail.expandRecurrence(start, end)
                : [[avail.startTime, avail.endTime]];

            for (const [s, e] of occs) {
                const uid = `${avail._id}-${s.getTime()}@schedule-app`;
                const summary = `Availability: ${avail.type}`;
                const description = avail.recurrencePattern ? `Recurring availability` : '';
                const dtstart = formatToIcsDate(new Date(s));
                const dtend = formatToIcsDate(new Date(e));

                events.push([
                    'BEGIN:VEVENT',
                    `UID:${uid}`,
                    `DTSTAMP:${formatToIcsDate(new Date())}`,
                    `DTSTART:${dtstart}`,
                    `DTEND:${dtend}`,
                    `SUMMARY:${escapeText(summary)}`,
                    `DESCRIPTION:${escapeText(description || '')}`,
                    'END:VEVENT'
                ].join('\r\n'));
            }
        }

        const cal = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Schedule App//EN',
            ...events,
            'END:VCALENDAR'
        ].join('\r\n');

        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="availabilities.ics"');
        res.send(cal);
    } catch (error) {
        next(error);
    }
}
