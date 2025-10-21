import mongoose, { Schema} from "mongoose";
import User, { IUser } from "./user";
import { AvailabilitySchema, IAvailability } from "./availability";

/**
 * Represents a User with an Interviewer role
 * @property availability - An array of availabilities for interviews
 */
export interface IInterviewer extends IUser {
    availability: IAvailability[]
}

const InterviewerSchema: Schema = new Schema(
    {
        availability: {
            type: [AvailabilitySchema],
            default: []
        }
    }
)

const Interviewer = User.discriminator<IInterviewer>("Interviewer", InterviewerSchema);

export default Interviewer;