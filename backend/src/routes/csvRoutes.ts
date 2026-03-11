import { Router } from 'express';
import { uploadCsv } from '../utils/csvUtils';
import { importInterviewers } from '../controllers/csv/importInterviewers';
import { importCandidates } from '../controllers/csv/importCandidates';
import { exportInterviewers } from '../controllers/csv/exportInterviewers';
import { exportCandidates } from '../controllers/csv/exportCandidates';
import { exportAvailability } from '../controllers/csv/exportAvailability';
import { getInterviewerTemplate } from '../controllers/csv/getInterviewerTemplate';
import { getCandidateTemplate } from '../controllers/csv/getCandidateTemplate';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * CSV Import/Export Routes
 * Handles batch operations for importing and exporting user data via CSV
 * 
 * NOTE: Routes currently allow unauthenticated access for testing.
 * In production, add `authenticate` middleware to verify user permissions.
 * Example: router.post('/import/interviewers', authenticate, uploadCsv, asyncHandler(importInterviewers));
 */

// ============================================================================
// IMPORTS - Batch create/update users from CSV files
// ============================================================================

/**
 * POST /api/csv/import/interviewers
 * Import interviewers from CSV file
 * Required field: file (multipart form data)
 * @example
 * const formData = new FormData();
 * formData.append('file', csvFile);
 * fetch('/api/csv/import/interviewers', { method: 'POST', body: formData });
 */
router.post('/import/interviewers', uploadCsv, asyncHandler(importInterviewers));

/**
 * POST /api/csv/import/candidates
 * Import candidates from CSV file
 * Required field: file (multipart form data)
 */
router.post('/import/candidates', uploadCsv, asyncHandler(importCandidates));

// ============================================================================
// EXPORTS - Download user data as CSV files
// ============================================================================

/**
 * GET /api/csv/export/interviewers
 * Export all interviewers to CSV file
 */
router.get('/export/interviewers', asyncHandler(exportInterviewers));

/**
 * GET /api/csv/export/candidates
 * Export all candidates to CSV file
 */
router.get('/export/candidates', asyncHandler(exportCandidates));

/**
 * GET /api/csv/export/availability
 * Export availability data to CSV file
 * Optional query parameters:
 *   - teamId: Filter by team
 *   - userId: Filter by user
 *   - start: Filter by start date (ISO format)
 *   - end: Filter by end date (ISO format)
 */
router.get('/export/availability', asyncHandler(exportAvailability));

// ============================================================================
// TEMPLATES - Download CSV import templates with headers and examples
// ============================================================================

/**
 * GET /api/csv/templates/interviewers
 * Get CSV template for interviewer imports with headers and example row
 */
router.get('/templates/interviewers', getInterviewerTemplate);

/**
 * GET /api/csv/templates/candidates
 * Get CSV template for candidate imports with headers and example row
 */
router.get('/templates/candidates', getCandidateTemplate);

export default router;
