import { Router } from 'express';
import { getDbStatus, getSystemStatus } from '../controllers/status';

const router = Router();

/**
 * @route   GET /api/status/db
 * @desc    Check MongoDB connection status
 * @access  Public
 */
router.get('/db', getDbStatus);

/**
 * @route   GET /api/status
 * @desc    Check overall system status
 * @access  Public
 */
router.get('/', getSystemStatus);

export default router; 