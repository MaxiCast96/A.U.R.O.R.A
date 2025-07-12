import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageTransition from '../../components/transition/PageTransition';
import Navbar from '../../components/layout/Navbar';

// Componente hijo que recibe TODOS los datos como props desde el padre
const VerCotizacion = ({ 
  cotizacion = null, 
  loading = false, 
  error = null, 
  onConvertirACompra = null 
}) => {
  const { id } = useParams();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleConvertirACompra = () => {
    setShowConfirmDialog(true);
  };

  const confirmarCompra = () => {
    if (onConvertirACompra) {
      onConvertirACompra(id);
    }
    setShowConfirmDialog(false);
  };

  const getEstadoColor = (estado) => {
    const estados = {
      'Pendiente': 'bg-yellow-100 text-yellow-700',
      'Convertido a Compra': 'bg-green-100 text-green-700',
      'Cancelado': 'bg-red-100 text-red-700'
    };
    return estados[estado] || estados['Pendiente'];
  };

  // Mostrar estados de carga y error
  if (loading) {
    return (
      <PageTransition>
        <Navbar />
        <div className="container mx-auto px-4 py-8 font-['Lato']">
          <div className="p-8 text-center">Cargando cotización...</div>
        </div>
      </PageTransition>
    );
  }
  
  if (error) {
    return (
      <PageTransition>
        <Navbar />
        <div className="container mx-auto px-4 py-8 font-['Lato']">
          <div className="p-8 text-center text-red-500">Error: {error}</div>
        </div>
      </PageTransition>
    );
  }
  
  if (!cotizacion) {
    return (
      <PageTransition>
        <Navbar />
        <div className="container mx-auto px-4 py-8 font-['Lato']">
          <div className="p-8 text-center">No se encontró la cotización.</div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Navbar />
      <div className="container mx-auto px-4 py-8 font-['Lato']">
        {/* Encabezado y Acciones */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Cotización {cotizacion.numero || cotizacion.id}
          </h1>
          <div className="flex space-x-4">
            {cotizacion.estado === 'Pendiente' && (
              <button 
                onClick={handleConvertirACompra}
                className="flex items-center bg-[#0097c2] text-white px-4 py-2 rounded-lg hover:bg-[#0077a2] transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Convertir a Compra
              </button>
            )}
            <button className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar PDF
            </button>
            <Link
              to="/cotizaciones"
              className="flex items-center text-[#0097c2] hover:text-[#0077a2] transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </Link>
          </div>
        </div>

        {/* Modal de Confirmación */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Confirmar Conversión</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas convertir esta cotización en una compra? 
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarCompra}
                  className="px-4 py-2 bg-[#0097c2] text-white rounded-lg hover:bg-[#0077a2] transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Información Principal */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Información de la Cotización</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Fecha:</span> {cotizacion.fecha || '-'}</p>
                <p><span className="font-medium">Estado:</span> 
                  <span className={`ml-2 px-3 py-1 text-xs font-medium rounded-full ${getEstadoColor(cotizacion.estado)}`}>
                    {cotizacion.estado || 'Pendiente'}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Información del Cliente</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Nombre:</span> {cotizacion.cliente?.nombre || '-'}</p>
                <p><span className="font-medium">Email:</span> {cotizacion.cliente?.email || '-'}</p>
                <p><span className="font-medium">Teléfono:</span> {cotizacion.cliente?.telefono || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detalle de Items */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <h3 className="text-lg font-semibold p-6">Detalle de Productos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cotizacion.items && cotizacion.items.length > 0 ? (
                  cotizacion.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{item.producto}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.descripcion}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.cantidad}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">${item.precio?.toFixed(2) ?? '0.00'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">${((item.cantidad || 0) * (item.precio || 0)).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center py-4">No hay productos en esta cotización actualmente.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-end">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-2">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">${cotizacion.total?.toFixed(2) ?? '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default VerCotizacion;