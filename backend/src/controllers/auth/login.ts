import { Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import RefreshToken from '../../models/RefreshToken';
import JWTUtils from '../../utils/jwt';
import { ValidationError, AuthenticationError } from '../../errors';

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT tokens
 * @access  Public
 * @permissions Validates user credentials and enforces isActive status (RBAC)
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
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

    // Check if user account is email verified
    if (!user.isEmailVerified) {
      throw new AuthenticationError('Please verify your email before logging in');
    }

    // Verify password using bcrypt comparePassword method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {

      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      // Lock account after 5 failed attempts for 15 minutes
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }

      await user.save();
      throw new AuthenticationError('Invalid credentials');
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

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
};
