import { useEffect, useState } from 'react';
import { API_CONFIG, buildApiUrl, handleApiError } from '../config/api';

export default function useProductosBasicos() {
  const [lentes, setLentes] = useState([]);
  const [accesorios, setAccesorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const urlLentes = buildApiUrl(API_CONFIG.ENDPOINTS.LENTES);
        const urlAcc = buildApiUrl(API_CONFIG.ENDPOINTS.ACCESORIOS);
        const [resL, resA] = await Promise.all([
          fetch(urlLentes, { ...API_CONFIG.FETCH_CONFIG, method: 'GET' }),
          fetch(urlAcc, { ...API_CONFIG.FETCH_CONFIG, method: 'GET' }),
        ]);
        const [dataL, dataA] = await Promise.all([resL.json(), resA.json()]);
        if (!mounted) return;
        setLentes(Array.isArray(dataL) ? dataL : (dataL.data || []));
        setAccesorios(Array.isArray(dataA) ? dataA : (dataA.data || []));
      } catch (e) {
        if (!mounted) return;
        setError(handleApiError(e, 'productos'));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAll();
    return () => { mounted = false; };
  }, []);

  return { lentes, accesorios, loading, error };
}
