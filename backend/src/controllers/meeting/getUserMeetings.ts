import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { UserRole } from '../../models/user';
import { PermissionChecker } from '../../utils/permissions';
import User from '../../models/user';
import Meeting from '../../models/meeting';

/**
 * @route   GET /api/meetings/user/:userId
 * @desc    Get all meetings for a specific user
 * @access  Private (Own User, or Admin/Interviewer in same team)
 * @permissions Users can view their own meetings, admins/interviewers can view team members' meetings
 */
export async function getUserMeetings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const targetUserId = req.params.userId;

        // Everyone can view their own meetings
        if (currentUserId === targetUserId) {
            // Determine the user's role to fetch appropriate meetings
            if (currentUserRole === UserRole.INTERVIEWER) {
                const meetings = await Meeting.find({ interviewerIds: targetUserId })
                    .populate('interviewerIds', 'name email');
                return ApiResponseUtil.success(res, meetings, 'Meetings retrieved successfully');
            } else {
                // Candidates and admins
                const meetings = await Meeting.find({
                    $or: [
                        { candidateId: targetUserId },
                        { interviewerIds: targetUserId }
                    ]
                })
                    .populate('interviewerIds', 'name email');
                return ApiResponseUtil.success(res, meetings, 'Meetings retrieved successfully');
            }
        }

        // For viewing others' meetings, check team-based permissions
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return ApiResponseUtil.error(res, 'User not found', 404);
        }

        const targetUserTeamId = targetUser.teamId?.toString();

        // Check if user can view target user's resources
        if (!PermissionChecker.canViewUserResources(
            currentUserId,
            currentUserRole,
            targetUserId,
            currentUserTeamId,
            targetUserTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only view meetings of team members', 403);
        }

        // Fetch meetings based on target user's role
        const targetUserRole = targetUser.role || UserRole.CANDIDATE;
        if (targetUserRole === UserRole.INTERVIEWER) {
            const meetings = await Meeting.find({ interviewerIds: targetUserId })
                .populate('interviewerIds', 'name email');
            return ApiResponseUtil.success(res, meetings, 'Meetings retrieved successfully');
        } else {
            const meetings = await Meeting.find({
                $or: [
                    { candidateId: targetUserId },
                    { interviewerIds: targetUserId }
                ]
            })
                .populate('interviewerIds', 'name email');
            return ApiResponseUtil.success(res, meetings, 'Meetings retrieved successfully');
        }
    } catch (error) {
        next(error);
    }
}
