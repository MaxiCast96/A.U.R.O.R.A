import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import useData from '../../hooks/useData';
import VerCotizacion from '../../components/Cotizaciones/VerCotizacion';

// Página padre que maneja los datos y los pasa como props al componente hijo
const VerCotizacionPage = () => {
  const { id } = useParams();
  const location = useLocation();

  // TODOS los datos se manejan en el componente padre (VerCotizacionPage)
  const { data: cotizacion, loading, error } = useData(`cotizaciones/${id}`);

  // Handler para convertir a compra (se pasa como prop)
  const handleConvertirACompra = async (cotizacionId) => {
    try {
      const res = await fetch(`https://a-u-r-o-r-a.onrender.com/api/cotizaciones/${cotizacionId}/convertir`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (res.ok) {
        // Aquí podrías actualizar el estado o redirigir
        console.log('Cotización convertida exitosamente');
      } else {
        console.error('Error al convertir la cotización');
      }
    } catch (err) {
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