// Importo todo lo de la libreria de Express
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";


// Creo una constante que es igual a la libreria que importé
const app = express();

app.use(cookieParser())  

// Configuración de CORS
app.use(
    cors({
      origin: "http://localhost:5173",
      // Permitir envío de cookies y credenciales
      credentials: true
    })
  );


//Que acepte datos en json
app.use(express.json());

// Definir las rutas de las funciones que tendrá la página web


// Exporto la constante para poder usar express en otros archivos
export default app;