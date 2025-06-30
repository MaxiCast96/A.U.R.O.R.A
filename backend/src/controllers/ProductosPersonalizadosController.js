import productosPersonalizadosModel from "../models/ProductosPersonalizados.js";

const productosPersonalizadosController = {};

// SELECT - Obtener todos los productos personalizados
productosPersonalizadosController.getProductosPersonalizados = async (req, res) => {
    try {
        const productos = await productosPersonalizadosModel
            .find()
            .populate('clienteId', 'nombre apellido correo telefono')
            .populate('productoBaseId', 'nombre descripcion precioBase')
            .populate('marcaId', 'nombre descripcion')
            .sort({ fechaSolicitud: -1 });
            
        res.json(productos);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo productos personalizados: " + error.message });
    }
};

// SELECT by Cliente - Obtener productos personalizados por cliente
productosPersonalizadosController.getProductosByCliente = async (req, res) => {
    try {
        const productos = await productosPersonalizadosModel
            .find({ clienteId: req.params.clienteId })
            .populate('productoBaseId', 'nombre descripcion precioBase')
            .populate('marcaId', 'nombre descripcion')
            .sort({ fechaSolicitud: -1 });
            
        res.json(productos);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo productos del cliente: " + error.message });
    }
};

// INSERT - Crear nuevo producto personalizado
productosPersonalizadosController.createProductoPersonalizado = async (req, res) => {
    const {
        clienteId,
        productoBaseId,
        nombre,
        descripcion,
        categoria,
        marcaId,
        material,
        color,
        tipoLente,
        precioCalculado,
        detallesPersonalizacion,
        fechaEntregaEstimada,
        cotizacion
    } = req.body;

    try {
        // Crear nueva instancia del producto personalizado
        const newProducto = new productosPersonalizadosModel({
            clienteId,
            productoBaseId,
            nombre,
            descripcion,
            categoria,
            marcaId,
            material,
            color,
            tipoLente,
            precioCalculado,
            detallesPersonalizacion,
            fechaEntregaEstimada,
            cotizacion
        });

        // Guardar el producto en la base de datos
        await newProducto.save();

        // Obtener el producto creado con las referencias pobladas
        const productoCreado = await productosPersonalizadosModel
            .findById(newProducto._id)
            .populate('clienteId', 'nombre apellido correo')
            .populate('productoBaseId', 'nombre descripcion')
            .populate('marcaId', 'nombre');

        res.json({ 
            message: "Producto personalizado creado exitosamente",
            producto: productoCreado
        });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error creando producto personalizado: " + error.message });
    }
};

// UPDATE - Actualizar producto personalizado
productosPersonalizadosController.updateProductoPersonalizado = async (req, res) => {
    const {
        nombre,
        descripcion,
        categoria,
        material,
        color,
        tipoLente,
        precioCalculado,
        detallesPersonalizacion,
        estado,
        fechaEntregaEstimada,
        cotizacion
    } = req.body;

    try {
        const updateData = {
            nombre,
            descripcion,
            categoria,
            material,
            color,
            tipoLente,
            precioCalculado,
            detallesPersonalizacion,
            estado,
            fechaEntregaEstimada,
            cotizacion
        };

        // Buscar y actualizar el producto por ID
        const updatedProducto = await productosPersonalizadosModel
            .findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            )
            .populate('clienteId', 'nombre apellido correo')
            .populate('productoBaseId', 'nombre descripcion')
            .populate('marcaId', 'nombre');

        // Verificar si el producto existía
        if (!updatedProducto) {
            return res.json({ message: "Producto personalizado no encontrado" });
        }

        res.json({ 
            message: "Producto personalizado actualizado exitosamente",
            producto: updatedProducto
        });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando producto personalizado: " + error.message });
    }
};

// UPDATE Estado - Actualizar solo el estado del producto
productosPersonalizadosController.updateEstado = async (req, res) => {
    const { estado } = req.body;

    try {
        const updatedProducto = await productosPersonalizadosModel
            .findByIdAndUpdate(
                req.params.id,
                { estado },
                { new: true }
            )
            .populate('clienteId', 'nombre apellido correo telefono');

        if (!updatedProducto) {
            return res.json({ message: "Producto personalizado no encontrado" });
        }

        res.json({ 
            message: "Estado actualizado exitosamente",
            producto: updatedProducto
        });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando estado: " + error.message });
    }
};

// DELETE - Eliminar producto personalizado
productosPersonalizadosController.deleteProductoPersonalizado = async (req, res) => {
    try {
        // Buscar y eliminar el producto por ID
        const deletedProducto = await productosPersonalizadosModel.findByIdAndDelete(req.params.id);

        // Verificar si el producto existía
        if (!deletedProducto) {
            return res.json({ message: "Producto personalizado no encontrado" });
        }

        res.json({ message: "Producto personalizado eliminado exitosamente" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error eliminando producto personalizado: " + error.message });
    }
};

// GET by ID - Obtener producto personalizado por ID
productosPersonalizadosController.getProductoPersonalizadoById = async (req, res) => {
    try {
        // Buscar producto por ID y popular las referencias
        const producto = await productosPersonalizadosModel
            .findById(req.params.id)
            .populate('clienteId', 'nombre apellido correo telefono dui direccion')
            .populate('productoBaseId', 'nombre descripcion precioBase material color tipoLente medidas')
            .populate('marcaId', 'nombre descripcion logo paisOrigen');

        // Verificar si el producto existe
        if (!producto) {
            return res.json({ message: "Producto personalizado no encontrado" });
        }

        res.json(producto);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo producto personalizado: " + error.message });
    }
};

// GET by Estado - Obtener productos por estado
productosPersonalizadosController.getProductosByEstado = async (req, res) => {
    try {
        const productos = await productosPersonalizadosModel
            .find({ estado: req.params.estado })
            .populate('clienteId', 'nombre apellido correo telefono')
            .populate('productoBaseId', 'nombre descripcion')
            .populate('marcaId', 'nombre')
            .sort({ fechaSolicitud: -1 });
            
        res.json(productos);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo productos por estado: " + error.message });
    }
};

// GET Estadísticas - Obtener estadísticas de productos personalizados
productosPersonalizadosController.getEstadisticas = async (req, res) => {
    try {
        const estadisticas = await productosPersonalizadosModel.aggregate([
            {
                $group: {
                    _id: "$estado",
                    count: { $sum: 1 },
                    totalVentas: { $sum: "$cotizacion.total" }
                }
            }
        ]);

        const totalProductos = await productosPersonalizadosModel.countDocuments();
        
        res.json({
            totalProductos,
            estadisticas
        });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo estadísticas: " + error.message });
    }
};

export default productosPersonalizadosController;