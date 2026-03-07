import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import Availability, { AvailabilityType } from '../../models/availability';
import mongoose from 'mongoose';
import { CreateAvailabilitySchema } from '../../validators/availabilityValidators';

/**
 * POST /api/availability/bulk
 * Bulk create availability slots for the authenticated user
 */
export async function createAvailabilityBulk(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) return next(new Error('Authentication required'));

        const userId = (req.user as any)._id;
        const payload = req.body;

        if (!Array.isArray(payload)) {
            return ApiResponseUtil.error(res, 'Request body must be an array of availability objects', 400);
        }

        const failures: any[] = [];
        const toInsert: any[] = [];

        for (let i = 0; i < payload.length; i++) {
            const item = payload[i];
            const validation = CreateAvailabilitySchema.safeParse(item);

            if (!validation.success) {
                failures.push({ index: i, reason: validation.error.issues.map((s: any) => s.message).join(', ') });
                continue;
            }

            const data = validation.data;

            // teamId validation
            if (data.teamId) {
                if (!mongoose.Types.ObjectId.isValid(data.teamId)) {
                    failures.push({ index: i, reason: 'Invalid team ID' });
                    continue;
                }

                const userTeamId = req.user.teamId?.toString();
                if (userTeamId !== data.teamId) {
                    failures.push({ index: i, reason: 'You can only create availability for your own team' });
                    continue;
                }
            }

            const start = new Date(data.startTime);
            const end = new Date(data.endTime);

            // Conflict check for 'available' slots
            const hasConflict = await Availability.hasConflict(userId, start, end);
            if (hasConflict && data.type === AvailabilityType.AVAILABLE) {
                failures.push({ index: i, reason: 'This time slot conflicts with an existing unavailable period' });
                continue;
            }

            toInsert.push({
                userId,
                teamId: data.teamId ? new mongoose.Types.ObjectId(data.teamId) : undefined,
                startTime: start,
                endTime: end,
                type: data.type || AvailabilityType.AVAILABLE,
                recurring: data.recurring || false,
                recurrencePattern: data.recurrencePattern,
                timezone: data.timezone || 'UTC',
            });
        }

        let inserted: any[] = [];
        if (toInsert.length > 0) {
            // Use insertMany for efficiency; ordered:false allows partial success
            inserted = await Availability.insertMany(toInsert, { ordered: false });
        }

        ApiResponseUtil.success(res, {
            insertedCount: inserted.length,
            insertedIds: inserted.map(i => i._id),
            failures,
        }, 'Bulk availability processed successfully', 201);
    } catch (error) {
        next(error);
    }
}
