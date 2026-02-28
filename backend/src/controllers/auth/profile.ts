import { Request, Response, NextFunction } from 'express';
import User, {UserRole} from '../../models/user';
import { AuthenticationError } from '../../errors';
import { prefault } from 'zod';

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

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only allow these fields
    const { name, phone, bio, role } = req.body;

    const updates: Record<string, any> = {};

    if (name !== undefined) updates.name = String(name).trim();
    if (phone !== undefined) updates.phone = phone ? String(phone).trim() : undefined;
    if (bio !== undefined) updates.bio = bio ? String(bio).trim() : undefined;

    // Role validation (only allow values in your enum)
    if (role !== undefined) {
      const r = String(role).toLowerCase();
      const allowed = Object.values(UserRole);
      if (!allowed.includes(r as UserRole)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Allowed roles: ${allowed.join(", ")}`
        });
      }
      updates.role = r;
    }

    // Optional: extra validation
    if (updates.name !== undefined && updates.name.length === 0) {
      return res.status(400).json({ success: false, message: "Name cannot be empty" });
    }
    if (updates.bio !== undefined && updates.bio.length > 500) {
      return res.status(400).json({ success: false, message: "Bio must be 500 characters or less" });
    }

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      throw new AuthenticationError("User not found");
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
          lastLogin: user.lastLogin,
          phone: user.phone, 
          bio: user.bio     
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
export const getPreferences = async (req: Request,res: Response,next: NextFunction) => {
  try {
    // Only fetch preferences (nothing else)
    const user = await User.findById(req.user!._id).select("preferences");

    if (!user) {
      throw new AuthenticationError("User not found");
    }

    res.json({
      success: true,
      data: {
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { timezone, notifications } = req.body;
    const updates: Record<string, any> = {};

    if (timezone !== undefined) {
      const tz = String(timezone).trim();
      if (!tz) {
        return res.status(400).json({
          success: false,
          message: "timezone cannot be empty",
        });
      }
      updates["preferences.timezone"] = tz;
    }

    // notifications (nested)
    if (notifications !== undefined) {
      if (typeof notifications !== "object" || notifications === null) {
        return res.status(400).json({
          success: false,
          message: "notifications must be an object",
        });
      }

      if (notifications.email !== undefined) {
        if (typeof notifications.email !== "boolean") {
          return res.status(400).json({
            success: false,
            message: "notifications.email must be a boolean",
          });
        }
        updates["preferences.notifications.email"] = notifications.email;
      }

      if (notifications.sms !== undefined) {
        if (typeof notifications.sms !== "boolean") {
          return res.status(400).json({
            success: false,
            message: "notifications.sms must be a boolean",
          });
        }
        updates["preferences.notifications.sms"] = notifications.sms;
      }

      if (notifications.push !== undefined) {
        if (typeof notifications.push !== "boolean") {
          return res.status(400).json({
            success: false,
            message: "notifications.push must be a boolean",
          });
        }
        updates["preferences.notifications.push"] = notifications.push;
      }
    }

    // Nothing valid provided
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid preference fields provided",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("preferences");

    if (!user) {
      throw new AuthenticationError("User not found");
    }

    return res.json({
      success: true,
      data: {
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};