import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { PermissionChecker } from '../../utils/permissions';
import Meeting from '../../models/meeting';

/**
 * @route   GET /api/meetings/:id
 * @desc    Get meeting by ID
 * @access  Private (Admin and Participants)
 * @permissions Admins and meeting participants can view meeting details
 */
export async function getMeetingById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return ApiResponseUtil.error(res, 'Meeting not found', 404);
        }

        // Extract participant IDs (interviewers + candidate)
        const participantIds = [
            ...meeting.interviewerIds.map(id => id.toString()),
            meeting.candidateId.toString()
        ];
        const meetingTeamId = meeting.teamId?.toString();

        // Use PermissionChecker to verify meeting access
        PermissionChecker.requireMeetingAccess(req, participantIds, meetingTeamId);

        ApiResponseUtil.success(res, meeting, 'Meeting retrieved successfully');
    } catch (error) {
        next(error);
    }
}
