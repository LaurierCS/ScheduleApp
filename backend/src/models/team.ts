import mongoose, { Document, Schema } from "mongoose";

/**
 * Represents a Team in the app
 * @property name - The name of the team
 * @property description - A description of the team
 * @property adminId - The id of the User who is the admin of the team
 * @property isActive - Whether the Team is active or not
 * @property createdAt - the date that the Team was created
 * @property updatedAt - the date the Team was last updated on
 */
export interface ITeam extends Document {
    name: string,
    description?: string,
    adminId: Schema.Types.ObjectId;
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date
}

const TeamSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, "A team name is required."],
            trim: true,
        },
        description: {
            type: String,
            required: false,
        },
        adminId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "A team admin is required."],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
TeamSchema.index({ adminId: 1 });
TeamSchema.index({ name: 1, adminId: 1 }); // Ensure unique team names per admin

const Team = mongoose.model<ITeam>("Team", TeamSchema);

export default Team;