import mongoose from "mongoose";

// different rating options
export enum Rating {
	VERY_POOR = 1,
	POOR = 2,
	AVERAGE = 3,
	GOOD = 4,
	EXCELLENT = 5,
}

// feedback interface
export interface IFeedback extends mongoose.Document {
	meetingId: mongoose.Types.ObjectId;
	submittedBy: mongoose.Types.ObjectId;
	rating: Rating;
	comments: string;
	strengths?: string[];
	improvements?: string[];
	recommendation: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// feedback schema
const feedbackSchema = new mongoose.Schema(
	{
		meetingId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Meeting",
			required: [true, "Meeting ID is required"],
			index: true,
		},
		submittedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
		},
		rating: {
			type: Number,
			enum: Object.values(Rating),
			required: [true, "Rating is required"],
		},
		comments: {
			type: String,
			required: [true, "Feedback comments are required"],
		},
		strengths: [
			{
				type: String,
			},
		],
		improvements: [
			{
				type: String,
			},
		],
		recommendation: {
			type: Boolean,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Feedback = mongoose.model<IFeedback>("Feedback", feedbackSchema);

export default Feedback;
