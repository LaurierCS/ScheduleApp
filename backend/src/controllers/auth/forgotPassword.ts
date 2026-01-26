import { Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { ValidationError } from '../../errors';
import CodeGenerator from '../../utils/codeGenerator';
import { EmailService } from '../../utils/email';

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset code to user email
 * @access  Public
 * @middleware passwordResetRateLimiter - Enforces 24-hour rate limit on password resets
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
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
      const emailService = new EmailService();
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
};
