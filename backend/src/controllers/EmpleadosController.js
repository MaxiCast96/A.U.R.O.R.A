import empleadosModel from "../models/Empleados.js";
import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";
import { sendEmail } from "../services/mailer.js";

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const empleadosController = {};

// SELECT - Obtiene todos los empleados
empleadosController.getEmpleados = async (req, res) => {
    try {
        const empleados = await empleadosModel.find().populate('sucursalId', 'nombre');
        res.status(200).json(empleados);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo empleados: " + error.message });
    }
};

// SELECT by ID - Obtiene empleado específico por ID
empleadosController.getEmpleadoById = async (req, res) => {
    try {
        const empleado = await empleadosModel.findById(req.params.id).populate('sucursalId');
        if (!empleado) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }
        res.status(200).json(empleado);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo empleado: " + error.message });
    }
};

// INSERT - Crear nuevo empleado
empleadosController.createEmpleados = async (req, res) => {
    const {
        nombre, apellido, dui, telefono, correo, cargo, sucursalId,
        fechaContratacion, password, salario, estado,
        departamento, municipio, direccionDetallada, fotoPerfil
    } = req.body;

    try {
        console.log("Datos recibidos:", req.body);

        // Verificar si ya existe empleado con el mismo correo
        if (await empleadosModel.findOne({ correo })) {
            return res.status(400).json({ message: "El correo electrónico ya está registrado." });
        }
        
        // Verificar si ya existe empleado con el mismo DUI
        if (await empleadosModel.findOne({ dui })) {
            return res.status(400).json({ message: "El DUI ya está registrado." });
        }

        // Validación de campos obligatorios
        if (!nombre) return res.status(400).json({ message: "El nombre es obligatorio" });
        if (!apellido) return res.status(400).json({ message: "El apellido es obligatorio" });
        if (!dui) return res.status(400).json({ message: "El DUI es obligatorio" });
        if (!telefono) return res.status(400).json({ message: "El teléfono es obligatorio" });
        if (!correo) return res.status(400).json({ message: "El correo es obligatorio" });
        if (!cargo) return res.status(400).json({ message: "El cargo es obligatorio" });
        if (!sucursalId) return res.status(400).json({ message: "La sucursal es obligatoria" });
        if (!fechaContratacion) return res.status(400).json({ message: "La fecha de contratación es obligatoria" });
        if (!password) return res.status(400).json({ message: "La contraseña es obligatoria" });
        if (!salario) return res.status(400).json({ message: "El salario es obligatorio" });

        // Encriptar contraseña usando bcrypt
        const passwordHash = await bcryptjs.hash(password, 10);

        // Crear nueva instancia del empleado
        const newEmpleado = new empleadosModel({
            nombre,
            apellido,
            dui,
            telefono,
            correo,
            cargo,
            sucursalId,
            fechaContratacion,
            salario: parseFloat(salario),
            estado: estado || 'Activo',
            password: passwordHash,
            fotoPerfil: fotoPerfil || "",
            direccion: {
                departamento: departamento || "",
                municipio: municipio || "",
                direccionDetallada: direccionDetallada || ""
            },
        });

        await newEmpleado.save();
        
        const empleadoCreado = await empleadosModel.findById(newEmpleado._id).populate('sucursalId', 'nombre');
        
        res.status(201).json({ 
            message: "Empleado creado exitosamente",
            empleado: empleadoCreado
        });

    } catch (error) {
        console.error("Error: " + error);
        res.status(500).json({ message: "Error creando empleado: " + error.message });
    }
};

