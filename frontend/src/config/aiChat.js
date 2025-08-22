// Config para el microservicio de IA (FastAPI)
// Prioriza variable de entorno, luego localhost
export const AI_CHAT_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_AI_CHAT_BASE)
  ? String(import.meta.env.VITE_AI_CHAT_BASE).trim()
  : 'http://localhost:8000';

export async function aiChat(messages, opts = {}) {
  const url = AI_CHAT_BASE.replace(/\/$/, '') + '/chat';
  const body = {
    messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.max_tokens ?? 512,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI chat error ${res.status}: ${text}`);
  }
  return res.json(); // { reply }
}
