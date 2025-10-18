import "../models/Empleados.js";
import "../models/Sucursales.js";
import optometristaModel from "../models/Optometrista.js";
import empleadosModel from "../models/Empleados.js";
import bcryptjs from "bcryptjs";

const optometristaController = {};

optometristaController.getOptometristas = async (req, res) => {
    try {
        const optometristas = await optometristaModel.find()
            .populate('empleadoId')
            .populate('sucursalesAsignadas');
        res.json(optometristas);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo optometristas: " + error.message });
    }
};

optometristaController.createOptometrista = async (req, res) => {
    try {
        console.log('📦 Datos recibidos en createOptometrista:', req.body);
        
        const { empleadoId, especialidad, licencia, experiencia, disponible } = req.body;
        
        // Validación más detallada
        const requiredFields = { empleadoId, especialidad, licencia, experiencia };
        const missingFields = [];
        
        Object.entries(requiredFields).forEach(([key, value]) => {
            if (!value && value !== 0) {
                missingFields.push(key);
            }
        });
        
        if (missingFields.length > 0) {
            console.log('  Campos faltantes:', missingFields);
            console.log('📝 Valores recibidos:', requiredFields);
            return res.status(400).json({ 
                message: `Faltan campos requeridos: ${missingFields.join(', ')}`,
                received: req.body,
                missing: missingFields
            });
        }

        // Verificar que el empleado existe
        const empleadoExists = await empleadosModel.findById(empleadoId);
        if (!empleadoExists) {
            console.log('  Empleado no encontrado:', empleadoId);
            return res.status(404).json({ message: "Empleado no encontrado" });
        }

        // Verificar que el empleado no sea ya optometrista
        const optometristaExists = await optometristaModel.findOne({ empleadoId });
        if (optometristaExists) {
            console.log('  Empleado ya es optometrista:', empleadoId);
            return res.status(409).json({ message: "Este empleado ya es un optometrista" });
        }

        // Procesar sucursalesAsignadas
        let sucursalesAsignadas = req.body.sucursalesAsignadas;
        if (typeof sucursalesAsignadas === "string") {
            try {
                sucursalesAsignadas = JSON.parse(sucursalesAsignadas);
            } catch (e) {
                sucursalesAsignadas = sucursalesAsignadas.split(',').map(s => s.trim());
            }
        }
        if (!Array.isArray(sucursalesAsignadas)) {
            sucursalesAsignadas = sucursalesAsignadas ? [sucursalesAsignadas] : [];
        }

        // Procesar disponibilidad
        let disponibilidad = req.body.disponibilidad;
        if (typeof disponibilidad === "string") {
            try {
                disponibilidad = JSON.parse(disponibilidad);
            } catch (e) {
                console.log('⚠️ Error parseando disponibilidad:', e.message);
                disponibilidad = [];
            }
        }
        if (!Array.isArray(disponibilidad)) {
            disponibilidad = [];
        }

        console.log('✅ Datos procesados:', {
            empleadoId,
            especialidad,
            licencia,
            experiencia: Number(experiencia),
            disponibilidad,
            sucursalesAsignadas,
            disponible: disponible !== undefined ? Boolean(disponible) : true
        });

        const newOptometrista = new optometristaModel({
            empleadoId,
            especialidad,
            licencia,
            experiencia: Number(experiencia),
            disponibilidad,
            sucursalesAsignadas,
            disponible: disponible !== undefined ? Boolean(disponible) : true
        });

        const savedOptometrista = await newOptometrista.save();
        console.log('✅ Optometrista guardado:', savedOptometrista._id);
        
        const populatedOptometrista = await optometristaModel.findById(savedOptometrista._id)
            .populate('empleadoId')
            .populate('sucursalesAsignadas');

        res.status(201).json({ 
            message: "Optometrista creado exitosamente", 
            optometrista: populatedOptometrista 
        });
    } catch (error) {
        console.error('  Error en createOptometrista:', error);
        res.status(500).json({ 
            message: "Error interno del servidor: " + error.message,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

optometristaController.deleteOptometrista = async (req, res) => {
    try {
        const deleteOptometrista = await optometristaModel.findByIdAndDelete(req.params.id);
        if (!deleteOptometrista) return res.status(404).json({ message: "Optometrista no encontrado" });
        res.json({ message: "Optometrista eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error eliminando optometrista: " + error.message });
    }
};

optometristaController.updateOptometrista = async (req, res) => {
    try {
        console.log('📦 Actualizando optometrista:', req.params.id);
        console.log('📦 Datos recibidos:', req.body);

        // Procesar sucursalesAsignadas
        let sucursalesAsignadas = req.body.sucursalesAsignadas;
        if (typeof sucursalesAsignadas === "string") {
            try {
                sucursalesAsignadas = JSON.parse(sucursalesAsignadas);
            } catch (e) {
                sucursalesAsignadas = sucursalesAsignadas.split(',').map(s => s.trim());
            }
        }

        // Procesar disponibilidad
        let disponibilidad = req.body.disponibilidad;
        if (typeof disponibilidad === "string") {
            try {
                disponibilidad = JSON.parse(disponibilidad);
            } catch (e) {
                console.log('⚠️ Error parseando disponibilidad en update:', e.message);
            }
        }

        const { especialidad, licencia, experiencia, disponible } = req.body;

        const updateData = {
            especialidad,
            licencia,
            experiencia: experiencia ? Number(experiencia) : undefined,
            disponibilidad: Array.isArray(disponibilidad) ? disponibilidad : [],
            sucursalesAsignadas: Array.isArray(sucursalesAsignadas) ? sucursalesAsignadas : [],
            disponible: disponible !== undefined ? Boolean(disponible) : true
        };

        // Remover campos undefined
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        console.log('📝 Datos para actualizar:', updateData);

        const updatedOptometrista = await optometristaModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('empleadoId').populate('sucursalesAsignadas');

        if (!updatedOptometrista) {
            return res.status(404).json({ message: "Optometrista no encontrado" });
        }

        res.json({ 
            message: "Optometrista actualizado", 
            optometrista: updatedOptometrista 
        });
    } catch (error) {
        console.error('  Error actualizando optometrista:', error);
        res.status(500).json({ message: "Error actualizando optometrista: " + error.message });
    }
};

optometristaController.getOptometristaById = async (req, res) => {
    try {
        const optometrista = await optometristaModel.findById(req.params.id)
            .populate('empleadoId')
            .populate('sucursalesAsignadas');
        if (!optometrista) return res.status(404).json({ message: "Optometrista no encontrado" });
        res.json(optometrista);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo optometrista: " + error.message });
    }
};

optometristaController.getOptometristaByEmpleado = async (req, res) => {
    try {
        const optometrista = await optometristaModel.findOne({ empleadoId: req.params.empleadoId })
            .populate('empleadoId')
            .populate('sucursalesAsignadas');
        if (!optometrista) {
            return res.status(404).json({ message: "Optometrista no encontrado para este empleado" });
        }
        res.json(optometrista);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo optometrista por empleado: " + error.message });
    }
};

optometristaController.getOptometristasBySucursal = async (req, res) => {
    try {
        const optometristas = await optometristaModel.find({ sucursalesAsignadas: req.params.sucursalId })
            .populate('empleadoId')
            .populate('sucursalesAsignadas');
        res.json(optometristas);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo optometristas por sucursal: " + error.message });
    }
};

optometristaController.getOptometristasDisponibles = async (req, res) => {
    try {
        const optometristas = await optometristaModel.find({ disponible: true })
            .populate('empleadoId')
            .populate('sucursalesAsignadas');
        res.json(optometristas);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo optometristas disponibles: " + error.message });
    }
};

optometristaController.getOptometristasByEspecialidad = async (req, res) => {
    try {
        const optometristas = await optometristaModel.find({ 
            especialidad: { $regex: req.params.especialidad, $options: 'i' } 
        })
            .populate('empleadoId')
            .populate('sucursalesAsignadas');
        res.json(optometristas);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo optometristas por especialidad: " + error.message });
    }
};

optometristaController.updateDisponibilidad = async (req, res) => {
    try {
        const { disponible } = req.body;
        const updatedOptometrista = await optometristaModel.findByIdAndUpdate(
            req.params.id,
            { disponible: Boolean(disponible) },
            { new: true }
        );
        if (!updatedOptometrista) {
            return res.status(404).json({ message: "Optometrista no encontrado" });
        }
        res.json({ 
            message: "Disponibilidad actualizada",
            optometrista: updatedOptometrista
        });
    } catch (error) {
        res.status(500).json({ message: "Error actualizando disponibilidad: " + error.message });
    }
};

// IMPORTANTE: Asegúrate de importar los modelos correctos al inicio del archivo:
// import optometristaModel from '../models/optometristaModel.js';
// import empleadosModel from '../models/empleadosModel.js';

export default optometristaController;