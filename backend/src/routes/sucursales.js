import express from 'express';

const router = express.Router();
import sucursalesController from '../controllers/SucursalesController.js';

router.route("/")
.get(sucursalesController.getSucursales)
.post(sucursalesController.createSucursales);

router.route("/:id")
.get(sucursalesController.getSucursalById)
.put(sucursalesController.updateSucursales)
.delete(sucursalesController.deleteSucursales);

export default router;