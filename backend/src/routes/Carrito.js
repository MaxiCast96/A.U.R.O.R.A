import express from "express";
import cartController from "../controllers/cartController.js";
const router = express.Router();

router
  .route("/")
  .get(cartController.getCarts)
  .post(cartController.createCart);

router
  .route("/:id")
  .get(cartController.getCartById)
  .put(cartController.updateCart)
  .delete(cartController.deleteCart);

// Ruta adicional para obtener carrito por cliente
router
  .route("/cliente/:clienteId")
  .get(cartController.getCartByClient);

export default router;