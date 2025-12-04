/**
 * Email service module exports
 * Provides centralized access to email functionality
 */

export { EmailService, emailService } from './EmailService';
export { emailQueue, startEmailWorker, closeEmailQueue, getQueueStats } from './queue';
export { emailRateLimiter } from './rateLimiter';
export * from './types';
export * from './templates';

