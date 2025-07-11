import recetasModel from "../models/Recetas.js";

const recetasController = {};

// SELECT - Obtener todas las recetas
recetasController.getRecetas = async (req, res) => {
    try {
        const recetas = await recetasModel.find()
            .populate({
                path: 'historialMedicoId',
                populate: {
                    path: 'clienteId',
                    select: 'nombre apellido',
                    model: 'Clientes'
                }
            })
            .populate({
                path: 'optometristaId',
                populate: {
                    path: 'empleadoId',
                    select: 'nombre apellido'
                }
            });
        const recetasConCliente = recetas.map(r => {
            let cliente = r.historialMedicoId?.clienteId;
            if (!cliente) {
                cliente = { nombre: 'Cliente no encontrado', apellido: '' };
                if (r.historialMedicoId) r.historialMedicoId.clienteId = cliente;
            }
            return r;
        });
        res.status(200).json(recetasConCliente);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo recetas: " + error.message });
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

    // Validación básica
    if (!historialMedicoId || !optometristaId || !diagnostico || !ojoDerecho || !ojoIzquierdo) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    try {
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

        await newReceta.save();

        res.status(201).json({ 
            message: "Receta creada exitosamente",
            receta: newReceta
        });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error creando receta: " + error.message });
    }
};

// DELETE - Eliminar receta
recetasController.deleteReceta = async (req, res) => {
    try {
        const deletedReceta = await recetasModel.findByIdAndDelete(req.params.id);
        if (!deletedReceta) {
            return res.status(404).json({ message: "Receta no encontrada" });
        }
        res.status(200).json({ message: "Receta eliminada exitosamente" });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error eliminando receta: " + error.message });
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

    // Validación básica
    if (!historialMedicoId || !optometristaId || !diagnostico || !ojoDerecho || !ojoIzquierdo) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

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

        const updatedReceta = await recetasModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedReceta) {
            return res.status(404).json({ message: "Receta no encontrada" });
        }

        res.status(200).json({ 
            message: "Receta actualizada exitosamente",
            receta: updatedReceta
        });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error actualizando receta: " + error.message });
    }
};

// GET by ID - Obtener receta por ID
recetasController.getRecetaById = async (req, res) => {
    try {
        const receta = await recetasModel.findById(req.params.id)
            .populate({
                path: 'historialMedicoId',
                populate: {
                    path: 'clienteId',
                    select: 'nombre apellido'
                }
            })
            .populate({
                path: 'optometristaId',
                populate: {
                    path: 'empleadoId',
                    select: 'nombre apellido'
                }
            });

        if (!receta) {
            return res.status(404).json({ message: "Receta no encontrada" });
        }

        res.status(200).json(receta);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo receta: " + error.message });
    }
};

// GET by Historial Médico ID - Obtener recetas por historial médico
recetasController.getRecetasByHistorialMedico = async (req, res) => {
    try {
        const recetas = await recetasModel.find({ historialMedicoId: req.params.historialId })
            .populate({
                path: 'optometristaId',
                populate: {
                    path: 'empleadoId',
                    select: 'nombre apellido'
                }
            })
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
            .populate({
                path: 'historialMedicoId',
                populate: {
                    path: 'clienteId',
                    select: 'nombre apellido'
                }
            })
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
            .populate({
                path: 'historialMedicoId',
                populate: {
                    path: 'clienteId',
                    select: 'nombre apellido'
                }
            })
            .populate({
                path: 'optometristaId',
                populate: {
                    path: 'empleadoId',
                    select: 'nombre apellido'
                }
            });

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