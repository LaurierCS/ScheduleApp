import { Router } from 'express';
import { UserRole } from '../models/user';
import { authenticate, passwordResetRateLimiter, loginRateLimiter, authorize } from '../middleware/authMiddleware';

// Import all auth controllers
import {
  register,
  login,
  refresh,
  refreshToken,
  logout,
  me,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  verifyPasswordResetCode,
  verifyEmail,
  resendVerification,
  invite
} from '../controllers/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with JWT authentication
 * @access  Public
 * @permissions Creates new user with CANDIDATE role by default. Invite code required for ADMIN or INTERVIEWER roles.
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT tokens
 * @access  Public
 * @permissions Validates user credentials and enforces isActive status (RBAC)
 */
router.post('/login', loginRateLimiter, login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token)
 * @permissions Validates refresh token and user status before issuing new access token
 */
router.post('/refresh', refresh);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token (alias for /refresh)
 * @access  Public (requires valid refresh token)
 * @permissions Validates refresh token and user status before issuing new access token
 */
router.post('/refresh-token', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user by revoking refresh token(s)
 * @access  Private (requires authentication)
 * @permissions Any authenticated user can logout
 * 
 * Note: Can revoke specific refresh token or all tokens for user
 * For resource ownership validation, use PermissionChecker.requireOwnership() from utils/permissions.ts
 */
router.post('/logout', authenticate, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get authenticated user's profile information
 * @access  Private (requires authentication)
 * @permissions Any authenticated user can view their own profile
 * 
 * Note: Uses authenticate middleware which validates JWT and enforces isActive status
 * For viewing other users' profiles, use PermissionChecker.canViewUserResources() from utils/permissions.ts
 */
router.get('/me', authenticate, me);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset code to user email
 * @access  Public
 * @middleware passwordResetRateLimiter - Enforces 24-hour rate limit on password resets
 */
router.post('/forgot-password', passwordResetRateLimiter, forgotPassword);

/**
 * @route   POST /api/auth/verify-reset-code
 * @desc    Verify reset code and return JWT reset token
 * @access  Public
 */
router.post('/verify-reset-code', verifyResetCode);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Update password after verification (forgot password flow)
 * @access  Private (requires reset token from verify-reset-code)
 */
router.post('/reset-password', authenticate, resetPassword);

/**
 * @route   POST /api/auth/verify-password-reset-code
 * @desc    Verify 6-digit code and update password (step 2)
 * @access  Private (requires valid JWT token)
 */
router.post('/verify-password-reset-code', authenticate, verifyPasswordResetCode);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user email with 6-digit code
 * @access  Public
 */
router.post('/verify-email', verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification code
 * @access  Public
 */
router.post('/resend-verification', resendVerification);

/**
 * @route   POST /api/auth/invite
 * @desc    Create an invite code for new ADMIN account registration. Need special permission to register a new ADMIN account.
 * @access  Private (Admin only)
 */
router.post('/invite', authenticate, authorize(UserRole.ADMIN), invite);

export default router;