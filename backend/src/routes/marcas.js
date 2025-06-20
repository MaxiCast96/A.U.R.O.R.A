import express from "express";
import marcasController from "../controllers/MarcasController.js";
import multer from "multer";

// Configuración básica de multer (guarda archivos en la carpeta 'uploads')
const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.route("/")
    .get(marcasController.getMarcas)
    .post(upload.single("logo"), marcasController.createMarcas);

router.route("/:id")
    .get(marcasController.getMarcaById)
    .put(upload.single("logo"), marcasController.updateMarcas)
    .delete(marcasController.deleteMarcas);

export default router;