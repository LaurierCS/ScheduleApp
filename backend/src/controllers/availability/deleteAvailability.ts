import { Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
import { PermissionChecker } from '../../utils/permissions';
import Availability from '../../models/availability';

/**
 * @route   DELETE /api/availability/:id
 * @desc    Delete availability by ID
 * @access  Private (Owner only)
 * @permissions Only the availability owner can delete it
 */
export async function deleteAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new Error('Authentication required'));
        }

        const availability = await Availability.findById(req.params.id);

        if (!availability) {
            return ApiResponseUtil.error(res, 'Availability not found', 404);
        }

        const availabilityOwnerId = availability.userId.toString();

        // Use PermissionChecker to verify ownership
        PermissionChecker.requireOwnership(req, availabilityOwnerId);

        // Delete the availability
        await Availability.findByIdAndDelete(req.params.id);

        ApiResponseUtil.success(res, { id: req.params.id }, 'Availability deleted successfully');
    } catch (error) {
        next(error);
    }
}
