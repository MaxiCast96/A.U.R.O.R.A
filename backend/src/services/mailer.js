// Lightweight mailer service using Resend HTTP API (no SMTP)
// Env required: RESEND_API_KEY. Optional: RESEND_FROM (verified sender or domain)

// Provider switch: 'brevo' | 'resend'
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'brevo';

// Brevo (Sendinblue) inline config (edit these if you cannot use .env)
// IMPORTANT: Replace with your real API key and a verified sender in Brevo
const BREVO_API_KEY = 'xsmtpsib-c91d6fc106b8ffdcff622e6f4020fd5ece6bf384ce472f9b70ec8cd8367ed1ad-3OT1KhMDExt0qbzC';
const BREVO_FROM = process.env.BREVO_FROM || '"Óptica La Inteligente" <OpticaLaInteligente@gmail.com>';

// Resend fallback config (works if you still want to use Resend)
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM = process.env.RESEND_FROM || 'onboarding@resend.dev';

function parseSender(sender) {
  // Accepts formats: 'Name <email@domain>' or plain 'email@domain'
  const match = /^(.*)<\s*([^>]+)\s*>\s*$/.exec(sender);
  if (match) {
    const name = match[1].trim().replace(/^"|"$/g, '');
    const email = match[2].trim();
    return { name, email };
  }
  return { name: undefined, email: String(sender).trim() };
}

export async function sendEmail({ to, subject, html, text, from }) {
  const recipients = Array.isArray(to) ? to : [to];
  if (!recipients.length) {
    throw new Error('Missing recipient email (to)');
  }

  if (EMAIL_PROVIDER === 'brevo') {
    if (!BREVO_API_KEY || BREVO_API_KEY === 'YOUR_BREVO_API_KEY') {
      throw new Error('Missing Brevo API key. Set BREVO_API_KEY in code or env.');
    }
    const senderStr = from || BREVO_FROM;
    const sender = parseSender(senderStr);

    const payload = {
      sender: {
        email: sender.email,
        ...(sender.name ? { name: sender.name } : {})
      },
      to: recipients.map(e => ({ email: e })),
      subject: subject || '',
      ...(html ? { htmlContent: html } : {}),
      ...(text ? { textContent: text } : {})
    };

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Brevo API error ${res.status}: ${body}`);
    }

    const data = await res.json();
    return data; // { messageId: '...' }
  }

  // Default: Resend
  const apiKey = RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY');
  }
  const sender = from || RESEND_FROM;
  const payload = {
    from: sender,
    to: recipients,
    subject: subject || '',
    html: html || undefined,
    text: text || undefined,
  };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data; // { id: '...' }
}
