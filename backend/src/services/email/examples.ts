/**
 * Email Service Usage Examples
 * 
 * This file demonstrates how to use the email service in various scenarios
 * These examples can be used as reference when integrating email functionality
 */

import { emailService } from './EmailService';
import { notificationService } from '../notifications/NotificationService';
import { emailRateLimiter } from './rateLimiter';

/**
 * Example 1: Send a simple email
 */
export async function exampleSimpleEmail() {
  const result = await emailService.sendEmail({
    to: 'user@example.com',
    subject: 'Welcome!',
    html: '<h1>Welcome to our platform</h1><p>Thank you for joining!</p>',
    text: 'Welcome to our platform. Thank you for joining!',
  });

  if (result.success) {
    console.log('Email sent successfully:', result.messageId);
  } else {
    console.error('Failed to send email:', result.error);
  }
}

/**
 * Example 2: Send email via queue (recommended for production)
 */
export async function exampleQueuedEmail() {
  const result = await emailService.sendEmailQueued({
    to: 'user@example.com',
    subject: 'Important Notification',
    html: '<p>This email is sent via queue for better reliability.</p>',
  });

  console.log('Email queued:', result.messageId);
}

/**
 * Example 3: Send bulk emails
 */
export async function exampleBulkEmails() {
  const emails = [
    { to: 'user1@example.com', subject: 'Hello', html: '<p>Hi User 1</p>' },
    { to: 'user2@example.com', subject: 'Hello', html: '<p>Hi User 2</p>' },
    { to: 'user3@example.com', subject: 'Hello', html: '<p>Hi User 3</p>' },
  ];

  const result = await emailService.sendBulkEmails({
    emails,
    batchSize: 10,
    delayBetweenBatches: 1000, // 1 second delay between batches
  });

  console.log(`Sent ${result.successful} out of ${result.total} emails`);
  console.log(`Failed: ${result.failed}`);
}

/**
 * Example 4: Check email status
 */
export async function exampleCheckEmailStatus(jobId: string) {
  const status = await emailService.getEmailStatus(jobId);
  
  console.log('Email Status:', {
    id: status.id,
    status: status.status,
    attempts: status.attempts,
    error: status.error,
  });
}

/**
 * Example 5: Send meeting scheduled notification
 */
export async function exampleMeetingScheduled() {
  await notificationService.notifyMeetingScheduled({
    candidateEmail: 'candidate@example.com',
    candidateName: 'John Doe',
    interviewerName: 'Jane Smith',
    meetingTitle: 'Technical Interview',
    startTime: 'January 15, 2024 at 10:00 AM',
    endTime: 'January 15, 2024 at 11:00 AM',
    meetingLink: 'https://meet.google.com/abc-def-ghi',
    location: 'Conference Room A',
  });
}

/**
 * Example 6: Send password reset email
 */
export async function examplePasswordReset() {
  await notificationService.sendNotification({
    to: 'user@example.com',
    type: 'password-reset',
    data: {
      userName: 'John Doe',
      resetLink: 'https://app.com/reset?token=abc123xyz',
      expiresIn: '1 hour',
    },
  });
}

/**
 * Example 7: Send welcome email
 */
export async function exampleWelcomeEmail() {
  await notificationService.sendNotification({
    to: 'newuser@example.com',
    type: 'welcome',
    data: {
      userName: 'John Doe',
      role: 'Interviewer',
      loginLink: 'https://app.com/signin',
    },
  });
}

/**
 * Example 8: Rate limiting check before sending
 */
export async function exampleWithRateLimit() {
  if (emailRateLimiter.canSend()) {
    await emailService.sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Test email</p>',
    });
  } else {
    const remaining = emailRateLimiter.getRemaining();
    const waitTime = emailRateLimiter.getTimeUntilReset();
    console.log(`Rate limit exceeded. ${remaining} emails remaining. Wait ${waitTime}ms`);
  }
}

/**
 * Example 9: Send email with attachments
 */
export async function exampleEmailWithAttachments() {
  await emailService.sendEmail({
    to: 'user@example.com',
    subject: 'Document Attached',
    html: '<p>Please find the attached document.</p>',
    attachments: [
      {
        filename: 'document.pdf',
        path: '/path/to/document.pdf',
        contentType: 'application/pdf',
      },
    ],
  });
}

/**
 * Example 10: Send to multiple recipients
 */
export async function exampleMultipleRecipients() {
  await emailService.sendEmail({
    to: ['user1@example.com', 'user2@example.com'],
    cc: 'manager@example.com',
    bcc: 'archive@example.com',
    subject: 'Team Update',
    html: '<p>This is a team update.</p>',
  });
}

