import multer from 'multer';
import Papa from 'papaparse';

/**
 * Configure multer for in-memory CSV file uploads
 * Accepts single file with field name 'file'
 */
export const uploadCsv = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB limit
    },
    fileFilter: (_req, file, cb) => {
        if (
            file.mimetype === 'text/csv' ||
            file.mimetype === 'application/vnd.ms-excel' ||
            file.originalname.endsWith('.csv')
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    },
}).single('file');

/**
 * Parse a CSV file using Papa Parse
 * Returns array of objects with headers as keys
 */
export async function parseCsvFile(file: Express.Multer.File): Promise<Record<string, any>[]> {
    return new Promise((resolve, reject) => {
        const csvString = file.buffer.toString('utf-8');
        Papa.parse(csvString as any, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
                resolve(results.data as Record<string, any>[]);
            },
            error: (error: any) => {
                reject(new Error(`CSV parsing failed: ${error.message}`));
            },
        });
    });
}

/**
 * Generate CSV string from array of objects
 * @param data Array of objects to convert to CSV
 * @param headers Array of column headers (in desired order)
 * @returns CSV formatted string
 */
export function generateCsv(data: Record<string, any>[], headers: string[]): string {
    return Papa.unparse({
        fields: headers,
        data: data.map((row) =>
            headers.reduce(
                (acc, header) => {
                    acc[header] = row[header] ?? '';
                    return acc;
                },
                {} as Record<string, any>
            )
        ),
    });
}

/**
 * Generate a CSV template with headers and optional example row
 * @param headers Array of column headers
 * @param example Optional example data row
 * @returns CSV formatted string with headers and example
 */
export function makeCsvTemplate(
    headers: string[],
    example?: Record<string, any>
): string {
    const data = example ? [example] : [];
    return Papa.unparse({
        fields: headers,
        data,
    });
}
