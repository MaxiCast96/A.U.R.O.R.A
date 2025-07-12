import "../models/Empleados.js";
import "../models/Sucursales.js";
import optometristaModel from "../models/Optometrista.js";
import empleadosModel from "../models/Empleados.js";
import bcryptjs from "bcryptjs";

const optometristaController = {};

// SELECT - Obtener todos los optometristas
optometristaController.getOptometristas = async (req, res) => {
    try {
        // Busca todos los optometristas y puebla empleado y sucursales asignadas
        const optometristas = await optometristaModel.find()
            .populate('empleadoId')
            .populate('sucursalesAsignadas');
        res.json(optometristas);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo optometristas: " + error.message });
    }
};

// INSERT - Crear un nuevo optometrista
optometristaController.createOptometrista = async (req, res) => {
    // Parsear sucursalesAsignadas si viene como string (form-data)
    let sucursalesAsignadas = req.body.sucursalesAsignadas;
    if (typeof sucursalesAsignadas === "string") {
        try {
            sucursalesAsignadas = JSON.parse(sucursalesAsignadas); // Convierte string a objeto
        } catch (e) {
            return res.json({ message: "Error en el formato de sucursalesAsignadas" });
        }
    }

    // Parsear disponibilidad si viene como string (form-data)
    let disponibilidad = req.body.disponibilidad;
    if (typeof disponibilidad === "string") {
        try {
            disponibilidad = JSON.parse(disponibilidad); // Convierte string a objeto
        } catch (e) {
            return res.json({ message: "Error en el formato de disponibilidad" });
        }
    }

    const {
        empleadoId,
        especialidad,
        licencia,
        experiencia,
        disponible
    } = req.body;

    try {
        // Crear nueva instancia del optometrista
        const newOptometrista = new optometristaModel({
            empleadoId,
            especialidad,
            licencia,
            experiencia,
            disponibilidad: disponibilidad || {},
            sucursalesAsignadas: sucursalesAsignadas || [],
            disponible: disponible !== undefined ? disponible : true
        });

        await newOptometrista.save();
        res.json({ message: "Optometrista guardado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error creando optometrista: " + error.message });
    }
};

// DELETE - Eliminar un optometrista
optometristaController.deleteOptometrista = async (req, res) => {
    try {
        // Busca y elimina optometrista por ID
        const deleteOptometrista = await optometristaModel.findByIdAndDelete(req.params.id);
        if (!deleteOptometrista) {
            return res.json({ message: "Optometrista no encontrado" });
        }
        res.json({ message: "Optometrista eliminado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error eliminando optometrista: " + error.message });
    }
};

// UPDATE - Actualizar un optometrista
optometristaController.updateOptometrista = async (req, res) => {
    // Parsear sucursalesAsignadas si viene como string (form-data)
    let sucursalesAsignadas = req.body.sucursalesAsignadas;
    if (typeof sucursalesAsignadas === "string") {
        try {
            sucursalesAsignadas = JSON.parse(sucursalesAsignadas); // Convierte string a objeto
        } catch (e) {
            return res.json({ message: "Error en el formato de sucursalesAsignadas" });
        }
    }

    // Parsear disponibilidad si viene como string (form-data)
    let disponibilidad = req.body.disponibilidad;
    if (typeof disponibilidad === "string") {
        try {
            disponibilidad = JSON.parse(disponibilidad); // Convierte string a objeto
        } catch (e) {
            return res.json({ message: "Error en el formato de disponibilidad" });
        }
    }

    const {
        empleadoId,
        especialidad,
        licencia,
        experiencia,
        disponible
    } = req.body;

    try {
        // Prepara objeto con datos a actualizar
        const updateData = {
            empleadoId,
            especialidad,
            licencia,
            experiencia,
            disponibilidad: disponibilidad || {},
            sucursalesAsignadas: sucursalesAsignadas || [],
            disponible: disponible !== undefined ? disponible : true
        };

        // Busca, actualiza y retorna optometrista modificado
        const updatedOptometrista = await optometristaModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true } // Retorna documento actualizado
        );

        if (!updatedOptometrista) {
            return res.json({ message: "Optometrista no encontrado" });
        }

        res.json({ message: "Optometrista actualizado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando optometrista: " + error.message });
    }
};

// SELECT by ID - Obtener un optometrista por ID
optometristaController.getOptometristaById = async (req, res) => {
    try {
        // Busca optometrista por ID y puebla todas las referencias
        const optometrista = await optometristaModel.findById(req.params.id)
            .populate('empleadoId')
            .populate('sucursalesAsignadas');
        if (!optometrista) {
            return res.json({ message: "Optometrista no encontrado" });
        }
        res.json(optometrista);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo optometrista: " + error.message });
    }
};

// SELECT by Empleado - Obtener optometrista por ID de empleado
optometristaController.getOptometristaByEmpleado = async (req, res) => {
    try {
        // Filtra optometrista por ID de empleado específico
        const optometrista = await optometristaModel.findOne({ empleadoId: req.params.empleadoId })
            .populate('empleadoId')
            .populate('sucursalesAsignadas');
        if (!optometrista) {
            return res.json({ message: "Optometrista no encontrado para este empleado" });
        }
        res.json(optometrista);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo optometrista por empleado: " + error.message });
    }
};

// SELECT by Sucursal - Obtener optometristas por sucursal
optometristaController.getOptometristasBySucursal = async (req, res) => {
    try {
        // Filtra optometristas por sucursal asignada
        const optometristas = await optometristaModel.find({ 
            sucursalesAsignadas: req.params.sucursalId 
        })
            .populate('empleadoId')
            .populate('sucursalesAsignadas');
        res.json(optometristas);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo optometristas por sucursal: " + error.message });
    }
};

// SELECT Disponibles - Obtener optometristas disponibles
optometristaController.getOptometristasDisponibles = async (req, res) => {
    try {
        // Filtra solo optometristas marcados como disponibles
        const optometristas = await optometristaModel.find({ disponible: true })
            .populate('empleadoId')
            .populate('sucursalesAsignadas');
        res.json(optometristas);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo optometristas disponibles: " + error.message });
    }
};

// SELECT by Especialidad - Obtener optometristas por especialidad
optometristaController.getOptometristasByEspecialidad = async (req, res) => {
    try {
        // Filtra optometristas por especialidad usando regex
        const optometristas = await optometristaModel.find({ 
            especialidad: { $regex: req.params.especialidad, $options: 'i' } 
        })
            .populate('empleadoId')
            .populate('sucursalesAsignadas');
        res.json(optometristas);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo optometristas por especialidad: " + error.message });
    }
};

// UPDATE Disponibilidad - Cambiar estado de disponibilidad
optometristaController.updateDisponibilidad = async (req, res) => {
    const { disponible } = req.body;
    
    try {
        // Actualiza solo el campo disponible del optometrista
        const updatedOptometrista = await optometristaModel.findByIdAndUpdate(
            req.params.id,
            { disponible },
            { new: true } // Retorna documento actualizado
        );

        if (!updatedOptometrista) {
            return res.json({ message: "Optometrista no encontrado" });
        }

        res.json({ message: "Disponibilidad actualizada" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando disponibilidad: " + error.message });
    }
};

export default optometristaController;