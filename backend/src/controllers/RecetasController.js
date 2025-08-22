import recetasModel from "../models/Recetas.js";

const recetasController = {};

// SELECT - Obtener todas las recetas
recetasController.getRecetas = async (req, res) => {
    try {
        // Busca todas las recetas y puebla historial médico, cliente y optometrista
        const recetas = await recetasModel.find()
            .populate({
                path: 'historialMedicoId',
                populate: {
                    path: 'clienteId',
                    select: 'nombre apellido', // Solo campos específicos del cliente
                    model: 'Clientes'
                }
            })
            .populate({
                path: 'optometristaId',
                populate: {
                    path: 'empleadoId',
                    select: 'nombre apellido' // Solo campos específicos del empleado
                }
            });
            
        // Maneja casos donde el cliente podría no existir
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

    // Validación de campos obligatorios
    if (!historialMedicoId || !optometristaId || !diagnostico || !ojoDerecho || !ojoIzquierdo) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    try {
        // Crear nueva instancia de receta
        const newReceta = new recetasModel({
            historialMedicoId,
            optometristaId,
            fecha: fecha || new Date(), // Usa fecha actual si no se proporciona
            diagnostico,
            ojoDerecho,
            ojoIzquierdo,
            observaciones,
            vigencia: vigencia || 12, // Vigencia por defecto de 12 meses
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
        // Busca y elimina receta por ID
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
    console.log('[Recetas] updateReceta called with id:', req.params.id);

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

    // Validación de campos obligatorios
    if (!historialMedicoId || !optometristaId || !diagnostico || !ojoDerecho || !ojoIzquierdo) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    try {
        // Prepara objeto con datos a actualizar
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

        // Busca, actualiza y retorna receta modificada
        const updatedReceta = await recetasModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true } // Retorna documento actualizado
        );

        if (!updatedReceta) {
            console.log('[Recetas] updateReceta not found id:', req.params.id);
            return res.status(404).json({ message: "Receta no encontrada" });
        }

        console.log('[Recetas] updateReceta success id:', req.params.id);
        res.status(200).json({ 
            message: "Receta actualizada exitosamente",
            receta: updatedReceta
        });
    } catch (error) {
        console.log("[Recetas] updateReceta error:", error?.message || error);
        res.status(500).json({ message: "Error actualizando receta: " + error.message });
    }
};

// GET by ID - Obtener receta por ID
recetasController.getRecetaById = async (req, res) => {
    try {
        // Busca receta por ID y puebla todas las referencias
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
        // Filtra recetas por ID de historial médico específico
        const recetas = await recetasModel.find({ historialMedicoId: req.params.historialId })
            .populate({
                path: 'optometristaId',
                populate: {
                    path: 'empleadoId',
                    select: 'nombre apellido'
                }
            })
            .sort({ fecha: -1 }); // Ordena por fecha descendente

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
        // Filtra recetas por ID de optometrista específico
        const recetas = await recetasModel.find({ optometristaId: req.params.optometristaId })
            .populate({
                path: 'historialMedicoId',
                populate: {
                    path: 'clienteId',
                    select: 'nombre apellido'
                }
            })
            .sort({ fecha: -1 }); // Ordena por fecha descendente

        if (recetas.length === 0) {
            return res.json({ message: "No se encontraron recetas para este optometrista" });
        }

        res.json(recetas);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo recetas por optometrista: " + error.message });
    }
};

// GET recetas vigentes - Filtra recetas que aún están dentro de su vigencia
recetasController.getRecetasVigentes = async (req, res) => {
    try {
        const fechaActual = new Date();
        
        // Busca todas las recetas con poblaciones
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

        // Filtra recetas que están dentro de su vigencia
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