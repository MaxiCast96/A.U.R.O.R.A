import React, { useEffect, useMemo, useRef, useState } from 'react';
import { API_CONFIG, buildApiUrl } from '../../../config/api';
import { Search, Filter, RefreshCw, Download, Zap } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const fmtDate = (iso) => new Date(iso).toLocaleString();

const Auditoria = () => {
  const { token } = useAuth() || {};
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState({ entity: '', method: '', status: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const sseRef = useRef(null);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  }), [token]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { q, ...filters, page, pageSize };
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.AUDITORIA, params);
      const res = await fetch(url, { headers, credentials: 'include' });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || 'Error obteniendo auditoría');
      setLogs(Array.isArray(json.data) ? json.data : []);
      setTotal(Number(json.total || 0));
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Initial and filter changes
  useEffect(() => { fetchLogs(); /* eslint-disable-next-line */ }, [page, pageSize]);

  const applyFilters = () => {
    setPage(1);
    fetchLogs();
  };

  const resetFilters = () => {
    setQ('');
    setFilters({ entity: '', method: '', status: '', from: '', to: '' });
    setPage(1);
    fetchLogs();
  };

  // SSE stream for live updates
  useEffect(() => {
    try {
      const qs = token ? (`?token=${encodeURIComponent(token)}`) : '';
      const url = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUDITORIA + '/stream' + qs;
      const es = new EventSource(url, { withCredentials: true });
      sseRef.current = es;
      es.onmessage = (ev) => {
        try {
          const arr = JSON.parse(ev.data);
          if (Array.isArray(arr) && arr.length) {
            setLogs(prev => {
              const next = [...arr.reverse(), ...prev];
              // limit to 500 in memory
              return next.slice(0, 500);
            });
          }
        } catch {}
      };
      es.onerror = () => {
        // silently ignore; will reconnect on reload
      };
      return () => { es.close(); };
    } catch { /* ignore */ }
  }, []);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `auditoria_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ['fecha','usuario','email','rol','cargo','metodo','status','ruta','entidad','accion','resumen'];
    const rows = logs.map(l => [
      fmtDate(l.timestamp || l.createdAt),
      l.user?.nombre || '',
      l.user?.email || '',
      l.user?.rol || '',
      l.user?.cargo || '',
      l.request?.method || '',
      l.response?.status || '',
      l.request?.path || '',
      l.action?.entity || '',
      l.action?.type || '',
      (l.action?.summary || '').replace(/\n|\r/g, ' ')
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `auditoria_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="text-sm text-gray-600">Búsqueda</label>
            <div className="flex items-center gap-2">
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Texto, email, ruta..." className="w-full border rounded px-3 py-2" />
              <button onClick={applyFilters} className="px-3 py-2 bg-cyan-600 text-white rounded inline-flex items-center gap-1"><Search size={16}/>Buscar</button>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Entidad</label>
            <input value={filters.entity} onChange={e=>setFilters(f=>({...f, entity:e.target.value}))} placeholder="empleados, ventas..." className="w-full border rounded px-3 py-2"/>
          </div>
          <div>
            <label className="text-sm text-gray-600">Método</label>
            <select value={filters.method} onChange={e=>setFilters(f=>({...f, method:e.target.value}))} className="w-full border rounded px-3 py-2">
              <option value="">Todos</option>
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>PATCH</option>
              <option>DELETE</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Status</label>
            <input value={filters.status} onChange={e=>setFilters(f=>({...f, status:e.target.value}))} placeholder="200, 400..." className="w-28 border rounded px-3 py-2"/>
          </div>
          <div>
            <label className="text-sm text-gray-600">Desde</label>
            <input type="datetime-local" value={filters.from} onChange={e=>setFilters(f=>({...f, from:e.target.value}))} className="border rounded px-3 py-2"/>
          </div>
          <div>
            <label className="text-sm text-gray-600">Hasta</label>
            <input type="datetime-local" value={filters.to} onChange={e=>setFilters(f=>({...f, to:e.target.value}))} className="border rounded px-3 py-2"/>
          </div>
          <div className="flex gap-2">
            <button onClick={resetFilters} className="px-3 py-2 border rounded inline-flex items-center gap-1"><Filter size={16}/>Reset</button>
            <button onClick={fetchLogs} className="px-3 py-2 border rounded inline-flex items-center gap-1"><RefreshCw size={16}/>Refrescar</button>
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={exportCSV} className="px-3 py-2 border rounded inline-flex items-center gap-1"><Download size={16}/>CSV</button>
            <button onClick={exportJSON} className="px-3 py-2 border rounded inline-flex items-center gap-1"><Download size={16}/>JSON</button>
          </div>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Usuario</th>
                <th className="px-3 py-2 text-left">Rol/Cargo</th>
                <th className="px-3 py-2 text-left">Método</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Ruta</th>
                <th className="px-3 py-2 text-left">Entidad</th>
                <th className="px-3 py-2 text-left">Acción</th>
                <th className="px-3 py-2 text-left">Resumen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-3 py-6 text-center text-gray-500">Cargando...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={9} className="px-3 py-6 text-center text-gray-500">Sin registros</td></tr>
              ) : (
                logs.map((l, idx) => (
                  <tr key={(l._id || '')+idx} className="border-t">
                    <td className="px-3 py-2 whitespace-nowrap">{fmtDate(l.timestamp || l.createdAt)}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{l.user?.nombre || '—'}</div>
                      <div className="text-gray-500">{l.user?.email || ''}</div>
                    </td>
                    <td className="px-3 py-2">{[l.user?.rol, l.user?.cargo].filter(Boolean).join(' / ')}</td>
                    <td className="px-3 py-2">{l.request?.method}</td>
                    <td className="px-3 py-2">{l.response?.status}</td>
                    <td className="px-3 py-2 max-w-[280px] truncate" title={l.request?.path}>{l.request?.path}</td>
                    <td className="px-3 py-2">{l.action?.entity}</td>
                    <td className="px-3 py-2">{l.action?.type}</td>
                    <td className="px-3 py-2 max-w-[400px] truncate" title={l.action?.summary}>{l.action?.summary}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-gray-600">Total: {total}</div>
          <div className="flex items-center gap-2">
            <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-2 border rounded">Prev</button>
            <span className="text-sm">{page} / {totalPages}</span>
            <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-2 border rounded">Next</button>
            <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value)); setPage(1);}} className="ml-2 border rounded px-2 py-2">
              {[20,50,100,200].map(n=> <option key={n} value={n}>{n}/pág</option>)}
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-1"><Zap size={14}/> Actualización en vivo vía SSE + recarga manual</div>
      </div>
    </div>
  );
};

export default Auditoria;
