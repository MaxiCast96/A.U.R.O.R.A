import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Trash2, Eye, Edit, Package, Clock, UserCheck, ChevronDown, Tags } from 'lucide-react';
import { useApiData } from '../../../hooks/useApiData';
import { API_CONFIG, buildApiUrl } from '../../../config/api';
import FormModal from '../ui/FormModal';
import Alert, { ToastContainer, useAlert } from '../../ui/Alert';
import DetailModal from '../ui/DetailModal';
import axios from 'axios';

// Helper para obtener el componente de icono por nombre
const getIconComponent = (iconName) => {
  if (!iconName) return <Tags className="w-4 h-4" />;
  
  // Mapeo de iconos comunes (puedes expandir esto según los iconos disponibles)
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
          {selectedCategory === 'todos' ? (
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
              <span className="text-gray-700">Seleccionar categoría</span>
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
                {/* Opción "Todos" */}
                <button
                  onClick={() => handleCategorySelect('todos')}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    selectedCategory === 'todos' ? 'bg-cyan-50 text-cyan-600' : 'text-gray-700'
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

                {/* Categorías */}
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
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const { data: apiData, loading, error } = useApiData('productosPersonalizados', { r: refreshKey });
    const { data: pedidosData } = useApiData('pedidos', { r: refreshKey });
    const { data: clientesData } = useApiData('clientes');
    const { data: lentesData } = useApiData('lentes');
    const { data: marcasData } = useApiData('marcas');
    const [stats, setStats] = useState({ total: 0, enProceso: 0, completado: 0 });
    const [showRecentOnly, setShowRecentOnly] = useState(false);
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
        const item = Array.isArray(apiData) ? apiData.find(x => x._id === id) : null;
        if (!item) return;
        setEditingId(id);
        setFormData({
            clienteId: item.clienteId?._id || item.clienteId || '',
            productoBaseId: item.productoBaseId?._id || item.productoBaseId || '',
            nombre: item.nombre || '',
            descripcion: item.descripcion || '',
            categoria: item.categoria || '',
            marcaId: item.marcaId?._id || item.marcaId || '',
            material: item.material || '',
            color: item.color || '',
            tipoLente: item.tipoLente || '',
            precioCalculado: typeof item.precioCalculado === 'number' ? item.precioCalculado : null,
            fechaEntregaEstimada: item.fechaEntregaEstimada ? formatDate(item.fechaEntregaEstimada) : '',
            cotizacion: {
                total: item.cotizacion?.total ?? null,
                validaHasta: item.cotizacion?.validaHasta ? formatDate(item.cotizacion.validaHasta) : ''
            }
        });
        setErrors({});
        setShowEditModal(true);
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
        if (!window.confirm('¿Eliminar este personalizado? Esta acción no se puede deshacer.')) return;
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

    const handleEstadoChange = async (id, nuevoEstado) => {
        try {
            const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.PRODUCTOS_PERSONALIZADOS}/${id}/estado`);
            const res = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: API_CONFIG.FETCH_CONFIG.credentials,
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || `Error ${res.status}`);
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
                cliente: typeof p.clienteId === 'object' && p.clienteId !== null ? (p.clienteId.nombre || p.clienteId.fullName || p.clienteId.razonSocial || p.clienteId.email || String(p.clienteId._id || '')) : String(p.clienteId || ''),
                fechaCreacion: formatDate(createdAtRaw),
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
                        descripcion: it.categoria ? `Categoría: ${it.categoria}` : '',
                        categoria: it.categoria || 'Personalizado',
                        color: '-',
                        precio: formatPrice(typeof it.subtotal === 'number' ? it.subtotal : (Number(it.precioUnitario||0) * Number(it.cantidad||1))),
                        cliente,
                        fechaCreacion: formatDate(createdAtRaw),
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

    // Cargar estadísticas rápidas desde backend con fallback al cálculo local
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
                // Fallback a cálculo local
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

    const filteredProducts = allPersonalizados.filter(producto => {
        const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             producto.cliente.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'todos' || producto.categoria === selectedCategory;
        const matchesRecent = !showRecentOnly || producto.isRecent;
        return matchesSearch && matchesCategory && matchesRecent;
    });

    const getEstadoColor = (estado) => {
        switch(estado) {
            case 'Completado': return 'bg-green-100 text-green-800';
            case 'En Proceso': return 'bg-yellow-100 text-yellow-800';
            case 'Pendiente': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const convertirAPedido = async (cotizacionId) => {
        if (!cotizacionId) {
            showError('Este personalizado no tiene cotización vinculada', 3000);
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
            showSuccess('Cotización convertida en pedido', 2500);
            setRefreshKey(k => k + 1);
        } catch (err) {
            showError(err.message || 'No se pudo convertir a pedido', 4000);
        }
    };

    // Estado para la página actual y tamaño de página.
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // Calculamos la cantidad total de páginas
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

    // Obtenemos los productos de la página actual
    const currentProducts = filteredProducts.slice(
        currentPage * pageSize,
        currentPage * pageSize + pageSize
    );

    // Funciones para cambiar de página
    const goToFirstPage = () => setCurrentPage(0);
    const goToPreviousPage = () => setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
    const goToNextPage = () => setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
    const goToLastPage = () => setCurrentPage(totalPages - 1);

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

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Total Personalizados</p>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
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
                                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.enProceso}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Completados</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats.completado}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-cyan-500 text-white p-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Productos Personalizados</h2>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Añadir Personalizado</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Filtros */}
                    <div className="p-6 bg-gray-50 border-b">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por producto o cliente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                                {/* Dropdown de categorías */}
                                <CategoryDropdown
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    onCategorySelect={setSelectedCategory}
                                    loading={loadingCategories}
                                    error={categoryError}
                                />
                                
                                <button
                                    onClick={() => setShowRecentOnly(prev => !prev)}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        showRecentOnly
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                    title="Mostrar solo solicitudes de las últimas 24 horas"
                                >
                                    {showRecentOnly ? 'Recientes (24h): ON' : 'Recientes (24h)'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        {/* Tabla */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-cyan-500 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold">Producto</th>
                                        <th className="px-6 py-4 text-left font-semibold">Cliente</th>
                                        <th className="px-6 py-4 text-left font-semibold">Categoría</th>
                                        <th className="px-6 py-4 text-left font-semibold">Color</th>
                                        <th className="px-6 py-4 text-left font-semibold">Precio</th>
                                        <th className="px-6 py-4 text-left font-semibold">Fecha</th>
                                        <th className="px-6 py-4 text-left font-semibold">Estado</th>
                                        <th className="px-6 py-4 text-left font-semibold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading && (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-6 text-center text-gray-500">Cargando...</td>
                                        </tr>
                                    )}
                                    {!loading && error && (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-6 text-center text-red-600">{String(error)}</td>
                                        </tr>
                                    )}
                                    {!loading && !error && currentProducts.map((producto) => (
                                        <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
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
                                                    onChange={(e) => handleEstadoChange(producto.id, e.target.value)}
                                                    className="px-3 py-1 border rounded-lg text-sm"
                                                >
                                                    {estadoOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <button
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                        onClick={() => producto.source === 'pedido' ? null : handleDelete(producto.id)}
                                                        disabled={producto.source === 'pedido'}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Ver detalles"
                                                        onClick={() => handleOpenViewModal(producto)}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                        onClick={() => producto.source === 'pedido' ? null : prepareEdit(producto.id)}
                                                        disabled={producto.source === 'pedido'}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    {producto.source !== 'pedido' && (
                                                        <button
                                                            className={`p-2 ${producto.cotizacionId ? 'text-cyan-700 hover:bg-cyan-50' : 'text-gray-400 cursor-not-allowed'} rounded-lg transition-colors`}
                                                            title={producto.cotizacionId ? 'Convertir cotización a pedido' : 'Sin cotización vinculada'}
                                                            disabled={!producto.cotizacionId}
                                                            onClick={() => convertirAPedido(producto.cotizacionId)}
                                                        >
                                                            <Package className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mensaje cuando no hay resultados */}
                        {!loading && !error && filteredProducts.length === 0 && (
                            <div className="p-8 text-center">
                                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No se encontraron productos personalizados
                                </h3>
                                <p className="text-gray-500">
                                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primer producto personalizado'}
                                </p>
                            </div>
                        )}

                        {/* Controles de paginación centrados */}
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
                            <div className="flex items-center gap-2 m-[25px]">
                                <button
                                    onClick={goToFirstPage}
                                    disabled={currentPage === 0}
                                    className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                                >
                                    {"<<"}
                                </button>
                                <button
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 0}
                                    className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                                >
                                    {"<"}
                                </button>
                                <span className="text-gray-700 font-medium">
                                    Página {currentPage + 1} de {totalPages}
                                </span>
                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages - 1}
                                    className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                                >
                                    {">"}
                                </button>
                                <button
                                    type='button'
                                    onClick={goToLastPage}
                                    disabled={currentPage === totalPages - 1}
                                    className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                                >
                                    {">>"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Crear */}
            {showAddModal && (
                <FormModal
                    isOpen={showAddModal}
                    onClose={() => { setShowAddModal(false); }}
                    onSubmit={handleCreate}
                    title="Crear Personalizado"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    errors={errors}
                    submitLabel="Crear"
                    gridCols={2}
                    fields={[
                        { name: 'clienteId', label: 'Cliente', type: 'select', required: true, options: clienteOptions },
                        { name: 'productoBaseId', label: 'Producto Base (Lente)', type: 'select', required: true, options: lenteOptions },
                        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
                        { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true, colSpan: 2 },
                        { name: 'categoria', label: 'Categoría', type: 'select', required: true, options: categoriaOptions, loading: loadingCategories },
                        { name: 'marcaId', label: 'Marca', type: 'select', required: true, options: marcaOptions },
                        { name: 'material', label: 'Material', type: 'text', required: true },
                        { name: 'color', label: 'Color', type: 'text', required: true },
                        { name: 'tipoLente', label: 'Tipo de Lente', type: 'text', required: true },
                        { name: 'precioCalculado', label: 'Precio Calculado', type: 'number', required: true },
                        { name: 'fechaEntregaEstimada', label: 'Fecha Entrega Estimada', type: 'date', required: true },
                        { name: 'cotizacion.total', label: 'Cotización Total', type: 'number', required: true, nested: true },
                        { name: 'cotizacion.validaHasta', label: 'Cotización Válida Hasta', type: 'date', required: true, nested: true },
                    ]}
                />
            )}

            {/* Modal Editar */}
            {showEditModal && (
                <FormModal
                    isOpen={showEditModal}
                    onClose={() => { setShowEditModal(false); setEditingId(null); }}
                    onSubmit={handleUpdate}
                    title="Editar Personalizado"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    errors={errors}
                    submitLabel="Guardar Cambios"
                    gridCols={2}
                    fields={[
                        { name: 'clienteId', label: 'Cliente', type: 'select', required: true, options: clienteOptions },
                        { name: 'productoBaseId', label: 'Producto Base (Lente)', type: 'select', required: true, options: lenteOptions },
                        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
                        { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true, colSpan: 2 },
                        { name: 'categoria', label: 'Categoría', type: 'select', required: true, options: categoriaOptions, loading: loadingCategories },
                        { name: 'marcaId', label: 'Marca', type: 'select', required: true, options: marcaOptions },
                        { name: 'material', label: 'Material', type: 'text', required: true },
                        { name: 'color', label: 'Color', type: 'text', required: true },
                        { name: 'tipoLente', label: 'Tipo de Lente', type: 'text', required: true },
                        { name: 'precioCalculado', label: 'Precio Calculado', type: 'number', required: true },
                        { name: 'fechaEntregaEstimada', label: 'Fecha Entrega Estimada', type: 'date', required: true },
                        { name: 'cotizacion.total', label: 'Cotización Total', type: 'number', required: true, nested: true },
                        { name: 'cotizacion.validaHasta', label: 'Cotización Válida Hasta', type: 'date', required: true, nested: true },
                    ]}
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
                        { label: 'Descripción', value: selectedItem.descripcion || '-' },
                        { label: 'Cliente', value: selectedItem.cliente || '-' },
                        { label: 'Categoría', value: selectedItem.categoria || '-' },
                        { label: 'Color', value: selectedItem.color || '-' },
                        { label: 'Precio', value: selectedItem.precio || '-' },
                        { label: 'Fecha', value: selectedItem.fechaCreacion || '-' },
                        { label: 'Estado', value: selectedItem.estado || '-' },
                        selectedItem.cotizacionId ? { label: 'Cotización ID', value: selectedItem.cotizacionId } : null,
                        selectedItem.pedidoId ? { label: 'Pedido ID', value: selectedItem.pedidoId } : null,
                        { label: 'Origen', value: selectedItem.source === 'pedido' ? 'Pedido' : 'Personalizado' },
                    ].filter(Boolean) : []}
                />
            )}
        </div>
    );
};

export default PersonalizadosContent;