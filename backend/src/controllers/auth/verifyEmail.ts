import { Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { ValidationError } from '../../errors';
import CodeGenerator from '../../utils/codeGenerator';

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user email with 6-digit code
 * @access  Public
 */
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      throw new ValidationError('Email and code are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ValidationError('Invalid email or code');
    }

    if (user.isEmailVerified) {
      throw new ValidationError('Email is already verified');
    }

    // Verify the code
    if (!user.emailVerificationCode || !user.emailVerificationCodeExpiry) {
      throw new ValidationError('No verification code found. Please request a new one');
    }

    const isCodeValid = CodeGenerator.hashCode(code) === user.emailVerificationCode;
    const isExpired = new Date() > new Date(user.emailVerificationCodeExpiry);

    if (!isCodeValid || isExpired) {
      throw new ValidationError('Invalid or expired verification code');
    }

    // Mark email as verified and clear code
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpiry = undefined;
    await user.save();

    ApiResponseUtil.success(res, { email: user.email }, 'Email verified successfully');
  } catch (error) {
    next(error);
  }
};
