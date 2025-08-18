import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Edit, Eye, Filter, Search, Clock } from 'lucide-react';

import PageHeader from '../ui/PageHeader';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';

import { API_CONFIG, buildApiUrl } from '../../../config/api';

const ESTADOS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Procesada', value: 'procesada' },
  { label: 'Completada', value: 'completada' },
  { label: 'Cancelada', value: 'cancelada' },
];

const mapEstadoBadge = (estado) => {
  const e = (estado || '').toLowerCase();
  if (e === 'completada' || e === 'procesada') return 'bg-green-100 text-green-800';
  if (e === 'pendiente') return 'bg-yellow-100 text-yellow-800';
  if (e === 'cancelada') return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
};

const VentasContent = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [dateRange, setDateRange] = useState({ inicio: '', fin: '' });

  const [selectedVenta, setSelectedVenta] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingVenta, setEditingVenta] = useState(null);
  const [editData, setEditData] = useState({ estado: '', observaciones: '' });
  const [pageSize, setPageSize] = useState(5);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchVentas = async () => {
    try {
      setLoading(true);
      let url = buildApiUrl(API_CONFIG.ENDPOINTS.VENTAS);

      // Si hay rango de fechas, usar endpoint de rango
      if (dateRange.inicio && dateRange.fin) {
        url = buildApiUrl(`${API_CONFIG.ENDPOINTS.VENTAS}/fecha/rango`, {
          fechaInicio: dateRange.inicio,
          fechaFin: dateRange.fin,
        });
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: API_CONFIG.FETCH_CONFIG.headers,
        credentials: API_CONFIG.FETCH_CONFIG.credentials,
      });
      const data = await res.json();

      const rows = Array.isArray(data) ? data : (data.data || []);
      setVentas(rows);
    } catch (err) {
      console.error(err);
      showAlert('error', 'Error al cargar ventas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredVentas = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    return ventas.filter(v => {
      // Campos para buscar: número de factura, cliente, sucursal, empleado
      const numero = v?.facturaDatos?.numeroFactura?.toString() || '';
      const cliente = `${v?.facturaDatos?.nombreCliente || ''}`.toLowerCase();
      const sucursal = `${v?.sucursalId?.nombre || ''}`.toLowerCase();
      const empleado = `${v?.empleadoId?.nombre || ''} ${v?.empleadoId?.apellido || ''}`.toLowerCase();
      const texto = `${numero} ${cliente} ${sucursal} ${empleado}`.toLowerCase();

      const matchesSearch = !s || texto.includes(s);
      const matchesEstado = estadoFilter === 'todos' || (v?.estado || '').toLowerCase() === estadoFilter;
      return matchesSearch && matchesEstado;
    });
  }, [ventas, searchTerm, estadoFilter]);

  const {
    paginatedData: currentVentas,
    currentPage,
    totalPages,
    goToFirstPage,
    goToPreviousPage,
    goToNextPage,
    goToLastPage,
    setPageSize: setPageSizeCompat,
  } = usePaginationCompat(filteredVentas, pageSize);

  function usePaginationCompat(data, initialPageSize = 10) {
    const [page, setPage] = useState(0); // 0-based index
    const [size, setSize] = useState(initialPageSize);
    const totalPages = Math.max(1, Math.ceil((data?.length || 0) / size));
    const paginated = useMemo(() => {
      const start = page * size;
      return data.slice(start, start + size);
    }, [data, page, size]);

    useEffect(() => {
      if (page > totalPages - 1) setPage(0);
    }, [data, totalPages, page]);

    return {
      paginatedData: paginated,
      currentPage: page,
      totalPages,
      goToFirstPage: () => setPage(0),
      goToPreviousPage: () => setPage(p => Math.max(0, p - 1)),
      goToNextPage: () => setPage(p => Math.min(totalPages - 1, p + 1)),
      goToLastPage: () => setPage(Math.max(0, totalPages - 1)),
      setPageSize: (v) => { setSize(v); setPage(0); },
    };
  }

  const handleOpenDetail = (venta) => {
    setSelectedVenta(venta);
    setShowDetailModal(true);
  };

  const handleStartEdit = (venta) => {
    setEditingVenta(venta);
    setEditData({ estado: venta?.estado || '', observaciones: venta?.observaciones || '' });
  };

  const handleCancelEdit = () => {
    setEditingVenta(null);
    setEditData({ estado: '', observaciones: '' });
  };

  const handleSaveEdit = async () => {
    if (!editingVenta) return;
    try {
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.VENTAS}/${editingVenta._id}`);
      const res = await fetch(url, {
        method: 'PUT',
        headers: API_CONFIG.FETCH_CONFIG.headers,
        credentials: API_CONFIG.FETCH_CONFIG.credentials,
        body: JSON.stringify({ estado: editData.estado, observaciones: editData.observaciones }),
      });
      if (!res.ok) throw new Error('No se pudo actualizar la venta');
      showAlert('success', 'Venta actualizada');
      handleCancelEdit();
      fetchVentas();
    } catch (e) {
      console.error(e);
      showAlert('error', 'Error al actualizar la venta');
    }
  };

  const applyDateRange = () => {
    if (dateRange.inicio && dateRange.fin) fetchVentas();
  };

  const clearDateRange = () => {
    setDateRange({ inicio: '', fin: '' });
    fetchVentas();
  };

  const columns = [
    { header: 'Factura', key: 'numero' },
    { header: 'Cliente', key: 'cliente' },
    { header: 'Sucursal', key: 'sucursal' },
    { header: 'Estado', key: 'estado' },
    { header: 'Total', key: 'total' },
    { header: 'Fecha', key: 'fecha' },
    { header: 'Acciones', key: 'acciones' },
  ];

  const renderRow = (v) => {
    const total = v?.facturaDatos?.total ?? 0;
    return (
      <>
        <td className="px-6 py-4 font-mono text-gray-700">{v?.facturaDatos?.numeroFactura || '—'}</td>
        <td className="px-6 py-4 text-gray-700">{v?.facturaDatos?.nombreCliente || '—'}</td>
        <td className="px-6 py-4 text-gray-700">{v?.sucursalId?.nombre || '—'}</td>
        <td className="px-6 py-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${mapEstadoBadge(v?.estado)}`}>
            {v?.estado || '—'}
          </span>
        </td>
        <td className="px-6 py-4 text-gray-700">${total.toFixed(2)}</td>
        <td className="px-6 py-4 text-gray-600">{new Date(v?.fecha).toLocaleDateString()}</td>
        <td className="px-6 py-4">
          <div className="flex space-x-2">
            <button onClick={() => handleOpenDetail(v)} className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" title="Ver detalles">
              <Eye className="w-4 h-4" />
            </button>
            <button onClick={() => handleStartEdit(v)} className="p-2 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" title="Editar estado/observaciones">
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </td>
      </>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Alert alert={alert} />

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <PageHeader title="Gestión de Ventas" buttonLabel={null} onButtonClick={null} />

        <div className="px-4 pt-3 grid grid-cols-1 lg:grid-cols-3 gap-2">
          <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              className="ml-2 bg-transparent outline-none w-full"
              placeholder="Buscar por número, cliente, sucursal o empleado..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="ml-2 bg-transparent outline-none w-full"
              value={estadoFilter}
              onChange={e => setEstadoFilter(e.target.value)}
            >
              {ESTADOS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 w-full">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input type="date" className="ml-2 bg-transparent outline-none w-full" value={dateRange.inicio} onChange={e => setDateRange(d => ({ ...d, inicio: e.target.value }))} />
            </div>
            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 w-full">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input type="date" className="ml-2 bg-transparent outline-none w-full" value={dateRange.fin} onChange={e => setDateRange(d => ({ ...d, fin: e.target.value }))} />
            </div>
            <button onClick={applyDateRange} className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">Aplicar</button>
            <button onClick={clearDateRange} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Limpiar</button>
          </div>
        </div>

        <div className="mt-2">
          <DataTable
            columns={columns}
            data={currentVentas}
            renderRow={renderRow}
            isLoading={loading}
            noDataMessage="No se encontraron ventas"
            noDataSubMessage={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Las ventas aparecerán aquí'}
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          goToFirstPage={goToFirstPage}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
          goToLastPage={goToLastPage}
          pageSize={pageSize}
          setPageSize={(v) => { setPageSize(v); setPageSizeCompat(v); }}
        />
      </div>

      {selectedVenta && (
        <DetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Detalles de la Venta"
          item={selectedVenta}
          data={[
            { label: 'Factura', value: selectedVenta?.facturaDatos?.numeroFactura || '—' },
            { label: 'Cliente', value: selectedVenta?.facturaDatos?.nombreCliente || '—' },
            { label: 'DUI Cliente', value: selectedVenta?.facturaDatos?.duiCliente || '—' },
            { label: 'Sucursal', value: selectedVenta?.sucursalId?.nombre || '—' },
            { label: 'Empleado', value: `${selectedVenta?.empleadoId?.nombre || ''} ${selectedVenta?.empleadoId?.apellido || ''}`.trim() || '—' },
            { label: 'Estado', value: selectedVenta?.estado || '—', color: mapEstadoBadge(selectedVenta?.estado) },
            { label: 'Subtotal', value: `$${(selectedVenta?.facturaDatos?.subtotal ?? 0).toFixed(2)}` },
            { label: 'Total', value: `$${(selectedVenta?.facturaDatos?.total ?? 0).toFixed(2)}` },
            { label: 'Fecha', value: new Date(selectedVenta?.fecha).toLocaleString() },
            { label: 'Observaciones', value: selectedVenta?.observaciones || '—' },
          ]}
        />
      )}

      {editingVenta && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Venta</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Estado</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={editData.estado}
                  onChange={e => setEditData(d => ({ ...d, estado: e.target.value }))}
                >
                  {ESTADOS.filter(e => e.value !== 'todos').map(e => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Observaciones</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  value={editData.observaciones}
                  onChange={e => setEditData(d => ({ ...d, observaciones: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button onClick={handleCancelEdit} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Cancelar</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentasContent;
