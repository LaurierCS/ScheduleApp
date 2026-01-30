import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../models/user';
import {
    generateSchedule,
    getTeamSchedule,
    getScheduleConflicts,
    optimizeSchedule,
    publishSchedule,
} from '../controllers/schedule';

const router = Router();

/**
 * @route   POST /api/schedule/generate
 * @desc    Auto-generate optimal schedule based on availabilities
 * @access  Private (Admin in same team)
 * @permissions Only admins can generate schedules for their team
 */
router.post('/generate', authenticate, authorize(UserRole.ADMIN), generateSchedule);

/**
 * @route   GET /api/schedule/team/:teamId
 * @desc    Get schedule for a team
 * @access  Private (Team Members)
 * @permissions Team members can view their team's schedule
 */
router.get('/team/:teamId', authenticate, getTeamSchedule);

/**
 * @route   GET /api/schedule/conflicts
 * @desc    Check for scheduling conflicts in user's team
 * @access  Private (Admin)
 * @permissions Admins can check for conflicts in their team
 */
router.get('/conflicts', authenticate, authorize(UserRole.ADMIN), getScheduleConflicts);

/**
 * @route   POST /api/schedule/optimize
 * @desc    Optimize existing schedule for user's team
 * @access  Private (Admin)
 * @permissions Admins can optimize schedules for their team
 */
router.post('/optimize', authenticate, authorize(UserRole.ADMIN), optimizeSchedule);

/**
 * @route   POST /api/schedule/publish/:teamId
 * @desc    Publish schedule for a team
 * @access  Private (Admin in same team)
 * @permissions Only admins can publish schedules for their team
 */
router.post('/publish/:teamId', authenticate, authorize(UserRole.ADMIN), publishSchedule);

export default router;