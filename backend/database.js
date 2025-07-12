import mongoose from "mongoose";
import { config } from "./src/config.js";

// Importar modelos
import "./src/models/Sucursales.js";
import "./src/models/Empleados.js";
import "./src/models/Clientes.js";
import "./src/models/Citas.js";
import "./src/models/ProductosPersonalizados.js";
import "./src/models/Ventas.js";
import "./src/models/Cotizaciones.js";
import "./src/models/Recetas.js";
import "./src/models/HistorialMedico.js";
import "./src/models/Lentes.js";
import "./src/models/Accesorios.js";
import "./src/models/Categoria.js";
import "./src/models/Marcas.js";
import "./src/models/Optometrista.js";
import "./src/models/Promociones.js";
import "./src/models/Carrito.js";

// Conectar a MongoDB
mongoose.connect(config.database.uri);

const connection = mongoose.connection;

connection.once("open", () => {
    console.log("Base de datos conectada");
});

connection.on("disconnected", () => {
    console.log("Base de datos desconectada");
});

connection.on("error", (error) => {
    console.log("Error en la conexión:", error);
});