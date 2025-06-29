import ventasModel from "../models/Ventas.js";

const ventasController = {};

// SELECT - Obtener todas las ventas
ventasController.getVentas = async (req, res) => {
    try {
        const ventas = await ventasModel.find()
            .populate('carritoId')
            .populate('empleadoId', 'nombre apellido correo')
            .populate('sucursalId', 'nombre direccion')
            .populate('facturaDatos.clienteId', 'nombre apellido correo')
            .sort({ createdAt: -1 });
        
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
        // Validar que el carrito, empleado y sucursal existan
        if (!carritoId || !empleadoId || !sucursalId) {
            return res.status(400).json({ 
                message: "carritoId, empleadoId y sucursalId son requeridos" 
            });
        }

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

        // Crear nueva venta
        const newVenta = new ventasModel({
            carritoId,
            empleadoId,
            sucursalId,
            fecha: fecha || new Date(),
            estado: estado || 'pendiente',
            datosPago,
            facturaDatos,
            observaciones
        });

        // Guardar la venta en la base de datos
        const savedVenta = await newVenta.save();
        
        // Poblar las referencias para la respuesta
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
                _id: { $ne: req.params.id }
            });
            if (existsFactura) {
                return res.status(400).json({ 
                    message: "Número de factura ya existe en otra venta" 
                });
            }
        }

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

        // Remover campos undefined
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );

        const updatedVenta = await ventasModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
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
        
        let query = {};
        if (fechaInicio && fechaFin) {
            query.fecha = {
                $gte: new Date(fechaInicio),
                $lte: new Date(fechaFin)
            };
        }

        const ventas = await ventasModel.find(query)
            .populate('empleadoId', 'nombre apellido')
            .populate('sucursalId', 'nombre')
            .populate('facturaDatos.clienteId', 'nombre apellido')
            .sort({ fecha: -1 });

        res.json(ventas);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo ventas por fecha: " + error.message });
    }
};

export default ventasController;