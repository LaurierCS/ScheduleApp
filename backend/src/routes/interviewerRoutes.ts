import { Router } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { requireAuth, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';

const router = Router();

/**
 * @route   GET /api/interviewers
 * @desc    Get all interviewers (with pagination)
 * @access  Private (Admin)
 * @permissions Only admins can view all interviewers
 */
router.get('/', requireAuth, requireRole([UserRole.ADMIN]), (req: AuthRequest, res) => {
    // Will be implemented in issue #94 (Enhance User model to support multiple roles)
    const mockInterviewers = [
        { id: '1', name: 'Interviewer 1', expertise: ['JavaScript', 'React'] },
        { id: '2', name: 'Interviewer 2', expertise: ['Python', 'Django'] },
    ];

    ApiResponseUtil.paginated(
        res,
        mockInterviewers,
        1, // page
        10, // limit
        2, // total
        'Get all interviewers - will be implemented in issue #94'
    );
});

/**
 * @route   POST /api/interviewers
 * @desc    Create a new interviewer
 * @access  Private (Admin)
 * @permissions Only admins can create interviewers
 */
router.post('/', requireAuth, requireRole([UserRole.ADMIN]), (req: AuthRequest, res) => {
    ApiResponseUtil.success(res, null, 'Create interviewer route - will be implemented in issue #94');
});

/**
 * @route   GET /api/interviewers/:id
 * @desc    Get interviewer by ID
 * @access  Private (Admin and Own User)
 * @permissions Admins can view any interviewer, users can view their own profile
 */
router.get('/:id', requireAuth, (req: AuthRequest, res) => {
    // Additional logic will verify: req.user.role === ADMIN || req.user._id === req.params.id
    ApiResponseUtil.success(res, null, `Get interviewer ${req.params.id} - will be implemented in issue #94`);
});

/**
 * @route   PUT /api/interviewers/:id
 * @desc    Update interviewer by ID
 * @access  Private (Admin and Own User)
 * @permissions Admins can update any interviewer, users can update their own profile
 */
router.put('/:id', requireAuth, (req: AuthRequest, res) => {
    // Additional logic will verify: req.user.role === ADMIN || req.user._id === req.params.id
    ApiResponseUtil.success(res, null, `Update interviewer ${req.params.id} - will be implemented in issue #94`);
});

/**
 * @route   DELETE /api/interviewers/:id
 * @desc    Delete interviewer by ID
 * @access  Private (Admin)
 * @permissions Only admins can delete interviewers
 */
router.delete('/:id', requireAuth, requireRole([UserRole.ADMIN]), (req: AuthRequest, res) => {
    ApiResponseUtil.success(res, null, `Delete interviewer ${req.params.id} - will be implemented in issue #94`);
});

/**
 * @route   GET /api/interviewers/:id/availability
 * @desc    Get interviewer availability
 * @access  Private (Admin and Own User)
 * @permissions Admins can view any interviewer's availability, users can view their own
 */
router.get('/:id/availability', requireAuth, (req: AuthRequest, res) => {
    // Additional logic will verify: req.user.role === ADMIN || req.user._id === req.params.id
    ApiResponseUtil.success(
        res,
        [],
        `Get interviewer ${req.params.id} availability - to be implemented`
    );
});

export default router;