// Lightweight mailer service using Brevo HTTP API (no SMTP)
// Env required: BREVO_API_KEY. Optional: BREVO_SENDER_NAME, BREVO_SENDER_EMAIL

export async function sendEmail({ to, subject, html, text, from }) {
  // TODO: Reemplaza con tu API Key habilitada en Brevo (Transactional)
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

  // Forzar remitente verificado en Brevo (ignorar "from" de entrada)
  // TODO: Reemplaza con tu remitente VERIFICADO en Brevo (o dominio autenticado SPF/DKIM)
  const sender = {
    name: 'Óptica La Inteligente',
    email: 'opticalainteligente@gmail.com',
  };

  const payload = {
    sender,
    replyTo: sender,
    to: recipients,
    subject: subject || '',
    htmlContent: html || (text ? `<pre>${String(text)}</pre>` : ''),
  };

  // Logging previo al envío
  try {
    console.log('[Mailer] Preparing Brevo send:', {
      to: recipients,
      from: sender,
      subjectPreview: String(subject || '').slice(0, 80),
      htmlLength: html ? String(html).length : 0,
      textLength: text ? String(text).length : 0,
    });
  } catch (_) { /* noop */ }

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
    try {
      console.error('[Mailer] Brevo send FAILED', { status: res.status, body });
    } catch (_) { /* noop */ }
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  try {
    console.log('[Mailer] Brevo send OK:', data);
  } catch (_) { /* noop */ }
  return data;
}