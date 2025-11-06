import { Router } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { authorize, requireOwnership } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (with pagination)
 * @access  Private (Admin)
 */
router.get('/', authorize(UserRole.ADMIN), (req, res) => {
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
 */
router.post('/', authorize(UserRole.ADMIN), (req, res) => {
    ApiResponseUtil.success(res, null, 'Create user route - will be implemented in issue #94');
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin and Own User)
 */
router.get('/:id', requireOwnership('id'), (req, res) => {
    ApiResponseUtil.success(res, null, `Get user ${req.params.id} - will be implemented in issue #94`);
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID
 * @access  Private (Admin and Own User)
 */
router.put('/:id', requireOwnership('id'), (req, res) => {
    ApiResponseUtil.success(res, null, `Update user ${req.params.id} - will be implemented in issue #94`);
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID
 * @access  Private (Admin and Own User)
 */
router.delete('/:id', requireOwnership('id'), (req, res) => {
    ApiResponseUtil.success(res, null, `Delete user ${req.params.id} - will be implemented in issue #94`);
});

export default router;