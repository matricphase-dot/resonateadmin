import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zoho.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false, // false for port 587 (TLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    // @ts-ignore - authMethod is supported by some transports but types might be strict
    authMethod: 'LOGIN', // ZOHO REQUIRES EXPLICIT LOGIN
    tls: {
        rejectUnauthorized: false // Production safety
    },
    pool: true,
    maxConnections: 1,
    maxMessages: 10,
    rateDelta: 1000 * 60, // 1 min
    rateLimit: 5, // 5 emails/min
});

export async function sendEmail(options: {
    to: string;
    subject: string;
    html: string;
}) {
    console.log('📤 Sending email to:', options.to);
    console.log('📧 SMTP config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        hasPass: !!process.env.SMTP_PASS,
    });

    try {
        const result = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'Resonate'}" <${process.env.EMAIL_FROM_ADDRESS || 'resonateteam@zohomail.com'}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.html.replace(/<[^>]*>/g, ''), // Plaintext fallback
        });

        console.log('✅ ZOHO EMAIL SENT:', {
            messageId: result.messageId,
            to: options.to,
            accepted: result.accepted,
        });
        return { success: true, messageId: result.messageId };
    } catch (error: any) {
        console.error('🔴 ZOHO SMTP FULL ERROR:', {
            message: error.message,
            code: error.code,
            responseCode: error.responseCode,
            response: error.response,
            command: error.command,
            stack: error.stack?.split('\n').slice(0, 3),
            smtpConfig: {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                user: process.env.SMTP_USER?.slice(0, 3) + '...',
                hasPass: !!process.env.SMTP_PASS,
            }
        });

        // Return detailed error to frontend
        throw new Error(`SMTP FAILED: ${error.message} (Code: ${error.responseCode || 'N/A'})`);
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
