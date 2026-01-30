import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { PermissionChecker } from '../../utils/permissions';
import Availability, { AvailabilityType } from '../../models/availability';
import mongoose from 'mongoose';
import { UpdateAvailabilitySchema } from '../../validators/availabilityValidators';

/**
 * @route   PUT /api/availability/:id
 * @desc    Update availability by ID
 * @access  Private (Owner only)
 * @permissions Only the availability owner can update it
 * @body    {teamId?, startTime?, endTime?, type?, recurring?, recurrencePattern?, timezone?}
 */
export async function updateAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const availability = await Availability.findById(req.params.id);

        if (!availability) {
            return ApiResponseUtil.error(res, 'Availability not found', 404);
        }

        const availabilityOwnerId = availability.userId.toString();

        // Use PermissionChecker to verify ownership
        PermissionChecker.requireOwnership(req, availabilityOwnerId);

        // Validate request body
        const validationResult = UpdateAvailabilitySchema.safeParse(req.body);

        if (!validationResult.success) {
            return ApiResponseUtil.error(
                res,
                `Validation error: ${validationResult.error.issues.map((e: any) => e.message).join(', ')}`,
                400
            );
        }

        const data = validationResult.data;

        // If updating teamId, verify user has access to that team
        if (data.teamId) {
            if (!mongoose.Types.ObjectId.isValid(data.teamId)) {
                return ApiResponseUtil.error(res, 'Invalid team ID', 400);
            }

            const userTeamId = req.user.teamId?.toString();
            if (userTeamId !== data.teamId) {
                return ApiResponseUtil.error(res, 'You can only set availability for your own team', 403);
            }
        }

        // Check if new time range creates conflicts (exclude current availability)
        if (data.startTime || data.endTime) {
            const newStartTime = data.startTime ? new Date(data.startTime) : availability.startTime;
            const newEndTime = data.endTime ? new Date(data.endTime) : availability.endTime;

            if (newEndTime <= newStartTime) {
                return ApiResponseUtil.error(res, 'End time must be after start time', 400);
            }

            const hasConflict = await Availability.hasConflict(
                availability.userId,
                newStartTime,
                newEndTime,
                availability._id as any
            );

            if (hasConflict && (data.type === AvailabilityType.AVAILABLE || availability.type === AvailabilityType.AVAILABLE)) {
                return ApiResponseUtil.error(
                    res,
                    'Updated time slot conflicts with an existing unavailable period',
                    409
                );
            }
        }

        // Update fields
        if (data.teamId !== undefined) availability.teamId = data.teamId as any;
        if (data.startTime !== undefined) availability.startTime = new Date(data.startTime);
        if (data.endTime !== undefined) availability.endTime = new Date(data.endTime);
        if (data.type !== undefined) availability.type = data.type;
        if (data.recurring !== undefined) availability.recurring = data.recurring;
        if (data.recurrencePattern !== undefined) availability.recurrencePattern = data.recurrencePattern as any;
        if (data.timezone !== undefined) availability.timezone = data.timezone;

        await availability.save();

        ApiResponseUtil.success(res, availability, 'Availability updated successfully');
    } catch (error) {
        next(error);
    }
}
