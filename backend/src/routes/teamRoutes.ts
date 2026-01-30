import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
    createTeam,
    getTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    getTeamMembers,
    addTeamMembers,
    removeTeamMembers,
    removeSingleTeamMember,
    getTeamGroups,
    createTeamGroup,
    deleteTeamGroups,
    deleteSingleTeamGroup,
    getTeamSettings,
    updateTeamSettings,
    getTeamInterviewers,
    teamErrorHandler,
} from '../controllers/team';

const router = Router();

/**
 * @route   POST /api/teams
 * @desc    Create a new team
 * @access  Private (Authenticated users - creator becomes admin)
 * @permissions Any authenticated user can create a team and becomes its admin
 */
router.post('/', requireAuth, asyncHandler(createTeam));

/**
 * @route   GET /api/teams
 * @desc    Get user's own team or all teams (admin only)
 * @access  Private (All authenticated users)
 * @permissions Users can view their own team, admins can view all teams
 */
router.get('/', requireAuth, asyncHandler(getTeams));

/**
 * @route   GET /api/teams/:id
 * @desc    Get team by ID with optional population
 * @access  Private (Team Members)
 * @permissions Users can only view their own team
 */
router.get('/:id', requireAuth, asyncHandler(getTeamById));

/**
 * @route   PUT /api/teams/:id
 * @desc    Update team details
 * @access  Private (Team Admin only)
 * @permissions Only the team's admin can update team details
 */
router.put('/:id', requireAuth, asyncHandler(updateTeam));

/**
 * @route   DELETE /api/teams/:id
 * @desc    Delete team by ID
 * @access  Private (Team Admin only)
 * @permissions Only the team's admin can delete the team
 */
router.delete('/:id', requireAuth, asyncHandler(deleteTeam));

/**
 * @route   GET /api/teams/:id/members
 * @desc    Get all team members
 * @access  Private (Team Members)
 * @permissions Team members can view the member list
 */
router.get('/:id/members', requireAuth, asyncHandler(getTeamMembers));

/**
 * @route   POST /api/teams/:id/members
 * @desc    Add members to team
 * @access  Private (Team Admin only)
 * @permissions Only team admin can add members
 */
router.post('/:id/members', requireAuth, asyncHandler(addTeamMembers));

/**
 * @route   DELETE /api/teams/:id/members
 * @desc    Remove multiple members from team (bulk)
 * @access  Private (Team Admin only)
 * @permissions Only team admin can remove members
 */
router.delete('/:id/members', requireAuth, asyncHandler(removeTeamMembers));

/**
 * @route   DELETE /api/teams/:id/members/:userId
 * @desc    Remove a single member from team
 * @access  Private (Team Admin only)
 * @permissions Only team admin can remove members
 */
router.delete('/:id/members/:userId', requireAuth, asyncHandler(removeSingleTeamMember));

/**
 * @route   GET /api/teams/:id/groups
 * @desc    Get all groups for a team
 * @access  Private (Team Members)
 * @permissions Team members can view team groups
 */
router.get('/:id/groups', requireAuth, asyncHandler(getTeamGroups));

/**
 * @route   POST /api/teams/:id/groups
 * @desc    Create a new group within a team
 * @access  Private (Team Admin only)
 * @permissions Only team admin can create groups
 */
router.post('/:id/groups', requireAuth, asyncHandler(createTeamGroup));

/**
 * @route   DELETE /api/teams/:id/groups
 * @desc    Delete multiple groups from a team (bulk)
 * @access  Private (Team Admin only)
 * @permissions Only team admin can delete groups
 */
router.delete('/:id/groups', requireAuth, asyncHandler(deleteTeamGroups));

/**
 * @route   DELETE /api/teams/:id/groups/:groupId
 * @desc    Delete a single group from a team
 * @access  Private (Team Admin only)
 * @permissions Only team admin can delete groups
 */
router.delete('/:id/groups/:groupId', requireAuth, asyncHandler(deleteSingleTeamGroup));

/**
 * @route   GET /api/teams/:id/settings
 * @desc    Get team settings
 * @access  Private (Team Members)
 * @permissions Team members can view team settings
 */
router.get('/:id/settings', requireAuth, asyncHandler(getTeamSettings));

/**
 * @route   PUT /api/teams/:id/settings
 * @desc    Update team settings
 * @access  Private (Team Admin only)
 * @permissions Only team admin can update team settings
 */
router.put('/:id/settings', requireAuth, asyncHandler(updateTeamSettings));

/**
 * @route   GET /api/teams/:id/interviewers
 * @desc    Get all interviewers for a team
 * @access  Private (Team Members)
 * @permissions Team members can view team interviewers
 */
router.get('/:id/interviewers', requireAuth, asyncHandler(getTeamInterviewers));

/* ---------------------------- Error handler ------------------------------ */

router.use(teamErrorHandler);

export default router;
