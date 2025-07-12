import carritosModel from "../models/Carrito.js";

const carritosController = {};

// SELECT - Obtiene todos los carritos con información del cliente
carritosController.getCarritos = async (req, res) => {
    try {
        // Busca todos los carritos y puebla datos básicos del cliente
        const carritos = await carritosModel.find()
            .populate('clienteId', 'nombre apellido correo') // Solo campos específicos
            .sort({ createdAt: -1 }); // Ordena por fecha de creación descendente
        res.json(carritos);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo carritos: " + error.message });
    }
};

// SELECT by ID - Obtiene un carrito específico por ID
carritosController.getCarritoById = async (req, res) => {
    try {
        // Busca carrito por ID y puebla datos del cliente
        const carrito = await carritosModel.findById(req.params.id)
            .populate('clienteId', 'nombre apellido correo');

        if (!carrito) {
            return res.json({ message: "Carrito no encontrado" });
        }

        res.json(carrito);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo carrito: " + error.message });
    }
};

// SELECT by Cliente ID - Obtiene carritos de un cliente específico
carritosController.getCarritosByCliente = async (req, res) => {
    try {
        // Filtra carritos por ID de cliente específico
        const carritos = await carritosModel.find({ clienteId: req.params.clienteId })
            .populate('clienteId', 'nombre apellido correo')
            .sort({ createdAt: -1 });
        res.json(carritos);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo carritos del cliente: " + error.message });
    }
};

// INSERT - Crear nuevo carrito
carritosController.createCarrito = async (req, res) => {
    const { clienteId, productos } = req.body;

    try {
        // Verificar si el cliente existe
        if (!clienteId) {
            return res.json({ message: "ClienteId es requerido" });
        }

        // Calcular subtotales para cada producto
        const productosConSubtotal = productos.map(producto => ({
            ...producto,
            subtotal: producto.precio * producto.cantidad
        }));

        // Crear nueva instancia del carrito
        const newCarrito = new carritosModel({
            clienteId,
            productos: productosConSubtotal
        });

        // Guardar el carrito en la base de datos
        await newCarrito.save();

        // Poblar los datos del cliente antes de enviar la respuesta
        await newCarrito.populate('clienteId', 'nombre apellido correo');

        res.json({ 
            message: "Carrito creado exitosamente",
            carrito: newCarrito
        });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error creando carrito: " + error.message });
    }
};

// UPDATE - Actualizar carrito
carritosController.updateCarrito = async (req, res) => {
    const { productos, estado } = req.body;

    try {
        // Calcular subtotales para cada producto si se proporcionan productos
        let updateData = {};
        
        if (productos) {
            const productosConSubtotal = productos.map(producto => ({
                ...producto,
                subtotal: producto.precio * producto.cantidad
            }));
            updateData.productos = productosConSubtotal;
        }

        if (estado) {
            updateData.estado = estado;
        }

        // Buscar y actualizar el carrito por ID
        const updatedCarrito = await carritosModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('clienteId', 'nombre apellido correo');

        // Verificar si el carrito existía
        if (!updatedCarrito) {
            return res.json({ message: "Carrito no encontrado" });
        }

        res.json({ 
            message: "Carrito actualizado exitosamente",
            carrito: updatedCarrito
        });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando carrito: " + error.message });
    }
};

// DELETE - Eliminar carrito
carritosController.deleteCarrito = async (req, res) => {
    try {
        // Buscar y eliminar el carrito por ID
        const deletedCarrito = await carritosModel.findByIdAndDelete(req.params.id);

        // Verificar si el carrito existía
        if (!deletedCarrito) {
            return res.json({ message: "Carrito no encontrado" });
        }

        res.json({ message: "Carrito eliminado exitosamente" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error eliminando carrito: " + error.message });
    }
};

// Método para agregar producto al carrito
carritosController.addProductoToCarrito = async (req, res) => {
    const { productoId, nombre, precio, cantidad } = req.body;

    try {
        const carrito = await carritosModel.findById(req.params.id);

        if (!carrito) {
            return res.json({ message: "Carrito no encontrado" });
        }

        // Verificar si el producto ya existe en el carrito
        const productoExistente = carrito.productos.find(p => p.productoId.toString() === productoId);

        if (productoExistente) {
            // Si existe, actualizar la cantidad
            productoExistente.cantidad += cantidad;
            productoExistente.subtotal = productoExistente.precio * productoExistente.cantidad;
        } else {
            // Si no existe, agregarlo
            carrito.productos.push({
                productoId,
                nombre,
                precio,
                cantidad,
                subtotal: precio * cantidad
            });
        }

        await carrito.save();
        await carrito.populate('clienteId', 'nombre apellido correo');

        res.json({ 
            message: "Producto agregado al carrito exitosamente",
            carrito
        });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error agregando producto al carrito: " + error.message });
    }
};

// Método para remover producto del carrito
carritosController.removeProductoFromCarrito = async (req, res) => {
    const { productoId } = req.body;

    try {
        const carrito = await carritosModel.findById(req.params.id);

        if (!carrito) {
            return res.json({ message: "Carrito no encontrado" });
        }

        // Filtrar el producto a eliminar
        carrito.productos = carrito.productos.filter(p => p.productoId.toString() !== productoId);

        await carrito.save();
        await carrito.populate('clienteId', 'nombre apellido correo');

        res.json({ 
            message: "Producto removido del carrito exitosamente",
            carrito
        });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error removiendo producto del carrito: " + error.message });
    }
};

export default carritosController;