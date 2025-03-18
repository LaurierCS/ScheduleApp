import mongoose from "mongoose";
import bcrypt from "bcrypt";

// user roles
export enum UserRole {
	ADMIN = "admin",
	INTERVIEWER = "interviewer",
	CANDIDATE = "candidate",
}

// user interface
export interface IUser extends mongoose.Document {
	email: string;
	password: string;
	name: string;
	teamId?: mongoose.Types.ObjectId;
	groupIds?: mongoose.Types.ObjectId[];
	role: UserRole;
	profileImage?: string;
	isActive: boolean;
	lastLogin?: Date;
	comparePassword(enteredPassword: string): Promise<boolean>;
}

// user schema
const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters"],
		},
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
		},
		teamId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Team",
			required: false,
		},
		groupIds: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Group",
			},
		],
		role: {
			type: String,
			enum: Object.values(UserRole),
			default: UserRole.ADMIN,
			required: true,
			index: true,
		},
		profileImage: {
			type: String,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		lastLogin: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

// hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// compare password
userSchema.methods.comparePassword = async function (
	enteredPassword: string
): Promise<boolean> {
	return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
