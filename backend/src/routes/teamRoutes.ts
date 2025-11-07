import { Router } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { requireAuth, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import { PermissionChecker } from '../utils/permissions';
import Team from '../models/team';

const router = Router();

/**
 * @route   GET /api/teams
 * @desc    Get user's own team or all teams (admin only)
 * @access  Private (All authenticated users)
 * @permissions Users can view their own team, admins can view all teams
 */
router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const userRole = req.user.role || UserRole.CANDIDATE;
        const userTeamId = req.user.teamId?.toString();

        // Admins can view all teams
        if (userRole === UserRole.ADMIN) {
            const teams = await Team.find().populate('adminId', 'name email');
            return ApiResponseUtil.success(res, teams, 'Teams retrieved successfully');
        }

        // Regular users can only view their own team
        if (!userTeamId) {
            return ApiResponseUtil.success(res, [], 'No team assigned');
        }

        const team = await Team.findById(userTeamId).populate('adminId', 'name email');
        return ApiResponseUtil.success(res, team ? [team] : [], 'Team retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/teams
 * @desc    Create a new team
 * @access  Private (Admin only)
 * @permissions Only admins can create new teams
 */
router.post('/', requireAuth, requireRole([UserRole.ADMIN]), (req: AuthRequest, res) => {
    // TODO: Implement team creation
    // - Validate request body (name, description)
    // - Create team with current admin as adminId
    // - Return created team
    // Example: const team = await Team.create({ name, description, adminId: req.user._id });
    ApiResponseUtil.success(res, null, 'Create team route - will be implemented in issue #93');
});

/**
 * @route   GET /api/teams/:id
 * @desc    Get team by ID
 * @access  Private (Team Members)
 * @permissions Users can only view their own team
 */
router.get('/:id', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const team = await Team.findById(req.params.id).populate('adminId', 'name email');

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, req.params.id);

        ApiResponseUtil.success(res, team, 'Team retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/teams/:id
 * @desc    Update team by ID
 * @access  Private (Team Admin only)
 * @permissions Only the team's admin can update team details
 */
router.put('/:id', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const team = await Team.findById(req.params.id);

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        const teamAdminId = team.adminId.toString();

        // Use PermissionChecker to verify admin access
        PermissionChecker.requireAdminOfTeam(req, teamAdminId);

        // TODO: Implement team update
        // - Validate request body (name, description)
        // - Update team fields
        // - Return updated team
        ApiResponseUtil.success(res, null, `Update team ${req.params.id} - will be implemented in issue #93`);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/teams/:id
 * @desc    Delete team by ID
 * @access  Private (Team Admin only)
 * @permissions Only the team's admin can delete the team
 */
router.delete('/:id', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const team = await Team.findById(req.params.id);

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        const teamAdminId = team.adminId.toString();

        // Use PermissionChecker to verify admin access
        PermissionChecker.requireAdminOfTeam(req, teamAdminId);

        // TODO: Implement team deletion
        // - Check if team has members (prevent deletion if members exist, or cascade)
        // - Check if team has associated resources (meetings, groups, etc.)
        // - Delete team from database
        // - Return success response
        ApiResponseUtil.success(res, null, `Delete team ${req.params.id} - will be implemented in issue #93`);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/teams/:id/members
 * @desc    Get all team members
 * @access  Private (Team Members)
 * @permissions Team members can view the member list
 */
router.get('/:id/members', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const team = await Team.findById(req.params.id);

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, req.params.id);

        // TODO: Implement fetching team members
        // - Query User model for all users with this teamId
        // - Populate user details (exclude passwords)
        // - Return members array
        ApiResponseUtil.success(res, [], `Get team ${req.params.id} members - will be implemented in issue #93`);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/teams/:id/members
 * @desc    Add member to team
 * @access  Private (Team Admin only)
 * @permissions Only team admin can add members
 */
router.post('/:id/members', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const team = await Team.findById(req.params.id);

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        const teamAdminId = team.adminId.toString();

        // Use PermissionChecker to verify admin access
        PermissionChecker.requireAdminOfTeam(req, teamAdminId);

        // TODO: Implement adding member to team
        // - Validate request body (userId, role)
        // - Check if user exists
        // - Update user's teamId to this team
        // - Assign role to user
        // - Return updated user
        ApiResponseUtil.success(res, null, `Add member to team ${req.params.id} - will be implemented in issue #93`);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/teams/:id/members/:userId
 * @desc    Remove member from team
 * @access  Private (Team Admin only)
 * @permissions Only team admin can remove members
 */
router.delete('/:id/members/:userId', requireAuth, async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const team = await Team.findById(req.params.id);

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        const teamAdminId = team.adminId.toString();

        // Use PermissionChecker to verify admin access
        PermissionChecker.requireAdminOfTeam(req, teamAdminId);

        // TODO: Implement removing member from team
        // - Check if user exists
        // - Remove user's teamId (set to null/undefined)
        // - Handle cascading effects (availability, meetings, etc.)
        // - Return success response
        ApiResponseUtil.success(
            res,
            null,
            `Remove member ${req.params.userId} from team ${req.params.id} - will be implemented in issue #93`
        );
    } catch (error) {
        next(error);
    }
});

export default router;