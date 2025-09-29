// src/components/Admin/management/LentesCristalesContent.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../config/api';
import { Glasses, Filter, Plus, RefreshCcw } from 'lucide-react';

const LentesCristalesContent = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const base = API_CONFIG.BASE_URL;
      const res = await axios.get(`${base}/lentes-cristales`);
      const data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setItems(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-700">Lentes (Cristales)</h2>
          <p className="text-gray-500">Gestión básica de catálogo de cristales</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
            <RefreshCcw size={16}/> Refrescar
          </button>
          <button disabled className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50">
            <Plus size={16}/> Agregar (Próximamente)
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow p-6 text-gray-500">Cargando...</div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4">{error}</div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material / Índice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((it) => (
                <tr key={it._id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border">
                        <Glasses className="w-6 h-6 text-gray-400"/>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{it.nombre}</div>
                        <div className="text-sm text-gray-500">{it.descripcion}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{it.marcaId?.nombre || '—'}</td>
                  <td className="px-6 py-4">{it.material} / {it.indice}</td>
                  <td className="px-6 py-4">${(it.enPromocion ? it.precioActual : it.precioBase)?.toFixed?.(2) || '0.00'}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={4}>Sin datos</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LentesCristalesContent;
