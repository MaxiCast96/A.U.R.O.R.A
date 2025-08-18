import React from 'react';
import useProductosBasicos from '../../hooks/useProductosBasicos';

export default function SeleccionProductoModal({ open, onClose, onSelect }) {
  const { lentes, accesorios, loading, error } = useProductosBasicos();

  if (!open) return null;

  const renderItem = (item, tipoLista) => {
    const nombre = item.nombre || item.producto || item.modelo || 'Producto';
    const precio = (item.precio ?? item.precioUnitario ?? 0);
    const categoria = item.categoria || (tipoLista === 'lentes' ? 'Aros' : 'Accesorios');

    return (
      <div
        key={item._id}
        className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b"
        onClick={() => onSelect && onSelect({
          productoId: item._id,
          nombre,
          categoria,
          cantidad: 1,
          precio,
          tipo: categoria.toLowerCase().includes('aro') ? 'aro' : 'producto',
          customizaciones: []
        })}
        title="Seleccionar"
      >
        <div>
          <div className="font-medium text-gray-800">{nombre}</div>
          <div className="text-xs text-gray-500">{categoria}</div>
        </div>
        <div className="text-sm text-gray-700">${Number(precio).toFixed(2)}</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/10 backdrop-blur-sm md:backdrop-blur">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Seleccionar Producto</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {loading && <div className="p-4 text-center">Cargando productos...</div>}
        {error && <div className="p-4 text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 font-medium">Lentes / Aros</div>
              <div className="max-h-80 overflow-auto">
                {lentes.map((l) => renderItem(l, 'lentes'))}
                {lentes.length === 0 && (
                  <div className="p-3 text-center text-gray-500">No hay lentes disponibles.</div>
                )}
              </div>
            </div>

            <div className="border rounded overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 font-medium">Accesorios</div>
              <div className="max-h-80 overflow-auto">
                {accesorios.map((a) => renderItem(a, 'accesorios'))}
                {accesorios.length === 0 && (
                  <div className="p-3 text-center text-gray-500">No hay accesorios disponibles.</div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
