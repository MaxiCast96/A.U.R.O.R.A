import React from "react";
import PageTransition from "../transition/PageTransition";
import Navbar from "../layout/Navbar";

// Componente hijo que recibe TODOS los datos y handlers como props desde el padre
const CrearCotizacion = ({
  user = null,
  productos = [],
  clienteInfo = {},
  loading = false,
  error = null,
  success = false,
  fechaCreacion = new Date(),
  fechaValidez = new Date(),
  onCrearCotizacion = null,
  onAgregarProducto = null,
  onEliminarProducto = null,
  onUpdateClienteInfo = null,
  cotizacionData = {}
}) => {

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onCrearCotizacion) {
      onCrearCotizacion(cotizacionData);
    }
  };

  const handleClienteInfoChange = (field, value) => {
    if (onUpdateClienteInfo) {
      onUpdateClienteInfo({ ...clienteInfo, [field]: value });
    }
  };

  const handleEliminarProducto = (index) => {
    if (onEliminarProducto) {
      onEliminarProducto(index);
    }
  };

  if (!user) {
    return (
      <PageTransition>
        <Navbar />
        <div className="container mx-auto px-4 py-8 font-['Lato']">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Crear Cotización</h1>
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded text-center">
            Debes iniciar sesión para crear una cotización.
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Navbar />
      <div className="container mx-auto px-4 py-8 font-['Lato']">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Crear Cotización</h1>
        {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">Cotización creada correctamente.</div>}
        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
        
        {/* Información de la cotización */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Fecha de creación</p>
              <p className="font-semibold text-gray-800">{fechaCreacion.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Válida hasta</p>
              <p className="font-semibold text-gray-800">{fechaValidez.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <p className="font-semibold text-yellow-600">Pendiente</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información del cliente */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Información de Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={clienteInfo.correoCliente || ''}
                  onChange={(e) => handleClienteInfoChange('correoCliente', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={clienteInfo.telefonoCliente || ''}
                  onChange={(e) => handleClienteInfoChange('telefonoCliente', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Productos</h2>
            <button
              type="button"
              className="bg-[#0097c2] text-white px-6 py-2 rounded-lg shadow-sm hover:bg-[#0077a2] transition-all mb-6"
              onClick={() => {/* Abrir modal para agregar producto */}}
            >
              Agregar Producto
            </button>
            <div className="overflow-hidden rounded-xl shadow-sm">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cantidad</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {productos.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4">No hay productos agregados actualmente.</td></tr>
                  ) : (
                    productos.map((prod, idx) => (
                      <tr key={idx}>
                        <td>{prod.producto}</td>
                        <td>{prod.cantidad}</td>
                        <td>${prod.precio?.toFixed(2) ?? '0.00'}</td>
                        <td>${((prod.cantidad || 0) * (prod.precio || 0)).toFixed(2)}</td>
                        <td>
                          <button 
                            type="button" 
                            onClick={() => handleEliminarProducto(idx)} 
                            className="text-red-500 hover:underline"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Resumen</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${productos.reduce((acc, p) => acc + (p.cantidad || 0) * (p.precio || 0), 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>IVA (13%)</span>
                <span>${(productos.reduce((acc, p) => acc + (p.cantidad || 0) * (p.precio || 0), 0) * 0.13).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-800 pt-3">
                <span>Total</span>
                <span>${(productos.reduce((acc, p) => acc + (p.cantidad || 0) * (p.precio || 0), 0) * 1.13).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0097c2] text-white px-6 py-2 rounded-lg shadow-sm hover:bg-[#0077a2] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Cotización'}
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
};

export default CrearCotizacion;