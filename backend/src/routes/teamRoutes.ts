import { Router, Request, Response, NextFunction } from 'express';
import mongoose, { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { ApiResponseUtil } from '../utils/apiResponse';
import { requireAuth, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import { PermissionChecker } from '../utils/permissions';
import Team from '../models/team';
import User from '../models/user';
import Group from '../models/group';

const router = Router();

/* ----------------------------- Helpers ----------------------------------- */

/**
 * Convert string to MongoDB ObjectId
 */
const toObjectId = (s: string): mongoose.Types.ObjectId =>
    new mongoose.Types.ObjectId(String(s));

/**
 * Zod schema for validating ObjectId strings
 */
const objectIdSchema = z
    .string()
    .trim()
    .refine((v: string) => isValidObjectId(v), { message: 'Invalid ObjectId' })
    .transform((s: string) => toObjectId(s));

/**
 * Zod schema for arrays of ObjectIds (plain - for validation requiring minimum)
 */
const objectIdArrayPlain = z.array(objectIdSchema);

/**
 * Zod schema for arrays of ObjectIds (with default empty array)
 */
const objectIdArrayDefault = z.array(objectIdSchema).default([]);

/**
 * Async handler wrapper for Express routes
 * Catches errors and forwards to error middleware
 */
const asyncHandler =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown) =>
        (req: Request, res: Response, next: NextFunction) =>
            Promise.resolve(fn(req, res, next)).catch(next);

/* --------------------------- Validation Schemas ---------------------------------- */

/**
 * Schema for creating a new team
 */
const createTeamSchema = z.object({
    name: z.string().min(1, 'name is required').trim(),
    description: z.string().optional(),
});

/**
 * Schema for updating team details
 */
const updateTeamSchema = z.object({
    name: z.string().min(1).trim().optional(),
    description: z.string().optional(),
});

/**
 * Schema for adding members to a team
 */
const addMembersSchema = z.object({
    members: objectIdArrayPlain.min(1, 'members must include at least one id'),
    role: z.nativeEnum(UserRole).optional(),
});

/**
 * Schema for removing members from a team
 */
const removeMembersSchema = z.object({
    members: objectIdArrayPlain.min(1, 'members must include at least one id'),
});

/**
 * Schema for creating a group within a team
 */
const createGroupSchema = z.object({
    name: z.string().min(1, 'name is required').trim(),
    members: objectIdArrayDefault.optional(),
});

/**
 * Schema for removing groups from a team
 */
const removeGroupsSchema = z.object({
    groupIds: objectIdArrayPlain.min(1, 'groupIds must include at least one id'),
});

/* ------------------------------ Routes ----------------------------------- */

/**
 * @route   POST /api/teams
 * @desc    Create a new team
 * @access  Private (Authenticated users - creator becomes admin)
 * @permissions Any authenticated user can create a team and becomes its admin
 */
router.post(
    '/',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
        if (!req.user) {
            return ApiResponseUtil.error(res, 'Authentication required', 401);
        }

        const data = createTeamSchema.parse(req.body);
        const userId = (req.user as any)._id;

        // Create team with current user as admin
        const team = await Team.create({
            name: data.name,
            description: data.description,
            adminId: userId,
            isActive: true,
        });

        // Update user's teamId and role to admin
        await User.findByIdAndUpdate(userId, {
            teamId: team._id,
            role: UserRole.ADMIN,
        });

        return ApiResponseUtil.success(res, team, 'Team created successfully', 201);
    })
);

/**
 * @route   GET /api/teams
 * @desc    Get user's own team or all teams (admin only)
 * @access  Private (All authenticated users)
 * @permissions Users can view their own team, admins can view all teams
 */
router.get(
    '/',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
        if (!req.user) {
            return ApiResponseUtil.error(res, 'Authentication required', 401);
        }

        const userRole = req.user.role || UserRole.CANDIDATE;
        const userTeamId = req.user.teamId?.toString();

        // Admins can view all teams with pagination
        if (userRole === UserRole.ADMIN && req.query.all === '1') {
            const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10)));
            const skip = (page - 1) * limit;

            const [items, total] = await Promise.all([
                Team.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('adminId', 'name email'),
                Team.countDocuments(),
            ]);

            return ApiResponseUtil.success(
                res,
                { items, page, limit, total },
                'Teams retrieved successfully'
            );
        }

        // Regular users can only view their own team
        if (!userTeamId) {
            return ApiResponseUtil.success(res, [], 'No team assigned');
        }

        const team = await Team.findById(userTeamId).populate('adminId', 'name email');
        return ApiResponseUtil.success(res, team ? [team] : [], 'Team retrieved successfully');
    })
);

