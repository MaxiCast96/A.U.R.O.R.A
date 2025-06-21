import express from "express";
import registroClientes from "../controllers/RegistroClientesController.js";
const router = express.Router();

router.route("/").post(registroClientes.register);
router.route("/verifyCodeEmail").post(registroClientes.verifyCodeEmail);

export default router;