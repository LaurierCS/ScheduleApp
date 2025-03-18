import mongoose from "mongoose";

// Team interface
export interface ITeam extends mongoose.Document {
	name: string;
	description?: string;
	adminId: mongoose.Types.ObjectId;
	logo?: string;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Team schema
const teamSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Team name is required"],
			trim: true,
			index: true,
		},
		description: {
			type: String,
			trim: true,
		},
		adminId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Team admin is required"],
			index: true,
		},
		logo: {
			type: String,
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


const Team = mongoose.model<ITeam>("Team", teamSchema);

export default Team;
