import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import Availability, { AvailabilityType } from '../../models/availability';

/**
 * @route   GET /api/availability/matches
 * @desc    Find matching availability between specific users or all team members
 * @access  Private (Team Members)
 * @permissions Used for scheduling - team members can find matches within their team
 * @query   {startTime, endTime, userIds?, minDuration?}
 */
export async function findMatches(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const userTeamId = req.user.teamId?.toString();

        if (!userTeamId) {
            return ApiResponseUtil.error(res, 'No team assigned', 400);
        }

        // Parse query parameters
        const { startTime, endTime, userIds, minDuration } = req.query;

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

        const minDurationMs = minDuration ? parseInt(minDuration as string) * 60 * 1000 : 0;

        // Get team availability
        const teamAvailabilities = await Availability.findTeamAvailability(
            userTeamId as any,
            start,
            end,
            AvailabilityType.AVAILABLE
        );

        // Filter by specific users if provided
        let filteredAvailabilities = teamAvailabilities;
        if (userIds) {
            const userIdArray = Array.isArray(userIds) ? userIds : [userIds];
            filteredAvailabilities = teamAvailabilities.filter(avail =>
                userIdArray.includes(avail.userId.toString())
            );
        }

        // Group by user to find common overlapping slots
        const userAvailabilityMap = new Map<string, typeof filteredAvailabilities>();

        filteredAvailabilities.forEach(avail => {
            const userId = avail.userId.toString();
            if (!userAvailabilityMap.has(userId)) {
                userAvailabilityMap.set(userId, []);
            }
            userAvailabilityMap.get(userId)!.push(avail);
        });

        // Find overlapping time slots between all users
        const matches: any[] = [];

        if (userAvailabilityMap.size >= 2) {
            const userEntries = Array.from(userAvailabilityMap.entries());

            // Compare first user's availability with all others
            const [firstUserId, firstUserAvails] = userEntries[0];

            firstUserAvails.forEach(firstAvail => {
                const overlaps: any = {
                    startTime: firstAvail.startTime,
                    endTime: firstAvail.endTime,
                    users: [{ userId: firstUserId, availabilityId: firstAvail._id }],
                };

                // Check overlap with other users
                for (let i = 1; i < userEntries.length; i++) {
                    const [otherUserId, otherUserAvails] = userEntries[i];

                    for (const otherAvail of otherUserAvails) {
                        // Check if they overlap
                        if (firstAvail.overlapsWith(otherAvail.startTime, otherAvail.endTime)) {
                            // Calculate intersection
                            const overlapStart = new Date(Math.max(firstAvail.startTime.getTime(), otherAvail.startTime.getTime()));
                            const overlapEnd = new Date(Math.min(firstAvail.endTime.getTime(), otherAvail.endTime.getTime()));

                            // Update overlap window
                            overlaps.startTime = overlapStart;
                            overlaps.endTime = overlapEnd;
                            overlaps.users.push({ userId: otherUserId, availabilityId: otherAvail._id });
                            break;
                        }
                    }
                }

                // Only add if all users have overlapping availability
                if (overlaps.users.length === userAvailabilityMap.size) {
                    const duration = overlaps.endTime.getTime() - overlaps.startTime.getTime();

                    // Check minimum duration
                    if (duration >= minDurationMs) {
                        overlaps.durationMinutes = Math.floor(duration / (1000 * 60));
                        matches.push(overlaps);
                    }
                }
            });
        }

        ApiResponseUtil.success(res, {
            matches,
            totalMatches: matches.length,
            searchParams: { startTime: start, endTime: end, minDurationMs },
        }, 'Matching availabilities found successfully');
    } catch (error) {
        next(error);
    }
}
