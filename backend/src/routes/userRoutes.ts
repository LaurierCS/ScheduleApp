import { Router } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { requireAuth, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import { PermissionChecker } from '../utils/permissions';
import User from '../models/user';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users in team (with pagination)
 * @access  Private (Admin and Interviewer)
 * @permissions Admins and interviewers can view all users in their team
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

        // Get all users in the same team
        const users = await User.find({ teamId: userTeamId })
            .select('-password')
            .lean();

        ApiResponseUtil.success(res, users, 'Users retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/users
 * @desc    Create a new user (by admin)
 * @access  Private (Admin)
 * @permissions Only admins can create users
 */
router.post('/', requireAuth, requireRole([UserRole.ADMIN]), (req: AuthRequest, res) => {
    // TODO: Implement user creation
    // - Validate request body (name, email, password, role)
    // - Hash password
    // - Create user with admin's teamId
    // - Return created user (without password)
    ApiResponseUtil.success(res, null, 'Create user route - will be implemented in issue #94');
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Own user, or Admin/Interviewer for team members)
 * @permissions Users can view their own profile, admins/interviewers can view team members
 */
router.get('/:id', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const targetUser = await User.findById(req.params.id).select('-password');

        if (!targetUser) {
            return ApiResponseUtil.error(res, 'User not found', 404);
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const targetUserTeamId = targetUser.teamId?.toString();

        // Check if user can view this profile
        if (!PermissionChecker.canViewUserResources(
            currentUserId,
            currentUserRole,
            req.params.id,
            currentUserTeamId,
            targetUserTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only view your own profile or team members', 403);
        }

        ApiResponseUtil.success(res, targetUser, 'User retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID
 * @access  Private (Own user or Admin in same team)
 * @permissions Users can update their own profile, admins can update team members
 */
router.put('/:id', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const targetUser = await User.findById(req.params.id);

        if (!targetUser) {
            return ApiResponseUtil.error(res, 'User not found', 404);
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const targetUserTeamId = targetUser.teamId?.toString();

        // Check if user can modify this profile
        if (!PermissionChecker.canModifyUser(
            currentUserId,
            currentUserRole,
            req.params.id,
            targetUserTeamId,
            currentUserTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only modify your own profile', 403);
        }

        // TODO: Implement user update
        // - Validate request body
        // - Prevent role changes by non-admins
        // - Prevent teamId changes
        // - Update user fields
        // - Return updated user (without password)
        ApiResponseUtil.success(res, null, `Update user ${req.params.id} - will be implemented in issue #94`);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID
 * @access  Private (Own user or Admin in same team)
 * @permissions Users can delete their own account, admins can delete team members
 */
router.delete('/:id', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const targetUser = await User.findById(req.params.id);

        if (!targetUser) {
            return ApiResponseUtil.error(res, 'User not found', 404);
        }

        const currentUserId = (req.user as any)._id.toString();
        const currentUserRole = req.user.role || UserRole.CANDIDATE;
        const currentUserTeamId = req.user.teamId?.toString();
        const targetUserTeamId = targetUser.teamId?.toString();

        // Check if user can delete this profile
        if (!PermissionChecker.canModifyUser(
            currentUserId,
            currentUserRole,
            req.params.id,
            targetUserTeamId,
            currentUserTeamId
        )) {
            return ApiResponseUtil.error(res, 'Access denied: you can only delete your own account', 403);
        }

        // TODO: Implement user deletion
        // - Check if user has associated resources (meetings, availability)
        // - Either cascade delete or prevent deletion if resources exist
        // - Delete user from database
        // - Return success response
        ApiResponseUtil.success(res, null, `Delete user ${req.params.id} - will be implemented in issue #94`);
    } catch (error) {
        next(error);
    }
});

export default router;