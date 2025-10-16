import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    teamId?: Schema.Types.ObjectId;
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
            match: [/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/, "Invalid email address"]
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
        groupIds: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: ""
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

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
