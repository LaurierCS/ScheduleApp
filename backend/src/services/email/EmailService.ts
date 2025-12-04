import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { getEmailConfig, validateEmailConfig, EmailConfig } from '../../config/email';
import { EmailOptions, EmailResult, EmailStatus, BulkEmailOptions, BulkEmailResult } from './types';
import { logError, logInfo, logWarning } from '../../utils/logger';
import { emailQueue } from './queue';

/**
 * EmailService - Handles all email sending functionality
 * Supports multiple providers: SMTP, SendGrid, Mailgun, AWS SES
 * Includes queue system for reliable delivery and rate limiting
 */
export class EmailService {
  private transporter: Transporter | null = null;
  private config: EmailConfig;
  private isInitialized: boolean = false;

  constructor() {
    this.config = getEmailConfig();
    this.initialize();
  }

  /**
   * Initialize the email transporter based on configured provider
   */
  private async initialize(): Promise<void> {
    try {
      validateEmailConfig(this.config);

      if (this.config.provider === 'test') {
        // Test provider - use ethereal email for development
        this.transporter = await this.createTestTransporter();
        this.isInitialized = true;
        logInfo('Email service initialized with test provider');
        return;
      }

      switch (this.config.provider) {
        case 'smtp':
          this.transporter = this.createSMTPTransporter();
          break;
        case 'sendgrid':
          // SendGrid uses SMTP with special configuration
          this.transporter = this.createSendGridTransporter();
          break;
        case 'mailgun':
          // Mailgun also uses SMTP
          this.transporter = this.createMailgunTransporter();
          break;
        case 'ses':
          // AWS SES uses nodemailer with SES transport
          this.transporter = this.createSESTransporter();
          break;
        default:
          throw new Error(`Unsupported email provider: ${this.config.provider}`);
      }

      // Verify connection
      if (this.transporter) {
        await this.transporter.verify();
        this.isInitialized = true;
        logInfo(`Email service initialized with ${this.config.provider} provider`);
      }
    } catch (error) {
      logError(error, 'EmailService.initialize');
      throw new Error(`Failed to initialize email service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create SMTP transporter
   */
  private createSMTPTransporter(): Transporter {
    if (!this.config.smtp) {
      throw new Error('SMTP configuration is missing');
    }

    return nodemailer.createTransport({
      host: this.config.smtp.host,
      port: this.config.smtp.port,
      secure: this.config.smtp.secure,
      auth: this.config.smtp.auth,
    });
  }

  /**
   * Create SendGrid transporter (uses SMTP)
   */
  private createSendGridTransporter(): Transporter {
    if (!this.config.sendgrid) {
      throw new Error('SendGrid configuration is missing');
    }

    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: this.config.sendgrid.apiKey,
      },
    });
  }

  /**
   * Create Mailgun transporter (uses SMTP)
   */
  private createMailgunTransporter(): Transporter {
    if (!this.config.mailgun) {
      throw new Error('Mailgun configuration is missing');
    }

    return nodemailer.createTransport({
      host: `smtp.mailgun.org`,
      port: 587,
      secure: false,
      auth: {
        user: `postmaster@${this.config.mailgun.domain}`,
        pass: this.config.mailgun.apiKey,
      },
    });
  }

  /**
   * Create AWS SES transporter
   */
  private createSESTransporter(): Transporter {
    if (!this.config.ses) {
      throw new Error('AWS SES configuration is missing');
    }

    // For AWS SES, we'd use @aws-sdk/client-ses or nodemailer-ses-transport
    // For now, using SMTP endpoint (requires SES SMTP credentials)
    return nodemailer.createTransport({
      host: `email-smtp.${this.config.ses.region}.amazonaws.com`,
      port: 587,
      secure: false,
      auth: {
        user: this.config.ses.accessKeyId,
        pass: this.config.ses.secretAccessKey,
      },
    });
  }

  /**
   * Create test transporter using Ethereal Email (for development)
   */
  private async createTestTransporter(): Promise<Transporter> {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  /**
   * Send email directly (synchronous, for immediate sending)
   * Use sendEmailQueued() for better reliability and rate limiting
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    if (!this.isInitialized || !this.transporter) {
      throw new Error('Email service is not initialized');
    }

    try {
      const mailOptions: SendMailOptions = {
        from: `${this.config.from.name} <${this.config.from.email}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html || ''),
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        replyTo: options.replyTo || this.config.replyTo,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      // In test mode, log the preview URL
      if (this.config.provider === 'test') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          logInfo(`Test email preview URL: ${previewUrl}`);
        }
      }

