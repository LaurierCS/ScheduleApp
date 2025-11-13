import { Router } from 'express';
import { z } from 'zod';
import { ApiResponseUtil } from '../utils/apiResponse';
import { authenticate, authorize, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import { PermissionChecker } from '../utils/permissions';
import Availability, { AvailabilityType } from '../models/availability';
import User from '../models/user';
import mongoose from 'mongoose';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Zod schema for recurrence pattern validation
 */
const DateLike = z.union([z.string(), z.date()]);

const RecurrencePatternSchema = z.object({
    frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
    interval: z.number().int().min(1).optional(),
    byWeekDay: z.array(z.number().int().min(0).max(6)).optional(),
    byMonthDay: z.array(z.number().int().min(1).max(31)).optional(),
    byMonth: z.array(z.number().int().min(1).max(12)).optional(),
    count: z.number().int().min(1).optional(),
    until: DateLike.optional(),
    rruleString: z.string().optional(),
});

/**
 * Zod schema for creating availability
 */
const CreateAvailabilitySchema = z.object({
    teamId: z.string().optional(),
    startTime: DateLike,
    endTime: DateLike,
    type: z.enum([AvailabilityType.AVAILABLE, AvailabilityType.UNAVAILABLE]).optional(),
    recurring: z.boolean().optional(),
    recurrencePattern: RecurrencePatternSchema.optional(),
    timezone: z.string().optional(),
}).refine(
    (data) => {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        return end > start;
    },
    {
        message: "End time must be after start time",
        path: ["endTime"],
    }
).refine(
    (data) => {
        if (data.recurring && !data.recurrencePattern) {
            return false;
        }
        return true;
    },
    {
        message: "Recurring availabilities must have a recurrence pattern",
        path: ["recurrencePattern"],
    }
);

/**
 * Zod schema for updating availability
 */
const UpdateAvailabilitySchema = CreateAvailabilitySchema.partial();

/**
 * @route   GET /api/availability
 * @desc    Get availability for current user or specific user (with proper permissions)
 * @access  Private (All authenticated users)
 * @permissions Users can get their own availability, admins/interviewers can query team members
 */
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const queryUserId = req.query.userId as string;

        // If no userId provided, return current user's availability
        if (!queryUserId) {
            const availability = await Availability.find({ userId: currentUserId });
            return ApiResponseUtil.success(res, availability, 'Availability retrieved successfully');
        }

        // If querying another user's availability, check permissions
        const targetUser = await User.findById(queryUserId);

        if (!targetUser) {
            return ApiResponseUtil.error(res, 'User not found', 404);
        }

        const targetUserTeamId = targetUser.teamId?.toString();

        // Check if user can view target user's availability
        if (!PermissionChecker.canViewUserResources(
            currentUserId,
            currentUserRole,
            queryUserId,
            currentUserTeamId,
            targetUserTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only view availability of team members', 403);
        }

        const availability = await Availability.find({ userId: queryUserId });
        ApiResponseUtil.success(res, availability, 'Availability retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/availability
 * @desc    Create user availability
 * @access  Private (Interviewer and Candidate)
 * @permissions Only Interviewers and Candidates can submit their availability
 * @body    {teamId?, startTime, endTime, type?, recurring?, recurrencePattern?, timezone?}
 */
router.post('/', authenticate, authorize(UserRole.INTERVIEWER, UserRole.CANDIDATE), async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        // Validate request body
        const validationResult = CreateAvailabilitySchema.safeParse(req.body);

        if (!validationResult.success) {
            return ApiResponseUtil.error(
                res,
                `Validation error: ${validationResult.error.issues.map((e: any) => e.message).join(', ')}`,
                400
            );
        }

        const data = validationResult.data;
        const userId = (req.user as any)._id;

        // If teamId is provided, verify user has access to that team
        if (data.teamId) {
            if (!mongoose.Types.ObjectId.isValid(data.teamId)) {
                return ApiResponseUtil.error(res, 'Invalid team ID', 400);
            }

            const userTeamId = req.user.teamId?.toString();
            if (userTeamId !== data.teamId) {
                return ApiResponseUtil.error(res, 'You can only create availability for your own team', 403);
            }
        }

        // Check for conflicts with existing unavailable slots
        const hasConflict = await Availability.hasConflict(
            userId,
            new Date(data.startTime),
            new Date(data.endTime)
        );

        if (hasConflict && data.type === AvailabilityType.AVAILABLE) {
            return ApiResponseUtil.error(
                res,
                'This time slot conflicts with an existing unavailable period',
                409
            );
        }

        // Create the availability
        const availability = await Availability.create({
            userId,
            teamId: data.teamId ? new mongoose.Types.ObjectId(data.teamId) : undefined,
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
            type: data.type || AvailabilityType.AVAILABLE,
            recurring: data.recurring || false,
            recurrencePattern: data.recurrencePattern,
            timezone: data.timezone || 'UTC',
        });

        ApiResponseUtil.success(res, availability, 'Availability created successfully', 201);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/availability/:id
 * @desc    Get availability by ID
 * @access  Private (Owner and Team Members with proper roles)
 * @permissions User can view their own availability, admins/interviewers can view team members'
 */
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
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
});

/**
 * @route   PUT /api/availability/:id
 * @desc    Update availability by ID
 * @access  Private (Owner only)
 * @permissions Only the availability owner can update it
 * @body    {teamId?, startTime?, endTime?, type?, recurring?, recurrencePattern?, timezone?}
 */
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const availability = await Availability.findById(req.params.id);

        if (!availability) {
            return ApiResponseUtil.error(res, 'Availability not found', 404);
        }

        const availabilityOwnerId = availability.userId.toString();

        // Use PermissionChecker to verify ownership
        PermissionChecker.requireOwnership(req, availabilityOwnerId);

        // Validate request body
        const validationResult = UpdateAvailabilitySchema.safeParse(req.body);

        if (!validationResult.success) {
            return ApiResponseUtil.error(
                res,
                `Validation error: ${validationResult.error.issues.map((e: any) => e.message).join(', ')}`,
                400
            );
        }

        const data = validationResult.data;

        // If updating teamId, verify user has access to that team
        if (data.teamId) {
            if (!mongoose.Types.ObjectId.isValid(data.teamId)) {
                return ApiResponseUtil.error(res, 'Invalid team ID', 400);
            }

            const userTeamId = req.user.teamId?.toString();
            if (userTeamId !== data.teamId) {
                return ApiResponseUtil.error(res, 'You can only set availability for your own team', 403);
            }
        }

        // Check if new time range creates conflicts (exclude current availability)
        if (data.startTime || data.endTime) {
            const newStartTime = data.startTime ? new Date(data.startTime) : availability.startTime;
            const newEndTime = data.endTime ? new Date(data.endTime) : availability.endTime;

            if (newEndTime <= newStartTime) {
                return ApiResponseUtil.error(res, 'End time must be after start time', 400);
            }

            const hasConflict = await Availability.hasConflict(
                availability.userId,
                newStartTime,
                newEndTime,
                availability._id as any
            );

            if (hasConflict && (data.type === AvailabilityType.AVAILABLE || availability.type === AvailabilityType.AVAILABLE)) {
                return ApiResponseUtil.error(
                    res,
                    'Updated time slot conflicts with an existing unavailable period',
                    409
                );
            }
        }

        // Update fields
        if (data.teamId !== undefined) availability.teamId = data.teamId as any;
        if (data.startTime !== undefined) availability.startTime = new Date(data.startTime);
        if (data.endTime !== undefined) availability.endTime = new Date(data.endTime);
        if (data.type !== undefined) availability.type = data.type;
        if (data.recurring !== undefined) availability.recurring = data.recurring;
        if (data.recurrencePattern !== undefined) availability.recurrencePattern = data.recurrencePattern as any;
        if (data.timezone !== undefined) availability.timezone = data.timezone;

        await availability.save();

        ApiResponseUtil.success(res, availability, 'Availability updated successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/availability/:id
 * @desc    Delete availability by ID
 * @access  Private (Owner only)
 * @permissions Only the availability owner can delete it
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const availability = await Availability.findById(req.params.id);

        if (!availability) {
            return ApiResponseUtil.error(res, 'Availability not found', 404);
        }

        const availabilityOwnerId = availability.userId.toString();

        // Use PermissionChecker to verify ownership
        PermissionChecker.requireOwnership(req, availabilityOwnerId);

        // Delete the availability
        await Availability.findByIdAndDelete(req.params.id);

        ApiResponseUtil.success(res, { id: req.params.id }, 'Availability deleted successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/availability/team/:teamId
 * @desc    Get availability for an entire team within a date range
 * @access  Private (Team Members)
 * @permissions Team members can view their team's availability
 * @query   {startTime, endTime, type?}
 */
router.get('/team/:teamId', authenticate, async (req: AuthRequest, res, next) => {
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
});

/**
 * @route   GET /api/availability/matches
 * @desc    Find matching availability between specific users or all team members
 * @access  Private (Team Members)
 * @permissions Used for scheduling - team members can find matches within their team
 * @query   {startTime, endTime, userIds?, minDuration?}
 */
router.get('/matches', authenticate, async (req: AuthRequest, res, next) => {
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
});

export default router;