import { z } from 'zod';
import { UserRole } from '../models/user';

/*
 * Schemas for user-related request validation. These are used by
 * profile/preferences/password controllers so that input is trimmed,
 * typed, and basic rules are enforced.  Existing controllers previously
 * performed this logic manually.
 */

// --- profile update -------------------------------------------------------
export const profileUpdateSchema = z.object({
    name: z.string().min(1, 'name is required').trim().optional(),
    email: z.string().email('invalid email address').trim().optional(),
    phone: z.string().trim().optional().nullable(),
    bio: z.string().max(500, 'bio must be 500 characters or less').trim().optional().nullable(),
    role: z.nativeEnum(UserRole).optional(),
});

// --- preferences ----------------------------------------------------------
export const notificationsSchema = z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    push: z.boolean().optional(),
});

export const preferencesSchema = z.object({
    timezone: z.string().min(1, 'timezone cannot be empty').trim().optional(),
    notifications: notificationsSchema.optional(),
});

// --- password change ------------------------------------------------------
export const passwordChangeSchema = z
    .object({
        currentPassword: z.string().min(1, 'current password is required'),
        newPassword: z.string().min(6, 'new password must be at least 6 characters'),
        confirmPassword: z.string().min(1, 'please confirm new password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'new password and confirmation do not match',
        path: ['confirmPassword'],
    });
