import mongoose, { Document, Schema } from "mongoose";

// Group type enum for categorizing groups
export enum GroupType {
    INTERVIEWER = "interviewer",
    CANDIDATE = "candidate",
    BOTH = "both",
}

/**
 * Group-specific settings interface
 */
export interface IGroupSettings {
    availabilityOverride: boolean;
    priority: number;
}

/**
 * Represents a Group of Interviewers and Candidates
 * @property name - the name of the group (unique per team)
 * @property description - optional description of the group
 * @property type - the type of group (interviewer, candidate, or both)
 * @property members - an array of references to Users (interviewers/admins)
 * @property candidates - an array of references to Users (candidates)
 * @property teamId - a reference to the Team for which this group is for
 * @property createdBy - a reference to the User who created the group
 * @property settings - group-specific settings
 * @property createdAt - the Date of creation
 * @property updatedAt - the last time this was updated
 */
export interface IGroup extends Document {
    name: string;
    description?: string;
    type: GroupType;
    members: Schema.Types.ObjectId[];
    candidates: Schema.Types.ObjectId[];
    teamId: Schema.Types.ObjectId;
    createdBy: Schema.Types.ObjectId;
    settings: IGroupSettings;
    createdAt: Date;
    updatedAt: Date;
}

// Sub-schema for group settings (embedded object)
const GroupSettingsSchema: Schema = new Schema(
    {
        availabilityOverride: {
            type: Boolean,
            default: false,
        },
        priority: {
            type: Number,
            default: 0,
            min: [0, "Priority cannot be negative"],
        },
    },
    { _id: false }
);

const GroupSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, "A group name is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            enum: Object.values(GroupType),
            required: true,
            default: GroupType.BOTH,
        },
        members: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            required: true,
            default: [],
        },
        candidates: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            required: true,
            default: [],
        },
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: [true, "A team reference is required"],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "The creator of the group must be specified"],
        },
        settings: {
            type: GroupSettingsSchema,
            default: () => ({
                availabilityOverride: false,
                priority: 0,
            }),
        },
    },
    {
        timestamps: true,
    },
);

// Compound unique index: group names must be unique within a team
GroupSchema.index({ name: 1, teamId: 1 }, { unique: true });

const Group = mongoose.model<IGroup>("Group", GroupSchema);

export default Group;