      const result: EmailResult = {
        success: true,
        messageId: info.messageId,
        provider: this.config.provider,
        timestamp: new Date(),
      };

      logInfo(`Email sent successfully to ${options.to}`, { messageId: info.messageId });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError(error, 'EmailService.sendEmail');

      return {
        success: false,
        error: errorMessage,
        provider: this.config.provider,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send email via queue (recommended for production)
   * Provides retry logic, rate limiting, and better error handling
   */
  async sendEmailQueued(options: EmailOptions): Promise<EmailResult> {
    try {
      const job = await emailQueue.add('send-email', {
        options,
        config: this.config,
      }, {
        attempts: this.config.retry?.maxAttempts || 3,
        backoff: {
          type: 'exponential',
          delay: this.config.retry?.delayMs || 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });

      logInfo(`Email queued for sending`, { jobId: job.id, to: options.to });

      return {
        success: true,
        messageId: job.id.toString(),
        provider: this.config.provider,
        timestamp: new Date(),
      };
    } catch (error) {
      logError(error, 'EmailService.sendEmailQueued');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.config.provider,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send bulk emails
   * Uses queue system for efficient processing
   */
  async sendBulkEmails(bulkOptions: BulkEmailOptions): Promise<BulkEmailResult> {
    const { emails, batchSize = 10, delayBetweenBatches = 1000 } = bulkOptions;
    const results: EmailResult[] = [];
    let successful = 0;
    let failed = 0;

    // Process emails in batches
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchPromises = batch.map(email => this.sendEmailQueued(email));

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
          if (result.value.success) {
            successful++;
          } else {
            failed++;
          }
        } else {
          results.push({
            success: false,
            error: result.reason?.message || 'Unknown error',
            timestamp: new Date(),
          });
          failed++;
        }
      });

      // Delay between batches to respect rate limits
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    logInfo(`Bulk email sending completed`, { total: emails.length, successful, failed });

    return {
      total: emails.length,
      successful,
      failed,
      results,
    };
  }

  /**
   * Get email status (from queue)
   */
  async getEmailStatus(emailId: string): Promise<EmailStatus> {
    try {
      const job = await emailQueue.getJob(emailId);
      
      if (!job) {
        return {
          id: emailId,
          status: 'failed',
          attempts: 0,
          error: 'Job not found',
        };
      }

      const state = await job.getState();
      const attempts = await job.attemptsMade;
      const failedReason = job.failedReason;

      return {
        id: emailId,
        status: this.mapJobStateToEmailStatus(state),
        attempts,
        lastAttempt: job.processedOn ? new Date(job.processedOn) : undefined,
        error: failedReason,
        metadata: job.data,
      };
    } catch (error) {
      logError(error, 'EmailService.getEmailStatus');
      return {
        id: emailId,
        status: 'failed',
        attempts: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Map Bull job state to email status
   */
  private mapJobStateToEmailStatus(state: string): EmailStatus['status'] {
    switch (state) {
      case 'completed':
        return 'sent';
      case 'failed':
        return 'failed';
      case 'active':
      case 'waiting':
      case 'delayed':
        return 'pending';
      default:
        return 'pending';
    }
  }

  /**
   * Convert HTML to plain text (simple implementation)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }
}

// Export singleton instance
export const emailService = new EmailService();

