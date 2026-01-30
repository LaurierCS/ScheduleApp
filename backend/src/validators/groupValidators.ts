import mongoose, { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { GroupType } from '../models/group';

/* ----------------------------- Helpers ----------------------------------- */

/**
 * Convert string to MongoDB ObjectId
 */
export const toObjectId = (s: string): mongoose.Types.ObjectId =>
    new mongoose.Types.ObjectId(String(s));

/**
 * Zod schema for validating ObjectId strings
 */
export const objectIdSchema = z
    .string()
    .trim()
    .refine((v: string) => isValidObjectId(v), { message: 'Invalid ObjectId' })
    .transform((s: string) => toObjectId(s));

/**
 * Zod schema for arrays of ObjectIds (with default empty array)
 */
export const objectIdArrayDefault = z.array(objectIdSchema).default([]);

/* --------------------------- Validation Schemas ---------------------------------- */

/**
 * Schema for group-specific settings
 */
export const groupSettingsSchema = z.object({
    availabilityOverride: z.boolean().default(false),
    priority: z.number().min(0, 'Priority cannot be negative').default(0),
}).default({ availabilityOverride: false, priority: 0 });

/**
 * Schema for creating a new group
 */
export const createGroupSchema = z.object({
    name: z.string().min(1, 'name is required').trim(),
    description: z.string().trim().optional(),
    type: z.nativeEnum(GroupType).default(GroupType.BOTH),
    members: objectIdArrayDefault,
    candidates: objectIdArrayDefault,
    teamId: objectIdSchema,
    settings: groupSettingsSchema.optional(),
});

/**
 * Schema for updating a group (teamId not allowed)
 */
export const updateGroupSchema = z.object({
    name: z.string().min(1).trim().optional(),
    description: z.string().trim().optional(),
    type: z.nativeEnum(GroupType).optional(),
    settings: z.object({
        availabilityOverride: z.boolean().optional(),
        priority: z.number().min(0, 'Priority cannot be negative').optional(),
    }).optional(),
});

/**
 * Schema for adding a member to a group
 */
export const addMemberSchema = z.object({
    userId: objectIdSchema,
});

/**
 * Schema for filtering groups
 */
export const groupFilterSchema = z.object({
    type: z.nativeEnum(GroupType).optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
});
