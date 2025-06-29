import mongoose from "mongoose";
import { config } from "./src/config.js";

// Importa todos los modelos que tengan referencias (ref)
import "./src/models/Sucursales.js";
import "./src/models/Empleados.js";


mongoose.connect(config.db.URI);

const connection = mongoose.connection;

connection.once("open", () => {
    console.log("DB is connected");
});

connection.on("disconnected", () => {
    console.log("DB is disconnected");
});

connection.on("error", (error) => {
    console.log("Error en la conexión", error);
});