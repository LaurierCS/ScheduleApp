import mongoose, { Schema } from 'mongoose';

export interface emailEvent extends mongoose.Document {
  emailid: string;
  userid: mongoose.Types.ObjectId;
  type: string;
  metadata: Record <string, any>;
  timestamp: Date;
}

const emailEventSchema = new mongoose.Schema(
  {
    emailid: {
      type: String,
      required: true,
      unique: true,
    },
    userid: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    metadata: {
        type: Schema.Types.Mixed, 
        default: {} ,    
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
    }
  },
);

const emailEvent = mongoose.model<emailEvent>('EmailEvent', emailEventSchema);

export default emailEvent; 