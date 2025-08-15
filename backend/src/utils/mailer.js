import nodemailer from 'nodemailer';

// Configure transporter from environment variables
// For Gmail, use an App Password and: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, SMTP_SECURE=true
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || 'false') === 'true',
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

export async function sendMail({ to, subject, text, html }) {
  if (!process.env.SMTP_HOST) {
    console.warn('Mailer disabled: SMTP_HOST not set');
    return { success: false, skipped: true, reason: 'SMTP not configured' };
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) {
    console.warn('Mailer disabled: SMTP_FROM/SMTP_USER not set');
    return { success: false, skipped: true, reason: 'FROM not configured' };
  }

  const info = await transporter.sendMail({ from, to, subject, text, html });
  return { success: true, messageId: info.messageId };
}
