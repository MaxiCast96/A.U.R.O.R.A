import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import CrearCotizacion from '../../components/Cotizaciones/CrearCotizacion';

// Página padre que maneja los datos y la lógica, pasando todo como props al componente hijo
const CrearCotizacionPage = () => {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [clienteInfo, setClienteInfo] = useState({
    correoCliente: user?.correo || user?.email || '',
    telefonoCliente: user?.telefono || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const fechaCreacion = new Date();
  const fechaValidez = new Date(Date.now() + 30*24*60*60*1000);

  // Si el usuario cambia (por ejemplo, tras login), actualiza los campos precargados
  useEffect(() => {
    setClienteInfo({
      correoCliente: user?.correo || user?.email || '',
      telefonoCliente: user?.telefono || '',
    });
  }, [user]);

  // Handler para crear cotización (se pasa como prop)
  const handleCrearCotizacion = async (cotizacionData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const res = await fetch('https://a-u-r-o-r-a.onrender.com/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cotizacionData)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al crear la cotización');
      }
      
      setSuccess(true);
      setProductos([]);
      setClienteInfo({ correoCliente: '', telefonoCliente: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler para agregar producto (se pasa como prop)
  const handleAgregarProducto = (producto) => {
    setProductos([...productos, producto]);
  };

  // Handler para eliminar producto (se pasa como prop)
  const handleEliminarProducto = (index) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  // Handler para actualizar información del cliente (se pasa como prop)
  const handleUpdateClienteInfo = (newInfo) => {
    setClienteInfo(newInfo);
  };

  // Preparar datos para la cotización
  const cotizacionData = {
    clienteId: user?.clienteId,
    correoCliente: clienteInfo.correoCliente,
    telefonoCliente: clienteInfo.telefonoCliente,
    productos: productos.map(p => ({
      productoId: p.productoId,
      nombre: p.nombre,
      categoria: p.categoria,
      cantidad: p.cantidad,
      precioUnitario: p.precio
    })),
    fecha: fechaCreacion.toISOString(),
    validaHasta: fechaValidez.toISOString(),
    estado: 'pendiente'
  };

  return (
    <CrearCotizacion 
      user={user}
      productos={productos}
      clienteInfo={clienteInfo}
      loading={loading}
      error={error}
      success={success}
      fechaCreacion={fechaCreacion}
      fechaValidez={fechaValidez}
      onCrearCotizacion={handleCrearCotizacion}
      onAgregarProducto={handleAgregarProducto}
      onEliminarProducto={handleEliminarProducto}
      onUpdateClienteInfo={handleUpdateClienteInfo}
      cotizacionData={cotizacionData}
    />
  );
};

export default CrearCotizacionPage; 