// UPDATE - Actualizar empleado existente (CON VALIDACIONES DE SEGURIDAD)
empleadosController.updateEmpleados = async (req, res) => {
    const { id } = req.params;
    const {
        nombre, apellido, dui, telefono, correo, cargo, sucursalId,
        fechaContratacion, password, salario, estado,
        departamento, municipio, direccionDetallada, fotoPerfil
    } = req.body;

    try {
        console.log("Datos recibidos para actualización:", req.body);

        // 🔐 VALIDACIÓN: Extraer usuario autenticado
        let currentUserId = null;
        let currentUserCargo = null;
        try {
            const token = req.cookies?.aurora_auth_token;
            if (token) {
                const jwt = (await import('jsonwebtoken')).default;
                const { config } = await import('../config.js');
                const decoded = jwt.verify(token, config.jwt.secret);
                currentUserId = decoded?.id;
                currentUserCargo = decoded?.cargo;
            }
        } catch (tokenError) {
            console.log('Error al verificar token:', tokenError.message);
        }

        const empleado = await empleadosModel.findById(id);
        if (!empleado) {
            return res.status(404).json({ message: "Empleado no encontrado." });
        }

        // 🚫 VALIDACIÓN: No permitir que un admin se quite su propio rol de admin
        if (currentUserId && String(currentUserId) === String(id)) {
            if (empleado.cargo === 'Administrador' && cargo && cargo !== 'Administrador') {
                // Verificar que existan otros administradores activos
                const otherAdminsCount = await empleadosModel.countDocuments({
                    cargo: 'Administrador',
                    estado: 'Activo',
                    _id: { $ne: id }
                });

                if (otherAdminsCount === 0) {
                    return res.status(403).json({ 
                        message: "  No puedes cambiar tu propio rol de Administrador. Eres el único administrador activo del sistema." 
                    });
                }
            }

            // 🚫 No permitir que se desactive a sí mismo si es el único admin
            if (empleado.cargo === 'Administrador' && estado === 'Inactivo') {
                const otherActiveAdminsCount = await empleadosModel.countDocuments({
                    cargo: 'Administrador',
                    estado: 'Activo',
                    _id: { $ne: id }
                });

                if (otherActiveAdminsCount === 0) {
                    return res.status(403).json({ 
                        message: "  No puedes desactivar tu propia cuenta. Eres el único administrador activo del sistema." 
                    });
                }
            }
        }

        // Verificar unicidad de correo
        if (correo && await empleadosModel.findOne({ correo, _id: { $ne: id } })) {
            return res.status(400).json({ message: "El correo electrónico ya pertenece a otro empleado." });
        }
        
        // Verificar unicidad de DUI
        if (dui && await empleadosModel.findOne({ dui, _id: { $ne: id } })) {
            return res.status(400).json({ message: "El DUI ya pertenece a otro empleado." });
        }

        // Preparar datos de actualización
        const updateData = {
            nombre: nombre || empleado.nombre,
            apellido: apellido || empleado.apellido,
            dui: dui || empleado.dui,
            telefono: telefono || empleado.telefono,
            correo: correo || empleado.correo,
            cargo: cargo || empleado.cargo,
            sucursalId: sucursalId || empleado.sucursalId,
            fechaContratacion: fechaContratacion || empleado.fechaContratacion,
            salario: salario ? parseFloat(salario) : empleado.salario,
            estado: estado || empleado.estado,
            fotoPerfil: fotoPerfil !== undefined ? fotoPerfil : empleado.fotoPerfil,
            direccion: {
                departamento: departamento !== undefined ? departamento : empleado.direccion?.departamento || "",
                municipio: municipio !== undefined ? municipio : empleado.direccion?.municipio || "",
                direccionDetallada: direccionDetallada !== undefined ? direccionDetallada : empleado.direccion?.direccionDetallada || ""
            }
        };

        // Encriptar nueva contraseña si se proporciona
        if (password && password.trim() !== "" && !password.startsWith('$2b$') && !password.startsWith('$2a$')) {
            updateData.password = await bcryptjs.hash(password, 10);
        }

        await empleadosModel.findByIdAndUpdate(id, updateData);
        
        const empleadoActualizado = await empleadosModel.findById(id).populate('sucursalId', 'nombre');
        
        // 📝 LOG de auditoría
        console.log(`[AUDIT] Empleado actualizado: ${empleadoActualizado.nombre} ${empleadoActualizado.apellido} (ID: ${id}) por usuario ID: ${currentUserId || 'desconocido'}`);
        
        res.status(200).json({ 
            message: "Empleado actualizado exitosamente",
            empleado: empleadoActualizado
        });

    } catch (error) {
        console.error("Error: " + error);
        res.status(500).json({ message: "Error actualizando empleado: " + error.message });
    }
};

