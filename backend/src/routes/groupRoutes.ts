import { Router } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { requireAuth, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import { PermissionChecker } from '../utils/permissions';
import Group from '../models/group';

const router = Router();

/**
 * @route   GET /api/groups
 * @desc    Get all groups in user's team (with pagination)
 * @access  Private (All authenticated users)
 * @permissions Users can view groups in their team
 */
router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const userTeamId = req.user.teamId?.toString();

        if (!userTeamId) {
            return ApiResponseUtil.success(res, [], 'No team assigned');
        }

        // Get all groups in the user's team
        const groups = await Group.find({ teamId: userTeamId })
            .populate('createdBy', 'name email')
            .lean();

        ApiResponseUtil.success(res, groups, 'Groups retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/groups
 * @desc    Create a new group
 * @access  Private (Admin)
 * @permissions Only admins can create groups
 */
router.post('/', requireAuth, requireRole([UserRole.ADMIN]), (req: AuthRequest, res) => {
    // TODO: Implement group creation
    // - Validate request body (name, members array)
    // - Set teamId to admin's team
    // - Set createdBy to req.user._id
    // - Create group in database
    // - Return created group
    ApiResponseUtil.success(res, null, 'Create group route');
});

/**
 * @route   GET /api/groups/:id
 * @desc    Get group by ID
 * @access  Private (Team Members)
 * @permissions Users can view groups in their team
 */
router.get('/:id', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const group = await Group.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('members', 'name email role');

        if (!group) {
            return ApiResponseUtil.error(res, 'Group not found', 404);
        }

        const groupTeamId = group.teamId.toString();

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, groupTeamId);

        ApiResponseUtil.success(res, group, 'Group retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/groups/:id
 * @desc    Update group by ID
 * @access  Private (Admin in same team)
 * @permissions Only admins in the same team can update groups
 */
router.put('/:id', requireAuth, requireRole([UserRole.ADMIN]), async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const group = await Group.findById(req.params.id);

        if (!group) {
            return ApiResponseUtil.error(res, 'Group not found', 404);
        }

        const groupTeamId = group.teamId.toString();

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, groupTeamId);

        // TODO: Implement group update
        // - Validate request body (name, members)
        // - Update group fields
        // - Return updated group
        ApiResponseUtil.success(res, null, `Update group ${req.params.id}`);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/groups/:id
 * @desc    Delete group by ID
 * @access  Private (Admin in same team)
 * @permissions Only admins in the same team can delete groups
 */
router.delete('/:id', requireAuth, requireRole([UserRole.ADMIN]), async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const group = await Group.findById(req.params.id);

        if (!group) {
            return ApiResponseUtil.error(res, 'Group not found', 404);
        }

        const groupTeamId = group.teamId.toString();

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, groupTeamId);

        // TODO: Implement group deletion
        // - Check if group is referenced in meetings or schedules
        // - Delete group from database
        // - Return success response
        ApiResponseUtil.success(res, null, `Delete group ${req.params.id}`);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/groups/:id/members
 * @desc    Get all group members
 * @access  Private (Team Members)
 * @permissions Users can view members of groups in their team
 */
router.get('/:id/members', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const group = await Group.findById(req.params.id)
            .populate('members', 'name email role');

        if (!group) {
            return ApiResponseUtil.error(res, 'Group not found', 404);
        }

        const groupTeamId = group.teamId.toString();

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, groupTeamId);

        ApiResponseUtil.success(res, group.members, 'Group members retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/groups/:id/members
 * @desc    Add member to group
 * @access  Private (Admin in same team)
 * @permissions Only admins in the same team can add members to groups
 */
router.post('/:id/members', requireAuth, requireRole([UserRole.ADMIN]), async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const group = await Group.findById(req.params.id);

        if (!group) {
            return ApiResponseUtil.error(res, 'Group not found', 404);
        }

        const groupTeamId = group.teamId.toString();

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, groupTeamId);

        // TODO: Implement adding member to group
        // - Validate request body (userId)
        // - Check if user exists and is in the same team
        // - Add userId to group.members array
        // - Return updated group
        ApiResponseUtil.success(res, null, `Add member to group ${req.params.id}`);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/groups/:id/members/:userId
 * @desc    Remove member from group
 * @access  Private (Admin in same team)
 * @permissions Only admins in the same team can remove members from groups
 */
router.delete('/:id/members/:userId', requireAuth, requireRole([UserRole.ADMIN]), async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const group = await Group.findById(req.params.id);

        if (!group) {
            return ApiResponseUtil.error(res, 'Group not found', 404);
        }

        const groupTeamId = group.teamId.toString();

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, groupTeamId);

        // TODO: Implement removing member from group
        // - Validate userId parameter
        // - Check if user is a member of the group
        // - Remove userId from group.members array
        // - Return updated group
        ApiResponseUtil.success(
            res,
            null,
            `Remove member ${req.params.userId} from group ${req.params.id}`
        );
    } catch (error) {
        next(error);
    }
});

export default router;