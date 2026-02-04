import mongoose, { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { UserRole } from '../models/user';

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
 * Zod schema for arrays of ObjectIds (plain - for validation requiring minimum)
 */
export const objectIdArrayPlain = z.array(objectIdSchema);

/**
 * Zod schema for arrays of ObjectIds (with default empty array)
 */
export const objectIdArrayDefault = z.array(objectIdSchema).default([]);

/* --------------------------- Validation Schemas ---------------------------------- */

/**
 * Schema for creating a new team
 */
export const createTeamSchema = z.object({
    name: z.string().min(1, 'name is required').trim(),
    description: z.string().optional(),
});

/**
 * Schema for updating team details
 */
export const updateTeamSchema = z.object({
    name: z.string().min(1).trim().optional(),
    description: z.string().optional(),
});

/**
 * Schema for adding members to a team
 */
export const addMembersSchema = z.object({
    members: objectIdArrayPlain.min(1, 'members must include at least one id'),
    role: z.nativeEnum(UserRole).optional(),
});

/**
 * Schema for removing members from a team
 */
export const removeMembersSchema = z.object({
    members: objectIdArrayPlain.min(1, 'members must include at least one id'),
});

/**
 * Schema for creating a group within a team
 */
export const createTeamGroupSchema = z.object({
    name: z.string().min(1, 'name is required').trim(),
    members: objectIdArrayDefault.optional(),
});

/**
 * Schema for removing groups from a team
 */
export const removeGroupsSchema = z.object({
    groupIds: objectIdArrayPlain.min(1, 'groupIds must include at least one id'),
});

/**
 * Schema for time slot validation (HH:mm format)
 */
export const timeSlotSchema = z.object({
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format'),
});

/**
 * Schema for default availability per day
 */
export const defaultAvailabilitySchema = z.object({
    enabled: z.boolean().optional(),
    timeSlots: z.array(timeSlotSchema).optional(),
});

/**
 * Schema for email template
 */
export const emailTemplateSchema = z.object({
    subject: z.string().optional(),
    body: z.string().optional(),
});

/**
 * Schema for interview duration settings
 */
export const interviewDurationSchema = z.object({
    technical: z.number().min(15).max(480).optional(),
    behavioral: z.number().min(15).max(480).optional(),
    cultural: z.number().min(15).max(480).optional(),
    screening: z.number().min(15).max(480).optional(),
});

/**
 * Schema for group configuration
 */
export const groupConfigSchema = z.object({
    maxGroupSize: z.number().min(1).max(1000).optional(),
    allowMemberSelfAssign: z.boolean().optional(),
    requireApprovalForGroupJoin: z.boolean().optional(),
});

/**
 * Schema for updating team settings
 */
export const updateTeamSettingsSchema = z.object({
    defaultAvailability: z.object({
        Monday: defaultAvailabilitySchema.optional(),
        Tuesday: defaultAvailabilitySchema.optional(),
        Wednesday: defaultAvailabilitySchema.optional(),
        Thursday: defaultAvailabilitySchema.optional(),
        Friday: defaultAvailabilitySchema.optional(),
        Saturday: defaultAvailabilitySchema.optional(),
        Sunday: defaultAvailabilitySchema.optional(),
    }).optional(),
    emailTemplates: z.object({
        interviewInvitation: emailTemplateSchema.optional(),
        interviewReminder: emailTemplateSchema.optional(),
        interviewCancellation: emailTemplateSchema.optional(),
        teamInvitation: emailTemplateSchema.optional(),
    }).optional(),
    interviewDurationDefaults: interviewDurationSchema.optional(),
    groupConfig: groupConfigSchema.optional(),
});

/**
 * Schema for adding members to team via email invitations (batch operation)
 */
export const addMembersBatchSchema = z.object({
    emails: z.array(z.string().email()).min(1, 'emails must include at least one email address'),
    role: z.nativeEnum(UserRole).optional(),
    message: z.string().optional(), // Custom message to include in invitation
});

/**
 * Schema for adding candidates to team via email invitations
 */
export const addCandidatesBatchSchema = z.object({
    emails: z.array(z.string().email()).min(1, 'emails must include at least one email address'),
    message: z.string().optional(), // Custom message to include in invitation
});
