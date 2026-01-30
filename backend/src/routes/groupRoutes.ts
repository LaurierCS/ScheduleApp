import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import {
    getGroups,
    createGroup,
    getGroupById,
    updateGroup,
    deleteGroup,
    getGroupMembers,
    addGroupMember,
    removeGroupMember,
    groupErrorHandler,
} from '../controllers/group';

const router = Router();

/**
 * @route   GET /api/groups
 * @desc    Get all groups in user's team (with pagination)
 * @access  Private (All authenticated users)
 * @permissions Users can view groups in their team
 */
router.get('/', authenticate, getGroups);

/**
 * @route   POST /api/groups
 * @desc    Create a new group
 * @access  Private (Admin)
 * @permissions Only admins can create groups
 */
router.post('/', authenticate, authorize(UserRole.ADMIN), createGroup);

/**
 * @route   GET /api/groups/:id
 * @desc    Get group by ID
 * @access  Private (Team Members)
 * @permissions Users can view groups in their team
 */
router.get('/:id', authenticate, getGroupById);

/**
 * @route   PUT /api/groups/:id
 * @desc    Update group by ID
 * @access  Private (Admin in same team)
 * @permissions Only admins in the same team can update groups
 */
router.put('/:id', authenticate, authorize(UserRole.ADMIN), updateGroup);

/**
 * @route   DELETE /api/groups/:id
 * @desc    Delete group by ID
 * @access  Private (Admin in same team)
 * @permissions Only admins in the same team can delete groups
 */
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteGroup);

/**
 * @route   GET /api/groups/:id/members
 * @desc    Get all group members
 * @access  Private (Team Members)
 * @permissions Users can view members of groups in their team
 */
router.get('/:id/members', authenticate, getGroupMembers);

/**
 * @route   POST /api/groups/:id/members
 * @desc    Add member to group
 * @access  Private (Admin in same team)
 * @permissions Only admins in the same team can add members to groups
 */
router.post('/:id/members', authenticate, authorize(UserRole.ADMIN), addGroupMember);

/**
 * @route   DELETE /api/groups/:id/members/:userId
 * @desc    Remove member from group
 * @access  Private (Admin in same team)
 * @permissions Only admins in the same team can remove members from groups
 */
router.delete('/:id/members/:userId', authenticate, authorize(UserRole.ADMIN), removeGroupMember);

/* ---------------------------- Error handler ------------------------------ */

router.use(groupErrorHandler);

export default router;