import clientesModel from "../models/Clientes.js";
import empleadosModel from "../models/Empleados.js";
import optometristaModel from "../models/Optometrista.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";
import { sendEmail } from "../services/mailer.js";

const clientesController = {};

/**
 * Obtiene todos los clientes de la base de datos
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Array} Lista de todos los clientes
 */

// Busca y retorna todos los clientes sin poblaciones
clientesController.getClientes = async (req, res) => {
    try {
        const clientes = await clientesModel.find();
        res.status(200).json(clientes);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo clientes: " + error.message });
    }
};

/**
 * Obtiene un cliente específico por su ID
 * @param {Object} req - Objeto de solicitud Express con params.id
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Cliente encontrado o mensaje de error
 */
clientesController.getClienteById = async (req, res) => {
    try {
        const cliente = await clientesModel.findById(req.params.id);
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        res.status(200).json(cliente);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo cliente: " + error.message });
    }
};

/**
 * Actualiza la información de un cliente existente
 * @param {Object} req - Objeto de solicitud Express con datos del cliente
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Mensaje de confirmación o error
 */
clientesController.updateClientes = async (req, res) => {
    const {
        nombre,
        apellido,
        edad,
        dui,
        telefono,
        correo,
        direccion,  // ← Recibir direccion como objeto
        estado
    } = req.body;

    // Validación de todos los campos obligatorios
    if (!nombre) return res.status(400).json({ message: "El nombre es obligatorio" });
    if (!apellido) return res.status(400).json({ message: "El apellido es obligatorio" });
    if (!edad) return res.status(400).json({ message: "La edad es obligatoria" });
    if (!dui) return res.status(400).json({ message: "El DUI es obligatorio" });
    if (!telefono) return res.status(400).json({ message: "El teléfono es obligatorio" });
    if (!correo) return res.status(400).json({ message: "El correo es obligatorio" });
    if (!direccion) return res.status(400).json({ message: "La dirección es obligatoria" });
    if (!direccion.calle) return res.status(400).json({ message: "La calle es obligatoria" });
    if (!direccion.ciudad) return res.status(400).json({ message: "La ciudad es obligatoria" });
    if (!direccion.departamento) return res.status(400).json({ message: "El departamento es obligatorio" });
    if (!estado) return res.status(400).json({ message: "El estado es obligatorio" });

    try {
        // Verificar si el correo ya existe en otro cliente
        const existingCliente = await clientesModel.findOne({ 
            correo, 
            _id: { $ne: req.params.id } 
        });
        if (existingCliente) {
            return res.status(400).json({ message: "El correo ya está registrado por otro cliente" });
        }

        // Verificar si el DUI ya existe en otro cliente
        const existingDui = await clientesModel.findOne({ 
            dui, 
            _id: { $ne: req.params.id } 
        });
        if (existingDui) {
            return res.status(400).json({ message: "El DUI ya está registrado por otro cliente" });
        }

        // Actualizar el cliente con los nuevos datos
        const updatedCliente = await clientesModel.findByIdAndUpdate(
            req.params.id,
            {
                nombre,
                apellido,
                edad,
                dui,
                telefono,
                correo: correo.trim().toLowerCase(),
                direccion: {
                    calle: direccion.calle,
                    ciudad: direccion.ciudad,
                    departamento: direccion.departamento
                },
                estado
            },
            { new: true }
        );

        if (!updatedCliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        res.status(200).json({ message: "Cliente actualizado exitosamente" });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error actualizando cliente: " + error.message });
    }
};

/**
 * Crea un nuevo cliente en la base de datos
 * @param {Object} req - Objeto de solicitud Express con datos del cliente
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Mensaje de confirmación o error
 */
clientesController.createClientes = async (req, res) => {
    let {
        nombre,
        apellido,
        edad,
        dui,
        telefono,
        correo,
        direccion,  // ← Recibir direccion como objeto
        password,
        estado
    } = req.body;
    correo = correo.trim().toLowerCase();

    // Validación básica de campos obligatorios
    if (!nombre || !apellido || !edad || !dui || !telefono || !correo || !direccion || !password || !estado) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Validar que direccion tenga las propiedades necesarias
    if (!direccion.calle || !direccion.ciudad || !direccion.departamento) {
        return res.status(400).json({ message: "La dirección debe incluir calle, ciudad y departamento" });
    }

    try {
        // Verificar si el correo ya está registrado
        const existsClientes = await clientesModel.findOne({ correo });
        if (existsClientes) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        // Verificar si el DUI ya está registrado
        const existsDui = await clientesModel.findOne({ dui });
        if (existsDui) {
            return res.status(400).json({ message: "El DUI ya está registrado" });
        }

        // Encriptar la contraseña usando bcrypt con salt de 10 rondas
        const passwordHash = await bcryptjs.hash(password, 10);

        // Crear nueva instancia del cliente
        const newCliente = new clientesModel({
            nombre,
            apellido,
            edad,
            dui,
            telefono,
            correo,
            direccion: {
                calle: direccion.calle,
                ciudad: direccion.ciudad,
                departamento: direccion.departamento
            },
            password: passwordHash,
            estado
        });

        await newCliente.save();
        res.status(201).json({ message: "Cliente creado exitosamente" });

    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error creando cliente: " + error.message });
    }
};
/**
 * Elimina un cliente de la base de datos
 * @param {Object} req - Objeto de solicitud Express con params.id
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Mensaje de confirmación o error
 */
clientesController.deleteClientes = async (req, res) => {
    try {
        // Evitar eliminarse a sí mismo si está autenticado
        try {
            const token = req.cookies?.aurora_auth_token;
            if (token) {
                const decoded = jsonwebtoken.verify(token, config.jwt.secret);
                if (decoded?.id && String(decoded.id) === String(req.params.id)) {
                    return res.status(400).json({ message: "No puedes eliminar tu propio usuario mientras estás logueado." });
                }
            }
        } catch (verifyErr) {
            // Si falla la verificación del token, continuar con la validación normal (no bloquear por esto)
        }
        const deletedClientes = await clientesModel.findByIdAndDelete(req.params.id);
        if (!deletedClientes) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        res.status(200).json({ message: "Cliente eliminado exitosamente" });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error eliminando Cliente: " + error.message });
    }
};

/**
 * Genera un token JWT para el usuario autenticado
 * @param {Object} userData - Datos del usuario para incluir en el token
 * @returns {string} Token JWT generado
 */
const generateJWTToken = (userData) => {
    return jsonwebtoken.sign(
        {
            id: userData.id,
            correo: userData.correo,
            rol: userData.rol,
            nombre: userData.nombre,
            apellido: userData.apellido
        },
        config.jwt.secret,
        { 
            expiresIn: config.jwt.expire,
            issuer: config.jwt.issuer,
            audience: config.jwt.audience
        }
    );
};

/**
 * Configura las opciones de la cookie JWT
 * @param {string} token - Token JWT a almacenar
 * @returns {Object} Opciones de configuración de la cookie
 */
const setJWTCookie = (res, token) => {
    const cookieOptions = {
        httpOnly: true, // Previene acceso desde JavaScript
        secure: process.env.NODE_ENV === 'production' ? true : false, // Solo HTTPS en producción
        sameSite: 'lax', // Permitir cross-origin seguro
        maxAge: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
        path: '/' // Cookie disponible en toda la aplicación
        // domain eliminado para compatibilidad con Render
    };

    res.cookie('aurora_auth_token', token, cookieOptions);
};

/**
 * Sistema de login unificado que verifica credenciales tanto en clientes como empleados
 * Permite autenticación con el mismo correo/contraseña para ambos tipos de usuario
 * @param {Object} req - Objeto de solicitud Express con correo y password
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Datos del usuario autenticado o mensaje de error
 */
clientesController.loginUnificado = async (req, res) => {
    let { correo, password } = req.body;
    correo = correo.trim().toLowerCase();
    
    // Validación de campos requeridos
    if (!correo || !password) {
        return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }
    
    console.log('Intento de login:', correo);
    
    try {
        // 1. Buscar en clientes (correo insensible a mayúsculas y espacios)
        const cliente = await clientesModel.findOne({ correo });
        if (cliente) {
            // Verificar contraseña usando bcrypt
            const isMatch = await bcryptjs.compare(password, cliente.password);
            console.log('Cliente encontrado:', cliente.correo, 'Password match:', isMatch);
            
            if (!isMatch) {
                return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
            }
            
            // Preparar datos del usuario para el token
            const userData = {
                id: cliente._id,
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                correo: cliente.correo,
                telefono: cliente.telefono,
                rol: 'Cliente'
            };

            // Generar token JWT
            const token = generateJWTToken(userData);
            
            // Configurar cookie segura
            setJWTCookie(res, token);
            
            // Retornar datos del cliente sin información sensible
            return res.status(200).json({
                success: true,
                message: 'Login exitoso',
                user: userData,
                token: token // También enviar token en respuesta para compatibilidad
            });
        }
        
        // 2. Buscar en empleados (correo insensible a mayúsculas y espacios)
        const empleado = await empleadosModel.findOne({ correo });
        if (empleado) {
            // Verificar contraseña usando bcrypt
            const isMatch = await bcryptjs.compare(password, empleado.password);
            console.log('Empleado encontrado:', empleado.correo, 'Password match:', isMatch);
            
            if (!isMatch) {
                return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
            }
            
            let userData = {
                id: empleado._id,
                nombre: empleado.nombre,
                apellido: empleado.apellido,
                correo: empleado.correo,
                telefono: empleado.telefono,
                rol: empleado.cargo
            };

            // Si es optometrista, buscar datos adicionales
            if (empleado.cargo === 'Optometrista') {
                const optometrista = await optometristaModel.findOne({ empleadoId: empleado._id });
                userData = {
                    ...userData,
                    especialidad: optometrista?.especialidad,
                    licencia: optometrista?.licencia
                };
            }

            // Generar token JWT
            const token = generateJWTToken(userData);
            
            // Configurar cookie segura
            setJWTCookie(res, token);
            
            return res.status(200).json({
                success: true,
                message: 'Login exitoso',
                user: userData,
                token: token // También enviar token en respuesta para compatibilidad
            });
        }
        
        // No se encontró usuario con ese correo
        console.log('No se encontró usuario con ese correo');
        return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
        
    } catch (error) {
        console.log('Error en login:', error);
        res.status(500).json({ message: 'Error en login: ' + error.message });
    }
};

/**
 * Cierra la sesión del usuario eliminando la cookie JWT
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Mensaje de confirmación
 */
clientesController.logout = async (req, res) => {
    try {
        // Eliminar la cookie JWT
        res.clearCookie('aurora_auth_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? '.aurora-optics.com' : undefined
        });

        res.status(200).json({ 
            success: true, 
            message: 'Sesión cerrada exitosamente' 
        });
    } catch (error) {
        console.log('Error en logout:', error);
        res.status(500).json({ message: 'Error cerrando sesión: ' + error.message });
    }
};

