import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { usePagination } from '../../../hooks/admin/usePagination';
import axios from 'axios';
import { 
    Calendar, CheckCircle2, Edit, Eye, Filter, Search, Clock, SortAsc, SortDesc, ChevronDown, CreditCard, X
} from 'lucide-react';

import PageHeader from '../ui/PageHeader';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';

import { API_CONFIG, buildApiUrl } from '../../../config/api';

// --- CONFIGURACIÓN ---
const API_URL = 'https://aurora-production-7e57.up.railway.app/api/ventas';
const ITEMS_PER_PAGE = 10;

// Estados iniciales
const INITIAL_FILTERS = {
    estado: 'todos',
    fechaDesde: '',
    fechaHasta: ''
};

const SORT_OPTIONS = [
    { value: 'fecha-desc', label: 'Más Recientes Primero', icon: Calendar },
    { value: 'fecha-asc', label: 'Más Antiguos Primero', icon: Calendar },
    { value: 'total-asc', label: 'Total: Menor a Mayor', icon: CreditCard },
    { value: 'total-desc', label: 'Total: Mayor a Menor', icon: CreditCard },
    { value: 'estado-asc', label: 'Estado A-Z', icon: CheckCircle2 },
    { value: 'estado-desc', label: 'Estado Z-A', icon: CheckCircle2 },
];

const TABLE_COLUMNS = [
    { header: 'Factura', key: 'numero' },
    { header: 'Cliente', key: 'cliente' },
    { header: 'Sucursal', key: 'sucursal' },
    { header: 'Estado', key: 'estado' },
    { header: 'Total', key: 'total' },
    { header: 'Fecha', key: 'fecha' },
    { header: 'Acciones', key: 'acciones' },
];

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

