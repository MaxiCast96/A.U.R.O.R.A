// ===== APP.JS - CONFIGURACIÓN PRINCIPAL DE EXPRESS =====
import express from "express";
import cookieParser from "cookie-parser"; // Para manejar cookies HTTP
import cors from "cors"; // Para manejar CORS (Cross-Origin Resource Sharing)

// Importar la conexión a la base de datos PRIMERO para registrar todos los modelos
import database from "./database.js"; // Importación por defecto

// Importar todas las rutas del sistema (después de registrar modelos)
import empleadosRoutes from "./src/routes/empleados.js"; // Gestión de empleados
import optometristaRoutes from "./src/routes/optometrista.js"; // Gestión de optometristas
import clientesRoutes from "./src/routes/clientes.js"; // Gestión de clientes
import registroEmpleadosRoutes from "./src/routes/registroEmpleados.js"; // Registro de empleados
import sucursalesRoutes from "./src/routes/sucursales.js"; // Gestión de sucursales
import marcasRoutes from "./src/routes/marcas.js"; // Gestión de marcas
import accesoriosRoutes from "./src/routes/accesorios.js"; // Gestión de accesorios
import lentesRoutes from "./src/routes/lentes.js"; // Gestión de lentes
import categoriaRoutes from "./src/routes/categoria.js"; // Gestión de categorías
import historialMedicoRoutes from "./src/routes/historialMedico.js"; // Historiales médicos
import citasRoutes from "./src/routes/citas.js"; // Sistema de citas
import CarritoRoutes from "./src/routes/carrito.js"; // Carrito de compras
import promocionesRoutes from "./src/routes/promociones.js"; // Sistema de promociones
import cotizacionesRoutes from "./src/routes/cotizaciones.js"; // Sistema de cotizaciones
import productosPersonalizadosRoutes from "./src/routes/productosPersonalizados.js"; // Productos personalizados
import ventasRoutes from "./src/routes/ventas.js"; // Sistema de ventas
import recetasRoutes from "./src/routes/recetas.js"; // Recetas médicas
import registroClientesRoutes from "./src/routes/registroClientes.js"; // Registro de clientes
import dashboardRoutes from "./src/routes/dashboard.js"; // Dashboard y estadísticas
import authRoutes from "./src/routes/auth.js"; // Sistema de autenticación

// Función para hacer ping a la base de datos periódicamente
function keepDatabaseAlive() {
    setInterval(async () => {
        try {
            await database.query('SELECT 1'); // Realiza una consulta simple para mantener la conexión activa
            console.log('Ping a la base de datos exitoso');
        } catch (error) {
            console.error('Error al hacer ping a la base de datos:', error);
        }
    }, 300000); // Intervalo de 5 minutos (300,000 ms)
}

// Llama a la función para mantener la conexión activa
keepDatabaseAlive();

// Crear instancia de Express
const app = express();

// MIDDLEWARE DE CONFIGURACIÓN GLOBAL

// Middleware para parsear cookies en las peticiones
app.use(cookieParser());

// Configuración de CORS para permitir peticiones desde el frontend
app.use(cors({
    origin: ['http://localhost:5173', 'https://a-u-r-o-r-a.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear JSON en el body de las peticiones
app.use(express.json());

// CONFIGURACIÓN DE RUTAS - Cada ruta tiene su prefijo específico

app.use("/api/empleados", empleadosRoutes); // /api/empleados/* - Rutas de empleados
app.use("/api/optometrista", optometristaRoutes); // /api/optometrista/* - Rutas de optometristas
app.use("/api/clientes", clientesRoutes); // /api/clientes/* - Rutas de clientes
app.use("/api/registroEmpleados", registroEmpleadosRoutes); // /api/registroClientes/* - Registro empleados
app.use("/api/sucursales", sucursalesRoutes); // /api/sucursales/* - Rutas de sucursales
app.use("/api/marcas", marcasRoutes); // /api/marcas/* - Rutas de marcas
app.use("/api/accesorios", accesoriosRoutes); // /api/accesorios/* - Rutas de accesorios
app.use("/api/lentes", lentesRoutes); // /api/lentes/* - Rutas de lentes
app.use("/api/categoria", categoriaRoutes); // /api/categoria/* - Rutas de categorías
app.use("/api/historialMedico", historialMedicoRoutes); // /api/historialMedico/* - Historiales médicos
app.use("/api/citas", citasRoutes); // /api/citas/* - Rutas de citas
app.use("/api/carrito", CarritoRoutes); // /api/carrito/* - Rutas del carrito
app.use("/api/promociones", promocionesRoutes); // /api/promociones/* - Rutas de promociones
app.use("/api/cotizaciones", cotizacionesRoutes); // /api/cotizaciones/* - Rutas de cotizaciones
app.use("/api/productosPersonalizados", productosPersonalizadosRoutes); // /api/productosPersonalizados/*
app.use("/api/ventas", ventasRoutes); // /api/ventas/* - Rutas de ventas
app.use("/api/auth", authRoutes); // /api/auth/* - Rutas de autenticación
app.use("/api/recetas", recetasRoutes); // /api/recetas/* - Rutas de recetas
app.use("/api/registroClientes", registroClientesRoutes); // /api/registroClientes/* - Registro clientes
app.use("/api/dashboard", dashboardRoutes); // /api/dashboard/* - Rutas del dashboard

// MIDDLEWARE DE MANEJO DE ERRORES GLOBAL
app.use((err, req, res, next) => {
    console.error('Error global:', err);
    
    // Si es un error de timeout o conexión
    if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
        return res.status(504).json({
            success: false,
            message: 'Timeout de conexión. Por favor, intenta nuevamente.'
        });
    }
    
    // Si es un error de validación de Mongoose
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Error de validación: ' + err.message
        });
    }
    
    // Si es un error de cast de ObjectId
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'ID inválido proporcionado'
        });
    }
    
    // Error genérico del servidor
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor: ' + err.message
    });
});

// MIDDLEWARE PARA RUTAS NO ENCONTRADAS
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Exportar la aplicación configurada
export default app;