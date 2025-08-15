import nodemailer from 'nodemailer';
import { config } from '../config.js';

// Build SMTP configuration with fallbacks
const smtpUser = process.env.SMTP_USER || process.env.USER_EMAIL || config?.email?.user;
const smtpPass = process.env.SMTP_PASS || process.env.USER_PASS || config?.email?.pass;
const inferredGmail = smtpUser && /@gmail\./i.test(String(smtpUser));
const smtpHost = process.env.SMTP_HOST || (inferredGmail ? 'smtp.gmail.com' : undefined);
const smtpPort = Number(process.env.SMTP_PORT || (inferredGmail ? 465 : 587));
const smtpSecure = String(process.env.SMTP_SECURE || (inferredGmail ? 'true' : 'false')) === 'true';
const smtpFrom = process.env.SMTP_FROM || smtpUser;

let transporter;
try {
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('Mailer disabled: missing SMTP config', { smtpHost: !!smtpHost, smtpUser: !!smtpUser });
  } else {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass }
    });
  }
} catch (e) {
  console.warn('Mailer initialization failed:', e?.message);
}

export async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    return { success: false, skipped: true, reason: 'SMTP not configured' };
  }
  if (!smtpFrom) {
    return { success: false, skipped: true, reason: 'FROM not configured' };
  }
  const info = await transporter.sendMail({ from: smtpFrom, to, subject, text, html });
  return { success: true, messageId: info.messageId };
}
