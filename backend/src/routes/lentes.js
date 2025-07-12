// ===== RUTAS LENTES =====
import express from 'express';
import multer from "multer";
import lentesController from '../controllers/lentesController.js';

// Configuración de multer para manejo de imágenes de lentes
const upload = multer({ dest: "uploads/" }); // Directorio temporal

const router = express.Router();

// IMPORTANTE: Rutas específicas ANTES de rutas con parámetros

// GET /api/lentes/populares - Obtener lentes más populares/vendidos
router.get("/populares", lentesController.getLentesPopulares);

// GET /api/lentes/promociones/activas - Lentes con promociones activas
// NOTA: Parece que hay un error en el controlador - revisa la implementación
router.get("/promociones/activas", lentesController.getLentesByIdMarca);

// GET /api/lentes/marca/:marcaId - Filtrar lentes por marca específica
// NOTA: Parece que hay un error en el controlador - revisa la implementación  
router.get("/marca/:marcaId", lentesController.getLentesByPromocion);

// Rutas principales con lógica condicional
router.route("/")
    .get((req, res, next) => {
        // Si viene query param popular=true, usar controlador específico
        if (req.query.popular === 'true') {
            return lentesController.getLentesPopulares(req, res, next);
        }
        // Sino, usar controlador general
        return lentesController.getLentes(req, res, next);
    })
    .post(upload.array("imagenes", 5), lentesController.createLentes); // POST - Crear con hasta 5 imágenes

// Rutas para manejo de lente específico por ID
router.route("/:id")
    .get(lentesController.getLentesById) // GET /api/lentes/:id - Obtener lente por ID
    .put(upload.array("imagenes", 5), lentesController.updateLentes) // PUT - Actualizar con imágenes
    .delete(lentesController.deleteLentes); // DELETE /api/lentes/:id - Eliminar lente

export default router;