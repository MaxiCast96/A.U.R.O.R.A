import express from "express";
import registroEmpleados from "../controllers/RegistroEmpleadosController.js";
const router = express.Router();

router.route("/").post(registroEmpleados.register);
router.route("/verifyCodeEmail").post(registroEmpleados.verifyCodeEmail);

export default router;