// --- COMPONENTE SKELETON LOADER MEMOIZADO ---
const SkeletonLoader = React.memo(() => (
    <div className="animate-pulse">
        {/* Skeleton para la tabla */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-cyan-500 to-cyan-600">
                <div className="flex justify-between items-center">
                    <div className="h-6 bg-cyan-400 rounded w-48"></div>
                    <div className="h-10 bg-cyan-400 rounded w-32"></div>
                </div>
            </div>

            <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                    <div className="h-10 bg-gray-200 rounded-lg w-full max-w-md"></div>
                    <div className="flex space-x-3">
                        <div className="h-10 bg-gray-200 rounded w-24"></div>
                        <div className="h-10 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>
                <div className="mt-3 flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div style={{ minWidth: '1200px' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {TABLE_COLUMNS.map((_, index) => (
                                    <th key={index} className="px-4 py-3">
                                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Array.from({ length: 5 }, (_, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td className="px-4 py-4 w-32">
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </td>
                                    <td className="px-4 py-4 w-48">
                                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                                    </td>
                                    <td className="px-4 py-4 w-48">
                                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                                    </td>
                                    <td className="px-4 py-4 w-24">
                                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                    </td>
                                    <td className="px-4 py-4 w-28">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    </td>
                                    <td className="px-4 py-4 w-28">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    </td>
                                    <td className="px-4 py-4 w-32">
                                        <div className="flex space-x-1">
                                            {Array.from({ length: 2 }, (_, btnIndex) => (
                                                <div key={btnIndex} className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                    <div className="flex space-x-2">
                        {Array.from({ length: 4 }, (_, i) => (
                            <div key={i} className="w-10 h-10 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
));

const VentasContent = () => {
  // --- ESTADOS PRINCIPALES ---
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // --- ESTADOS DE FILTROS Y ORDENAMIENTO ---
  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('fecha');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // --- ESTADOS DE MODALES ---
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingVenta, setEditingVenta] = useState(null);
  const [editData, setEditData] = useState({ estado: '', observaciones: '' });

  // --- FUNCIÓN PARA OBTENER DATOS ---
  const fetchVentas = useCallback(async () => {
    try {
        setLoading(true);
        const response = await axios.get(API_URL);
        const formattedData = response.data.map(v => ({
            ...v,
            fechaRegistroRaw: new Date(v.fecha),
        }));
        setVentas(formattedData);
    } catch (error) {
        showAlert('error', 'Error al cargar las ventas desde el servidor.');
        console.error('Error fetching ventas:', error);
    } finally {
        setLoading(false);
    }
  }, []);

  // --- EFECTO PARA CARGA INICIAL ---
  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  // --- FUNCIONES UTILITARIAS ---
  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
    const timer = setTimeout(() => setAlert(null), 5000);
    return () => clearTimeout(timer);
  }, []);

  const normalizeEstado = useCallback((estado) => estado?.toLowerCase() || '', []);

  // --- FUNCIÓN PARA MANEJAR ORDENAMIENTO ---
  const handleSortChange = useCallback((sortValue) => {
      const [field, order] = sortValue.split('-');
      setSortBy(field);
      setSortOrder(order);
      setShowSortDropdown(false);
  }, []);

  // --- FUNCIÓN PARA ORDENAR DATOS ---
  const sortData = useCallback((data) => {
    return [...data].sort((a, b) => {
        let valueA, valueB;
        
        switch (sortBy) {
            case 'fecha':
                valueA = a.fechaRegistroRaw || new Date(0);
                valueB = b.fechaRegistroRaw || new Date(0);
                break;
            case 'total':
                valueA = a.facturaDatos?.total || 0;
                valueB = b.facturaDatos?.total || 0;
                break;
            case 'estado':
                valueA = normalizeEstado(a.estado);
                valueB = normalizeEstado(b.estado);
                break;
            default:
                return 0;
        }

        if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
  }, [sortBy, sortOrder, normalizeEstado]);

  // --- FUNCIÓN PARA APLICAR FILTROS AVANZADOS ---
  const applyAdvancedFilters = useCallback((venta) => {
      // Filtro por estado
      if (filters.estado !== 'todos' && normalizeEstado(venta.estado) !== filters.estado) {
          return false;
      }
      
      // Filtro por fecha de registro
      if (filters.fechaDesde) {
          const fechaDesde = new Date(filters.fechaDesde);
          if (venta.fechaRegistroRaw < fechaDesde) {
              return false;
          }
      }
      if (filters.fechaHasta) {
          const fechaHasta = new Date(filters.fechaHasta);
          fechaHasta.setHours(23, 59, 59);
          if (venta.fechaRegistroRaw > fechaHasta) {
              return false;
          }
      }

      return true;
  }, [filters, normalizeEstado]);

  // --- LÓGICA DE FILTRADO, ORDENAMIENTO Y PAGINACIÓN ---
  const filteredAndSortedVentas = useMemo(() => {
      const filtered = ventas.filter(v => {
          // Búsqueda por texto
          const search = searchTerm.toLowerCase();
          const numero = v?.facturaDatos?.numeroFactura?.toString() || '';
          const cliente = `${v?.facturaDatos?.nombreCliente || ''}`.toLowerCase();
          const sucursal = `${v?.sucursalId?.nombre || ''}`.toLowerCase();
          const empleado = `${v?.empleadoId?.nombre || ''} ${v?.empleadoId?.apellido || ''}`.toLowerCase();
          const texto = `${numero} ${cliente} ${sucursal} ${empleado}`.toLowerCase();

          const matchesSearch = !searchTerm || texto.includes(search);
          
          // Filtros avanzados
          const matchesAdvancedFilters = applyAdvancedFilters(v);
          
          return matchesSearch && matchesAdvancedFilters;
      });
      
      return sortData(filtered);
  }, [ventas, searchTerm, applyAdvancedFilters, sortData]);

  const { paginatedData: currentVentas, ...paginationProps } = usePagination(filteredAndSortedVentas, ITEMS_PER_PAGE);

  // --- FUNCIONES PARA MANEJAR FILTROS ---
  const handleFilterChange = useCallback((key, value) => {
      setFilters(prev => ({
          ...prev,
          [key]: value
      }));
  }, []);

  const clearAllFilters = useCallback(() => {
      setFilters(INITIAL_FILTERS);
      setSearchTerm('');
  }, []);

  const hasActiveFilters = useCallback(() => {
      return searchTerm || 
             filters.estado !== 'todos' || 
             filters.fechaDesde || 
             filters.fechaHasta;
  }, [searchTerm, filters]);


  // --- FUNCIONES PARA MANEJAR MODALES ---
  const handleCloseModals = useCallback(() => {
    setShowDetailModal(false);
    setSelectedVenta(null);
  }, []);

  const handleOpenDetail = useCallback((venta) => {
    setSelectedVenta(venta);
    setShowDetailModal(true);
  }, []);

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
  
  // --- FUNCIÓN PARA RENDERIZAR FILAS ---
  const renderRow = useCallback((v) => {
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
  }, [handleOpenDetail]);
  

  // --- RENDERIZADO DEL COMPONENTE ---
  if (loading) {
      return (
          <div className="space-y-6 animate-fade-in">
              <Alert alert={alert} />
              <SkeletonLoader />
          </div>
      );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Alert alert={alert} />

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <PageHeader title="Gestión de Ventas" buttonLabel={null} onButtonClick={null} />

        {/* BARRA DE BÚSQUEDA Y CONTROLES */}
        <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                {/* Barra de búsqueda */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar factura/cliente/sucursal"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        aria-label="Buscar ventas"
                    />
                </div>

                {/* Controles de filtro y ordenamiento */}
                <div className="flex items-center space-x-3">
                    {/* Dropdown de ordenamiento */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowSortDropdown(!showSortDropdown);
                                setShowFiltersPanel(false);
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            aria-expanded={showSortDropdown}
                            aria-haspopup="true"
                            aria-label="Opciones de ordenamiento"
                        >
                            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                            <span className="text-sm font-medium">Ordenar</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        
                        {showSortDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                <div className="py-2">
                                    {SORT_OPTIONS.map((option) => {
                                        const IconComponent = option.icon;
                                        const isActive = `${sortBy}-${sortOrder}` === option.value;
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => handleSortChange(option.value)}
                                                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                                    isActive ? 'bg-cyan-50 text-cyan-600 font-medium' : 'text-gray-700'
                                                }`}
                                                aria-pressed={isActive}
                                            >
                                                <IconComponent className="w-4 h-4" />
                                                <span>{option.label}</span>
                                                {isActive && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Botón de filtros */}
                    <button
                        onClick={() => {
                            setShowFiltersPanel(!showFiltersPanel);
                            setShowSortDropdown(false);
                        }}
                        className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all duration-200 ${
                            hasActiveFilters() 
                                ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                        aria-expanded={showFiltersPanel}
                        aria-label="Filtros avanzados"
                    >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filtros</span>
                        {hasActiveFilters() && (
                            <span className="bg-white text-cyan-600 text-xs px-2 py-0.5 rounded-full font-bold">
                                {[
                                    searchTerm && 1,
                                    filters.estado !== 'todos' && 1,
                                    filters.fechaDesde && 1,
                                    filters.fechaHasta && 1
                                ].filter(Boolean).length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Información de resultados */}
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                <span>
                    {filteredAndSortedVentas.length} venta{filteredAndSortedVentas.length !== 1 ? 's' : ''} 
                    {hasActiveFilters() && ` (filtrado${filteredAndSortedVentas.length !== 1 ? 's' : ''} de ${ventas.length})`}
                </span>
                {hasActiveFilters() && (
                    <button
                        onClick={clearAllFilters}
                        className="text-cyan-600 hover:text-cyan-800 font-medium flex items-center space-x-1"
                        aria-label="Limpiar todos los filtros"
                    >
                        <X className="w-4 h-4" />
                        <span>Limpiar filtros</span>
                    </button>
                )}
            </div>
        </div>

        {/* PANEL DE FILTROS */}
        {showFiltersPanel && (
            <div className="border-b bg-white" role="region" aria-labelledby="filtros-titulo">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 id="filtros-titulo" className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
                        <button
                            onClick={() => setShowFiltersPanel(false)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="Cerrar panel de filtros"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Filtro por Estado */}
                        <div>
                            <label htmlFor="filter-estado" className="block text-sm font-medium text-gray-700 mb-2">
                                Estado
                            </label>
                            <select
                                id="filter-estado"
                                value={filters.estado}
                                onChange={(e) => handleFilterChange('estado', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            >
                                {ESTADOS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Fecha de Registro */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Registro</label>
                            <div className="flex space-x-2">
                                <div className="flex-1">
                                    <input
                                        type="date"
                                        value={filters.fechaDesde}
                                        onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        aria-label="Fecha desde"
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="date"
                                        value={filters.fechaHasta}
                                        onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        aria-label="Fecha hasta"
                                    />
                                </div>
                            </div>
                            <div className="flex text-xs text-gray-500 mt-1 space-x-4">
                                <span>Desde</span>
                                <span>Hasta</span>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción del panel de filtros */}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={clearAllFilters}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Limpiar Todo
                        </button>
                        <button
                            onClick={() => setShowFiltersPanel(false)}
                            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                        >
                            Aplicar Filtros
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="mt-2">
          <DataTable
            columns={TABLE_COLUMNS}
            data={currentVentas}
            renderRow={renderRow}
            isLoading={loading}
            noDataMessage="No se encontraron ventas"
            noDataSubMessage={hasActiveFilters() ? 'Intenta ajustar los filtros de búsqueda' : 'Las ventas aparecerán aquí'}
          />
        </div>

        <Pagination {...paginationProps} />
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

      {/* OVERLAY PARA DROPDOWN */}
      {showSortDropdown && (
          <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowSortDropdown(false)}
              aria-hidden="true"
          />
      )}
    </div>
  );
};

export default VentasContent;