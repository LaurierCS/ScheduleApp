import { Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import { AuthenticationError } from '../../errors';
import { preferencesSchema } from '../../validators/userValidators';

/**
 * @route   GET /api/users/preferences
 * @desc    Get authenticated user's preferences
 * @access  Private (requires authentication)
 * @permissions Any authenticated user can view their own preferences
 */
export const getPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Only fetch preferences (nothing else)
        const user = await User.findById(req.user!._id).select("preferences");

        if (!user) {
            throw new AuthenticationError("User not found");
        }

        res.json({
            success: true,
            data: {
                preferences: user.preferences,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/users/preferences
 * @desc    Update authenticated user's preferences (timezone, notifications)
 * @access  Private (requires authentication)
 * @permissions Any authenticated user can update their own preferences
 */
export const updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // preferencesSchema handles trimming and basic validation
        const data = preferencesSchema.parse(req.body);
        const updates: Record<string, any> = {};

        if (data.timezone !== undefined) {
            updates['preferences.timezone'] = data.timezone;
        }
        if (data.notifications !== undefined) {
            if (data.notifications.email !== undefined) {
                updates['preferences.notifications.email'] = data.notifications.email;
            }
            if (data.notifications.sms !== undefined) {
                updates['preferences.notifications.sms'] = data.notifications.sms;
            }
            if (data.notifications.push !== undefined) {
                updates['preferences.notifications.push'] = data.notifications.push;
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid preference fields provided",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user!._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("preferences");

        if (!user) {
            throw new AuthenticationError("User not found");
        }

        return res.json({
            success: true,
            data: {
                preferences: user.preferences,
            },
        });
    } catch (error) {
        next(error);
    }
};
