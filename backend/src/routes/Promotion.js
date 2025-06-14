import express from "express";
import promocionController from "../controllers/promotionController.js";
const router = express.Router();

router
  .route("/")
  .get(promocionController.getpromociones)
  .post(promocionController.createpromocion);

router
  .route("/:id")
  .put(promocionController.updatepromocion)
  .delete(promocionController.deletepromocion);

export default router;