/**
 * Verifica si el token JWT es válido y retorna los datos del usuario
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Datos del usuario autenticado
 */
clientesController.verifyToken = async (req, res) => {
    try {
        // Obtener token de la cookie
        const token = req.cookies.aurora_auth_token;
        
        if (!token) {
            return res.status(401).json({ message: 'No hay token de autenticación' });
        }

        // Verificar y decodificar el token
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        
        // Buscar el usuario en la base de datos para verificar que aún existe
        let user = null;
        
        if (decoded.rol === 'Cliente') {
            user = await clientesModel.findById(decoded.id).select('-password');
        } else {
            user = await empleadosModel.findById(decoded.id).select('-password');
        }

        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                nombre: user.nombre,
                apellido: user.apellido,
                correo: user.correo,
                telefono: user.telefono,
                rol: decoded.rol
            }
        });

    } catch (error) {
        console.log('Error verificando token:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        }
        
        res.status(500).json({ message: 'Error verificando autenticación: ' + error.message });
    }
};

/**
 * Envía un email de recuperación de contraseña al cliente
 * Genera un token temporal y envía un código de verificación
 * @param {Object} req - Objeto de solicitud Express con correo
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Mensaje de confirmación o error
 */
clientesController.forgotPassword = async (req, res) => {
    const { correo } = req.body;
    
    if (!correo) {
        return res.status(400).json({ message: "El correo es obligatorio" });
    }

    try {
        // Buscar el cliente por correo
        const cliente = await clientesModel.findOne({ correo: correo.trim().toLowerCase() });
        if (!cliente) {
            return res.status(404).json({ message: "No existe un cliente con este correo" });
        }

        // Generar código de 6 dígitos
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetTokenExpiry = Date.now() + 1000 * 60 * 30; // 30 minutos

        console.log('Código generado:', resetCode);
        console.log('Expiración calculada:', new Date(resetTokenExpiry));

        // Guardar código y expiración en la base de datos
        cliente.resetPasswordToken = resetCode;
        cliente.resetPasswordExpires = new Date(resetTokenExpiry);
        await cliente.save();

        console.log('Código guardado en BD:', cliente.resetPasswordToken);
        console.log('Expiración guardada en BD:', cliente.resetPasswordExpires);

        // Enviar el email vía Resend API
        try {
            const subject = "Recuperación de Contraseña - Óptica Inteligente";
            const html = `
                <h2>Recuperación de Contraseña</h2>
                <p>Hola ${cliente.nombre} ${cliente.apellido},</p>
                <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código:</p>
                <h3 style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px;">${resetCode}</h3>
                <p>Este código expira en 30 minutos.</p>
                <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
                <p>Saludos,<br>Equipo de Óptica Inteligente</p>
            `;
            const text = `Hola ${cliente.nombre} ${cliente.apellido}, tu código para recuperar contraseña es ${resetCode}. Expira en 30 minutos.`;

            await sendEmail({
                to: correo,
                subject,
                html,
                text
            });

            res.json({ message: "Email de recuperación enviado exitosamente" });
        } catch (err) {
            console.log("Error enviando email de recuperación (Resend):", err?.message || err);
            if (config.server?.nodeEnv !== 'production') {
                return res.status(500).json({ message: "Error enviando email de recuperación", error: err?.message || String(err) });
            }
            return res.status(500).json({ message: "Error enviando email de recuperación" });
        }

    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error en recuperación de contraseña: " + error.message });
    }
};

