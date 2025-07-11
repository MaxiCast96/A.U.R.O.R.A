import Citas from "../models/Citas.js";
import "../models/Optometrista.js";
import "../models/Sucursales.js";
import "../models/Clientes.js";

const citasController = {};

// SELECT - Obtener todas las citas
citasController.getCitas = async (req, res) => {
    try {
        const citas = await Citas.find()
            .populate("clienteId")
            .populate("optometristaId")
            .populate("sucursalId");
        res.status(200).json(citas);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo citas: " + error.message });
    }
};

// SELECT by ID
citasController.getCitaById = async (req, res) => {
    try {
        const cita = await Citas.findById(req.params.id)
            .populate("clienteId")
            .populate("optometristaId")
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

// INSERT - Crear nueva cita
citasController.createCita = async (req, res) => {
    const {
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
    } = req.body;

    // Validación básica
    if (!clienteId || !optometristaId || !sucursalId || !fecha || !hora || !estado || !motivoCita) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    try {
        console.log('Datos recibidos para nueva cita:', req.body);
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

        await nuevaCita.save();
        console.log('Cita guardada:', nuevaCita);
        res.status(201).json({ message: "Cita guardada" });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error creando cita: " + error.message });
    }
};

// UPDATE - Actualizar cita
citasController.updateCita = async (req, res) => {
    const {
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
    } = req.body;

    // Validación básica
    if (!clienteId || !optometristaId || !sucursalId || !fecha || !hora || !estado || !motivoCita) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    try {
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
            { new: true }
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