import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import {
    getInterviewers,
    createInterviewer,
    getInterviewerById,
    updateInterviewer,
    deleteInterviewer,
    getInterviewerAvailability,
} from '../controllers/interviewer';

const router = Router();

/**
 * @route   GET /api/interviewers
 * @desc    Get all interviewers in team (with filtering)
 * @access  Private (Admin and Interviewer)
 * @permissions Admins and interviewers can view all interviewers in their team
 */
router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.INTERVIEWER), getInterviewers);

/**
 * @route   POST /api/interviewers
 * @desc    Create a new interviewer
 * @access  Private (Admin)
 * @permissions Only admins can create interviewers
 */
router.post('/', authenticate, authorize(UserRole.ADMIN), createInterviewer);

/**
 * @route   GET /api/interviewers/:id
 * @desc    Get interviewer by ID
 * @access  Private (Admin, Interviewer in same team, and Own User)
 * @permissions Team members can view interviewers in their team, users can view their own profile
 */
router.get('/:id', authenticate, getInterviewerById);

/**
 * @route   PUT /api/interviewers/:id
 * @desc    Update interviewer by ID
 * @access  Private (Admin in same team and Own User)
 * @permissions Admins can update team interviewers, users can update their own profile
 */
router.put('/:id', authenticate, updateInterviewer);

/**
 * @route   DELETE /api/interviewers/:id
 * @desc    Delete interviewer by ID
 * @access  Private (Admin in same team)
 * @permissions Only admins can delete interviewers in their team
 */
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteInterviewer);

/**
 * @route   GET /api/interviewers/:id/availability
 * @desc    Get interviewer availability
 * @access  Private (Admin, Interviewer in same team, and Own User)
 * @permissions Team members can view interviewers' availability for scheduling, users can view their own
 */
router.get('/:id/availability', authenticate, getInterviewerAvailability);

export default router;