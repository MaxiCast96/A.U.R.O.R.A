import express from "express";
import CategoriaController from "../controllers/CategoriaController.js";
import multer from "multer";

// Configuración básica de multer (guarda archivos en la carpeta 'uploads')
const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.route("/")
    .get(CategoriaController.getCategoria)
    .post(upload.single("icono"), CategoriaController.createCategoria);

router.route("/:id")
    .get(CategoriaController.getCategoriaById)
    .put(upload.single("icono"), CategoriaController.updateCategoria)
    .delete(CategoriaController.deleteCategoria);

export default router;