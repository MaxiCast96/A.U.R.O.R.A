import { useState, useEffect } from 'react';
import { buildApiUrl, validateApiResponse, handleApiError, API_CONFIG } from '../config/api.js';

/**
 * Hook personalizado para manejar datos de la API del backend
 * @param {string} resource - Recurso a consultar (ej: 'lentes', 'accesorios')
 * @param {Object} params - Parámetros de consulta opcionales
 * @returns {Object} Objeto con data, loading, error y success
 */
export const useApiData = (resource, params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;
    
    const fetchData = async (retryCount = 0) => {
      try {
        setLoading(true);
        setError(null);
        
        // Construir URL usando la configuración centralizada
        const url = buildApiUrl(`/${resource}`, params);
        console.log(`Fetching data from: ${url}`);

        // Configurar timeout
        const controller = new AbortController();
        timeoutId = setTimeout(() => {
          console.log(`Timeout para ${resource} después de ${API_CONFIG.TIMEOUTS.REQUEST}ms`);
          controller.abort();
        }, API_CONFIG.TIMEOUTS.REQUEST);

        const response = await fetch(url, {
          ...API_CONFIG.FETCH_CONFIG,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
        }

        const result = await response.json();
        console.log(`API Response for ${resource}:`, result);
        console.log(`Response status: ${response.status}`);
        console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

        if (isMounted) {
          // Validar la respuesta usando la función centralizada
          // Capturar paginación si viene en el payload
          if (result && typeof result === 'object' && result.pagination) {
            setPagination(result.pagination);
          } else {
            setPagination(null);
          }

          const validation = validateApiResponse(result);
          
          if (validation.isValid) {
            // Asegurar que data sea siempre un array
            const dataArray = Array.isArray(validation.data) ? validation.data : [validation.data];
            setData(dataArray);
            setSuccess(true);
            setError(null);
          } else {
            console.warn(`API response for ${resource} validation failed:`, validation.error);
            console.warn(`Raw response:`, result);
            setData([]);
            setSuccess(false);
            setError(validation.error);
          }
        }
      } catch (err) {
        clearTimeout(timeoutId);
        
        if (err.name === 'AbortError') {
          if (isMounted) {
            console.warn(`Request aborted for ${resource} due to timeout`);
            setError('La solicitud tardó demasiado. Por favor, intenta nuevamente.');
            setSuccess(false);
            setData([]);
          }
          return;
        }

        // Intentar reintentar si es un error de red o timeout y no hemos excedido el máximo de reintentos
        if (retryCount < API_CONFIG.TIMEOUTS.MAX_RETRIES && 
            (err.name === 'AbortError' || err.message.includes('fetch') || err.message.includes('network'))) {
          console.log(`Retrying ${resource} (attempt ${retryCount + 1}/${API_CONFIG.TIMEOUTS.MAX_RETRIES})`);
          
          // Esperar un poco más antes de reintentar
          const delay = API_CONFIG.TIMEOUTS.RETRY_DELAY * Math.pow(2, retryCount); // Backoff exponencial
          
          setTimeout(() => {
            if (isMounted) {
              fetchData(retryCount + 1);
            }
          }, delay);
          
          return;
        }

        if (isMounted) {
          const errorMessage = handleApiError(err, resource);
          setError(errorMessage);
          setSuccess(false);
          setData([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [resource, JSON.stringify(params)]);

  return { data, loading, error, success, pagination };
};

export default useApiData;
