import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { 
  Search, Plus, Trash2, Eye, Edit, Package, Clock, UserCheck, ChevronDown, Tags,
  Filter, X, SortAsc, SortDesc, CheckCircle, TrendingUp, DollarSign
} from 'lucide-react';
import { useApiData } from '../../../hooks/useApiData';
import { API_CONFIG, buildApiUrl } from '../../../config/api';
import FormModal from '../ui/FormModal';
import Alert, { ToastContainer, useAlert } from '../../ui/Alert';
import DetailModal from '../ui/DetailModal';
import PageHeader from '../ui/PageHeader';
import StatsGrid from '../ui/StatsGrid';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import { usePagination } from '../../../hooks/admin/usePagination';
import axios from 'axios';
import PersonalizadosFormModal from './employees/PersonalizadosFormModal';

const ITEMS_PER_PAGE = 12;

// Estados iniciales para filtros
const INITIAL_FILTERS = {
  categoria: 'todas',
  marca: 'todas',
  cliente: 'todos',
  estado: 'todos',
  precioMin: '',
  precioMax: '',
  fechaDesde: '',
  fechaHasta: '',
  material: 'todos',
  color: 'todos',
  tipoLente: 'todos',
  recent: false
};

// Opciones de ordenamiento
const SORT_OPTIONS = [
  { value: 'fechaSolicitud-desc', label: 'MÃ¡s Recientes Primero', icon: Package },
  { value: 'fechaSolicitud-asc', label: 'MÃ¡s Antiguos Primero', icon: Package },
  { value: 'nombre-asc', label: 'Nombre A-Z', icon: Tags },
  { value: 'nombre-desc', label: 'Nombre Z-A', icon: Tags },
  { value: 'precioCalculado-desc', label: 'Precio: Mayor a Menor', icon: DollarSign },
  { value: 'precioCalculado-asc', label: 'Precio: Menor a Mayor', icon: DollarSign },
];

// Columnas de la tabla
const TABLE_COLUMNS = [
  { header: 'Producto', key: 'producto' },
  { header: 'Cliente', key: 'cliente' },
  { header: 'CategorÃ­a', key: 'categoria' },
  { header: 'Color', key: 'color' },
  { header: 'Precio', key: 'precio' },
  { header: 'Fecha', key: 'fecha' },
  { header: 'Estado', key: 'estado' },
  { header: 'Acciones', key: 'acciones' }
];

