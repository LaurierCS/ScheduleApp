import { Router } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { requireAuth, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import { PermissionChecker } from '../utils/permissions';
import User from '../models/user';
import Availability, { AvailabilityType } from '../models/availability';

const router = Router();

/**
 * @route   GET /api/interviewers
 * @desc    Get all interviewers in team (with pagination)
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

        // Get all interviewers in the same team
        const interviewers = await User.find({
            teamId: userTeamId,
            role: UserRole.INTERVIEWER
        })
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
router.post('/', requireAuth, requireRole([UserRole.ADMIN]), (req: AuthRequest, res) => {
    // TODO: Implement interviewer creation
    // - Validate request body (name, email, password, expertise/skills)
    // - Set role to INTERVIEWER
    // - Hash password
    // - Create user with admin's teamId
    // - Return created interviewer (without password)
    ApiResponseUtil.success(res, null, 'Create interviewer route - will be implemented in issue #94');
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
            return ApiResponseUtil.error(res, 'Access denied: you can only modify your own profile', 403);
        }

        // TODO: Implement interviewer update
        // - Validate request body
        // - Prevent role changes
        // - Prevent teamId changes
        // - Update interviewer fields (name, email, expertise, etc.)
        // - Return updated interviewer (without password)
        ApiResponseUtil.success(res, null, `Update interviewer ${req.params.id} - will be implemented in issue #94`);
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

        // TODO: Implement interviewer deletion
        // - Check if interviewer has scheduled meetings
        // - Either cascade delete or prevent deletion if meetings exist
        // - Delete interviewer from database
        // - Return success response
        ApiResponseUtil.success(res, null, `Delete interviewer ${req.params.id} - will be implemented in issue #94`);
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