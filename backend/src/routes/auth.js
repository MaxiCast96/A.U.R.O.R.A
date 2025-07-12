import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import Clientes from '../models/Clientes.js';
import Empleados from '../models/Empleados.js';

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Login unificado para clientes y empleados
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Correo y contraseña son requeridos'
      });
    }

    // Buscar usuario en ambas colecciones
    let user = await Clientes.findOne({ correo: correo.toLowerCase() });
    let userType = 'Cliente';

    if (!user) {
      user = await Empleados.findOne({ correo: correo.toLowerCase() });
      userType = 'Empleado';
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar que el usuario esté activo
    if (user.estado !== 'Activo') {
      return res.status(403).json({
        success: false,
        message: 'Su cuenta ha sido desactivada. Contacte al administrador.'
      });
    }

    // Crear token JWT
    const token = jwt.sign(
      {
        id: user._id,
        correo: user.correo,
        rol: user.rol || userType
      },
      config.jwt.secret,
      { expiresIn: '24h' }
    );

    // Configurar cookie
    res.cookie('aurora_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    // Preparar datos del usuario para enviar
    const userData = {
      id: user._id,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      telefono: user.telefono,
      rol: user.rol || userType
    };

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
 * @desc Logout del usuario
 * @access Public
 */
const logout = async (req, res) => {
  try {
    // Limpiar cookie
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
 * @desc Verificar token y obtener datos del usuario
 * @access Private
 */
const verifyToken = async (req, res) => {
  try {
    // El middleware de autenticación ya verificó el token
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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Generar token de recuperación
    const resetToken = jwt.sign(
      { id: user._id, correo: user.correo },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    // Guardar token en la base de datos
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    // Aquí deberías enviar el email con el token
    // Por ahora, solo devolvemos un mensaje de éxito
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
 * @desc Restablecer contraseña con token
 * @access Public
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son requeridos'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Buscar usuario
    let user = await Clientes.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      user = await Empleados.findOne({
        _id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
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

// Rutas
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify', verifyToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router; 