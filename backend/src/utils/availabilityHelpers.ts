import { AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import { PermissionChecker } from './permissions';
import User from '../models/user';

/**
 * Checks if the current user can view a target user's availability
 */
export async function canViewUserAvailability(
    currentUserId: string,
    currentUserRole: UserRole,
    currentUserTeamId: string | undefined,
    targetUserId: string
): Promise<{ allowed: boolean; targetUserTeamId?: string }> {
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
        return { allowed: false };
    }

    const targetUserTeamId = targetUser.teamId?.toString();

    const allowed = PermissionChecker.canViewUserResources(
        currentUserId,
        currentUserRole,
        targetUserId,
        currentUserTeamId,
        targetUserTeamId
    );

    return { allowed, targetUserTeamId };
}

/**
 * Verifies that the current user owns the specified availability
 */
export function verifyAvailabilityOwnership(req: AuthRequest, availabilityOwnerId: string): void {
    PermissionChecker.requireOwnership(req, availabilityOwnerId);
}

/**
 * Verifies that the current user has access to the specified team
 */
export function verifyTeamAccess(req: AuthRequest, teamId: string): void {
    PermissionChecker.requireTeamAccess(req, teamId);
}

/**
 * Convert array of availability documents into a minimal iCalendar (ICS) string.
 * Only includes basic fields and recurring rules where present.  This is not a
 * full-featured ICS generator but should be enough for most calendar libraries.
 *
 * @param availabilities - list of availability documents (with startTime, endTime, type, recurrencePattern)
 * @returns ICS string
 */
export function convertToICal(availabilities: any[]): string {
    const lines: string[] = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ScheduleApp//EN',
    ];

    availabilities.forEach(avail => {
        const start = avail.startTime instanceof Date ? avail.startTime.toISOString().replace(/[-:]|\.\d{3}/g, '') : '';
        const end = avail.endTime instanceof Date ? avail.endTime.toISOString().replace(/[-:]|\.\d{3}/g, '') : '';
        const uid = avail._id?.toString();
        const type = avail.type || 'available';

        lines.push('BEGIN:VEVENT');
        if (uid) lines.push(`UID:${uid}`);
        lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d{3}/g, '')}`);
        if (start) lines.push(`DTSTART:${start}`);
        if (end) lines.push(`DTEND:${end}`);
        lines.push(`SUMMARY:${type}`);

        // Add recurrence rule if supplied via rruleString or pattern
        if (avail.recurrencePattern) {
            if (avail.recurrencePattern.rruleString) {
                lines.push(`RRULE:${avail.recurrencePattern.rruleString}`);
            } else {
                const parts: string[] = [];
                parts.push(`FREQ=${avail.recurrencePattern.frequency}`);
                if (avail.recurrencePattern.interval) parts.push(`INTERVAL=${avail.recurrencePattern.interval}`);
                if (avail.recurrencePattern.byWeekDay && avail.recurrencePattern.byWeekDay.length) {
                    // map numeric weekday to iCal (MO,TU, etc.)
                    const names = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
                    const days = avail.recurrencePattern.byWeekDay.map((d: number) => names[d]).join(',');
                    parts.push(`BYDAY=${days}`);
                }
                if (avail.recurrencePattern.byMonthDay && avail.recurrencePattern.byMonthDay.length) {
                    parts.push(`BYMONTHDAY=${avail.recurrencePattern.byMonthDay.join(',')}`);
                }
                if (avail.recurrencePattern.byMonth && avail.recurrencePattern.byMonth.length) {
                    parts.push(`BYMONTH=${avail.recurrencePattern.byMonth.join(',')}`);
                }
                if (avail.recurrencePattern.count) parts.push(`COUNT=${avail.recurrencePattern.count}`);
                if (avail.recurrencePattern.until) {
                    const until = new Date(avail.recurrencePattern.until).toISOString().replace(/[-:]|\.\d{3}/g, '');
                    parts.push(`UNTIL=${until}`);
                }
                lines.push(`RRULE:${parts.join(';')}`);
            }
        }

        lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
}
