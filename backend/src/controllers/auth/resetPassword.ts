import { Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { ValidationError, AuthenticationError } from '../../errors';

/**
 * @route   POST /api/auth/reset-password
 * @desc    Update password after verification (forgot password flow)
 * @access  Private (requires reset token from verify-reset-code)
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
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
};
