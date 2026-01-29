import { Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import JWTUtils from '../../utils/jwt';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { ValidationError } from '../../errors';
import CodeGenerator from '../../utils/codeGenerator';

/**
 * @route   POST /api/auth/verify-reset-code
 * @desc    Verify reset code and return JWT reset token
 * @access  Public
 */
export const verifyResetCode = async (req: Request, res: Response, next: NextFunction) => {
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
};
