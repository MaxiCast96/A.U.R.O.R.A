import mongoose from "mongoose";
import Citas from "../models/Citas.js";
import Optometrista from "../models/Optometrista.js";
import "../models/Sucursales.js";
import "../models/Clientes.js";

const citasController = {};

// Utilidad: obtener nombre de día en español a partir de Date
const getDiaSemanaES = (date) => {
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return dias[new Date(date).getDay()];
};

// Utilidad: verifica si una hora HH:MM está dentro del rango [inicio, fin)
const horaEnRango = (hora, inicio, fin) => {
    if (!hora || !inicio || !fin) return false;
    const pad = (s) => (s.length === 5 ? s : s.padStart(5, '0'));
    const h = pad(hora);
    const i = pad(inicio);
    const f = pad(fin);
    return h >= i && h < f;
};

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
        res.status(500).json({ message: "Error obteniendo cita: " + error.message });
    }
};

// INSERT - Crea nueva cita con validación de campos obligatorios
citasController.createCita = async (req, res) => {
    const {
        clienteId, optometristaId, sucursalId, fecha, hora, estado,
        motivoCita, tipoLente, notasAdicionales
    } = req.body;

    // Validación de campos requeridos para crear cita (clienteId y optometristaId son opcionales)
    if (!sucursalId || !fecha || !hora || !estado || !motivoCita) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    let session;
    try {
        console.log('Datos recibidos para nueva cita:', req.body);
        session = await mongoose.startSession();
        await session.withTransaction(async () => {
            let assignedOptometristaId = optometristaId || undefined;
            const dayStart = new Date(new Date(fecha).setHours(0,0,0,0));

            // Autoasignación dentro de la transacción
            if (!assignedOptometristaId) {
                const diaSemana = getDiaSemanaES(fecha);

                const candidatos = await Optometrista.find({
                    disponible: true,
                    sucursalesAsignadas: { $in: [sucursalId] },
                    disponibilidad: { $elemMatch: { dia: diaSemana } }
                }).session(session);

                const candidatosPorHora = candidatos.filter(opt =>
                    (opt.disponibilidad || []).some(d => d.dia === diaSemana && horaEnRango(hora, d.horaInicio, d.horaFin))
                );

                const ocupaciones = await Citas.find({
                    optometristaId: { $in: candidatosPorHora.map(o => o._id) },
                    sucursalId,
                    fecha: dayStart,
                    hora: hora,
                    estado: { $ne: 'cancelada' }
                }).select('optometristaId').session(session);

                const ocupados = new Set(ocupaciones.map(c => String(c.optometristaId)));
                const libres = candidatosPorHora.filter(o => !ocupados.has(String(o._id)));

                if (libres.length === 0) {
                    throw new Error('NO_AVAILABLE_OPTOMETRIST');
                }

                const libreIds = libres.map(o => o._id);
                const conteos = await Citas.aggregate([
                    { $match: { optometristaId: { $in: libreIds }, sucursalId: new mongoose.Types.ObjectId(String(sucursalId)), fecha: dayStart, estado: { $ne: 'cancelada' } } },
                    { $group: { _id: '$optometristaId', total: { $sum: 1 } } }
                ]).session(session);

                const countMap = new Map(conteos.map(c => [String(c._id), c.total]));
                let best = libres[0];
                let bestCount = countMap.get(String(best._id)) || 0;
                for (const o of libres.slice(1)) {
                    const c = countMap.get(String(o._id)) || 0;
                    if (c < bestCount) { best = o; bestCount = c; }
                }
                assignedOptometristaId = best._id;
            }

            // Re-chequeo final de ocupación para evitar carreras
            const choque = await Citas.findOne({
                optometristaId: assignedOptometristaId,
                sucursalId,
                fecha: dayStart,
                hora: hora,
                estado: { $ne: 'cancelada' }
            }).session(session);
            if (choque) {
                throw new Error('JUST_BOOKED');
            }

            const nuevaCita = new Citas({
                clienteId: clienteId || undefined,
                optometristaId: assignedOptometristaId,
                sucursalId,
                fecha,
                hora,
                estado,
                motivoCita,
                tipoLente,
                notasAdicionales
            });

            await nuevaCita.save({ session });
            console.log('Cita guardada:', nuevaCita);
            res.status(201).json({ message: "Cita guardada" });
        });
    } catch (error) {
        if (error && (error.message === 'NO_AVAILABLE_OPTOMETRIST' || error.message === 'JUST_BOOKED')) {
            return res.status(409).json({ message: "No hay optometristas disponibles para esa fecha y hora en la sucursal seleccionada" });
        }
        console.log("Error: " + error);
        res.status(500).json({ message: "Error creando cita: " + error.message });
    } finally {
        if (session) session.endSession();
    }
};

// UPDATE - Actualiza cita existente con validación
citasController.updateCita = async (req, res) => {
    const {
        clienteId, optometristaId, sucursalId, fecha, hora, estado,
        motivoCita, tipoLente, notasAdicionales
    } = req.body;

    // Validación de campos obligatorios para actualización (clienteId y optometristaId son opcionales)
    if (!sucursalId || !fecha || !hora || !estado || !motivoCita) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    try {
        // Busca, actualiza y retorna cita modificada
        const updatedCita = await Citas.findByIdAndUpdate(
            req.params.id,
            {
                clienteId: clienteId || undefined,
                optometristaId: optometristaId || undefined,
                sucursalId,
                fecha,
                hora,
                estado,
                motivoCita,
                tipoLente,
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