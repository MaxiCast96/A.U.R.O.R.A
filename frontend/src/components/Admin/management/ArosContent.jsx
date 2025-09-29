// src/components/Admin/management/ArosContent.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../config/api';
import { Glasses, Filter, RefreshCcw, Plus, Edit, Trash2, Star, Tag } from 'lucide-react';

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
    <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center">
      {icon}
    </div>
  </div>
);

const ArosContent = () => {
  const base = API_CONFIG.BASE_URL;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcaId, setMarcaId] = useState('todos');
  const [categoriaId, setCategoriaId] = useState('todos');
  const [promosOnly, setPromosOnly] = useState(false);

  // Sorting controls
  const [sortBy, setSortBy] = useState('nombre'); // nombre | precio | marca
  const [sortDir, setSortDir] = useState('asc');   // asc | desc

  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [arosRes, marcasRes, catRes] = await Promise.all([
        axios.get(`${base}/aros`, { params: { page, limit } }),
        axios.get(`${base}/marcas`),
        axios.get(`${base}/categoria`),
      ]);
      const payload = arosRes.data || {};
      const data = Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);
      setItems(data);
      if (payload.pagination) setPagination(payload.pagination);
      setMarcas(Array.isArray(marcasRes.data?.data) ? marcasRes.data.data : (marcasRes.data || []));
      setCategorias(Array.isArray(catRes.data?.data) ? catRes.data.data : (catRes.data || []));
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [base, page, limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    const res = items.filter(it => {
      if (promosOnly && !it.enPromocion) return false;
      if (marcaId !== 'todos' && (it.marcaId?._id || it.marcaId) !== marcaId) return false;
      if (categoriaId !== 'todos' && (it.categoriaId?._id || it.categoriaId) !== categoriaId) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = [it.nombre, it.descripcion, it.material, it.color, it.tipoLente]
          .some(v => (v || '').toLowerCase().includes(q));
        if (!hay) return false;
      }
      return true;
    });
    // Sorting
    const valOf = (it) => {
      if (sortBy === 'precio') return (it.enPromocion ? it.precioActual : it.precioBase) ?? 0;
      if (sortBy === 'marca') return (it.marcaId?.nombre || '').toLowerCase();
      return (it.nombre || '').toLowerCase();
    };
    return res.sort((a, b) => {
      const A = valOf(a);
      const B = valOf(b);
      if (A < B) return sortDir === 'asc' ? -1 : 1;
      if (A > B) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, search, marcaId, categoriaId, promosOnly, sortBy, sortDir]);

  const totalStock = (it) => (it?.sucursales || []).reduce((acc, s) => acc + (s.stock || 0), 0);
 
  const handleDelete = async (id) => {
    if (!id) return;
    try {
      await axios.delete(`${base}/aros/${id}`);
      fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Lentes</h1>
          <p className="text-sm text-gray-500">Administra el catálogo: búsqueda, filtros y promociones</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-100">
            <RefreshCcw className="w-4 h-4"/> Refrescar
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700">
            <Plus className="w-4 h-4"/> Nuevo lente
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 bg-white border rounded-xl p-3">
        <div className="flex-1">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, descripción, material..."
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <select value={marcaId} onChange={e => setMarcaId(e.target.value)} className="border rounded-lg px-3 py-2 min-w-[200px]">
          <option value="todos">Todas las marcas</option>
          {marcas.map(m => (
            <option key={m._id} value={m._id}>{m.nombre}</option>
          ))}
        </select>
        <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} className="border rounded-lg px-3 py-2 min-w-[200px]">
          <option value="todos">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c._id} value={c._id}>{c.nombre}</option>
          ))}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded-lg px-3 py-2 min-w-[160px]">
          <option value="nombre">Ordenar: Nombre</option>
          <option value="marca">Ordenar: Marca</option>
          <option value="precio">Ordenar: Precio</option>
        </select>
        <select value={sortDir} onChange={e => setSortDir(e.target.value)} className="border rounded-lg px-3 py-2 min-w-[120px]">
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
        <label className="inline-flex items-center gap-2 text-sm px-3 py-2 bg-gray-50 rounded-lg border">
          <input type="checkbox" checked={promosOnly} onChange={e => setPromosOnly(e.target.checked)} />
          {' '}Solo promociones
        </label>
        <button
          onClick={() => { setSearch(''); setMarcaId('todos'); setCategoriaId('todos'); setPromosOnly(false); }}
          className="px-3 py-2 rounded-lg border hover:bg-gray-100"
        >
          Limpiar
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_,i) => (
            <div key={i} className="bg-white rounded-xl border shadow-sm overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-100"/>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4"/>
                <div className="h-3 bg-gray-100 rounded w-1/2"/>
                <div className="h-3 bg-gray-100 rounded w-1/3"/>
              </div>
              <div className="h-12 bg-gray-50 border-t"/>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filtered.map(it => (
            <div key={it._id} className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="relative h-40 bg-gray-50 flex items-center justify-center">
                {it.imagenes && it.imagenes[0] ? (
                  <img src={it.imagenes[0]} alt={it.nombre} className="h-full w-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Glasses className="w-7 h-7 text-gray-400" />
                  </div>
                )}
                {it.enPromocion && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-rose-100 text-rose-700">Promo</Badge>
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-gray-900 line-clamp-1">{it.nombre}</div>
                    <div className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      <Tag className="w-3 h-3"/>{it.marcaId?.nombre || '—'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      ${((it.enPromocion ? it.precioActual : it.precioBase) ?? 0).toFixed(2)}
                    </div>
                    {it.enPromocion && (
                      <div className="text-xs text-gray-400 line-through">${(it.precioBase ?? 0).toFixed(2)}</div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500">{it.material} · {it.color} · {it.tipoLente}</div>
                <div className="text-xs text-gray-500">Stock total: {totalStock(it)}</div>
              </div>
              <div className="px-4 py-3 border-t flex items-center justify-end gap-2 bg-gray-50">
                <button className="px-3 py-2 rounded-lg border hover:bg-gray-100 inline-flex items-center gap-2 text-sm">
                  <Edit className="w-4 h-4" /> Editar
                </button>
                <button onClick={() => handleDelete(it._id)} className="px-3 py-2 rounded-lg border hover:bg-red-50 text-red-600 inline-flex items-center gap-2 text-sm">
                  <Trash2 className="w-4 h-4" /> Eliminar
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="col-span-full bg-white rounded-xl border p-10 text-center text-gray-500">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Glasses className="w-6 h-6 text-gray-400"/>
              </div>
              <div className="font-medium text-gray-700">Sin resultados</div>
              <div className="text-sm text-gray-500">Ajusta los filtros o crea un nuevo lente</div>
              <div className="mt-4">
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700">
                  <Plus className="w-4 h-4"/> Nuevo lente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-gray-500">Página {pagination.page} de {pagination.totalPages}</div>
        <div className="flex gap-2">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            className="px-3 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArosContent;
