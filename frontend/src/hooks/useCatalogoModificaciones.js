import { useEffect, useState } from 'react';
import { API_CONFIG, buildApiUrl, handleApiError } from '../config/api';

export default function useCatalogoModificaciones({ activos = true } = {}) {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchMods = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = buildApiUrl(API_CONFIG.ENDPOINTS.CATALOGO_MODIFICACIONES, activos ? { activos: 'true' } : {});
        const res = await fetch(url, { ...API_CONFIG.FETCH_CONFIG, method: 'GET' });
        const data = await res.json();
        if (!mounted) return;
        setMods(Array.isArray(data) ? data : (data.data || []));
      } catch (e) {
        if (!mounted) return;
        setError(handleApiError(e, 'catalogoModificaciones'));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchMods();
    return () => { mounted = false; };
  }, [activos]);

  return { mods, loading, error, reload: () => {} };
}
