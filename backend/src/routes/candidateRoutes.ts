import { Router } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { requireAuth, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import { PermissionChecker } from '../utils/permissions';
import User from '../models/user';

const router = Router();

/**
 * @route   GET /api/candidates
 * @desc    Get all candidates in team (with pagination)
 * @access  Private (Admin and Interviewers)
 * @permissions Admins and interviewers can view all candidates in their team
 */
router.get('/', requireAuth, requireRole([UserRole.ADMIN, UserRole.INTERVIEWER]), async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const userTeamId = req.user.teamId?.toString();

        if (!userTeamId) {
            return ApiResponseUtil.success(res, [], 'No team assigned');
        }

        // Get all candidates in the same team
        const candidates = await User.find({
            teamId: userTeamId,
            role: UserRole.CANDIDATE
        })
            .select('-password')
            .lean();

        ApiResponseUtil.success(res, candidates, 'Candidates retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/candidates
 * @desc    Create a new candidate
 * @access  Private (Admin)
 * @permissions Only admins can create candidates
 */
router.post('/', requireAuth, requireRole([UserRole.ADMIN]), (req: AuthRequest, res) => {
    // TODO: Implement candidate creation
    // - Validate request body (name, email, password)
    // - Set role to CANDIDATE
    // - Hash password
    // - Create user with admin's teamId
    // - Return created candidate (without password)
    ApiResponseUtil.success(res, null, 'Create candidate route - will be implemented in issue #94');
});

/**
 * @route   GET /api/candidates/:id
 * @desc    Get candidate by ID
 * @access  Private (Admin, Interviewer in same team, and Own User)
 * @permissions Admins and interviewers can view team candidates, candidates can view their own profile
 */
router.get('/:id', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const candidate = await User.findById(req.params.id).select('-password');

        if (!candidate) {
            return ApiResponseUtil.error(res, 'Candidate not found', 404);
        }

        // Ensure target user is a candidate
        if (candidate.role !== UserRole.CANDIDATE) {
            return ApiResponseUtil.error(res, 'User is not a candidate', 400);
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const candidateTeamId = candidate.teamId?.toString();

        // Check if user can view this candidate
        if (!PermissionChecker.canViewUserResources(
            currentUserId,
            currentUserRole,
            req.params.id,
            currentUserTeamId,
            candidateTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only view candidates in your team', 403);
        }

        ApiResponseUtil.success(res, candidate, 'Candidate retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/candidates/:id
 * @desc    Update candidate by ID
 * @access  Private (Admin in same team and Own User)
 * @permissions Admins can update team candidates, candidates can update their own profile
 */
router.put('/:id', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const candidate = await User.findById(req.params.id);

        if (!candidate) {
            return ApiResponseUtil.error(res, 'Candidate not found', 404);
        }

        // Ensure target user is a candidate
        if (candidate.role !== UserRole.CANDIDATE) {
            return ApiResponseUtil.error(res, 'User is not a candidate', 400);
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const candidateTeamId = candidate.teamId?.toString();

        // Check if user can modify this candidate
        if (!PermissionChecker.canModifyUser(
            currentUserId,
            currentUserRole,
            req.params.id,
            candidateTeamId,
            currentUserTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only modify your own profile', 403);
        }

        // TODO: Implement candidate update
        // - Validate request body
        // - Prevent role changes
        // - Prevent teamId changes
        // - Update candidate fields (name, email, etc.)
        // - Return updated candidate (without password)
        ApiResponseUtil.success(res, null, `Update candidate ${req.params.id} - will be implemented in issue #94`);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/candidates/:id
 * @desc    Delete candidate by ID
 * @access  Private (Admin in same team)
 * @permissions Only admins can delete candidates in their team
 */
router.delete('/:id', requireAuth, requireRole([UserRole.ADMIN]), async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const candidate = await User.findById(req.params.id);

        if (!candidate) {
            return ApiResponseUtil.error(res, 'Candidate not found', 404);
        }

        // Ensure target user is a candidate
        if (candidate.role !== UserRole.CANDIDATE) {
            return ApiResponseUtil.error(res, 'User is not a candidate', 400);
        }

        const currentUserTeamId = req.user.teamId?.toString();
        const candidateTeamId = candidate.teamId?.toString();

        // Ensure candidate is in the same team
        if (currentUserTeamId !== candidateTeamId) {
            return ApiResponseUtil.error(res, 'Access denied: you can only delete candidates in your team', 403);
        }

        // TODO: Implement candidate deletion
        // - Check if candidate has associated resources (meetings, availability)
        // - Either cascade delete or prevent deletion if resources exist
        // - Delete candidate from database
        // - Return success response
        ApiResponseUtil.success(res, null, `Delete candidate ${req.params.id} - will be implemented in issue #94`);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/candidates/:id/availability
 * @desc    Get candidate availability
 * @access  Private (Admin, Interviewer in same team, and Own User)
 * @permissions Admins and interviewers can view team candidates' availability, candidates can view their own
 */
router.get('/:id/availability', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const candidate = await User.findById(req.params.id);

        if (!candidate) {
            return ApiResponseUtil.error(res, 'Candidate not found', 404);
        }

        // Ensure target user is a candidate
        if (candidate.role !== UserRole.CANDIDATE) {
            return ApiResponseUtil.error(res, 'User is not a candidate', 400);
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const candidateTeamId = candidate.teamId?.toString();

        // Check if user can view this candidate's availability
        if (!PermissionChecker.canViewUserResources(
            currentUserId,
            currentUserRole,
            req.params.id,
            currentUserTeamId,
            candidateTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only view availability of candidates in your team', 403);
        }

        // TODO: Implement fetching candidate availability
        // - Query Availability model for candidate's availability records
        // - Return availability data
        ApiResponseUtil.success(
            res,
            [],
            `Get candidate ${req.params.id} availability - to be implemented`
        );
    } catch (error) {
        next(error);
    }
});

export default router;