import React, { useMemo, useState, useEffect } from 'react';
import useCatalogoModificaciones from '../../hooks/useCatalogoModificaciones';

export default function PersonalizadoBuilderModal({ open, onClose, onSave }) {
  const { mods, loading, error } = useCatalogoModificaciones({ activos: true });

  const [seleccion, setSeleccion] = useState([]);

  useEffect(() => {
    if (open) {
      // Al abrir, limpia para que apliquen preselecciones por defecto
      setSeleccion([]);
    } else {
      // Al cerrar, limpia estado para no mantener selección previa
      setSeleccion([]);
    }
  }, [open]);

  // Preselecciones por defecto al abrir (si hay catálogo y no hay selección):
  // Material: CR-39, Índice: 1.50, Diseño: Monofocal, Montura: Acetato
  useEffect(() => {
    if (!open) return;
    if (!mods || mods.length === 0) return;
    if (seleccion.length > 0) return;
    const preferCodes = {
      material_lente: ['MAT-CR39'],
      indice_refraccion: ['IDX-150'],
      diseno_lente: ['DSN-MONO'],
      montura: ['MNT-ACET']
    };
    const preferNames = {
      material_lente: ['CR-39', 'CR39'],
      indice_refraccion: ['1.50', '1,50'],
      diseno_lente: ['Monofocal'],
      montura: ['Acetato']
    };
    const pickForCat = (cat) => {
      const items = mods.filter(m => (m.categoria || 'general') === cat);
      if (items.length === 0) return null;
      const byCode = items.find(i => (preferCodes[cat]||[]).includes(i.codigo));
      if (byCode) return byCode;
      const byName = items.find(i => (preferNames[cat]||[]).some(n => (i.nombre||'').toLowerCase().includes(n.toLowerCase())));
      return byName || null;
    };
    const cats = ['material_lente','indice_refraccion','diseno_lente','montura'];
    const picks = cats.map(c => pickForCat(c)).filter(Boolean);
    if (picks.length > 0) {
      setSeleccion(picks.map(m => ({
        codigo: m.codigo,
        nombre: m.nombre,
        descripcion: m.descripcion || '',
        precio: Number(m.precioBase || 0),
        cantidad: 1,
        categoria: m.categoria || 'general'
      })));
    }
  }, [open, mods]);

  const byCodigo = useMemo(() => Object.fromEntries(seleccion.map(m => [m.codigo, m])), [seleccion]);

  // Agrupar por categoría y conocer si la categoría es de selección única
  const categoriasOrden = ['material_lente', 'indice_refraccion', 'diseno_lente', 'tratamiento', 'montura', 'general'];
  const modsPorCategoria = useMemo(() => {
    const groups = {};
    (mods || []).forEach(m => {
      const cat = m.categoria || 'general';
      if (!groups[cat]) groups[cat] = { items: [], seleccionUnica: !!m.seleccionUnica };
      groups[cat].items.push(m);
      // Si cualquier item de la categoría marca seleccionUnica, la categoría se considera única
      if (m.seleccionUnica) groups[cat].seleccionUnica = true;
    });
    return groups;
  }, [mods]);

  const toggleItem = (m) => {
    const exists = byCodigo[m.codigo];
    const categoria = m.categoria || 'general';
    const catInfo = modsPorCategoria[categoria] || { seleccionUnica: false };
    if (exists) {
      // Des-seleccionar
      setSeleccion(prev => prev.filter(x => x.codigo !== m.codigo));
    } else {
      setSeleccion(prev => {
        let next = [...prev];
        if (catInfo.seleccionUnica) {
          // Remover cualquier selección previa de la misma categoría
          next = next.filter(x => x.categoria !== categoria);
        }
        next.push({ 
          codigo: m.codigo, 
          nombre: m.nombre, 
          descripcion: m.descripcion || '', 
          precio: Number(m.precioBase || 0), 
          cantidad: 1,
          categoria
        });
        return next;
      });
    }
  };

  const updateField = (codigo, field, value) => {
    setSeleccion(prev => prev.map(x => x.codigo === codigo ? { ...x, [field]: value } : x));
  };

  // Total: suma de todos los elementos seleccionados del catálogo
  const total = seleccion.reduce((acc, x) => acc + Number(x.precio || 0) * Number(x.cantidad || 0), 0);

  const seleccionPorCategoria = useMemo(() => {
    const map = {};
    seleccion.forEach(s => { map[s.categoria] = map[s.categoria] ? [...map[s.categoria], s] : [s]; });
    return map;
  }, [seleccion]);

  const requiredCats = ['material_lente', 'indice_refraccion', 'diseno_lente', 'montura'];
  const isValid = requiredCats.every(cat => (seleccionPorCategoria[cat] || []).length === 1);

  const handleSave = () => {
    // Debug log
    console.log('[PersonalizadoBuilderModal] handleSave clicked, isValid=', isValid, 'seleccion=', seleccion);
    const mat = (seleccionPorCategoria['material_lente'] || [])[0]?.nombre || 'Material';
    const idx = (seleccionPorCategoria['indice_refraccion'] || [])[0]?.nombre || 'Índice';
    const dis = (seleccionPorCategoria['diseno_lente'] || [])[0]?.nombre || 'Diseño';
    const mnt = (seleccionPorCategoria['montura'] || [])[0]?.nombre || 'Montura';
    const nombre = `Personalizado - ${mnt} - ${dis} - ${mat} - ${idx}`;
    const item = {
      productoId: null,
      nombre,
      categoria: 'Personalizados',
      cantidad: 1,
      precioUnitario: total,
      tipo: 'personalizado',
      especificaciones: {
        material: mat,
        indice: idx,
        diseno: dis,
        montura: mnt,
        tratamientos: (seleccionPorCategoria['tratamiento'] || []).map(t => t.nombre)
      },
      customizaciones: seleccion
    };
    if (onSave) {
      console.log('[PersonalizadoBuilderModal] onSave dispatched with item=', item);
      onSave(item);
    } else {
      console.warn('[PersonalizadoBuilderModal] onSave prop is not provided');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/0">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Crear Producto Personalizado</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* La personalización se realiza exclusivamente con el catálogo por categorías */}

        {/* Total dinámico mostrado al final */}

        <div className="mt-2">
          <div className="font-medium mb-2">Modificaciones (catálogo)</div>
          {loading && <div className="p-3 text-center">Cargando opciones...</div>}
          {error && <div className="p-3 text-center text-red-500">{error}</div>}
          {!loading && !error && (
            <div className="max-h-[55vh] overflow-auto border rounded-xl divide-y divide-gray-100">
              {categoriasOrden.filter(cat => !!modsPorCategoria[cat]).map(cat => {
                const section = modsPorCategoria[cat];
                return (
                  <div key={cat}>
                    <div className="px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      {cat === 'material_lente' ? 'Material de la lente' :
                       cat === 'indice_refraccion' ? 'Índice de refracción' :
                       cat === 'tratamiento' ? 'Tratamientos y recubrimientos' :
                       cat === 'diseno_lente' ? 'Diseño de la lente' :
                       cat === 'montura' ? 'Montura' : 'General'}
                      {section.seleccionUnica ? ' (selección única)' : ''}
                    </div>
                    {section.items.sort((a,b)=> (a.orden??0)-(b.orden??0)).map(m => {
                      const selected = !!byCodigo[m.codigo];
                      const cur = byCodigo[m.codigo];
                      return (
                        <div key={m.codigo} className={`flex items-center p-3 sm:p-4 ${selected ? 'bg-blue-50' : ''}`}>
                          <input
                            type={section.seleccionUnica ? 'radio' : 'checkbox'}
                            name={`cat-${cat}`}
                            className="mr-3"
                            checked={selected}
                            onChange={() => toggleItem(m)}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{m.nombre}</div>
                            <div className="text-xs text-gray-500">{m.descripcion}</div>
                          </div>
                          {selected && (
                            <div className="flex items-center space-x-2">
                              <input type="number" min={1} className="w-20 px-2 py-1 border rounded-lg" value={cur.cantidad} onChange={(e) => updateField(m.codigo, 'cantidad', Number(e.target.value))} title="Cantidad" />
                              <input type="number" step="0.01" min={0} className="w-24 px-2 py-1 border rounded-lg" value={cur.precio} onChange={(e) => updateField(m.codigo, 'precio', Number(e.target.value))} title="Precio" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {(mods || []).length === 0 && (
                <div className="p-4 text-center text-gray-500">No hay modificaciones configuradas.</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700">Total personalizado: <span className="font-semibold">${total.toFixed(2)}</span></div>
          <div className="space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
            <button onClick={handleSave} disabled={!isValid} className={`px-4 py-2 rounded text-white ${isValid ? 'bg-[#0097c2] hover:bg-[#0077a2]' : 'bg-gray-300 cursor-not-allowed'}`}>Agregar</button>
          </div>
        </div>
        {!isValid && (
          <div className="mt-2 text-xs text-gray-500">
            Selecciona: Material, Índice, Diseño y Montura (una opción en cada categoría) para habilitar "Agregar".
          </div>
        )}
      </div>
    </div>
  );
}
