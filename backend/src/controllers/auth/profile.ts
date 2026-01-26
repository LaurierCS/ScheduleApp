import { Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import { AuthenticationError } from '../../errors';

/**
 * @route   GET /api/auth/me
 * @desc    Get authenticated user's profile information
 * @access  Private (requires authentication)
 * @permissions Any authenticated user can view their own profile
 * 
 * Note: Uses authenticate middleware which validates JWT and enforces isActive status
 * For viewing other users' profiles, use PermissionChecker.canViewUserResources() from utils/permissions.ts
 */
export const me = async (req: Request, res: Response, next: NextFunction) => {
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
};
