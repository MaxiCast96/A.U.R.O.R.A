import express from "express";
import citasController from "../controllers/CitasController.js";

const router = express.Router();

router.route("/")
    .get(citasController.getCitas)
    .post(citasController.createCita);

router.route("/:id")
    .get(citasController.getCitaById)
    .put(citasController.updateCita)
    .delete(citasController.deleteCita);

export default router;