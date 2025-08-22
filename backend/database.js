// ===== DATABASE.JS - CONFIGURACIÓN Y CONEXIÓN A MONGODB =====
import mongoose from "mongoose"; // ODM para MongoDB
import { config } from "./src/config.js"; // Configuración centralizada

// IMPORTAR TODOS LOS MODELOS
// Es importante importar todos los modelos para que Mongoose los registre
// antes de hacer cualquier operación con la base de datos

import "./src/models/Sucursales.js"; // Modelo de sucursales
import "./src/models/Empleados.js"; // Modelo de empleados
import "./src/models/Clientes.js"; // Modelo de clientes
import "./src/models/Citas.js"; // Modelo de citas médicas
import "./src/models/ProductosPersonalizados.js"; // Modelo de productos personalizados
import "./src/models/Ventas.js"; // Modelo de ventas
import "./src/models/Cotizaciones.js"; // Modelo de cotizaciones
import "./src/models/Recetas.js"; // Modelo de recetas médicas
import "./src/models/HistorialMedico.js"; // Modelo de historiales médicos
import "./src/models/Lentes.js"; // Modelo de lentes
import "./src/models/Accesorios.js"; // Modelo de accesorios
import "./src/models/Categoria.js"; // Modelo de categorías
import "./src/models/Marcas.js"; // Modelo de marcas
import "./src/models/Optometrista.js"; // Modelo de optometristas
import "./src/models/Promociones.js"; // Modelo de promociones
import "./src/models/Carrito.js"; // Modelo del carrito de compras

// Establecer conexión con MongoDB usando la URI de configuración
mongoose.connect(config.database.uri, {
    serverSelectionTimeoutMS: 30000, // Timeout de 30 segundos para selección de servidor
    socketTimeoutMS: 45000, // Timeout de 45 segundos para operaciones de socket
    connectTimeoutMS: 30000, // Timeout de 30 segundos para conexión inicial
    maxPoolSize: 10, // Máximo número de conexiones en el pool
    minPoolSize: 1, // Mínimo número de conexiones en el pool
    maxIdleTimeMS: 30000, // Tiempo máximo que una conexión puede estar inactiva
    retryWrites: true, // Reintentar escrituras fallidas
    w: 'majority' // Confirmar escrituras en la mayoría de réplicas
});

// Obtener referencia a la conexión
const connection = mongoose.connection;

// EVENTOS DE CONEXIÓN

// Evento que se ejecuta cuando la conexión se establece exitosamente
connection.once("open", () => {
    console.log("Base de datos conectada");
});

// Evento que se ejecuta cuando la conexión se pierde
connection.on("disconnected", () => {
    console.log("Base de datos desconectada");
});

// Evento que se ejecuta cuando hay errores en la conexión
connection.on("error", (error) => {
    console.log("Error en la conexión:", error);
});

const database = {
    query: async (sql) => {
        // Implementación de la consulta a la base de datos
        console.log(`Ejecutando consulta: ${sql}`);
        return true; // Simulación de respuesta
    }
};

export default database;