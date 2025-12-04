/**
 * Rate limiter for email sending
 * Prevents exceeding email provider rate limits
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class EmailRateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private maxEmails: number;
  private windowMs: number;

  constructor(maxEmails: number = 100, windowMs: number = 60000) {
    this.maxEmails = maxEmails;
    this.windowMs = windowMs;
  }

  /**
   * Check if email can be sent (within rate limit)
   * @param key - Optional key for different rate limit buckets (e.g., by recipient domain)
   * @returns true if email can be sent, false if rate limit exceeded
   */
  canSend(key: string = 'default'): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      // First email in this window
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    // Check if window has expired
    if (now > entry.resetTime) {
      // Reset window
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    // Check if limit exceeded
    if (entry.count >= this.maxEmails) {
      return false;
    }

    // Increment count
    entry.count++;
    return true;
  }

  /**
   * Get remaining emails in current window
   */
  getRemaining(key: string = 'default'): number {
    const entry = this.limits.get(key);
    if (!entry) {
      return this.maxEmails;
    }

    const now = Date.now();
    if (now > entry.resetTime) {
      return this.maxEmails;
    }

    return Math.max(0, this.maxEmails - entry.count);
  }

  /**
   * Get time until rate limit resets (in milliseconds)
   */
  getTimeUntilReset(key: string = 'default'): number {
    const entry = this.limits.get(key);
    if (!entry) {
      return 0;
    }

    const now = Date.now();
    return Math.max(0, entry.resetTime - now);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string = 'default'): void {
    this.limits.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.limits.clear();
  }
}

// Export singleton instance
export const emailRateLimiter = new EmailRateLimiter(
  parseInt(process.env.EMAIL_RATE_LIMIT_MAX || '100', 10),
  parseInt(process.env.EMAIL_RATE_LIMIT_WINDOW_MS || '60000', 10)
);

