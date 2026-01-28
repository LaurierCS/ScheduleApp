import { Router, Request, Response, NextFunction } from 'express';
import User, { UserRole } from '../models/user';
import RefreshToken from '../models/RefreshToken';
import JWTUtils from '../utils/jwt';
import { authenticate, passwordResetRateLimiter } from '../middleware/authMiddleware';
import { ApiResponseUtil } from '../utils/apiResponse';
import { ValidationError, AuthenticationError } from '../errors';
import CodeGenerator from '../utils/codeGenerator';
import PasswordResetUtil from '../utils/passwordReset';
import { EmailService } from '../utils/email';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with JWT authentication
 * @access  Public
 * @permissions Creates new user with CANDIDATE role by default (RBAC)
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      throw new ValidationError('Name, email, and password are required');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ValidationError('User already exists with this email');
    }

    // Create user with CANDIDATE role (default for new users per RBAC)
    // Password will be hashed automatically by the pre-save middleware
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: UserRole.CANDIDATE, // Default role for new registrations
      isActive: true
    });

    await user.save();

    // Generate JWT tokens
    const accessToken = JWTUtils.generateAccessToken({
      userId: String(user._id),
      email: user.email,
      role: user.role
    });

    const refreshToken = JWTUtils.generateRefreshToken({
      userId: String(user._id),
      email: user.email,
      role: user.role
    });

    // Store refresh token in database for validation
    await new RefreshToken({
      token: refreshToken,
      userId: user._id,
      expiresAt: JWTUtils.getTokenExpiration(refreshToken) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }).save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT tokens
 * @access  Public
 * @permissions Validates user credentials and enforces isActive status (RBAC)
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user and validate credentials
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check if user account is active (RBAC: inactive users cannot login)
    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Verify password using bcrypt comparePassword method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT tokens with user role for RBAC
    const accessToken = JWTUtils.generateAccessToken({
      userId: String(user._id),
      email: user.email,
      role: user.role
    });

    const refreshToken = JWTUtils.generateRefreshToken({
      userId: String(user._id),
      email: user.email,
      role: user.role
    });

    // Store refresh token in database
    await new RefreshToken({
      token: refreshToken,
      userId: user._id,
      expiresAt: JWTUtils.getTokenExpiration(refreshToken) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }).save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token)
 * @permissions Validates refresh token and user status before issuing new access token
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    // Verify refresh token signature
    const payload = JWTUtils.verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database and is not revoked
    const tokenValid = await RefreshToken.isTokenValid(refreshToken);
    if (!tokenValid) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Validate user still exists and is active (RBAC check)
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    // Generate new access token with current user role
    const newAccessToken = JWTUtils.generateAccessToken({
      userId: String(user._id),
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token (alias for /refresh)
 * @access  Public (requires valid refresh token)
 * @permissions Validates refresh token and user status before issuing new access token
 */
router.post('/refresh-token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    // Verify refresh token signature
    const payload = JWTUtils.verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database and is not revoked
    const tokenValid = await RefreshToken.isTokenValid(refreshToken);
    if (!tokenValid) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Validate user still exists and is active (RBAC check)
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    // Generate new access token with current user role
    const newAccessToken = JWTUtils.generateAccessToken({
      userId: String(user._id),
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user by revoking refresh token(s)
 * @access  Private (requires authentication)
 * @permissions Any authenticated user can logout
 * 
 * Note: Can revoke specific refresh token or all tokens for user
 * For resource ownership validation, use PermissionChecker.requireOwnership() from utils/permissions.ts
 */
router.post('/logout', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Revoke specific refresh token
      await RefreshToken.revokeToken(refreshToken);
    } else {
      // Revoke all refresh tokens for user (logout from all devices)
      // req.user is a full IUser document; use _id (ObjectId) when revoking tokens
      await RefreshToken.revokeAllForUser(req.user!._id as any);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get authenticated user's profile information
 * @access  Private (requires authentication)
 * @permissions Any authenticated user can view their own profile
 * 
 * Note: Uses authenticate middleware which validates JWT and enforces isActive status
 * For viewing other users' profiles, use PermissionChecker.canViewUserResources() from utils/permissions.ts
 */
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Fetch full user profile (password excluded via select)
    // req.user is a full IUser document attached by authenticate middleware
    const user = await User.findById(req.user!._id).select('-password');

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          teamId: user.teamId,
          groupIds: user.groupIds,
          profileImage: user.profileImage,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset code to user email
 * @access  Public
 * @middleware passwordResetRateLimiter - Enforces 24-hour rate limit on password resets
 */
router.post('/forgot-password', passwordResetRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ValidationError('No account found with this email');
    }

    // Generate 6-digit code
    const code = CodeGenerator.generate6DigitCode();
    user.twoFactorCode = CodeGenerator.hashCode(code);
    user.twoFactorCodeExpiry = CodeGenerator.getCodeExpiration();
    await user.save();

    // Send verification email
    try {
      const emailService = await EmailService.create();
      await emailService.sendPasswordResetCode(user.email, code, user.name);
      console.log(`[FORGOT-PASSWORD] Reset code sent to ${user.email}`);
    } catch (emailError) {
      console.error('[FORGOT-PASSWORD] Failed to send email:', emailError);
      user.twoFactorCode = undefined;
      user.twoFactorCodeExpiry = undefined;
      await user.save();
      throw new Error('Failed to send reset code email');
    }

    ApiResponseUtil.success(res, { email: user.email }, 'Reset code sent to your email');
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/verify-reset-code
 * @desc    Verify reset code and return JWT reset token
 * @access  Public
 */
router.post('/verify-reset-code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      throw new ValidationError('Email and code are required');
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ValidationError('Invalid email or code');
    }

    // Verify the code
    if (!user.twoFactorCode || !user.twoFactorCodeExpiry) {
      throw new ValidationError('No reset code found. Please request a new one');
    }

    const isCodeValid = CodeGenerator.hashCode(code) === user.twoFactorCode;
    const isExpired = new Date() > new Date(user.twoFactorCodeExpiry);

    if (!isCodeValid || isExpired) {
      throw new ValidationError('Invalid or expired reset code');
    }

    // Generate reset token (valid for 15 minutes for password reset)
    const resetToken = JWTUtils.generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    ApiResponseUtil.success(res, { resetToken }, 'Code verified successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Update password after verification (forgot password flow)
 * @access  Private (requires reset token from verify-reset-code)
 */
router.post('/reset-password', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!newPassword || !confirmPassword) {
      throw new ValidationError('New password and confirmation are required');
    }

    if (newPassword !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    // Get user and update password
    const user = await User.findById(req.user!._id).select('+password');
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Prevent password reuse - check if new password is same as current password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      throw new ValidationError('Cannot use current password');
    }

    // Update password and track reset time
    user.password = newPassword;
    user.lastPasswordResetAt = new Date();
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpiry = undefined;
    await user.save();

    ApiResponseUtil.success(res, { user: { id: user._id, name: user.name, email: user.email, role: user.role } }, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/verify-password-reset-code
 * @desc    Verify 6-digit code and update password (step 2)
 * @access  Private (requires valid JWT token)
 */
router.post('/verify-password-reset-code', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;

    // Get user
    const user = await User.findById(req.user!._id);
    if (!user) throw new AuthenticationError('User not found');

    // Validate code
    PasswordResetUtil.validateVerificationCode(code, user);

    // Update password and clear fields
    PasswordResetUtil.updatePassword(user);
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully',
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } }
    });

  } catch (error) {
    next(error);
  }
});

export default router;