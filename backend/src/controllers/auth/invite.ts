import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../models/user';
import Invite from '../../models/invite';
import { ValidationError } from '../../errors';
import CodeGenerator from '../../utils/codeGenerator';

/**
 * @route   POST /api/auth/invite
 * @desc    Create an invite code for new ADMIN account registration. Need special permission to register a new ADMIN account.
 * @access  Private (Admin only)
 */
export const invite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, role, expiresInDays = 7 } = req.body;

    if (!role) {
      throw new ValidationError('Role is required');
    }

    if (!Object.values(UserRole).includes(role)) {
      throw new ValidationError('Invalid role');
    }

    const code = CodeGenerator.generate6DigitCode();

    const inviteDoc = new Invite({
      code,
      email: email?.toLowerCase(),
      role,
      createdBy: req.user!._id,
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      isActive: true
    });

    await inviteDoc.save();

    res.status(201).json({
      success: true,
      message: 'Invite created successfully',
      data: {
        code: inviteDoc.code,
        email: inviteDoc.email,
        role: inviteDoc.role,
        expiresAt: inviteDoc.expiresAt
      }
    });

  } catch (error) {
    next(error);
  }
};
