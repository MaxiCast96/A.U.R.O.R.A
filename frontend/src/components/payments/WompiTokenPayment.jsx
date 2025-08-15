import React, { useState } from 'react';
import { API_CONFIG } from '../../config/api';

// Frontend-only Wompi Tokenized payment (no backend). Calls public API directly.
// Docs: https://api.wompi.sv
// Endpoint: POST /TransaccionCompra/TokenizadaSin3Ds
// Expected payload shape (simplified here):
// {
//   monto, emailCliente, nombreCliente, tokenTarjeta,
//   configuracion: { emailsNotificacion, urlWebhook, telefonosNotificacion, notificarTransaccionCliente },
//   datosAdicionales: { ... }
// }
// Notes:
// - You likely need an API key in headers for production environments. If Wompi requires a key,
//   add it via an env var and include in headers (e.g., Authorization or x-api-key). This component
//   supports an optional headers prop for that.

const WompiTokenPayment = ({
  amount,
  email,
  name,
  defaultToken = '',
  headers = {},
  onResult,
}) => {
  const [tokenTarjeta, setTokenTarjeta] = useState(defaultToken);
  const [emailCliente, setEmailCliente] = useState(email || '');
  const [nombreCliente, setNombreCliente] = useState(name || '');
  const [emailsNotificacion, setEmailsNotificacion] = useState(email || '');
  const [telefonosNotificacion, setTelefonosNotificacion] = useState('');
  const [urlWebhook, setUrlWebhook] = useState('');
  const [notificarTransaccionCliente, setNotificarTransaccionCliente] = useState(true);
  const today = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState(today); // formato YYYY-MM-DD (no se enviará en tokenless)
  const [additionalProp1, setAdditionalProp1] = useState('string');
  const [additionalProp2, setAdditionalProp2] = useState('string');
  const [additionalProp3, setAdditionalProp3] = useState('string');

  const [enCentavos, setEnCentavos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handlePay = async () => {
    setError(null);
    setSuccess(null);

    if (!amount || amount <= 0) {
      setError('Monto inválido.');
      return;
    }
    if (!emailCliente || !nombreCliente || !tokenTarjeta) {
      setError('Completa email, nombre y token de tarjeta.');
      return;
    }

    const montoNumerico = Number(amount);
    const montoParaEnviar = enCentavos ? Math.round(montoNumerico * 100) : montoNumerico;

    // Enviar exactamente el esquema solicitado por el backend/Wompi (sin campos extra)
    const payload = {
      monto: montoParaEnviar,
      emailCliente,
      nombreCliente,
      tokenTarjeta,
      configuracion: {
        emailsNotificacion: emailsNotificacion || undefined,
        urlWebhook: urlWebhook || undefined,
        telefonosNotificacion: telefonosNotificacion || undefined,
        notificarTransaccionCliente,
      },
      datosAdicionales: {
        additionalProp1,
        additionalProp2,
        additionalProp3,
      },
    };

    setLoading(true);
    try {
      // Enviar pago directamente al endpoint tokenless del backend
      const payRes = await fetch(`${API_CONFIG.BASE_URL}/wompi/tokenless`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const payText = await payRes.text();
      let payData = {};
      try { payData = payText ? JSON.parse(payText) : {}; } catch { payData = { raw: payText }; }
      if (!payRes.ok || payData?.success === false) {
        const rawErr = payData?.error ?? payData ?? null;
        const msg = typeof rawErr === 'string' ? rawErr : JSON.stringify(rawErr, null, 2);
        console.error('Wompi proxy error', { status: payRes.status, payData });
        setError(msg || `HTTP ${payRes.status}`);
        onResult?.({ ok: false, step: 'payment', status: payRes.status, error: payData });
        return;
      }
      console.log('Wompi proxy OK', payData);
      setSuccess('Pago procesado correctamente.');
      onResult?.({ ok: true, data: payData });
    } catch (e) {
      setError(e.message || 'Error procesando el pago.');
      onResult?.({ ok: false, error: e });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && <div className="bg-red-50 text-red-700 p-2 rounded">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-2 rounded">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600">Fecha (obligatoria)</label>
          <input type="date" className="w-full border rounded px-3 py-2" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Email del cliente</label>
          <input className="w-full border rounded px-3 py-2" value={emailCliente} onChange={(e) => setEmailCliente(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Nombre del cliente</label>
          <input className="w-full border rounded px-3 py-2" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Token de tarjeta</label>
          <input className="w-full border rounded px-3 py-2" value={tokenTarjeta} onChange={(e) => setTokenTarjeta(e.target.value)} placeholder="tok_..." />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Emails de notificación</label>
          <input className="w-full border rounded px-3 py-2" value={emailsNotificacion} onChange={(e) => setEmailsNotificacion(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Teléfonos de notificación</label>
          <input className="w-full border rounded px-3 py-2" value={telefonosNotificacion} onChange={(e) => setTelefonosNotificacion(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">URL Webhook (opcional)</label>
          <input className="w-full border rounded px-3 py-2" value={urlWebhook} onChange={(e) => setUrlWebhook(e.target.value)} placeholder="string o https://..." />
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <input id="notif-client" type="checkbox" checked={notificarTransaccionCliente} onChange={(e) => setNotificarTransaccionCliente(e.target.checked)} />
          <label htmlFor="notif-client" className="text-sm text-gray-700">Notificar transacción al cliente</label>
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <input id="centavos" type="checkbox" checked={enCentavos} onChange={(e) => setEnCentavos(e.target.checked)} />
          <label htmlFor="centavos" className="text-sm text-gray-700">Enviar monto en centavos (monto x 100)</label>
        </div>
        <div className="md:col-span-2 border-t pt-3">
          <h4 className="font-medium mb-2">Datos adicionales</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600">additionalProp1</label>
              <input className="w-full border rounded px-3 py-2" value={additionalProp1} onChange={(e) => setAdditionalProp1(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600">additionalProp2</label>
              <input className="w-full border rounded px-3 py-2" value={additionalProp2} onChange={(e) => setAdditionalProp2(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600">additionalProp3</label>
              <input className="w-full border rounded px-3 py-2" value={additionalProp3} onChange={(e) => setAdditionalProp3(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="text-right">
        <button
          type="button"
          className="bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 disabled:opacity-60"
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? 'Procesando...' : `Pagar $${Number(amount || 0).toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default WompiTokenPayment;
