import clientesModel from "../models/Clientes.js";
import empleadosModel from "../models/Empleados.js";
import optometristaModel from "../models/Optometrista.js";
import bcryptjs from "bcryptjs";

const clientesController = {};

// GET todos los clientes
clientesController.getClientes = async (req, res) => {
    try {
        const clientes = await clientesModel.find();
        res.json(clientes);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo clientes: " + error.message });
    }
};

// GET cliente por ID
clientesController.getClienteById = async (req, res) => {
    try {
        // --- CORRECCIÓN: Usar clientesModel en lugar de empleadosModel ---
        const cliente = await clientesModel.findById(req.params.id);
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        res.json(cliente);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo cliente: " + error.message });
    }
};

// CREATE un nuevo cliente
clientesController.createClientes = async (req, res) => {
    let {
        nombre,
        apellido,
        edad,
        dui,
        telefono,
        correo,
        calle, // Recibimos los campos de dirección de forma plana
        ciudad,
        departamento,
        password,
        estado
    } = req.body;
    correo = correo.trim().toLowerCase();

    try {
        const existsClientes = await clientesModel.findOne({ correo });
        if (existsClientes) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        const existsDui = await clientesModel.findOne({ dui });
        if (existsDui) {
            return res.status(400).json({ message: "El DUI ya está registrado" });
        }

        const passwordHash = await bcryptjs.hash(password, 10);

        const newCliente = new clientesModel({
            nombre,
            apellido,
            edad,
            dui,
            telefono,
            correo,
            // --- AJUSTE: Construir el objeto anidado 'direccion' ---
            direccion: {
                calle,
                ciudad,
                departamento
            },
            password: passwordHash,
            estado
        });

        await newCliente.save();
        res.status(201).json({ message: "Cliente creado exitosamente" });

    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error creando cliente: " + error.message });
    }
};

// UPDATE un cliente existente
clientesController.updateClientes = async (req, res) => {
    const { id } = req.params;
    let {
        nombre,
        apellido,
        edad,
        dui,
        telefono,
        correo,
        calle,
        ciudad,
        departamento,
        password,
        estado
    } = req.body;
    correo = correo.trim().toLowerCase();

    try {
        const existsClienteCorreo = await clientesModel.findOne({ correo, _id: { $ne: id } });
        if (existsClienteCorreo) {
            return res.status(400).json({ message: "Otro cliente con este correo ya existe" });
        }

        const existsClienteDui = await clientesModel.findOne({ dui, _id: { $ne: id } });
        if (existsClienteDui) {
            return res.status(400).json({ message: "Otro cliente con este DUI ya existe" });
        }

        // --- AJUSTE: Construcción de datos a actualizar ---
        const updateData = {
            nombre,
            apellido,
            edad,
            dui,
            telefono,
            correo,
            direccion: {
                calle,
                ciudad,
                departamento
            },
            estado,
        };

        if (password) {
            updateData.password = await bcryptjs.hash(password, 10);
        }

        const updatedCliente = await clientesModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedCliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        res.json({ message: "Cliente actualizado exitosamente" });

    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error actualizando cliente: " + error.message });
    }
};


// DELETE un cliente
clientesController.deleteClientes = async (req, res) => {
    try {
        const deletedClientes = await clientesModel.findByIdAndDelete(req.params.id);
        if (!deletedClientes) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        res.json({ message: "Cliente eliminado exitosamente" });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error eliminando Cliente: " + error.message });
    }
};

// LOGIN UNIFICADO
clientesController.loginUnificado = async (req, res) => {
    let { correo, password } = req.body;
    correo = correo.toLowerCase();
    try {
        // 1. Buscar en clientes (correo insensible a mayúsculas)
        const cliente = await clientesModel.findOne({ correo });
        if (cliente) {
            const isMatch = await bcryptjs.compare(password, cliente.password);
            if (!isMatch) return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
            return res.json({
                id: cliente._id,
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                correo: cliente.correo,
                telefono: cliente.telefono,
                rol: 'Cliente'
            });
        }
        // 2. Buscar en empleados (correo insensible a mayúsculas)
        const empleado = await empleadosModel.findOne({ correo });
        if (empleado) {
            const isMatch = await bcryptjs.compare(password, empleado.password);
            if (!isMatch) return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
            // Si es optometrista, buscar datos extra
            if (empleado.cargo === 'Optometrista') {
                const optometrista = await optometristaModel.findOne({ empleadoId: empleado._id });
                return res.json({
                    id: empleado._id,
                    nombre: empleado.nombre,
                    apellido: empleado.apellido,
                    correo: empleado.correo,
                    telefono: empleado.telefono,
                    rol: 'Optometrista',
                    especialidad: optometrista?.especialidad,
                    licencia: optometrista?.licencia
                });
            }
            // Otros empleados
            return res.json({
                id: empleado._id,
                nombre: empleado.nombre,
                apellido: empleado.apellido,
                correo: empleado.correo,
                telefono: empleado.telefono,
                rol: empleado.cargo
            });
        }
        // No encontrado
        return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    } catch (error) {
        console.log('Error: ' + error);
        res.status(500).json({ message: 'Error en login: ' + error.message });
    }
};


export default clientesController;