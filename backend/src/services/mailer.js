// Lightweight mailer service using Resend HTTP API (no SMTP)
// Env required: RESEND_API_KEY. Optional: RESEND_FROM (verified sender or domain)

export async function sendEmail({ to, subject, html, text, from }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY');
  }

  const sender = from || process.env.RESEND_FROM || 'onboarding@resend.dev';

  const payload = {
    from: sender,
    to: Array.isArray(to) ? to : [to],
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
