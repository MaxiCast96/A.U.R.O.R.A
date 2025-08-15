import ventasModel from "../models/Ventas.js";

const ventasController = {};

// SELECT - Obtener todas las ventas
ventasController.getVentas = async (req, res) => {
    try {
        // Busca todas las ventas y puebla referencias relacionadas
        const ventas = await ventasModel.find()
            .populate('carritoId') // Datos del carrito asociado
            .populate('empleadoId', 'nombre apellido correo') // Datos básicos del empleado
            .populate('sucursalId', 'nombre direccion') // Datos de la sucursal
            .populate('facturaDatos.clienteId', 'nombre apellido correo') // Datos del cliente en factura
            .sort({ createdAt: -1 }); // Ordena por fecha de creación descendente
        
        res.json(ventas);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo ventas: " + error.message });
    }
};

// INSERT - Crear nueva venta
ventasController.createVenta = async (req, res) => {
    const {
        carritoId,
        empleadoId,
        sucursalId,
        fecha,
        estado,
        datosPago,
        facturaDatos,
        observaciones
    } = req.body;

    try {
        // Validación de campos obligatorios
        if (!carritoId) return res.status(400).json({ message: "El carrito es obligatorio" });
        if (!empleadoId) return res.status(400).json({ message: "El empleado es obligatorio" });
        if (!sucursalId) return res.status(400).json({ message: "La sucursal es obligatoria" });
        // fecha y estado pueden omitirse: se aplican valores por defecto más abajo

        if (!datosPago || !datosPago.metodoPago) return res.status(400).json({ message: "El método de pago es obligatorio" });
        if (!datosPago.montoPagado && datosPago.montoPagado !== 0) return res.status(400).json({ message: "El monto pagado es obligatorio" });
        if (!datosPago.montoTotal && datosPago.montoTotal !== 0) return res.status(400).json({ message: "El monto total es obligatorio" });
        // numeroFactura puede omitirse; si viene, se valida unicidad
        if (!facturaDatos) return res.status(400).json({ message: "Los datos de factura son obligatorios" });

        if (!facturaDatos.clienteId) return res.status(400).json({ message: "El cliente de la factura es obligatorio" });
        if (!facturaDatos.nombreCliente) return res.status(400).json({ message: "El nombre del cliente es obligatorio" });
        if (!facturaDatos.duiCliente) return res.status(400).json({ message: "El DUI del cliente es obligatorio" });
        if (!facturaDatos.direccionCliente || !facturaDatos.direccionCliente.calle) return res.status(400).json({ message: "La calle de la dirección es obligatoria" });
        if (!facturaDatos.direccionCliente.ciudad) return res.status(400).json({ message: "La ciudad de la dirección es obligatoria" });
        if (!facturaDatos.direccionCliente.departamento) return res.status(400).json({ message: "El departamento de la dirección es obligatorio" });
        if (!facturaDatos.subtotal && facturaDatos.subtotal !== 0) return res.status(400).json({ message: "El subtotal es obligatorio" });
        if (!facturaDatos.total && facturaDatos.total !== 0) return res.status(400).json({ message: "El total es obligatorio" });

        // Verificar que el número de factura no exista (si se proporciona)
        if (facturaDatos.numeroFactura) {
            const existsFactura = await ventasModel.findOne({ 
                'facturaDatos.numeroFactura': facturaDatos.numeroFactura 
            });
            if (existsFactura) {
                return res.status(400).json({ 
                    message: "Número de factura ya existe" 
                });
            }
        }

        // Crear nueva instancia de venta
        const newVenta = new ventasModel({
            carritoId,
            empleadoId,
            sucursalId,
            fecha: fecha || new Date(), // Usa fecha actual si no se proporciona
            estado: estado || 'pendiente', // Estado por defecto
            datosPago,
            facturaDatos,
            observaciones
        });

        const savedVenta = await newVenta.save();
        
        // Pobla las referencias para la respuesta completa
        const populatedVenta = await ventasModel.findById(savedVenta._id)
            .populate('carritoId')
            .populate('empleadoId', 'nombre apellido')
            .populate('sucursalId', 'nombre')
            .populate('facturaDatos.clienteId', 'nombre apellido');

        res.status(201).json({ 
            message: "Venta creada exitosamente", 
            venta: populatedVenta 
        });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error creando venta: " + error.message });
    }
};

// DELETE - Eliminar venta
ventasController.deleteVenta = async (req, res) => {
    try {
        // Busca y elimina venta por ID
        const deletedVenta = await ventasModel.findByIdAndDelete(req.params.id);

        if (!deletedVenta) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        res.json({ message: "Venta eliminada exitosamente" });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error eliminando venta: " + error.message });
    }
};

