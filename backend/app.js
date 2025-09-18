// ===== APP.JS - CONFIGURACIÓN PRINCIPAL DE EXPRESS =====
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import database from "./database.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Importar rutas
import empleadosRoutes from "./src/routes/empleados.js";
import optometristaRoutes from "./src/routes/optometrista.js";
import clientesRoutes from "./src/routes/clientes.js";
import registroEmpleadosRoutes from "./src/routes/registroEmpleados.js";
import sucursalesRoutes from "./src/routes/sucursales.js";
import marcasRoutes from "./src/routes/marcas.js";
import accesoriosRoutes from "./src/routes/accesorios.js";
import lentesRoutes from "./src/routes/lentes.js";
import categoriaRoutes from "./src/routes/categoria.js";
import historialMedicoRoutes from "./src/routes/historialMedico.js";
import citasRoutes from "./src/routes/citas.js";
import CarritoRoutes from "./src/routes/carrito.js";
import promocionesRoutes from "./src/routes/promociones.js";
import cotizacionesRoutes from "./src/routes/cotizaciones.js";
import productosPersonalizadosRoutes from "./src/routes/productosPersonalizados.js";
import catalogoModificacionesRoutes from "./src/routes/catalogoModificaciones.js";
import ventasRoutes from "./src/routes/ventas.js";
import recetasRoutes from "./src/routes/recetas.js";
import registroClientesRoutes from "./src/routes/registroClientes.js";
import dashboardRoutes from "./src/routes/dashboard.js";
import authRoutes from "./src/routes/auth.js";
import pedidosRoutes from "./src/routes/pedidos.js";
import auditoriaRoutes from "./src/routes/auditoria.js";
import { auditLogger } from "./src/middlewares/audit.js";

// Mantener viva la BD
function keepDatabaseAlive() {
    setInterval(async () => {
        try {
            await database.query('SELECT 1');
            console.log('Ping a la base de datos exitoso');
        } catch (error) {
            console.error('Error al hacer ping a la base de datos:', error);
        }
    }, 300000);
}
keepDatabaseAlive();

const app = express();

// Middleware global
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'aurora-production-7e57.up.railway.app', 'https://maxicast96.github.io', 'http://localhost:4000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Auditoría: registrar después de json, antes de rutas
app.use(auditLogger);

// Servir archivos estáticos de uploads (imágenes)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Prefijos de rutas
app.use("/api/empleados", empleadosRoutes);
app.use("/api/optometrista", optometristaRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/registroEmpleados", registroEmpleadosRoutes);
app.use("/api/sucursales", sucursalesRoutes);
app.use("/api/marcas", marcasRoutes);
app.use("/api/accesorios", accesoriosRoutes);
app.use("/api/lentes", lentesRoutes);
app.use("/api/categoria", categoriaRoutes);
app.use("/api/historialMedico", historialMedicoRoutes);
app.use("/api/citas", citasRoutes);
app.use("/api/carrito", CarritoRoutes);
app.use("/api/promociones", promocionesRoutes);
app.use("/api/cotizaciones", cotizacionesRoutes);
app.use("/api/productosPersonalizados", productosPersonalizadosRoutes);
app.use("/api/catalogoModificaciones", catalogoModificacionesRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/recetas", recetasRoutes);
app.use("/api/registroClientes", registroClientesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auditoria", auditoriaRoutes);

// ================= Helpers =================
const getFetch = async () => {
    if (global.fetch) return global.fetch;
    const mod = await import('node-fetch');
    return mod.default;
};

// Helper para pedir token OAuth válido de Wompi
async function getWompiAccessToken() {
    const _fetch = await getFetch();
    const resp = await _fetch('https://id.wompi.sv/connect/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: process.env.GRANT_TYPE || 'client_credentials',
            client_id: process.env.APP_ID,
            client_secret: process.env.API_SECRET,
            audience: process.env.AUDIENCE || 'https://api.wompi.sv/',
            ...(process.env.SCOPE ? { scope: process.env.SCOPE } : {})
        })
    });
    if (!resp.ok) {
        throw new Error(`Error obteniendo token OAuth: ${await resp.text()}`);
    }
    const data = await resp.json();
    return data.access_token;
}

// ================= Rutas Wompi =================

