import { z } from 'zod';
import { InterviewerStatus } from '../models/interviewer';
import { CandidateStatus } from '../models/candidate';

/**
 * Schema for validating an interviewer CSV row
 * Requires: name, email
 * Optional: status, capacity fields, skills, groupIds
 */
export const interviewerRowSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Name is required')
        .refine((val) => val.length > 0, 'Name cannot be empty'),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email('Invalid email address'),
    status: z
        .enum([InterviewerStatus.ACTIVE, InterviewerStatus.INACTIVE, InterviewerStatus.PENDING])
        .optional()
        .default(InterviewerStatus.PENDING),
    capacityMaxPerDay: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => !isNaN(val) && val > 0, 'Capacity per day must be a positive number'),
    capacityMaxPerWeek: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 40))
        .refine((val) => !isNaN(val) && val > 0, 'Capacity per week must be a positive number'),
    skills: z
        .string()
        .optional()
        .transform((val) => (val ? val.split(',').map((s) => s.trim()).filter((s) => s.length > 0) : [])),
    groupIds: z
        .string()
        .optional()
        .transform((val) => (val ? val.split(',').map((s) => s.trim()).filter((s) => s.length > 0) : [])),
});

export type InterviewerRowInput = z.infer<typeof interviewerRowSchema>;

/**
 * Schema for validating a candidate CSV row
 * Requires: name, email
 * Optional: status, year, program, groupIds
 */
export const candidateRowSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Name is required')
        .refine((val) => val.length > 0, 'Name cannot be empty'),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email('Invalid email address'),
    status: z
        .enum([CandidateStatus.ACTIVE, CandidateStatus.PENDING, CandidateStatus.COMPLETED, CandidateStatus.DECLINED])
        .optional()
        .default(CandidateStatus.PENDING),
    year: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined))
        .refine((val) => val === undefined || (!isNaN(val) && val > 0), 'Year must be a positive number'),
    program: z
        .string()
        .optional()
        .default(''),
    groupIds: z
        .string()
        .optional()
        .transform((val) => (val ? val.split(',').map((s) => s.trim()).filter((s) => s.length > 0) : [])),
});

export type CandidateRowInput = z.infer<typeof candidateRowSchema>;

/**
 * Schema for validating availability export query parameters
 */
export const exportAvailabilityQuerySchema = z.object({
    teamId: z.string().optional(),
    userId: z.string().optional(),
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
});

export type ExportAvailabilityQuery = z.infer<typeof exportAvailabilityQuerySchema>;
