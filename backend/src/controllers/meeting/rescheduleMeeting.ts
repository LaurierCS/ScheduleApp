import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import Meeting from '../../models/meeting';

/**
 * @route   POST /api/meetings/:id/reschedule
 * @desc    Request rescheduling for a meeting
 * @access  Private (Meeting Participants)
 * @permissions Only meeting participants can request rescheduling
 */
export async function rescheduleMeeting(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return ApiResponseUtil.error(res, 'Meeting not found', 404);
        }

        const currentUserId = (req.user as any)._id.toString();
        const participantIds = [
            ...meeting.interviewerIds.map(id => id.toString()),
            meeting.candidateId.toString()
        ];

        // Verify user is a participant
        if (!participantIds.includes(currentUserId)) {
            return ApiResponseUtil.error(res, 'Access denied: you are not a participant in this meeting', 403);
        }

        // TODO: Implement meeting rescheduling
        // - Validate new time slot from request body
        // - Update meeting status to RESCHEDULED
        // - Notify other participants
        // - Return updated meeting
        ApiResponseUtil.success(res, null, `Reschedule meeting ${req.params.id}`);
    } catch (error) {
        next(error);
    }
}
