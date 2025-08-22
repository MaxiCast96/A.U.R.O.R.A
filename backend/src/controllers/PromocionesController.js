import promocionModel from "../models/Promociones.js";
import { v2 as cloudinary } from 'cloudinary';

const promocionesController = {};

// SELECT - Obtener todas las promociones
promocionesController.getPromociones = async (req, res) => {
    try {
        const promociones = await promocionModel
            .find()
            .populate('categoriasAplicables', 'nombre')
            .populate('lentesAplicables', 'nombre')
            .sort({ prioridad: -1, createdAt: -1 });
        
        res.json(promociones);
    } catch (error) {
        console.error("Error obteniendo promociones:", error);
        res.status(500).json({ message: "Error obteniendo promociones: " + error.message });
    }
};

// SELECT - Obtener promociones activas
promocionesController.getPromocionesActivas = async (req, res) => {
    try {
        const fechaActual = new Date();
        
        const promociones = await promocionModel
            .find({
                activo: true,
                fechaInicio: { $lte: fechaActual },
                fechaFin: { $gte: fechaActual },
                $or: [
                    { limiteUsos: null },
                    { $expr: { $lt: ['$usos', '$limiteUsos'] } }
                ]
            })
            .populate('categoriasAplicables', 'nombre')
            .populate('lentesAplicables', 'nombre')
            .sort({ prioridad: -1, createdAt: -1 });
        
        res.json(promociones);
    } catch (error) {
        console.error("Error obteniendo promociones activas:", error);
        res.status(500).json({ message: "Error obteniendo promociones activas: " + error.message });
    }
};

