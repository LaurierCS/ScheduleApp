import { Router, Request, Response, NextFunction } from 'express';
import mongoose, { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { ApiResponseUtil } from '../utils/apiResponse';
import { requireAuth, requireRole, AuthRequest } from '../middleware/authMiddleware';
import User, { UserRole } from '../models/user';
import { PermissionChecker } from '../utils/permissions';
import Group, { GroupType } from '../models/group';

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
 * Zod schema for arrays of ObjectIds (with default empty array)
 */
const objectIdArrayDefault = z.array(objectIdSchema).default([]);

/* --------------------------- Validation Schemas ---------------------------------- */

/**
 * Schema for group-specific settings
 */
const groupSettingsSchema = z.object({
    availabilityOverride: z.boolean().default(false),
    priority: z.number().min(0, 'Priority cannot be negative').default(0),
}).default({ availabilityOverride: false, priority: 0 });

/**
 * Schema for creating a new group
 */
const createGroupSchema = z.object({
    name: z.string().min(1, 'name is required').trim(),
    description: z.string().trim().optional(),
    type: z.nativeEnum(GroupType).default(GroupType.BOTH),
    members: objectIdArrayDefault,
    candidates: objectIdArrayDefault,
    teamId: objectIdSchema,
    settings: groupSettingsSchema.optional(),
});

/**
 * Schema for updating a group (teamId not allowed)
 */
const updateGroupSchema = z.object({
    name: z.string().min(1).trim().optional(),
    description: z.string().trim().optional(),
    type: z.nativeEnum(GroupType).optional(),
    settings: z.object({
        availabilityOverride: z.boolean().optional(),
        priority: z.number().min(0, 'Priority cannot be negative').optional(),
    }).optional(),
});

/**
 * Schema for adding a member to a group
 */
const addMemberSchema = z.object({
    userId: objectIdSchema,
});

/**
 * Schema for filtering groups
 */
const groupFilterSchema = z.object({
    type: z.nativeEnum(GroupType).optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
});

/* ------------------------------ Routes ----------------------------------- */

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
            return ApiResponseUtil.success(res, { items: [], page: 1, limit: 20, total: 0 }, 'No team assigned');
        }

        // Parse and validate query parameters
        const filters = groupFilterSchema.parse(req.query);
        const { type, search, page, limit } = filters;

        // Build filter query
        const filter: any = { teamId: userTeamId };

        // Filter by type if provided
        if (type) {
            filter.type = type;
        }

        // Search by name (case-insensitive partial match) if provided
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count for pagination metadata
        const total = await Group.countDocuments(filter);

        // Get paginated groups
        const groups = await Group.find(filter)
            .populate('createdBy', 'name email')
            .populate('members', 'name email role')
            .populate('candidates', 'name email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        ApiResponseUtil.success(res, { items: groups, page, limit, total }, 'Groups retrieved successfully');
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
router.post('/', requireAuth, requireRole([UserRole.ADMIN]), async (req: AuthRequest, res, next) => {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const data = createGroupSchema.parse(req.body);
        const userId = (req.user as any)._id;
        const teamId = data.teamId;

        // Verify user has access to this team
        PermissionChecker.requireTeamAccess(req, teamId.toString());

        // Verify all members belong to this team if provided
        if (data.members && data.members.length > 0) {
            const members = await User.find({
                _id: { $in: data.members },
                teamId: teamId,
            });

            if (members.length !== data.members.length) {
                return ApiResponseUtil.error(
                    res,
                    'One or more members do not belong to this team',
                    400
                );
            }
        }

        // Verify all candidates belong to this team and have candidate role if provided
        if (data.candidates && data.candidates.length > 0) {
            const candidates = await User.find({
                _id: { $in: data.candidates },
                teamId: teamId,
                role: UserRole.CANDIDATE,
            });

            if (candidates.length !== data.candidates.length) {
                return ApiResponseUtil.error(
                    res,
                    'One or more candidates do not belong to this team or are not candidates',
                    400
                );
            }
        }

        // Create the group
        const group = await Group.create({
            name: data.name,
            description: data.description,
            type: data.type,
            members: data.members ?? [],
            candidates: data.candidates ?? [],
            teamId: teamId,
            createdBy: userId,
            settings: data.settings ?? { availabilityOverride: false, priority: 0 },
        });

        // Update users' groupIds for members
        if (data.members && data.members.length > 0) {
            await User.updateMany(
                { _id: { $in: data.members } },
                { $addToSet: { groupIds: group._id } }
            );
        }

        // Update users' groupIds for candidates
        if (data.candidates && data.candidates.length > 0) {
            await User.updateMany(
                { _id: { $in: data.candidates } },
                { $addToSet: { groupIds: group._id } }
            );
        }

        const populatedGroup = await Group.findById(group._id)
            .populate('members', 'name email role')
            .populate('candidates', 'name email role')
            .populate('createdBy', 'name email');

        return ApiResponseUtil.success(res, populatedGroup, 'Group created successfully', 201);
    } catch (error) {
        next(error);
    }
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

        // Parse and validate request body
        const data = updateGroupSchema.parse(req.body);

        // Build update object - only allowed fields (not teamId, members, candidates)
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.settings !== undefined) {
            if (data.settings.availabilityOverride !== undefined) {
                updateData['settings.availabilityOverride'] = data.settings.availabilityOverride;
            }
            if (data.settings.priority !== undefined) {
                updateData['settings.priority'] = data.settings.priority;
            }
        }

        // Update group with validated data
        const updatedGroup = await Group.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate('members', 'name email role')
            .populate('candidates', 'name email role')
            .populate('createdBy', 'name email');

        ApiResponseUtil.success(res, updatedGroup, 'Group updated successfully');
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

        // Remove group reference from all users (members and candidates)
        // This cleans up the bidirectional sync
        await User.updateMany(
            { groupIds: group._id },
            { $pull: { groupIds: group._id } }
        );

        // Delete the group
        await Group.findByIdAndDelete(group._id);

        ApiResponseUtil.success(res, null, 'Group deleted successfully');
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

        // Parse and validate request body
        const data = addMemberSchema.parse(req.body);
        const userId = data.userId;

        // Verify user exists and belongs to the same team
        const user = await User.findById(userId);
        if (!user) {
            return ApiResponseUtil.error(res, 'User not found', 404);
        }

        if (user.teamId?.toString() !== groupTeamId) {
            return ApiResponseUtil.error(res, 'User does not belong to the same team as this group', 400);
        }

        // Determine which array to add to based on user role
        // INTERVIEWER or ADMIN -> members array
        // CANDIDATE -> candidates array
        const updateField = user.role === UserRole.CANDIDATE ? 'candidates' : 'members';

        // Add user to the appropriate array using $addToSet (prevents duplicates)
        await Group.findByIdAndUpdate(
            group._id,
            { $addToSet: { [updateField]: userId } }
        );

        // Update user's groupIds (bidirectional sync)
        await User.findByIdAndUpdate(
            userId,
            { $addToSet: { groupIds: group._id } }
        );

        // Return updated group with populated fields
        const updatedGroup = await Group.findById(group._id)
            .populate('members', 'name email role')
            .populate('candidates', 'name email role')
            .populate('createdBy', 'name email');

        ApiResponseUtil.success(res, updatedGroup, 'Member added to group successfully');
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

        // Validate userId parameter
        if (!isValidObjectId(req.params.userId)) {
            return ApiResponseUtil.error(res, 'Invalid userId format', 400);
        }

        const userId = toObjectId(req.params.userId);

        // Remove user from both members and candidates arrays (idempotent - no error if not present)
        await Group.findByIdAndUpdate(
            group._id,
            {
                $pull: {
                    members: userId,
                    candidates: userId,
                }
            }
        );

        // Remove group from user's groupIds (bidirectional sync cleanup)
        await User.findByIdAndUpdate(
            userId,
            { $pull: { groupIds: group._id } }
        );

        // Return updated group with populated fields
        const updatedGroup = await Group.findById(group._id)
            .populate('members', 'name email role')
            .populate('candidates', 'name email role')
            .populate('createdBy', 'name email');

        ApiResponseUtil.success(res, updatedGroup, 'Member removed from group successfully');
    } catch (error) {
        next(error);
    }
});

/* ---------------------------- Error handler ------------------------------ */

/**
 * Error handling middleware for group routes
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
    console.error('Group routes error:', err);

    // Handle all other errors
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error',
    });
});

export default router;