import { Schema } from "mongoose";
import User, { IUser } from "./user";
import { AvailabilitySchema, IAvailability } from "./availability";

/**
 * Represents a User with a Candidate role
 * @property availability - An array of availabilities for interviews
 */
export interface ICandidate extends IUser {
    availability: IAvailability[]
}

const CandidateSchema: Schema = new Schema(
    {
        availability: {
            type: [AvailabilitySchema],
            default: []
        }
    }
)

const Candidate = User.discriminator<ICandidate>("Candidate", CandidateSchema);

export default Candidate;