import promocionModel from "../models/Promociones.js";

const promocionesController = {};

// SELECT - Obtener todas las promociones
promocionesController.getPromociones = async (req, res) => {
    try {
        // Busca todas las promociones y ordena por fecha de creación descendente
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
        
        // Filtra promociones activas y dentro del rango de fechas válidas
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
        // Validar campos obligatorios
        if (!nombre) return res.json({ message: "El nombre es obligatorio" });
        if (!descripcion) return res.json({ message: "La descripción es obligatoria" });
        if (!tipoDescuento) return res.json({ message: "El tipo de descuento es obligatorio" });
        if (!valorDescuento) return res.json({ message: "El valor del descuento es obligatorio" });
        if (!aplicaA) return res.json({ message: "El campo 'aplicaA' es obligatorio" });
        if (!fechaInicio) return res.json({ message: "La fecha de inicio es obligatoria" });
        if (!fechaFin) return res.json({ message: "La fecha de fin es obligatoria" });
        if (!codigoPromo) return res.json({ message: "El código de promoción es obligatorio" });

        // Verificar si ya existe una promoción con el mismo código
        const existsPromocion = await promocionModel.findOne({ codigoPromo: codigoPromo.toUpperCase() });
        if (existsPromocion) {
            return res.json({ message: "Ya existe una promoción con este código" });
        }

        // Validar que las fechas sean lógicas
        const fechaInicioDate = new Date(fechaInicio);
        const fechaFinDate = new Date(fechaFin);
        
        if (fechaFinDate <= fechaInicioDate) {
            return res.json({ message: "La fecha de fin debe ser posterior a la fecha de inicio" });
        }

        // Validar que se proporcionen las categorías cuando aplica a categorías
        if (aplicaA === 'categoria' && (!categoriasAplicables || categoriasAplicables.length === 0)) {
            return res.json({ message: "Debe especificar al menos una categoría cuando la promoción aplica a categorías" });
        }

        // Validar que se proporcionen los lentes cuando aplica a lentes específicos
        if (aplicaA === 'lente' && (!lentesAplicables || lentesAplicables.length === 0)) {
            return res.json({ message: "Debe especificar al menos un lente cuando la promoción aplica a lentes específicos" });
        }

        // Validar valor de descuento por porcentaje
        if (tipoDescuento === 'porcentaje' && valorDescuento > 100) {
            return res.json({ message: "El descuento por porcentaje no puede ser mayor a 100%" });
        }

        // Validar que el valor del descuento sea positivo
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
        // Busca y elimina promoción por ID
        const deletedPromocion = await promocionModel.findByIdAndDelete(req.params.id);

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
        // Validar campos obligatorios
        if (!nombre) return res.json({ message: "El nombre es obligatorio" });
        if (!descripcion) return res.json({ message: "La descripción es obligatoria" });
        if (!tipoDescuento) return res.json({ message: "El tipo de descuento es obligatorio" });
        if (!valorDescuento) return res.json({ message: "El valor del descuento es obligatorio" });
        if (!aplicaA) return res.json({ message: "El campo 'aplicaA' es obligatorio" });
        if (!fechaInicio) return res.json({ message: "La fecha de inicio es obligatoria" });
        if (!fechaFin) return res.json({ message: "La fecha de fin es obligatoria" });
        if (!codigoPromo) return res.json({ message: "El código de promoción es obligatorio" });

        // Verificar que no exista otra promoción con el mismo código
        const existsPromocion = await promocionModel.findOne({
            codigoPromo: codigoPromo.toUpperCase(),
            _id: { $ne: req.params.id } // Excluye el documento actual
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

        // Validar valor de descuento por porcentaje
        if (tipoDescuento === 'porcentaje' && valorDescuento > 100) {
            return res.json({ message: "El descuento por porcentaje no puede ser mayor a 100%" });
        }

        // Validar que el valor del descuento sea positivo
        if (valorDescuento <= 0) {
            return res.json({ message: "El valor del descuento debe ser mayor a 0" });
        }

        // Validar que se proporcionen las categorías cuando aplica a categorías
        if (aplicaA === 'categoria' && (!categoriasAplicables || categoriasAplicables.length === 0)) {
            return res.json({ message: "Debe especificar al menos una categoría cuando la promoción aplica a categorías" });
        }

        // Validar que se proporcionen los lentes cuando aplica a lentes específicos
        if (aplicaA === 'lente' && (!lentesAplicables || lentesAplicables.length === 0)) {
            return res.json({ message: "Debe especificar al menos un lente cuando la promoción aplica a lentes específicos" });
        }

        // Prepara objeto con datos a actualizar
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

        // Remover campos undefined del objeto de actualización
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );

        // Busca, actualiza y retorna promoción modificada
        const updatedPromocion = await promocionModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true } // Retorna documento actualizado y ejecuta validadores
        );

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
        // Busca promoción por ID específico
        const promocion = await promocionModel.findById(req.params.id);

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
        
        // Busca promoción por código y que esté activa
        const promocion = await promocionModel.findOne({ 
            codigoPromo: codigo.toUpperCase(),
            activo: true 
        });

        if (!promocion) {
            return res.json({ message: "Promoción no encontrada o inactiva" });
        }

        // Verificar si la promoción está dentro del período de vigencia
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