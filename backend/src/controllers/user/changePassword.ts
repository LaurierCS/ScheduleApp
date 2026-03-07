import { Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import { AuthenticationError } from '../../errors';
import PasswordResetUtil from '../../utils/passwordReset';
import { passwordChangeSchema } from '../../validators/userValidators';

/**
 * @route   PUT /api/users/password
 * @desc    Change authenticated user's password (requires current password)
 * @access  Private
 * @permissions Any authenticated user can change their own password
 */
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = passwordChangeSchema.parse(req.body);

        const user = await User.findById(req.user!._id);
        if (!user) {
            throw new AuthenticationError('User not found');
        }

        // verify current password
        await PasswordResetUtil.verifyCurrentPassword(user, data.currentPassword);

        // set new password; mongoose pre-save will hash it
        user.password = data.newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};
