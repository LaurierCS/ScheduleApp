import nodemailer from 'nodemailer';
import EmailTemplateManager from '../email/emailTemplateManager';

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

class EmailService {
    private transporter: nodemailer.Transporter;
    
    private constructor( private templateManager: EmailTemplateManager ) {

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
}

export default EmailService;
export { EmailService };