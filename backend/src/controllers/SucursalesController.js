import sucursalModel from "../models/Sucursales.js";

const sucursalesController = {};

// SELECT - Obtiene todas las sucursales
sucursalesController.getSucursales = async (req, res) => {
    try {
        // Busca y retorna todas las sucursales
        const sucursales = await sucursalModel.find();
        res.json(sucursales);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo sucursales: " + error.message });
    }
};

// INSERT - Crear nueva sucursal con validaciones
sucursalesController.createSucursales = async (req, res) => {
    const {
        nombre,
        direccion,
        telefono,
        correo,
        horariosAtencion,
        activo
    } = req.body;

    try {
        // Verificar si ya existe una sucursal con el mismo nombre
        const existsSucursal = await sucursalModel.findOne({ nombre });
        if (existsSucursal) {
            return res.json({ message: "Ya existe una sucursal con este nombre" });
        }

        // Verificar si ya existe una sucursal con el mismo correo
        const existsCorreo = await sucursalModel.findOne({ correo });
        if (existsCorreo) {
            return res.json({ message: "Ya existe una sucursal con este correo" });
        }

        // Crear nueva instancia de la sucursal
        const newSucursal = new sucursalModel({
            nombre,
            direccion,
            telefono,
            correo,
            horariosAtencion,
            activo: activo !== undefined ? activo : true // Valor por defecto true
        });

        await newSucursal.save();
        res.json({ message: "Sucursal guardada" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error creando sucursal: " + error.message });
    }
};

// DELETE - Elimina una sucursal por ID
sucursalesController.deleteSucursales = async (req, res) => {
    try {
        // Busca y elimina sucursal por ID
        const deleteSucursal = await sucursalModel.findByIdAndDelete(req.params.id);

        if (!deleteSucursal) {
            return res.json({ message: "Sucursal no encontrada" });
        }

        res.json({ message: "Sucursal eliminada" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error eliminando sucursal: " + error.message });
    }
};

// UPDATE - Actualiza sucursal existente con nuevos datos
sucursalesController.updateSucursales = async (req, res) => {
    const {
        nombre,
        direccion,
        telefono,
        correo,
        horariosAtencion,
        activo
    } = req.body;

    try {
        // Verificar que no exista otra sucursal con el mismo nombre
        const existsSucursal = await sucursalModel.findOne({
            nombre,
            _id: { $ne: req.params.id } // Excluye el documento actual
        });
        if (existsSucursal) {
            return res.json({ message: "Ya existe otra sucursal con este nombre" });
        }

        // Verificar que no exista otra sucursal con el mismo correo
        const existsCorreo = await sucursalModel.findOne({
            correo,
            _id: { $ne: req.params.id } // Excluye el documento actual
        });
        if (existsCorreo) {
            return res.json({ message: "Ya existe otra sucursal con este correo" });
        }

        // Actualiza sucursal y retorna versión nueva
        const updatedSucursal = await sucursalModel.findByIdAndUpdate(
            req.params.id,
            {
                nombre,
                direccion,
                telefono,
                correo,
                horariosAtencion,
                activo
            },
            { new: true } // Retorna documento actualizado
        );

        if (!updatedSucursal) {
            return res.json({ message: "Sucursal no encontrada" });
        }

        res.json({ message: "Sucursal actualizada" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando sucursal: " + error.message });
    }
};

// SELECT BY ID - Obtiene una sucursal específica por ID
sucursalesController.getSucursalById = async (req, res) => {
    try {
        // Busca sucursal por ID
        const sucursal = await sucursalModel.findById(req.params.id);

        if (!sucursal) {
            return res.json({ message: "Sucursal no encontrada" });
        }

        res.json(sucursal);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo sucursal: " + error.message });
    }
};

export default sucursalesController;