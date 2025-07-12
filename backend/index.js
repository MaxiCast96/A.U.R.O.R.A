// ===== INDEX.JS - PUNTO DE ENTRADA DEL SERVIDOR =====
import app from "./app.js"; // Aplicación Express configurada
import "./database.js"; // Inicializar conexión a base de datos
import { config } from "./src/config.js"; // Configuración del servidor

// Iniciar el servidor en el puerto configurado
app.listen(config.server.port, () => {
    console.log("Servidor corriendo en puerto " + config.server.port);
});