/**
 * Notification Service
 * Handles sending notifications via email and other channels
 * Integrates with EmailService for email notifications
 */

import { emailService } from '../email';
import { EmailOptions } from '../email/types';
import {
  meetingScheduledTemplate,
  meetingReminderTemplate,
  meetingRescheduledTemplate,
  meetingCancelledTemplate,
  passwordResetTemplate,
  welcomeEmailTemplate,
  teamInvitationTemplate,
} from '../email/templates';
import { logInfo, logError } from '../../utils/logger';

export interface NotificationOptions {
  to: string | string[];
  type: 'meeting-scheduled' | 'meeting-reminder' | 'meeting-rescheduled' | 'meeting-cancelled' | 'password-reset' | 'welcome' | 'team-invitation';
  data: Record<string, any>;
  useQueue?: boolean; // Whether to use queue (default: true)
}

/**
 * NotificationService - Handles all application notifications
 */
export class NotificationService {
  /**
   * Send a notification
   */
  async sendNotification(options: NotificationOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const emailOptions = this.buildEmailOptions(options);
      
      // Use queue by default for better reliability
      const useQueue = options.useQueue !== false;
      
      const result = useQueue
        ? await emailService.sendEmailQueued(emailOptions)
        : await emailService.sendEmail(emailOptions);

      if (result.success) {
        logInfo(`Notification sent: ${options.type}`, { to: options.to, messageId: result.messageId });
      } else {
        logError(new Error(result.error || 'Unknown error'), 'NotificationService.sendNotification', { type: options.type, to: options.to });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError(error, 'NotificationService.sendNotification');
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Build email options from notification options
   */
  private buildEmailOptions(options: NotificationOptions): EmailOptions {
    const { type, data, to } = options;
    let subject: string;
    let html: string;

    switch (type) {
      case 'meeting-scheduled':
        subject = `Interview Scheduled: ${data.meetingTitle || 'New Interview'}`;
        html = meetingScheduledTemplate({
          candidateName: data.candidateName,
          interviewerName: data.interviewerName,
          meetingTitle: data.meetingTitle,
          startTime: data.startTime,
          endTime: data.endTime,
          meetingLink: data.meetingLink,
          location: data.location,
        });
        break;

      case 'meeting-reminder':
        subject = `Interview Reminder: ${data.meetingTitle || 'Upcoming Interview'}`;
        html = meetingReminderTemplate({
          candidateName: data.candidateName,
          interviewerName: data.interviewerName,
          meetingTitle: data.meetingTitle,
          startTime: data.startTime,
          meetingLink: data.meetingLink,
          hoursUntil: data.hoursUntil || 1,
        });
        break;

      case 'meeting-rescheduled':
        subject = `Interview Rescheduled: ${data.meetingTitle || 'Interview Update'}`;
        html = meetingRescheduledTemplate({
          candidateName: data.candidateName,
          interviewerName: data.interviewerName,
          meetingTitle: data.meetingTitle,
          oldTime: data.oldTime,
          newTime: data.newTime,
          meetingLink: data.meetingLink,
        });
        break;

      case 'meeting-cancelled':
        subject = `Interview Cancelled: ${data.meetingTitle || 'Interview Update'}`;
        html = meetingCancelledTemplate({
          candidateName: data.candidateName,
          interviewerName: data.interviewerName,
          meetingTitle: data.meetingTitle,
          scheduledTime: data.scheduledTime,
          reason: data.reason,
        });
        break;

      case 'password-reset':
        subject = 'Password Reset Request - Schedule App';
        html = passwordResetTemplate({
          userName: data.userName,
          resetLink: data.resetLink,
          expiresIn: data.expiresIn || '1 hour',
        });
        break;

      case 'welcome':
        subject = 'Welcome to Schedule App!';
        html = welcomeEmailTemplate({
          userName: data.userName,
          role: data.role,
          loginLink: data.loginLink || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/signin`,
        });
        break;

      case 'team-invitation':
        subject = `Team Invitation: ${data.teamName}`;
        html = teamInvitationTemplate({
          userName: data.userName,
          teamName: data.teamName,
          inviterName: data.inviterName,
          acceptLink: data.acceptLink,
        });
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    return {
      to,
      subject,
      html,
      metadata: {
        type,
        ...data,
      },
    };
  }

  /**
   * Send meeting scheduled notification
   */
  async notifyMeetingScheduled(data: {
    candidateEmail: string;
    candidateName: string;
    interviewerName: string;
    meetingTitle: string;
    startTime: string;
    endTime: string;
    meetingLink?: string;
    location?: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    return this.sendNotification({
      to: data.candidateEmail,
      type: 'meeting-scheduled',
      data,
    });
  }

  /**
   * Send meeting reminder
   */
  async notifyMeetingReminder(data: {
    candidateEmail: string;
    candidateName: string;
    interviewerName: string;
    meetingTitle: string;
    startTime: string;
    meetingLink?: string;
    hoursUntil?: number;
  }): Promise<{ success: boolean; messageId?: string }> {
    return this.sendNotification({
      to: data.candidateEmail,
      type: 'meeting-reminder',
      data,
    });
  }

  /**
   * Send meeting rescheduled notification
   */
  async notifyMeetingRescheduled(data: {
    candidateEmail: string;
    candidateName: string;
    interviewerName: string;
    meetingTitle: string;
    oldTime: string;
    newTime: string;
    meetingLink?: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    return this.sendNotification({
      to: data.candidateEmail,
      type: 'meeting-rescheduled',
      data,
    });
  }

  /**
   * Send meeting cancelled notification
   */
  async notifyMeetingCancelled(data: {
    candidateEmail: string;
    candidateName: string;
    interviewerName: string;
    meetingTitle: string;
    scheduledTime: string;
    reason?: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    return this.sendNotification({
      to: data.candidateEmail,
      type: 'meeting-cancelled',
      data,
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