/**
 * Restablece la contraseña del cliente usando el token de recuperación
 * @param {Object} req - Objeto de solicitud Express con token y nueva contraseña
 * @param {Object} res - Objeto de respuesta Express
 * @returns {Object} Mensaje de confirmación o error
 */
clientesController.resetPassword = async (req, res) => {
    const { correo, code, newPassword } = req.body;
    
    if (!correo || !code || !newPassword) {
        return res.status(400).json({ message: "Correo, código y nueva contraseña son obligatorios" });
    }

    console.log('Reset password attempt:', { correo, code: code.substring(0, 3) + '***' });

    try {
        // Buscar cliente con el código válido y no expirado
        const cliente = await clientesModel.findOne({
            correo: correo.trim().toLowerCase(),
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() }
        });

        console.log('Cliente encontrado:', cliente ? 'Sí' : 'No');
        if (cliente) {
            console.log('Token almacenado:', cliente.resetPasswordToken);
            console.log('Expiración:', cliente.resetPasswordExpires);
            console.log('Tiempo actual:', new Date());
            console.log('¿Token expirado?:', cliente.resetPasswordExpires < Date.now());
        }

        if (!cliente) {
            return res.status(400).json({ message: "Código inválido, expirado o correo incorrecto" });
        }

        // Encriptar la nueva contraseña
        const passwordHash = await bcryptjs.hash(newPassword, 10);
        
        // Actualizar contraseña y limpiar tokens
        cliente.password = passwordHash;
        cliente.resetPasswordToken = undefined;
        cliente.resetPasswordExpires = undefined;
        await cliente.save();

        console.log('Contraseña actualizada exitosamente para:', correo);
        res.json({ message: "Contraseña restablecida exitosamente" });

    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error restableciendo contraseña: " + error.message });
    }
};

export default clientesController;