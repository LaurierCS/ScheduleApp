import mongoose, { Document, Schema, Types } from "mongoose";

export enum MeetingStatus {
    SCHEDULED = "scheduled",
    CONFIRMED = "confirmed",
    RESCHEDULED = "rescheduled",
    CANCELLED = "cancelled"
}
/**
 * Represents a Meeting instance for a specific Candidate
 * @property title - the title of the meeting
 * @property description - a description of the meeting's purpose
 * @property startTime - the scheduled start time of the meeting
 * @property endTime - the scheduled end time of the meeting
 * @property interviewerIds - an array of the ids of the assigned interviewers
 * @property candidateId - the id of the Candidate
 * @property teamId - the Team of which this meeting is held by
 * @property status - the status of the meeting
 * @property link - the link to the online meeting
 * @property createdBy - a reference to the User who created the meeting
 * @property createdAt - the time this Meeting was created
 * @property updatedAt - the last time this Meeting was updated
 */
export interface IMeeting extends Document {
    title: string,
    description?: string,
    startTime: Date,
    endTime: Date,
    interviewerIds: Schema.Types.ObjectId[],
    candidateId: Schema.Types.ObjectId,
    teamId: Schema.Types.ObjectId,
    status: MeetingStatus,
    link?: string,
    createdBy: Schema.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
}

const MeetingSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Meeting title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: false
        },
        startTime: {
            type: Date,
            required: [true, "A start time is required"],
        },
        endTime: {
            type: Date,
            required: [true, "An end time is required"],
        },
        interviewerIds: {
            type: [Schema.Types.ObjectId],
            ref: "Interviewer",
            required: true,
            validate: {
                validator: (arr: Schema.Types.ObjectId[]) => arr.length > 0,
                message: "At least one interviewer is required"
            }
        },
        candidateId: {
            type: Schema.Types.ObjectId,
            ref: "Candidate",
            required: true,
        },
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },
        status: {
            type: Object.values(MeetingStatus),
            default: MeetingStatus.SCHEDULED,
        },
        link: {
            type: String,
            required: false
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "The meeting creator must be specified"]
        }
    },
    {
        timestamps: true,
    },
);

MeetingSchema.index({start: 1, end: 1});
MeetingSchema.index({status: 1, createdBy: 1});

const Meeting = mongoose.model<IMeeting>("Meeting", MeetingSchema);

export default Meeting;