// NUEVO - Obtener promociones para carrusel
promocionesController.getPromocionesCarrusel = async (req, res) => {
    try {
        const fechaActual = new Date();
        
        const promociones = await promocionModel
            .find({
                activo: true,
                mostrarEnCarrusel: true,
                fechaInicio: { $lte: fechaActual },
                fechaFin: { $gte: fechaActual },
                $or: [
                    { limiteUsos: null },
                    { $expr: { $lt: ['$usos', '$limiteUsos'] } }
                ]
            })
            .populate('categoriasAplicables', 'nombre')
            .populate('lentesAplicables', 'nombre')
            .sort({ prioridad: -1, createdAt: -1 })
            .limit(10); // Máximo 10 promociones en carrusel
        
        res.json(promociones);
    } catch (error) {
        console.error("Error obteniendo promociones del carrusel:", error);
        res.status(500).json({ message: "Error obteniendo promociones del carrusel: " + error.message });
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
        imagenPromocion,
        imagenMetadata,
        activo,
        prioridad,
        mostrarEnCarrusel,
        limiteUsos
    } = req.body;

    try {
        // Validaciones básicas
        if (!nombre?.trim()) return res.status(400).json({ message: "El nombre es obligatorio" });
        if (!descripcion?.trim()) return res.status(400).json({ message: "La descripción es obligatoria" });
        if (!tipoDescuento) return res.status(400).json({ message: "El tipo de descuento es obligatorio" });
        if (!valorDescuento || valorDescuento <= 0) return res.status(400).json({ message: "El valor del descuento debe ser mayor a 0" });
        if (!aplicaA) return res.status(400).json({ message: "El campo 'aplicaA' es obligatorio" });
        if (!fechaInicio) return res.status(400).json({ message: "La fecha de inicio es obligatoria" });
        if (!fechaFin) return res.status(400).json({ message: "La fecha de fin es obligatoria" });
        if (!codigoPromo?.trim()) return res.status(400).json({ message: "El código de promoción es obligatorio" });

        // Verificar código único
        const existsPromocion = await promocionModel.findOne({ 
            codigoPromo: codigoPromo.trim().toUpperCase() 
        });
        if (existsPromocion) {
            return res.status(400).json({ message: "Ya existe una promoción con este código" });
        }

        // Validar fechas
        const fechaInicioDate = new Date(fechaInicio);
        const fechaFinDate = new Date(fechaFin);
        
        if (fechaFinDate <= fechaInicioDate) {
            return res.status(400).json({ message: "La fecha de fin debe ser posterior a la fecha de inicio" });
        }

        // Validar aplicación específica
        if (aplicaA === 'categoria' && (!categoriasAplicables || categoriasAplicables.length === 0)) {
            return res.status(400).json({ message: "Debe especificar al menos una categoría cuando la promoción aplica a categorías" });
        }

        if (aplicaA === 'lente' && (!lentesAplicables || lentesAplicables.length === 0)) {
            return res.status(400).json({ message: "Debe especificar al menos un lente cuando la promoción aplica a lentes específicos" });
        }

        // Validar descuento por porcentaje
        if (tipoDescuento === 'porcentaje' && valorDescuento > 100) {
            return res.status(400).json({ message: "El descuento por porcentaje no puede ser mayor a 100%" });
        }

        // Crear nueva promoción
        const newPromocion = new promocionModel({
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            tipoDescuento,
            valorDescuento: Number(valorDescuento),
            aplicaA,
            categoriasAplicables: aplicaA === 'categoria' ? categoriasAplicables : [],
            lentesAplicables: aplicaA === 'lente' ? lentesAplicables : [],
            fechaInicio: fechaInicioDate,
            fechaFin: fechaFinDate,
            codigoPromo: codigoPromo.trim().toUpperCase(),
            imagenPromocion: imagenPromocion || null,
            imagenMetadata: imagenMetadata || {},
            activo: activo !== undefined ? activo : true,
            prioridad: prioridad || 0,
            mostrarEnCarrusel: mostrarEnCarrusel !== undefined ? mostrarEnCarrusel : true,
            limiteUsos: limiteUsos || null
        });

        await newPromocion.save();

        // Popolate para la respuesta
        await newPromocion.populate('categoriasAplicables lentesAplicables');

        res.status(201).json({ 
            message: "Promoción creada exitosamente", 
            promocion: newPromocion 
        });

    } catch (error) {
        console.error("Error creando promoción:", error);
        res.status(500).json({ message: "Error creando promoción: " + error.message });
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
        imagenPromocion,
        imagenMetadata,
        activo,
        prioridad,
        mostrarEnCarrusel,
        limiteUsos
    } = req.body;

    try {
        // Buscar la promoción actual
        const promocionActual = await promocionModel.findById(req.params.id);
        if (!promocionActual) {
            return res.status(404).json({ message: "Promoción no encontrada" });
        }

        // Validaciones básicas (igual que en create)
        if (!nombre?.trim()) return res.status(400).json({ message: "El nombre es obligatorio" });
        if (!descripcion?.trim()) return res.status(400).json({ message: "La descripción es obligatoria" });
        if (!tipoDescuento) return res.status(400).json({ message: "El tipo de descuento es obligatorio" });
        if (!valorDescuento || valorDescuento <= 0) return res.status(400).json({ message: "El valor del descuento debe ser mayor a 0" });
        if (!aplicaA) return res.status(400).json({ message: "El campo 'aplicaA' es obligatorio" });
        if (!fechaInicio) return res.status(400).json({ message: "La fecha de inicio es obligatoria" });
        if (!fechaFin) return res.status(400).json({ message: "La fecha de fin es obligatoria" });
        if (!codigoPromo?.trim()) return res.status(400).json({ message: "El código de promoción es obligatorio" });

        // Verificar código único (excluyendo el actual)
        const existsPromocion = await promocionModel.findOne({
            codigoPromo: codigoPromo.trim().toUpperCase(),
            _id: { $ne: req.params.id }
        });
        if (existsPromocion) {
            return res.status(400).json({ message: "Otra promoción con este código ya existe" });
        }

        // Validar fechas
        const fechaInicioDate = new Date(fechaInicio);
        const fechaFinDate = new Date(fechaFin);
        
        if (fechaFinDate <= fechaInicioDate) {
            return res.status(400).json({ message: "La fecha de fin debe ser posterior a la fecha de inicio" });
        }

        // Validar descuento por porcentaje
        if (tipoDescuento === 'porcentaje' && valorDescuento > 100) {
            return res.status(400).json({ message: "El descuento por porcentaje no puede ser mayor a 100%" });
        }

        // Validar aplicación específica
        if (aplicaA === 'categoria' && (!categoriasAplicables || categoriasAplicables.length === 0)) {
            return res.status(400).json({ message: "Debe especificar al menos una categoría cuando la promoción aplica a categorías" });
        }

        if (aplicaA === 'lente' && (!lentesAplicables || lentesAplicables.length === 0)) {
            return res.status(400).json({ message: "Debe especificar al menos un lente cuando la promoción aplica a lentes específicos" });
        }

        // Si se cambió la imagen y había una anterior, eliminar la anterior de Cloudinary
        if (imagenPromocion !== promocionActual.imagenPromocion && promocionActual.imagenMetadata?.publicId) {
            try {
                await cloudinary.uploader.destroy(promocionActual.imagenMetadata.publicId);
            } catch (cloudinaryError) {
                console.warn("Error eliminando imagen anterior de Cloudinary:", cloudinaryError);
            }
        }

        // Actualizar promoción
        const updatedPromocion = await promocionModel.findByIdAndUpdate(
            req.params.id,
            {
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                tipoDescuento,
                valorDescuento: Number(valorDescuento),
                aplicaA,
                categoriasAplicables: aplicaA === 'categoria' ? categoriasAplicables : [],
                lentesAplicables: aplicaA === 'lente' ? lentesAplicables : [],
                fechaInicio: fechaInicioDate,
                fechaFin: fechaFinDate,
                codigoPromo: codigoPromo.trim().toUpperCase(),
                imagenPromocion: imagenPromocion || null,
                imagenMetadata: imagenMetadata || {},
                activo: activo !== undefined ? activo : true,
                prioridad: prioridad !== undefined ? prioridad : 0,
                mostrarEnCarrusel: mostrarEnCarrusel !== undefined ? mostrarEnCarrusel : true,
                limiteUsos: limiteUsos || null
            },
            { new: true, runValidators: true }
        ).populate('categoriasAplicables lentesAplicables');

        res.json({ 
            message: "Promoción actualizada exitosamente", 
            promocion: updatedPromocion 
        });

    } catch (error) {
        console.error("Error actualizando promoción:", error);
        res.status(500).json({ message: "Error actualizando promoción: " + error.message });
    }
};

