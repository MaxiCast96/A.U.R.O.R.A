// Configuración de la API
export const API_CONFIG = {
  // URL base de la API
  BASE_URL: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL
    : (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
      ? 'http://localhost:4000/api'
      : 'https://a-u-r-o-r-a.onrender.com/api'),
  
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
    REGISTRO_EMPLEADOS: '/registroEmpleados'
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
  console.log('validateApiResponse - Raw response:', response);
  console.log('validateApiResponse - Response type:', typeof response);
  console.log('validateApiResponse - Is array:', Array.isArray(response));
  
  if (!response || typeof response !== 'object') {
    console.log('validateApiResponse - Invalid response type');
    return { isValid: false, error: 'Respuesta inválida de la API' };
  }
  
  // Si la respuesta tiene el formato {success: false, message: "..."}
  if (response.success === false) {
    console.log('validateApiResponse - Success false detected');
    return { isValid: false, error: response.message || 'Error en la respuesta de la API' };
  }
  
  // Si la respuesta tiene el formato {success: true, data: [...]}
  if (response.success === true && response.data !== undefined) {
    console.log('validateApiResponse - Success true with data detected');
    return { isValid: true, data: response.data };
  }
  
  // Si la respuesta es directamente un array (formato del backend actual)
  if (Array.isArray(response)) {
    console.log('validateApiResponse - Array response detected');
    return { isValid: true, data: response };
  }
  
  // Si la respuesta es un objeto con propiedades pero no tiene el formato esperado
  // Asumimos que es válido si no es un error explícito
  if (response.message && response.message.includes('Error')) {
    console.log('validateApiResponse - Error message detected');
    return { isValid: false, error: response.message };
  }
  
  // Para otros casos, asumimos que la respuesta es válida
  console.log('validateApiResponse - Default case - assuming valid');
  return { isValid: true, data: response };
};

// Función para manejar errores de la API
export const handleApiError = (error, resource = '') => {
  console.error(`Error en API ${resource}:`, error);
  
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
