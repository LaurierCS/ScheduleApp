import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import Availability, { AvailabilityType } from '../../models/availability';
import { BulkAvailabilitySchema } from '../../validators/availabilityValidators';

/**
 * @route   POST /api/availability/bulk
 * @desc    Create multiple availability slots in one request
 * @access  Private (Interviewer and Candidate)
 * @permissions Only the authenticated user may create their own slots
 * @body    Array of availability payloads (same as single-create)
 *
 * Bulk behaviour: each item is validated independently.  Valid entries are
 * inserted; invalid entries are reported back.  The endpoint returns 201 if
 * at least one slot succeeded, otherwise 400.
 */
export async function bulkCreateAvailability(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const payload = req.body;
        if (!Array.isArray(payload)) {
            return ApiResponseUtil.error(res, 'Request body must be an array', 400);
        }

        const userId = (req.user as any)._id;
        const results: { created: any[]; errors: any[] } = { created: [], errors: [] };

        // iterate over each slot and attempt creation independently
        for (const [index, item] of payload.entries()) {
            // validate each item separately
            const single = await BulkAvailabilitySchema.element.safeParseAsync(item as any).catch(() => ({ success: false } as any));
            if (!single.success) {
                results.errors.push({
                    index,
                    error: single.error ? single.error.issues.map((i: any) => i.message).join(', ') : 'Invalid format',
                    item,
                });
                continue;
            }
            try {
                const data = single.data;
                // optional teamId check (similar to single create)
                if (data.teamId) {
                    if (!mongoose.Types.ObjectId.isValid(data.teamId)) {
                        throw new Error('Invalid team ID');
                    }
                    const userTeamId = req.user.teamId?.toString();
                    if (userTeamId !== data.teamId) {
                        throw new Error('You can only create availability for your own team');
                    }
                }

                const hasConflict = await Availability.hasConflict(
                    userId,
                    new Date(data.startTime),
                    new Date(data.endTime)
                );
                if (hasConflict && data.type === AvailabilityType.AVAILABLE) {
                    throw new Error('This time slot conflicts with an existing unavailable period');
                }

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

                results.created.push(availability);
            } catch (err: any) {
                results.errors.push({
                    index,
                    error: err.message || 'Unknown error',
                    item,
                });
            }
        }

        const status = results.created.length > 0 ? 201 : 400;
        ApiResponseUtil.success(res, results, 'Bulk availability processed', status);
    } catch (error) {
        next(error);
    }
}
