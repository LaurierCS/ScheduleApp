import mongoose from "mongoose";
import { UserRole } from "./User";

// Profile interface
export interface IProfile extends mongoose.Document {
	userId: mongoose.Types.ObjectId;
	role: UserRole; // INTERVIEWER or CANDIDATE
	bio?: string;
	skills?: string[];
	jobTitle?: string;
	yearsOfExperience?: number;
	department?: string;
	specialization?: string;
	education?: string;
	preferredTimeZone?: string;
	contactNumber?: string;
	notes?: string;
	status: string; // active, inactive, pending, etc.
	createdAt: Date;
	updatedAt: Date;
}

// Profile schema
const profileSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
			unique: true,
			index: true,
		},
		role: {
			type: String,
			enum: [UserRole.INTERVIEWER, UserRole.CANDIDATE],
			required: [true, "Role is required"],
			index: true,
		},
		bio: {
			type: String,
			trim: true,
		},
		skills: [
			{
				type: String,
				trim: true,
			},
		],
		jobTitle: {
			type: String,
			trim: true,
		},
		yearsOfExperience: {
			type: Number,
			min: 0,
		},
		department: {
			type: String,
			trim: true,
		},
		specialization: {
			type: String,
			trim: true,
		},
		education: {
			type: String,
			trim: true,
		},
		preferredTimeZone: {
			type: String,
			trim: true,
		},
		contactNumber: {
			type: String,
			trim: true,
		},
		notes: {
			type: String,
			trim: true,
		},
		status: {
			type: String,
			enum: ["active", "inactive", "pending", "on_leave"],
			default: "active",
			index: true,
		},
	},
	{
		timestamps: true,
	}
);

// Compound index for efficient querying
profileSchema.index({ role: 1, status: 1 });
profileSchema.index({ skills: 1 }); // For searching profiles by skills

const Profile = mongoose.model<IProfile>("Profile", profileSchema);

export default Profile;
