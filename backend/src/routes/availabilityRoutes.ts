import { Router } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { requireAuth, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import { PermissionChecker } from '../utils/permissions';
import Availability from '../models/availability';
import User from '../models/user';

const router = Router();

/**
 * @route   GET /api/availability
 * @desc    Get availability for current user or specific user (with proper permissions)
 * @access  Private (All authenticated users)
 * @permissions Users can get their own availability, admins/interviewers can query team members
 */
router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
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
 * @desc    Create or update user availability
 * @access  Private (Interviewer and Candidate)
 * @permissions Only Interviewers and Candidates can submit their availability
 */
router.post('/', requireAuth, requireRole([UserRole.INTERVIEWER, UserRole.CANDIDATE]), (req: AuthRequest, res) => {
    // TODO: Implement availability creation
    // - Validate request body (timeslots, dayOfWeek, isRecurring, startTime, endTime)
    // - Create availability with userId set to req.user._id
    // - Return created availability
    // Example: const availability = await Availability.create({ userId: req.user._id, ...req.body });
    ApiResponseUtil.success(res, null, 'Create availability route');
});

/**
 * @route   GET /api/availability/:id
 * @desc    Get availability by ID
 * @access  Private (Owner and Team Members with proper roles)
 * @permissions User can view their own availability, admins/interviewers can view team members'
 */
router.get('/:id', requireAuth, async (req: AuthRequest, res, next) => {
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
 */
router.put('/:id', requireAuth, async (req: AuthRequest, res, next) => {
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

        // TODO: Implement availability update
        // - Validate request body (timeslots, dayOfWeek, isRecurring, startTime, endTime)
        // - Update availability fields
        // - Return updated availability
        ApiResponseUtil.success(res, null, `Update availability ${req.params.id}`);
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
router.delete('/:id', requireAuth, async (req: AuthRequest, res, next) => {
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

        // TODO: Implement availability deletion
        // - Delete availability from database
        // - Return success response
        ApiResponseUtil.success(res, null, `Delete availability ${req.params.id}`);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/availability/team/:teamId
 * @desc    Get availability for an entire team
 * @access  Private (Team Members)
 * @permissions Team members can view their team's availability
 */
router.get('/team/:teamId', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, req.params.teamId);

        ApiResponseUtil.success(res, [], `Get team ${req.params.teamId} availability`);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/availability/matches
 * @desc    Find matching availability between interviewers and candidates
 * @access  Private (Admin and Team Members)
 * @permissions Used for scheduling - team members can find matches within their team
 */
router.get('/matches', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const userTeamId = req.user.teamId?.toString();

        if (!userTeamId) {
            return ApiResponseUtil.error(res, 'No team assigned', 400);
        }

        // This is a key scheduling feature:
        // 1. Get all interviewer availabilities for the user's team
        // 2. Get all candidate availabilities for the user's team
        // 3. Find overlapping time slots
        // 4. Return matched availability windows
        // Implementation will be done when availability matching logic is built

        ApiResponseUtil.success(res, [], 'Get matching availabilities');
    } catch (error) {
        next(error);
    }
});

export default router;