import sucursalModel from "../models/Sucursales.js";

const sucursalesController = {};

// SELECT
sucursalesController.getSucursales = async (req, res) => {
    try {
        // Buscar todas las sucursales
        const sucursales = await sucursalModel.find();
        res.json(sucursales);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo sucursales: " + error.message });
    }
};

// INSERT
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
            activo: activo !== undefined ? activo : true
        });

        // Guardar la sucursal en la base de datos
        await newSucursal.save();
        res.json({ message: "Sucursal guardada" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error creando sucursal: " + error.message });
    }
};

// DELETE
sucursalesController.deleteSucursales = async (req, res) => {
    try {
        // Buscar y eliminar la sucursal por ID
        const deleteSucursal = await sucursalModel.findByIdAndDelete(req.params.id);

        // Verificar si la sucursal existía
        if (!deleteSucursal) {
            return res.json({ message: "Sucursal no encontrada" });
        }

        res.json({ message: "Sucursal eliminada" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error eliminando sucursal: " + error.message });
    }
};

// UPDATE
sucursalesController.updateSucursales = async (req, res) => {
    // Desestructuración de los datos a actualizar
    const {
        nombre,
        direccion,
        telefono,
        correo,
        horariosAtencion,
        activo
    } = req.body;

    try {
        // Verificar si existe otra sucursal con el mismo nombre (excluyendo la actual)
        const existsSucursal = await sucursalModel.findOne({
            nombre,
            _id: { $ne: req.params.id }
        });
        if (existsSucursal) {
            return res.json({ message: "Ya existe otra sucursal con este nombre" });
        }

        // Verificar si existe otra sucursal con el mismo correo (excluyendo la actual)
        const existsCorreo = await sucursalModel.findOne({
            correo,
            _id: { $ne: req.params.id }
        });
        if (existsCorreo) {
            return res.json({ message: "Ya existe otra sucursal con este correo" });
        }

        // Buscar y actualizar la sucursal por ID
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
            { new: true }
        );

        // Verificar si la sucursal existía
        if (!updatedSucursal) {
            return res.json({ message: "Sucursal no encontrada" });
        }

        res.json({ message: "Sucursal actualizada" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando sucursal: " + error.message });
    }
};

// SELECT BY ID
sucursalesController.getSucursalById = async (req, res) => {
    try {
        // Buscar sucursal por ID
        const sucursal = await sucursalModel.findById(req.params.id);

        // Verificar si la sucursal existe
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