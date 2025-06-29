import recetasModel from "../models/Recetas.js";

const recetasController = {};

// SELECT - Obtener todas las recetas
recetasController.getRecetas = async (req, res) => {
    try {
        const recetas = await recetasModel.find()
            .populate('historialMedicoId', 'clienteId')
            .populate('optometristaId', 'empleadoId especialidad');
        res.json(recetas);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo recetas: " + error.message });
    }
};

// INSERT - Crear nueva receta
recetasController.createReceta = async (req, res) => {
    const {
        historialMedicoId,
        optometristaId,
        fecha,
        diagnostico,
        ojoDerecho,
        ojoIzquierdo,
        observaciones,
        vigencia,
        urlReceta
    } = req.body;

    try {
        // Crear nueva instancia de receta
        const newReceta = new recetasModel({
            historialMedicoId,
            optometristaId,
            fecha: fecha || new Date(),
            diagnostico,
            ojoDerecho,
            ojoIzquierdo,
            observaciones,
            vigencia: vigencia || 12,
            urlReceta
        });

        // Guardar la receta en la base de datos
        await newReceta.save();

        res.json({ 
            message: "Receta creada exitosamente",
            receta: newReceta
        });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error creando receta: " + error.message });
    }
};

// DELETE - Eliminar receta
recetasController.deleteReceta = async (req, res) => {
    try {
        // Buscar y eliminar la receta por ID
        const deletedReceta = await recetasModel.findByIdAndDelete(req.params.id);

        // Verificar si la receta existía
        if (!deletedReceta) {
            return res.json({ message: "Receta no encontrada" });
        }

        res.json({ message: "Receta eliminada exitosamente" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error eliminando receta: " + error.message });
    }
};

// UPDATE - Actualizar receta
recetasController.updateReceta = async (req, res) => {
    const {
        historialMedicoId,
        optometristaId,
        fecha,
        diagnostico,
        ojoDerecho,
        ojoIzquierdo,
        observaciones,
        vigencia,
        urlReceta
    } = req.body;

    try {
        const updateData = {
            historialMedicoId,
            optometristaId,
            fecha,
            diagnostico,
            ojoDerecho,
            ojoIzquierdo,
            observaciones,
            vigencia,
            urlReceta
        };

        // Buscar y actualizar la receta por ID
        const updatedReceta = await recetasModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        // Verificar si la receta existía
        if (!updatedReceta) {
            return res.json({ message: "Receta no encontrada" });
        }

        res.json({ 
            message: "Receta actualizada exitosamente",
            receta: updatedReceta
        });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando receta: " + error.message });
    }
};

// GET by ID - Obtener receta por ID
recetasController.getRecetaById = async (req, res) => {
    try {
        // Buscar receta por ID y popular las referencias
        const receta = await recetasModel.findById(req.params.id)
            .populate('historialMedicoId', 'clienteId padecimientos historialVisual')
            .populate('optometristaId', 'empleadoId especialidad licencia');

        // Verificar si la receta existe
        if (!receta) {
            return res.json({ message: "Receta no encontrada" });
        }

        res.json(receta);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo receta: " + error.message });
    }
};

// GET by Historial Médico ID - Obtener recetas por historial médico
recetasController.getRecetasByHistorialMedico = async (req, res) => {
    try {
        const recetas = await recetasModel.find({ historialMedicoId: req.params.historialId })
            .populate('optometristaId', 'empleadoId especialidad')
            .sort({ fecha: -1 }); // Ordenar por fecha descendente

        if (recetas.length === 0) {
            return res.json({ message: "No se encontraron recetas para este historial médico" });
        }

        res.json(recetas);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo recetas por historial médico: " + error.message });
    }
};

// GET by Optometrista ID - Obtener recetas por optometrista
recetasController.getRecetasByOptometrista = async (req, res) => {
    try {
        const recetas = await recetasModel.find({ optometristaId: req.params.optometristaId })
            .populate('historialMedicoId', 'clienteId')
            .sort({ fecha: -1 }); // Ordenar por fecha descendente

        if (recetas.length === 0) {
            return res.json({ message: "No se encontraron recetas para este optometrista" });
        }

        res.json(recetas);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo recetas por optometrista: " + error.message });
    }
};

// GET recetas vigentes
recetasController.getRecetasVigentes = async (req, res) => {
    try {
        const fechaActual = new Date();
        
        const recetas = await recetasModel.find()
            .populate('historialMedicoId', 'clienteId')
            .populate('optometristaId', 'empleadoId especialidad');

        // Filtrar recetas vigentes
        const recetasVigentes = recetas.filter(receta => {
            const fechaReceta = new Date(receta.fecha);
            const mesesDiferencia = (fechaActual - fechaReceta) / (1000 * 60 * 60 * 24 * 30);
            return mesesDiferencia <= receta.vigencia;
        });

        res.json(recetasVigentes);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo recetas vigentes: " + error.message });
    }
};

export default recetasController;