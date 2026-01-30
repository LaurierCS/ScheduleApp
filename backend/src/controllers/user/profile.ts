import { Request, Response, NextFunction } from 'express';
import User, { UserRole } from '../../models/user';
import { AuthenticationError } from '../../errors';

/**
 * @route   PUT /api/users/profile
 * @desc    Update authenticated user's profile (name, phone, bio, role)
 * @access  Private (requires authentication)
 * @permissions Any authenticated user can update their own profile
 */
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
