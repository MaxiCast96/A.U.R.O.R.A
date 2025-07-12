// ===== CONFIG.JS - CONFIGURACIÓN CENTRALIZADA DEL SISTEMA =====
import dotenv from 'dotenv';

// Cargar variables de entorno desde archivo .env
dotenv.config();

/**
 * Configuración centralizada del backend
 * Maneja todas las variables de entorno y configuraciones del sistema
 */
export const config = {
  // Configuración del servidor web
  server: {
    port: process.env.PORT || 4000, // Puerto del servidor (default: 4000)
    nodeEnv: process.env.NODE_ENV || 'development', // Ambiente de ejecución
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173' // URL permitida para CORS
  },

  // Configuración de la base de datos MongoDB
  database: {
    uri: process.env.DB_URI || 'mongodb://localhost:27017/aurora_db', // URI de conexión
    options: {
      useNewUrlParser: true, // Usar nuevo parser de URL
      useUnifiedTopology: true, // Usar nueva topología unificada
      maxPoolSize: 10, // Máximo de conexiones simultáneas
      serverSelectionTimeoutMS: 5000, // Timeout para selección de servidor
      socketTimeoutMS: 45000, // Timeout para operaciones de socket
    }
  },

  // Configuración de JWT (JSON Web Tokens)
  jwt: {
    secret: process.env.JWT_SECRET || 'aurora_jwt_secret_key_2024', // Clave secreta para firmar tokens
    expire: process.env.JWT_EXPIRE || '24h', // Tiempo de expiración de tokens
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d', // Tiempo de expiración de refresh tokens
    issuer: 'aurora-optics', // Emisor del token
    audience: 'aurora-users' // Audiencia del token
  },

  // Configuración de cookies para autenticación
  cookies: {
    name: 'aurora_auth_token', // Nombre de la cookie
    httpOnly: true, // Solo accesible por HTTP (no JavaScript del cliente)
    secure: process.env.NODE_ENV === 'production', // HTTPS en producción
    sameSite: 'strict', // Protección contra CSRF
    maxAge: 24 * 60 * 60 * 1000, // Duración: 24 horas en milisegundos
    path: '/', // Ruta donde es válida la cookie
    domain: process.env.NODE_ENV === 'production' ? '.aurora-optics.com' : undefined // Dominio
  },

  // Configuración de email para notificaciones
  email: {
    service: 'gmail', // Servicio de email (Gmail)
    user: process.env.USER_EMAIL, // Email del remitente
    pass: process.env.USER_PASS, // Contraseña del email
    from: process.env.USER_EMAIL || 'noreply@aurora-optics.com', // Email de origen
    templates: { // Plantillas de email
      welcome: {
        subject: 'Bienvenido a Óptica Inteligente',
        template: 'welcome-email.html'
      },
      passwordReset: {
        subject: 'Recuperación de Contraseña - Óptica Inteligente',
        template: 'password-reset.html'
      },
      appointmentConfirmation: {
        subject: 'Confirmación de Cita - Óptica Inteligente',
        template: 'appointment-confirmation.html'
      }
    }
  },

  // Configuración de Cloudinary para almacenamiento de imágenes
  cloudinary: {
    cloudName: process.env.CLOUD_NAME, // Nombre del cloud de Cloudinary
    apiKey: process.env.CLOUDINARY_API_KEY, // API Key
    apiSecret: process.env.CLOUDINARY_API_SECRET, // API Secret
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'aurora_optics', // Preset de upload
    folder: 'aurora-optics', // Carpeta donde se guardan las imágenes
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'], // Formatos permitidos
    maxFileSize: 5 * 1024 * 1024, // Tamaño máximo: 5MB
    transformations: { // Transformaciones predefinidas
      thumbnail: {
        width: 150,
        height: 150,
        crop: 'fill',
        quality: 'auto'
      },
      medium: {
        width: 400,
        height: 400,
        crop: 'limit',
        quality: 'auto'
      },
      large: {
        width: 800,
        height: 800,
        crop: 'limit',
        quality: 'auto'
      }
    }
  },

  // Configuración de validaciones del sistema
  validation: {
    password: {
      minLength: 8, // Longitud mínima de contraseña
      requireUppercase: true, // Requiere mayúsculas
      requireLowercase: true, // Requiere minúsculas
      requireNumbers: true, // Requiere números
      requireSpecialChars: false // No requiere caracteres especiales
    },
    email: {
      domain: 'gmail.com', // Dominio preferido
      maxLength: 254 // Longitud máxima del email
    },
    phone: {
      format: '+503XXXXXXXX', // Formato de teléfono salvadoreño
      countryCode: '+503' // Código de país
    },
    dui: {
      format: 'XXXXXXXX-X', // Formato del DUI salvadoreño
      length: 10 // Longitud total del DUI
    }
  },

  // Configuración de paginación para consultas
  pagination: {
    defaultLimit: 10, // Límite por defecto de registros por página
    maxLimit: 100, // Límite máximo permitido
    defaultPage: 1 // Página por defecto
  },

  // Configuración de rate limiting (limitación de peticiones)
  rateLimit: {
    windowMs: 15 * 60 * 1000, // Ventana de tiempo: 15 minutos
    maxRequests: 100, // Máximo 100 peticiones por ventana
    message: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde.'
  },

  // Configuración de logging (registro de eventos)
  logging: {
    level: process.env.LOG_LEVEL || 'info', // Nivel de logging
    format: process.env.NODE_ENV === 'production' ? 'json' : 'simple', // Formato
    file: process.env.LOG_FILE || 'logs/app.log', // Archivo de logs
    maxSize: '10m', // Tamaño máximo del archivo
    maxFiles: '5' // Máximo número de archivos
  },

  // Configuración de seguridad
  security: {
    bcryptRounds: 10, // Rondas de hashing para bcrypt
    sessionTimeout: 24 * 60 * 60 * 1000, // Timeout de sesión: 24 horas
    maxLoginAttempts: 5, // Máximo intentos de login fallidos
    lockoutDuration: 15 * 60 * 1000, // Duración del bloqueo: 15 minutos
    passwordHistory: 3, // No permitir las últimas 3 contraseñas
    requireMFA: false // Autenticación multifactor (deshabilitada)
  },

  // Configuración de notificaciones
  notifications: {
    email: {
      enabled: true, // Notificaciones por email habilitadas
      batchSize: 50, // Tamaño del lote para envío masivo
      retryAttempts: 3, // Intentos de reenvío
      retryDelay: 5000 // Delay entre reintentos: 5 segundos
    },
    sms: {
      enabled: false, // SMS deshabilitado
      provider: 'twilio', // Proveedor de SMS
      apiKey: process.env.TWILIO_API_KEY,
      apiSecret: process.env.TWILIO_API_SECRET,
      fromNumber: process.env.TWILIO_FROM_NUMBER
    }
  },

  // Configuración de backup automático
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true', // Backup habilitado por variable de entorno
    schedule: '0 2 * * *', // Programación cron: diario a las 2 AM
    retention: 30, // Retener backups por 30 días
    storage: {
      type: 'local', // Tipo de almacenamiento: local, s3, gcs
      path: './backups', // Ruta local para backups
      s3Bucket: process.env.BACKUP_S3_BUCKET, // Bucket de S3 (si aplica)
      s3Region: process.env.BACKUP_S3_REGION // Región de S3 (si aplica)
    }
  },

  // Configuración de monitoreo del sistema
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true', // Monitoreo habilitado
    metrics: {
      enabled: true, // Métricas habilitadas
      port: process.env.METRICS_PORT || 9090 // Puerto para métricas
    },
    healthCheck: {
      enabled: true, // Health check habilitado
      path: '/health', // Ruta del health check
      interval: 30000 // Intervalo de verificación: 30 segundos
    }
  },

  // Configuración de cache en memoria
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true', // Cache habilitado
    type: 'memory', // Tipo de cache: memory, redis
    ttl: 300, // Tiempo de vida: 5 minutos
    maxSize: 1000, // Tamaño máximo de entradas
    redis: { // Configuración de Redis (si se usa)
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0
    }
  },

  // Configuración de uploads de archivos
  uploads: {
    path: './uploads', // Ruta de uploads temporales
    maxFileSize: 10 * 1024 * 1024, // Tamaño máximo: 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'], // Tipos permitidos
    cleanupInterval: 24 * 60 * 60 * 1000, // Limpieza cada 24 horas
    maxFiles: 1000 // Máximo número de archivos
  },

  // Configuración de reportes del sistema
  reports: {
    path: './reports', // Ruta para generar reportes
    format: 'pdf', // Formato por defecto: pdf, excel, csv
    retention: 90, // Retener reportes por 90 días
    templates: { // Plantillas de reportes
      sales: 'sales-report.html',
      inventory: 'inventory-report.html',
      appointments: 'appointments-report.html'
    }
  }
};

