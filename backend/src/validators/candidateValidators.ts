import { z } from 'zod';
import { isValidObjectId } from 'mongoose';

/**
 * Zod schema for validating ObjectId strings
 */
const objectIdSchema = z
    .string()
    .trim()
    .refine((v: string) => isValidObjectId(v), { message: 'Invalid ObjectId' });

/**
 * Zod schema for arrays of ObjectIds (plain - for validation requiring minimum)
 */
const objectIdArrayPlain = z.array(objectIdSchema);

/**
 * Zod schema for arrays of ObjectIds (with default empty array)
 */
const objectIdArrayDefault = z.array(objectIdSchema).default([]);

/**
 * Schema for creating a new candidate
 */
export const createCandidateSchema = z.object({
    name: z.string().min(1, 'name is required').trim(),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, 'password must be at least 6 characters'),
    groupIds: objectIdArrayDefault,
    resumeUrl: z.string().default(""),
    year: z.number().optional(),
    program: z.string().default(""),
});

/**
 * Schema for updating an existing candidate
 */
export const updateCandidateSchema = createCandidateSchema
    .omit({ password: true })
    .partial()
    .extend({
        groupIds: objectIdArrayPlain.optional(),
        resumeUrl: z.string().optional(),
        program: z.string().optional(),
    });
