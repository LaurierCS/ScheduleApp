import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import {
    getUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    updateProfile,
    getPreferences,
    updatePreferences,
    changePassword,
    getProfile,
} from '../controllers/user';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users in team (with pagination)
 * @access  Private (Admin and Interviewer)
 * @permissions Admins and interviewers can view all users in their team
 */
// public interfaces that don't take an ID must appear before the `/:id` routes
router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.INTERVIEWER), getUsers);

/**
 * @route   GET /api/users/preferences
 * @desc    Get authenticated user's preferences
 * @access  Private (requires authentication)
 * @permissions Any authenticated user can view their own preferences
 */
router.get('/preferences', authenticate, getPreferences);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update authenticated user's preferences (timezone, notifications)
 * @access  Private (requires authentication)
 * @permissions Any authenticated user can update their own preferences
 */
router.put('/preferences', authenticate, updatePreferences);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile (alias for /auth/me)
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update authenticated user's profile (name, email, phone, bio, role)
 * @access  Private
 */
router.put('/profile', authenticate, updateProfile);

/**
 * @route   PUT /api/users/password
 * @desc    Change current user's password (requires current password)
 * @access  Private
 */
router.put('/password', authenticate, changePassword);

// TODO: implement profile image upload using multer/cloud storage
// router.post('/profile/image', authenticate, uploadProfileImage);

/**
 * @route   POST /api/users
 * @desc    Create a new user (by admin)
 * @access  Private (Admin)
 * @permissions Only admins can create users
 */
router.post('/', authenticate, authorize(UserRole.ADMIN), createUser);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Own user, or Admin/Interviewer for team members)
 * @permissions Users can view their own profile, admins/interviewers can view team members
 */
router.get('/:id', authenticate, getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID
 * @access  Private (Own user or Admin in same team)
 * @permissions Users can update their own profile, admins can update team members
 */
router.put('/:id', authenticate, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID
 * @access  Private (Own user or Admin in same team)
 * @permissions Users can delete their own account, admins can delete team members
 */
router.delete('/:id', authenticate, deleteUser);


export default router;