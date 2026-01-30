import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import {
    getMeetings,
    createMeeting,
    getMeetingById,
    updateMeeting,
    deleteMeeting,
    confirmMeeting,
    rescheduleMeeting,
    getUserMeetings,
    getTeamMeetings,
} from '../controllers/meeting';

const router = Router();

/**
 * @route   GET /api/meetings
 * @desc    Get all meetings for current user's team (with pagination and filters)
 * @access  Private (All authenticated users)
 * @permissions Users see meetings they're part of, admins see all team meetings
 */
router.get('/', authenticate, getMeetings);

/**
 * @route   POST /api/meetings
 * @desc    Create a new meeting
 * @access  Private (Admin)
 * @permissions Only admins can create meetings
 */
router.post('/', authenticate, authorize(UserRole.ADMIN), createMeeting);

/**
 * @route   GET /api/meetings/:id
 * @desc    Get meeting by ID
 * @access  Private (Admin and Participants)
 * @permissions Admins and meeting participants can view meeting details
 */
router.get('/:id', authenticate, getMeetingById);

/**
 * @route   PUT /api/meetings/:id
 * @desc    Update meeting by ID
 * @access  Private (Admin in same team)
 * @permissions Only admins in the same team can update meetings
 */
router.put('/:id', authenticate, authorize(UserRole.ADMIN), updateMeeting);

/**
 * @route   DELETE /api/meetings/:id
 * @desc    Delete meeting by ID
 * @access  Private (Admin in same team)
 * @permissions Only admins in the same team can delete meetings
 */
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteMeeting);

/**
 * @route   POST /api/meetings/:id/confirm
 * @desc    Confirm participation in a meeting
 * @access  Private (Meeting Participants)
 * @permissions Only meeting participants can confirm their participation
 */
router.post('/:id/confirm', authenticate, confirmMeeting);

/**
 * @route   POST /api/meetings/:id/reschedule
 * @desc    Request rescheduling for a meeting
 * @access  Private (Meeting Participants)
 * @permissions Only meeting participants can request rescheduling
 */
router.post('/:id/reschedule', authenticate, rescheduleMeeting);

/**
 * @route   GET /api/meetings/user/:userId
 * @desc    Get all meetings for a specific user
 * @access  Private (Own User, or Admin/Interviewer in same team)
 * @permissions Users can view their own meetings, admins/interviewers can view team members' meetings
 */
router.get('/user/:userId', authenticate, getUserMeetings);

/**
 * @route   GET /api/meetings/team/:teamId
 * @desc    Get all meetings for a specific team
 * @access  Private (Team Members)
 * @permissions Team members can view their team's meetings
 */
router.get('/team/:teamId', authenticate, getTeamMeetings);

export default router;