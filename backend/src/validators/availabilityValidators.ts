import { z } from 'zod';
import { AvailabilityType } from '../models/availability';

/**
 * Zod schema for recurrence pattern validation
 */
const DateLike = z.union([z.string(), z.date()]);

const RecurrencePatternSchema = z.object({
    frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
    interval: z.number().int().min(1).optional(),
    byWeekDay: z.array(z.number().int().min(0).max(6)).optional(),
    byMonthDay: z.array(z.number().int().min(1).max(31)).optional(),
    byMonth: z.array(z.number().int().min(1).max(12)).optional(),
    count: z.number().int().min(1).optional(),
    until: DateLike.optional(),
    rruleString: z.string().optional(),
});

/**
 * Zod schema for creating availability
 */
export const CreateAvailabilitySchema = z.object({
    teamId: z.string().optional(),
    startTime: DateLike,
    endTime: DateLike,
    type: z.enum([AvailabilityType.AVAILABLE, AvailabilityType.UNAVAILABLE]).optional(),
    recurring: z.boolean().optional(),
    recurrencePattern: RecurrencePatternSchema.optional(),
    timezone: z.string().optional(),
}).refine(
    (data) => {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        return end > start;
    },
    {
        message: "End time must be after start time",
        path: ["endTime"],
    }
).refine(
    (data) => {
        if (data.recurring && !data.recurrencePattern) {
            return false;
        }
        return true;
    },
    {
        message: "Recurring availabilities must have a recurrence pattern",
        path: ["recurrencePattern"],
    }
);

/**
 * Zod schema for updating availability
 */
export const UpdateAvailabilitySchema = CreateAvailabilitySchema.partial();
