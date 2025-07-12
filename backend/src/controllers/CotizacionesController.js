import cotizacionesModel from "../models/Cotizaciones.js";

const cotizacionesController = {};

// SELECT - Obtiene todas las cotizaciones con relaciones pobladas
cotizacionesController.getCotizaciones = async (req, res) => {
    try {
        // Busca cotizaciones y puebla cliente, productos y categorías
        const cotizaciones = await cotizacionesModel.find()
            .populate('clienteId', 'nombre apellido correo telefono') // Datos básicos del cliente
            .populate('productos.productoId', 'nombre descripcion precioActual categoriaId')  // Datos del producto
            .populate({
                path: 'productos.productoId',
                populate: {
                    path: 'categoriaId',
                    select: 'nombre' // Puebla categoría dentro del producto
                }
            })
            .sort({ createdAt: -1 }); // Ordena por fecha de creación descendente
        
        res.json(cotizaciones);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo cotizaciones: " + error.message });
    }
};

// SELECT by ID - Obtiene cotización específica con poblaciones completas
cotizacionesController.getCotizacionById = async (req, res) => {
    try {
        // Busca cotización por ID con poblaciones extendidas
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

// SELECT por cliente - Obtiene cotizaciones de un cliente específico
cotizacionesController.getCotizacionesByCliente = async (req, res) => {
    try {
        // Filtra cotizaciones por ID de cliente específico
        const cotizaciones = await cotizacionesModel.find({ clienteId: req.params.clienteId })
            .populate('productos.productoId', 'nombre descripcion precioActual categoriaId')
            .populate({
                path: 'productos.productoId',
                populate: {
                    path: 'categoriaId',
                    select: 'nombre'
                }
            })
            .sort({ createdAt: -1 }); // Ordena por fecha de creación descendente

        res.json(cotizaciones);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo cotizaciones del cliente: " + error.message });
    }
};

// INSERT - Crear nueva cotización con validación de productos
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

        // Crear nueva instancia de cotización con todos los datos
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

        // Obtener la cotización creada con todas las referencias pobladas
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

// UPDATE - Actualiza cotización con validación de estado
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

        // Prepara objeto con datos a actualizar
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

        // Actualiza el documento y retorna la versión nueva
        const cotizacionActualizada = await cotizacionesModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true } // Retorna documento actualizado
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

// UPDATE estado - Actualiza solo el estado de la cotización
cotizacionesController.updateEstadoCotizacion = async (req, res) => {
    const { estado } = req.body;

    try {
        // Valida estados permitidos
        const estadosPermitidos = ['pendiente', 'aprobada', 'rechazada', 'expirada', 'convertida'];
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({ message: "Estado no válido" });
        }

        // Actualiza cotización y retorna versión nueva
        const cotizacionActualizada = await cotizacionesModel.findByIdAndUpdate(
            req.params.id,
            { estado },
            { new: true } // Retorna documento actualizado
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

// DELETE - Elimina una cotización por ID
cotizacionesController.deleteCotizacion = async (req, res) => {
    try {
        // Busca y elimina cotización por ID
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

// SELECT by Estado - Obtiene cotizaciones filtradas por estado
cotizacionesController.getCotizacionesByEstado = async (req, res) => {
    try {
        const { estado } = req.params;
        // Valida estados permitidos
        const estadosPermitidos = ['pendiente', 'aprobada', 'rechazada', 'expirada', 'convertida'];
        
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({ message: "Estado no válido" });
        }

        // Filtra cotizaciones por estado específico
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
            .sort({ createdAt: -1 }); // Ordena por fecha de creación descendente

        res.json(cotizaciones);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo cotizaciones por estado: " + error.message });
    }
};

// UTILITY - Verifica cotizaciones expiradas y actualiza estado automáticamente
cotizacionesController.actualizarCotizacionesExpiradas = async (req, res) => {
    try {
        const fechaActual = new Date();
        
        // Actualiza masivamente cotizaciones que han expirado
        const resultado = await cotizacionesModel.updateMany(
            {
                validaHasta: { $lt: fechaActual }, // Fecha límite ya pasó
                estado: { $in: ['pendiente', 'aprobada'] } // Solo estados activos
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