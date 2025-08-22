import "../models/Clientes.js";
import historialMedicoModel from "../models/HistorialMedico.js";
import clientesModel from "../models/Clientes.js";

const historialMedicoController = {};

// SELECT - Obtener todos los historiales médicos
historialMedicoController.getHistorialesMedicos = async (req, res) => {
    try {
        // Busca todos los historiales médicos y puebla datos del cliente
        const historiales = await historialMedicoModel.find()
            .populate('clienteId');
        res.status(200).json(historiales);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo historiales médicos: " + error.message });
    }
};

// INSERT - Crear un nuevo historial médico
historialMedicoController.createHistorialMedico = async (req, res) => {
    // Parsear padecimientos si viene como string (form-data)
    let padecimientos = req.body.padecimientos;
    if (typeof padecimientos === "string") {
        try {
            padecimientos = JSON.parse(padecimientos); // Convierte string a objeto
        } catch (e) {
            return res.status(400).json({ message: "Error en el formato de padecimientos" });
        }
    }

    // Parsear historialVisual si viene como string (form-data)
    let historialVisual = req.body.historialVisual;
    if (typeof historialVisual === "string") {
        try {
            historialVisual = JSON.parse(historialVisual); // Convierte string a objeto
        } catch (e) {
            return res.status(400).json({ message: "Error en el formato de historialVisual" });
        }
    }

    const { clienteId } = req.body;

    // Validación básica de campo obligatorio
    if (!clienteId) {
        return res.status(400).json({ message: "El campo clienteId es obligatorio" });
    }

    try {
        // Verificar que el cliente existe antes de crear historial
        const cliente = await clientesModel.findById(clienteId);
        if (!cliente) {
            return res.status(400).json({ message: "El cliente seleccionado no existe." });
        }

        // Crear nueva instancia del historial médico
        const newHistorialMedico = new historialMedicoModel({
            clienteId,
            padecimientos: padecimientos || {},
            historialVisual: historialVisual || {}
        });

        await newHistorialMedico.save();
        res.status(201).json({ message: "Historial médico guardado" });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error creando historial médico: " + error.message });
    }
};

// DELETE - Eliminar un historial médico
historialMedicoController.deleteHistorialMedico = async (req, res) => {
    try {
        // Busca y elimina historial médico por ID
        const deleteHistorial = await historialMedicoModel.findByIdAndDelete(req.params.id);
        if (!deleteHistorial) {
            return res.status(404).json({ message: "Historial médico no encontrado" });
        }
        res.status(200).json({ message: "Historial médico eliminado" });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error eliminando historial médico: " + error.message });
    }
};

// UPDATE - Actualizar un historial médico
historialMedicoController.updateHistorialMedico = async (req, res) => {
    // Parsear padecimientos si viene como string (form-data)
    let padecimientos = req.body.padecimientos;
    if (typeof padecimientos === "string") {
        try {
            padecimientos = JSON.parse(padecimientos); // Convierte string a objeto
        } catch (e) {
            return res.status(400).json({ message: "Error en el formato de padecimientos" });
        }
    }

    // Parsear historialVisual si viene como string (form-data)
    let historialVisual = req.body.historialVisual;
    if (typeof historialVisual === "string") {
        try {
            historialVisual = JSON.parse(historialVisual); // Convierte string a objeto
        } catch (e) {
            return res.status(400).json({ message: "Error en el formato de historialVisual" });
        }
    }

    const { clienteId } = req.body;

    // Validación básica de campo obligatorio
    if (!clienteId) {
        return res.status(400).json({ message: "El campo clienteId es obligatorio" });
    }

    try {
        // Prepara objeto con datos a actualizar
        const updateData = {
            clienteId,
            padecimientos: padecimientos || {},
            historialVisual: historialVisual || {}
        };

        // Busca, actualiza y retorna historial modificado
        const updatedHistorial = await historialMedicoModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true } // Retorna documento actualizado
        );

        if (!updatedHistorial) {
            return res.status(404).json({ message: "Historial médico no encontrado" });
        }

        res.status(200).json({ message: "Historial médico actualizado" });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error actualizando historial médico: " + error.message });
    }
};

// SELECT by ID - Obtener un historial médico por ID
historialMedicoController.getHistorialMedicoById = async (req, res) => {
    try {
        // Busca historial médico por ID y puebla datos del cliente
        const historial = await historialMedicoModel.findById(req.params.id)
            .populate('clienteId');
        if (!historial) {
            return res.json({ message: "Historial médico no encontrado" });
        }
        res.json(historial);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo historial médico: " + error.message });
    }
};