/**
 * @route   GET /api/teams/:id
 * @desc    Get team by ID with optional population
 * @access  Private (Team Members)
 * @permissions Users can only view their own team
 */
router.get(
    '/:id',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
        if (!req.user) {
            return ApiResponseUtil.error(res, 'Authentication required', 401);
        }

        const id = objectIdSchema.parse(req.params.id);
        const populate = String(req.query.populate ?? '0') === '1';

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, req.params.id);

        const query = Team.findById(id);
        if (populate) {
            query.populate('adminId', '_id name email');
        }

        const team = await query;

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        return ApiResponseUtil.success(res, team, 'Team retrieved successfully');
    })
);

/**
 * @route   PUT /api/teams/:id
 * @desc    Update team details
 * @access  Private (Team Admin only)
 * @permissions Only the team's admin can update team details
 */
router.put(
    '/:id',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
        if (!req.user) {
            return ApiResponseUtil.error(res, 'Authentication required', 401);
        }

        const id = objectIdSchema.parse(req.params.id);
        const data = updateTeamSchema.parse(req.body);

        const team = await Team.findById(id);

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        const teamAdminId = team.adminId.toString();

        // Use PermissionChecker to verify admin access
        PermissionChecker.requireAdminOfTeam(req, teamAdminId);

        // Update team fields
        const updatedTeam = await Team.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        ).populate('adminId', 'name email');

        return ApiResponseUtil.success(res, updatedTeam, 'Team updated successfully');
    })
);

/**
 * @route   DELETE /api/teams/:id
 * @desc    Delete team by ID
 * @access  Private (Team Admin only)
 * @permissions Only the team's admin can delete the team
 */
router.delete(
    '/:id',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
        if (!req.user) {
            return ApiResponseUtil.error(res, 'Authentication required', 401);
        }

        const id = objectIdSchema.parse(req.params.id);

        const team = await Team.findById(id);

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        const teamAdminId = team.adminId.toString();

        // Use PermissionChecker to verify admin access
        PermissionChecker.requireAdminOfTeam(req, teamAdminId);

        // Remove team reference from all users
        await User.updateMany({ teamId: id }, { $unset: { teamId: '' }, role: UserRole.CANDIDATE });

        // Delete all groups associated with this team
        await Group.deleteMany({ teamId: id });

        // Delete the team
        await Team.findByIdAndDelete(id);

        return ApiResponseUtil.success(res, null, 'Team deleted successfully');
    })
);

/**
 * @route   GET /api/teams/:id/members
 * @desc    Get all team members
 * @access  Private (Team Members)
 * @permissions Team members can view the member list
 */
router.get(
    '/:id/members',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
        if (!req.user) {
            return ApiResponseUtil.error(res, 'Authentication required', 401);
        }

        const id = objectIdSchema.parse(req.params.id);

        const team = await Team.findById(id);

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, req.params.id);

        // Get all users belonging to this team
        const members = await User.find({ teamId: id }).select('-password');

        return ApiResponseUtil.success(res, members, 'Team members retrieved successfully');
    })
);

/**
 * @route   POST /api/teams/:id/members
 * @desc    Add members to team
 * @access  Private (Team Admin only)
 * @permissions Only team admin can add members
 */
router.post(
    '/:id/members',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
        if (!req.user) {
            return ApiResponseUtil.error(res, 'Authentication required', 401);
        }

        const id = objectIdSchema.parse(req.params.id);
        const { members, role } = addMembersSchema.parse(req.body);

        const team = await Team.findById(id);

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        const teamAdminId = team.adminId.toString();

        // Use PermissionChecker to verify admin access
        PermissionChecker.requireAdminOfTeam(req, teamAdminId);

        // Verify all users exist
        const users = await User.find({ _id: { $in: members } });

        if (users.length !== members.length) {
            return ApiResponseUtil.error(res, 'One or more users not found', 404);
        }

        // Update users' teamId and optionally their role
        const updateData: any = { teamId: id };
        if (role) {
            updateData.role = role;
        }

        await User.updateMany({ _id: { $in: members } }, { $set: updateData });

        // Get updated team with members
        const updatedMembers = await User.find({ teamId: id }).select('-password');

        return ApiResponseUtil.success(res, updatedMembers, 'Members added to team successfully');
    })
);

