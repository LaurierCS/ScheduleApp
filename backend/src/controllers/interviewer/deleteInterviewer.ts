import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { UserRole } from '../../models/user';
import User from '../../models/user';
import Meeting from '../../models/meeting';
import Availability from '../../models/availability';

/**
 * @route   DELETE /api/interviewers/:id
 * @desc    Delete interviewer by ID
 * @access  Private (Admin in same team)
 * @permissions Only admins can delete interviewers in their team
 */
export async function deleteInterviewer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const interviewer = await User.findById(req.params.id);

        if (!interviewer) {
            return ApiResponseUtil.error(res, 'Interviewer not found', 404);
        }

        // Ensure target user is an interviewer
        if (interviewer.role !== UserRole.INTERVIEWER) {
            return ApiResponseUtil.error(res, 'User is not an interviewer', 400);
        }

        const currentUserTeamId = req.user.teamId?.toString();
        const interviewerTeamId = interviewer.teamId?.toString();

        // Ensure interviewer is in the same team
        if (currentUserTeamId !== interviewerTeamId) {
            return ApiResponseUtil.error(res, 'Access denied: you can only delete interviewers in your team', 403);
        }

        // Check for associated meetings
        const meetings = await Meeting.find({ interviewerIds: interviewer._id });
        if (meetings.length > 0) {
            return ApiResponseUtil.error(
                res,
                `Cannot delete: Interviewer has ${meetings.length} associated meeting(s). Please reassign or cancel meetings first.`,
                400
            );
        }

        // Check for associated availability
        const availability = await Availability.find({ userId: interviewer._id });
        if (availability.length > 0) {
            return ApiResponseUtil.error(
                res,
                `Cannot delete: Interviewer has ${availability.length} availability record(s). Please remove availability first.`,
                400
            );
        }

        await User.findByIdAndDelete(interviewer._id);

        ApiResponseUtil.success(res, null, 'Interviewer deleted successfully');
    } catch (error) {
        next(error);
    }
}
