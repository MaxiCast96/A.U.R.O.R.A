// Configuración de la API con fallback dinámico (localhost -> render)
const LOCAL_BASE = 'http://localhost:4000/api';
const PROD_BASE = 'https://aurora-production-7e57.up.railway.app/api';
const ENV_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? String(import.meta.env.VITE_API_BASE_URL).trim()
  : '';

// Para evitar errores iniciales si el backend local no está arriba aún,
// empezar en PROD y cambiar a LOCAL cuando el ping confirme disponibilidad.
let ACTIVE_BASE = ENV_BASE || PROD_BASE;

// Ping con timeout corto para decidir en runtime
const ping = async (url, path = '/health', timeoutMs = 1200) => {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url.replace(/\/$/, '') + path, { method: 'GET', signal: controller.signal, credentials: 'include' }).catch(() => null);
    clearTimeout(t);
    return !!(res && res.ok);
  } catch (_) {
    return false;
  }
};

// Resolver automáticamente: preferir localhost si responde, de lo contrario usar PROD
(async () => {
  // Si ya se forzó por ENV, no modificar
  if (ENV_BASE) {
    ACTIVE_BASE = ENV_BASE;
    return;
  }
  const okLocal = await ping(LOCAL_BASE, '/'); // ruta raíz suele responder
  ACTIVE_BASE = okLocal ? LOCAL_BASE : PROD_BASE;
  // Debug opcional
  if (!import.meta.env.PROD) console.log('[API] BASE_URL activo:', ACTIVE_BASE);
})();

export const API_CONFIG = {
  // URL base de la API (puede actualizarse en runtime)
  get BASE_URL() { return ACTIVE_BASE; },
  set BASE_URL(v) { ACTIVE_BASE = v; },
  
  // Endpoints disponibles
  ENDPOINTS: {
    LENTES: '/lentes',
    ACCESORIOS: '/accesorios',
    PRODUCTOS_PERSONALIZADOS: '/productosPersonalizados',
    MARCAS: '/marcas',
    CATEGORIAS: '/categoria',
    CLIENTES: '/clientes',
    EMPLEADOS: '/empleados',
    SUCURSALES: '/sucursales',
    PROMOCIONES: '/promociones',
    COTIZACIONES: '/cotizaciones',
    PEDIDOS: '/pedidos',
    CATALOGO_MODIFICACIONES: '/catalogoModificaciones',
    VENTAS: '/ventas',
    RECETAS: '/recetas',
    CITAS: '/citas',
    HISTORIAL_MEDICO: '/historialMedico',
    OPTOMETRISTAS: '/optometrista',
    AUTH: '/auth',
    DASHBOARD: '/dashboard',
    CARRITO: '/carrito',
    REGISTRO_CLIENTES: '/registroClientes',
    REGISTRO_EMPLEADOS: '/registroEmpleados',
    AUDITORIA: '/auditoria'
  },
  
  // Configuración de fetch
  FETCH_CONFIG: {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Incluir cookies para autenticación
  },
  
  // Timeouts
  TIMEOUTS: {
    REQUEST: 60000, // 60 segundos (aumentado para evitar timeouts)
    RETRY_DELAY: 2000, // 2 segundos (aumentado para dar más tiempo)
    MAX_RETRIES: 2 // Reducido para evitar múltiples reintentos largos
  },
  
  // Estados de respuesta esperados
  RESPONSE_STATUS: {
    SUCCESS: 'success',
    ERROR: 'error'
  }
};

// Función para construir URLs completas
export const buildApiUrl = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }
  
  return url;
};

// Función para validar respuestas de la API
export const validateApiResponse = (response) => {
  // Debug: Log de la respuesta para debugging
  if (!import.meta.env.PROD) {
    console.log('validateApiResponse - Raw response:', response);
    console.log('validateApiResponse - Response type:', typeof response);
    console.log('validateApiResponse - Is array:', Array.isArray(response));
  }
  
  if (!response || typeof response !== 'object') {
    if (!import.meta.env.PROD) console.log('validateApiResponse - Invalid response type');
    return { isValid: false, error: 'Respuesta inválida de la API' };
  }
  
  // Si la respuesta tiene el formato {success: false, message: "..."}
  if (response.success === false) {
    if (!import.meta.env.PROD) console.log('validateApiResponse - Success false detected');
    return { isValid: false, error: response.message || 'Error en la respuesta de la API' };
  }
  
  // Si la respuesta tiene el formato {success: true, data: [...]}
  if (response.success === true && response.data !== undefined) {
    if (!import.meta.env.PROD) console.log('validateApiResponse - Success true with data detected');
    return { isValid: true, data: response.data };
  }
  
  // Si la respuesta es directamente un array (formato del backend actual)
  if (Array.isArray(response)) {
    if (!import.meta.env.PROD) console.log('validateApiResponse - Array response detected');
    return { isValid: true, data: response };
  }
  
  // Si la respuesta es un objeto con propiedades pero no tiene el formato esperado
  // Asumimos que es válido si no es un error explícito
  if (response.message && response.message.includes('Error')) {
    if (!import.meta.env.PROD) console.log('validateApiResponse - Error message detected');
    return { isValid: false, error: response.message };
  }
  
  // Para otros casos, asumimos que la respuesta es válida
  if (!import.meta.env.PROD) console.log('validateApiResponse - Default case - assuming valid');
  return { isValid: true, data: response };
};

// Función para manejar errores de la API
export const handleApiError = (error, resource = '') => {
  if (!import.meta.env.PROD) console.error(`Error en API ${resource}:`, error);
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }
  
  if (error.status === 404) {
    return 'Recurso no encontrado.';
  }
  
  if (error.status === 500) {
    return 'Error interno del servidor. Por favor, intenta más tarde.';
  }
  
  if (error.status === 401) {
    return 'No autorizado. Por favor, inicia sesión.';
  }
  
  if (error.status === 403) {
    return 'Acceso denegado.';
  }
  
  return error.message || 'Error desconocido.';
};

export default API_CONFIG;
