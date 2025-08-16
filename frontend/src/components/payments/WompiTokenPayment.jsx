import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import API_CONFIG, { buildApiUrl } from "../../config/api";

const WompiTokenPayment = forwardRef(({ amount, email, name, configuracion, datosAdicionales, headers = {}, onResult }, ref) => {
  const [form, setForm] = useState({
    number: "4242424242424242",
    exp_month: "08",
    exp_year: "28",
    cvc: "123",
    card_holder: name || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [tokenTarjeta, setTokenTarjeta] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Dev-safe tokenization (no envío de PAN): genera un token local
  const handleTokenize = () => {
    const last4 = (form.number || "").slice(-4);
    const mock = `tok_dev_${Date.now()}_${last4}`;
    setTokenTarjeta(mock);
  };

  // Auto-tokenize al montar el componente o cuando cambia el titular
  useEffect(() => {
    // Si no hay token aún, autogenerarlo (solo mock para dev)
    if (!tokenTarjeta) {
      const last4 = (form.number || "").slice(-4) || "0000";
      const mock = `tok_dev_${Date.now()}_${last4}`;
      setTokenTarjeta(mock);
    }
    // Asegurar que el titular refleje el nombre proporcionado
    if (name && form.card_holder !== name) {
      setForm((f) => ({ ...f, card_holder: name }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const handlePay = async () => {
    if (!amount || amount <= 0) {
      onResult?.({ ok: false, error: "Monto inválido" });
      return;
    }

    setSubmitting(true);
    try {
      const token = tokenTarjeta;
      const payload = {
        monto: Number(amount),
        emailCliente: email || "",
        nombreCliente: form.card_holder || name || "",
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
        <input className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-300" name="number" value={form.number} onChange={handleChange} placeholder="Número de tarjeta" />
        <input className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-300" name="exp_month" value={form.exp_month} onChange={handleChange} placeholder="MM" />
        <input className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-300" name="exp_year" value={form.exp_year} onChange={handleChange} placeholder="YY" />
        <input className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-300" name="cvc" value={form.cvc} onChange={handleChange} placeholder="CVC" />
      </div>
      <input className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-1 focus:ring-sky-300" name="card_holder" value={form.card_holder} onChange={handleChange} placeholder="Titular" />
      {/* UI de token ocultada para evitar ruido visual */}
    </div>
  );
});

export default WompiTokenPayment;
