/**
 * Email templates for the application
 * Provides reusable HTML email templates for different notification types
 */

export interface EmailTemplateData {
  [key: string]: any;
}

/**
 * Base email template wrapper
 */
const baseTemplate = (content: string, title?: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Schedule App Notification'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 2px solid #4F46E5;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #4F46E5;
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4F46E5;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      margin: 10px 0;
    }
    .button:hover {
      background-color: #4338CA;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
    .info-box {
      background-color: #f3f4f6;
      border-left: 4px solid #4F46E5;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title || 'Schedule App'}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>This is an automated message from Schedule App. Please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} Schedule App. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Meeting/interview scheduled notification
 */
export const meetingScheduledTemplate = (data: {
  candidateName: string;
  interviewerName: string;
  meetingTitle: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
  location?: string;
}): string => {
  const content = `
    <h2>Interview Scheduled</h2>
    <p>Hello ${data.candidateName},</p>
    <p>Your interview has been scheduled with ${data.interviewerName}.</p>
    
    <div class="info-box">
      <p><strong>Interview Details:</strong></p>
      <p><strong>Title:</strong> ${data.meetingTitle}</p>
      <p><strong>Date & Time:</strong> ${data.startTime} - ${data.endTime}</p>
      ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ''}
      ${data.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>` : ''}
    </div>
    
    <p>Please make sure to be available at the scheduled time. If you need to reschedule, please contact the interviewer or admin.</p>
    
    ${data.meetingLink ? `<a href="${data.meetingLink}" class="button">Join Meeting</a>` : ''}
  `;

  return baseTemplate(content, 'Interview Scheduled');
};

/**
 * Meeting reminder notification
 */
export const meetingReminderTemplate = (data: {
  candidateName: string;
  interviewerName: string;
  meetingTitle: string;
  startTime: string;
  meetingLink?: string;
  hoursUntil: number;
}): string => {
  const content = `
    <h2>Interview Reminder</h2>
    <p>Hello ${data.candidateName},</p>
    <p>This is a reminder that you have an interview scheduled in ${data.hoursUntil} hour(s).</p>
    
    <div class="info-box">
      <p><strong>Interview Details:</strong></p>
      <p><strong>Title:</strong> ${data.meetingTitle}</p>
      <p><strong>With:</strong> ${data.interviewerName}</p>
      <p><strong>Time:</strong> ${data.startTime}</p>
      ${data.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>` : ''}
    </div>
    
    <p>We look forward to speaking with you!</p>
    
    ${data.meetingLink ? `<a href="${data.meetingLink}" class="button">Join Meeting</a>` : ''}
  `;

  return baseTemplate(content, 'Interview Reminder');
};

/**
 * Meeting rescheduled notification
 */
export const meetingRescheduledTemplate = (data: {
  candidateName: string;
  interviewerName: string;
  meetingTitle: string;
  oldTime: string;
  newTime: string;
  meetingLink?: string;
}): string => {
  const content = `
    <h2>Interview Rescheduled</h2>
    <p>Hello ${data.candidateName},</p>
    <p>Your interview with ${data.interviewerName} has been rescheduled.</p>
    
    <div class="info-box">
      <p><strong>Interview:</strong> ${data.meetingTitle}</p>
      <p><strong>Previous Time:</strong> ${data.oldTime}</p>
      <p><strong>New Time:</strong> ${data.newTime}</p>
      ${data.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>` : ''}
    </div>
    
    <p>Please update your calendar accordingly.</p>
    
    ${data.meetingLink ? `<a href="${data.meetingLink}" class="button">View Meeting</a>` : ''}
  `;

  return baseTemplate(content, 'Interview Rescheduled');
};

/**
 * Meeting cancelled notification
 */
export const meetingCancelledTemplate = (data: {
  candidateName: string;
  interviewerName: string;
  meetingTitle: string;
  scheduledTime: string;
  reason?: string;
}): string => {
  const content = `
    <h2>Interview Cancelled</h2>
    <p>Hello ${data.candidateName},</p>
    <p>We regret to inform you that your interview has been cancelled.</p>
    
    <div class="info-box">
      <p><strong>Interview Details:</strong></p>
      <p><strong>Title:</strong> ${data.meetingTitle}</p>
      <p><strong>With:</strong> ${data.interviewerName}</p>
      <p><strong>Scheduled Time:</strong> ${data.scheduledTime}</p>
      ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
    </div>
    
    <p>If you have any questions, please contact the admin or interviewer.</p>
    <p>We apologize for any inconvenience.</p>
  `;

  return baseTemplate(content, 'Interview Cancelled');
};

/**
 * Password reset email
 */
export const passwordResetTemplate = (data: {
  userName: string;
  resetLink: string;
  expiresIn: string;
}): string => {
  const content = `
    <h2>Password Reset Request</h2>
    <p>Hello ${data.userName},</p>
    <p>You have requested to reset your password for your Schedule App account.</p>
    
    <div class="info-box">
      <p>Click the button below to reset your password. This link will expire in ${data.expiresIn}.</p>
    </div>
    
    <a href="${data.resetLink}" class="button">Reset Password</a>
    
    <p>If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
    <p><strong>Security Note:</strong> Never share this link with anyone. Our team will never ask for your password.</p>
  `;

  return baseTemplate(content, 'Password Reset');
};

/**
 * Welcome email for new users
 */
export const welcomeEmailTemplate = (data: {
  userName: string;
  role: string;
  loginLink: string;
}): string => {
  const content = `
    <h2>Welcome to Schedule App!</h2>
    <p>Hello ${data.userName},</p>
    <p>Welcome to Schedule App! Your account has been created successfully.</p>
    
    <div class="info-box">
      <p><strong>Your Role:</strong> ${data.role}</p>
    </div>
    
    <p>You can now log in to your account and start using the platform.</p>
    
    <a href="${data.loginLink}" class="button">Log In</a>
    
    <p>If you have any questions, feel free to reach out to our support team.</p>
  `;

  return baseTemplate(content, 'Welcome to Schedule App');
};

/**
 * Team invitation email
 */
export const teamInvitationTemplate = (data: {
  userName: string;
  teamName: string;
  inviterName: string;
  acceptLink: string;
}): string => {
  const content = `
    <h2>Team Invitation</h2>
    <p>Hello ${data.userName},</p>
    <p>${data.inviterName} has invited you to join the team <strong>${data.teamName}</strong>.</p>
    
    <div class="info-box">
      <p>Click the button below to accept the invitation and join the team.</p>
    </div>
    
    <a href="${data.acceptLink}" class="button">Accept Invitation</a>
    
    <p>If you did not expect this invitation, you can safely ignore this email.</p>
  `;

  return baseTemplate(content, 'Team Invitation');
};