/**
 * @route   DELETE /api/teams/:id/members
 * @desc    Remove multiple members from team (bulk)
 * @access  Private (Team Admin only)
 * @permissions Only team admin can remove members
 */
router.delete(
    '/:id/members',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
        if (!req.user) {
            return ApiResponseUtil.error(res, 'Authentication required', 401);
        }

        const id = objectIdSchema.parse(req.params.id);
        const { members } = removeMembersSchema.parse(req.body);

        const team = await Team.findById(id);

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        const teamAdminId = team.adminId.toString();

        // Use PermissionChecker to verify admin access
        PermissionChecker.requireAdminOfTeam(req, teamAdminId);

        // Prevent admin from removing themselves
        const userIdStr = (req.user as any)._id.toString();
        const memberStrs = members.map((m) => m.toString());

        if (memberStrs.includes(userIdStr)) {
            return ApiResponseUtil.error(res, 'Team admin cannot remove themselves from the team', 400);
        }

        // Remove team reference from users and reset role to candidate
        await User.updateMany(
            { _id: { $in: members } },
            { $unset: { teamId: '' }, role: UserRole.CANDIDATE }
        );

        return ApiResponseUtil.success(res, null, 'Members removed from team successfully');
    })
);

/**
 * @route   DELETE /api/teams/:id/members/:userId
 * @desc    Remove a single member from team
 * @access  Private (Team Admin only)
 * @permissions Only team admin can remove members
 */
router.delete(
    '/:id/members/:userId',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
        if (!req.user) {
            return ApiResponseUtil.error(res, 'Authentication required', 401);
        }

        const id = objectIdSchema.parse(req.params.id);
        const userId = objectIdSchema.parse(req.params.userId);

        const team = await Team.findById(id);

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        const teamAdminId = team.adminId.toString();

        // Use PermissionChecker to verify admin access
        PermissionChecker.requireAdminOfTeam(req, teamAdminId);

        // Prevent admin from removing themselves
        const currentUserIdStr = (req.user as any)._id.toString();
        if (userId.toString() === currentUserIdStr) {
            return ApiResponseUtil.error(res, 'Team admin cannot remove themselves from the team', 400);
        }

        // Verify user exists and is part of the team
        const user = await User.findById(userId);

        if (!user) {
            return ApiResponseUtil.error(res, 'User not found', 404);
        }

        if (user.teamId?.toString() !== id.toString()) {
            return ApiResponseUtil.error(res, 'User is not a member of this team', 400);
        }

        // Remove team reference and reset role
        await User.findByIdAndUpdate(userId, {
            $unset: { teamId: '' },
            role: UserRole.CANDIDATE,
        });

        return ApiResponseUtil.success(res, null, 'Member removed from team successfully');
    })
);

/**
 * @route   GET /api/teams/:id/groups
 * @desc    Get all groups for a team
 * @access  Private (Team Members)
 * @permissions Team members can view team groups
 */
router.get(
    '/:id/groups',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
        if (!req.user) {
            return ApiResponseUtil.error(res, 'Authentication required', 401);
        }

        const id = objectIdSchema.parse(req.params.id);

        const team = await Team.findById(id);

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        // Use PermissionChecker to verify team access
        PermissionChecker.requireTeamAccess(req, req.params.id);

        // Get all groups for this team
        const groups = await Group.find({ teamId: id })
            .populate('members', 'name email role')
            .populate('createdBy', 'name email');

        return ApiResponseUtil.success(res, groups, 'Team groups retrieved successfully');
    })
);

/**
 * @route   POST /api/teams/:id/groups
 * @desc    Create a new group within a team
 * @access  Private (Team Admin only)
 * @permissions Only team admin can create groups
 */
