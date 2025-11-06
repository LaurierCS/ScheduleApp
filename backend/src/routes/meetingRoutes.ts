import { Router } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { authorize, requireOwnership, requireTeamAccess } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';

const router = Router();

/**
 * @route   GET /api/meetings
 * @desc    Get all meetings (with pagination and filters)
 * @access  Private (Admin, Interviewer, or Candidate)
 */
router.get('/', authorize([UserRole.ADMIN, UserRole.INTERVIEWER, UserRole.CANDIDATE]), (req, res) => {
    const mockMeetings = [
        { id: '1', title: 'Technical Interview', startTime: '2025-10-15T14:00:00Z', endTime: '2025-10-15T15:00:00Z' },
        { id: '2', title: 'HR Interview', startTime: '2025-10-16T10:00:00Z', endTime: '2025-10-16T11:00:00Z' },
    ];

    ApiResponseUtil.paginated(
        res,
        mockMeetings,
        1, // page
        10, // limit
        2, // total
        'Get all meetings'
    );
});

/**
 * @route   POST /api/meetings
 * @desc    Create a new meeting
 * @access  Private (Admin)
 */
router.post('/', authorize(UserRole.ADMIN), (req, res) => {
    ApiResponseUtil.success(res, null, 'Create meeting route');
});

/**
 * @route   GET /api/meetings/:id
 * @desc    Get meeting by ID
 * @access  Private (Admin, Participants)
 * @note    Meeting participation validation requires database lookup - additional validation in controller
 */
router.get('/:id', authorize([UserRole.ADMIN, UserRole.INTERVIEWER, UserRole.CANDIDATE]), (req, res) => {
    ApiResponseUtil.success(res, null, `Get meeting ${req.params.id}`);
});

/**
 * @route   PUT /api/meetings/:id
 * @desc    Update meeting by ID
 * @access  Private (Admin)
 */
router.put('/:id', authorize(UserRole.ADMIN), (req, res) => {
    ApiResponseUtil.success(res, null, `Update meeting ${req.params.id}`);
});

/**
 * @route   DELETE /api/meetings/:id
 * @desc    Delete meeting by ID
 * @access  Private (Admin)
 */
router.delete('/:id', authorize(UserRole.ADMIN), (req, res) => {
    ApiResponseUtil.success(res, null, `Delete meeting ${req.params.id}`);
});

/**
 * @route   POST /api/meetings/:id/confirm
 * @desc    Confirm participation in a meeting
 * @access  Private (Meeting Participants)
 * @note    Meeting participation validation requires database lookup - additional validation in controller
 */
router.post('/:id/confirm', authorize([UserRole.ADMIN, UserRole.INTERVIEWER, UserRole.CANDIDATE]), (req, res) => {
    ApiResponseUtil.success(res, null, `Confirm meeting ${req.params.id}`);
});

/**
 * @route   POST /api/meetings/:id/reschedule
 * @desc    Request rescheduling for a meeting
 * @access  Private (Meeting Participants)
 * @note    Meeting participation validation requires database lookup - additional validation in controller
 */
router.post('/:id/reschedule', authorize([UserRole.ADMIN, UserRole.INTERVIEWER, UserRole.CANDIDATE]), (req, res) => {
    ApiResponseUtil.success(res, null, `Reschedule meeting ${req.params.id}`);
});

/**
 * @route   GET /api/meetings/user/:userId
 * @desc    Get all meetings for a specific user
 * @access  Private (Admin and Own User)
 */
router.get('/user/:userId', requireOwnership('userId'), (req, res) => {
    ApiResponseUtil.success(res, [], `Get meetings for user ${req.params.userId}`);
});

/**
 * @route   GET /api/meetings/team/:teamId
 * @desc    Get all meetings for a specific team
 * @access  Private (Admin and Team Members)
 */
router.get('/team/:teamId', authorize([UserRole.ADMIN, UserRole.INTERVIEWER, UserRole.CANDIDATE]), requireTeamAccess('teamId'), (req, res) => {
    ApiResponseUtil.success(res, [], `Get meetings for team ${req.params.teamId}`);
});

export default router;