// --- COMPONENTE SKELETON LOADER MEMOIZADO ---
const SkeletonLoader = React.memo(() => (
  <div className="animate-pulse">
    {/* Skeleton para las estadÃ­sticas */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Skeleton para la tabla */}
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-cyan-500 to-cyan-600">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-cyan-400 rounded w-64"></div>
          <div className="h-10 bg-cyan-400 rounded w-40"></div>
        </div>
      </div>

      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="h-10 bg-gray-200 rounded-lg w-full max-w-md"></div>
          <div className="flex space-x-3">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-28"></div>
          </div>
        </div>
        <div className="mt-3 flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-40"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {TABLE_COLUMNS.map((_, index) => (
                <th key={index} className="px-6 py-3">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 8 }, (_, rowIndex) => (
              <tr key={rowIndex}>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-40 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {Array.from({ length: 4 }, (_, btnIndex) => (
                      <div key={btnIndex} className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-48"></div>
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

// Helper para obtener el componente de icono por nombre
const getIconComponent = (iconName) => {
  if (!iconName) return <Tags className="w-4 h-4" />;
  
  // Mapeo de iconos comunes (puedes expandir esto segÃºn los iconos disponibles)
  const iconMap = {
    Tags: Tags,
    Package: Package,
    Eye: Eye,
    Clock: Clock,
    UserCheck: UserCheck,
    Search: Search,
    Plus: Plus,
    Trash2: Trash2,
    Edit: Edit,
    ChevronDown: ChevronDown
  };
  
  const IconComponent = iconMap[iconName] || Tags;
  return <IconComponent className="w-4 h-4" />;
};

// Componente para el dropdown de categorías
const CategoryDropdown = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  loading, 
  error 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCategoryData = categories.find(cat => cat.nombre === selectedCategory);

  const handleCategorySelect = (categoryName) => {
    onCategorySelect(categoryName);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-cyan-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 min-w-[200px]"
      >
        <div className="flex items-center space-x-2">
          {selectedCategory === 'todas' ? (
            <>
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">Todas las categorías</span>
            </>
          ) : selectedCategoryData ? (
            <>
              {getIconComponent(selectedCategoryData.icono)}
              <span className="text-gray-700">{selectedCategoryData.nombre}</span>
            </>
          ) : (
            <>
              <Tags className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">Seleccionar categorÃ­a</span>
            </>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar el dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                Cargando categorías...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                {error}
              </div>
            ) : (
              <>
                {/* OpciÃ³n "Todos" */}
                <button
                  onClick={() => handleCategorySelect('todas')}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    selectedCategory === 'todas' ? 'bg-cyan-50 text-cyan-600' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <div className="font-medium">Todas las categorías</div>
                      <div className="text-xs text-gray-500">Ver todos los productos</div>
                    </div>
                  </div>
                </button>

                {/* categorías */}
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategorySelect(category.nombre)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                      selectedCategory === category.nombre ? 'bg-cyan-50 text-cyan-600' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600">
                        {getIconComponent(category.icono)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{category.nombre}</div>
                        <div className="text-xs text-gray-500 truncate">{category.descripcion}</div>
                      </div>
                    </div>
                  </button>
                ))}

                {categories.length === 0 && !loading && (
                  <div className="p-4 text-center text-gray-500">
                    No hay categorías disponibles
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const PersonalizadosContent = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('todas');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Estados de filtros y ordenamiento
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [sortBy, setSortBy] = useState('fechaSolicitud');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const { data: apiData, loading, error } = useApiData('productosPersonalizados', { r: refreshKey });
    const { data: pedidosData } = useApiData('pedidos', { r: refreshKey });
    const { data: clientesData } = useApiData('clientes');
    const { data: lentesData } = useApiData('lentes');
    const { data: marcasData } = useApiData('marcas');
    const [stats, setStats] = useState({ total: 0, enProceso: 0, completado: 0 });
    const { alertState, showSuccess, showError, hideAlert } = useAlert();
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [categoryError, setCategoryError] = useState(null);

    const [formData, setFormData] = useState({
        clienteId: '',
        productoBaseId: '',
        nombre: '',
        descripcion: '',
        categoria: '',
        marcaId: '',
        material: '',
        color: '',
        tipoLente: '',
        precioCalculado: null,
        fechaEntregaEstimada: '',
        cotizacion: { total: null, validaHasta: '' }
    });
    const [errors, setErrors] = useState({});
    const estadoOptions = [
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'en_proceso', label: 'En Proceso' },
        { value: 'completado', label: 'Completado' },
        { value: 'cancelado', label: 'Cancelado' },
        { value: 'entregado', label: 'Entregado' },
    ];

    // Mapear estado del backend a etiquetas de UI
    const estadoLabel = (estado) => {
        switch (estado) {
            case 'completado': return 'Completado';
            case 'en_proceso': return 'En Proceso';
            case 'pendiente': return 'Pendiente';
            case 'cancelado': return 'Cancelado';
            case 'entregado': return 'Entregado';
            default: return estado || 'Pendiente';
        }
    };

    const formatPrice = (n) => {
        if (typeof n !== 'number') return '-';
        try { return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }); } catch { return `$${n}`; }
    };

    const formatDate = (d) => {
        if (!d) return '';
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return '';
        return dt.toISOString().slice(0, 10);
    };

    // Funciones utilitarias
    const handleSortChange = useCallback((sortValue) => {
        const [field, order] = sortValue.split('-');
        setSortBy(field);
        setSortOrder(order);
        setShowSortDropdown(false);
    }, []);

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const clearAllFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
        setSearchTerm('');
        setSelectedCategory('todas');
    }, []);

    const hasActiveFilters = useCallback(() => {
        return searchTerm || 
               selectedCategory !== 'todas' ||
               filters.marca !== 'todas' || 
               filters.cliente !== 'todos' || 
               filters.estado !== 'todos' || 
               filters.material !== 'todos' || 
               filters.color !== 'todos' || 
               filters.tipoLente !== 'todos' ||
               filters.precioMin || 
               filters.precioMax || 
               filters.fechaDesde || 
               filters.fechaHasta ||
               filters.recent;
    }, [searchTerm, selectedCategory, filters]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        // dot-notation support
        if (name.includes('.')) {
            const keys = name.split('.');
            setFormData(prev => {
                const copy = { ...prev };
                let cur = copy;
                for (let i = 0; i < keys.length - 1; i++) {
                    const k = keys[i];
                    cur[k] = cur[k] ?? {};
                    cur = cur[k];
                }
                const last = keys[keys.length - 1];
                cur[last] = type === 'number' ? (value === '' ? null : Number(value)) : value;
                return copy;
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? (value === '' ? null : Number(value)) : value
            }));
        }
    };

    const validate = () => {
        const req = ['clienteId','productoBaseId','nombre','descripcion','categoria','marcaId','material','color','tipoLente','precioCalculado','fechaEntregaEstimada','cotizacion.total','cotizacion.validaHasta'];
        const errs = {};
        for (const field of req) {
            let val = formData;
            for (const k of field.split('.')) val = val?.[k];
            if (val === '' || val === null || val === undefined) errs[field] = 'Requerido';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const resetForm = () => {
        setFormData({
            clienteId: '',
            productoBaseId: '',
            nombre: '',
            descripcion: '',
            categoria: '',
            marcaId: '',
            material: '',
            color: '',
            tipoLente: '',
            precioCalculado: null,
            fechaEntregaEstimada: '',
            cotizacion: { total: null, validaHasta: '' }
        });
        setErrors({});
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            const url = buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTOS_PERSONALIZADOS);
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: API_CONFIG.FETCH_CONFIG.credentials,
                body: JSON.stringify(formData)
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || `Error ${res.status}`);
            }
            setShowAddModal(false);
            resetForm();
            setRefreshKey(k => k + 1);
            showSuccess('Producto personalizado creado correctamente', 3000);
        } catch (err) {
            setErrors(prev => ({ ...prev, submit: err.message || 'Error al crear' }));
            showError(err.message || 'Error al crear el personalizado', 4000);
        }
    };

  const prepareEdit = (id) => {
        console.log('🔍 PrepareEdit llamado con ID:', id);
        
        // Buscar primero en productos personalizados normales
        let item = Array.isArray(apiData) ? apiData.find(x => x._id === id) : null;
        
        // Si no se encuentra, buscar en productos de pedidos
        if (!item && id.includes(':')) {
            console.log('📦 Buscando en pedidos...');
            const [pedidoId, itemIndex] = id.split(':');
            const pedido = Array.isArray(pedidosData) ? pedidosData.find(p => p._id === pedidoId) : null;
            
            console.log('Pedido encontrado:', pedido ? 'SÍ' : 'NO');
            
            if (pedido && Array.isArray(pedido.items)) {
                const pedidoItem = pedido.items[parseInt(itemIndex)];
                console.log('Item del pedido:', pedidoItem);
                
                if (pedidoItem && (pedidoItem.tipo === 'personalizado' || !pedidoItem.tipo)) {
                    // Obtener la fecha de entrega
                    let fechaEntrega = '';
                    if (pedido.fechaEntrega) {
                        fechaEntrega = formatDate(pedido.fechaEntrega);
                    } else if (pedido.createdAt) {
                        // Agregar 7 días a la fecha de creación como fecha estimada
                        const fecha = new Date(pedido.createdAt);
                        fecha.setDate(fecha.getDate() + 7);
                        fechaEntrega = formatDate(fecha);
                    }

                    // Calcular el precio
                    const precio = typeof pedidoItem.subtotal === 'number' 
                        ? pedidoItem.subtotal 
                        : (Number(pedidoItem.precioUnitario||0) * Number(pedidoItem.cantidad||1));

                    // Convertir item de pedido a formato esperado
                    item = {
                        _id: id,
                        clienteId: pedido.clienteId,
                        productoBaseId: pedidoItem.productoId || (lenteOptions.length > 0 ? lenteOptions[0].value : ''),
                        nombre: pedidoItem.nombre || 'Producto Personalizado',
                        descripcion: pedidoItem.categoria ? `Categoría: ${pedidoItem.categoria}` : 'Producto personalizado desde pedido',
                        categoria: pedidoItem.categoria || (categoriaOptions.length > 0 ? categoriaOptions[0].value : ''),
                        marcaId: marcaOptions.length > 0 ? marcaOptions[0].value : '',
                        material: pedidoItem.material || 'Policarbonato',
                        color: pedidoItem.color || 'Transparente',
                        tipoLente: pedidoItem.tipoLente || 'Monofocal',
                        precioCalculado: precio,
                        fechaEntregaEstimada: fechaEntrega,
                        cotizacion: {
                            total: precio,
                            validaHasta: fechaEntrega
                        }
                    };
                    console.log('✅ Item construido desde pedido:', item);
                }
            }
        }
        
        if (!item) {
            console.error('❌ No se encontró el producto para editar');
            showError('No se encontró el producto para editar', 3000);
            return;
        }
        
        console.log('📝 Preparando formulario con item:', item);
        
        setEditingId(id);
        setFormData({
            clienteId: item.clienteId?._id || item.clienteId || '',
            productoBaseId: item.productoBaseId?._id || item.productoBaseId || '',
            nombre: item.nombre || '',
            descripcion: item.descripcion || '',
            categoria: item.categoria || '',
            marcaId: item.marcaId?._id || item.marcaId || '',
            material: item.material || 'Policarbonato',
            color: item.color || 'Transparente',
            tipoLente: item.tipoLente || 'Monofocal',
            precioCalculado: typeof item.precioCalculado === 'number' ? item.precioCalculado : null,
            fechaEntregaEstimada: item.fechaEntregaEstimada ? formatDate(item.fechaEntregaEstimada) : '',
            cotizacion: {
                total: item.cotizacion?.total ?? null,
                validaHasta: item.cotizacion?.validaHasta ? formatDate(item.cotizacion.validaHasta) : ''
            }
        });
        setErrors({});
        setShowEditModal(true);
        console.log('✅ Modal de edición abierto');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!validate() || !editingId) return;
        try {
            const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.PRODUCTOS_PERSONALIZADOS}/${editingId}`);
            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: API_CONFIG.FETCH_CONFIG.credentials,
                body: JSON.stringify(formData)
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || `Error ${res.status}`);
            }
            setShowEditModal(false);
            setEditingId(null);
            resetForm();
            setRefreshKey(k => k + 1);
            showSuccess('Producto personalizado actualizado', 2500);
        } catch (err) {
            setErrors(prev => ({ ...prev, submit: err.message || 'Error al actualizar' }));
            showError(err.message || 'Error al actualizar el personalizado', 4000);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Â¿Eliminar este personalizado? Esta acciÃ³n no se puede deshacer.')) return;
        try {
            const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.PRODUCTOS_PERSONALIZADOS}/${id}`);
            const res = await fetch(url, {
                method: 'DELETE',
                credentials: API_CONFIG.FETCH_CONFIG.credentials,
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || `Error ${res.status}`);
            }
            setRefreshKey(k => k + 1);
            showSuccess('Producto personalizado eliminado', 2500);
        } catch (err) {
            showError(err.message || 'Error al eliminar', 4000);
        }
    };

    const handleEstadoChange = async (producto, nuevoEstado) => {
    try {
        if (producto?.source === 'pedido' && producto?.pedidoId) {
            const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.PEDIDOS}/${producto.pedidoId}/estado`);
            const res = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: API_CONFIG.FETCH_CONFIG.credentials,
                body: JSON.stringify({ estado: nuevoEstado })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
        } else {
            const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.PRODUCTOS_PERSONALIZADOS}/${producto.id}/estado`);
            const res = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: API_CONFIG.FETCH_CONFIG.credentials,
                body: JSON.stringify({ estado: nuevoEstado })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
        }
        setRefreshKey(k => k + 1);
        showSuccess('Estado actualizado', 2000);
    } catch (err) {
        showError(err.message || 'Error al actualizar estado', 3500);
    }
};

    const handleOpenViewModal = (item) => {
        setSelectedItem(item);
        setShowDetailModal(true);
    };

    // Normalizar datos desde la API para la tabla
    const productosPersonalizados = useMemo(() => {
        if (!Array.isArray(apiData)) return [];
        return apiData.map((p) => {
            const createdAtRaw = p.fechaSolicitud || p.createdAt;
            const createdAtDate = createdAtRaw ? new Date(createdAtRaw) : null;
            const isRecent = createdAtDate ? (Date.now() - createdAtDate.getTime()) <= (24 * 60 * 60 * 1000) : false;
            return {
                id: p._id,
                nombre: p.nombre,
                descripcion: p.descripcion,
                categoria: p.categoria,
                color: p.color,
                precio: formatPrice(p.precioCalculado),
                precioCalculado: p.precioCalculado,
                material: p.material,
                tipoLente: p.tipoLente,
                marcaId: p.marcaId,
                cliente: typeof p.clienteId === 'object' && p.clienteId !== null ? (p.clienteId.nombre || p.clienteId.fullName || p.clienteId.razonSocial || p.clienteId.email || String(p.clienteId._id || '')) : String(p.clienteId || ''),
                clienteId: p.clienteId,
                fechaCreacion: formatDate(createdAtRaw),
                fechaSolicitud: createdAtRaw,
                estado: estadoLabel(p.estado),
                backendEstado: p.estado,
                cotizacionId: p.cotizacionId || null,
                pedidoId: p.pedidoId || null,
                isRecent,
                source: 'personalizado',
            };
        });
    }, [apiData]);

    // Extraer filas desde pedidos: solo items con tipo 'personalizado'
    const pedidosPersonalizados = useMemo(() => {
        if (!Array.isArray(pedidosData)) return [];
        const rows = [];
        for (const ped of pedidosData) {
            const cliente = typeof ped.clienteId === 'object' && ped.clienteId !== null
                ? (ped.clienteId.nombre || ped.clienteId.fullName || ped.clienteId.razonSocial || ped.clienteId.email || String(ped.clienteId._id || ''))
                : String(ped.clienteId || '');
            const createdAtRaw = ped.createdAt || ped.fecha;
            const createdAtDate = createdAtRaw ? new Date(createdAtRaw) : null;
            const isRecent = createdAtDate ? (Date.now() - createdAtDate.getTime()) <= (24 * 60 * 60 * 1000) : false;
            const items = Array.isArray(ped.items) ? ped.items : [];
            items.forEach((it, idx) => {
                if ((it.tipo || 'otro') === 'personalizado') {
                    rows.push({
                        id: `${ped._id}:${idx}`,
                        nombre: it.nombre || 'Personalizado',
                        descripcion: it.categoria ? `CategorÃ­a: ${it.categoria}` : '',
                        categoria: it.categoria || 'Personalizado',
                        color: '-',
                        precio: formatPrice(typeof it.subtotal === 'number' ? it.subtotal : (Number(it.precioUnitario||0) * Number(it.cantidad||1))),
                        precioCalculado: typeof it.subtotal === 'number' ? it.subtotal : (Number(it.precioUnitario||0) * Number(it.cantidad||1)),
                        material: '-',
                        tipoLente: '-',
                        marcaId: null,
                        cliente,
                        clienteId: ped.clienteId,
                        fechaCreacion: formatDate(createdAtRaw),
                        fechaSolicitud: createdAtRaw,
                        estado: estadoLabel('en_proceso'),
                        backendEstado: 'en_proceso',
                        cotizacionId: ped.cotizacionId || null,
                        pedidoId: ped._id,
                        isRecent,
                        source: 'pedido',
                    });
                }
            });
        }
        return rows;
    }, [pedidosData]);

    // Unir personalizados propios con personalizados provenientes de pedidos
    const allPersonalizados = useMemo(() => {
        return [...productosPersonalizados, ...pedidosPersonalizados];
    }, [productosPersonalizados, pedidosPersonalizados]);

    // FunciÃ³n para aplicar filtros avanzados
    const applyAdvancedFilters = useCallback((personalizado) => {
        // Filtro por categorÃ­a
        if (selectedCategory !== 'todas' && personalizado.categoria !== selectedCategory) {
            return false;
        }

        // Filtro por marca
        if (filters.marca !== 'todas') {
            const marcaId = personalizado.marcaId?._id || personalizado.marcaId;
            if (marcaId !== filters.marca) {
                return false;
            }
        }

        // Filtro por cliente
        if (filters.cliente !== 'todos') {
            const clienteId = personalizado.clienteId?._id || personalizado.clienteId;
            if (clienteId !== filters.cliente) {
                return false;
            }
        }

        // Filtro por estado
        if (filters.estado !== 'todos' && personalizado.backendEstado !== filters.estado) {
            return false;
        }

        // Filtro por material
        if (filters.material !== 'todos' && personalizado.material?.toLowerCase() !== filters.material.toLowerCase()) {
            return false;
        }

        // Filtro por color
        if (filters.color !== 'todos' && personalizado.color?.toLowerCase() !== filters.color.toLowerCase()) {
            return false;
        }

        // Filtro por tipo de lente
        if (filters.tipoLente !== 'todos' && personalizado.tipoLente?.toLowerCase() !== filters.tipoLente.toLowerCase()) {
            return false;
        }

        // Filtro por precio
        if (filters.precioMin && personalizado.precioCalculado < parseFloat(filters.precioMin)) {
            return false;
        }
        if (filters.precioMax && personalizado.precioCalculado > parseFloat(filters.precioMax)) {
            return false;
        }

        // Filtro por fecha
        if (filters.fechaDesde) {
            const fechaDesde = new Date(filters.fechaDesde);
            if (new Date(personalizado.fechaSolicitud || new Date(0)) < fechaDesde) {
                return false;
            }
        }
        if (filters.fechaHasta) {
            const fechaHasta = new Date(filters.fechaHasta);
            fechaHasta.setHours(23, 59, 59);
            if (new Date(personalizado.fechaSolicitud || new Date(0)) > fechaHasta) {
                return false;
            }
        }

        // Filtro por recientes
        if (filters.recent && !personalizado.isRecent) {
            return false;
        }

        return true;
    }, [selectedCategory, filters]);

    // FunciÃ³n para ordenar datos
    const sortData = useCallback((data) => {
        return [...data].sort((a, b) => {
            let valueA, valueB;
            
            switch (sortBy) {
                case 'nombre':
                    valueA = a.nombre?.toLowerCase() || '';
                    valueB = b.nombre?.toLowerCase() || '';
                    break;
                case 'precioCalculado':
                    valueA = a.precioCalculado || 0;
                    valueB = b.precioCalculado || 0;
                    break;
                case 'fechaSolicitud':
                    valueA = new Date(a.fechaSolicitud || new Date(0));
                    valueB = new Date(b.fechaSolicitud || new Date(0));
                    break;
                default:
                    return 0;
            }

            if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [sortBy, sortOrder]);

    // LÃ³gica de filtrado, ordenamiento y paginaciÃ³n
    const filteredAndSortedPersonalizados = useMemo(() => {
        let currentPersonalizados = allPersonalizados;

        // Filtro por tÃ©rmino de bÃºsqueda
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            currentPersonalizados = currentPersonalizados.filter(
                (personalizado) =>
                    personalizado.nombre?.toLowerCase().includes(searchLower) ||
                    personalizado.descripcion?.toLowerCase().includes(searchLower) ||
                    personalizado.cliente?.toLowerCase().includes(searchLower) ||
                    personalizado.categoria?.toLowerCase().includes(searchLower) ||
                    personalizado.material?.toLowerCase().includes(searchLower) ||
                    personalizado.color?.toLowerCase().includes(searchLower)
            );
        }

        // Aplicar filtros avanzados
        currentPersonalizados = currentPersonalizados.filter(applyAdvancedFilters);

        return sortData(currentPersonalizados);
    }, [allPersonalizados, searchTerm, applyAdvancedFilters, sortData]);

    const { paginatedData: currentPersonalizados, ...paginationProps } = usePagination(filteredAndSortedPersonalizados, ITEMS_PER_PAGE);

    // Cargar estadÃ­sticas rÃ¡pidas desde backend con fallback al cÃ¡lculo local
    useEffect(() => {
        let cancelled = false;
        const loadStats = async () => {
            try {
                const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.PRODUCTOS_PERSONALIZADOS}/estadisticas/resumen`);
                const res = await fetch(url, { credentials: API_CONFIG.FETCH_CONFIG.credentials });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json().catch(() => ({}));
                const obj = (json && typeof json === 'object' && (json.data || json)) || {};
                const lista = Array.isArray(obj.estadisticas) ? obj.estadisticas : [];
                const enProceso = lista.find(e => e._id === 'en_proceso')?.count ?? 0;
                const completado = lista.find(e => e._id === 'completado')?.count ?? 0;
                const total = typeof obj.totalProductos === 'number' 
                    ? obj.totalProductos 
                    : lista.reduce((acc, e) => acc + (e.count || 0), 0);
                if (!cancelled) setStats({ total, enProceso, completado });
            } catch (err) {
                // Fallback a cÃ¡lculo local
                const total = allPersonalizados.length;
                const enProceso = allPersonalizados.filter(p => p.estado === 'En Proceso').length;
                const completado = allPersonalizados.filter(p => p.estado === 'Completado').length;
                if (!cancelled) setStats({ total, enProceso, completado });
            }
        };
        loadStats();
        return () => { cancelled = true; };
    }, [refreshKey, allPersonalizados]);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            setCategoryError(null);
            try {
                const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIAS), {
                    withCredentials: true
                });
                if (response.data && Array.isArray(response.data)) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategoryError('No se pudieron cargar las categorías');
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Obtener opciones Ãºnicas para filtros
    const uniqueMateriales = useMemo(() => {
        const materiales = allPersonalizados
            .map(p => p.material)
            .filter(Boolean)
            .filter((material, index, arr) => arr.indexOf(material) === index);
        return materiales.sort();
    }, [allPersonalizados]);

    const uniqueColores = useMemo(() => {
        const colores = allPersonalizados
            .map(p => p.color)
            .filter(Boolean)
            .filter((color, index, arr) => arr.indexOf(color) === index);
        return colores.sort();
    }, [allPersonalizados]);

    const uniqueTipoLentes = useMemo(() => {
        const tipos = allPersonalizados
            .map(p => p.tipoLente)
            .filter(Boolean)
            .filter((tipo, index, arr) => arr.indexOf(tipo) === index);
        return tipos.sort();
    }, [allPersonalizados]);

    // Opciones para selects
    const clienteOptions = useMemo(() => (Array.isArray(clientesData) ? clientesData.map(c => ({
        value: c._id,
        label: c.nombre || c.fullName || c.razonSocial || c.email || String(c._id)
    })) : []), [clientesData]);

    // Opciones de categorías para el select
    const categoriaOptions = useMemo(() => {
        if (loadingCategories) return [];
        return categories.map(cat => ({
            value: cat.nombre,
            label: cat.nombre
        }));
    }, [categories, loadingCategories]);

    const lenteOptions = useMemo(() => (Array.isArray(lentesData) ? lentesData.map(l => ({
        value: l._id,
        label: l.nombre || l.modelo || String(l._id)
    })) : []), [lentesData]);

    const marcaOptions = useMemo(() => (Array.isArray(marcasData) ? marcasData.map(m => ({
        value: m._id,
        label: m.nombre || m.descripcion || String(m._id)
    })) : []), [marcasData]);

    const getEstadoColor = (estado) => {
        switch(estado) {
            case 'Completado': return 'bg-green-100 text-green-800';
            case 'En Proceso': return 'bg-yellow-100 text-yellow-800';
            case 'Pendiente': return 'bg-red-100 text-red-800';
            case 'Cancelado': return 'bg-gray-100 text-gray-800';
            case 'Entregado': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const convertirAPedido = async (cotizacionId) => {
        if (!cotizacionId) {
            showError('Este personalizado no tiene cotizaciÃ³n vinculada', 3000);
            return;
        }
        try {
            const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.COTIZACIONES}/${cotizacionId}/convertir-a-pedido`);
            const res = await fetch(url, {
                method: 'POST',
                credentials: API_CONFIG.FETCH_CONFIG.credentials,
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
            showSuccess('CotizaciÃ³n convertida en pedido', 2500);
            setRefreshKey(k => k + 1);
        } catch (err) {
            showError(err.message || 'No se pudo convertir a pedido', 4000);
        }
    };

    // FunciÃ³n para renderizar filas
    const renderRow = useCallback((producto) => {
        return (
            <>
                <td className="px-6 py-4">
                    <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                            {producto.nombre}
                            {producto.isRecent && (
                                <span className="px-2 py-0.5 text-[11px] rounded-full bg-green-100 text-green-700 border border-green-200">Nuevo</span>
                            )}
                        </div>
                        <div className="text-sm text-gray-500">{producto.descripcion}</div>
                    </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{producto.cliente}</td>
                <td className="px-6 py-4 text-gray-600">{producto.categoria}</td>
                <td className="px-6 py-4 text-gray-600">{producto.color}</td>
                <td className="px-6 py-4 font-semibold text-cyan-600">{producto.precio}</td>
                <td className="px-6 py-4 text-gray-600">{producto.fechaCreacion}</td>
                <td className="px-6 py-4">
                    <select
                        value={producto.backendEstado || 'pendiente'}
                        onChange={(e) => handleEstadoChange(producto, e.target.value)}
                        className="px-3 py-1 border rounded-lg text-sm"
                    >
                        {estadoOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </td>
                <td className="px-6 py-4">
                    <div className="flex space-x-1">
                        <button
                            className="p-1.5 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                            title="Eliminar"
                            onClick={() => producto.source === 'pedido' ? null : handleDelete(producto.id)}
                            aria-label={`Eliminar ${producto.nombre}`}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            className="p-1.5 text-blue-600 bg-white hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                            title="Ver detalles"
                            onClick={() => handleOpenViewModal(producto)}
                            aria-label={`Ver detalles de ${producto.nombre}`}
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            className="p-1.5 text-green-600 bg-white hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110"
                            title="Editar"
                            onClick={() => producto.source === 'pedido' ? null : prepareEdit(producto.id)}
                            aria-label={`Editar ${producto.nombre}`}
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        {producto.source !== 'pedido' && (
                            <button
                                className={`p-1.5 ${producto.cotizacionId ? 'text-cyan-700 hover:bg-cyan-50' : 'text-gray-400 cursor-not-allowed'} rounded-lg transition-colors`}
                                title={producto.cotizacionId ? 'Convertir cotizaciÃ³n a pedido' : 'Sin cotizaciÃ³n vinculada'}
                                disabled={!producto.cotizacionId}
                                onClick={() => convertirAPedido(producto.cotizacionId)}
                            >
                                <Package className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </td>
            </>
        );
    }, [handleEstadoChange, handleDelete, handleOpenViewModal, prepareEdit, convertirAPedido]);

    // Renderizado del componente
    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <ToastContainer>
                    <Alert 
                        type={alertState.type}
                        message={alertState.message}
                        show={alertState.show}
                        onClose={hideAlert}
                        duration={alertState.duration}
                    />
                </ToastContainer>
                <SkeletonLoader />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ToastContainer>
                <Alert 
                    type={alertState.type}
                    message={alertState.message}
                    show={alertState.show}
                    onClose={hideAlert}
                    duration={alertState.duration}
                />
            </ToastContainer>
            <div className="animate-fade-in">

                {/* EstadÃ­sticas rÃ¡pidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">Total Personalizados</p>
                <p className="text-3xl font-bold text-cyan-600 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-cyan-600" />
            </div>
        </div>
    </div>
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">En Proceso</p>
                <p className="text-3xl font-bold text-cyan-600 mt-2">{stats.enProceso}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-cyan-600" />
            </div>
        </div>
    </div>
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">Completados</p>
                <p className="text-3xl font-bold text-cyan-600 mt-2">{stats.completado}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-cyan-600" />
            </div>
        </div>
    </div>
</div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <PageHeader 
                        title="Productos Personalizados" 
                        buttonLabel="Agregar Personalizado" 
                        onButtonClick={() => setShowAddModal(true)} 
                    />
                    
                    {/* BARRA DE BÃšSQUEDA Y CONTROLES */}
                    <div className="px-6 py-4 border-b bg-gray-50">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                            {/* Barra de bÃºsqueda */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar por producto o cliente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    aria-label="Buscar productos personalizados"
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
                                                            {isActive && <CheckCircle className="w-4 h-4 ml-auto" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Dropdown de categorías */}
                                <CategoryDropdown
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    onCategorySelect={setSelectedCategory}
                                    loading={loadingCategories}
                                    error={categoryError}
                                />

                                {/* BotÃ³n de filtros */}
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
                                                selectedCategory !== 'todas' && 1,
                                                filters.marca !== 'todas' && 1,
                                                filters.cliente !== 'todos' && 1,
                                                filters.estado !== 'todos' && 1,
                                                filters.material !== 'todos' && 1,
                                                filters.color !== 'todos' && 1,
                                                filters.tipoLente !== 'todos' && 1,
                                                filters.precioMin && 1,
                                                filters.precioMax && 1,
                                                filters.fechaDesde && 1,
                                                filters.fechaHasta && 1,
                                                filters.recent && 1
                                            ].filter(Boolean).length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* InformaciÃ³n de resultados */}
                        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                            <span>
                                {filteredAndSortedPersonalizados.length} personalizado{filteredAndSortedPersonalizados.length !== 1 ? 's' : ''} 
                                {hasActiveFilters() && ` (filtrado${filteredAndSortedPersonalizados.length !== 1 ? 's' : ''} de ${allPersonalizados.length})`}
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
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {/* Filtro por Marca */}
                                    <div>
                                        <label htmlFor="filter-marca" className="block text-sm font-medium text-gray-700 mb-2">
                                            Marca
                                        </label>
                                        <select
                                            id="filter-marca"
                                            value={filters.marca}
                                            onChange={(e) => handleFilterChange('marca', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        >
                                            <option value="todas">Todas las marcas</option>
                                            {marcaOptions.map(marca => (
                                                <option key={marca.value} value={marca.value}>{marca.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filtro por Cliente */}
                                    <div>
                                        <label htmlFor="filter-cliente" className="block text-sm font-medium text-gray-700 mb-2">
                                            Cliente
                                        </label>
                                        <select
                                            id="filter-cliente"
                                            value={filters.cliente}
                                            onChange={(e) => handleFilterChange('cliente', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        >
                                            <option value="todos">Todos los clientes</option>
                                            {clienteOptions.map(cliente => (
                                                <option key={cliente.value} value={cliente.value}>{cliente.label}</option>
                                            ))}
                                        </select>
                                    </div>

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
                                            <option value="todos">Todos los estados</option>
                                            {estadoOptions.map(estado => (
                                                <option key={estado.value} value={estado.value}>{estado.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filtro por Material */}
                                    <div>
                                        <label htmlFor="filter-material" className="block text-sm font-medium text-gray-700 mb-2">
                                            Material
                                        </label>
                                        <select
                                            id="filter-material"
                                            value={filters.material}
                                            onChange={(e) => handleFilterChange('material', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        >
                                            <option value="todos">Todos los materiales</option>
                                            {uniqueMateriales.map(material => (
                                                <option key={material} value={material}>{material}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filtro por Color */}
                                    <div>
                                        <label htmlFor="filter-color" className="block text-sm font-medium text-gray-700 mb-2">
                                            Color
                                        </label>
                                        <select
                                            id="filter-color"
                                            value={filters.color}
                                            onChange={(e) => handleFilterChange('color', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        >
                                            <option value="todos">Todos los colores</option>
                                            {uniqueColores.map(color => (
                                                <option key={color} value={color}>{color}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filtro por Tipo de Lente */}
                                    <div>
                                        <label htmlFor="filter-tipo-lente" className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo de Lente
                                        </label>
                                        <select
                                            id="filter-tipo-lente"
                                            value={filters.tipoLente}
                                            onChange={(e) => handleFilterChange('tipoLente', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        >
                                            <option value="todos">Todos los tipos</option>
                                            {uniqueTipoLentes.map(tipo => (
                                                <option key={tipo} value={tipo}>{tipo}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filtro por Rango de Precio */}
                                    <div className="md:col-span-2 lg:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Precio</label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="number"
                                                placeholder="Min $"
                                                value={filters.precioMin}
                                                onChange={(e) => handleFilterChange('precioMin', e.target.value)}
                                                className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                min="0"
                                                step="0.01"
                                                aria-label="Precio mÃ­nimo"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max $"
                                                value={filters.precioMax}
                                                onChange={(e) => handleFilterChange('precioMax', e.target.value)}
                                                className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                min="0"
                                                step="0.01"
                                                aria-label="Precio mÃ¡ximo"
                                            />
                                        </div>
                                    </div>

                                    {/* Filtro por Fecha */}
                                    <div className="md:col-span-2 lg:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Solicitud</label>
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

                                    {/* Filtro por Recientes */}
                                    <div className="flex items-center">
                                        <label htmlFor="filter-recent" className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                id="filter-recent"
                                                checked={filters.recent}
                                                onChange={(e) => handleFilterChange('recent', e.target.checked)}
                                                className="mr-2 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Solo recientes (24h)</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Botones de acciÃ³n del panel de filtros */}
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

                    <div>
                        {/* TABLA DE DATOS */}
                        <div className="overflow-x-auto">
                            <DataTable
                                columns={TABLE_COLUMNS}
                                data={currentPersonalizados}
                                renderRow={renderRow}
                                isLoading={false}
                                noDataMessage="No se encontraron productos personalizados"
                                noDataSubMessage={hasActiveFilters() ? 'Intenta ajustar los filtros de bÃºsqueda' : 'Comienza creando tu primer producto personalizado'}
                            />
                        </div>

                        <Pagination {...paginationProps} />
                    </div>
                </div>
            </div>

            {/* Modal Crear */}
            {showAddModal && (
    <PersonalizadosFormModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        onSubmit={handleCreate}
        title="Crear Producto Personalizado"
        formData={formData}
        handleInputChange={handleInputChange}
        errors={errors}
        submitLabel="Crear Personalizado"
        clienteOptions={clienteOptions}
        lenteOptions={lenteOptions}
        categoriaOptions={categoriaOptions}
        marcaOptions={marcaOptions}
        loadingCategories={loadingCategories}
    />
)}

{/* Modal Editar - DESPUÃ‰S */}
{showEditModal && (
    <PersonalizadosFormModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingId(null); resetForm(); }}
        onSubmit={handleUpdate}
        title="Editar Producto Personalizado"
        formData={formData}
        handleInputChange={handleInputChange}
        errors={errors}
        submitLabel="Actualizar Personalizado"
        clienteOptions={clienteOptions}
        lenteOptions={lenteOptions}
        categoriaOptions={categoriaOptions}
        marcaOptions={marcaOptions}
        loadingCategories={loadingCategories}
        selectedPersonalizado={editingId ? { _id: editingId } : null}
    />
)}

            {/* Modal Detalles */}
            {showDetailModal && (
                <DetailModal
                    isOpen={showDetailModal}
                    onClose={() => { setShowDetailModal(false); setSelectedItem(null); }}
                    title="Detalles del Personalizado"
                    item={selectedItem}
                    data={selectedItem ? [
                        { label: 'ID', value: selectedItem.id },
                        { label: 'Nombre', value: selectedItem.nombre },
                        { label: 'DescripciÃ³n', value: selectedItem.descripcion || '-' },
                        { label: 'Cliente', value: selectedItem.cliente || '-' },
                        { label: 'CategorÃ­a', value: selectedItem.categoria || '-' },
                        { label: 'Material', value: selectedItem.material || '-' },
                        { label: 'Color', value: selectedItem.color || '-' },
                        { label: 'Tipo de Lente', value: selectedItem.tipoLente || '-' },
                        { label: 'Precio', value: selectedItem.precio || '-' },
                        { label: 'Fecha', value: selectedItem.fechaCreacion || '-' },
                        { label: 'Estado', value: selectedItem.estado || '-' },
                        selectedItem.cotizacionId ? { label: 'CotizaciÃ³n ID', value: selectedItem.cotizacionId } : null,
                        selectedItem.pedidoId ? { label: 'Pedido ID', value: selectedItem.pedidoId } : null,
                        { label: 'Origen', value: selectedItem.source === 'pedido' ? 'Pedido' : 'Personalizado' },
                        { label: 'Reciente', value: selectedItem.isRecent ? 'SÃ­ (Ãºltimas 24h)' : 'No' },
                    ].filter(Boolean) : []}
                />
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

export default PersonalizadosContent;

