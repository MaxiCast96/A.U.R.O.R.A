import app from "./app.js";
import "./database.js";
import { config } from "./src/config.js";

app.listen(config.server.port, () => {
    console.log("Servidor corriendo en puerto " + config.server.port);
});