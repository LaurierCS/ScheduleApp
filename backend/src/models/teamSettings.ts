import mongoose, { Document, Schema } from "mongoose";

/**
 * Email template configuration
 */
export interface IEmailTemplate {
    subject: string;
    body: string;
}

/**
 * Default availability time slot
 */
export interface IDefaultTimeSlot {
    startTime: string; // Format: "HH:mm" (e.g., "09:00")
    endTime: string;   // Format: "HH:mm" (e.g., "17:00")
}

/**
 * Default availability settings for a day
 */
export interface IDefaultAvailability {
    enabled: boolean;
    timeSlots: IDefaultTimeSlot[];
}

/**
 * Interview duration configuration
 */
export interface IInterviewDuration {
    technical: number;      // Duration in minutes
    behavioral: number;     // Duration in minutes
    cultural: number;       // Duration in minutes
    screening: number;      // Duration in minutes
}

/**
 * Group configuration settings
 */
export interface IGroupConfig {
    maxGroupSize: number;
    allowMemberSelfAssign: boolean;
    requireApprovalForGroupJoin: boolean;
}

/**
 * Represents the settings configuration for a Team
 * @property teamId - Reference to the Team these settings belong to
 * @property defaultAvailability - Default availability settings for team members (by day of week)
 * @property emailTemplates - Email template preferences for various notifications
 * @property interviewDurationDefaults - Default durations for different types of interviews
 * @property groupConfig - Configuration options for groups within the team
 * @property createdAt - The date these settings were created
 * @property updatedAt - The date these settings were last updated
 */
export interface ITeamSettings extends Document {
    teamId: Schema.Types.ObjectId;
    defaultAvailability: {
        Monday: IDefaultAvailability;
        Tuesday: IDefaultAvailability;
        Wednesday: IDefaultAvailability;
        Thursday: IDefaultAvailability;
        Friday: IDefaultAvailability;
        Saturday: IDefaultAvailability;
        Sunday: IDefaultAvailability;
    };
    emailTemplates: {
        interviewInvitation: IEmailTemplate;
        interviewReminder: IEmailTemplate;
        interviewCancellation: IEmailTemplate;
        teamInvitation: IEmailTemplate;
    };
    interviewDurationDefaults: IInterviewDuration;
    groupConfig: IGroupConfig;
    createdAt: Date;
    updatedAt: Date;
}

// Sub-schemas for nested objects
const DefaultTimeSlotSchema: Schema = new Schema(
    {
        startTime: {
            type: String,
            required: [true, "Start time is required"],
            validate: {
                validator: function(v: string) {
                    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: "Start time must be in HH:mm format"
            }
        },
        endTime: {
            type: String,
            required: [true, "End time is required"],
            validate: {
                validator: function(v: string) {
                    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: "End time must be in HH:mm format"
            }
        },
    },
    { _id: false }
);

const DefaultAvailabilitySchema: Schema = new Schema(
    {
        enabled: {
            type: Boolean,
            default: false,
        },
        timeSlots: {
            type: [DefaultTimeSlotSchema],
            default: [],
        },
    },
    { _id: false }
);

const EmailTemplateSchema: Schema = new Schema(
    {
        subject: {
            type: String,
            default: "",
        },
        body: {
            type: String,
            default: "",
        },
    },
    { _id: false }
);

const InterviewDurationSchema: Schema = new Schema(
    {
        technical: {
            type: Number,
            default: 60,
            min: [15, "Interview duration must be at least 15 minutes"],
            max: [480, "Interview duration cannot exceed 8 hours (480 minutes)"],
        },
        behavioral: {
            type: Number,
            default: 45,
            min: [15, "Interview duration must be at least 15 minutes"],
            max: [480, "Interview duration cannot exceed 8 hours (480 minutes)"],
        },
        cultural: {
            type: Number,
            default: 30,
            min: [15, "Interview duration must be at least 15 minutes"],
            max: [480, "Interview duration cannot exceed 8 hours (480 minutes)"],
        },
        screening: {
            type: Number,
            default: 30,
            min: [15, "Interview duration must be at least 15 minutes"],
            max: [480, "Interview duration cannot exceed 8 hours (480 minutes)"],
        },
    },
    { _id: false }
);

const GroupConfigSchema: Schema = new Schema(
    {
        maxGroupSize: {
            type: Number,
            default: 50,
            min: [1, "Maximum group size must be at least 1"],
            max: [1000, "Maximum group size cannot exceed 1000"],
        },
        allowMemberSelfAssign: {
            type: Boolean,
            default: false,
        },
        requireApprovalForGroupJoin: {
            type: Boolean,
            default: true,
        },
    },
    { _id: false }
);

// Main TeamSettings Schema
const TeamSettingsSchema: Schema = new Schema(
    {
        teamId: {
            type: Schema.Types.ObjectId,
            ref: 'Team',
            required: [true, "Team ID is required"],
            unique: true, // One settings document per team
        },
        defaultAvailability: {
            Monday: {
                type: DefaultAvailabilitySchema,
                default: () => ({ enabled: false, timeSlots: [] }),
            },
            Tuesday: {
                type: DefaultAvailabilitySchema,
                default: () => ({ enabled: false, timeSlots: [] }),
            },
            Wednesday: {
                type: DefaultAvailabilitySchema,
                default: () => ({ enabled: false, timeSlots: [] }),
            },
            Thursday: {
                type: DefaultAvailabilitySchema,
                default: () => ({ enabled: false, timeSlots: [] }),
            },
            Friday: {
                type: DefaultAvailabilitySchema,
                default: () => ({ enabled: false, timeSlots: [] }),
            },
            Saturday: {
                type: DefaultAvailabilitySchema,
                default: () => ({ enabled: false, timeSlots: [] }),
            },
            Sunday: {
                type: DefaultAvailabilitySchema,
                default: () => ({ enabled: false, timeSlots: [] }),
            },
        },
        emailTemplates: {
            interviewInvitation: {
                type: EmailTemplateSchema,
                default: () => ({
                    subject: "Interview Invitation - {{candidateName}}",
                    body: "Dear {{candidateName}},\n\nYou have been invited to an interview.\n\nBest regards,\n{{teamName}}"
                }),
            },
            interviewReminder: {
                type: EmailTemplateSchema,
                default: () => ({
                    subject: "Interview Reminder - {{candidateName}}",
                    body: "Dear {{candidateName}},\n\nThis is a reminder about your upcoming interview.\n\nBest regards,\n{{teamName}}"
                }),
            },
            interviewCancellation: {
                type: EmailTemplateSchema,
                default: () => ({
                    subject: "Interview Cancellation - {{candidateName}}",
                    body: "Dear {{candidateName}},\n\nYour interview has been cancelled.\n\nBest regards,\n{{teamName}}"
                }),
            },
            teamInvitation: {
                type: EmailTemplateSchema,
                default: () => ({
                    subject: "Team Invitation - {{teamName}}",
                    body: "You have been invited to join {{teamName}}.\n\nBest regards,\n{{adminName}}"
                }),
            },
        },
        interviewDurationDefaults: {
            type: InterviewDurationSchema,
            default: () => ({
                technical: 60,
                behavioral: 45,
                cultural: 30,
                screening: 30,
            }),
        },
        groupConfig: {
            type: GroupConfigSchema,
            default: () => ({
                maxGroupSize: 50,
                allowMemberSelfAssign: false,
                requireApprovalForGroupJoin: true,
            }),
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
TeamSettingsSchema.index({ teamId: 1 });

const TeamSettings = mongoose.model<ITeamSettings>("TeamSettings", TeamSettingsSchema);

export default TeamSettings;
