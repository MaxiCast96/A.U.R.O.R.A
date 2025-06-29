import express from "express";
import accesoriosController from "../controllers/AccesoriosController.js";
import multer from "multer";

// Configuración básica de multer (guarda archivos en la carpeta 'uploads')
const upload = multer({ dest: "uploads/" });

const router = express.Router();

// Rutas específicas (deben ir antes de las rutas con parámetros)
router.get("/promociones/activas", accesoriosController.getAccesoriosEnPromocion);
router.get("/marca/:marcaId", accesoriosController.getAccesoriosByMarca);

router.route("/")
    .get(accesoriosController.getAccesorios)
    .post(upload.array("imagenes", 5), accesoriosController.createAccesorios);

router.route("/:id")
    .get(accesoriosController.getAccesorioById)
    .put(upload.array("imagenes", 5), accesoriosController.updateAccesorios)
    .delete(accesoriosController.deleteAccesorios);


export default router;