import { Response } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';

/**
 * @route   POST /api/meetings
 * @desc    Create a new meeting
 * @access  Private (Admin)
 * @permissions Only admins can create meetings
 */
export function createMeeting(req: AuthRequest, res: Response) {
    // TODO: Implement meeting creation
    // - Validate request body (title, startTime, endTime, interviewerIds, candidateId)
    // - Set teamId to admin's team
    // - Set createdBy to req.user._id
    // - Create meeting in database
    // - Return created meeting
    ApiResponseUtil.success(res, null, 'Create meeting route');
}
