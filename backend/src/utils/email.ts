import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

class EmailService {
    private transporter: nodemailer.Transporter;
    constructor() {
        // Check for Gmail credentials first
        const gmailUser = process.env.GMAIL_USER;
        const gmailPassword = process.env.GMAIL_APP_PASSWORD;

        if (gmailUser && gmailPassword) {
            // Use Gmail SMTP
            this.transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // Use TLS
                auth: {
                    user: gmailUser,
                    pass: gmailPassword,
                },
            });
            console.log('[EmailService] Initialized with Gmail SMTP');
        } else {
            // Fall back to environment variables
            const emailHost = process.env.EMAIL_HOST || 'localhost';
            const emailPort = parseInt(process.env.EMAIL_PORT || '1025');
            const emailUser = process.env.EMAIL_USER;
            const emailPassword = process.env.EMAIL_PASSWORD;

            this.transporter = nodemailer.createTransport({
                host: emailHost,
                port: emailPort,
                secure: emailPort === 465,
                auth: emailUser ? {
                    user: emailUser,
                    pass: emailPassword,
                } : undefined,
            });
            console.log(`[EmailService] Initialized with ${emailHost}:${emailPort}`);
        }
    }
    async sendEmail(options: EmailOptions): Promise<void> {
        try {
            const fromEmail = process.env.GMAIL_USER || process.env.EMAIL_FROM || 'no-reply@example.com';
            await this.transporter.sendMail({
                from: fromEmail,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });
        } catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }

    /**
     * Send password reset verification code email
     * @param email - User's email address
     * @param code - 6-digit verification code
     * @param userName - User's name
     */
    async sendPasswordResetCode(email: string, code: string, userName: string): Promise<void> {
        const mailOptions = {
            to: email,
            subject: 'Your Password Reset Verification Code',
            html: `
                <h2>Password Reset Verification</h2>
                <p>Hello ${userName},</p>
                <p>Your password reset verification code is:</p>
                <h1 style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">
                    ${code}
                </h1>
                <p>This code will expire in 5 minutes.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
                <hr/>
                <p><small>This is an automated message, please do not reply to this email.</small></p>
            `,
        };
        await this.sendEmail(mailOptions);
    }
}

export default EmailService;
export { EmailService };