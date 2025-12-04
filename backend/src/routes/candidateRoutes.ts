import { Router } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';
import { requireAuth, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import { PermissionChecker } from '../utils/permissions';
import User from '../models/user';
import Candidate, { CandidateStatus } from '../models/candidate';
import { ServerError, ValidationError } from '../errors';
import  {isValidObjectId, Schema} from 'mongoose';
import { z } from 'zod';
import Meeting from '../models/meeting';
import Availability from '../models/availability';


const router = Router();

/**
 * Zod schema for validating ObjectId strings
 */
const objectIdSchema = z
    .string()
    .trim()
    .refine((v: string) => isValidObjectId(v), { message: 'Invalid ObjectId' });

/**
 * Zod schema for arrays of ObjectIds (plain - for validation requiring minimum)
 */
const objectIdArrayPlain = z.array(objectIdSchema);

/**
 * Zod schema for arrays of ObjectIds (with default empty array)
 */
const objectIdArrayDefault = z.array(objectIdSchema).default([]);


/* --------------------------- Validation Schemas ---------------------------------- */

/**
 * Schema for creating a new candidate
 */
const createCandidateSchema = z.object({
    name: z.string().min(1, 'name is required').trim(),
    email: z.email("Invalid email format"),
    password: z.string().min(6, 'password must be at least 6 characters'),
    groupIds: objectIdArrayDefault,
    resumeUrl: z.string().default(""),
    year: z.number().optional(),
    program: z.string().default(""),
});
/**
 * Schema for updating an existing candidate
 */
// Change validation type for certain properties while keeping the rest the same but optional
const updateCandidateSchema = createCandidateSchema
    .omit({password: true})
    .partial()
    .extend({
        groupIds: objectIdArrayPlain.optional(),
        resumeUrl: z.string().optional(),
        program: z.string().optional(),
    })

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

        const { name, email, status, groupIds } = req.query;

        const filter: any =  {};

        if (name) filter.name = name;

        if (email) {

            // Prevent invalid email formats
            if (!(typeof email == "string" && /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)))
                return next(new ValidationError(undefined, "Please enter a valid email"));
                
            filter.email = email;
        } 
        if (status) {

            // Invalid status provided
            if (!(typeof status === "string" && Object.values(CandidateStatus).includes(status as CandidateStatus)))
                return next(new ValidationError(undefined, "Please enter a valid Candidate status"));
                
            filter.status = status;
        };
        if (groupIds) {

            if (!Array.isArray(groupIds)) 
                return next(new ValidationError(undefined, "groupIds must be an array"));
            
            const isValidIds = groupIds.every(id => typeof id === "string" && isValidObjectId(id));
            
            if (!isValidIds)
                return next(new ValidationError(undefined, "groupIds must be an array of valid Group objectIds"));


            filter.groupIds = { $in: groupIds };
        };

        // Can only GET candidates in the same team
        filter.teamId = userTeamId;

        const candidates = await Candidate.find(filter)
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
router.post('/', requireAuth, requireRole([UserRole.ADMIN]), async (req: AuthRequest, res, next) => {
    try {

        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const userTeamId = req.user.teamId

        if (!userTeamId) {
            return ApiResponseUtil.success(res, [], 'No team assigned');
        }

        const result = createCandidateSchema.safeParse(req.body);

        if (!result.success) {
            return next(new ValidationError(undefined, z.prettifyError(result.error)));
        }
        else {
            const body = result.data;

            const candidate = await Candidate.create({
                name: body.name,
                email: body.email,
                password: body.password,
                groupIds: body.groupIds,
                status: CandidateStatus.PENDING,
                teamId: userTeamId,
                resumeUrl: body.resumeUrl,
                year: body.year,
                program: body.program
            });

            // Remove password property from the response
            const {password, ...candidateObj} = candidate.toObject();

            return ApiResponseUtil.success(res, candidateObj, 'Candidate created successfully', 201);
        }
    } catch (err) {
        return next(new ServerError())
    }
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

        const candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            return ApiResponseUtil.error(res, 'Candidate not found', 404);
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

        // Validate request body
        const result = updateCandidateSchema.safeParse(req.body);

        if (!result.success) {
            return next(new ValidationError(undefined, z.prettifyError(result.error)));
        }
        else {
            const { name, email, groupIds, resumeUrl, year, program } = result.data;

            // Parse optional update parameters
            if (name !== undefined) candidate.name = name;
            if (email !== undefined) candidate.email = email;
            if (groupIds !== undefined) candidate.groupIds = groupIds.map(id => new Schema.Types.ObjectId(id));
            if (resumeUrl !== undefined) candidate.resumeUrl = resumeUrl;
            if (year !== undefined) candidate.year = year;
            if (program !== undefined) candidate.program = program;

            await candidate.save();

             // Remove password property from the response
            const {password, ...candidateObj} = candidate.toObject();

            // - Return updated candidate (without password)
            ApiResponseUtil.success(res, candidateObj, `Update candidate ${req.params.id}`);
        }

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

        const currentUserTeamId = req.user.teamId?.toString();
        const candidateTeamId = candidate.teamId?.toString();

        // Ensure candidate is in the same team
        if (currentUserTeamId !== candidateTeamId) {
            return ApiResponseUtil.error(res, 'Access denied: you can only delete candidates in your team', 403);
        }

        // Check if candidate has associated resources (meetings, availability)
        const meetings = await Meeting.find({candidateId: candidate._id});
        const availability = await Availability.find({userId: candidate._id})
        // Prevent deletion if resources exist
        if (meetings.length > 0 || availability.length > 0) {
            return next(new Error("Candidate has associated meetings or availabilities defined - preventing deletion."))
        }

        // - Delete candidate from database
        await Candidate.findByIdAndDelete(candidate._id);

        // - Return success response
        ApiResponseUtil.success(res, null, `Candidate ${req.params.id} deleted successfully.`);
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


        // Query Availability model for candidate's availability records
        const availability = await Availability.find({userId: candidate._id});


        // Return availability data
        ApiResponseUtil.success(
            res,
            availability,
            `Availability of candidate ${req.params.id}`
        );
    } catch (error) {
        next(error);
    }
});

export default router;