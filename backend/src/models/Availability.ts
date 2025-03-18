import mongoose from "mongoose";

// Time slot interface
export interface ITimeSlot {
	startTime: Date;
	endTime: Date;
}

// Availability interface
export interface IAvailability extends mongoose.Document {
	userId: mongoose.Types.ObjectId;
	date: Date;
	timeSlots: ITimeSlot[];
	recurring: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Time slot schema
const timeSlotSchema = new mongoose.Schema(
	{
		startTime: {
			type: Date,
			required: true,
		},
		endTime: {
			type: Date,
			required: true,
		},
	},
	{ _id: false }
);

// Availability schema
const availabilitySchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		date: {
			type: Date,
			required: true,
		},
		timeSlots: [timeSlotSchema],
		recurring: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

// Index for userId and date
availabilitySchema.index({ userId: 1, date: 1 });

const Availability = mongoose.model<IAvailability>(
	"Availability",
	availabilitySchema
);

export default Availability;
