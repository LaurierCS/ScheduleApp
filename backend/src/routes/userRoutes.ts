import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import {
    getUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
} from '../controllers/user';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users in team (with pagination)
 * @access  Private (Admin and Interviewer)
 * @permissions Admins and interviewers can view all users in their team
 */
router.get('/', requireAuth, requireRole([UserRole.ADMIN, UserRole.INTERVIEWER]), getUsers);

/**
 * @route   POST /api/users
 * @desc    Create a new user (by admin)
 * @access  Private (Admin)
 * @permissions Only admins can create users
 */
router.post('/', requireAuth, requireRole([UserRole.ADMIN]), createUser);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Own user, or Admin/Interviewer for team members)
 * @permissions Users can view their own profile, admins/interviewers can view team members
 */
router.get('/:id', requireAuth, getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID
 * @access  Private (Own user or Admin in same team)
 * @permissions Users can update their own profile, admins can update team members
 */
router.put('/:id', requireAuth, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID
 * @access  Private (Own user or Admin in same team)
 * @permissions Users can delete their own account, admins can delete team members
 */
router.delete('/:id', requireAuth, deleteUser);

export default router;