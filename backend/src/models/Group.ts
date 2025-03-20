import mongoose from "mongoose";

// Group roles
export enum GroupType {
	INTERVIEWER = "interviewer",
	CANDIDATE = "candidate",
}

// Group interface
export interface IGroup extends mongoose.Document {
	name: string;
	teamId: mongoose.Types.ObjectId;
	type: GroupType;
	description?: string;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Group schema
const groupSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Group name is required"],
			trim: true,
		},
		teamId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Team",
			required: [true, "Team ID is required"],
			index: true,
		},
		type: {
			type: String,
			enum: Object.values(GroupType),
			required: [true, "Group type is required"],
			index: true,
		},
		description: {
			type: String,
			trim: true,
		},
		active: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

// Index for teamId and type 
groupSchema.index({ teamId: 1, type: 1 });

const Group = mongoose.model<IGroup>("Group", groupSchema);

export default Group;
