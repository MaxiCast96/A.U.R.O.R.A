import React, { useMemo, useState } from 'react';
import useCatalogoModificaciones from '../../hooks/useCatalogoModificaciones';

export default function CustomizacionesModal({
  open,
  onClose,
  initial = [],
  allowEditPrice = true,
  onSave
}) {
  const { mods, loading, error } = useCatalogoModificaciones({ activos: true });
  const [local, setLocal] = useState(() => initial.map(m => ({ ...m })));

  React.useEffect(() => {
    setLocal(initial.map(m => ({ ...m })));
  }, [initial, open]);

  const byCodigo = useMemo(() => Object.fromEntries(local.map(m => [m.codigo, m])), [local]);

  const toggleItem = (m) => {
    const exists = byCodigo[m.codigo];
    if (exists) {
      setLocal(prev => prev.filter(x => x.codigo !== m.codigo));
    } else {
      setLocal(prev => [...prev, { codigo: m.codigo, nombre: m.nombre, descripcion: m.descripcion || '', precio: Number(m.precioBase || 0), cantidad: 1 }]);
    }
  };

  const updateField = (codigo, field, value) => {
    setLocal(prev => prev.map(x => x.codigo === codigo ? { ...x, [field]: value } : x));
  };

  const totalSeleccion = local.reduce((acc, x) => acc + Number(x.precio || 0) * Number(x.cantidad || 0), 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/0">
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full mx-4 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Seleccionar Modificaciones</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {loading && <div className="p-4 text-center">Cargando opciones...</div>}
        {error && <div className="p-4 text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="max-h-80 overflow-auto divide-y divide-gray-100 border rounded-xl">
            {mods.map((m) => {
              const selected = !!byCodigo[m.codigo];
              const cur = byCodigo[m.codigo];
              return (
                <div key={m.codigo} className={`flex items-center p-3 sm:p-4 ${selected ? 'bg-blue-50' : ''}`}>
                  <input
                    type="checkbox"
                    className="mr-3"
                    checked={selected}
                    onChange={() => toggleItem(m)}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{m.nombre}</div>
                    <div className="text-sm text-gray-500">{m.descripcion}</div>
                  </div>
                  {selected && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={1}
                        className="w-20 px-2 py-1 border rounded-lg"
                        value={cur.cantidad}
                        onChange={(e) => updateField(m.codigo, 'cantidad', Number(e.target.value))}
                        title="Cantidad"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        className="w-24 px-2 py-1 border rounded-lg"
                        value={cur.precio}
                        onChange={(e) => allowEditPrice && updateField(m.codigo, 'precio', Number(e.target.value))}
                        disabled={!allowEditPrice}
                        title="Precio"
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {mods.length === 0 && (
              <div className="p-4 text-center text-gray-500">No hay opciones disponibles.</div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">Total modificaciones: <span className="font-semibold">${totalSeleccion.toFixed(2)}</span></div>
          <div className="space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
            <button
              onClick={() => onSave && onSave(local)}
              className="px-4 py-2 bg-[#0097c2] text-white rounded hover:bg-[#0077a2]"
            >Aplicar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
