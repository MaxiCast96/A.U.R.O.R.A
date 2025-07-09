import express from 'express';

const router = express.Router();
import clientesController from '../controllers/ClientesController.js';

router.route("/")
.get(clientesController.getClientes)
.post(clientesController.createClientes);

router.route("/:id")
.get(clientesController.getClienteById)
.put(clientesController.updateClientes)
.delete(clientesController.deleteClientes);

router.post('/login', clientesController.login);

export default router;