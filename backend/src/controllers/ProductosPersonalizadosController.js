import productosPersonalizadosModel from "../models/ProductosPersonalizados.js";

const productosPersonalizadosController = {};
// SELECT - Obtiene todos los productos personalizados con relaciones pobladas
productosPersonalizadosController.getProductosPersonalizados = async (req, res) => {
    try {
        const productos = await productosPersonalizadosModel
            .find()
            .populate('clienteId', 'nombre apellido correo telefono')
            .populate('productoBaseId', 'nombre descripcion precioBase')
            .populate('marcaId', 'nombre descripcion')
            .sort({ fechaSolicitud: -1 })
            .lean()
            .exec();
        
        console.log(`Productos personalizados encontrados: ${productos.length}`);
        
        if (!productos || productos.length === 0) {
            console.log('No se encontraron productos personalizados');
            return res.json([]);
        }
        
        const productosLimpios = productos.map(producto => {
            if (!producto.clienteId) {
                producto.clienteId = { nombre: 'Cliente no encontrado', apellido: '', correo: '', telefono: '' };
            }
            if (!producto.productoBaseId) {
                producto.productoBaseId = { nombre: 'Producto no encontrado', descripcion: '', precioBase: 0 };
            }
            if (!producto.marcaId) {
                producto.marcaId = { nombre: 'Marca no encontrada', descripcion: '' };
            }
            return producto;
        });
            
        res.json(productosLimpios);
    } catch (error) {
        console.log("Error obteniendo productos personalizados:", error);
        res.status(500).json({ 
            success: false,
            message: "Error obteniendo productos personalizados: " + error.message 
        });
    }
};

// SELECT by Cliente - Obtiene productos personalizados de un cliente específico
productosPersonalizadosController.getProductosByCliente = async (req, res) => {
    try {
        const productos = await productosPersonalizadosModel
            .find({ clienteId: req.params.clienteId })
            .populate('productoBaseId', 'nombre descripcion precioBase')
            .populate('marcaId', 'nombre descripcion')
            .sort({ fechaSolicitud: -1 })
            .lean()
            .exec();
            
        res.json(productos);
    } catch (error) {
        console.log("Error obteniendo productos del cliente:", error);
        res.status(500).json({ 
            success: false,
            message: "Error obteniendo productos del cliente: " + error.message 
        });
    }
};

// INSERT - Crea nuevo producto personalizado con datos completos
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

        await newProducto.save();

        const productoCreado = await productosPersonalizadosModel
            .findById(newProducto._id)
            .populate('clienteId', 'nombre apellido correo')
            .populate('productoBaseId', 'nombre descripcion')
            .populate('marcaId', 'nombre')
            .lean()
            .exec();

        res.json({ 
            message: "Producto personalizado creado exitosamente",
            producto: productoCreado
        });
    } catch (error) {
        console.log("Error creando producto personalizado:", error);
        res.status(500).json({ 
            success: false,
            message: "Error creando producto personalizado: " + error.message 
        });
    }
};

// UPDATE - Actualiza producto personalizado existente con nuevos datos
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

        const updatedProducto = await productosPersonalizadosModel
            .findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            )
            .populate('clienteId', 'nombre apellido correo')
            .populate('productoBaseId', 'nombre descripcion')
            .populate('marcaId', 'nombre')
            .lean()
            .exec();

        if (!updatedProducto) {
            return res.json({ message: "Producto personalizado no encontrado" });
        }

        res.json({ 
            message: "Producto personalizado actualizado exitosamente",
            producto: updatedProducto
        });
    } catch (error) {
        console.log("Error actualizando producto personalizado:", error);
        res.status(500).json({ 
            success: false,
            message: "Error actualizando producto personalizado: " + error.message 
        });
    }
};

// UPDATE Estado - Actualiza solo el estado del producto personalizado
productosPersonalizadosController.updateEstado = async (req, res) => {
    const { estado } = req.body;

    try {
        const updatedProducto = await productosPersonalizadosModel
            .findByIdAndUpdate(
                req.params.id,
                { estado },
                { new: true }
            )
            .populate('clienteId', 'nombre apellido correo telefono')
            .lean()
            .exec();

        if (!updatedProducto) {
            return res.json({ message: "Producto personalizado no encontrado" });
        }

        res.json({ 
            message: "Estado actualizado exitosamente",
            producto: updatedProducto
        });
    } catch (error) {
        console.log("Error actualizando estado:", error);
        res.status(500).json({ 
            success: false,
            message: "Error actualizando estado: " + error.message 
        });
    }
};

