import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { PermissionChecker } from '../../utils/permissions';
import Meeting from '../../models/meeting';

/**
 * @route   GET /api/meetings/team/:teamId
 * @desc    Get all meetings for a specific team
 * @access  Private (Team Members)
 * @permissions Team members can view their team's meetings
 */
export async function getTeamMeetings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, req.params.teamId);

        const meetings = await Meeting.find({ teamId: req.params.teamId });
        ApiResponseUtil.success(res, meetings, 'Team meetings retrieved successfully');
    } catch (error) {
        next(error);
    }
}
