import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    console.log('📧 SENDING EMAIL:', { to, subject: subject.slice(0, 30) + '...' });

    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 587,
        secure: false,
        auth: {
            user: 'resonateteam@zohomail.com',
            pass: 't6b3LFSMXB1P',
        },
        // @ts-ignore
        authMethod: 'LOGIN',
        tls: { rejectUnauthorized: false },
    });

    try {
        const result = await transporter.sendMail({
            from: '"Resonate Admin" <resonateteam@zohomail.com>',
            to,
            subject,
            html,
        });
        console.log('✅ EMAIL SENT:', result.messageId);
        return { success: true };
    } catch (error: any) {
        console.error('⚠️ SMTP ERROR (non-blocking):', error.message);
        return { success: false, error: error.message };
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
