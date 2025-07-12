// ===== RUTAS REGISTRO EMPLEADOS =====
import express from "express";
import registroEmpleados from "../controllers/RegistroEmpleadosController.js";

const router = express.Router();

// POST /api/registroEmpleados - Registrar nuevo empleado
router.route("/").post(registroEmpleados.register);

// POST /api/registroEmpleados/verifyCodeEmail - Verificar código de email para empleado
router.route("/verifyCodeEmail").post(registroEmpleados.verifyCodeEmail);

export default router;