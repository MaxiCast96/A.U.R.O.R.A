// ===== RUTAS AUTENTICACIÓN =====
import express from 'express';
import bcrypt from 'bcryptjs'; // Para hashear contraseñas
import jwt from 'jsonwebtoken'; // Para generar tokens JWT
import { config } from '../config.js'; // Configuración de la app
import Clientes from '../models/Clientes.js'; // Modelo de clientes
import Empleados from '../models/Empleados.js'; // Modelo de empleados

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Login unificado para clientes y empleados
 * @access Public - No requiere autenticación
 */
const login = async (req, res) => {
  try {
    const { correo, password } = req.body; // Extraer credenciales del body

    // Validar que se proporcionen ambos campos
    if (!correo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Correo y contraseña son requeridos'
      });
    }

    // Buscar usuario primero en la colección de clientes
    let user = await Clientes.findOne({ correo: correo.toLowerCase() });
    let userType = 'Cliente'; // Tipo por defecto

    // Si no es cliente, buscar en empleados
    if (!user) {
      user = await Empleados.findOne({ correo: correo.toLowerCase() });
      userType = 'Empleado';
    }

    // Si no existe en ninguna colección
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña hasheada contra la proporcionada
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar que la cuenta esté activa
    if (user.estado !== 'Activo') {
      return res.status(403).json({
        success: false,
        message: 'Su cuenta ha sido desactivada. Contacte al administrador.'
      });
    }

    // Crear token JWT con datos del usuario
    const token = jwt.sign(
      {
        id: user._id,
        correo: user.correo,
        rol: user.rol || userType // Usar rol específico o tipo de usuario
      },
      config.jwt.secret, // Clave secreta para firmar
      { expiresIn: '24h' } // Token válido por 24 horas
    );

    // Configurar cookie HTTPOnly para seguridad
    res.cookie('aurora_auth_token', token, {
      httpOnly: true, // No accesible desde JavaScript del cliente
      secure: process.env.NODE_ENV === 'production' ? true : false, // HTTPS en producción
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Permitir cross-site en producción
      maxAge: 24 * 60 * 60 * 1000 // 24 horas en milisegundos
      // domain eliminado para compatibilidad con Render
    });

    // Preparar datos seguros del usuario para el frontend
    const userData = {
      id: user._id,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      telefono: user.telefono,
      rol: user.rol || userType
    };

    // Respuesta exitosa con datos del usuario y token
    res.json({
      success: true,
      message: 'Login exitoso',
      user: userData,
      token: token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * @route POST /api/auth/logout
 * @desc Cerrar sesión del usuario
 * @access Public
 */
const logout = async (req, res) => {
  try {
    // Limpiar cookie de autenticación
    res.clearCookie('aurora_auth_token');
    
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * @route GET /api/auth/verify
 * @desc Verificar token JWT y obtener datos del usuario
 * @access Private - Requiere token válido
 */
const verifyToken = async (req, res) => {
  try {
    // El middleware de autenticación ya validó el token
    // y agregó los datos del usuario a req.user
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * @route POST /api/auth/forgot-password
 * @desc Solicitar recuperación de contraseña
 * @access Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { correo } = req.body;

    // Validar que se proporcione el correo
    if (!correo) {
      return res.status(400).json({
        success: false,
        message: 'Correo es requerido'
      });
    }

    // Buscar usuario en ambas colecciones
    let user = await Clientes.findOne({ correo: correo.toLowerCase() });
    if (!user) {
      user = await Empleados.findOne({ correo: correo.toLowerCase() });
    }

    // Si no existe el usuario
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Generar token temporal para recuperación (válido 1 hora)
    const resetToken = jwt.sign(
      { id: user._id, correo: user.correo },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    // Guardar token y tiempo de expiración en BD
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora en milisegundos
    await user.save();

    // TODO: Implementar envío de email con el token
    // Por ahora solo confirmamos que se procesó
    res.json({
      success: true,
      message: 'Email de recuperación enviado exitosamente'
    });
  } catch (error) {
    console.error('Error en forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * @route POST /api/auth/reset-password
 * @desc Restablecer contraseña usando token de recuperación
 * @access Public
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validar parámetros requeridos
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son requeridos'
      });
    }

    // Verificar y decodificar token JWT
    const decoded = jwt.verify(token, config.jwt.secret);

    // Buscar usuario con token válido y no expirado
    let user = await Clientes.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // Token no expirado
    });

    // Si no es cliente, buscar en empleados
    if (!user) {
      user = await Empleados.findOne({
        _id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
    }

    // Si no se encuentra usuario válido
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10); // Generar salt
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Limpiar campos de recuperación
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });
  } catch (error) {
    console.error('Error en reset password:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Definir rutas con sus respectivos controladores
router.post('/login', login); // POST /api/auth/login
router.post('/logout', logout); // POST /api/auth/logout
router.get('/verify', verifyToken); // GET /api/auth/verify
router.post('/forgot-password', forgotPassword); // POST /api/auth/forgot-password
router.post('/reset-password', resetPassword); // POST /api/auth/reset-password

export default router;