import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

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
import ventasRoutes from "./src/routes/ventas.js";
import recetasRoutes from "./src/routes/recetas.js";
import registroClientesRoutes from "./src/routes/registroClientes.js";
import dashboardRoutes from "./src/routes/dashboard.js";
import authRoutes from "./src/routes/auth.js";

const app = express();

app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

// Rutas
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
app.use("/api/ventas", ventasRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/recetas", recetasRoutes);
app.use("/api/registroClientes", registroClientesRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;