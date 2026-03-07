import { Request, Response, NextFunction } from 'express';
import User, { UserRole } from '../../models/user';
import { AuthenticationError } from '../../errors';
import { profileUpdateSchema } from '../../validators/userValidators';

/**
 * @route   PUT /api/users/profile
 * @desc    Update authenticated user's profile (name, phone, bio, role)
 * @access  Private (requires authentication)
 * @permissions Any authenticated user can update their own profile
 */

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // parse & sanitize input via Zod schema (trimming, type coercion, basic rules)
        // this replaces the previous manual logic and helps keep controllers
        // focused on business rules rather than validation mechanics.
        const data = profileUpdateSchema.parse(req.body);
        const updates: Record<string, any> = {};

        if (data.name !== undefined) updates.name = data.name;
        if (data.phone !== undefined) updates.phone = data.phone || undefined;
        if (data.bio !== undefined) updates.bio = data.bio || undefined;
        if (data.role !== undefined) updates.role = data.role;

        // Email change must be unique
        if (data.email !== undefined) {
            const email = data.email.toLowerCase();
            const existing = await User.findOne({ email, _id: { $ne: req.user!._id } });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Email is already in use' });
            }
            updates.email = email;
        }

        if (Object.keys(updates).length === 0) {
            // nothing to update, just return current profile
            const current = await User.findById(req.user!._id).select('-password');
            if (!current) throw new AuthenticationError('User not found');
            return res.json({ success: true, data: { user: current } });
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
