import mongoose, { Document, Schema } from "mongoose";

/**
 * Represents a section of availability
 * @property start - The Date at which the availability begins
 * @property end - The Date at which the availability ends
 */
export interface IAvailability extends Document {
    start: Date,
    end: Date,
}

const AvailabilitySchema: Schema = new Schema(
    {
        start: {
            type: Date,
            required: [true, "A start datetime is required."],
        },
        end: {
            type: Date,
            required: [true, "An end datetime is required."],
        }
    }
)

const Availability = mongoose.model<IAvailability>("Availability", AvailabilitySchema);

export default Availability;