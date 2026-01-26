import { Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import RefreshToken from '../../models/RefreshToken';
import JWTUtils from '../../utils/jwt';
import { ValidationError, AuthenticationError } from '../../errors';

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token)
 * @permissions Validates refresh token and user status before issuing new access token
 */
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
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
};

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token (alias for /refresh)
 * @access  Public (requires valid refresh token)
 * @permissions Validates refresh token and user status before issuing new access token
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
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
};
