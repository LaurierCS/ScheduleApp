import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import {
    getCandidates,
    createCandidate,
    getCandidateById,
    updateCandidate,
    updateCandidateStatus,
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
router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.INTERVIEWER), getCandidates);

/**
 * @route   POST /api/candidates
 * @desc    Create a new candidate
 * @access  Private (Admin)
 * @permissions Only admins can create candidates
 */
router.post('/', authenticate, authorize(UserRole.ADMIN), createCandidate);

/**
 * @route   GET /api/candidates/:id
 * @desc    Get candidate by ID
 * @access  Private (Admin, Interviewer in same team, and Own User)
 * @permissions Admins and interviewers can view team candidates, candidates can view their own profile
 */
router.get('/:id', authenticate, getCandidateById);

/**
 * @route   PUT /api/candidates/:id
 * @desc    Update candidate by ID
 * @access  Private (Admin in same team and Own User)
 * @permissions Admins can update team candidates, candidates can update their own profile
 */
router.put('/:id', authenticate, updateCandidate);

/**
 * @route   DELETE /api/candidates/:id
 * @desc    Delete candidate by ID
 * @access  Private (Admin in same team)
 * @permissions Only admins can delete candidates in their team
 */
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteCandidate);

/**
 * @route   GET /api/candidates/:id/availability
 * @desc    Get candidate availability
 * @access  Private (Admin, Interviewer in same team, and Own User)
 * @permissions Admins and interviewers can view team candidates' availability, candidates can view their own
 */
router.get('/:id/availability', authenticate, getCandidateAvailability);

/**
 * @route   POST /api/candidates/:id/status
 * @desc    Update candidate status
 * @access  Private (Admin or Interviewer in same team)
 * @permissions Admins and interviewers can change status of candidates within their team
 */
router.post('/:id/status', authenticate, authorize(UserRole.ADMIN, UserRole.INTERVIEWER), updateCandidateStatus);

export default router;