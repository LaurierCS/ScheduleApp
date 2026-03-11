import { Request, Response } from 'express';
import Availability from '../../models/availability';
import { generateCsv } from '../../utils/csvUtils';

/**
 * Export availability data to CSV format
 * Exports availability records with user email, time slots, and recurrence info
 * Supports optional filtering by teamId, userId, and date range (start/end)
 * Sets appropriate response headers for CSV download
 */
export async function exportAvailability(req: Request, res: Response): Promise<void> {
    try {
        const { teamId, userId, start, end } = req.query;

        // Build query filter
        const filter: Record<string, any> = {};

        if (teamId) {
            filter.teamId = teamId;
        }

        if (userId) {
            filter.userId = userId;
        }

        if (start || end) {
            filter.startTime = {};
            if (start) {
                (filter.startTime as Record<string, any>).$gte = new Date(start as string);
            }
            if (end) {
                (filter.startTime as Record<string, any>).$lte = new Date(end as string);
            }
        }

        const availabilities = await Availability.find(filter).populate('userId', 'email').lean();

        const csvHeaders = [
            'userEmail',
            'startTime',
            'endTime',
            'type',
            'timezone',
            'recurring',
            'frequency',
            'interval',
            'createdAt',
        ];

        const csvData = availabilities.map((avail) => ({
            userEmail: (avail.userId as any)?.email ?? '',
            startTime: (avail.startTime as Date).toISOString(),
            endTime: (avail.endTime as Date).toISOString(),
            type: avail.type,
            timezone: avail.timezone ?? 'UTC',
            recurring: avail.recurring ? 'Yes' : 'No',
            frequency: avail.recurrencePattern?.frequency ?? '',
            interval: avail.recurrencePattern?.interval ?? '',
            createdAt: (avail.createdAt as Date).toISOString(),
        }));

        const csv = generateCsv(csvData, csvHeaders);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="availability.csv"');
        res.send(csv);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Export failed';
        res.status(500).json({ message });
    }
}
