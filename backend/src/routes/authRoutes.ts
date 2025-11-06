import { Router } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { authorize } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', (req, res) => {
    // This will be implemented in issue #92 (JWT authentication system)
    ApiResponseUtil.success(res, null, 'Register route - will be implemented in issue #92');
});

/**
 * @route   POST /api/auth/login
 * @desc    Login a user
 * @access  Public
 */
router.post('/login', (req, res) => {
    // This will be implemented in issue #92 (JWT authentication system)
    ApiResponseUtil.success(res, null, 'Login route - will be implemented in issue #92');
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (All authenticated users)
 */
router.get('/me', authorize([UserRole.ADMIN, UserRole.INTERVIEWER, UserRole.CANDIDATE]), (req, res) => {
    ApiResponseUtil.success(res, null, 'Current user route - will be implemented in issue #92');
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout a user
 * @access  Private (All authenticated users)
 */
router.post('/logout', authorize([UserRole.ADMIN, UserRole.INTERVIEWER, UserRole.CANDIDATE]), (req, res) => {
    ApiResponseUtil.success(res, null, 'Logout route - will be implemented in issue #92');
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public (with refresh token)
 */
router.post('/refresh-token', (req, res) => {
    ApiResponseUtil.success(res, null, 'Refresh token route - will be implemented in issue #92');
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', (req, res) => {
    ApiResponseUtil.success(res, null, 'Forgot password route - will be implemented in issue #92');
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public (with reset token)
 */
router.post('/reset-password', (req, res) => {
    ApiResponseUtil.success(res, null, 'Reset password route - will be implemented in issue #92');
});

export default router;