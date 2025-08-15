import config from '../config.js';
import { sendMail } from '../utils/mailer.js';

const pagosController = {};

// POST /pagos/wompi/tokenizada-sin-3ds
pagosController.wompiTokenizadaSin3DS = async (req, res) => {
  try {
    const wompiBase = process.env.WOMPI_BASE_URL || 'https://api.wompi.sv';
    const apiPath = '/TransaccionCompra/TokenizadaSin3Ds';

    // Expect: { monto, emailCliente, nombreCliente, tokenTarjeta, configuracion?, datosAdicionales? }
    const body = req.body || {};
    if (!body.monto || !body.emailCliente || !body.nombreCliente || !body.tokenTarjeta) {
      return res.status(400).json({ message: 'monto, emailCliente, nombreCliente y tokenTarjeta son requeridos' });
    }

    const headers = {
      'Content-Type': 'application/json',
      // Wompi El Salvador uses Basic/Token header depending on config; commonly a "Authorization: Bearer <privkey>"
      Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY || ''}`,
    };

    const response = await fetch(`${wompiBase}${apiPath}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({ message: data?.message || 'Error Wompi', data });
    }

    // Enviar correo si se solicita
    try {
      const shouldNotify = body?.configuracion?.notificarTransaccionCliente === true;
      if (shouldNotify) {
        const tx = (data?.data || data);
        const reference = tx?.reference || tx?.id || tx?.numeroTransaccion || `WOMPI-${Date.now()}`;
        const amount = body?.monto;
        const email = body?.emailCliente;
        const name = body?.nombreCliente || '';

        const mailResult = await sendMail({
          to: email,
          subject: `Confirmación de pago - Referencia ${reference}`,
          text: `Hola ${name},\n\nTu transacción fue procesada exitosamente.\n\nReferencia: ${reference}\nMonto: $${amount}\n\nGracias por tu compra.`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.5">
              <h2>Confirmación de pago</h2>
              <p>Hola <strong>${name || 'cliente'}</strong>,</p>
              <p>Tu transacción fue procesada exitosamente.</p>
              <ul>
                <li><strong>Referencia:</strong> ${reference}</li>
                <li><strong>Monto:</strong> $${amount}</li>
              </ul>
              <p>Gracias por tu compra.</p>
            </div>
          `
        });
        console.log('Email confirmación pago ->', mailResult);
      }
    } catch (mailErr) {
      console.warn('No se pudo enviar correo de confirmación:', mailErr?.message);
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Wompi proxy error', err);
    return res.status(500).json({ message: 'Error comunicando con Wompi', error: err?.message });
  }
};

export default pagosController;

// GET /pagos/test-email?to=correo@dominio.com
pagosController.sendTestEmail = async (req, res) => {
  try {
    const to = String(req.query.to || '').trim();
    if (!to) return res.status(400).json({ success: false, message: 'Parámetro to es requerido' });
    const result = await sendMail({
      to,
      subject: 'Prueba de correo - A.U.R.O.R.A',
      text: 'Correo de prueba enviado desde el backend de A.U.R.O.R.A',
      html: '<p>Correo de <strong>prueba</strong> enviado desde el backend de A.U.R.O.R.A</p>'
    });
    return res.status(200).json({ success: true, result });
  } catch (e) {
    console.error('sendTestEmail error', e);
    return res.status(500).json({ success: false, message: e?.message });
  }
};
