import productosPersonalizadosModel from "../models/ProductosPersonalizados.js";

const productosPersonalizadosController = {};

// SELECT - Obtiene todos los productos personalizados con relaciones pobladas
productosPersonalizadosController.getProductosPersonalizados = async (req, res) => {
    try {
        // Busca todos los productos y puebla las referencias a cliente, producto base y marca
        const productos = await productosPersonalizadosModel
            .find()
            .populate('clienteId', 'nombre apellido correo telefono') // Datos básicos del cliente
            .populate('productoBaseId', 'nombre descripcion precioBase') // Datos del producto base
            .populate('marcaId', 'nombre descripcion') // Datos de la marca
            .sort({ fechaSolicitud: -1 }); // Ordena por fecha de solicitud descendente
            
        res.json(productos);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo productos personalizados: " + error.message });
    }
};

// SELECT by Cliente - Obtiene productos personalizados de un cliente específico
productosPersonalizadosController.getProductosByCliente = async (req, res) => {
    try {
        // Filtra productos por ID de cliente específico
        const productos = await productosPersonalizadosModel
            .find({ clienteId: req.params.clienteId })
            .populate('productoBaseId', 'nombre descripcion precioBase')
            .populate('marcaId', 'nombre descripcion')
            .sort({ fechaSolicitud: -1 }); // Ordena por fecha de solicitud descendente
            
        res.json(productos);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo productos del cliente: " + error.message });
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
        // Crear nueva instancia del producto personalizado con todos los datos
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
        // Prepara objeto con datos a actualizar
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

        // Busca y actualiza el producto por ID
        const updatedProducto = await productosPersonalizadosModel
            .findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true } // Retorna documento actualizado
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

// UPDATE Estado - Actualiza solo el estado del producto personalizado
productosPersonalizadosController.updateEstado = async (req, res) => {
    const { estado } = req.body;

    try {
        // Actualiza producto y retorna versión nueva
        const updatedProducto = await productosPersonalizadosModel
            .findByIdAndUpdate(
                req.params.id,
                { estado },
                { new: true } // Retorna documento actualizado
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

// DELETE - Elimina un producto personalizado por ID
productosPersonalizadosController.deleteProductoPersonalizado = async (req, res) => {
    try {
        // Busca y elimina el producto por ID
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

// SELECT by ID - Obtiene un producto personalizado específico por ID
productosPersonalizadosController.getProductoPersonalizadoById = async (req, res) => {
    try {
        // Busca producto por ID y puebla todas las referencias
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

// SELECT by Estado - Obtiene productos filtrados por estado específico
productosPersonalizadosController.getProductosByEstado = async (req, res) => {
    try {
        // Filtra productos por estado específico
        const productos = await productosPersonalizadosModel
            .find({ estado: req.params.estado })
            .populate('clienteId', 'nombre apellido correo telefono')
            .populate('productoBaseId', 'nombre descripcion')
            .populate('marcaId', 'nombre')
            .sort({ fechaSolicitud: -1 }); // Ordena por fecha de solicitud descendente
            
        res.json(productos);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo productos por estado: " + error.message });
    }
};

// ANALYTICS - Obtiene estadísticas agregadas de productos personalizados
productosPersonalizadosController.getEstadisticas = async (req, res) => {
    try {
        // Agrupa productos por estado y calcula métricas
        const estadisticas = await productosPersonalizadosModel.aggregate([
            {
                $group: {
                    _id: "$estado",
                    count: { $sum: 1 }, // Cuenta productos por estado
                    totalVentas: { $sum: "$cotizacion.total" } // Suma total de ventas
                }
            }
        ]);

        // Cuenta total de productos personalizados
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