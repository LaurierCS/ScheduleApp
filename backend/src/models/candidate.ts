import User, { IUser } from "./user";
import mongoose, { Document, Schema } from "mongoose";

// The range of statuses a candidate can hold
export enum CandidateStatus {
    PENDING = "pending",
    ACTIVE = "active",
    COMPLETED = "completed",
    DECLINED = "declined",
}

/**
 * Represents a user with the Candidate role
 * @property status - Candidate's current status for interviews
 * @property resumeUrl - URL to the candidate's uploaded resume
 * @property year - The year that the candidate is in
 * @property program - The program the candidate is enrolled in
 */
export interface ICandidate extends IUser {
    status: CandidateStatus;
    resumeUrl?: string,
    year?: Number,
    program?: string,
}

const CandidateSchema: Schema = new Schema(
    {
        status: {
            type: String,
            enum: Object.values(CandidateStatus),
            default: CandidateStatus.PENDING,
        },
        resumeUrl: {
            type: String,
            required: false,
        },
        year: {
            type: Number,
            required: false,
            min: [1, 'Must be at least 1, got {VALUE}'],
            validate: {
                validator: Number.isInteger,
                message: 'Must be an integer, got {VALUE}'
            },
        },
        program: {
            type: String,
            required: false,
            default: "",
        }
    }
)

// Partial index on status scoped only to this discriminator for querying with status as a filter
CandidateSchema.index(
    { status: 1 },
    { partialFilterExpression: { role: 'candidate' } }
)


const Candidate = User.discriminator<ICandidate>('candidate', CandidateSchema);

export default Candidate;