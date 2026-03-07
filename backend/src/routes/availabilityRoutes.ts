import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import {
    getUserAvailability,
    createAvailability,
    createAvailabilityBulk,
    getAvailabilityById,
    updateAvailability,
    deleteAvailability,
    getTeamAvailability,
    getGroupAvailability,
    findMatches,
    exportAvailabilityIcs,
} from '../controllers/availability';
import rateLimiter from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   GET /api/availability
 * @desc    Get availability for current user or specific user (with proper permissions)
 * @access  Private (All authenticated users)
 * @permissions Users can get their own availability, admins/interviewers can query team members
 */
router.get('/', authenticate, getUserAvailability);

/**
 * @route   POST /api/availability
 * @desc    Create user availability
 * @access  Private (Interviewer and Candidate)
 * @permissions Only Interviewers and Candidates can submit their availability
 * @body    {teamId?, startTime, endTime, type?, recurring?, recurrencePattern?, timezone?}
 */
router.post('/', authenticate, rateLimiter(), authorize(UserRole.INTERVIEWER, UserRole.CANDIDATE), createAvailability);

/**
 * @route   POST /api/availability/bulk
 * @desc    Bulk create availability (array)
 */
router.post('/bulk', authenticate, rateLimiter(), authorize(UserRole.INTERVIEWER, UserRole.CANDIDATE), createAvailabilityBulk);

/**
 * @route   GET /api/availability/:id
 * @desc    Get availability by ID
 * @access  Private (Owner and Team Members with proper roles)
 * @permissions User can view their own availability, admins/interviewers can view team members'
 */
router.get('/:id', authenticate, getAvailabilityById);

/**
 * @route   PUT /api/availability/:id
 * @desc    Update availability by ID
 * @access  Private (Owner only)
 * @permissions Only the availability owner can update it
 * @body    {teamId?, startTime?, endTime?, type?, recurring?, recurrencePattern?, timezone?}
 */
router.put('/:id', authenticate, rateLimiter(), updateAvailability);

/**
 * @route   DELETE /api/availability/:id
 * @desc    Delete availability by ID
 * @access  Private (Owner only)
 * @permissions Only the availability owner can delete it
 */
router.delete('/:id', authenticate, rateLimiter(), deleteAvailability);

/**
 * @route   GET /api/availability/team/:teamId
 * @desc    Get availability for an entire team within a date range
 * @access  Private (Team Members)
 * @permissions Team members can view their team's availability
 * @query   {startTime, endTime, type?}
 */
router.get('/team/:teamId', authenticate, getTeamAvailability);

/**
 * @route   GET /api/availability/group/:groupId
 * @desc    Get availability for a group within a date range
 */
router.get('/group/:groupId', authenticate, getGroupAvailability);

/**
 * @route   GET /api/availability/ics
 * @desc    Export availability to iCalendar (.ics)
 */
router.get('/ics', authenticate, exportAvailabilityIcs);

/**
 * @route   GET /api/availability/matches
 * @desc    Find matching availability between specific users or all team members
 * @access  Private (Team Members)
 * @permissions Used for scheduling - team members can find matches within their team
 * @query   {startTime, endTime, userIds?, minDuration?}
 */
router.get('/matches', authenticate, findMatches);

export default router;