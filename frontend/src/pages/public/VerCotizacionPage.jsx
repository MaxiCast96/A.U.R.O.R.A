import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import useData from '../../hooks/useData';
import VerCotizacion from '../../components/Cotizaciones/VerCotizacion';
import API_CONFIG, { buildApiUrl } from '../../config/api';

// Página padre que maneja los datos y los pasa como props al componente hijo
const VerCotizacionPage = () => {
  const { id } = useParams();
  const location = useLocation();

  // TODOS los datos se manejan en el componente padre (VerCotizacionPage)
  const { data: cotizacion, loading, error } = useData(`cotizaciones/${id}`);

  // Handler para convertir a compra (se pasa como prop)
  const handleConvertirACompra = async (cotizacionId) => {
    try {
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.COTIZACIONES}/${cotizacionId}/convertir-a-pedido`);
      const res = await fetch(url, {
        method: 'POST',
        credentials: API_CONFIG.FETCH_CONFIG.credentials,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.message || 'No se pudo convertir la cotización.');
        return;
      }
      alert('Cotización convertida en pedido correctamente.');
      // Recargar para reflejar estado actualizado
      window.location.reload();
    } catch (err) {
      alert('Error al convertir la cotización.');
      console.error('Error al convertir la cotización:', err);
    }
  };

  // Auto imprimir si viene de listado con ?print=1
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!loading && cotizacion && params.get('print') === '1') {
      setTimeout(() => window.print(), 250);
    }
  }, [location.search, loading, cotizacion]);

  return (
    <VerCotizacion 
      cotizacion={cotizacion}
      loading={loading}
      error={error}
      onConvertirACompra={handleConvertirACompra}
    />
  );
};

export default VerCotizacionPage; 