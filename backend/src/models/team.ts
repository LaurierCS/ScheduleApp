// models/Team.ts
import mongoose, { Schema, Types, Document, Model } from "mongoose";

const USER_MODEL_NAME = "User";
const CANDIDATE_MODEL_NAME = "Candidate";
const GROUP_MODEL_NAME = "Group";

/** ----- Types ----- */
export interface IGroupDefinition {
  name: string;
  description?: string;
  tags?: string[];
  members?: Types.ObjectId[];
  candidates?: Types.ObjectId[];
}

export type IGroupItem =
  | { ref: Types.ObjectId; def?: never }
  | { ref?: never; def: IGroupDefinition };

export interface ITeam extends Document {
  name: string;
  admin: Types.ObjectId;
  description?: string;
  members: Types.ObjectId[];
  candidates: Types.ObjectId[]; // refs Candidate
  groups: IGroupItem[];
  createdAt: Date;
  updatedAt: Date;
}

/** ----- Schemas ----- */

// Embedded group (team-local) definition
const GroupDefinitionSchema = new Schema<IGroupDefinition>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    members: [
      { type: Schema.Types.ObjectId, ref: USER_MODEL_NAME, index: true },
    ],
    candidates: [
      { type: Schema.Types.ObjectId, ref: CANDIDATE_MODEL_NAME, index: true },
    ],
  },
  { _id: false }
);
const GroupItemSchema = new Schema<IGroupItem>(
  {
    ref: { type: Schema.Types.ObjectId, ref: GROUP_MODEL_NAME },
    def: { type: GroupDefinitionSchema },
  },
  { _id: false }
);

GroupItemSchema.pre("validate", function (next) {
  const hasRef = !!this.get("ref");
  const hasDef = !!this.get("def");
  if (hasRef === hasDef) {
    return next(
      new Error("Each group item must have exactly one of: {ref} or {def}.")
    );
  }
  next();
});

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true, index: true },
    admin: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: true,
      index: true,
    },
    description: { type: String, trim: true },

    members: [
      { type: Schema.Types.ObjectId, ref: USER_MODEL_NAME, index: true },
    ],

    candidates: [
      { type: Schema.Types.ObjectId, ref: CANDIDATE_MODEL_NAME, index: true },
    ],

    groups: { type: [GroupItemSchema], default: [] },
  },
  { timestamps: true }
);

TeamSchema.index({ admin: 1, name: 1 }, { unique: true });

/** prevent the admin from being duplicated in members */
TeamSchema.pre("save", function (next) {
  if (this.members?.length) {
    this.members = Array.from(
      new Set(this.members.map((id) => id.toString()))
    ).map((id) => new Types.ObjectId(id));
    this.members = this.members.filter(
      (id) => id.toString() !== this.admin.toString()
    );
  }
  next();
});

export const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);
export { GroupDefinitionSchema };
