import { Router } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { requireAuth, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';

const router = Router();

/**
 * @route   GET /api/availability
 * @desc    Get availability for current user or query multiple users (admin only)
 * @access  Private (All authenticated users can get their own, Admin can query others)
 * @permissions Interviewers and Candidates can view their own availability
 *              Admins can query any user's availability
 */
router.get('/', requireAuth, (req: AuthRequest, res) => {
    // Will be implemented later
    // If admin and userId query param provided, return that user's availability
    // Otherwise return current user's availability
    // const userId = req.user.role === UserRole.ADMIN && req.query.userId 
    //     ? req.query.userId 
    //     : req.user._id;

    ApiResponseUtil.success(res, [], 'Get availability');
});

/**
 * @route   POST /api/availability
 * @desc    Create or update user availability
 * @access  Private (Interviewer and Candidate)
 * @permissions Only Interviewers and Candidates can submit their availability
 */
router.post('/', requireAuth, requireRole([UserRole.INTERVIEWER, UserRole.CANDIDATE]), (req: AuthRequest, res) => {
    // Will be implemented later
    // Example implementation:
    // const { timeslots, dayOfWeek, isRecurring } = req.body;
    // const availability = await Availability.create({
    //     userId: req.user._id,
    //     timeslots,
    //     dayOfWeek,
    //     isRecurring
    // });

    ApiResponseUtil.success(res, null, 'Create availability route');
});

/**
 * @route   GET /api/availability/:id
 * @desc    Get availability by ID
 * @access  Private (Admin, Owner, and Authorized Team Members)
 * @permissions User can view their own availability, admins can view any
 */
router.get('/:id', requireAuth, (req: AuthRequest, res) => {
    // Will be implemented later
    // Additional logic will check:
    // 1. Is user the owner of this availability?
    // 2. Is user an admin?
    // 3. Is user a team member authorized to view this?

    ApiResponseUtil.success(res, null, `Get availability ${req.params.id}`);
});

/**
 * @route   PUT /api/availability/:id
 * @desc    Update availability by ID
 * @access  Private (Admin and Owner)
 * @permissions Only the availability owner or admin can update it
 */
router.put('/:id', requireAuth, (req: AuthRequest, res) => {
    // Will be implemented later
    // Verify ownership before allowing update

    ApiResponseUtil.success(res, null, `Update availability ${req.params.id}`);
});

/**
 * @route   DELETE /api/availability/:id
 * @desc    Delete availability by ID
 * @access  Private (Admin and Owner)
 * @permissions Only the availability owner or admin can delete it
 */
router.delete('/:id', requireAuth, (req: AuthRequest, res) => {
    // Will be implemented later
    // Verify ownership before allowing deletion

    ApiResponseUtil.success(res, null, `Delete availability ${req.params.id}`);
});

/**
 * @route   GET /api/availability/team/:teamId
 * @desc    Get availability for an entire team
 * @access  Private (Admin and Team Members)
 * @permissions Team members can view their team's availability, admins can view any team
 */
router.get('/team/:teamId', requireAuth, (req: AuthRequest, res) => {
    // Will be implemented later
    // Verify user is member of this team or is admin

    ApiResponseUtil.success(res, [], `Get team ${req.params.teamId} availability`);
});

/**
 * @route   GET /api/availability/matches
 * @desc    Find matching availability between interviewers and candidates
 * @access  Private (Admin and Team Members)
 * @permissions Used for scheduling - find time slots where interviewers and candidates overlap
 */
router.get('/matches', requireAuth, (req: AuthRequest, res) => {
    // Will be implemented later
    // This is a key scheduling feature:
    // 1. Get all interviewer availabilities for a team/group
    // 2. Get all candidate availabilities for a team/group
    // 3. Find overlapping time slots
    // 4. Return matched availability windows

    ApiResponseUtil.success(res, [], 'Get matching availabilities');
});

export default router;