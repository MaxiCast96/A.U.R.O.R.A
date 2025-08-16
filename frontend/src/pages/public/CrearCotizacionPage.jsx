import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthContext';
import CrearCotizacion from '../../components/Cotizaciones/CrearCotizacion';
import { API_CONFIG, buildApiUrl } from '../../config/api';
import Alert, { ToastContainer, useAlert } from '../../components/ui/Alert';

// Página padre que maneja los datos y la lógica, pasando todo como props al componente hijo
const CrearCotizacionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { alertState, showSuccess, showError, hideAlert } = useAlert();
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
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.COTIZACIONES);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cotizacionData)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al crear la cotización');
      }
      
      setSuccess(true);
      showSuccess('Cotización creada correctamente', 3000);
      setProductos([]);
      setClienteInfo({ correoCliente: '', telefonoCliente: '' });
      // Redirigir al listado
      setTimeout(() => navigate('/cotizaciones'), 300);
    } catch (err) {
      setError(err.message);
      showError(err.message || 'Error al crear la cotización', 4000);
    } finally {
      setLoading(false);
    }
  };

  // Handler para agregar producto (se pasa como prop)
  const handleAgregarProducto = (producto) => {
    setProductos([...productos, producto]);
    showSuccess('Producto agregado a la cotización', 2000);
  };

  // Handler para eliminar producto (se pasa como prop)
  const handleEliminarProducto = (index) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  // Handler para actualizar un producto (incluye customizaciones)
  const handleActualizarProducto = (index, nextProducto) => {
    setProductos(prev => prev.map((p, i) => i === index ? nextProducto : p));
  };

  // Handler para actualizar información del cliente (se pasa como prop)
  const handleUpdateClienteInfo = (newInfo) => {
    setClienteInfo(newInfo);
  };

  // Preparar datos para la cotización
  const cotizacionData = {
    clienteId: user?.id || user?.clienteId,
    correoCliente: clienteInfo.correoCliente,
    telefonoCliente: clienteInfo.telefonoCliente,
    productos: productos.map(p => ({
      productoId: p.productoId,
      nombre: p.nombre,
      categoria: p.categoria,
      cantidad: p.cantidad,
      precioUnitario: (p.precioUnitario ?? p.precio),
      tipo: p.tipo || 'aro',
      customizaciones: Array.isArray(p.customizaciones) ? p.customizaciones.map(m => ({
        codigo: m.codigo,
        nombre: m.nombre,
        descripcion: m.descripcion || '',
        precio: Number(m.precio || 0),
        cantidad: Number(m.cantidad || 1)
      })) : []
    })),
    fecha: fechaCreacion.toISOString(),
    validaHasta: fechaValidez.toISOString(),
    estado: 'pendiente'
  };

  return (
    <>
      <ToastContainer>
        <Alert 
          type={alertState.type}
          message={alertState.message}
          show={alertState.show}
          onClose={hideAlert}
          duration={alertState.duration}
        />
      </ToastContainer>
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
        onActualizarProducto={handleActualizarProducto}
        onUpdateClienteInfo={handleUpdateClienteInfo}
        cotizacionData={cotizacionData}
        onCancel={() => navigate('/cotizaciones')}
      />
    </>
  );
};

export default CrearCotizacionPage;