// DELETE - Eliminar promoción
promocionesController.deletePromocion = async (req, res) => {
    try {
        const promocion = await promocionModel.findById(req.params.id);
        
        if (!promocion) {
            return res.status(404).json({ message: "Promoción no encontrada" });
        }

        // Eliminar imagen de Cloudinary si existe
        if (promocion.imagenMetadata?.publicId) {
            try {
                await cloudinary.uploader.destroy(promocion.imagenMetadata.publicId);
            } catch (cloudinaryError) {
                console.warn("Error eliminando imagen de Cloudinary:", cloudinaryError);
            }
        }

        await promocionModel.findByIdAndDelete(req.params.id);

        res.json({ message: "Promoción eliminada exitosamente" });
    } catch (error) {
        console.error("Error eliminando promoción:", error);
        res.status(500).json({ message: "Error eliminando promoción: " + error.message });
    }
};

// GET by ID - Obtener promoción por ID
promocionesController.getPromocionById = async (req, res) => {
    try {
        const promocion = await promocionModel
            .findById(req.params.id)
            .populate('categoriasAplicables', 'nombre')
            .populate('lentesAplicables', 'nombre');

        if (!promocion) {
            return res.status(404).json({ message: "Promoción no encontrada" });
        }

        res.json(promocion);
    } catch (error) {
        console.error("Error obteniendo promoción:", error);
        res.status(500).json({ message: "Error obteniendo promoción: " + error.message });
    }
};

// GET by codigo - Obtener promoción por código
promocionesController.getPromocionByCodigo = async (req, res) => {
    try {
        const { codigo } = req.params;
        
        const promocion = await promocionModel
            .findOne({ 
                codigoPromo: codigo.toUpperCase(),
                activo: true 
            })
            .populate('categoriasAplicables', 'nombre')
            .populate('lentesAplicables', 'nombre');

        if (!promocion) {
            return res.status(404).json({ message: "Promoción no encontrada o inactiva" });
        }

        // Verificar vigencia
        if (!promocion.estaVigente()) {
            const estado = promocion.getEstado();
            return res.status(400).json({ 
                message: `Promoción no disponible. Estado: ${estado}` 
            });
        }

        res.json(promocion);
    } catch (error) {
        console.error("Error obteniendo promoción por código:", error);
        res.status(500).json({ message: "Error obteniendo promoción: " + error.message });
    }
};

// NUEVO - Usar promoción (incrementar contador)
promocionesController.usarPromocion = async (req, res) => {
    try {
        const { codigo } = req.params;
        
        const promocion = await promocionModel.findOne({ 
            codigoPromo: codigo.toUpperCase(),
            activo: true 
        });

        if (!promocion) {
            return res.status(404).json({ message: "Promoción no encontrada o inactiva" });
        }

        if (!promocion.estaVigente()) {
            return res.status(400).json({ 
                message: `Promoción no disponible. Estado: ${promocion.getEstado()}` 
            });
        }

        // Incrementar contador de usos
        promocion.usos += 1;
        await promocion.save();

        res.json({ 
            message: "Promoción aplicada exitosamente",
            promocion: {
                _id: promocion._id,
                nombre: promocion.nombre,
                tipoDescuento: promocion.tipoDescuento,
                valorDescuento: promocion.valorDescuento,
                usos: promocion.usos
            }
        });

    } catch (error) {
        console.error("Error usando promoción:", error);
        res.status(500).json({ message: "Error usando promoción: " + error.message });
    }
};

export default promocionesController;