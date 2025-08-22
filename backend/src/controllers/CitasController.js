import Citas from "../models/Citas.js";
import "../models/Optometrista.js";
import "../models/Sucursales.js";
import "../models/Clientes.js";

const citasController = {};

// SELECT - Obtiene todas las citas con relaciones pobladas
citasController.getCitas = async (req, res) => {
    try {
        // Busca todas las citas y puebla cliente, optometrista y sucursal
        const citas = await Citas.find()
            .populate("clienteId") // Datos completos del cliente
            .populate({
                path: "optometristaId",
                populate: { path: "empleadoId" }
            }) // Datos del optometrista + empleado
            .populate("sucursalId"); // Datos de la sucursal

        res.status(200).json(citas);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo citas: " + error.message });
    }
};

// SELECT by ID - Obtiene una cita específica por ID
citasController.getCitaById = async (req, res) => {
    try {
        // Busca cita por ID y puebla todas las referencias
        const cita = await Citas.findById(req.params.id)
            .populate("clienteId")
            .populate({
                path: "optometristaId",
                populate: { path: "empleadoId" }
            })
            .populate("sucursalId");

        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }
        res.status(200).json(cita);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo cita: " + error.message });
    }
};

// INSERT - Crea nueva cita con validación de campos obligatorios
citasController.createCita = async (req, res) => {
    const {
        clienteId, optometristaId, sucursalId, fecha, hora, estado,
        motivoCita, tipoLente, graduacion, notasAdicionales
    } = req.body;

    // Validación de campos requeridos para crear cita
    if (!clienteId || !optometristaId || !sucursalId || !fecha || !hora || !estado || !motivoCita) {

        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    try {
        console.log('Datos recibidos para nueva cita:', req.body); // Log para debugging
                // Crea nueva instancia de cita con todos los datos
        const nuevaCita = new Citas({
            clienteId,
            optometristaId,
            sucursalId,
            fecha,
            hora,
            estado,
            motivoCita,
            tipoLente,
            graduacion,
            notasAdicionales
        });

        await nuevaCita.save(); // Guarda en base de datos
        console.log('Cita guardada:', nuevaCita);
        res.status(201).json({ message: "Cita guardada" });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error creando cita: " + error.message }); // Log de confirmación
    }
};

// UPDATE - Actualiza cita existente con validación
citasController.updateCita = async (req, res) => {
    const {
        clienteId, optometristaId, sucursalId, fecha, hora, estado,
        motivoCita, tipoLente, graduacion, notasAdicionales
    } = req.body;

    // Validación de campos obligatorios para actualización
    if (!clienteId || !optometristaId || !sucursalId || !fecha || !hora || !estado || !motivoCita) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    try {
        // Busca, actualiza y retorna cita modificada
        const updatedCita = await Citas.findByIdAndUpdate(
            req.params.id,
            {
                clienteId,
                optometristaId,
                sucursalId,
                fecha,
                hora,
                estado,
                motivoCita,
                tipoLente,
                graduacion,
                notasAdicionales
            },
            { new: true } // Retorna documento actualizado
        );
        if (!updatedCita) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }
        res.status(200).json({ message: "Cita actualizada" });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error actualizando cita: " + error.message });
    }
};

// DELETE - Eliminar cita
citasController.deleteCita = async (req, res) => {
    try {
        // Busca y elimina cita por ID
        const deletedCita = await Citas.findByIdAndDelete(req.params.id);
        if (!deletedCita) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }
        res.status(200).json({ message: "Cita eliminada" });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error eliminando cita: " + error.message });
    }
};

export default citasController;