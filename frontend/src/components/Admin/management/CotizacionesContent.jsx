import React, { useMemo, useState } from 'react';
import { Search, Plus, Trash2, Eye, Edit, FileText, User, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import API_CONFIG, { buildApiUrl } from '../../../config/api';
import useApiData from '../../../hooks/useApiData';
import { useAuth } from '../../auth/AuthContext';

const CotizacionesContent = () => {
    const { token } = useAuth();
    const [notice, setNotice] = useState({ type: '', message: '' });

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('todas');
    const [setShowAddModal] = useState(false);
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // Helpers
    const formatDate = (value) => {
      if (!value) return '-';
      const d = new Date(value);
      return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
    };

    // Fetch real data
    const [refreshKey, setRefreshKey] = useState(0);
    const { data: apiData, loading, error } = useApiData('cotizaciones', { r: refreshKey });

    const cotizaciones = useMemo(() => {
      if (!Array.isArray(apiData)) return [];
      return apiData.map((c) => {
        const clienteNombre = typeof c.clienteId === 'object' && c.clienteId !== null
          ? (c.clienteId.nombre || c.clienteId.fullName || c.clienteId.razonSocial || c.clienteId.email || String(c.clienteId._id || ''))
          : String(c.clienteId || '');
        return {
          id: c._id,
          cliente: clienteNombre,
          total: Number(c.total || 0),
          fechaCreacion: formatDate(c.createdAt || c.fechaCreacion),
          fechaVencimiento: formatDate(c.fechaVencimiento),
          estado: c.estado || 'Pendiente',
        };
      });
    }, [apiData]);

    const filteredCotizaciones = cotizaciones.filter(cot => {
      const matchesSearch = cot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cot.cliente.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = selectedFilter === 'todas' || cot.estado.toLowerCase() === selectedFilter;
      return matchesSearch && matchesFilter;
    });

    const totalPages = Math.ceil(filteredCotizaciones.length / pageSize);
    const currentCotizaciones = filteredCotizaciones.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

    const goToFirstPage = () => setCurrentPage(0);
    const goToPreviousPage = () => setCurrentPage(prev => Math.max(0, prev - 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    const goToLastPage = () => setCurrentPage(totalPages - 1);

    const getEstadoInfo = (estado) => {
      switch(estado) {
        case 'Aprobada': return { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> };
        case 'Pendiente': return { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> };
        case 'Enviada': return { color: 'bg-blue-100 text-blue-800', icon: <FileText className="w-4 h-4" /> };
        case 'Rechazada': return { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> };
        default: return { color: 'bg-gray-100 text-gray-800', icon: <AlertTriangle className="w-4 h-4" /> };
      }
    };

    const convertirAPedido = async (cotId) => {
      try {
        const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.COTIZACIONES}/${cotId}/convertir-a-pedido`);
        const res = await fetch(url, {
          method: 'POST',
          credentials: API_CONFIG.FETCH_CONFIG.credentials,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
        });
        const data = await res.json();
        if (!res.ok) {
          setNotice({ type: 'error', message: data?.message || 'No se pudo convertir la cotización.' });
          return;
        }
        setNotice({ type: 'success', message: 'Cotización convertida en pedido correctamente.' });
        setRefreshKey((k) => k + 1);
      } catch (e) {
        setNotice({ type: 'error', message: 'Error de red al convertir la cotización.' });
      }
    };

    const totalCotizaciones = cotizaciones.length;
    const cotizacionesAprobadas = cotizaciones.filter(c => (c.estado || '').toLowerCase() === 'aprobada').length;
    const montoTotalAprobado = cotizaciones
      .filter(c => (c.estado || '').toLowerCase() === 'aprobada')
      .reduce((sum, c) => sum + (Number.isFinite(c.total) ? c.total : 0), 0);

    return (
      <div className="space-y-6 animate-fade-in">
        {notice.message && (
          <div
            className={`p-3 rounded-lg text-sm mx-auto max-w-3xl ${
              notice.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              'bg-red-50 text-red-700 border border-red-200'
            }`}
            role="status"
            aria-live="polite"
          >
            {notice.message}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Cotizaciones</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{totalCotizaciones}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Aprobadas</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{cotizacionesAprobadas}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Monto Aprobado</p>
                <p className="text-3xl font-bold text-cyan-600 mt-2">${montoTotalAprobado.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-cyan-500 text-white p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestión de Cotizaciones</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Cotización</span>
              </button>
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 border-b">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por ID o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['todas', 'aprobada', 'pendiente', 'enviada', 'rechazada'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                      selectedFilter === filter 
                        ? 'bg-cyan-500 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading && (
              <div className="p-6 text-center text-gray-600">Cargando cotizaciones...</div>
            )}
            {error && (
              <div className="p-6 text-center text-red-600">{String(error)}</div>
            )}
            <table className="w-full">
              <thead className="bg-cyan-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">ID</th>
                  <th className="px-6 py-4 text-left font-semibold">Cliente</th>
                  <th className="px-6 py-4 text-left font-semibold">Total</th>
                  <th className="px-6 py-4 text-left font-semibold">Creación</th>
                  <th className="px-6 py-4 text-left font-semibold">Vencimiento</th>
                  <th className="px-6 py-4 text-left font-semibold">Estado</th>
                  <th className="px-6 py-4 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentCotizaciones.map((cot) => {
                  const estadoInfo = getEstadoInfo(cot.estado);
                  return (
                    <tr key={cot.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-gray-800">{cot.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{cot.cliente}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-cyan-600">${cot.total.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{cot.fechaCreacion}</td>
                      <td className="px-6 py-4 text-gray-600">{cot.fechaVencimiento}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1.5 ${estadoInfo.color}`}>
                          {estadoInfo.icon}
                          <span>{cot.estado}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors"
                            title="Convertir a pedido"
                            onClick={() => convertirAPedido(cot.id)}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredCotizaciones.length === 0 && (
            <div className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron cotizaciones
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primera cotización'}
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-col items-center gap-4 pb-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Mostrar</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="border border-cyan-500 rounded py-1 px-2"
              >
                {[5, 10, 15, 20].map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-gray-700">por página</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={goToFirstPage} disabled={currentPage === 0} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50">{"<<"}</button>
              <button onClick={goToPreviousPage} disabled={currentPage === 0} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50">{"<"}</button>
              <span className="text-gray-700 font-medium">Página {currentPage + 1} de {totalPages}</span>
              <button onClick={goToNextPage} disabled={currentPage === totalPages - 1} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50">{">"}</button>
              <button onClick={goToLastPage} disabled={currentPage === totalPages - 1} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50">{">>"}</button>
            </div>
          </div>
        </div>
      </div>
    );
};

export default CotizacionesContent;