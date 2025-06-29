import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import empleadosRoutes from "./src/routes/empleados.js";
import registroEmpleadosRoutes from "./src/routes/registroEmpleados.js";
import sucursalesRoutes from "./src/routes/sucursales.js";
import marcasRoutes from "./src/routes/marcas.js";
import accesoriosRoutes from "./src/routes/accesorios.js";
import lentesRoutes from "./src/routes/lentes.js";
import categoriaRoutes from "./src/routes/categoria.js";
import historialMedicoRoutes from "./src/routes/historialMedico.js";

const app = express();

app.use(cookieParser());

// Configuración de CORS
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

// Para aceptar datos en JSON
app.use(express.json());

app.use("/api/empleados", empleadosRoutes);
app.use("/api/registroEmpleados", registroEmpleadosRoutes);
app.use("/api/sucursales", sucursalesRoutes);
app.use("/api/marcas", marcasRoutes);
app.use("/api/accesorios", accesoriosRoutes);
app.use("/api/lentes", lentesRoutes);
app.use("/api/categoria", categoriaRoutes);
app.use("/api/historialMedico", historialMedicoRoutes);

export default app;