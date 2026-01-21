// models/Invite.ts
import mongoose, { Document, Schema } from "mongoose";
import { UserRole } from "./user";

/**
 * Represents an invitation code for user registration
 * @property code - Unique invite code (generated)
 * @property email - Optional email the invite is locked to
 * @property role - Role to assign when invite is used
 * @property createdBy - Admin who created the invite
 * @property expiresAt - When the invite expires
 * @property usedAt - When the invite was used
 * @property usedBy - User who used the invite
 * @property isActive - Whether the invite can still be used
 */
export interface IInvite extends Document {
  _id: mongoose.Types.ObjectId; 
  code: string;
  email?: string;
  role: UserRole;
  createdBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  usedAt?: Date;
  usedBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InviteSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: [true, "Invite code is required"],
      unique: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, "Role is required"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
    usedAt: {
      type: Date,
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

// Index for finding valid invites quickly
InviteSchema.index({ code: 1, isActive: 1 });
InviteSchema.index({ createdBy: 1 });

const Invite = mongoose.model<IInvite>("Invite", InviteSchema);

export default Invite;