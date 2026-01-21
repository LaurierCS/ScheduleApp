import { Router } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { requireAuth, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import { PermissionChecker } from '../utils/permissions';
import User from '../models/user';
import Availability, { AvailabilityType } from '../models/availability';
import { z } from 'zod';
import { isValidObjectId } from 'mongoose';
import Interviewer, { InterviewerStatus } from '../models/interviewer';
import { ValidationError, ServerError } from '../errors';
import Meeting from '../models/meeting';

const router = Router();

/**
 * Zod schema for validating ObjectId strings
 */
const objectIdSchema = z
    .string()
    .trim()
    .refine((v: string) => isValidObjectId(v), { message: 'Invalid ObjectId' });

/**
 * Zod schema for arrays of ObjectIds (with default empty array)
 */
const objectIdArrayDefault = z.array(objectIdSchema).default([]);

/* --------------------------- Validation Schemas ---------------------------------- */

/**
 * Schema for creating a new interviewer
 */
const createInterviewerSchema = z.object({
    name: z.string().min(1, 'name is required').trim(),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'password must be at least 6 characters'),
    groupIds: objectIdArrayDefault,
    skills: z.array(z.string().trim()).default([]),
    capacity: z.object({
        maxPerDay: z.number().min(1).max(20).default(10),
        maxPerWeek: z.number().min(1).max(100).default(40),
    }).default({ maxPerDay: 10, maxPerWeek: 40 }),
});

/**
 * Schema for updating an existing interviewer
 */
const updateInterviewerSchema = createInterviewerSchema
    .omit({ password: true })
    .partial()
    .extend({
        status: z.nativeEnum(InterviewerStatus).optional(),
        groupIds: z.array(objectIdSchema).optional(),
        skills: z.array(z.string().trim()).optional(),
        capacity: z.object({
            maxPerDay: z.number().min(1).max(20),
            maxPerWeek: z.number().min(1).max(100),
        }).partial().optional(),
    });

/**
 * @route   GET /api/interviewers
 * @desc    Get all interviewers in team (with filtering)
 * @access  Private (Admin and Interviewer)
 * @permissions Admins and interviewers can view all interviewers in their team
 */
router.get('/', requireAuth, requireRole([UserRole.ADMIN, UserRole.INTERVIEWER]), async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const userTeamId = req.user.teamId?.toString();

        if (!userTeamId) {
            return ApiResponseUtil.success(res, [], 'No team assigned');
        }

        const { name, email, status, groupIds, skills } = req.query;

        const filter: any = {
            teamId: userTeamId,
            role: UserRole.INTERVIEWER,
        };

        // Name filter - partial match, case-insensitive
        if (name && typeof name === 'string') {
            filter.name = { $regex: name, $options: 'i' };
        }

        // Email filter - exact match (lowercase)
        if (email && typeof email === 'string') {
            filter.email = email.toLowerCase();
        }

        // Status filter
        if (status && typeof status === 'string') {
            if (!Object.values(InterviewerStatus).includes(status as InterviewerStatus)) {
                return next(new ValidationError(undefined, 'Please enter a valid interviewer status'));
            }
            filter.status = status;
        }

        // GroupIds filter - match any
        if (groupIds) {
            const groupIdArray = Array.isArray(groupIds) ? groupIds : [groupIds];
            const isValidIds = groupIdArray.every(id => typeof id === 'string' && isValidObjectId(id));
            if (!isValidIds) {
                return next(new ValidationError(undefined, 'groupIds must be valid ObjectIds'));
            }
            filter.groupIds = { $in: groupIdArray };
        }

        // Skills filter - match any, case-insensitive
        if (skills) {
            const skillsArray = Array.isArray(skills) ? skills : [skills];
            const skillRegexes = skillsArray.map(s => new RegExp(`^${s}$`, 'i'));
            filter.skills = { $in: skillRegexes };
        }

        const interviewers = await Interviewer.find(filter)
            .select('-password')
            .lean();

        ApiResponseUtil.success(res, interviewers, 'Interviewers retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/interviewers
 * @desc    Create a new interviewer
 * @access  Private (Admin)
 * @permissions Only admins can create interviewers
 */
router.post('/', requireAuth, requireRole([UserRole.ADMIN]), async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const userTeamId = req.user.teamId;
        if (!userTeamId) {
            return ApiResponseUtil.error(res, 'No team assigned', 400);
        }

        const result = createInterviewerSchema.safeParse(req.body);
        if (!result.success) {
            return next(new ValidationError(undefined, z.prettifyError(result.error)));
        }

        const body = result.data;

        // Check if email already exists
        const existingUser = await User.findOne({ email: body.email.toLowerCase() });
        if (existingUser) {
            return ApiResponseUtil.error(res, 'Email already exists', 400);
        }

        const interviewer = await Interviewer.create({
            name: body.name,
            email: body.email,
            password: body.password,
            groupIds: body.groupIds,
            skills: body.skills,
            capacity: body.capacity,
            status: InterviewerStatus.PENDING,
            teamId: userTeamId,
            role: UserRole.INTERVIEWER,
        });

        const { password, ...interviewerObj } = interviewer.toObject();
        return ApiResponseUtil.success(res, interviewerObj, 'Interviewer created successfully', 201);
    } catch (err: any) {
        // Handle duplicate key error
        if (err.code === 11000) {
            return ApiResponseUtil.error(res, 'Email already exists', 400);
        }
        return next(new ServerError());
    }
});

