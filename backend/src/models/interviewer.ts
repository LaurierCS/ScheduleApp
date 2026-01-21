import User, { IUser } from "./user";
import mongoose, { Document, Schema } from "mongoose";

// The range of statuses an interviewer can hold
export enum InterviewerStatus {
    PENDING = "pending",
    ACTIVE = "active",
    INACTIVE = "inactive",
}

/**
 * Represents a user with the Interviewer role
 * @property status - Interviewer's current status
 * @property capacity - Maximum interviews per day and per week
 * @property skills - Array of expertise/skill tags
 */
export interface IInterviewer extends IUser {
    status: InterviewerStatus;
    capacity: {
        maxPerDay: number;
        maxPerWeek: number;
    };
    skills: string[];
}

const InterviewerSchema: Schema = new Schema(
    {
        status: {
            type: String,
            enum: Object.values(InterviewerStatus),
            default: InterviewerStatus.PENDING,
        },
        capacity: {
            maxPerDay: {
                type: Number,
                required: false,
                default: 10,
            },
            maxPerWeek: {
                type: Number,
                required: false,
                default: 40,
            },
        },
        skills: {
            type: [String],
            required: false,
            default: [],
        }
    }
)

// Partial index on status scoped only to this discriminator for querying with status as a filter
InterviewerSchema.index(
    { status: 1 },
    { partialFilterExpression: { role: 'interviewer' } }
)


const Interviewer = User.discriminator<IInterviewer>('interviewer', InterviewerSchema);

export default Interviewer;
