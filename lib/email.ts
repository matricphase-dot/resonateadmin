import nodemailer from 'nodemailer';

// FAIL-FAST: Check env vars BEFORE transporter creation
function validateEnvVars() {
    const missing = [];
    if (!process.env.SMTP_HOST) missing.push('SMTP_HOST');
    if (!process.env.SMTP_PORT) missing.push('SMTP_PORT');
    if (!process.env.SMTP_USER) missing.push('SMTP_USER');
    if (!process.env.SMTP_PASS) missing.push('SMTP_PASS');
    if (!process.env.EMAIL_FROM_ADDRESS) missing.push('EMAIL_FROM_ADDRESS');

    if (missing.length > 0) {
        const error = new Error(`🚨 VERCEL ENV VARS MISSING: ${missing.join(', ')}\nGo to Vercel Dashboard → Settings → Environment Variables`);
        console.error(error.message);
        throw error;
    }
    console.log('✅ ALL SMTP ENV VARS PRESENT');
}

// Only validate in production or if SMTP is explicitly being used
if (process.env.NODE_ENV === 'production') {
    validateEnvVars();
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // Port 587 = STARTTLS
    auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
    },
    // @ts-ignore
    authMethod: 'LOGIN', // Zoho explicit requirement
    tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
    },
    pool: true,
    maxConnections: 1,
    rateDelta: 60000, // 1 min
    rateLimit: 10, // 10 emails/min
    // @ts-ignore
    debug: true, // Full SMTP logs
    // @ts-ignore
    logger: true,
});

export async function sendEmail(options: {
    to: string;
    subject: string;
    html: string;
}) {
    console.log('📤 ZOHO SMTP DEBUG:', {
        to: options.to,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        passLength: process.env.SMTP_PASS?.length || 0,
    });

    try {
        const result = await transporter.sendMail({
            from: `"Resonate Admin" <${process.env.EMAIL_FROM_ADDRESS!}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
            headers: {
                'X-Mailer': 'Resonate-Admin-Production',
            },
        });

        console.log('✅ ZOHO SMTP SUCCESS:', {
            messageId: result.messageId,
            accepted: result.accepted,
            rejected: result.rejected,
        });

        return { success: true, messageId: result.messageId };

    } catch (error: any) {
        console.error('🔴 ZOHO SMTP FAILURE:', {
            message: error.message,
            code: error.code,
            command: error.command,
            responseCode: error.responseCode,
            response: error.response,
            smtpConfig: {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                user: process.env.SMTP_USER,
            }
        });

        throw new Error(`ZOHO SMTP FAILED: ${error.responseCode || error.code || error.message}`);
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
