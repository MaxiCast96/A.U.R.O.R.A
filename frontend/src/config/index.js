/**
 * Configuración centralizada del frontend
 * Maneja todas las variables de entorno y configuraciones
 */

// Variables de entorno de Vite
const env = import.meta.env;

/**
 * Configuración principal de la aplicación
 */
export const config = {
  // Configuración de la API
  api: {
    baseUrl: env.VITE_API_URL || 'https://aurora-production-7e57.up.railway.app/api',
    timeout: 10000, // 10 segundos
    retries: 3,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },

  // Configuración de autenticación
  auth: {
    tokenKey: 'aurora_auth_token',
    refreshTokenKey: 'aurora_refresh_token',
    userKey: 'aurora_user',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
    autoRefresh: true,
    refreshThreshold: 5 * 60 * 1000 // 5 minutos antes de expirar
  },

  // Configuración de Cloudinary
  cloudinary: {
    cloudName: env.VITE_CLOUDINARY_CLOUD_NAME,
    uploadPreset: env.VITE_CLOUDINARY_UPLOAD_PRESET,
    folder: 'aurora-optics',
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    transformations: {
      thumbnail: 'w_150,h_150,c_fill,q_auto',
      medium: 'w_400,h_400,c_limit,q_auto',
      large: 'w_800,h_800,c_limit,q_auto'
    }
  },

  // Configuración de la aplicación
  app: {
    name: 'A.U.R.O.R.A',
    version: '1.0.0',
    description: 'Advanced Unified Retail & Optical Resource Administration',
    company: 'Óptica Inteligente',
    supportEmail: 'soporte@aurora-optics.com',
    website: 'https://aurora-optics.com'
  },

  // Configuración de rutas
  routes: {
    public: {
      home: '/',
      about: '/nosotros',
      services: '/servicios',
      products: '/productos',
      quotes: '/cotizaciones',
      appointments: '/citas',
      contact: '/contacto'
    },
    private: {
      dashboard: '/dashboard',
      profile: '/perfil',
      admin: '/admin'
    },
    auth: {
      login: '/login',
      register: '/register',
      forgotPassword: '/forgot-password',
      resetPassword: '/reset-password'
    }
  },

  // Configuración de validaciones
  validation: {
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      patterns: {
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        numbers: /\d/,
        specialChars: /[!@#$%^&*(),.?":{}|<>]/
      }
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 254
    },
    phone: {
      pattern: /^\+503[6-7]\d{7}$/,
      format: '+503XXXXXXXX'
    },
    dui: {
      pattern: /^\d{8}-\d$/,
      format: '12345678-9'
    }
  },

  // Configuración de paginación
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100],
    maxPageSize: 100
  },

  // Configuración de notificaciones
  notifications: {
    position: 'top-right',
    duration: 5000,
    maxVisible: 5,
    types: {
      success: {
        icon: 'check-circle',
        color: 'green'
      },
      error: {
        icon: 'x-circle',
        color: 'red'
      },
      warning: {
        icon: 'alert-triangle',
        color: 'yellow'
      },
      info: {
        icon: 'info',
        color: 'blue'
      }
    }
  },

  // Configuración de formularios
  forms: {
    debounceDelay: 300,
    autoSave: true,
    autoSaveInterval: 30000, // 30 segundos
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  },

  // Configuración de cache
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutos
    maxSize: 100,
    keys: {
      user: 'aurora_user_cache',
      products: 'aurora_products_cache',
      categories: 'aurora_categories_cache'
    }
  },

  // Configuración de analytics
  analytics: {
    enabled: env.VITE_ANALYTICS_ENABLED === 'true',
    googleAnalyticsId: env.VITE_GA_ID,
    hotjarId: env.VITE_HOTJAR_ID,
    facebookPixelId: env.VITE_FB_PIXEL_ID
  },

  // Configuración de monitoreo de errores
  errorTracking: {
    enabled: env.VITE_ERROR_TRACKING_ENABLED === 'true',
    sentryDsn: env.VITE_SENTRY_DSN,
    logLevel: env.VITE_LOG_LEVEL || 'error'
  },

  // Configuración de características
  features: {
    darkMode: true,
    offlineMode: false,
    pushNotifications: false,
    realTimeUpdates: true,
    searchSuggestions: true,
    autoComplete: true
  },

  // Configuración de idiomas
  i18n: {
    defaultLocale: 'es',
    supportedLocales: ['es', 'en'],
    fallbackLocale: 'es',
    namespaces: ['common', 'auth', 'admin', 'forms']
  },

  // Configuración de temas
  themes: {
    light: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#1F2937',
      textSecondary: '#6B7280'
    },
    dark: {
      primary: '#60A5FA',
      secondary: '#34D399',
      accent: '#FBBF24',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#D1D5DB'
    }
  },

  // Configuración de breakpoints
  breakpoints: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  },

  // Configuración de animaciones
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};

/**
 * Configuración específica por ambiente
 */
export const environmentConfig = {
  development: {
    api: {
      baseUrl: 'https://aurora-production-7e57.up.railway.app/api',
      timeout: 30000
    },
    logging: {
      level: 'debug',
      enabled: true
    },
    features: {
      debugMode: true,
      mockData: true
    }
  },
  production: {
    api: {
      baseUrl: env.VITE_API_URL || 'https://aurora-production-7e57.up.railway.app/api',
      timeout: 10000
    },
    logging: {
      level: 'error',
      enabled: false
    },
    features: {
      debugMode: false,
      mockData: false
    }
  },
  test: {
    api: {
      baseUrl: 'https://aurora-production-7e57.up.railway.app/api',
      timeout: 5000
    },
    logging: {
      level: 'warn',
      enabled: true
    }
  }
};

/**
 * Obtener configuración por ambiente actual
 */
export const getEnvironmentConfig = () => {
  const mode = env.MODE || 'development';
  return environmentConfig[mode] || environmentConfig.development;
};

/**
 * Obtener configuración completa
 */
export const getConfig = () => {
  const envConfig = getEnvironmentConfig();
  return {
    ...config,
    ...envConfig
  };
};

/**
 * Validar configuración crítica
 */
export const validateConfig = () => {
  const required = [
    'api.baseUrl',
    'cloudinary.cloudName',
    'cloudinary.uploadPreset'
  ];

  const missing = [];

  required.forEach(key => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    if (!value) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.warn(`Configuración faltante: ${missing.join(', ')}`);
  }

  return missing.length === 0;
};

/**
 * Utilidades de configuración
 */
export const configUtils = {
  /**
   * Obtener URL completa de la API
   */
  getApiUrl: (endpoint = '') => {
    const baseUrl = config.api.baseUrl.replace(/\/$/, '');
    const cleanEndpoint = endpoint.replace(/^\//, '');
    return `${baseUrl}/${cleanEndpoint}`;
  },

  /**
   * Obtener URL de Cloudinary
   */
  getCloudinaryUrl: (publicId, transformation = '') => {
    const { cloudName } = config.cloudinary;
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
    const transform = transformation ? `/${transformation}` : '';
    return `${baseUrl}${transform}/${publicId}`;
  },

  /**
   * Verificar si es ambiente de desarrollo
   */
  isDevelopment: () => env.MODE === 'development',

  /**
   * Verificar si es ambiente de producción
   */
  isProduction: () => env.MODE === 'production',

  /**
   * Verificar si es ambiente de pruebas
   */
  isTest: () => env.MODE === 'test'
};

export default config; 