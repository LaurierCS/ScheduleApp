import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import Availability, { AvailabilityType } from '../../models/availability';
import mongoose from 'mongoose';
import { CreateAvailabilitySchema } from '../../validators/availabilityValidators';

/**
 * @route   POST /api/availability
 * @desc    Create user availability
 * @access  Private (Interviewer and Candidate)
 * @permissions Only Interviewers and Candidates can submit their availability
 * @body    {teamId?, startTime, endTime, type?, recurring?, recurrencePattern?, timezone?}
 */
export async function createAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        // Validate request body
        const validationResult = CreateAvailabilitySchema.safeParse(req.body);

        if (!validationResult.success) {
            return ApiResponseUtil.error(
                res,
                `Validation error: ${validationResult.error.issues.map((e: any) => e.message).join(', ')}`,
                400
            );
        }

        const data = validationResult.data;
        const userId = (req.user as any)._id;

        // If teamId is provided, verify user has access to that team
        if (data.teamId) {
            if (!mongoose.Types.ObjectId.isValid(data.teamId)) {
                return ApiResponseUtil.error(res, 'Invalid team ID', 400);
            }

            const userTeamId = req.user.teamId?.toString();
            if (userTeamId !== data.teamId) {
                return ApiResponseUtil.error(res, 'You can only create availability for your own team', 403);
            }
        }

        // Check for conflicts with existing unavailable slots
        const hasConflict = await Availability.hasConflict(
            userId,
            new Date(data.startTime),
            new Date(data.endTime)
        );

        if (hasConflict && data.type === AvailabilityType.AVAILABLE) {
            return ApiResponseUtil.error(
                res,
                'This time slot conflicts with an existing unavailable period',
                409
            );
        }

        // Create the availability
        const availability = await Availability.create({
            userId,
            teamId: data.teamId ? new mongoose.Types.ObjectId(data.teamId) : undefined,
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
            type: data.type || AvailabilityType.AVAILABLE,
            recurring: data.recurring || false,
            recurrencePattern: data.recurrencePattern,
            timezone: data.timezone || 'UTC',
        });

        ApiResponseUtil.success(res, availability, 'Availability created successfully', 201);
    } catch (error) {
        next(error);
    }
}
