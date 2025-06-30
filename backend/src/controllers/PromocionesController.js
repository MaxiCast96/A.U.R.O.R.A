import promocionModel from "../models/Promociones.js";

const promocionesController = {};

// SELECT - Obtener todas las promociones
promocionesController.getPromociones = async (req, res) => {
    try {
        const promociones = await promocionModel.find().sort({ createdAt: -1 });
        res.json(promociones);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo promociones: " + error.message });
    }
};

// SELECT - Obtener promociones activas
promocionesController.getPromocionesActivas = async (req, res) => {
    try {
        const fechaActual = new Date();
        const promociones = await promocionModel.find({
            activo: true,
            fechaInicio: { $lte: fechaActual },
            fechaFin: { $gte: fechaActual }
        }).sort({ createdAt: -1 });
        
        res.json(promociones);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo promociones activas: " + error.message });
    }
};

// INSERT - Crear nueva promoción
promocionesController.createPromocion = async (req, res) => {
    const {
        nombre,
        descripcion,
        tipoDescuento,
        valorDescuento,
        aplicaA,
        categoriasAplicables,
        lentesAplicables,
        fechaInicio,
        fechaFin,
        codigoPromo,
        activo
    } = req.body;

    try {
        // Verificar si ya existe una promoción con el mismo código
        const existsPromocion = await promocionModel.findOne({ codigoPromo: codigoPromo.toUpperCase() });
        if (existsPromocion) {
            return res.json({ message: "Ya existe una promoción con este código" });
        }

        // Validar fechas
        const fechaInicioDate = new Date(fechaInicio);
        const fechaFinDate = new Date(fechaFin);
        
        if (fechaFinDate <= fechaInicioDate) {
            return res.json({ message: "La fecha de fin debe ser posterior a la fecha de inicio" });
        }

        // Validar que se proporcionen las categorías o lentes según corresponda
        if (aplicaA === 'categoria' && (!categoriasAplicables || categoriasAplicables.length === 0)) {
            return res.json({ message: "Debe especificar al menos una categoría cuando la promoción aplica a categorías" });
        }

        if (aplicaA === 'lente' && (!lentesAplicables || lentesAplicables.length === 0)) {
            return res.json({ message: "Debe especificar al menos un lente cuando la promoción aplica a lentes específicos" });
        }

        // Validar valor de descuento
        if (tipoDescuento === 'porcentaje' && valorDescuento > 100) {
            return res.json({ message: "El descuento por porcentaje no puede ser mayor a 100%" });
        }

        if (valorDescuento <= 0) {
            return res.json({ message: "El valor del descuento debe ser mayor a 0" });
        }

        // Crear nueva instancia de promoción
        const newPromocion = new promocionModel({
            nombre,
            descripcion,
            tipoDescuento,
            valorDescuento,
            aplicaA,
            categoriasAplicables: aplicaA === 'categoria' ? categoriasAplicables : [],
            lentesAplicables: aplicaA === 'lente' ? lentesAplicables : [],
            fechaInicio: fechaInicioDate,
            fechaFin: fechaFinDate,
            codigoPromo: codigoPromo.toUpperCase(),
            activo: activo !== undefined ? activo : true
        });

        // Guardar la promoción en la base de datos
        await newPromocion.save();

        res.json({ message: "Promoción creada exitosamente", promocion: newPromocion });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error creando promoción: " + error.message });
    }
};

