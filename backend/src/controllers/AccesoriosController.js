import "../models/Marcas.js";
import "../models/Sucursales.js";
import "../models/Promociones.js";
import accesoriosModel from "../models/Accesorios.js";
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const accesoriosController = {};

// SELECT - Obtiene todos los accesorios con sus relaciones pobladas
accesoriosController.getAccesorios = async (req, res) => {
    try {
         // Busca todos los accesorios y puebla las referencias a marcas, promociones y sucursales
        const accesorios = await accesoriosModel.find()
            .populate('marcaId') // Obtiene datos completos de la marca
            .populate('promocionId') // Obtiene datos de promoción si existe
            .populate('sucursales.sucursalId'); // Obtiene datos de cada sucursal asociada
        res.json(accesorios);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo accesorios: " + error.message });
    }
};

// INSERT - Crea un nuevo accesorio con imágenes y datos básicos
accesoriosController.createAccesorios = async (req, res) => {
    // Parsear sucursales si viene como string (form-data)
    let sucursales = req.body.sucursales;
    if (typeof sucursales === "string") {
        try {
            sucursales = JSON.parse(sucursales); // Convierte string a objeto
        } catch (e) {
            return res.json({ message: "Error en el formato de sucursales" });
        }
    }

    const {
        nombre,
        descripcion,
        tipo,
        marcaId,
        material,
        color,
        precioBase,
        precioActual,
        enPromocion,
        promocionId
    } = req.body;

    let imagenesURLs = [];

    try {
        // Subir imágenes a Cloudinary si se enviaron archivos
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Sube cada archivo a la carpeta "accesorios" en Cloudinary
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "accesorios",
                    allowed_formats: ["png", "jpg", "jpeg", "webp"] // Formatos permitidos
                });
                imagenesURLs.push(result.secure_url); // Guarda la URL segura
            }
        } else if (req.body.imagenes) {
           // Si se enviaron URLs directamente las convierte a array
            imagenesURLs = Array.isArray(req.body.imagenes) ? req.body.imagenes : [req.body.imagenes];
        }

        // Crea nueva instancia del modelo con todos los datos
        const newAccesorio = new accesoriosModel({
            nombre,
            descripcion,
            tipo,
            marcaId,
            material,
            color,
            precioBase,
            precioActual,
            imagenes: imagenesURLs,
            enPromocion: enPromocion || false,
            promocionId: enPromocion ? promocionId : undefined,
            sucursales: sucursales || []
        });

        await newAccesorio.save();
        res.json({ message: "Accesorio guardado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error creando accesorio: " + error.message });
    }
};

// DELETE - Elimina un accesorio por ID
accesoriosController.deleteAccesorios = async (req, res) => {
    try {
        // Busca y elimina el accesorio por ID
        const deleteAccesorio = await accesoriosModel.findByIdAndDelete(req.params.id);
        if (!deleteAccesorio) {
            return res.json({ message: "Accesorio no encontrado" });
        }
        res.json({ message: "Accesorio eliminado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error eliminando accesorio: " + error.message });
    }
};

// UPDATE - Actualiza un accesorio existente con nuevos datos e imágenes
accesoriosController.updateAccesorios = async (req, res) => {
    // Parsear sucursales si viene como string (form-data)
    let sucursales = req.body.sucursales; // Mantiene imágenes existentes por defecto
    if (typeof sucursales === "string") {
        try {
            // Sube nuevas imágenes a Cloudinary si se enviaron archivos
            sucursales = JSON.parse(sucursales);
        } catch (e) {
            return res.json({ message: "Error en el formato de sucursales" });
        }
    }

    const {
        nombre,
        descripcion,
        tipo,
        marcaId,
        material,
        color,
        precioBase,
        precioActual,
        enPromocion,
        promocionId
    } = req.body;

    let imagenesURLs = req.body.imagenes || [];

    try {
        // Subir nuevas imágenes a Cloudinary si se enviaron archivos
        if (req.files && req.files.length > 0) {
            imagenesURLs = []; // Limpia array para nuevas imágenes
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "accesorios",
                    allowed_formats: ["png", "jpg", "jpeg", "webp"]
                });
                imagenesURLs.push(result.secure_url);
            }
        }

           // Prepara objeto con datos a actualizar
        const updateData = {
            nombre,
            descripcion,
            tipo,
            marcaId,
            material,
            color,
            precioBase,
            precioActual,
            imagenes: imagenesURLs,
            enPromocion: enPromocion || false,
            sucursales: sucursales || []
        };

        // Maneja promoción: agrega o elimina según el estado
        if (enPromocion && promocionId) {
            updateData.promocionId = promocionId; // Asigna promoción
        } else {
            updateData.$unset = { promocionId: "" }; // Elimina promoción
        }

        // Actualiza el documento y retorna la versión nueva
        const updatedAccesorio = await accesoriosModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true } // Retorna documento actualizado
        );

        if (!updatedAccesorio) {
            return res.json({ message: "Accesorio no encontrado" });
        }

        res.json({ message: "Accesorio actualizado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando accesorio: " + error.message });
    }
};

// SELECT by ID - Obtiene un accesorio específico por ID
accesoriosController.getAccesorioById = async (req, res) => {
    try {
        // Busca accesorio por ID y puebla todas las referencias
        const accesorio = await accesoriosModel.findById(req.params.id)
            .populate('marcaId')
            .populate({
                path: 'promocionId',
                model: 'Promociones'
            })
            .populate('sucursales.sucursalId');
        if (!accesorio) {
            return res.json({ message: "Accesorio no encontrado" });
        }
        res.json(accesorio);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo accesorio: " + error.message });
    }
};

// SELECT by Promoción - Obtiene accesorios que están en promoción
accesoriosController.getAccesoriosByMarca = async (req, res) => {
    try {
        // Filtra accesorios por ID de marca específica
        const accesorios = await accesoriosModel.find({ marcaId: req.params.marcaId })
            .populate('marcaId')
            .populate({
                path: 'promocionId',
                model: 'Promociones'
            })
            .populate('sucursales.sucursalId');
        res.json(accesorios);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo accesorios por marca: " + error.message });
    }
};

// SELECT by Promoción - Obtiene accesorios que están en promoción
accesoriosController.getAccesoriosEnPromocion = async (req, res) => {
    try {
           // Filtra solo accesorios marcados como en promoción
        const accesorios = await accesoriosModel.find({ enPromocion: true })
            .populate('marcaId')
            .populate({
                path: 'promocionId',
                model: 'Promociones'
            })
            .populate('sucursales.sucursalId');
        res.json(accesorios);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo accesorios en promoción: " + error.message });
    }
};

export default accesoriosController;