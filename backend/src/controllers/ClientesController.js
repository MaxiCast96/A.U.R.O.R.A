import clientesModel from "../models/Clientes.js";
import bcryptjs from "bcryptjs";

const clientesController = {};

// SELECT
clientesController.getClientes = async (req, res) => {
    try {
        // Buscar todos los empleados
        const clientes = await clientesModel.find()
        res.json(clientes);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo clientes: " + error.message });
    }
};


// INSERT
clientesController.createClientes = async (req, res) => {
    const {
        nombre,
        apellido,
        edad,
        dui,
        telefono,
        correo,
        direccion,
        password
    } = req.body;

    try {
        // Verificar si ya existe un empleado con el mismo correo
        const existsClientes = await clientesModel.findOne({ correo });
        if (existsClientes) {
            return res.json({ message: "Clientes already exists" });
        }

        // Verificar si ya existe un empleado con el mismo DUI
        const existsDui = await clientesModel.findOne({ dui });
        if (existsDui) {
            return res.json({ message: "DUI already registered" });
        }

        // Encriptar la contraseña usando bcrypt
        const passwordHash = await bcryptjs.hash(password, 10);

        // Crear nueva instancia del empleado con la contraseña encriptada
        const newCliente = new clientesModel({
            nombre,
            apellido,
            edad,
            dui,
            telefono,
            correo,
            direccion,
            password: passwordHash
        });

        // Guardar el empleado en la base de datos
        await newCliente.save();

        res.json({ message: "Cliente creado exitosamente" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error creando cliente: " + error.message });
    }
};

// DELETE
clientesController.deleteClientes = async (req, res) => {
    try {
        // Buscar y eliminar el empleado por ID
        const deletedClientes = await clientesModel.findByIdAndDelete(req.params.id);

        // Verificar si el empleado existía
        if (!deletedClientes) {
            return res.json({ message: "Clientes no encontrado" });
        }

        res.json({ message: "Clientes eliminado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error eliminando Clientes: " + error.message });
    }
};

// UPDATE
clientesController.updateClientes = async (req, res) => {
    const {
        nombre,
        apellido,
        edad,
        dui,
        telefono,
        correo,
        password
    } = req.body;

    try {
        // Verificar si existe otro empleado con el mismo correo
        const existsCliente = await clientesModel.findOne({
            correo,
            _id: { $ne: req.params.id }
        });
        if (existsCliente) {
            return res.json({ message: "Otro cliente con este correo ya existe" });
        }

        // Verificar si existe otro empleado con el mismo DUI
        const existsDui = await clientesModel.findOne({
            dui,
            _id: { $ne: req.params.id }
        });
        if (existsDui) {
            return res.json({ message: "Otro cliente con este DUI ya existe" });
        }

        let updateData = {
            nombre,
            apellido,
            edad,
            dui,
            telefono,
            correo,
            direccion,
        };

        // Si se proporciona una nueva contraseña, encriptarla
        if (password) {
            const passwordHash = await bcryptjs.hash(password, 10);
            updateData.password = passwordHash;
        }

        // Buscar y actualizar el empleado por ID
        const updatedCliente = await clientesModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        // Verificar si el empleado existía
        if (!updatedCliente) {
            return res.json({ message: "Cliente no encontrado" });
        }

        res.json({ message: "Cliente actualizado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando cliente: " + error.message });
    }
};

// GET by ID
clientesController.getClienteById = async (req, res) => {
    try {
        // Buscar empleado por ID y popular la referencia de sucursal
        const cliente = await empleadosModel.findById(req.params.id);

        // Verificar si el empleado existe
        if (!cliente) {
            return res.json({ message: "Cliente no encontrado" });
        }

        res.json(cliente);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo cliente: " + error.message });
    }
};

export default clientesController;