// DELETE - Elimina un producto personalizado por ID
productosPersonalizadosController.deleteProductoPersonalizado = async (req, res) => {
    try {
        const deletedProducto = await productosPersonalizadosModel.findByIdAndDelete(req.params.id);

        if (!deletedProducto) {
            return res.json({ message: "Producto personalizado no encontrado" });
        }

        res.json({ message: "Producto personalizado eliminado exitosamente" });
    } catch (error) {
        console.log("Error eliminando producto personalizado:", error);
        res.status(500).json({ 
            success: false,
            message: "Error eliminando producto personalizado: " + error.message 
        });
    }
};

// SELECT by ID - Obtiene un producto personalizado específico por ID
productosPersonalizadosController.getProductoPersonalizadoById = async (req, res) => {
    try {
        const producto = await productosPersonalizadosModel
            .findById(req.params.id)
            .populate('clienteId', 'nombre apellido correo telefono dui direccion')
            .populate('productoBaseId', 'nombre descripcion precioBase material color tipoLente medidas')
            .populate('marcaId', 'nombre descripcion logo paisOrigen')
            .lean()
            .exec();

        if (!producto) {
            return res.json({ message: "Producto personalizado no encontrado" });
        }

        res.json(producto);
    } catch (error) {
        console.log("Error obteniendo producto personalizado:", error);
        res.status(500).json({ 
            success: false,
            message: "Error obteniendo producto personalizado: " + error.message 
        });
    }
};

// SELECT by Estado - Obtiene productos filtrados por estado específico
productosPersonalizadosController.getProductosByEstado = async (req, res) => {
    try {
        const productos = await productosPersonalizadosModel
            .find({ estado: req.params.estado })
            .populate('clienteId', 'nombre apellido correo telefono')
            .populate('productoBaseId', 'nombre descripcion')
            .populate('marcaId', 'nombre')
            .sort({ fechaSolicitud: -1 })
            .lean()
            .exec();
            
        res.json(productos);
    } catch (error) {
        console.log("Error obteniendo productos por estado:", error);
        res.status(500).json({ 
            success: false,
            message: "Error obteniendo productos por estado: " + error.message 
        });
    }
};

// ANALYTICS - Obtiene estadísticas agregadas de productos personalizados
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
        ]).exec();

        const totalProductos = await productosPersonalizadosModel.countDocuments().exec();
        
        res.json({
            totalProductos,
            estadisticas
        });
    } catch (error) {
        console.log("Error obteniendo estadísticas:", error);
        res.status(500).json({ 
            success: false,
            message: "Error obteniendo estadísticas: " + error.message 
        });
    }
};

// PATCH - Actualiza vínculos (cotizacionId, pedidoId) y opcionalmente el estado
productosPersonalizadosController.updateVinculos = async (req, res) => {
    try {
        const { cotizacionId = null, pedidoId = null, estado } = req.body;

        const update = {};
        if (typeof cotizacionId !== 'undefined') update.cotizacionId = cotizacionId;
        if (typeof pedidoId !== 'undefined') update.pedidoId = pedidoId;
        if (typeof estado !== 'undefined') update.estado = estado;

        const producto = await productosPersonalizadosModel
            .findByIdAndUpdate(
                req.params.id,
                update,
                { new: true }
            )
            .populate('clienteId', 'nombre apellido correo telefono')
            .populate('productoBaseId', 'nombre descripcion precioBase')
            .populate('marcaId', 'nombre descripcion')
            .lean()
            .exec();

        if (!producto) {
            return res.status(404).json({ message: 'Producto personalizado no encontrado' });
        }

        return res.json({
            message: 'Vínculos actualizados exitosamente',
            producto
        });
    } catch (error) {
        console.log('Error actualizando vínculos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error actualizando vínculos: ' + error.message
        });
    }
};

export default productosPersonalizadosController;