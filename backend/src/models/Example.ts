import mongoose from 'mongoose';

// example interface
export interface IExample extends mongoose.Document {
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// example schema
const exampleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
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

const Example = mongoose.model<IExample>('Example', exampleSchema);

export default Example; 