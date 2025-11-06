import { Router } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { authorize, requireOwnership, requireTeamAccess } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';

const router = Router();

/**
 * @route   GET /api/availability
 * @desc    Get availability for a specific date range and user(s)
 * @access  Private (All authenticated users)
 */
router.get('/', authorize([UserRole.ADMIN, UserRole.INTERVIEWER, UserRole.CANDIDATE]), (req, res) => {
    // Will be implemented later
    ApiResponseUtil.success(res, [], 'Get availability');
});

/**
 * @route   POST /api/availability
 * @desc    Create or update user availability
 * @access  Private (All authenticated users)
 */
router.post('/', authorize([UserRole.ADMIN, UserRole.INTERVIEWER, UserRole.CANDIDATE]), (req, res) => {
    ApiResponseUtil.success(res, null, 'Create availability route');
});

/**
 * @route   GET /api/availability/:id
 * @desc    Get availability by ID
 * @access  Private (Admin, Owner, and Authorized Team Members)
 * @note    Availability ownership validation requires database lookup - additional validation in controller
 */
router.get('/:id', authorize([UserRole.ADMIN, UserRole.INTERVIEWER, UserRole.CANDIDATE]), (req, res) => {
    ApiResponseUtil.success(res, null, `Get availability ${req.params.id}`);
});

/**
 * @route   PUT /api/availability/:id
 * @desc    Update availability by ID
 * @access  Private (Admin and Owner)
 * @note    Availability ownership validation requires database lookup - additional validation in controller
 */
router.put('/:id', authorize([UserRole.ADMIN, UserRole.INTERVIEWER, UserRole.CANDIDATE]), (req, res) => {
    ApiResponseUtil.success(res, null, `Update availability ${req.params.id}`);
});

/**
 * @route   DELETE /api/availability/:id
 * @desc    Delete availability by ID
 * @access  Private (Admin and Owner)
 * @note    Availability ownership validation requires database lookup - additional validation in controller
 */
router.delete('/:id', authorize([UserRole.ADMIN, UserRole.INTERVIEWER, UserRole.CANDIDATE]), (req, res) => {
    ApiResponseUtil.success(res, null, `Delete availability ${req.params.id}`);
});

/**
 * @route   GET /api/availability/team/:teamId
 * @desc    Get availability for an entire team
 * @access  Private (Admin and Team Members)
 */
router.get('/team/:teamId', authorize([UserRole.ADMIN, UserRole.INTERVIEWER, UserRole.CANDIDATE]), requireTeamAccess('teamId'), (req, res) => {
    ApiResponseUtil.success(res, [], `Get team ${req.params.teamId} availability`);
});

/**
 * @route   GET /api/availability/matches
 * @desc    Find matching availability between interviewers and candidates
 * @access  Private (Admin and Team Members)
 * @note    Team validation based on query parameters - additional validation in controller
 */
router.get('/matches', authorize([UserRole.ADMIN, UserRole.INTERVIEWER, UserRole.CANDIDATE]), (req, res) => {
    ApiResponseUtil.success(res, [], 'Get matching availabilities');
});

export default router;