import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import {
    getCandidates,
    createCandidate,
    getCandidateById,
    updateCandidate,
    deleteCandidate,
    getCandidateAvailability,
} from '../controllers/candidate';

const router = Router();

/**
 * @route   GET /api/candidates
 * @desc    Get all candidates in team (with pagination)
 * @access  Private (Admin and Interviewers)
 * @permissions Admins and interviewers can view all candidates in their team
 */
router.get('/', requireAuth, requireRole([UserRole.ADMIN, UserRole.INTERVIEWER]), getCandidates);

/**
 * @route   POST /api/candidates
 * @desc    Create a new candidate
 * @access  Private (Admin)
 * @permissions Only admins can create candidates
 */
router.post('/', requireAuth, requireRole([UserRole.ADMIN]), createCandidate);

/**
 * @route   GET /api/candidates/:id
 * @desc    Get candidate by ID
 * @access  Private (Admin, Interviewer in same team, and Own User)
 * @permissions Admins and interviewers can view team candidates, candidates can view their own profile
 */
router.get('/:id', requireAuth, getCandidateById);

/**
 * @route   PUT /api/candidates/:id
 * @desc    Update candidate by ID
 * @access  Private (Admin in same team and Own User)
 * @permissions Admins can update team candidates, candidates can update their own profile
 */
router.put('/:id', requireAuth, updateCandidate);

/**
 * @route   DELETE /api/candidates/:id
 * @desc    Delete candidate by ID
 * @access  Private (Admin in same team)
 * @permissions Only admins can delete candidates in their team
 */
router.delete('/:id', requireAuth, requireRole([UserRole.ADMIN]), deleteCandidate);

/**
 * @route   GET /api/candidates/:id/availability
 * @desc    Get candidate availability
 * @access  Private (Admin, Interviewer in same team, and Own User)
 * @permissions Admins and interviewers can view team candidates' availability, candidates can view their own
 */
router.get('/:id/availability', requireAuth, getCandidateAvailability);

export default router;