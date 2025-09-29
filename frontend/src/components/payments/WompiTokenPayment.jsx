import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import API_CONFIG, { buildApiUrl } from "../../config/api";

const WompiTokenPayment = forwardRef(({ amount, email, name, configuracion, datosAdicionales, headers = {}, onResult }, ref) => {
  const [form, setForm] = useState({
    number: "",
    exp_month: "",
    exp_year: "",
    cvc: "",
    card_holder: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [tokenTarjeta, setTokenTarjeta] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Dev-safe tokenization (no envío de PAN): genera un token local solo si hay datos mínimos
  const handleTokenize = () => {
    const last4 = (form.number || "").slice(-4);
    if (!form.number || !form.exp_month || !form.exp_year || !form.cvc || !form.card_holder) return null;
    const mock = `tok_dev_${Date.now()}_${last4 || '0000'}`;
    setTokenTarjeta(mock);
    return mock;
  };

  // No auto-tokenize ni auto-rellenar nombre: se requiere entrada manual

  const handlePay = async () => {
    if (!amount || amount <= 0) {
      onResult?.({ ok: false, error: "Monto inválido" });
      return;
    }

    setSubmitting(true);
    try {
      // Generar token si aún no existe y hay datos
      let token = tokenTarjeta;
      if (!token) {
        token = handleTokenize();
      }
      if (!token) {
        onResult?.({ ok: false, error: "Completa los datos de la tarjeta" });
        return { ok: false, error: "Completa los datos de la tarjeta" };
      }
      const payload = {
        monto: Number(amount),
        emailCliente: email || "",
        nombreCliente: form.card_holder || "",
        tokenTarjeta: token,
        configuracion: {
          emailsNotificacion: "",
          urlWebhook: "",
          telefonosNotificacion: "",
          notificarTransaccionCliente: true,
          ...(configuracion || {}),
        },
        datosAdicionales: {
          ...(datosAdicionales || {}),
        },
      };

      console.groupCollapsed("[Wompi] Payload enviado a /wompi/tokenless");
      // Seguro: no se imprime PAN/CVC, sólo el token
      console.log(JSON.stringify(payload, null, 2));
      console.groupEnd();

      const resp = await fetch(buildApiUrl("/wompi/tokenless"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      console.groupCollapsed("[Wompi] Respuesta de /wompi/tokenless");
      console.log(JSON.stringify(data, null, 2));
      console.groupEnd();

      if (resp.ok && data?.success) {
        const res = { ok: true, transactionId: data?.data?.transactionId || data?.data?.id || data?.data?.Transaccion || null };
        onResult?.(res);
        return res;
      } else {
        const res = { ok: false, error: data?.error || data?.message || "Pago rechazado" };
        onResult?.(res);
        return res;
      }
    } catch (err) {
      console.error("Error en pago Wompi:", err);
      const res = { ok: false, error: err.message || "Error de red" };
      onResult?.(res);
      return res;
    } finally {
      setSubmitting(false);
    }
  };

  // Exponer método pay() al padre
  useImperativeHandle(ref, () => ({
    pay: () => handlePay(),
    getToken: () => tokenTarjeta,
  }));

  return (
    <div className="space-y-3 bg-sky-50 border border-sky-100 rounded-xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-300" id="cc-number" name="number" value={form.number} onChange={handleChange} placeholder="Número de tarjeta" autoComplete="cc-number" />
        <input className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-300" id="cc-exp-month" name="exp_month" value={form.exp_month} onChange={handleChange} placeholder="MM" autoComplete="cc-exp-month" />
        <input className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-300" id="cc-exp-year" name="exp_year" value={form.exp_year} onChange={handleChange} placeholder="YY" autoComplete="cc-exp-year" />
        <input className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-300" id="cc-csc" name="cvc" value={form.cvc} onChange={handleChange} placeholder="CVC" autoComplete="cc-csc" />
      </div>
      <input className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-1 focus:ring-sky-300" id="cc-name" name="card_holder" value={form.card_holder} onChange={handleChange} placeholder="Titular (como aparece en la tarjeta)" autoComplete="cc-name" />
      {/* UI de token ocultada para evitar ruido visual */}
    </div>
  );
});

export default WompiTokenPayment;