/**
 * Función para validar configuración crítica al inicio
 * Verifica que las variables esenciales estén configuradas
 */
export const validateConfig = () => {
  const required = [
    'database.uri', // URI de base de datos
    'jwt.secret', // Secreto JWT
    'email.user', // Usuario de email
    'email.pass' // Contraseña de email
  ];

  const missing = []; // Array para almacenar configuraciones faltantes

  // Verificar cada configuración requerida
  required.forEach(key => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    if (!value) {
      missing.push(key);
    }
  });

  // Si hay configuraciones faltantes, lanzar error
  if (missing.length > 0) {
    throw new Error(`Configuración faltante: ${missing.join(', ')}`);
  }

  return true;
};

/**
 * Función utilitaria para obtener configuración anidada
 * @param {string} key - Clave de configuración en formato 'nivel1.nivel2.nivel3'
 * @returns {*} - Valor de la configuración
 */
export const getConfig = (key) => {
  return key.split('.').reduce((obj, k) => obj?.[k], config);
};

/**
 * Configuración específica por ambiente de ejecución
 * Permite sobrescribir configuraciones según el ambiente
 */
export const environmentConfig = {
  development: { // Configuración para desarrollo
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'], // Múltiples orígenes permitidos
      credentials: true
    },
    logging: {
      level: 'debug' // Logging detallado en desarrollo
    }
  },
  production: { // Configuración para producción
    cors: {
      origin: process.env.FRONTEND_URL, // Solo el URL de producción
      credentials: true
    },
    logging: {
      level: 'error' // Solo errores en producción
    }
  },
  test: { // Configuración para testing
    database: {
      uri: 'mongodb://localhost:27017/aurora_test' // Base de datos de testing
    },
    logging: {
      level: 'warn' // Solo warnings y errores en testing
    }
  }
};

// Exportar configuración por defecto
export default config;