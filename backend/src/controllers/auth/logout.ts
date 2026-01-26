import { Request, Response, NextFunction } from 'express';
import RefreshToken from '../../models/RefreshToken';

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user by revoking refresh token(s)
 * @access  Private (requires authentication)
 * @permissions Any authenticated user can logout
 * 
 * Note: Can revoke specific refresh token or all tokens for user
 * For resource ownership validation, use PermissionChecker.requireOwnership() from utils/permissions.ts
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
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
};
