import Queue from 'bull';
import { getEmailConfig } from '../../config/email';
import { EmailOptions } from './types';
import { emailService } from './EmailService';
import { logError, logInfo, logWarning } from '../../utils/logger';

/**
 * Redis connection configuration for Bull queue
 * Bull requires Redis - this will throw an error if Redis is not available
 */
const getRedisConfig = () => {
  const redisUrl = process.env.REDIS_URL || process.env.REDISCLOUD_URL;
  
  if (redisUrl) {
    return redisUrl;
  }

  // For development, use local Redis if available
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
  const redisPassword = process.env.REDIS_PASSWORD;

  const config: any = {
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: null, // Required for Bull
  };

  if (redisPassword) {
    config.password = redisPassword;
  }

  return config;
};

/**
 * Email queue configuration
 * Handles email sending with retry logic and rate limiting
 */
export const emailQueue = new Queue<{ options: EmailOptions; config: any }>(
  'email',
  {
    redis: getRedisConfig(),
    defaultJobOptions: {
      removeOnComplete: {
        age: 24 * 3600, // Keep completed jobs for 24 hours
        count: 1000, // Keep max 1000 completed jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // Keep failed jobs for 7 days
      },
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000, // Start with 5 second delay
      },
    },
    settings: {
      maxStalledCount: 1, // Mark job as failed if it stalls
      retryProcessDelay: 5000, // Wait 5 seconds before retrying failed jobs
    },
  }
);

/**
 * Queue event handlers for monitoring
 */
emailQueue.on('completed', (job, result) => {
  logInfo(`Email job completed`, { jobId: job.id, to: job.data.options.to });
});

emailQueue.on('failed', (job, error) => {
  logError(error, `Email job failed`, { jobId: job?.id, to: job?.data?.options?.to });
});

emailQueue.on('stalled', (job) => {
  logWarning(`Email job stalled`, { jobId: job.id });
});

emailQueue.on('error', (error) => {
  logError(error, 'Email queue error');
});

/**
 * Process email jobs from the queue
 * This worker processes emails with retry logic and error handling
 */
export const startEmailWorker = () => {
  emailQueue.process('send-email', async (job) => {
    const { options } = job.data;
    
    try {
      logInfo(`Processing email job`, { jobId: job.id, to: options.to });

      // Use the email service to send the email
      const result = await emailService.sendEmail(options);

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError(error, 'Email worker error', { jobId: job.id, to: options.to });
      
      // Re-throw to trigger Bull's retry mechanism
      throw error;
    }
  });

  logInfo('Email queue worker started');
};

/**
 * Clean up queue on shutdown
 */
export const closeEmailQueue = async (): Promise<void> => {
  await emailQueue.close();
  logInfo('Email queue closed');
};

/**
 * Get queue statistics
 */
export const getQueueStats = async () => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount(),
    emailQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
};

