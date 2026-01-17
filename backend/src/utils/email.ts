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
        // Configure your email service here
        // For development, you can use a test service or mock it
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'localhost',
            port: parseInt(process.env.EMAIL_PORT || '1025'),
            secure: false,
            auth: process.env.EMAIL_USER ? {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            } : undefined,
        });
    }
    async sendEmail(options: EmailOptions): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'no-reply@example.com',
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
}   