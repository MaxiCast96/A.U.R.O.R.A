import { useState, useEffect } from 'react';

/**
 * Custom hook para realizar peticiones HTTP
 * @param {string} url - URL de la API
 * @param {Object} options - Opciones de la petición fetch
 * @returns {Object} Objeto con data, loading y error
 */
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setData(null);

    // Configurar opciones por defecto
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Incluir cookies para autenticación
      ...options
    };

    fetch(url, defaultOptions)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) setData(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [url, JSON.stringify(options)]);

  return { data, loading, error };
};

// También exportar como default para compatibilidad
export default useFetch; 