import mongoose, { Document, Schema } from "mongoose";

export interface ITimeSlot {
    startTime: Date,
    endTime: Date,
}

export enum DayOfTheWeek {
    MON = "Monday",
    TUE = "Tuesday",
    WED = "Wednesday",
    THU = "Thursday",
    FRI = "Friday",
    SAT = "Saturday",
    SUN = "Sunday",
}

/**
 * Represents the times of availability for a specific user on a given day of the week.
 * @property userId - the user that defined this availability
 * @property timeslots - the sections of the day where this User is available
 * @property dayOfWeek - the day of the week that the availability pertains to
 * @property isRecurring - whether the specified availability is recurring
 * @property createdAt - the date this Availability was created
 * @property updatedAt - the date this Availability was last updated
 */
export interface IAvailability extends Document {
    userId: Schema.Types.ObjectId,
    timeslots: ITimeSlot[],
    dayOfWeek: DayOfTheWeek,
    isRecurring: boolean,
    createdAt: Date,
    updatedAt: Date,
}

export const TimeSlotSchema: Schema = new Schema(
    {
        startTime: {
            type: Date,
            required: [true, "A start time is required"],
        },
        endTime: {
            type: Date,
            required: [true, "An end time is required"],
        },
    }
)

export const AvailabilitySchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: [true, "User ID is required"],
        },
        timeslots: {
            type: [TimeSlotSchema],
            required: true,
            default: []
        },
        dayOfWeek: {
            type: Object.values(DayOfTheWeek),
            required: [true, "A day of the week must be specified"],
        },
        isRecurring: {
            type: Boolean,
            required: true,
            default: false,
        }
    },
    {
        timestamps: true,
    },
);

const Availability = mongoose.model<IAvailability>("Availability", AvailabilitySchema);

export default Availability;