// DELETE - Eliminar promoción
promocionesController.deletePromocion = async (req, res) => {
    try {
        // Buscar y eliminar la promoción por ID
        const deletedPromocion = await promocionModel.findByIdAndDelete(req.params.id);

        // Verificar si la promoción existía
        if (!deletedPromocion) {
            return res.json({ message: "Promoción no encontrada" });
        }

        res.json({ message: "Promoción eliminada exitosamente" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error eliminando promoción: " + error.message });
    }
};

// UPDATE - Actualizar promoción
promocionesController.updatePromocion = async (req, res) => {
    const {
        nombre,
        descripcion,
        tipoDescuento,
        valorDescuento,
        aplicaA,
        categoriasAplicables,
        lentesAplicables,
        fechaInicio,
        fechaFin,
        codigoPromo,
        activo
    } = req.body;

    try {
        // Verificar si existe otra promoción con el mismo código
        const existsPromocion = await promocionModel.findOne({
            codigoPromo: codigoPromo.toUpperCase(),
            _id: { $ne: req.params.id }
        });
        if (existsPromocion) {
            return res.json({ message: "Otra promoción con este código ya existe" });
        }

        // Validar fechas si se proporcionan
        if (fechaInicio && fechaFin) {
            const fechaInicioDate = new Date(fechaInicio);
            const fechaFinDate = new Date(fechaFin);
            
            if (fechaFinDate <= fechaInicioDate) {
                return res.json({ message: "La fecha de fin debe ser posterior a la fecha de inicio" });
            }
        }

        // Validar valor de descuento
        if (tipoDescuento === 'porcentaje' && valorDescuento > 100) {
            return res.json({ message: "El descuento por porcentaje no puede ser mayor a 100%" });
        }

        if (valorDescuento <= 0) {
            return res.json({ message: "El valor del descuento debe ser mayor a 0" });
        }

        // Validar que se proporcionen las categorías o lentes según corresponda
        if (aplicaA === 'categoria' && (!categoriasAplicables || categoriasAplicables.length === 0)) {
            return res.json({ message: "Debe especificar al menos una categoría cuando la promoción aplica a categorías" });
        }

        if (aplicaA === 'lente' && (!lentesAplicables || lentesAplicables.length === 0)) {
            return res.json({ message: "Debe especificar al menos un lente cuando la promoción aplica a lentes específicos" });
        }

        let updateData = {
            nombre,
            descripcion,
            tipoDescuento,
            valorDescuento,
            aplicaA,
            categoriasAplicables: aplicaA === 'categoria' ? categoriasAplicables : [],
            lentesAplicables: aplicaA === 'lente' ? lentesAplicables : [],
            fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
            fechaFin: fechaFin ? new Date(fechaFin) : undefined,
            codigoPromo: codigoPromo ? codigoPromo.toUpperCase() : undefined,
            activo
        };

        // Remover campos undefined
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );

        // Buscar y actualizar la promoción por ID
        const updatedPromocion = await promocionModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        // Verificar si la promoción existía
        if (!updatedPromocion) {
            return res.json({ message: "Promoción no encontrada" });
        }

        res.json({ message: "Promoción actualizada exitosamente", promocion: updatedPromocion });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando promoción: " + error.message });
    }
};

// GET by ID - Obtener promoción por ID
promocionesController.getPromocionById = async (req, res) => {
    try {
        // Buscar promoción por ID
        const promocion = await promocionModel.findById(req.params.id);

        // Verificar si la promoción existe
        if (!promocion) {
            return res.json({ message: "Promoción no encontrada" });
        }

        res.json(promocion);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo promoción: " + error.message });
    }
};

// GET by codigo - Obtener promoción por código
promocionesController.getPromocionByCodigo = async (req, res) => {
    try {
        const { codigo } = req.params;
        
        // Buscar promoción por código
        const promocion = await promocionModel.findOne({ 
            codigoPromo: codigo.toUpperCase(),
            activo: true 
        });

        // Verificar si la promoción existe
        if (!promocion) {
            return res.json({ message: "Promoción no encontrada o inactiva" });
        }

        // Verificar si la promoción está vigente
        const fechaActual = new Date();
        if (fechaActual < promocion.fechaInicio || fechaActual > promocion.fechaFin) {
            return res.json({ message: "Promoción no vigente" });
        }

        res.json(promocion);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo promoción: " + error.message });
    }
};

export default promocionesController;