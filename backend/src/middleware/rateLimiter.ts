import { Request, Response, NextFunction } from 'express';

type RateMap = Map<string, number[]>;

export default function rateLimiter(options?: { windowMs?: number; max?: number }) {
    const windowMs = options?.windowMs ?? 60_000; // 1 minute
    const max = options?.max ?? 60;

    // Use module-level map to persist counters across requests
    const hits: RateMap = new Map();

    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const key = (req as any).user ? (req as any).user._id?.toString() : req.ip;
            const now = Date.now();

            const timestamps = hits.get(key) || [];
            const windowStart = now - windowMs;
            const recent = timestamps.filter(t => t > windowStart);

            recent.push(now);
            hits.set(key, recent);

            if (recent.length > max) {
                return res.status(429).json({ success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later.' } });
            }

            next();
        } catch (err) {
            next(err as any);
        }
    };
}
