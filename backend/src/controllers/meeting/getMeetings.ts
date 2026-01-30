import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { UserRole } from '../../models/user';
import Meeting from '../../models/meeting';

/**
 * @route   GET /api/meetings
 * @desc    Get all meetings for current user's team (with pagination and filters)
 * @access  Private (All authenticated users)
 * @permissions Users see meetings they're part of, admins see all team meetings
 */
export async function getMeetings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();

        if (!currentUserTeamId) {
            return ApiResponseUtil.success(res, [], 'No team assigned');
        }

        // Admins see all meetings in their team
        if (currentUserRole === UserRole.ADMIN) {
            const meetings = await Meeting.find({ teamId: currentUserTeamId });
            return ApiResponseUtil.success(res, meetings, 'Meetings retrieved successfully');
        }

        // Interviewers see meetings they're assigned to
        if (currentUserRole === UserRole.INTERVIEWER) {
            const meetings = await Meeting.find({
                teamId: currentUserTeamId,
                interviewerIds: currentUserId
            });
            return ApiResponseUtil.success(res, meetings, 'Meetings retrieved successfully');
        }

        // Candidates see meetings they're the candidate for
        const meetings = await Meeting.find({
            teamId: currentUserTeamId,
            candidateId: currentUserId
        });

        ApiResponseUtil.success(res, meetings, 'Meetings retrieved successfully');
    } catch (error) {
        next(error);
    }
}
