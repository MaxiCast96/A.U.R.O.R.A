import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { aiChat } from '../config/aiChat';
import API_CONFIG, { buildApiUrl } from '../config/api';

  // Utilidades: normalizar imagenes y color por marca
  const normalizeImageUrl = (url) => {
    if (!url || typeof url !== 'string') return undefined;
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const base = (API_CONFIG && API_CONFIG.BASE_URL) ? String(API_CONFIG.BASE_URL) : '';
    const isStatic = /^\/(uploads|images?|static|assets)\//i.test(trimmed);
    const baseForFiles = isStatic ? base.replace(/\/?api\/?$/, '') : base; // quitar /api para archivos
    const b = baseForFiles.replace(/\/$/, '');
    const p = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${b}${p}`;
  };

  const brandColor = (text) => {
    const s = (text || '').toString();
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return { bg: `hsl(${hue} 50% 92%)`, fg: `hsl(${hue} 60% 20%)` };
  };

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy AURORA, tu asistente de la óptica. ¿En qué puedo ayudarte?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      // Map messages to API format
      const payload = next.map(m => ({ role: m.role === 'bot' ? 'assistant' : m.role, content: m.content }));
      const res = await aiChat(payload);
      const reply = (res && res.reply) ? res.reply : 'Lo siento, hubo un inconveniente al responder.';
      // Ocultar el bloque JSON al usuario (se usará solo para navegación)
      const replyWithoutJson = reply.replace(/```json[\s\S]*?```/gi, '').trim();
      const visibleReply = replyWithoutJson.length > 0 ? replyWithoutJson : 'Te guío con los pasos en la pantalla correspondiente.';
      setMessages(prev => [...prev, { role: 'assistant', content: visibleReply }]);

      // Intentar extraer bloque JSON de acción para navegación
      // Soporta: bloque ```json ... ```, JSON único, o JSON incrustado en el texto
      try {
        let jsonText = null;
        const fenceMatch = reply.match(/```json[\s\S]*?```/i);
        if (fenceMatch) {
          jsonText = fenceMatch[0]
            .replace(/```json/i, '')
            .replace(/```/g, '')
            .trim();
        } else if (reply.trim().startsWith('{') && reply.trim().endsWith('}')) {
          jsonText = reply.trim();
        } else {
          // Buscar cualquier objeto JSON dentro del texto
          const text = reply;
          let start = text.indexOf('{');
          while (start !== -1) {
            let end = text.lastIndexOf('}');
            while (end !== -1 && end > start) {
              const candidate = text.slice(start, end + 1);
              try {
                const obj = JSON.parse(candidate);
                jsonText = candidate;
                // Si parseó, salimos
                end = -1; start = -1;
              } catch (e) {
                end = text.lastIndexOf('}', end - 1);
              }
            }
            if (start !== -1) start = text.indexOf('{', start + 1);
          }
        }
        if (jsonText) {
          const actionObj = JSON.parse(jsonText);
          if (actionObj && actionObj.action === 'navigate' && typeof actionObj.to === 'string') {
            navigate(actionObj.to);
          }
        }
      } catch (_e) {
        // Silenciar errores de parseo; la UI ya mostró el texto
      }

      // Si el usuario pide opciones de lentes, intentar sugerir desde la API
      try {
        const userText = text.toLowerCase();
        const lensIntent = /(lente|lentes)/.test(userText) && /(mostrar|opcion|opciones|recomienda|suger)/.test(userText);
        if (lensIntent) {
          const url = buildApiUrl(API_CONFIG.ENDPOINTS.LENTES);
          const resp = await fetch(url, { method: 'GET', credentials: 'include' });
          if (resp.ok) {
            const data = await resp.json();
            const items = Array.isArray(data) ? data : (data?.data ?? []);
            if (Array.isArray(items) && items.length) {
              const filtered = items.filter(it => it && it.nombre && (
                // Permitir mostrar aunque no tengamos precio, ya que el usuario pidió características
                it.precio === undefined || Number(it.precio) >= 0
              ) && (
                !it.estado || String(it.estado).toLowerCase() === 'disponible'
              ));
              if (filtered.length) {
                const top = filtered.slice(0, 3);
                // Preparar tarjetas ricas: imagen, título, descripción
                const cards = top.map((it) => {
                  const title = it.nombre || it.titulo || 'Producto';
                  const descBase = it.descripcion || it.descripcionLarga || it.detalle || '';
                  const extras = [it.marca, it.categoria].filter(Boolean).join(' • ');
                  const desc = [descBase, extras].filter(Boolean).join(' \u2014 ');
                  let rawImg = it.imagen || it.image || it.foto || it.urlImagen || it.imagenPrincipal;
                  if (!rawImg && Array.isArray(it.imagenes) && it.imagenes.length) {
                    const first = it.imagenes[0];
                    if (typeof first === 'string') rawImg = first;
                    else if (first && typeof first === 'object') rawImg = first.url || first.path || first.src;
                  }
                  if (!rawImg && it.portada && typeof it.portada === 'object') {
                    rawImg = it.portada.url || it.portada.path || it.portada.src;
                  }
                  const img = normalizeImageUrl(rawImg);
                  const id = it._id || it.id || null;
                  const priceRaw = it.precioActual ?? it.precioBase ?? it.precio ?? it.price;
                  const price = typeof priceRaw === 'number' ? priceRaw : Number(priceRaw || NaN);
                  const brandName = (it.marca && (typeof it.marca === 'object' ? (it.marca.nombre || it.marca.name) : it.marca)) || '';
                  const baseForInitials = brandName || String(title);
                  const words = baseForInitials.trim().split(/\s+/).filter(Boolean);
                  const initials = (words[0]?.[0] || '') + (words[1]?.[0] || '');
                  const colors = brandColor(baseForInitials);
                  return { id, title, description: desc, image: img, price: isNaN(price) ? undefined : price, initials: initials.toUpperCase(), colors };
                });
                // Anclar un prefacio breve y luego las tarjetas
                const preface = 'Aquí tienes algunas opciones de lentes:';
                setMessages(prev => [...prev, { role: 'assistant', content: preface }, { role: 'assistant', type: 'cards', items: cards }]);
              }
            }
          }
        }
      } catch (_) {
        // Silenciar errores de sugerencias
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error al conectar con el servicio de IA.' }]);
      // Optional: console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 9999 }}>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', color: 'white', border: 'none', borderRadius: '9999px',
            padding: '14px 18px', boxShadow: '0 14px 30px rgba(2,132,199,0.45)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8
          }}
          aria-label="Abrir chat AURORA"
        >
          <span role="img" aria-label="chat">💬</span>
        </button>
      )}

      {open && (
        <div style={{
          width: 380, maxWidth: '92vw', height: 560, maxHeight: '72vh', background: 'white',
          borderRadius: 20, overflow: 'hidden', boxShadow: '0 18px 40px rgba(2, 8, 23, 0.35)'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', color: 'white', padding: '12px 16px'
          }}>
            <strong style={{ letterSpacing: 0.2 }}>AURORA · Asistente óptico</strong>
            <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: 'none', fontSize: 18, cursor: 'pointer', borderRadius: 8, padding: '2px 8px' }}>×</button>
          </div>

          <div style={{ padding: 12, height: 'calc(100% - 56px - 72px)', overflowY: 'auto', background: 'linear-gradient(180deg, #f1f5f9, #f8fafc)' }}>
            {messages.map((m, idx) => (
              <div key={idx} style={{ marginBottom: 10, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.type === 'cards' ? (
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                      {Array.isArray(m.items) && m.items.map((card, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            if (card.id) {
                              try { localStorage.setItem('aurora_preselect_product_id', String(card.id)); } catch {}
                            }
                            navigate(card.id ? `/productos?productId=${encodeURIComponent(String(card.id))}` : '/productos');
                          }}
                          style={{ display: 'flex', gap: 10, background: 'white', borderRadius: 12, padding: 8, boxShadow: '0 4px 10px rgba(0,0,0,0.06)', cursor: 'pointer' }}
                          title="Ver detalle"
                        >
                          <div style={{ position: 'relative', width: 64, height: 64 }}>
                            <div style={{
                              position: 'absolute', inset: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: 8,
                              background: (card.colors?.bg) || 'linear-gradient(135deg,#e2e8f0,#f8fafc)',
                              color: (card.colors?.fg) || '#0f172a', fontWeight: 700, fontSize: 18
                            }}>
                              {(card.initials && card.initials.trim()) ? card.initials : 'PR'}
                            </div>
                            {card.image ? (
                              <img
                                src={card.image}
                                alt={card.title}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : null}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{card.title}</div>
                            {card.description && <div style={{ fontSize: 12, color: '#334155' }}>{card.description}</div>}
                            {typeof card.price === 'number' && (
                              <div style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 600, marginTop: 4 }}>
                                ${card.price.toFixed(2)}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {user ? (
                              <button
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  if (card.id) {
                                    try {
                                      localStorage.setItem('aurora_preselect_product_id', String(card.id));
                                      localStorage.setItem('aurora_preselect_add_to_cart', '1');
                                    } catch {}
                                  }
                                  navigate(card.id ? `/productos?productId=${encodeURIComponent(String(card.id))}` : '/productos');
                                }}
                                style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}
                                title="Agregar al carrito"
                              >
                                Agregar
                              </button>
                            ) : (
                              <button
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  if (card.id) {
                                    try { localStorage.setItem('aurora_preselect_product_id', String(card.id)); } catch {}
                                  }
                                  navigate(card.id ? `/productos?productId=${encodeURIComponent(String(card.id))}` : '/productos');
                                }}
                                style={{ background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}
                                title="Ver detalles"
                              >
                                Ver detalles
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                      <button onClick={() => navigate('/productos')} style={{ background: '#0ea5e9', color: 'white', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}>
                        Ver más en Productos
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: m.role === 'user' ? 'linear-gradient(135deg, #0ea5e9, #38bdf8)' : '#ffffff',
                    color: m.role === 'user' ? 'white' : '#0f172a',
                    padding: '10px 14px', borderRadius: 14, maxWidth: '80%',
                    boxShadow: m.role === 'user'
                      ? '0 8px 18px rgba(2,132,199,0.25)'
                      : '0 6px 14px rgba(2, 8, 23, 0.06)',
                    border: m.role === 'user' ? 'none' : '1px solid #e2e8f0'
                  }}>
                    {m.content}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: '#ffffff', color: '#0f172a', padding: '10px 14px', borderRadius: 14,
                  maxWidth: '60%', border: '1px solid #e2e8f0', boxShadow: '0 6px 14px rgba(2, 8, 23, 0.06)'
                }}>
                  <span aria-label="escribiendo" title="AURORA está escribiendo" style={{ letterSpacing: 2 }}>•••</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, padding: 12, background: 'rgba(255,255,255,0.9)', borderTop: '1px solid #e2e8f0' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={loading ? 'AURORA está escribiendo...' : 'Escribe tu mensaje'}
              disabled={loading}
              style={{
                flex: 1, padding: '12px 14px', borderRadius: 9999, border: '1px solid #dbe4ee',
                background: '#fff', boxShadow: 'inset 0 1px 2px rgba(2, 8, 23, 0.06)'
              }}
            />
            <button type="submit" disabled={loading} style={{
              background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', color: 'white', border: 'none', borderRadius: 9999,
              padding: '12px 16px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(2,132,199,0.35)'
            }} aria-label="Enviar mensaje">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.4 20.6L21 12 3.4 3.4l3.1 7.6L15 12l-8.5 1z" fill="currentColor"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;
