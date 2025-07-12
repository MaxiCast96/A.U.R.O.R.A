import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Configuración centralizada del backend
 * Maneja todas las variables de entorno y configuraciones
 */
export const config = {
  // Configuración del servidor
  server: {
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  },

  // Configuración de la base de datos
  database: {
    uri: process.env.DB_URI || 'mongodb://localhost:27017/aurora_db',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // Configuración de JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'aurora_jwt_secret_key_2024',
    expire: process.env.JWT_EXPIRE || '24h',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
    issuer: 'aurora-optics',
    audience: 'aurora-users'
  },

  // Configuración de cookies
  cookies: {
    name: 'aurora_auth_token',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.aurora-optics.com' : undefined
  },

  // Configuración de email
  email: {
    service: 'gmail',
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
    from: process.env.USER_EMAIL || 'noreply@aurora-optics.com',
    templates: {
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

  // Configuración de Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'aurora_optics',
    folder: 'aurora-optics',
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    transformations: {
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

  // Configuración de validaciones
  validation: {
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
    email: {
      domain: 'gmail.com',
      maxLength: 254
    },
    phone: {
      format: '+503XXXXXXXX',
      countryCode: '+503'
    },
    dui: {
      format: 'XXXXXXXX-X',
      length: 10
    }
  },

  // Configuración de paginación
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
    defaultPage: 1
  },

  // Configuración de rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100, // máximo 100 requests por ventana
    message: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde.'
  },

  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'simple',
    file: process.env.LOG_FILE || 'logs/app.log',
    maxSize: '10m',
    maxFiles: '5'
  },

  // Configuración de seguridad
  security: {
    bcryptRounds: 10,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutos
    passwordHistory: 3, // No permitir las últimas 3 contraseñas
    requireMFA: false
  },

  // Configuración de notificaciones
  notifications: {
    email: {
      enabled: true,
      batchSize: 50,
      retryAttempts: 3,
      retryDelay: 5000 // 5 segundos
    },
    sms: {
      enabled: false,
      provider: 'twilio',
      apiKey: process.env.TWILIO_API_KEY,
      apiSecret: process.env.TWILIO_API_SECRET,
      fromNumber: process.env.TWILIO_FROM_NUMBER
    }
  },

  // Configuración de backup
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: '0 2 * * *', // Diario a las 2 AM
    retention: 30, // Mantener 30 días
    storage: {
      type: 'local', // 'local', 's3', 'gcs'
      path: './backups',
      s3Bucket: process.env.BACKUP_S3_BUCKET,
      s3Region: process.env.BACKUP_S3_REGION
    }
  },

  // Configuración de monitoreo
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    metrics: {
      enabled: true,
      port: process.env.METRICS_PORT || 9090
    },
    healthCheck: {
      enabled: true,
      path: '/health',
      interval: 30000 // 30 segundos
    }
  },

  // Configuración de cache
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    type: 'memory', // 'memory', 'redis'
    ttl: 300, // 5 minutos
    maxSize: 1000,
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0
    }
  },

  // Configuración de archivos
  uploads: {
    path: './uploads',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    cleanupInterval: 24 * 60 * 60 * 1000, // 24 horas
    maxFiles: 1000
  },

  // Configuración de reportes
  reports: {
    path: './reports',
    format: 'pdf', // 'pdf', 'excel', 'csv'
    retention: 90, // 90 días
    templates: {
      sales: 'sales-report.html',
      inventory: 'inventory-report.html',
      appointments: 'appointments-report.html'
    }
  }
};

/**
 * Validar configuración crítica
 */
export const validateConfig = () => {
  const required = [
    'database.uri',
    'jwt.secret',
    'email.user',
    'email.pass'
  ];

  const missing = [];

  required.forEach(key => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    if (!value) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Configuración faltante: ${missing.join(', ')}`);
  }

  return true;
};

/**
 * Obtener configuración por ambiente
 */
export const getConfig = (key) => {
  return key.split('.').reduce((obj, k) => obj?.[k], config);
};

/**
 * Configuración específica por ambiente
 */
export const environmentConfig = {
  development: {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true
    },
    logging: {
      level: 'debug'
    }
  },
  production: {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    },
    logging: {
      level: 'error'
    }
  },
  test: {
    database: {
      uri: 'mongodb://localhost:27017/aurora_test'
    },
    logging: {
      level: 'warn'
    }
  }
};

export default config;
