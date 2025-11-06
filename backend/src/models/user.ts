import mongoose, { Document, Schema } from "mongoose";
import bcrypt from 'bcrypt';

// User roles enum for Role-Based Access Control (RBAC)
export enum UserRole {
    ADMIN = "admin",
    CANDIDATE = "candidate",
    INTERVIEWER = "interviewer",
}

/**
 * Represents a User of the app
 * @property _id - Unique identifier for the user
 * @property name - Full name of the user
 * @property email - Email of the user (unique, lowercase, indexed)
 * @property password - The hashed password of the user (bcrypt)
 * @property teamId - The id of the Team this user belongs to
 * @property role - The User's assigned role (admin, candidate, or interviewer)
 * @property groupIds - Array of ids representing the Groups this user belongs to
 * @property profileImage - Optional URL/path to user's profile image
 * @property isActive - Whether the user account is active (for soft deletion)
 * @property lastLogin - The date of this user's last login
 * @property createdAt - The date this user object was created (auto-managed)
 * @property updatedAt - The date this user object was last updated (auto-managed)
 * @property comparePassword - Method to compare entered password with hashed password
 */
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    teamId?: Schema.Types.ObjectId;
    role: UserRole;
    groupIds: Schema.Types.ObjectId[];
    profileImage?: string;
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(enteredPassword: string): Promise<boolean>;
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
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
            match: [/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i, "Invalid email address"]
        },
        password: {
            type: String,
            required: [true, "A password is required."],
            minlength: [6, "Password must be at least 6 characters long."],
        },
        teamId: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: "Team",
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            required: true,
            default: UserRole.CANDIDATE, // Default role for new users
            index: true,
        },
        groupIds: [
            {
                type: Schema.Types.ObjectId,
                ref: "Group"
            }
        ],
        profileImage: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
        }
    },
    {
        timestamps: true            // Automatically adds and updates createdAt and updatedAt
    }
);

// Hash password before saving using bcrypt
// This middleware runs automatically before save() is called
UserSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
});

/**
 * Compare entered password with hashed password in database
 * Used during login to verify user credentials
 * @param enteredPassword - Plain text password entered by user
 * @returns Promise<boolean> - True if passwords match, false otherwise
 */
UserSchema.methods.comparePassword = async function (
    enteredPassword: string
): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Database indexes for query performance optimization
// Compound index on name and email - speeds up user search and lookup queries
UserSchema.index({ name: 1, email: 1 });

// Compound index on role and teamId - critical for RBAC queries
// Optimizes queries like "get all interviewers in a team" or "find all admins"
UserSchema.index({ role: 1, teamId: 1 });

const User = mongoose.model<IUser>("User", UserSchema);

export default User;