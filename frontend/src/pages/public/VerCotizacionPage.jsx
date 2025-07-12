import React from 'react';
import { useParams } from 'react-router-dom';
import useData from '../../hooks/useData';
import VerCotizacion from '../../components/Cotizaciones/VerCotizacion';

// Página padre que maneja los datos y los pasa como props al componente hijo
const VerCotizacionPage = () => {
  const { id } = useParams();
  
  // TODOS los datos se manejan en el componente padre (VerCotizacionPage)
  const { data: cotizacion, loading, error } = useData(`cotizaciones/${id}`);

  // Handler para convertir a compra (se pasa como prop)
  const handleConvertirACompra = async (cotizacionId) => {
    try {
      const res = await fetch(`http://localhost:4000/api/cotizaciones/${cotizacionId}/convertir`, {
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