/**
 * @route   GET /api/interviewers/:id
 * @desc    Get interviewer by ID
 * @access  Private (Admin, Interviewer in same team, and Own User)
 * @permissions Team members can view interviewers in their team, users can view their own profile
 */
router.get('/:id', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const interviewer = await User.findById(req.params.id).select('-password');

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

        // Check if user can view this interviewer
        if (!PermissionChecker.canViewUserResources(
            currentUserId,
            currentUserRole,
            req.params.id,
            currentUserTeamId,
            interviewerTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only view interviewers in your team', 403);
        }

        ApiResponseUtil.success(res, interviewer, 'Interviewer retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/interviewers/:id
 * @desc    Update interviewer by ID
 * @access  Private (Admin in same team and Own User)
 * @permissions Admins can update team interviewers, users can update their own profile
 */
router.put('/:id', requireAuth, async (req: AuthRequest, res, next) => {
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

// Check if user can modify this interviewer
        if (!PermissionChecker.canModifyUser(
            currentUserId,
            currentUserRole,
            req.params.id,
            interviewerTeamId,
            currentUserTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only modify your own profile or team members as admin', 403);
        }

        const result = updateInterviewerSchema.safeParse(req.body);
        if (!result.success) {
            return next(new ValidationError(undefined, z.prettifyError(result.error)));
        }

        const { name, email, groupIds, skills, status, capacity } = result.data;

        if (name !== undefined) interviewer.name = name;
        if (email !== undefined) interviewer.email = email;
        if (groupIds !== undefined) (interviewer as any).groupIds = groupIds;
        if (skills !== undefined) (interviewer as any).skills = skills;
        if (status !== undefined) (interviewer as any).status = status;
        if (capacity !== undefined) {
            if (capacity.maxPerDay !== undefined) (interviewer as any).capacity.maxPerDay = capacity.maxPerDay;
            if (capacity.maxPerWeek !== undefined) (interviewer as any).capacity.maxPerWeek = capacity.maxPerWeek;
        }

        await interviewer.save();

        const { password, ...interviewerObj } = interviewer.toObject();
        ApiResponseUtil.success(res, interviewerObj, 'Interviewer updated successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/interviewers/:id
 * @desc    Delete interviewer by ID
 * @access  Private (Admin in same team)
 * @permissions Only admins can delete interviewers in their team
 */
router.delete('/:id', requireAuth, requireRole([UserRole.ADMIN]), async (req: AuthRequest, res, next) => {
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

        const currentUserTeamId = req.user.teamId?.toString();
        const interviewerTeamId = interviewer.teamId?.toString();

// Ensure interviewer is in the same team
        if (currentUserTeamId !== interviewerTeamId) {
            return ApiResponseUtil.error(res, 'Access denied: you can only delete interviewers in your team', 403);
        }

        // Check for associated meetings
        const meetings = await Meeting.find({ interviewerIds: interviewer._id });
        if (meetings.length > 0) {
            return ApiResponseUtil.error(
                res,
                `Cannot delete: Interviewer has ${meetings.length} associated meeting(s). Please reassign or cancel meetings first.`,
                400
            );
        }

        // Check for associated availability
        const availability = await Availability.find({ userId: interviewer._id });
        if (availability.length > 0) {
            return ApiResponseUtil.error(
                res,
                `Cannot delete: Interviewer has ${availability.length} availability record(s). Please remove availability first.`,
                400
            );
        }

        await User.findByIdAndDelete(interviewer._id);

        ApiResponseUtil.success(res, null, 'Interviewer deleted successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/interviewers/:id/availability
 * @desc    Get interviewer availability
 * @access  Private (Admin, Interviewer in same team, and Own User)
 * @permissions Team members can view interviewers' availability for scheduling, users can view their own
 */
router.get('/:id/availability', requireAuth, async (req: AuthRequest, res, next) => {
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
});

export default router;