// DELETE - Eliminar empleado (CON VALIDACIONES DE SEGURIDAD)
empleadosController.deleteEmpleados = async (req, res) => {
    try {
        const empleadoIdToDelete = req.params.id;
        
        // 🔐 VALIDACIÓN: Extraer usuario autenticado desde el token
        let currentUserId = null;
        try {
            const token = req.cookies?.aurora_auth_token;
            if (token) {
                const jwt = (await import('jsonwebtoken')).default;
                const { config } = await import('../config.js');
                const decoded = jwt.verify(token, config.jwt.secret);
                currentUserId = decoded?.id;
            }
        } catch (tokenError) {
            console.log('Error al verificar token:', tokenError.message);
        }

        // 🚫 BLOQUEAR: No permitir auto-eliminación
        if (currentUserId && String(currentUserId) === String(empleadoIdToDelete)) {
            return res.status(403).json({ 
                message: "  No puedes eliminar tu propia cuenta mientras estás autenticado. Solicita a otro administrador que realice esta acción." 
            });
        }

        // Buscar el empleado antes de eliminar
        const empleadoToDelete = await empleadosModel.findById(empleadoIdToDelete);
        
        if (!empleadoToDelete) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }

        // 🔐 VALIDACIÓN ADICIONAL: No permitir eliminar al único administrador
        if (empleadoToDelete.cargo === 'Administrador') {
            const adminCount = await empleadosModel.countDocuments({ 
                cargo: 'Administrador',
                estado: 'Activo',
                _id: { $ne: empleadoIdToDelete }
            });
            
            if (adminCount === 0) {
                return res.status(403).json({ 
                    message: "  No se puede eliminar al único administrador activo del sistema. Debe existir al menos un administrador." 
                });
            }
        }

        // Proceder con la eliminación
        const deletedEmpleado = await empleadosModel.findByIdAndDelete(empleadoIdToDelete);
        
        // Opcional: Eliminar la imagen de Cloudinary
        if (deletedEmpleado.fotoPerfil) {
            try {
                const publicId = deletedEmpleado.fotoPerfil.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`empleados_perfil/${publicId}`);
            } catch (cloudinaryError) {
                console.log("Error al eliminar imagen de Cloudinary:", cloudinaryError.message);
            }
        }
        
        // 📝 LOG de auditoría
        console.log(`[AUDIT] Empleado eliminado: ${deletedEmpleado.nombre} ${deletedEmpleado.apellido} (ID: ${empleadoIdToDelete}) por usuario ID: ${currentUserId || 'desconocido'}`);
        
        res.status(200).json({ 
            message: "Empleado eliminado exitosamente",
            empleado: {
                nombre: deletedEmpleado.nombre,
                apellido: deletedEmpleado.apellido,
                cargo: deletedEmpleado.cargo
            }
        });
    } catch (error) {
        console.error('Error eliminando empleado:', error);
        res.status(500).json({ message: "Error eliminando empleado: " + error.message });
    }
};

