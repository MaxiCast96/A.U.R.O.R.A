import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import clientesModel from '../models/Clientes.js';
import empleadosModel from '../models/Empleados.js';

/**
 * Middleware para verificar autenticación JWT
 * Extrae el token del encabezado de autorización y verifica su validez
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 */
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Acceso denegado. Token de autenticación requerido.' 
            });
        }

        jwt.verify(token, config.jwt.secret, (err, user) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido o expirado'
                });
            }

            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Error en autenticación:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error en la autenticación' 
        });
    }
};

/**
 * Middleware para verificar roles específicos
 * @param {string|Array} allowedRoles - Rol o roles permitidos
 * @returns {Function} Middleware de autorización
 */
export const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        // Verificar que el usuario esté autenticado
        if (!req.user) {
            return res.status(401).json({ 
                message: 'Acceso denegado. Autenticación requerida.' 
            });
        }

        // Convertir a array si es un string
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        
        // Verificar si el rol del usuario está permitido
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ 
                message: 'Acceso denegado. No tiene permisos para acceder a este recurso.' 
            });
        }

        next();
    };
};

/**
 * Middleware para verificar que el usuario sea administrador
 * Acepta tanto rol=Administrador como cargo=Administrador
 */
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            message: 'Acceso denegado. Autenticación requerida.' 
        });
    }
    const rol = req.user.rol;
    const cargo = req.user.cargo || req.user.Cargo;
    if (rol === 'Administrador' || cargo === 'Administrador') {
        return next();
    }
    return res.status(403).json({ 
        message: 'Acceso denegado. No tiene permisos para acceder a este recurso.' 
    });
};

/**
 * Middleware para verificar que el usuario sea empleado (cualquier rol excepto Cliente)
 */
export const requireEmployee = authorizeRoles(['Administrador', 'Vendedor', 'Optometrista']);

/**
 * Middleware para verificar que el usuario sea optometrista
 */
export const requireOptometrista = authorizeRoles(['Optometrista']);

/**
 * Middleware para verificar que el usuario sea vendedor o administrador
 */
export const requireVendorOrAdmin = authorizeRoles(['Vendedor', 'Administrador']);

/**
 * Middleware para verificar que el usuario acceda solo a sus propios datos
 * @param {string} resourceIdParam - Nombre del parámetro que contiene el ID del recurso
 * @param {string} resourceModel - Modelo del recurso a verificar
 */
export const requireOwnership = (resourceIdParam, resourceModel) => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[resourceIdParam];
            
            if (!resourceId) {
                return res.status(400).json({ 
                    message: 'ID del recurso requerido.' 
                });
            }

            // Buscar el recurso en la base de datos
            const resource = await resourceModel.findById(resourceId);
            
            if (!resource) {
                return res.status(404).json({ 
                    message: 'Recurso no encontrado.' 
                });
            }

            // Verificar propiedad del recurso
            const isOwner = resource.userId?.toString() === req.user.id?.toString() ||
                           resource.clienteId?.toString() === req.user.id?.toString() ||
                           resource.empleadoId?.toString() === req.user.id?.toString();

            // Permitir acceso si es propietario o administrador
            if (isOwner || req.user.rol === 'Administrador') {
                req.resource = resource;
                next();
            } else {
                return res.status(403).json({ 
                    message: 'Acceso denegado. Solo puede acceder a sus propios recursos.' 
                });
            }
        } catch (error) {
            console.log('Error verificando propiedad:', error);
            res.status(500).json({ 
                message: 'Error verificando propiedad del recurso: ' + error.message 
            });
        }
    };
};

/**
 * Middleware para verificar que el usuario esté activo
 */
export const requireActiveUser = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                message: 'Acceso denegado. Autenticación requerida.' 
            });
        }

        // Buscar el usuario en la base de datos para verificar su estado
        let user = null;
        
        if (req.user.rol === 'Cliente') {
            user = await clientesModel.findById(req.user.id);
        } else {
            user = await empleadosModel.findById(req.user.id);
        }

        if (!user) {
            return res.status(401).json({ 
                message: 'Usuario no encontrado.' 
            });
        }

        // Verificar que el usuario esté activo
        if (user.estado !== 'Activo') {
            return res.status(403).json({ 
                message: 'Su cuenta ha sido desactivada. Contacte al administrador.' 
            });
        }

        next();
    } catch (error) {
        console.log('Error verificando estado del usuario:', error);
        res.status(500).json({ 
            message: 'Error verificando estado del usuario: ' + error.message 
        });
    }
};

/**
 * Middleware para logging de acceso
 * Registra información sobre las solicitudes autenticadas
 */
export const logAccess = (req, res, next) => {
    if (req.user) {
        console.log(`[${new Date().toISOString()}] ${req.user.rol} ${req.user.correo} - ${req.method} ${req.originalUrl}`);
    }
    next();
};

/**
 * Middleware para rate limiting básico
 * Previene abuso de la API limitando las solicitudes por IP
 */
export const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        // Limpiar solicitudes antiguas
        if (requests.has(ip)) {
            const userRequests = requests.get(ip);
            userRequests.requests = userRequests.requests.filter(
                timestamp => now - timestamp < windowMs
            );
            
            if (userRequests.requests.length >= maxRequests) {
                return res.status(429).json({ 
                    message: 'Demasiadas solicitudes. Intente nuevamente más tarde.' 
                });
            }
        }
        
        // Registrar nueva solicitud
        if (!requests.has(ip)) {
            requests.set(ip, { requests: [] });
        }
        requests.get(ip).requests.push(now);
        
        next();
    };
};

/**
 * Middleware para validar datos de entrada
 * @param {Function} validator - Función de validación
 */
export const validateInput = (validator) => {
    return (req, res, next) => {
        try {
            const validation = validator(req.body);
            
            if (!validation.isValid) {
                return res.status(400).json({
                    message: 'Datos de entrada inválidos',
                    errors: validation.errors
                });
            }
            
            next();
        } catch (error) {
            console.log('Error en validación:', error);
            res.status(500).json({ 
                message: 'Error validando datos de entrada: ' + error.message 
            });
        }
    };
};

/**
 * Middleware para manejo de errores global
 * Debe ser el último middleware en la cadena
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Error no manejado:', err);
    
    // Error de validación de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
            message: 'Token de autenticación inválido' 
        });
    }
    
    // Error de token expirado
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
            message: 'Token de autenticación expirado' 
        });
    }
    
    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({ 
            message: 'Error de validación',
            errors 
        });
    }
    
    // Error de duplicado de MongoDB
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({ 
            message: `${field} ya existe en la base de datos` 
        });
    }
    
    // Error genérico
    res.status(500).json({ 
        message: 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
};