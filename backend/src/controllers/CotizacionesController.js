import cotizacionesModel from "../models/Cotizaciones.js";

const cotizacionesController = {};

// SELECT - Obtener todas las cotizaciones
cotizacionesController.getCotizaciones = async (req, res) => {
    try {
        const cotizaciones = await cotizacionesModel.find()
            .populate('clienteId', 'nombre apellido correo telefono')
            .populate('productos.productoId', 'nombre descripcion precioActual categoriaId')
            .populate({
                path: 'productos.productoId',
                populate: {
                    path: 'categoriaId',
                    select: 'nombre'
                }
            })
            .sort({ createdAt: -1 });
        
        res.json(cotizaciones);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo cotizaciones: " + error.message });
    }
};

// SELECT by ID - Obtener cotización por ID
cotizacionesController.getCotizacionById = async (req, res) => {
    try {
        const cotizacion = await cotizacionesModel.findById(req.params.id)
            .populate('clienteId', 'nombre apellido correo telefono dui direccion')
            .populate('productos.productoId', 'nombre descripcion precioActual material color tipoLente categoriaId')
            .populate({
                path: 'productos.productoId',
                populate: {
                    path: 'categoriaId',
                    select: 'nombre descripcion'
                }
            });

        if (!cotizacion) {
            return res.status(404).json({ message: "Cotización no encontrada" });
        }

        res.json(cotizacion);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo cotización: " + error.message });
    }
};

// SELECT por cliente - Obtener cotizaciones de un cliente específico
cotizacionesController.getCotizacionesByCliente = async (req, res) => {
    try {
        const cotizaciones = await cotizacionesModel.find({ clienteId: req.params.clienteId })
            .populate('productos.productoId', 'nombre descripcion precioActual categoriaId')
            .populate({
                path: 'productos.productoId',
                populate: {
                    path: 'categoriaId',
                    select: 'nombre'
                }
            })
            .sort({ createdAt: -1 });

        res.json(cotizaciones);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo cotizaciones del cliente: " + error.message });
    }
};

// INSERT - Crear nueva cotización
cotizacionesController.createCotizacion = async (req, res) => {
    const {
        clienteId,
        correoCliente,
        telefonoCliente,
        fecha,
        productos,
        graduacion,
        validaHasta,
        recetaUrl,
        observaciones,
        descuento,
        impuesto
    } = req.body;

    try {
        // Validar que existan productos
        if (!productos || productos.length === 0) {
            return res.status(400).json({ message: "Debe incluir al menos un producto en la cotización" });
        }

        // Calcular subtotales para cada producto
        const productosCalculados = productos.map(producto => ({
            ...producto,
            subtotal: producto.cantidad * producto.precioUnitario
        }));

        // Crear nueva cotización
        const nuevaCotizacion = new cotizacionesModel({
            clienteId,
            correoCliente,
            telefonoCliente,
            fecha: fecha || new Date(),
            productos: productosCalculados,
            graduacion,
            validaHasta,
            recetaUrl,
            observaciones,
            descuento: descuento || 0,
            impuesto: impuesto || 0
        });

        await nuevaCotizacion.save();

        // Obtener la cotización creada con populate
        const cotizacionCreada = await cotizacionesModel.findById(nuevaCotizacion._id)
            .populate('clienteId', 'nombre apellido correo telefono')
            .populate('productos.productoId', 'nombre descripcion precioActual categoriaId')
            .populate({
                path: 'productos.productoId',
                populate: {
                    path: 'categoriaId',
                    select: 'nombre'
                }
            });

        res.status(201).json({ 
            message: "Cotización creada exitosamente",
            cotizacion: cotizacionCreada
        });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error creando cotización: " + error.message });
    }
};