// Recuperar contraseña - Solicitud
empleadosController.forgotPassword = async (req, res) => {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ message: "Correo es requerido" });
    
    try {
        const empleado = await empleadosModel.findOne({ correo });
        if (!empleado) return res.status(404).json({ message: "No existe usuario con ese correo" });
        
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        console.log('Código generado (empleado):', resetCode);
        console.log('Expiración calculada (empleado):', new Date(Date.now() + 1000 * 60 * 30));
        
        empleado.resetPasswordToken = resetCode;
        empleado.resetPasswordExpires = Date.now() + 1000 * 60 * 30;
        await empleado.save();
        
        console.log('Código guardado en BD (empleado):', empleado.resetPasswordToken);
        console.log('Expiración guardada en BD (empleado):', empleado.resetPasswordExpires);
        
        const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recuperación de Contraseña</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f5f7fa;
                    color: #333333;
                    line-height: 1.6;
                }
                
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                
                .header {
                    background: linear-gradient(135deg, #009BBF 0%, #A4D5DD 100%);
                    padding: 30px 20px;
                    text-align: center;
                    position: relative;
                }
                
                .header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="3" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="2" fill="rgba(255,255,255,0.1)"/></svg>');
                    opacity: 0.3;
                }
                
                .logo-container {
                    position: relative;
                    z-index: 2;
                    margin-bottom: 15px;
                }
                
                .logo {
                    width: 80px;
                    height: 80px;
                    background-color: #ffffff;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }
                
                .glasses-icon {
                    font-size: 36px;
                    color: #009BBF;
                }
                
                .company-name {
                    color: #ffffff;
                    font-size: 28px;
                    font-weight: 700;
                    margin: 0;
                    position: relative;
                    z-index: 2;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                
                .subtitle {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 14px;
                    margin-top: 5px;
                    position: relative;
                    z-index: 2;
                }
                
                .content {
                    padding: 40px 30px;
                }
                
                .greeting {
                    font-size: 20px;
                    color: #2c3e50;
                    margin-bottom: 20px;
                    font-weight: 600;
                }
                
                .message {
                    font-size: 16px;
                    color: #555555;
                    margin-bottom: 30px;
                    line-height: 1.8;
                }
                
                .code-container {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    border: 2px dashed #009BBF;
                    border-radius: 15px;
                    padding: 30px 20px;
                    text-align: center;
                    margin: 30px 0;
                    position: relative;
                    overflow: hidden;
                }
                
                .code-container::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(0, 155, 191, 0.05) 1px, transparent 1px);
                    background-size: 20px 20px;
                    animation: float 10s infinite linear;
                }
                
                @keyframes float {
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) rotate(360deg); }
                }
                
                .code-label {
                    font-size: 14px;
                    color: #666666;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 600;
                    position: relative;
                    z-index: 2;
                }
                
                .verification-code {
                    font-size: 36px;
                    font-weight: 900;
                    color: #009BBF;
                    letter-spacing: 8px;
                    margin: 0;
                    text-shadow: 0 2px 4px rgba(0, 155, 191, 0.2);
                    position: relative;
                    z-index: 2;
                }
                
                .expiry-notice {
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 25px 0;
                    text-align: center;
                }
                
                .expiry-text {
                    color: #856404;
                    font-weight: 600;
                    font-size: 14px;
                }
                
                .security-notice {
                    background-color: #e8f4f8;
                    border-left: 4px solid #009BBF;
                    padding: 20px;
                    margin: 25px 0;
                    border-radius: 0 8px 8px 0;
                }
                
                .security-text {
                    font-size: 14px;
                    color: #2c3e50;
                    margin: 0;
                }
                
                .footer {
                    background-color: #f8f9fa;
                    padding: 25px 30px;
                    text-align: center;
                    border-top: 1px solid #e9ecef;
                }
                
                .footer-text {
                    font-size: 12px;
                    color: #6c757d;
                    margin: 0;
                    line-height: 1.5;
                }
                
                .company-info {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid #dee2e6;
                }
                
                .contact-info {
                    color: #009BBF;
                    font-weight: 600;
                    text-decoration: none;
                }
                
                @media only screen and (max-width: 600px) {
                    .email-container {
                        margin: 10px;
                        border-radius: 8px;
                    }
                    
                    .content {
                        padding: 25px 20px;
                    }
                    
                    .verification-code {
                        font-size: 28px;
                        letter-spacing: 4px;
                    }
                    
                    .company-name {
                        font-size: 24px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <div class="logo-container">
                        <div class="logo">
                            <span class="glasses-icon">👓</span>
                        </div>
                    </div>
                    <h1 class="company-name">Óptica La Inteligente</h1>
                    <p class="subtitle">Tu visión, nuestra pasión</p>
                </div>
                
                <div class="content">
                    <h2 class="greeting">¡Hola ${empleado.nombre}!</h2>
                    
                    <p class="message">
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta en Óptica La Inteligente. 
                        Para continuar con el proceso de recuperación, utiliza el siguiente código de verificación:
                    </p>
                    
                    <div class="code-container">
                        <p class="code-label">Código de Verificación</p>
                        <h1 class="verification-code">${resetCode}</h1>
                    </div>
                    
                    <div class="expiry-notice">
                        <p class="expiry-text">
                            ⏰ Este código expirará en 30 minutos por seguridad
                        </p>
                    </div>
                    
                    <div class="security-notice">
                        <p class="security-text">
                            <strong>🔒 Nota de Seguridad:</strong> Si no solicitaste este cambio de contraseña, 
                            puedes ignorar este correo de forma segura. Tu cuenta permanecerá protegida.
                        </p>
                    </div>
                    
                    <p class="message">
                        Ingresa este código en la aplicación para continuar con el proceso de recuperación. 
                        Si tienes alguna duda o necesitas asistencia, no dudes en contactarnos.
                    </p>
                </div>
                
                <div class="footer">
                    <p class="footer-text">
                        Este es un correo electrónico automático, por favor no respondas a este mensaje.
                    </p>
                    
                    <div class="company-info">
                        <p class="footer-text">
                            <strong>Óptica La Inteligente</strong><br>
                            Soporte: <a href="mailto:soporte@opticalainteligente.com" class="contact-info">soporte@opticalainteligente.com</a><br>
                            Teléfono: <span class="contact-info">+503 2XXX-XXXX</span>
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        const subject = '🔐 Código de Recuperación de Contraseña - Óptica La Inteligente';
        const text = `
Hola ${empleado.nombre},

Recibimos una solicitud para restablecer tu contraseña en Óptica La Inteligente.

Tu código de verificación es: ${resetCode}

Este código expirará en 30 minutos.

Si no solicitaste este cambio, puedes ignorar este correo.

Óptica La Inteligente
soporte@opticalainteligente.com
            `;

        await sendEmail({
            to: correo,
            subject,
            html: htmlTemplate,
            text,
            from: '"Óptica La Inteligente" <onboarding@resend.dev>'
        });
        res.json({ message: "Código de recuperación enviado al correo" });
    } catch (error) {
        console.error("Error: " + error);
        res.status(500).json({ message: "Error enviando código de recuperación: " + error.message });
    }
};

