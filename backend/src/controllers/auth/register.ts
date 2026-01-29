import { Request, Response, NextFunction } from 'express';
import User, { UserRole } from '../../models/user';
import RefreshToken from '../../models/RefreshToken';
import Invite from '../../models/invite';
import JWTUtils from '../../utils/jwt';
import { ValidationError } from '../../errors';
import CodeGenerator from '../../utils/codeGenerator';
import { EmailService } from '../../utils/email';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with JWT authentication
 * @access  Public
 * @permissions Creates new user with CANDIDATE role by default. Invite code required for ADMIN or INTERVIEWER roles.
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, inviteCode } = req.body;

    // Validation
    if (!name || !email || !password) {
      throw new ValidationError('Name, email, and password are required');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ValidationError('User already exists with this email');
    }

    // Determine role based on invite code
    let role = UserRole.CANDIDATE;
    let invite = null;

    if (inviteCode) {
      invite = await Invite.findOne({ 
        code: inviteCode, 
        isActive: true,
        expiresAt: { $gt: new Date() }
      });

      if (!invite) {
        throw new ValidationError('Invalid or expired invite code');
      }

      // If invite is locked to specific email, verify it matches
      if (invite.email && invite.email !== email.toLowerCase()) {
        throw new ValidationError('This invite code is not valid for this email');
      }

      role = invite.role;
    }

    // Create user with determined role
    // Password will be hashed automatically by the pre-save middleware
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,      // either admin role or candidate role by default
      isActive: true
    });

    await user.save();

    // Send verification email
    const verificationCode = CodeGenerator.generate6DigitCode();
    user.emailVerificationCode = CodeGenerator.hashCode(verificationCode);
    user.emailVerificationCodeExpiry = CodeGenerator.getCodeExpiration();
    await user.save();

    try {
      const emailService = new EmailService();
      await emailService.sendVerificationCode(user.email, verificationCode, user.name);
      console.log(`[REGISTER] Verification code sent to ${user.email}`);
    } catch (emailError) {
      console.error('[REGISTER] Failed to send verification email:', emailError);
      // Don't fail registration, user can request new code later
    }

    // Mark invite as used
    if (invite) {
      invite.isActive = false;
      invite.usedAt = new Date();
      invite.usedBy = user._id;
      await invite.save();
    }

    // Generate JWT tokens
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

    // Store refresh token in database for validation
    await new RefreshToken({
      token: refreshToken,
      userId: user._id,
      expiresAt: JWTUtils.getTokenExpiration(refreshToken) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }).save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    next(error);
  }
};
