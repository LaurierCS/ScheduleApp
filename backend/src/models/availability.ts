import mongoose, { Document, Schema, Model } from "mongoose";
import { RRule, RRuleSet, rrulestr } from "rrule";

/**
 * Enum for availability type - whether user is available or unavailable during this slot
 */
export enum AvailabilityType {
    AVAILABLE = "available",
    UNAVAILABLE = "unavailable",
}

/**
 * Interface for recurrence pattern object
 * Supports weekly, bi-weekly, and monthly recurring patterns
 */
export interface IRecurrencePattern {
    frequency: "WEEKLY" | "DAILY" | "MONTHLY" | "YEARLY";
    interval?: number; // e.g., 1 for weekly, 2 for bi-weekly
    byWeekDay?: number[]; // Days of week (0=Monday, 6=Sunday)
    byMonthDay?: number[]; // Days of month (1-31)
    byMonth?: number[]; // Months (1-12)
    count?: number; // Number of occurrences
    until?: Date; // End date for recurrence
    rruleString?: string; // Optional RFC 5545 RRULE string for advanced patterns
}

/**
 * Represents a time slot of availability for a specific user
 * Supports both one-time and recurring availability patterns with timezone handling
 * 
 * @property userId - Reference to the User (interviewer or candidate)
 * @property teamId - Reference to the Team this availability is associated with
 * @property startTime - Start time of the availability slot (stored in UTC)
 * @property endTime - End time of the availability slot (stored in UTC)
 * @property type - Whether this is an 'available' or 'unavailable' slot
 * @property recurring - Whether this availability repeats on a schedule
 * @property recurrencePattern - Defines how the availability recurs (if recurring is true)
 * @property timezone - IANA timezone string (e.g., 'America/Toronto') for proper recurrence expansion
 * @property createdAt - Date this availability was created
 * @property updatedAt - Date this availability was last updated
 */
export interface IAvailability extends Document {
    userId: Schema.Types.ObjectId;
    teamId?: Schema.Types.ObjectId;
    startTime: Date;
    endTime: Date;
    type: AvailabilityType;
    recurring: boolean;
    recurrencePattern?: IRecurrencePattern;
    timezone?: string;
    createdAt: Date;
    updatedAt: Date;

    // Instance methods
    duration(): number;
    isAvailableAt(checkTime: Date): boolean;
    overlapsWidth(otherStart: Date, otherEnd: Date): boolean;
    overlapsWith(otherStart: Date, otherEnd: Date): boolean;
    expandRecurrence(rangeStart: Date, rangeEnd: Date): Date[][];
}

/**
 * Model interface with static methods
 */
export interface IAvailabilityModel extends Model<IAvailability> {
    findOverlapping(
        userId: Schema.Types.ObjectId,
        startTime: Date,
        endTime: Date,
        teamId?: Schema.Types.ObjectId,
        type?: AvailabilityType
    ): Promise<IAvailability[]>;

    findAvailableSlots(
        userId: Schema.Types.ObjectId,
        startTime: Date,
        endTime: Date,
        teamId?: Schema.Types.ObjectId
    ): Promise<IAvailability[]>;

    hasConflict(
        userId: Schema.Types.ObjectId,
        startTime: Date,
        endTime: Date,
        excludeId?: Schema.Types.ObjectId
    ): Promise<boolean>;

    findTeamAvailability(
        teamId: Schema.Types.ObjectId,
        startTime: Date,
        endTime: Date,
        type?: AvailabilityType
    ): Promise<IAvailability[]>;
}

/**
 * Availability Schema Definition
 */
export const AvailabilitySchema = new Schema<IAvailability, IAvailabilityModel>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            index: true,
        },
        startTime: {
            type: Date,
            required: [true, "Start time is required"],
            index: true,
        },
        endTime: {
            type: Date,
            required: [true, "End time is required"],
            index: true,
        },
        type: {
            type: String,
            enum: Object.values(AvailabilityType),
            default: AvailabilityType.AVAILABLE,
            required: true,
        },
        recurring: {
            type: Boolean,
            default: false,
            required: true,
        },
        recurrencePattern: {
            frequency: {
                type: String,
                enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
            },
            interval: Number,
            byWeekDay: [Number],
            byMonthDay: [Number],
            byMonth: [Number],
            count: Number,
            until: Date,
            rruleString: String,
        },
        timezone: {
            type: String,
            default: "UTC",
        },
    },
    {
        timestamps: true,
    }
);

// ============================================================================
// INDEXES - Optimized for efficient querying
// ============================================================================