// UPDATE - Actualizar venta
ventasController.updateVenta = async (req, res) => {
    const {
        carritoId,
        empleadoId,
        sucursalId,
        fecha,
        estado,
        datosPago,
        facturaDatos,
        observaciones
    } = req.body;

    try {
        // Verificar que el número de factura no exista en otra venta (si se está actualizando)
        if (facturaDatos && facturaDatos.numeroFactura) {
            const existsFactura = await ventasModel.findOne({
                'facturaDatos.numeroFactura': facturaDatos.numeroFactura,
                _id: { $ne: req.params.id } // Excluye el documento actual
            });
            if (existsFactura) {
                return res.status(400).json({ 
                    message: "Número de factura ya existe en otra venta" 
                });
            }
        }

        // Prepara objeto con datos a actualizar
        const updateData = {
            carritoId,
            empleadoId,
            sucursalId,
            fecha,
            estado,
            datosPago,
            facturaDatos,
            observaciones
        };

        // Remover campos undefined del objeto de actualización
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );

        // Busca, actualiza y retorna venta modificada
        const updatedVenta = await ventasModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true } // Retorna documento actualizado
        ).populate('carritoId')
         .populate('empleadoId', 'nombre apellido')
         .populate('sucursalId', 'nombre')
         .populate('facturaDatos.clienteId', 'nombre apellido');

        if (!updatedVenta) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        res.json({ 
            message: "Venta actualizada exitosamente", 
            venta: updatedVenta 
        });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error actualizando venta: " + error.message });
    }
};

// GET by ID - Obtener venta por ID
ventasController.getVentaById = async (req, res) => {
    try {
        // Busca venta por ID y puebla todas las referencias
        const venta = await ventasModel.findById(req.params.id)
            .populate('carritoId')
            .populate('empleadoId', 'nombre apellido correo cargo')
            .populate('sucursalId', 'nombre direccion telefono')
            .populate('facturaDatos.clienteId', 'nombre apellido correo dui direccion');

        if (!venta) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        res.json(venta);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo venta: " + error.message });
    }
};

// GET by Estado - Obtener ventas por estado
ventasController.getVentasByEstado = async (req, res) => {
    try {
        const { estado } = req.params;
        
        // Filtra ventas por estado específico
        const ventas = await ventasModel.find({ estado })
            .populate('empleadoId', 'nombre apellido')
            .populate('sucursalId', 'nombre')
            .populate('facturaDatos.clienteId', 'nombre apellido')
            .sort({ createdAt: -1 });

        res.json(ventas);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo ventas por estado: " + error.message });
    }
};

// GET by Sucursal - Obtener ventas por sucursal
ventasController.getVentasBySucursal = async (req, res) => {
    try {
        const { sucursalId } = req.params;
        
        // Filtra ventas por ID de sucursal específica
        const ventas = await ventasModel.find({ sucursalId })
            .populate('empleadoId', 'nombre apellido')
            .populate('facturaDatos.clienteId', 'nombre apellido')
            .sort({ createdAt: -1 });

        res.json(ventas);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo ventas por sucursal: " + error.message });
    }
};

// GET by Empleado - Obtener ventas por empleado
ventasController.getVentasByEmpleado = async (req, res) => {
    try {
        const { empleadoId } = req.params;
        
        // Filtra ventas por ID de empleado específico
        const ventas = await ventasModel.find({ empleadoId })
            .populate('sucursalId', 'nombre')
            .populate('facturaDatos.clienteId', 'nombre apellido')
            .sort({ createdAt: -1 });

        res.json(ventas);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo ventas por empleado: " + error.message });
    }
};

// GET by Fecha - Obtener ventas por rango de fechas
ventasController.getVentasByFecha = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        
        // Construir query dinámico para filtro por fechas
        let query = {};
        if (fechaInicio && fechaFin) {
            query.fecha = {
                $gte: new Date(fechaInicio),
                $lte: new Date(fechaFin)
            };
        }

        // Busca ventas dentro del rango de fechas
        const ventas = await ventasModel.find(query)
            .populate('empleadoId', 'nombre apellido')
            .populate('sucursalId', 'nombre')
            .populate('facturaDatos.clienteId', 'nombre apellido')
            .sort({ fecha: -1 }); // Ordena por fecha descendente

        res.json(ventas);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo ventas por fecha: " + error.message });
    }
};

export default ventasController;