// Validar código de recuperación (sin cambiar contraseña)
empleadosController.verifyResetCode = async (req, res) => {
    const { correo, code } = req.body;
    if (!correo || !code) return res.status(400).json({ message: "Correo y código requeridos" });
    
    console.log('Verify code attempt (empleado):', { correo, code: code.substring(0, 3) + '***' });
    
    try {
        const empleado = await empleadosModel.findOne({
            correo,
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        console.log('Empleado encontrado para verificación:', empleado ? 'Sí' : 'No');
        if (empleado) {
            console.log('Token almacenado:', empleado.resetPasswordToken);
            console.log('Expiración:', empleado.resetPasswordExpires);
            console.log('Tiempo actual:', new Date());
            console.log('¿Token expirado?:', empleado.resetPasswordExpires < Date.now());
        }
        
        if (!empleado) {
            return res.status(400).json({ message: "Código inválido, expirado o correo incorrecto" });
        }
        
        res.json({ message: "Código válido", valid: true });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error verificando código: " + error.message });
    }
};

// Recuperar contraseña - Restablecer
empleadosController.resetPassword = async (req, res) => {
    const { correo, code, newPassword } = req.body;
    if (!correo || !code || !newPassword) return res.status(400).json({ message: "Correo, código y nueva contraseña requeridos" });
    
    console.log('Reset password attempt (empleado):', { correo, code: code.substring(0, 3) + '***' });
    
    try {
        const empleado = await empleadosModel.findOne({
            correo,
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        console.log('Empleado encontrado:', empleado ? 'Sí' : 'No');
        if (empleado) {
            console.log('Token almacenado:', empleado.resetPasswordToken);
            console.log('Expiración:', empleado.resetPasswordExpires);
            console.log('Tiempo actual:', new Date());
            console.log('¿Token expirado?:', empleado.resetPasswordExpires < Date.now());
        }
        
        if (!empleado) return res.status(400).json({ message: "Código inválido, expirado o correo incorrecto" });
        
        empleado.password = await bcryptjs.hash(newPassword, 10);
        empleado.resetPasswordToken = undefined;
        empleado.resetPasswordExpires = undefined;
        await empleado.save();
        
        console.log('Contraseña actualizada exitosamente para empleado:', correo);
        res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error restableciendo contraseña: " + error.message });
    }
};

export default empleadosController;