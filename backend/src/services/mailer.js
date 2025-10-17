// Lightweight mailer service using Brevo HTTP API (no SMTP)
// Env required: BREVO_API_KEY. Optional: BREVO_SENDER_NAME, BREVO_SENDER_EMAIL

export async function sendEmail({ to, subject, html, text, from }) {
  const apiKey = "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";
  if (!apiKey) {
    throw new Error('Missing BREVO_API_KEY');
  }

  // Resolve fetch (Node 18+ has global fetch). Fallback to node-fetch if not present.
  const getFetch = async () => globalThis.fetch || (await import('node-fetch')).default;
  const $fetch = await getFetch();

  // Normalize recipients to Brevo format [{ email, name? }]
  const recipients = (Array.isArray(to) ? to : [to]).map((entry) => {
    if (typeof entry === 'string') return { email: entry };
    if (entry && typeof entry === 'object') return { email: entry.email, name: entry.name };
    return { email: String(entry || '') };
  });

  // Parse sender from `from` like "Name <email@domain>" or use env vars
  const parseFrom = (value) => {
    if (!value) return null;
    const m = /^(.*)<([^>]+)>$/.exec(String(value));
    if (m) {
      const name = m[1].trim().replace(/^"|"$/g, '');
      const email = m[2].trim();
      return { name, email };
    }
    return { name: undefined, email: String(value).trim() };
  };

  const senderParsed = parseFrom(from);
  const sender = {
    name: senderParsed?.name || process.env.BREVO_SENDER_NAME || 'Aurora App',
    email: senderParsed?.email || process.env.BREVO_SENDER_EMAIL || 'no-reply@example.com',
  };

  const payload = {
    sender,
    to: recipients,
    subject: subject || '',
    htmlContent: html || (text ? `<pre>${String(text)}</pre>` : ''),
  };

  const res = await $fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data;
}
