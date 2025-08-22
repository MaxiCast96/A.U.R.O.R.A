import React from "react";
import { useState } from "react";
import PageTransition from "../transition/PageTransition";
import Navbar from "../layout/Navbar";
import CustomizacionesModal from "./CustomizacionesModal";
import PersonalizadoBuilderModal from "./PersonalizadoBuilderModal";
import { useLocation } from "react-router-dom";

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
  onActualizarProducto = null,
  onUpdateClienteInfo = null,
  onCancel = null,
  cotizacionData = {}
}) => {
  const location = useLocation();
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customModalIndex, setCustomModalIndex] = useState(null);
  const [personalizadoOpen, setPersonalizadoOpen] = useState(false);

  const openCustomModal = (index) => {
    setCustomModalIndex(index);
    setCustomModalOpen(true);
  };

  const handleAgregarPersonalizadoClick = () => {
    setPersonalizadoOpen(true);
  };

  const handleSavePersonalizado = (item) => {
    if (!onAgregarProducto) return setPersonalizadoOpen(false);
    onAgregarProducto(item);
    setPersonalizadoOpen(false);
  };

  // Auto-abrir el constructor personalizado si venimos desde productos
  React.useEffect(() => {
    if (location.state && location.state.openPersonalizado) {
      setPersonalizadoOpen(true);
    }
  }, [location.state]);

  const closeCustomModal = () => {
    setCustomModalOpen(false);
    setCustomModalIndex(null);
  };

  const applyCustomizaciones = (mods) => {
    if (customModalIndex == null) return closeCustomModal();
    if (onActualizarProducto) {
      const prod = productos[customModalIndex] || {};
      const next = {
        ...prod,
        tipo: prod.tipo || 'aro',
        customizaciones: mods.map(m => ({
          codigo: m.codigo,
          nombre: m.nombre,
          descripcion: m.descripcion || '',
          precio: Number(m.precio || 0),
          cantidad: Number(m.cantidad || 1)
        }))
      };
      onActualizarProducto(customModalIndex, next);
    }
    closeCustomModal();
  };

  const calcProdSubtotal = (p) => {
    const unit = Number(p.precioUnitario ?? p.precio ?? 0);
    const base = (p.cantidad || 0) * unit;
    const mods = Array.isArray(p.customizaciones)
      ? p.customizaciones.reduce((acc, m) => acc + (Number(m.precio || 0) * Number(m.cantidad || 0)), 0)
      : 0;
    return base + mods;
  };

  const subtotal = productos.reduce((acc, p) => acc + calcProdSubtotal(p), 0);
  const iva = subtotal * 0.13;
  const total = subtotal + iva;

  const canSubmit = Boolean(clienteInfo?.correoCliente) && Boolean(clienteInfo?.telefonoCliente) && productos.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
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

  // No bloquear por autenticación desde el hijo; el padre debe encargarse del flujo de auth.

  return (
    <PageTransition>
      <Navbar />
      <div className="container mx-auto px-4 py-8 font-['Lato']">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Crear Cotización</h1>
        {success && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded border border-green-200">Cotización creada correctamente.</div>}
        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}
        
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
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg shadow-sm hover:bg-emerald-700 transition-all"
                onClick={handleAgregarPersonalizadoClick}
              >
                Crear Producto Personalizado
              </button>
            </div>
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
                        <td>
                          <div className="font-medium">{prod.nombre || prod.producto}</div>
                          {Array.isArray(prod.customizaciones) && prod.customizaciones.length > 0 && (
                            <div className="mt-1 text-xs text-gray-600 space-y-1">
                              {prod.customizaciones.map((m, i) => (
                                <div key={i} className="flex items-center justify-between">
                                  <span>• {m.nombre} x{m.cantidad}</span>
                                  <span>${(Number(m.precio||0)*Number(m.cantidad||0)).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td>{prod.cantidad}</td>
                        <td>${Number((prod.precioUnitario ?? prod.precio) ?? 0).toFixed(2)}</td>
                        <td>${calcProdSubtotal(prod).toFixed(2)}</td>
                        <td>
                          <button 
                            type="button" 
                            onClick={() => handleEliminarProducto(idx)} 
                            className="text-red-500 hover:underline"
                          >
                            Eliminar
                          </button>
                          <button
                            type="button"
                            onClick={() => openCustomModal(idx)}
                            className="ml-3 text-[#0097c2] hover:underline"
                          >
                            {prod.tipo === 'aro' ? 'Personalizar Aro' : 'Agregar Modificaciones'}
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
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>IVA (13%)</span>
                <span>${iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-800 pt-3">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              onClick={() => onCancel && onCancel()}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="bg-[#0097c2] text-white px-6 py-2 rounded-lg shadow-sm hover:bg-[#0077a2] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Cotización'}
            </button>
          </div>
        </form>

        {/* Modal de customizaciones */}
        <CustomizacionesModal
          open={customModalOpen}
          onClose={closeCustomModal}
          initial={(customModalIndex != null && productos[customModalIndex]?.customizaciones) || []}
          onSave={applyCustomizaciones}
        />

        {/* Modal de selección de producto */}
        {/* Eliminado: Selección de producto general (solo personalizado disponible) */}

        {/* Modal de producto personalizado */}
        <PersonalizadoBuilderModal
          open={personalizadoOpen}
          onClose={() => setPersonalizadoOpen(false)}
          onSave={handleSavePersonalizado}
        />
      </div>
    </PageTransition>
  );
};

export default CrearCotizacion;