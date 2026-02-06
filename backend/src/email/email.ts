import nodemailer from 'nodemailer';
import EmailTemplateManager from './emailTemplateManager';

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

class EmailService {
    private transporter: nodemailer.Transporter;

    private constructor(private templateManager: EmailTemplateManager) {

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

    static async create(): Promise<EmailService> {
        const manager = await EmailTemplateManager.create();
        return new EmailService(manager);
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

        const { subject, html, plain } = await this.templateManager.renderTemplate("passwordReset", {
            userName: userName,
            code: code,
        });

        const mailOptions = {
            to: email,
            subject: subject,
            html: html,
            text: plain,
        };
        await this.sendEmail(mailOptions);
    }

    /**
     * Send email verification code for new account registration
     * @param email - User's email address
     * @param code - 6-digit verification code
     * @param userName - User's name
     */
    async sendVerificationCode(email: string, code: string, userName: string): Promise<void> {
        const { subject, html, plain } = await this.templateManager.renderTemplate("signupVerification", {
            userName: userName,
            code: code,
        });

        const mailOptions = {
            to: email,
            subject: subject,
            html: html,
            text: plain,
        };
        await this.sendEmail(mailOptions);
    }

    /**
     * Send team invitation email
     * @param recipientEmail - Recipient's email address
     * @param teamName - Name of the team they're being invited to
     * @param inviterName - Name of the person sending the invitation
     * @param role - Role they'll have in the team
     * @param message - Optional custom message from inviter
     */
    async sendTeamInvitation(
        recipientEmail: string,
        teamName: string,
        inviterName: string,
        role: string,
        message?: string
    ): Promise<void> {
        const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        const { subject, html, plain } = await this.templateManager.renderTemplate('teamInvitation', {
            recipientEmail,
            teamName,
            inviterName,
            role,
            message,
            appUrl,
        });

        const mailOptions = {
            to: recipientEmail,
            subject: subject,
            html: html,
            text: plain,
        };
        await this.sendEmail(mailOptions);
    }
}

export default EmailService;
export { EmailService };