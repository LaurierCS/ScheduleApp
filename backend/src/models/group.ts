import mongoose, { Document, Schema } from "mongoose";

/**
 * Represents a Group of Interviewers and Candidates
 * @property name - the name of the group
 * @property members - an array of references to some Users
 * @property teamId - a reference to the Team for which this group is for
 * @property createdBy - a reference to the User who created the group
 * @property createdAt - the Date of creation
 * @property updatedAt - the last time this was updated
 */
export interface IGroup extends Document {
    name: string,
    members: Schema.Types.ObjectId[],
    teamId: Schema.Types.ObjectId,
    createdBy: Schema.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date
}

const GroupSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, "A group name is required"],
            trim: true,
        },
        members: {
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
    },
    {
        timestamps: true,
    },
);

const Group = mongoose.model<IGroup>("Group", GroupSchema);

export default Group;