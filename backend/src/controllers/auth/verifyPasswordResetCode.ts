import { Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import { AuthenticationError } from '../../errors';
import PasswordResetUtil from '../../utils/passwordReset';

/**
 * @route   POST /api/auth/verify-password-reset-code
 * @desc    Verify 6-digit code and update password (step 2)
 * @access  Private (requires valid JWT token)
 */
export const verifyPasswordResetCode = async (req: Request, res: Response, next: NextFunction) => {
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
};