// Obtener token manual
app.post('/api/wompi/token', async (req, res) => {
    try {
        const token = await getWompiAccessToken();
        res.json({ success: true, access_token: token });
    } catch (err) {
        console.error('Wompi token error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Pago tokenizado sin 3DS
app.post('/api/wompi/tokenless', async (req, res) => {
    try {
        const formData = req.body || {};
        // Aceptar el nuevo esquema
        const {
            monto,
            emailCliente,
            nombreCliente,
            tokenTarjeta,
            configuracion = {},
            datosAdicionales = {}
        } = formData;

        // Log seguro sin datos sensibles
        console.log('Wompi tokenless request (safe):', JSON.stringify({
            monto,
            emailCliente,
            nombreCliente,
            hasToken: Boolean(tokenTarjeta),
        }));

        if (!formData) {
            return res.status(400).json({ success: false, error: 'Datos de pago requeridos' });
        }

        // Simulación si token dev o credenciales faltan
        const isDevToken = typeof tokenTarjeta === 'string' && tokenTarjeta.startsWith('tok_dev_');
        const credsMissing = (!process.env.APP_ID || !process.env.API_SECRET);
        if (isDevToken || credsMissing) {
            if (credsMissing) console.log('Wompi creds missing - simulating');
            return res.json({
                success: true,
                data: {
                    transactionId: `SIM-${Date.now()}`,
                    status: 'approved',
                    monto: Number(monto) || 0,
                    emailCliente,
                    nombreCliente,
                    tokenTarjeta,
                    message: 'Pago simulado exitoso'
                }
            });
        }

        // Intento real (si hay credenciales y token no es dev)
        let accessToken = null;
        try {
            accessToken = await getWompiAccessToken();
        } catch (tokenError) {
            console.log('Wompi OAuth failed - simulating');
            return res.json({
                success: true,
                data: {
                    transactionId: `SIM-${Date.now()}`,
                    status: 'approved',
                    monto: Number(monto) || 0,
                    emailCliente,
                    nombreCliente,
                    tokenTarjeta,
                    message: 'Pago simulado por error OAuth'
                }
            });
        }

        const _fetch = await getFetch();
        const headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        };
        if (process.env.WOMPI_PUBLIC_API_KEY) headers['x-api-key'] = process.env.WOMPI_PUBLIC_API_KEY;

        // TODO: Mapear al contrato real de Wompi SV si difiere
        const wompiPayload = formData;
        const resp = await _fetch('https://api.wompi.sv/TransaccionCompra/TokenizadaSin3Ds', {
            method: 'POST',
            headers,
            body: JSON.stringify(wompiPayload)
        });

        const text = await resp.text();
        let data;
        try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

        console.log('Wompi API response status:', resp.status);
        if (!resp.ok) {
            return res.status(resp.status).json({ success: false, error: data, upstreamStatus: resp.status });
        }

        return res.json({ success: true, data });
    } catch (err) {
        console.error('Wompi tokenless error:', err);
        res.status(500).json({ success: false, error: err.message || 'Error al procesar el pago' });
    }
});

// Pago de prueba con token ya obtenido
app.post('/api/wompi/testPayment', async (req, res) => {
    try {
        const { token, formData } = req.body;
        if (!token) return res.status(400).json({ success: false, error: 'Token de acceso requerido' });
        if (!formData) return res.status(400).json({ success: false, error: 'Datos de pago requeridos' });

        const _fetch = await getFetch();
        const resp = await _fetch('https://api.wompi.sv/TransaccionCompra/TokenizadaSin3Ds', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!resp.ok) {
            const error = await resp.text();
            return res.status(resp.status).json({ success: false, error });
        }

        const data = await resp.json();
        res.json({ success: true, data });
    } catch (err) {
        console.error('Wompi testPayment error:', err);
        res.status(500).json({ success: false, error: 'Error al procesar el pago' });
    }
});

// Pago real 3DS
app.post('/api/wompi/payment3ds', async (req, res) => {
    try {
        const formData = req.body;
        if (!formData) return res.status(400).json({ success: false, error: 'Datos de pago requeridos' });

        const _fetch = await getFetch();
        const accessToken = await getWompiAccessToken();

        const resp = await _fetch('https://api.wompi.sv/TransaccionCompra/3Ds', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(formData)
        });

        if (!resp.ok) {
            const error = await resp.text();
            return res.status(resp.status).json({ success: false, error });
        }

        const data = await resp.json();
        res.json({ success: true, data });
    } catch (err) {
        console.error('Wompi payment3ds error:', err);
        res.status(500).json({ success: false, error: 'Error al procesar el pago' });
    }
});

// ================= Middleware de errores =================
app.use((err, req, res, next) => {
    console.error('Error global:', err);
    if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
        return res.status(504).json({ success: false, message: 'Timeout de conexión. Intenta nuevamente.' });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: 'Error de validación: ' + err.message });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'ID inválido proporcionado' });
    }
    res.status(500).json({ success: false, message: 'Error interno del servidor: ' + err.message });
});

// ================= Middleware para 404 =================
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

export default app;
