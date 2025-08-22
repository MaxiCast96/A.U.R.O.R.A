// ===== RUTAS REGISTRO CLIENTES =====
import express from "express";
import registroClientes from "../controllers/RegistroClientesController.js";

const router = express.Router();

// POST /api/registroClientes - Registrar nuevo cliente
router.route("/").post(registroClientes.register);

// POST /api/registroClientes/verifyCodeEmail - Verificar código de email
router.route("/verifyCodeEmail").post(registroClientes.verifyCodeEmail);

export default router;