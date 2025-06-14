// Importo todo lo de la libreria de Express
import express from "express";
import cartRoutes from "./src/routes/Carrito.js";
import promotionRoutes from "./src/routes/Promotion.js";

import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());

app.use(cookieParser());

app.use("/api/carts", cartRoutes);
app.use("/api/promotions", promotionRoutes);

export default app;