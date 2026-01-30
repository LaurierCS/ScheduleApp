import { z } from 'zod';
import { isValidObjectId } from 'mongoose';
import { InterviewerStatus } from '../models/interviewer';

/**
 * Zod schema for validating ObjectId strings
 */
const objectIdSchema = z
    .string()
    .trim()
    .refine((v: string) => isValidObjectId(v), { message: 'Invalid ObjectId' });

/**
 * Zod schema for arrays of ObjectIds (with default empty array)
 */
const objectIdArrayDefault = z.array(objectIdSchema).default([]);

/**
 * Schema for creating a new interviewer
 */
export const createInterviewerSchema = z.object({
    name: z.string().min(1, 'name is required').trim(),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'password must be at least 6 characters'),
    groupIds: objectIdArrayDefault,
    skills: z.array(z.string().trim()).default([]),
    capacity: z.object({
        maxPerDay: z.number().min(1).max(20).default(10),
        maxPerWeek: z.number().min(1).max(100).default(40),
    }).default({ maxPerDay: 10, maxPerWeek: 40 }),
});

/**
 * Schema for updating an existing interviewer
 */
export const updateInterviewerSchema = createInterviewerSchema
    .omit({ password: true })
    .partial()
    .extend({
        status: z.nativeEnum(InterviewerStatus).optional(),
        groupIds: z.array(objectIdSchema).optional(),
        skills: z.array(z.string().trim()).optional(),
        capacity: z.object({
            maxPerDay: z.number().min(1).max(20),
            maxPerWeek: z.number().min(1).max(100),
        }).partial().optional(),
    });
