import dotenv from 'dotenv';

dotenv.config();

/**
 * Email service configuration
 * Supports multiple email providers: SMTP, SendGrid, Mailgun, AWS SES
 */
export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses' | 'test';
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sendgrid?: {
    apiKey: string;
  };
  mailgun?: {
    apiKey: string;
    domain: string;
  };
  ses?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  from: {
    name: string;
    email: string;
  };
  replyTo?: string;
  rateLimit?: {
    maxEmails: number;
    windowMs: number;
  };
  retry?: {
    maxAttempts: number;
    delayMs: number;
  };
}

/**
 * Get email configuration from environment variables
 * Supports different configurations for dev, test, and production
 */
export const getEmailConfig = (): EmailConfig => {
  const env = process.env.NODE_ENV || 'development';
  const provider = (process.env.EMAIL_PROVIDER || 'smtp') as EmailConfig['provider'];

  const config: EmailConfig = {
    provider: env === 'test' ? 'test' : provider,
    from: {
      name: process.env.EMAIL_FROM_NAME || 'Schedule App',
      email: process.env.EMAIL_FROM_ADDRESS || 'noreply@scheduleapp.com',
    },
    replyTo: process.env.EMAIL_REPLY_TO,
    rateLimit: {
      maxEmails: parseInt(process.env.EMAIL_RATE_LIMIT_MAX || '100', 10),
      windowMs: parseInt(process.env.EMAIL_RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute default
    },
    retry: {
      maxAttempts: parseInt(process.env.EMAIL_RETRY_MAX_ATTEMPTS || '3', 10),
      delayMs: parseInt(process.env.EMAIL_RETRY_DELAY_MS || '5000', 10), // 5 seconds default
    },
  };

  // SMTP Configuration
  if (provider === 'smtp' || !provider) {
    config.smtp = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };
  }

  // SendGrid Configuration
  if (provider === 'sendgrid') {
    config.sendgrid = {
      apiKey: process.env.SENDGRID_API_KEY || '',
    };
  }

  // Mailgun Configuration
  if (provider === 'mailgun') {
    config.mailgun = {
      apiKey: process.env.MAILGUN_API_KEY || '',
      domain: process.env.MAILGUN_DOMAIN || '',
    };
  }

  // AWS SES Configuration
  if (provider === 'ses') {
    config.ses = {
      accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_SES_REGION || 'us-east-1',
    };
  }

  // In test environment, use test provider
  if (env === 'test') {
    config.provider = 'test';
  }

  return config;
};

/**
 * Validate email configuration
 * @throws Error if required configuration is missing
 */
export const validateEmailConfig = (config: EmailConfig): void => {
  if (config.provider === 'test') {
    return; // Test provider doesn't need validation
  }

  if (!config.from.email) {
    throw new Error('EMAIL_FROM_ADDRESS is required');
  }

  switch (config.provider) {
    case 'smtp':
      if (!config.smtp?.auth.user || !config.smtp?.auth.pass) {
        throw new Error('SMTP_USER and SMTP_PASS are required for SMTP provider');
      }
      break;
    case 'sendgrid':
      if (!config.sendgrid?.apiKey) {
        throw new Error('SENDGRID_API_KEY is required for SendGrid provider');
      }
      break;
    case 'mailgun':
      if (!config.mailgun?.apiKey || !config.mailgun?.domain) {
        throw new Error('MAILGUN_API_KEY and MAILGUN_DOMAIN are required for Mailgun provider');
      }
      break;
    case 'ses':
      if (!config.ses?.accessKeyId || !config.ses?.secretAccessKey) {
        throw new Error('AWS_SES_ACCESS_KEY_ID and AWS_SES_SECRET_ACCESS_KEY are required for AWS SES provider');
      }
      break;
  }
};

