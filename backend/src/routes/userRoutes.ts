import { Router } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { requireAuth, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (with pagination)
 * @access  Private (Admin)
 * @permissions Only admins can view all users
 */
router.get('/', requireAuth, requireRole([UserRole.ADMIN]), (req: AuthRequest, res) => {
    // Will be implemented in issue #94 (Enhance User model to support multiple roles)
    // Mock data
    const mockUsers = [
        { id: '1', username: 'user1', role: 'admin' },
        { id: '2', username: 'user2', role: 'interviewer' },
        { id: '3', username: 'user3', role: 'candidate' },
    ];

    ApiResponseUtil.paginated(
        res,
        mockUsers,
        1, // page
        10, // limit
        3, // total
        'Get all users - will be implemented in issue #94'
    );
});

/**
 * @route   POST /api/users
 * @desc    Create a new user (by admin)
 * @access  Private (Admin)
 * @permissions Only admins can create users
 */
router.post('/', requireAuth, requireRole([UserRole.ADMIN]), (req: AuthRequest, res) => {
    ApiResponseUtil.success(res, null, 'Create user route - will be implemented in issue #94');
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin and Own User)
 * @permissions Admins can view any user, users can view their own profile
 */
router.get('/:id', requireAuth, (req: AuthRequest, res) => {
    // Additional logic will verify: req.user.role === ADMIN || req.user._id === req.params.id
    ApiResponseUtil.success(res, null, `Get user ${req.params.id} - will be implemented in issue #94`);
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID
 * @access  Private (Admin and Own User)
 * @permissions Admins can update any user, users can update their own profile
 */
router.put('/:id', requireAuth, (req: AuthRequest, res) => {
    // Additional logic will verify: req.user.role === ADMIN || req.user._id === req.params.id
    ApiResponseUtil.success(res, null, `Update user ${req.params.id} - will be implemented in issue #94`);
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID
 * @access  Private (Admin and Own User)
 * @permissions Admins can delete any user, users can delete their own account
 */
router.delete('/:id', requireAuth, (req: AuthRequest, res) => {
    // Additional logic will verify: req.user.role === ADMIN || req.user._id === req.params.id
    ApiResponseUtil.success(res, null, `Delete user ${req.params.id} - will be implemented in issue #94`);
});

export default router;