// UPDATE - Actualizar cotización
cotizacionesController.updateCotizacion = async (req, res) => {
    const {
        clienteId,
        correoCliente,
        telefonoCliente,
        productos,
        graduacion,
        validaHasta,
        estado,
        recetaUrl,
        urlCotizacion,
        observaciones,
        descuento,
        impuesto
    } = req.body;

    try {
        // Verificar que la cotización existe
        const cotizacionExistente = await cotizacionesModel.findById(req.params.id);
        if (!cotizacionExistente) {
            return res.status(404).json({ message: "Cotización no encontrada" });
        }

        // Verificar si la cotización ya está convertida o finalizada
        if (cotizacionExistente.estado === 'convertida') {
            return res.status(400).json({ message: "No se puede modificar una cotización ya convertida" });
        }

        let updateData = {
            clienteId,
            correoCliente,
            telefonoCliente,
            graduacion,
            validaHasta,
            estado,
            recetaUrl,
            urlCotizacion,
            observaciones,
            descuento: descuento || 0,
            impuesto: impuesto || 0
        };

        // Si se proporcionan productos, recalcular subtotales
        if (productos && productos.length > 0) {
            const productosCalculados = productos.map(producto => ({
                ...producto,
                subtotal: producto.cantidad * producto.precioUnitario
            }));
            updateData.productos = productosCalculados;
        }

        const cotizacionActualizada = await cotizacionesModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('clienteId', 'nombre apellido correo telefono')
         .populate('productos.productoId', 'nombre descripcion precioActual categoriaId')
         .populate({
            path: 'productos.productoId',
            populate: {
                path: 'categoriaId',
                select: 'nombre'
            }
         });

        res.json({ 
            message: "Cotización actualizada exitosamente",
            cotizacion: cotizacionActualizada
        });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error actualizando cotización: " + error.message });
    }
};

// UPDATE estado - Actualizar solo el estado de la cotización
cotizacionesController.updateEstadoCotizacion = async (req, res) => {
    const { estado } = req.body;

    try {
        const estadosPermitidos = ['pendiente', 'aprobada', 'rechazada', 'expirada', 'convertida'];
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({ message: "Estado no válido" });
        }

        const cotizacionActualizada = await cotizacionesModel.findByIdAndUpdate(
            req.params.id,
            { estado },
            { new: true }
        ).populate('clienteId', 'nombre apellido correo telefono');

        if (!cotizacionActualizada) {
            return res.status(404).json({ message: "Cotización no encontrada" });
        }

        res.json({ 
            message: "Estado de cotización actualizado exitosamente",
            cotizacion: cotizacionActualizada
        });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error actualizando estado: " + error.message });
    }
};

// DELETE - Eliminar cotización
cotizacionesController.deleteCotizacion = async (req, res) => {
    try {
        const cotizacionEliminada = await cotizacionesModel.findByIdAndDelete(req.params.id);

        if (!cotizacionEliminada) {
            return res.status(404).json({ message: "Cotización no encontrada" });
        }

        res.json({ message: "Cotización eliminada exitosamente" });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error eliminando cotización: " + error.message });
    }
};

// GET - Obtener cotizaciones por estado
cotizacionesController.getCotizacionesByEstado = async (req, res) => {
    try {
        const { estado } = req.params;
        const estadosPermitidos = ['pendiente', 'aprobada', 'rechazada', 'expirada', 'convertida'];
        
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({ message: "Estado no válido" });
        }

        const cotizaciones = await cotizacionesModel.find({ estado })
            .populate('clienteId', 'nombre apellido correo telefono')
            .populate('productos.productoId', 'nombre descripcion precioActual categoriaId')
            .populate({
                path: 'productos.productoId',
                populate: {
                    path: 'categoriaId',
                    select: 'nombre'
                }
            })
            .sort({ createdAt: -1 });

        res.json(cotizaciones);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo cotizaciones por estado: " + error.message });
    }
};

// GET - Verificar cotizaciones expiradas y actualizar estado
cotizacionesController.actualizarCotizacionesExpiradas = async (req, res) => {
    try {
        const fechaActual = new Date();
        
        const resultado = await cotizacionesModel.updateMany(
            {
                validaHasta: { $lt: fechaActual },
                estado: { $in: ['pendiente', 'aprobada'] }
            },
            { estado: 'expirada' }
        );

        res.json({ 
            message: `Se actualizaron ${resultado.modifiedCount} cotizaciones expiradas`
        });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error actualizando cotizaciones expiradas: " + error.message });
    }
};

export default cotizacionesController;