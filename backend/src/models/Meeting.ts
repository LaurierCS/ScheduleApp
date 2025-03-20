import mongoose from "mongoose";

export enum MeetingStatus {
	SCHEDULED = "scheduled",
	CONFIRMED = "confirmed",
	COMPLETED = "completed",
	CANCELLED = "cancelled",
	RESCHEDULED = "rescheduled",
}

export interface IMeeting extends mongoose.Document {
	title: string;
	description?: string;
	startTime: Date;
	endTime: Date;
	interviewerId: mongoose.Types.ObjectId;
	candidateId: mongoose.Types.ObjectId;
	teamId: mongoose.Types.ObjectId;
	location?: string;
	meetingLink?: string;
	status: MeetingStatus;
	notes?: string;
	feedbackId?: mongoose.Types.ObjectId;
	createdBy: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const meetingSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Meeting title is required"],
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		startTime: {
			type: Date,
			required: [true, "Start time is required"],
			index: true,
		},
		endTime: {
			type: Date,
			required: [true, "End time is required"],
		},
		interviewerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Interviewer is required"],
			index: true,
		},
		candidateId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Candidate is required"],
			index: true,
		},
		teamId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Team",
			required: [true, "Team is required"],
			index: true,
		},
		location: {
			type: String,
		},
		meetingLink: {
			type: String,
		},
		status: {
			type: String,
			enum: Object.values(MeetingStatus),
			default: MeetingStatus.SCHEDULED,
			index: true,
		},
		notes: {
			type: String,
		},
		feedbackId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Feedback",
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// to optimize the performance of the queries, we need to create indexes
meetingSchema.index({ teamId: 1, startTime: 1 });
meetingSchema.index({ interviewerId: 1, startTime: 1 });
meetingSchema.index({ candidateId: 1, startTime: 1 });

const Meeting = mongoose.model<IMeeting>("Meeting", meetingSchema);

export default Meeting;
