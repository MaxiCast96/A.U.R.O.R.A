import config from '../config.js';

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

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Wompi proxy error', err);
    return res.status(500).json({ message: 'Error comunicando con Wompi', error: err?.message });
  }
};

export default pagosController;
