# Email Service Documentation

## Overview

The email service provides a robust, scalable solution for sending emails in the Schedule App. It supports multiple email providers, includes a queue system for reliable delivery, and provides comprehensive error handling and retry logic.

## Features

- ✅ Multiple email provider support (SMTP, SendGrid, Mailgun, AWS SES)
- ✅ Queue-based email processing with Bull
- ✅ Automatic retry logic for failed emails
- ✅ Rate limiting to prevent provider throttling
- ✅ Email templates for common notifications
- ✅ Comprehensive error handling and logging
- ✅ Environment-based configuration
- ✅ Test mode for development (Ethereal Email)

## Setup

### 1. Install Dependencies

```bash
cd backend
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and configure your email provider:

```bash
cp .env.example .env
```

### 3. Choose Email Provider

#### Option A: SMTP (Gmail, Outlook, etc.)

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Note:** For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

#### Option B: SendGrid

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Configure:

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-api-key
```

#### Option C: Mailgun

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Get your API key and domain
3. Configure:

```env
EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=your-api-key
MAILGUN_DOMAIN=your-domain.com
```

#### Option D: AWS SES

1. Set up AWS SES
2. Configure:

```env
EMAIL_PROVIDER=ses
AWS_SES_ACCESS_KEY_ID=your-access-key
AWS_SES_SECRET_ACCESS_KEY=your-secret-key
AWS_SES_REGION=us-east-1
```

#### Option E: Test Mode (Development)

For development, use test mode (uses Ethereal Email):

```env
EMAIL_PROVIDER=test
NODE_ENV=development
```

This will generate preview URLs in the console instead of sending real emails.

### 4. Set Up Redis (for Queue)

The email queue requires Redis. Install Redis locally or use a cloud service:

**Local Redis:**
```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Download from https://redis.io/download
```

**Cloud Redis (Recommended for Production):**
- Redis Cloud
- AWS ElastiCache
- Heroku Redis

Configure in `.env`:
```env
REDIS_URL=redis://localhost:6379
# Or
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Usage

### Basic Email Sending

```typescript
import { emailService } from './services/email';

// Send email directly (synchronous)
const result = await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Hello',
  html: '<h1>Hello World</h1>',
  text: 'Hello World',
});

// Send email via queue (recommended)
const result = await emailService.sendEmailQueued({
  to: 'user@example.com',
  subject: 'Hello',
  html: '<h1>Hello World</h1>',
});
```

### Using Notification Service

```typescript
import { notificationService } from './services/notifications';

// Send meeting scheduled notification
await notificationService.notifyMeetingScheduled({
  candidateEmail: 'candidate@example.com',
  candidateName: 'John Doe',
  interviewerName: 'Jane Smith',
  meetingTitle: 'Technical Interview',
  startTime: '2024-01-15 10:00 AM',
  endTime: '2024-01-15 11:00 AM',
  meetingLink: 'https://meet.google.com/abc-def-ghi',
});

// Send password reset email
await notificationService.sendNotification({
  to: 'user@example.com',
  type: 'password-reset',
  data: {
    userName: 'John Doe',
    resetLink: 'https://app.com/reset?token=xyz',
    expiresIn: '1 hour',
  },
});
```

### Bulk Email Sending

```typescript
const result = await emailService.sendBulkEmails({
  emails: [
    { to: 'user1@example.com', subject: 'Hello', html: '<p>Hi</p>' },
    { to: 'user2@example.com', subject: 'Hello', html: '<p>Hi</p>' },
  ],
  batchSize: 10,
  delayBetweenBatches: 1000,
});
```

### Check Email Status

```typescript
const status = await emailService.getEmailStatus('job-id-123');
console.log(status.status); // 'sent', 'pending', 'failed'
```

## Email Templates

Pre-built templates are available for:

- Meeting scheduled
- Meeting reminder
- Meeting rescheduled
- Meeting cancelled
- Password reset
- Welcome email
- Team invitation

See `templates.ts` for details.

## Queue Management

### Get Queue Statistics

```typescript
import { getQueueStats } from './services/email/queue';

const stats = await getQueueStats();
console.log(stats);
// {
//   waiting: 5,
//   active: 2,
//   completed: 100,
//   failed: 3,
//   delayed: 0,
//   total: 110
// }
```

### Monitor Queue Events

The queue automatically logs events. Check your console for:
- `Email job completed`
- `Email job failed`
- `Email job stalled`

## Error Handling

The service includes comprehensive error handling:

- Automatic retries (configurable attempts and delays)
- Failed job tracking (kept for 7 days)
- Error logging with context
- Rate limiting to prevent provider throttling

## Rate Limiting

Rate limiting is built-in to prevent exceeding provider limits:

```typescript
import { emailRateLimiter } from './services/email/rateLimiter';

if (emailRateLimiter.canSend()) {
  await emailService.sendEmail(...);
} else {
  const remaining = emailRateLimiter.getRemaining();
  const waitTime = emailRateLimiter.getTimeUntilReset();
  console.log(`Rate limit exceeded. Wait ${waitTime}ms`);
}
```

## Testing

In test mode (`EMAIL_PROVIDER=test`), emails are sent to Ethereal Email and preview URLs are logged to the console. No real emails are sent.

## Production Considerations

1. **Use Queue**: Always use `sendEmailQueued()` in production for better reliability
2. **Redis**: Use a managed Redis service (Redis Cloud, AWS ElastiCache)
3. **Monitoring**: Monitor queue statistics and failed jobs
4. **Rate Limits**: Configure appropriate rate limits for your provider
5. **Error Alerts**: Set up alerts for high failure rates
6. **Provider Selection**: Choose a provider based on volume and requirements:
   - **SendGrid**: Best for high volume, good deliverability
   - **Mailgun**: Good for transactional emails
   - **AWS SES**: Cost-effective for high volume
   - **SMTP**: Simple but limited scalability

## Troubleshooting

### Emails not sending

1. Check email service logs
2. Verify environment variables
3. Test connection: `await emailService.transporter.verify()`
4. Check Redis connection for queue
5. Review failed jobs in queue

### Rate limit errors

1. Increase `EMAIL_RATE_LIMIT_MAX` in `.env`
2. Increase `EMAIL_RATE_LIMIT_WINDOW_MS`
3. Use queue to spread out sending

### Redis connection errors

1. Verify Redis is running: `redis-cli ping`
2. Check `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT`
3. For cloud Redis, verify network access

## API Reference

See TypeScript type definitions in:
- `types.ts` - Email types and interfaces
- `EmailService.ts` - Service class methods
- `queue.ts` - Queue management functions

