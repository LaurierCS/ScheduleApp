import mongoose, { Document, Schema } from "mongoose";

export enum UserRole {
    ADMIN = "admin",
    CANDIDATE = "candidate",
    INTERVIEWER = "interviewer",
}


/**
 * Represents a User of the app
 * @property name - Full name of the user
 * @property email - Email of the user
 * @property password - The hashed password of the user
 * @property teamId - The id of the Team this user belongs to
 * @property role - the Users assigned role
 * @property groupIds - Array of ids representing the Groups this user belongs to
 * @property lastLogin - The date of this user's last login
 * @property createdAt - The date this user object was created
 * @property updatedAt - The date this user object was last updated
 */
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    teamId?: Schema.Types.ObjectId;
    role?: UserRole,
    groupIds: Schema.Types.ObjectId[];
    lastLogin?: Date;
    createdAt: Date;                    // Auto-managed by Mongoose
    updatedAt: Date;                    // Auto-managed by Mongoose
}

const UserSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, "A name is required."],
            trim: true
        },
        email: {
            type: String,
            required: [true, "An email is required."],
            trim: true,
            lowercase: true,
            match: [/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i, "Invalid email address"]
        },
        password: {
            type: String,
            required: [true, "A password is required."],
            minLength: [8, "Password must be at least 8 characters long."],
        },
        teamId: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: "Team",
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            required: false,
            default: UserRole.CANDIDATE, // Default role for new users
        },
        groupIds: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Group"
                }
            ],
            required: true,
            default: []
        },
        lastLogin: {
            type: Date,
            required: false,
        }
    },
    {
        timestamps: true            // Automatically adds and updates createdAt and updatedAt
    }
);

// Database indexes for query performance optimization
// Compound index on name and email - speeds up user search and lookup queries
UserSchema.index({ name: 1, email: 1 });

// Compound index on role and teamId - critical for RBAC queries
// Optimizes queries like "get all interviewers in a team" or "find all admins"
UserSchema.index({ role: 1, teamId: 1 });


const User = mongoose.model<IUser>("User", UserSchema);

export default User;