// Compound index for querying by user and date range
AvailabilitySchema.index({ userId: 1, startTime: 1, endTime: 1 });

// Compound index for querying by team and date range
AvailabilitySchema.index({ teamId: 1, startTime: 1, endTime: 1 });

// Compound index for querying by user, team, and date range
AvailabilitySchema.index({ userId: 1, teamId: 1, startTime: 1 });

// Index for querying by type and date range
AvailabilitySchema.index({ type: 1, startTime: 1, endTime: 1 });

// Sparse index for recurring availabilities
AvailabilitySchema.index({ recurring: 1 }, { sparse: true });

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Pre-save validation to ensure data integrity
 */
AvailabilitySchema.pre("save", function (next) {
    // Validate that endTime is after startTime
    if (this.endTime <= this.startTime) {
        return next(new Error("End time must be after start time"));
    }

    // Note: don't strictly require a recurrencePattern when `recurring` is true here.
    // Some callers may set recurrence details later or provide an `rruleString`.
    // Only validate the recurrencePattern if it is present.

    // Validate recurrence pattern if present
    if (this.recurrencePattern) {
        // Don't require frequency/rruleString here; validate specific fields only if present

        // Validate interval is positive
        if (this.recurrencePattern.interval !== undefined && this.recurrencePattern.interval < 1) {
            return next(new Error("Recurrence interval must be at least 1"));
        }

        // Validate byWeekDay values (0-6)
        if (this.recurrencePattern.byWeekDay) {
            const invalid = this.recurrencePattern.byWeekDay.some(day => day < 0 || day > 6);
            if (invalid) {
                return next(new Error("byWeekDay values must be between 0 (Monday) and 6 (Sunday)"));
            }
        }

        // Validate byMonthDay values (1-31)
        if (this.recurrencePattern.byMonthDay) {
            const invalid = this.recurrencePattern.byMonthDay.some(day => day < 1 || day > 31);
            if (invalid) {
                return next(new Error("byMonthDay values must be between 1 and 31"));
            }
        }

        // Validate byMonth values (1-12)
        if (this.recurrencePattern.byMonth) {
            const invalid = this.recurrencePattern.byMonth.some(month => month < 1 || month > 12);
            if (invalid) {
                return next(new Error("byMonth values must be between 1 and 12"));
            }
        }
    }

    next();
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Calculate the duration of this availability slot in milliseconds
 * @returns Duration in milliseconds
 */
AvailabilitySchema.methods.duration = function (): number {
    return this.endTime.getTime() - this.startTime.getTime();
};

/**
 * Check if a specific time falls within this availability slot
 * @param checkTime - The time to check
 * @returns True if the time falls within this availability
 */
AvailabilitySchema.methods.isAvailableAt = function (checkTime: Date): boolean {
    return checkTime >= this.startTime && checkTime <= this.endTime;
};

/**
 * Check if this availability overlaps with another time range
 * @param otherStart - Start time of the other range
 * @param otherEnd - End time of the other range
 * @returns True if there is any overlap
 */
AvailabilitySchema.methods.overlapsWidth = function (
    otherStart: Date,
    otherEnd: Date
): boolean {
    return this.startTime < otherEnd && this.endTime > otherStart;
};
// Backwards compatible alias (in case other code used the old name)
AvailabilitySchema.methods.overlapsWith = AvailabilitySchema.methods.overlapsWidth;

/**
 * Expand recurring availability into concrete occurrences within a date range
 * @param rangeStart - Start of the range to expand into
 * @param rangeEnd - End of the range to expand into
 * @returns Array of [startTime, endTime] pairs for each occurrence
 */
AvailabilitySchema.methods.expandRecurrence = function (
    rangeStart: Date,
    rangeEnd: Date
): Date[][] {
    if (!this.recurring || !this.recurrencePattern) {
        // Non-recurring: return single occurrence if it falls in range
        if (this.startTime < rangeEnd && this.endTime > rangeStart) {
            return [[this.startTime, this.endTime]];
        }
        return [];
    }

    try {
        let rule: RRule;

        // Use rruleString if provided, otherwise build from pattern
        if (this.recurrencePattern.rruleString) {
            rule = rrulestr(this.recurrencePattern.rruleString) as RRule;
        } else {
            const options: any = {
                freq: (RRule as any)[this.recurrencePattern.frequency],
                dtstart: this.startTime,
                interval: this.recurrencePattern.interval || 1,
            };

            if (this.recurrencePattern.byWeekDay && this.recurrencePattern.byWeekDay.length > 0) {
                options.byweekday = this.recurrencePattern.byWeekDay;
            }

            if (this.recurrencePattern.byMonthDay && this.recurrencePattern.byMonthDay.length > 0) {
                options.bymonthday = this.recurrencePattern.byMonthDay;
            }

            if (this.recurrencePattern.byMonth && this.recurrencePattern.byMonth.length > 0) {
                options.bymonth = this.recurrencePattern.byMonth;
            }

            if (this.recurrencePattern.count) {
                options.count = this.recurrencePattern.count;
            }

            if (this.recurrencePattern.until) {
                options.until = this.recurrencePattern.until;
            }

            rule = new RRule(options);
        }

        // Get all occurrences in the range
        const occurrences = rule.between(rangeStart, rangeEnd, true);

        // Calculate duration of the original slot
        const duration = this.duration();

        // Map each occurrence to [start, end] pair
        return occurrences.map(occurrence => {
            const start = new Date(occurrence.getTime());
            const end = new Date(occurrence.getTime() + duration);
            return [start, end];
        });
    } catch (error) {
        console.error("Error expanding recurrence:", error);
        return [];
    }
};

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Find all availabilities that overlap with a given time range
 * @param userId - User ID to search for
 * @param startTime - Start of the time range
 * @param endTime - End of the time range
 * @param teamId - Optional team ID to filter by
 * @param type - Optional availability type to filter by
 * @returns Array of overlapping availabilities
 */
AvailabilitySchema.statics.findOverlapping = async function (
    userId: Schema.Types.ObjectId,
    startTime: Date,
    endTime: Date,
    teamId?: Schema.Types.ObjectId,
    type?: AvailabilityType
): Promise<IAvailability[]> {
    const query: any = {
        userId,
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
        ],
    };

    if (teamId) {
        query.teamId = teamId;
    }

    if (type) {
        query.type = type;
    }

    return this.find(query).sort({ startTime: 1 });
};

/**
 * Find available slots (type='available' and no conflicting 'unavailable' slots)
 * @param userId - User ID to search for
 * @param startTime - Start of the time range
 * @param endTime - End of the time range
 * @param teamId - Optional team ID to filter by
 * @returns Array of available slots
 */
AvailabilitySchema.statics.findAvailableSlots = async function (
    userId: Schema.Types.ObjectId,
    startTime: Date,
    endTime: Date,
    teamId?: Schema.Types.ObjectId
): Promise<IAvailability[]> {
    return this.findOverlapping(userId, startTime, endTime, teamId, AvailabilityType.AVAILABLE);
};

/**
 * Check if there is a scheduling conflict (unavailable slot) in the given time range
 * @param userId - User ID to check
 * @param startTime - Start of the time range
 * @param endTime - End of the time range
 * @param excludeId - Optional availability ID to exclude from the check (for updates)
 * @returns True if there is a conflict
 */
AvailabilitySchema.statics.hasConflict = async function (
    userId: Schema.Types.ObjectId,
    startTime: Date,
    endTime: Date,
    excludeId?: Schema.Types.ObjectId
): Promise<boolean> {
    const query: any = {
        userId,
        type: AvailabilityType.UNAVAILABLE,
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
        ],
    };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const conflict = await this.findOne(query);
    return conflict !== null;
};

/**
 * Find all availabilities for a team within a time range
 * @param teamId - Team ID to search for
 * @param startTime - Start of the time range
 * @param endTime - End of the time range
 * @param type - Optional availability type to filter by
 * @returns Array of team availabilities
 */
AvailabilitySchema.statics.findTeamAvailability = async function (
    teamId: Schema.Types.ObjectId,
    startTime: Date,
    endTime: Date,
    type?: AvailabilityType
): Promise<IAvailability[]> {
    const query: any = {
        teamId,
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
        ],
    };

    if (type) {
        query.type = type;
    }

    return this.find(query).populate("userId", "name email role").sort({ startTime: 1 });
};

// ============================================================================
// VIRTUAL PROPERTIES
// ============================================================================

/**
 * Virtual property for duration in milliseconds
 */
AvailabilitySchema.virtual("durationMs").get(function () {
    return this.duration();
});

/**
 * Virtual property for duration in hours
 */
AvailabilitySchema.virtual("durationHours").get(function () {
    return this.duration() / (1000 * 60 * 60);
});

// ============================================================================
// MODEL EXPORT
// ============================================================================

const Availability = mongoose.model<IAvailability, IAvailabilityModel>(
    "Availability",
    AvailabilitySchema
);

export default Availability;