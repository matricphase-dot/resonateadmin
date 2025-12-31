import nodemailer from 'nodemailer';

// Force Zoho and ignore system-level Gmail overrides
const SMTP_HOST = (process.env.SMTP_HOST && !process.env.SMTP_HOST.includes('gmail.com'))
    ? process.env.SMTP_HOST
    : 'smtp.zoho.com';

const SMTP_USER = (process.env.SMTP_USER && !process.env.SMTP_USER.includes('gmail.com'))
    ? process.env.SMTP_USER
    : 'resonateteam@zohomail.com';

export const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true', // false for 587
    requireTLS: true,
    auth: {
        user: SMTP_USER,
        pass: process.env.SMTP_PASS, // 12-char OK
        method: 'LOGIN'
    },
    pool: true,
    maxConnections: 1,
    maxMessages: 5,
});

export async function sendEmail(options: {
    to: string;
    subject: string;
    html: string;
}) {
    try {
        const fromName = process.env.EMAIL_FROM_NAME || 'Resonate';
        const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'resonateteam@zohomail.com';

        const result = await transporter.sendMail({
            from: `"${fromName}" <${fromAddress}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
        console.log('✅ ZOHO EMAIL SENT:', { to: options.to, messageId: result.messageId });
        return { success: true, messageId: result.messageId };
    } catch (error: any) {
        console.error('🔴 ZOHO SMTP ERROR:', {
            code: error.responseCode,
            message: error.message,
            response: error.response,
            config: {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                user: process.env.SMTP_USER?.slice(0, 3) + '...',
            }
        });

        // Log failures for diagnostics
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(process.cwd(), 'smtp-errors.log');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[${timestamp}] ${error.message}\nStack: ${error.stack}\n\n`);

        throw new Error(`SMTP failed: ${error.message}`);
    }
}

export interface SendEmailTemplateOptions {
    to: string;
    subjectTemplate: string;
    htmlTemplate: string;
    textTemplate?: string;
    variables: Record<string, string>;
    replyTo?: string;
}

export async function sendEmailTemplate({ to, subjectTemplate, htmlTemplate, textTemplate, variables }: SendEmailTemplateOptions) {
    let subject = subjectTemplate;
    let html = htmlTemplate;

    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value);
        html = html.replace(regex, value);
    }

    return sendEmail({ to, subject, html });
}
