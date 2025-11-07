import { Router } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { requireAuth, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import { PermissionChecker } from '../utils/permissions';
import Meeting from '../models/meeting';
import { Types } from 'mongoose';

const router = Router();

/**
 * @route   GET /api/meetings
 * @desc    Get all meetings for current user's team (with pagination and filters)
 * @access  Private (All authenticated users)
 * @permissions Users see meetings they're part of, admins see all team meetings
 */
router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
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
});

/**
 * @route   POST /api/meetings
 * @desc    Create a new meeting
 * @access  Private (Admin)
 * @permissions Only admins can create meetings
 */
router.post('/', requireAuth, requireRole([UserRole.ADMIN]), (req: AuthRequest, res) => {
    // TODO: Implement meeting creation
    // - Validate request body (title, startTime, endTime, interviewerIds, candidateId)
    // - Set teamId to admin's team
    // - Set createdBy to req.user._id
    // - Create meeting in database
    // - Return created meeting
    ApiResponseUtil.success(res, null, 'Create meeting route');
});

/**
 * @route   GET /api/meetings/:id
 * @desc    Get meeting by ID
 * @access  Private (Admin and Participants)
 * @permissions Admins and meeting participants can view meeting details
 */
router.get('/:id', requireAuth, async (req: AuthRequest, res, next) => {
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
});

/**
 * @route   PUT /api/meetings/:id
 * @desc    Update meeting by ID
 * @access  Private (Admin in same team)
 * @permissions Only admins in the same team can update meetings
 */
router.put('/:id', requireAuth, requireRole([UserRole.ADMIN]), async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return ApiResponseUtil.error(res, 'Meeting not found', 404);
        }

        const currentUserTeamId = req.user.teamId?.toString();
        const meetingTeamId = meeting.teamId?.toString();

        // Ensure admin is in the same team as the meeting
        if (currentUserTeamId !== meetingTeamId) {
            return ApiResponseUtil.error(res, 'Access denied: you can only update meetings in your team', 403);
        }

        // TODO: Implement meeting update
        // - Validate request body (title, startTime, endTime, status, etc.)
        // - Update meeting fields
        // - Notify participants of changes
        // - Return updated meeting
        ApiResponseUtil.success(res, null, `Update meeting ${req.params.id}`);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/meetings/:id
 * @desc    Delete meeting by ID
 * @access  Private (Admin in same team)
 * @permissions Only admins in the same team can delete meetings
 */
router.delete('/:id', requireAuth, requireRole([UserRole.ADMIN]), async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return ApiResponseUtil.error(res, 'Meeting not found', 404);
        }

        const currentUserTeamId = req.user.teamId?.toString();
        const meetingTeamId = meeting.teamId?.toString();

        // Ensure admin is in the same team as the meeting
        if (currentUserTeamId !== meetingTeamId) {
            return ApiResponseUtil.error(res, 'Access denied: you can only delete meetings in your team', 403);
        }

        // TODO: Implement meeting deletion
        // - Delete meeting from database
        // - Notify participants of cancellation
        // - Return success response
        ApiResponseUtil.success(res, null, `Delete meeting ${req.params.id}`);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/meetings/:id/confirm
 * @desc    Confirm participation in a meeting
 * @access  Private (Meeting Participants)
 * @permissions Only meeting participants can confirm their participation
 */
router.post('/:id/confirm', requireAuth, async (req: AuthRequest, res, next) => {
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

        // TODO: Implement meeting confirmation
        // - Update meeting status or participant confirmation status
        // - Store confirmation in database
        // - Return updated meeting
        ApiResponseUtil.success(res, null, `Confirm meeting ${req.params.id}`);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/meetings/:id/reschedule
 * @desc    Request rescheduling for a meeting
 * @access  Private (Meeting Participants)
 * @permissions Only meeting participants can request rescheduling
 */
router.post('/:id/reschedule', requireAuth, async (req: AuthRequest, res, next) => {
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
});

/**
 * @route   GET /api/meetings/user/:userId
 * @desc    Get all meetings for a specific user
 * @access  Private (Own User, or Admin/Interviewer in same team)
 * @permissions Users can view their own meetings, admins/interviewers can view team members' meetings
 */
router.get('/user/:userId', requireAuth, async (req: AuthRequest, res, next) => {
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
                const meetings = await Meeting.find({ interviewerIds: targetUserId });
                return ApiResponseUtil.success(res, meetings, 'Meetings retrieved successfully');
            } else {
                // Candidates and admins
                const meetings = await Meeting.find({
                    $or: [
                        { candidateId: targetUserId },
                        { interviewerIds: targetUserId }
                    ]
                });
                return ApiResponseUtil.success(res, meetings, 'Meetings retrieved successfully');
            }
        }

        // For viewing others' meetings, check team-based permissions
        const targetUser = await require('../models/user').default.findById(targetUserId);

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
            const meetings = await Meeting.find({ interviewerIds: targetUserId });
            return ApiResponseUtil.success(res, meetings, 'Meetings retrieved successfully');
        } else {
            const meetings = await Meeting.find({
                $or: [
                    { candidateId: targetUserId },
                    { interviewerIds: targetUserId }
                ]
            });
            return ApiResponseUtil.success(res, meetings, 'Meetings retrieved successfully');
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/meetings/team/:teamId
 * @desc    Get all meetings for a specific team
 * @access  Private (Team Members)
 * @permissions Team members can view their team's meetings
 */
router.get('/team/:teamId', requireAuth, async (req: AuthRequest, res, next) => {
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
});

export default router;