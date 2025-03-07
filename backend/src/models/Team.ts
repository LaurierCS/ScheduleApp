import mongoose from 'mongoose';
import { IUser } from './User';

// team interface
export interface ITeam extends mongoose.Document {
  name: string;
  admin: mongoose.Types.ObjectId | IUser;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// team schema
const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'team name is required'],
      trim: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'team admin is required'],
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Team = mongoose.model<ITeam>('Team', teamSchema);

export default Team; 