// SELECT by Cliente - Obtener historial médico por ID de cliente
historialMedicoController.getHistorialMedicoByCliente = async (req, res) => {
    try {
        // Filtra historial médico por ID de cliente específico
        const historial = await historialMedicoModel.findOne({ clienteId: req.params.clienteId })
            .populate('clienteId');
        if (!historial) {
            return res.json({ message: "Historial médico no encontrado para este cliente" });
        }
        res.json(historial);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo historial médico por cliente: " + error.message });
    }
};

// SELECT by Tipo de Padecimiento - Obtener historiales por tipo de padecimiento
historialMedicoController.getHistorialesByTipoPadecimiento = async (req, res) => {
    try {
        // Filtra historiales por tipo de padecimiento usando regex
        const historiales = await historialMedicoModel.find({ 
            "padecimientos.tipo": { $regex: req.params.tipo, $options: 'i' } 
        })
            .populate('clienteId');
        res.json(historiales);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo historiales por tipo de padecimiento: " + error.message });
    }
};

// SELECT by Fecha de Diagnóstico - Obtener historiales por rango de fechas
historialMedicoController.getHistorialesByFechaDiagnostico = async (req, res) => {
    const { fechaInicio, fechaFin } = req.query;
    
    try {
        // Construir query dinámico para filtro por fechas
        const query = {};
        if (fechaInicio || fechaFin) {
            query["historialVisual.fecha"] = {};
            if (fechaInicio) query["historialVisual.fecha"].$gte = new Date(fechaInicio);
            if (fechaFin) query["historialVisual.fecha"].$lte = new Date(fechaFin);
        }

        // Busca historiales dentro del rango de fechas
        const historiales = await historialMedicoModel.find(query)
            .populate('clienteId');
        res.json(historiales);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo historiales por fecha: " + error.message });
    }
};

// SELECT by Diagnóstico - Obtener historiales por diagnóstico
historialMedicoController.getHistorialesByDiagnostico = async (req, res) => {
    try {
        // Filtra historiales por diagnóstico usando regex
        const historiales = await historialMedicoModel.find({ 
            "historialVisual.diagnostico": { $regex: req.params.diagnostico, $options: 'i' } 
        })
            .populate('clienteId');
        res.json(historiales);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo historiales por diagnóstico: " + error.message });
    }
};

// UPDATE Padecimientos - Actualizar solo padecimientos
historialMedicoController.updatePadecimientos = async (req, res) => {
    // Parsear padecimientos si viene como string (form-data)
    let padecimientos = req.body.padecimientos;
    if (typeof padecimientos === "string") {
        try {
            padecimientos = JSON.parse(padecimientos); // Convierte string a objeto
        } catch (e) {
            return res.json({ message: "Error en el formato de padecimientos" });
        }
    }
    
    try {
        // Actualiza solo el campo padecimientos del historial
        const updatedHistorial = await historialMedicoModel.findByIdAndUpdate(
            req.params.id,
            { padecimientos },
            { new: true } // Retorna documento actualizado
        );

        if (!updatedHistorial) {
            return res.json({ message: "Historial médico no encontrado" });
        }

        res.json({ message: "Padecimientos actualizados" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando padecimientos: " + error.message });
    }
};

// UPDATE Historial Visual - Actualizar solo historial visual
historialMedicoController.updateHistorialVisual = async (req, res) => {
    // Parsear historialVisual si viene como string (form-data)
    let historialVisual = req.body.historialVisual;
    if (typeof historialVisual === "string") {
        try {
            historialVisual = JSON.parse(historialVisual); // Convierte string a objeto
        } catch (e) {
            return res.json({ message: "Error en el formato de historialVisual" });
        }
    }
    
    try {
        // Actualiza solo el campo historialVisual del historial
        const updatedHistorial = await historialMedicoModel.findByIdAndUpdate(
            req.params.id,
            { historialVisual },
            { new: true } // Retorna documento actualizado
        );

        if (!updatedHistorial) {
            return res.json({ message: "Historial médico no encontrado" });
        }

        res.json({ message: "Historial visual actualizado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando historial visual: " + error.message });
    }
};

export default historialMedicoController;