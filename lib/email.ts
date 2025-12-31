import nodemailer from 'nodemailer';

export async function sendEmail(options: { to: string; subject: string; html: string }) {
    // CRITICAL: Log ALL env vars (masked)
    console.log('🔍 SMTP ENV CHECK:', {
        SMTP_HOST: process.env.SMTP_HOST || 'MISSING ❌',
        SMTP_PORT: process.env.SMTP_PORT || 'MISSING ❌',
        SMTP_USER: process.env.SMTP_USER || 'MISSING ❌',
        HAS_SMTP_PASS: !!process.env.SMTP_PASS ? `${process.env.SMTP_PASS?.length} chars ✓` : 'MISSING ❌',
        EMAIL_FROM: process.env.EMAIL_FROM_ADDRESS || 'MISSING ❌',
    });

    // FAIL FAST if env vars missing
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        const error = new Error('🚨 VERCEL ENV VARS MISSING - Check Vercel Dashboard → Settings → Environment Variables');
        console.error(error.message);
        throw error;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false, // 587 = TLS
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        // @ts-ignore
        authMethod: 'LOGIN',
        tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' },
        // @ts-ignore
        logger: process.env.NODE_ENV === 'production', // Vercel logs
        debug: process.env.NODE_ENV !== 'production',
    });

    try {
        const result = await transporter.sendMail({
            from: `"Resonate" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.html.replace(/<[^>]*>/g, ''),
        });

        console.log('✅ EMAIL SENT:', { messageId: result.messageId, to: options.to });
        return { success: true, messageId: result.messageId };

    } catch (error: any) {
        console.error('🔴 SMTP DETAILED ERROR:', {
            message: error.message,
            code: error.code,
            responseCode: error.responseCode,
            command: error.command,
            stack: error.stack,
            envCheck: {
                host: process.env.SMTP_HOST,
                user: process.env.SMTP_USER,
                passLength: process.env.SMTP_PASS?.length,
            }
        });
        throw new Error(`SMTP ERROR: ${error.message} | Code: ${error.responseCode || 'N/A'}`);
    }
}

// Keep template function for outreach/support
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