router.post(
    '/:id/groups',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
        if (!req.user) {
            return ApiResponseUtil.error(res, 'Authentication required', 401);
        }

        const id = objectIdSchema.parse(req.params.id);
        const data = createGroupSchema.parse(req.body);

        const team = await Team.findById(id);

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        const teamAdminId = team.adminId.toString();
        const userId = (req.user as any)._id;

        // Use PermissionChecker to verify admin access
        PermissionChecker.requireAdminOfTeam(req, teamAdminId);

        // Verify all members belong to this team if members are provided
        if (data.members && data.members.length > 0) {
            const members = await User.find({
                _id: { $in: data.members },
                teamId: id,
            });

            if (members.length !== data.members.length) {
                return ApiResponseUtil.error(
                    res,
                    'One or more members do not belong to this team',
                    400
                );
            }
        }

        // Create the group
        const group = await Group.create({
            name: data.name,
            members: data.members ?? [],
            teamId: id,
            createdBy: userId,
        });

        // Update users' groupIds
        if (data.members && data.members.length > 0) {
            await User.updateMany(
                { _id: { $in: data.members } },
                { $addToSet: { groupIds: group._id } }
            );
        }

        const populatedGroup = await Group.findById(group._id)
            .populate('members', 'name email role')
            .populate('createdBy', 'name email');

        return ApiResponseUtil.success(res, populatedGroup, 'Group created successfully', 201);
    })
);

/**
 * @route   DELETE /api/teams/:id/groups
 * @desc    Delete multiple groups from a team (bulk)
 * @access  Private (Team Admin only)
 * @permissions Only team admin can delete groups
 */
router.delete(
    '/:id/groups',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
        if (!req.user) {
            return ApiResponseUtil.error(res, 'Authentication required', 401);
        }

        const id = objectIdSchema.parse(req.params.id);
        const { groupIds } = removeGroupsSchema.parse(req.body);

        const team = await Team.findById(id);

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        const teamAdminId = team.adminId.toString();

        // Use PermissionChecker to verify admin access
        PermissionChecker.requireAdminOfTeam(req, teamAdminId);

        // Verify all groups belong to this team
        const groups = await Group.find({
            _id: { $in: groupIds },
            teamId: id,
        });

        if (groups.length !== groupIds.length) {
            return ApiResponseUtil.error(res, 'One or more groups do not belong to this team', 400);
        }

        // Remove group references from all users
        await User.updateMany({ groupIds: { $in: groupIds } }, { $pull: { groupIds: { $in: groupIds } } });

        // Delete the groups
        await Group.deleteMany({ _id: { $in: groupIds } });

        return ApiResponseUtil.success(res, null, 'Groups deleted successfully');
    })
);

/**
 * @route   DELETE /api/teams/:id/groups/:groupId
 * @desc    Delete a single group from a team
 * @access  Private (Team Admin only)
 * @permissions Only team admin can delete groups
 */
router.delete(
    '/:id/groups/:groupId',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
        if (!req.user) {
            return ApiResponseUtil.error(res, 'Authentication required', 401);
        }

        const id = objectIdSchema.parse(req.params.id);
        const groupId = objectIdSchema.parse(req.params.groupId);

        const team = await Team.findById(id);

        if (!team) {
            return ApiResponseUtil.error(res, 'Team not found', 404);
        }

        const teamAdminId = team.adminId.toString();

        // Use PermissionChecker to verify admin access
        PermissionChecker.requireAdminOfTeam(req, teamAdminId);

        // Verify group exists and belongs to this team
        const group = await Group.findOne({ _id: groupId, teamId: id });

        if (!group) {
            return ApiResponseUtil.error(res, 'Group not found or does not belong to this team', 404);
        }

        // Remove group reference from all users
        await User.updateMany({ groupIds: groupId }, { $pull: { groupIds: groupId } });

        // Delete the group
        await Group.findByIdAndDelete(groupId);

        return ApiResponseUtil.success(res, null, 'Group deleted successfully');
    })
);

/* ---------------------------- Error handler ------------------------------ */

/**
 * Error handling middleware for team routes
 * Handles Zod validation errors and Mongoose validation errors
 */
router.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Handle Zod validation errors
    if (err?.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            issues: err.issues,
        });
    }

    // Handle Mongoose validation errors
    if (err?.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: err.errors,
        });
    }

    // Handle authorization errors
    if (err?.message?.includes('Access denied') || err?.message?.includes('permission')) {
        return res.status(403).json({
            success: false,
            error: err.message || 'Access denied',
        });
    }

    // Log unexpected errors
    console.error('Team routes error:', err);

    // Handle all other errors
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error',
    });
});

export default router;
