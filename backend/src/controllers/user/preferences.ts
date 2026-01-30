import { Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import { AuthenticationError } from '../../errors';

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
        const { timezone, notifications } = req.body;
        const updates: Record<string, any> = {};

        if (timezone !== undefined) {
            const tz = String(timezone).trim();
            if (!tz) {
                return res.status(400).json({
                    success: false,
                    message: "timezone cannot be empty",
                });
            }
            updates["preferences.timezone"] = tz;
        }

        // notifications (nested)
        if (notifications !== undefined) {
            if (typeof notifications !== "object" || notifications === null) {
                return res.status(400).json({
                    success: false,
                    message: "notifications must be an object",
                });
            }

            if (notifications.email !== undefined) {
                if (typeof notifications.email !== "boolean") {
                    return res.status(400).json({
                        success: false,
                        message: "notifications.email must be a boolean",
                    });
                }
                updates["preferences.notifications.email"] = notifications.email;
            }

            if (notifications.sms !== undefined) {
                if (typeof notifications.sms !== "boolean") {
                    return res.status(400).json({
                        success: false,
                        message: "notifications.sms must be a boolean",
                    });
                }
                updates["preferences.notifications.sms"] = notifications.sms;
            }

            if (notifications.push !== undefined) {
                if (typeof notifications.push !== "boolean") {
                    return res.status(400).json({
                        success: false,
                        message: "notifications.push must be a boolean",
                    });
                }
                updates["preferences.notifications.push"] = notifications.push;
            }
        }

        // Nothing valid provided
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
