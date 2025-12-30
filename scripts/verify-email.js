
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load env manual parser
const envPath = path.resolve(__dirname, '../.env');
let env = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        const delimIndex = line.indexOf('=');
        if (delimIndex !== -1) {
            const key = line.substring(0, delimIndex).trim();
            const val = line.substring(delimIndex + 1).trim();
            env[key] = val;
        }
    });
} catch (e) {
    console.error("Could not read .env file");
}

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || 'smtp.zoho.com',
    port: parseInt(env.SMTP_PORT || '587'),
    secure: env.SMTP_SECURE === 'true',
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
    debug: true, // show debug output
    logger: true // log information in console
});


async function main() {
    console.log(`Connecting to ${env.SMTP_HOST}:${env.SMTP_PORT} as ${env.SMTP_USER}...`);
    try {
        const info = await transporter.sendMail({
            from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`,
            to: env.SMTP_USER, // Send to self
            subject: 'Resonate SMTP Validation',
            text: 'This email confirms that your Zoho SMTP configuration is correct and the Outreach engine can send emails.',
        });
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (e) {
        console.error('❌ Failed to send email:', e.message);
        if (e.code === 'EAUTH') {
            console.error('-> Hint: Check if App Password is correct.');
        }
        process.exit(1);
    }
}

main();
