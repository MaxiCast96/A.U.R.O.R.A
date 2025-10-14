// src/pages/LentesContent.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../config/api';
import { useForm } from '../../../hooks/admin/useForm';
import { usePagination } from '../../../hooks/admin/usePagination';

// Componentes de UI
import PageHeader from '../ui/PageHeader';
import StatsGrid from '../ui/StatsGrid';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import ConfirmationModal from '../ui/ConfirmationModal';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';
import LentesFormModal from '../management/lentes/LentesFormModal';

// Iconos
import { 
  Search, Plus, Trash2, Eye, Edit, Glasses, TrendingUp, Package, DollarSign, Tag, 
  Building2, Palette, Layers, Filter, X, ChevronDown, SortAsc, SortDesc, CheckCircle
} from 'lucide-react';

// Hook para notificaciones
const useAlert = () => {
    const [alert, setAlert] = useState(null);

    const showAlert = useCallback((type, message) => {
        setAlert({ type, message });
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            setAlert(null);
        }, 5000);
    }, []);

    const hideAlert = useCallback(() => {
        setAlert(null);
    }, []);

    return {
        alert,
        showAlert,
        hideAlert
    };
};

// Configuración
const ITEMS_PER_PAGE = 12;

// Estados iniciales para filtros
const INITIAL_FILTERS = {
  categoria: 'todas',
  marca: 'todas',
  tipoLente: 'todos',
  enPromocion: 'todos',
  stock: 'todos',
  precioMin: '',
  precioMax: '',
  fechaDesde: '',
  fechaHasta: '',
  material: 'todos',
  color: 'todos'
};

// Opciones de ordenamiento
const SORT_OPTIONS = [
  { value: 'fechaCreacion-desc', label: 'Más Recientes Primero', icon: Package },
  { value: 'fechaCreacion-asc', label: 'Más Antiguos Primero', icon: Package },
  { value: 'nombre-asc', label: 'Nombre A-Z', icon: Glasses },
  { value: 'nombre-desc', label: 'Nombre Z-A', icon: Glasses },
  { value: 'precioBase-desc', label: 'Precio: Mayor a Menor', icon: DollarSign },
  { value: 'precioBase-asc', label: 'Precio: Menor a Mayor', icon: DollarSign },
  { value: 'stock-desc', label: 'Mayor Stock', icon: Package },
  { value: 'stock-asc', label: 'Menor Stock', icon: Package },
];

// Columnas de la tabla
const TABLE_COLUMNS = [
  { header: 'Producto', key: 'producto' },
  { header: 'Marca/Categoría', key: 'marca_categoria' },
  { header: 'Características', key: 'caracteristicas' },
  { header: 'Precio', key: 'precio' },
  { header: 'Stock', key: 'stock' },
  { header: 'Estado', key: 'estado' },
  { header: 'Acciones', key: 'acciones' }
];

// Helpers de API
const getBase = () => API_CONFIG.BASE_URL;
const PROD_FALLBACK = 'https://aurora-production-7e57.up.railway.app/api';
const withBase = (path, base = getBase()) => `${base}${path}`;

// --- COMPONENTE SKELETON LOADER ---
const SkeletonLoader = React.memo(() => (
  <div className="animate-pulse">
    {/* Skeleton para las estadísticas */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
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
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-40"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                      <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {Array.from({ length: 3 }, (_, btnIndex) => (
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

const LentesContent = () => {
  // Estados principales
  const [lentes, setLentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLente, setSelectedLente] = useState(null);
  
  // SISTEMA DE NOTIFICACIONES COMPLETO
  const { alert, showAlert, hideAlert } = useAlert();
  
  // Estados de modales
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estados para datos relacionados
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [sucursales, setSucursales] = useState([]);

  // Estados de filtros y ordenamiento
  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('fechaCreacion');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // Datos iniciales del formulario
  const initialFormData = {
    nombre: '',
    descripcion: '',
    categoriaId: '',
    marcaId: '',
    material: '',
    color: '',
    tipoLente: '',
    precioBase: 0,
    precioActual: 0,
    linea: '',
    medidas: { anchoPuente: '', altura: '', ancho: '' },
    imagenes: [],
    enPromocion: false,
    promocionId: '',
    fechaCreacion: new Date().toISOString().split('T')[0],
    sucursales: [],
  };

  // Hook de formulario con validación
  const { formData, setFormData, handleInputChange, resetForm, errors, validateForm } = useForm(
    initialFormData,
    (data) => {
      const newErrors = {};
      
      if (!data.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
      if (!data.descripcion?.trim()) newErrors.descripcion = 'La descripción es requerida';
      if (!data.categoriaId) newErrors.categoriaId = 'La categoría es requerida';
      if (!data.marcaId) newErrors.marcaId = 'La marca es requerida';
      if (!data.material?.trim()) newErrors.material = 'El material es requerido';
      if (!data.color?.trim()) newErrors.color = 'El color es requerido';
      if (!data.tipoLente) newErrors.tipoLente = 'El tipo de lente es requerido';
      if (!data.linea?.trim()) newErrors.linea = 'La línea es requerida';

      if (!data.precioBase || data.precioBase <= 0) {
        newErrors.precioBase = 'El precio base debe ser mayor a 0';
      }

      if (data.enPromocion) {
        if (!data.promocionId) newErrors.promocionId = 'Debe seleccionar una promoción';
        if (!data.precioActual || data.precioActual <= 0) {
          newErrors.precioActual = 'El precio promocional debe ser mayor a 0';
        } else if (data.precioActual >= data.precioBase) {
          newErrors.precioActual = 'El precio promocional debe ser menor al precio base';
        }
      }
      
      if (data.medidas) {
        if (!data.medidas.anchoPuente || data.medidas.anchoPuente <= 0) newErrors['medidas.anchoPuente'] = 'Ancho de puente inválido';
        if (!data.medidas.altura || data.medidas.altura <= 0) newErrors['medidas.altura'] = 'Altura inválida';
        if (!data.medidas.ancho || data.medidas.ancho <= 0) newErrors['medidas.ancho'] = 'Ancho inválido';
      }

      if (!data.imagenes || data.imagenes.length === 0) {
        newErrors.imagenes = 'Debe agregar al menos una imagen';
      }

      if (!data.sucursales || data.sucursales.length === 0) {
        newErrors.sucursales = 'Debe seleccionar al menos una sucursal';
      }
      
      const hasInvalidStock = data.sucursales?.some(s => s.stock < 0);
      if (hasInvalidStock) {
        newErrors.sucursales = 'El stock no puede ser negativo';
      }

      return newErrors;
    }
  );

  // Funciones utilitarias
  const getTotalStock = useCallback((lente) => {
    return lente.sucursales ? lente.sucursales.reduce((sum, s) => sum + (s.stock || 0), 0) : 0;
  }, []);

  // Función para manejar ordenamiento
  const handleSortChange = useCallback((sortValue) => {
    const [field, order] = sortValue.split('-');
    setSortBy(field);
    setSortOrder(order);
    setShowSortDropdown(false);
  }, []);

  // Función para ordenar datos
  const sortData = useCallback((data) => {
    return [...data].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'nombre':
          valueA = a.nombre?.toLowerCase() || '';
          valueB = b.nombre?.toLowerCase() || '';
          break;
        case 'precioBase':
          valueA = parseFloat(a.precioBase) || 0;
          valueB = parseFloat(b.precioBase) || 0;
          break;
        case 'stock':
          valueA = getTotalStock(a);
          valueB = getTotalStock(b);
          break;
        case 'fechaCreacion':
          valueA = new Date(a.fechaCreacion || new Date(0));
          valueB = new Date(b.fechaCreacion || new Date(0));
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortBy, sortOrder, getTotalStock]);

  // Función para aplicar filtros avanzados
  const applyAdvancedFilters = useCallback((lente) => {
    if (filters.categoria !== 'todas' && lente.categoriaId?._id !== filters.categoria) {
      return false;
    }

    if (filters.marca !== 'todas' && lente.marcaId?._id !== filters.marca) {
      return false;
    }

    if (filters.tipoLente !== 'todos' && lente.tipoLente?.toLowerCase() !== filters.tipoLente.toLowerCase()) {
      return false;
    }

    if (filters.enPromocion === 'con_promocion' && !lente.enPromocion) {
      return false;
    }
    if (filters.enPromocion === 'sin_promocion' && lente.enPromocion) {
      return false;
    }

    const stockTotal = getTotalStock(lente);
    if (filters.stock === 'con_stock' && stockTotal <= 0) {
      return false;
    }
    if (filters.stock === 'sin_stock' && stockTotal > 0) {
      return false;
    }

    if (filters.material !== 'todos' && lente.material?.toLowerCase() !== filters.material.toLowerCase()) {
      return false;
    }

    if (filters.color !== 'todos' && lente.color?.toLowerCase() !== filters.color.toLowerCase()) {
      return false;
    }

    const precio = lente.enPromocion ? lente.precioActual : lente.precioBase;
    if (filters.precioMin && parseFloat(precio || 0) < parseFloat(filters.precioMin)) {
      return false;
    }
    if (filters.precioMax && parseFloat(precio || 0) > parseFloat(filters.precioMax)) {
      return false;
    }

    if (filters.fechaDesde) {
      const fechaDesde = new Date(filters.fechaDesde);
      if (new Date(lente.fechaCreacion || new Date(0)) < fechaDesde) {
        return false;
      }
    }
    if (filters.fechaHasta) {
      const fechaHasta = new Date(filters.fechaHasta);
      fechaHasta.setHours(23, 59, 59);
      if (new Date(lente.fechaCreacion || new Date(0)) > fechaHasta) {
        return false;
      }
    }

    return true;
  }, [filters, getTotalStock]);

  // Fetch de datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const baseNow = getBase();
      const doFetch = (base) => Promise.all([
        axios.get(withBase('/lentes', base)),
        axios.get(withBase('/categoria', base)),
        axios.get(withBase('/marcas', base)),
        axios.get(withBase('/promociones', base)),
        axios.get(withBase('/sucursales', base)),
      ]);
      
      let res;
      try {
        res = await doFetch(baseNow);
      } catch (err) {
        if ((err?.message?.includes('ERR_CONNECTION_REFUSED') || err?.code === 'ERR_NETWORK') && baseNow.includes('localhost')) {
          res = await doFetch(PROD_FALLBACK);
          API_CONFIG.BASE_URL = PROD_FALLBACK;
        } else {
          throw err;
        }
      }
      
      const [lentesRes, categoriasRes, marcasRes, promocionesRes, sucursalesRes] = res;
      setLentes(Array.isArray(lentesRes.data) ? lentesRes.data : lentesRes.data?.data || []);
      setCategorias(Array.isArray(categoriasRes.data) ? categoriasRes.data : categoriasRes.data?.data || []);
      setMarcas(Array.isArray(marcasRes.data) ? marcasRes.data : marcasRes.data?.data || []);
      setPromociones(Array.isArray(promocionesRes.data) ? promocionesRes.data : promocionesRes.data?.data || []);
      setSucursales(Array.isArray(sucursalesRes.data) ? sucursalesRes.data : sucursalesRes.data?.data || []);
      
      showAlert('success', 'Datos cargados exitosamente');
      
    } catch (error) {
      console.error("Error fetching data:", error);
      showAlert('error', 'Error al cargar los datos: ' + (error.response?.data?.message || error.message));
      setLentes([]);
      setCategorias([]);
      setMarcas([]);
      setPromociones([]);
      setSucursales([]);
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Lógica de filtrado, ordenamiento y paginación
  const filteredAndSortedLentes = useMemo(() => {
    let currentLentes = Array.isArray(lentes) ? lentes : [];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      currentLentes = currentLentes.filter(
        (lente) =>
          lente.nombre?.toLowerCase().includes(searchLower) ||
          lente.descripcion?.toLowerCase().includes(searchLower) ||
          lente.material?.toLowerCase().includes(searchLower) ||
          lente.color?.toLowerCase().includes(searchLower) ||
          lente.marcaId?.nombre?.toLowerCase().includes(searchLower) ||
          lente.categoriaId?.nombre?.toLowerCase().includes(searchLower)
      );
    }

    currentLentes = currentLentes.filter(applyAdvancedFilters);
    return sortData(currentLentes);
  }, [lentes, searchTerm, applyAdvancedFilters, sortData]);
  
  const { paginatedData: currentLentes, ...paginationProps } = usePagination(filteredAndSortedLentes, ITEMS_PER_PAGE);

  // Funciones para manejar filtros
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setSearchTerm('');
    showAlert('info', 'Todos los filtros han sido limpiados');
  }, [showAlert]);

  const hasActiveFilters = useCallback(() => {
    return searchTerm || 
           filters.categoria !== 'todas' || 
           filters.marca !== 'todas' || 
           filters.tipoLente !== 'todos' ||
           filters.enPromocion !== 'todos' || 
           filters.stock !== 'todos' || 
           filters.material !== 'todos' || 
           filters.color !== 'todos' || 
           filters.precioMin || 
           filters.precioMax || 
           filters.fechaDesde || 
           filters.fechaHasta;
  }, [searchTerm, filters]);

  // Obtener opciones únicas
  const uniqueMateriales = useMemo(() => {
    const materiales = lentes
      .map(l => l.material)
      .filter(Boolean)
      .filter((material, index, arr) => arr.indexOf(material) === index);
    return materiales.sort();
  }, [lentes]);

  const uniqueColores = useMemo(() => {
    const colores = lentes
      .map(l => l.color)
      .filter(Boolean)
      .filter((color, index, arr) => arr.indexOf(color) === index);
    return colores.sort();
  }, [lentes]);

  const uniqueTiposLente = useMemo(() => {
    const tipos = lentes
      .map(l => l.tipoLente)
      .filter(Boolean)
      .filter((tipo, index, arr) => arr.indexOf(tipo) === index);
    return tipos.sort();
  }, [lentes]);

  // Funciones de manejo de modales
  const handleCloseModals = useCallback(() => {
    setShowAddEditModal(false);
    setShowDetailModal(false);
    setShowDeleteModal(false);
    setSelectedLente(null);
    resetForm();
  }, [resetForm]);

  const handleOpenAddModal = useCallback(() => {
    resetForm();
    setSelectedLente(null);
    setFormData(initialFormData);
    setShowAddEditModal(true);
  }, [resetForm, setFormData]);

  const handleOpenEditModal = useCallback((lente) => {
    setSelectedLente(lente);
    
    const normalizeImages = (images) => {
      if (!images || !Array.isArray(images)) return [];
      
      return images.map(img => {
        if (typeof img === 'string') {
          return img;
        }
        
        if (typeof img === 'object' && img !== null) {
          return img.secure_url || img.url || '';
        }
        
        return '';
      }).filter(url => url && url.length > 0);
    };

    const normalizeSucursales = (sucursales) => {
      if (!sucursales || !Array.isArray(sucursales)) return [];
      
      return sucursales.map(s => ({
        sucursalId: s.sucursalId?._id || s.sucursalId || '',
        nombreSucursal: s.nombreSucursal || s.sucursalId?.nombre || '',
        stock: parseInt(s.stock) || 0
      }));
    };

    const editData = {
      nombre: lente.nombre || '',
      descripcion: lente.descripcion || '',
      categoriaId: lente.categoriaId?._id || lente.categoriaId || '',
      marcaId: lente.marcaId?._id || lente.marcaId || '',
      material: lente.material || '',
      color: lente.color || '',
      tipoLente: lente.tipoLente || '',
      precioBase: parseFloat(lente.precioBase) || 0,
      precioActual: parseFloat(lente.precioActual || lente.precioBase) || 0,
      linea: lente.linea || '',
      medidas: {
        anchoPuente: lente.medidas?.anchoPuente || '',
        altura: lente.medidas?.altura || '',
        ancho: lente.medidas?.ancho || '',
      },
      imagenes: normalizeImages(lente.imagenes),
      enPromocion: Boolean(lente.enPromocion),
      promocionId: lente.promocionId?._id || lente.promocionId || '',
      fechaCreacion: lente.fechaCreacion ? new Date(lente.fechaCreacion).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      sucursales: normalizeSucursales(lente.sucursales)
    };
    
    setFormData(editData);
    setShowAddEditModal(true);
  }, [setFormData]);
  
  const handleOpenDetailModal = useCallback((lente) => {
    setSelectedLente(lente);
    setShowDetailModal(true);
  }, []);

  const handleOpenDeleteModal = useCallback((lente) => {
    setSelectedLente(lente);
    setShowDeleteModal(true);
  }, []);

  // Función de envío del formulario
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 INICIANDO SUBMIT DEL FORMULARIO');
    console.log('Form data:', formData);
    console.log('Modo:', selectedLente ? '📝 EDICIÓN' : '➕ CREACIÓN');
    
    if (!validateForm()) {
      console.error('❌ Validación FALLIDA. Errores:', errors);
      showAlert('error', 'Por favor, corrige los errores del formulario.');
      return;
    }
    console.log('✅ Validación exitosa');

    try {
      const baseNow = getBase();
      let response;
      
      if (selectedLente) {
        console.log('🔄 MODO ACTUALIZACIÓN (PUT FormData)');
        
        if (!formData.sucursales || !Array.isArray(formData.sucursales)) {
          console.error('❌ ERROR: formData.sucursales no es un array válido:', formData.sucursales);
          showAlert('error', 'Error: Debe seleccionar al menos una sucursal');
          return;
        }
        
        const dataToSend = new FormData();
        
        dataToSend.append('nombre', formData.nombre);
        dataToSend.append('descripcion', formData.descripcion);
        dataToSend.append('categoriaId', formData.categoriaId);
        dataToSend.append('marcaId', formData.marcaId);
        dataToSend.append('material', formData.material);
        dataToSend.append('color', formData.color);
        dataToSend.append('tipoLente', formData.tipoLente);
        dataToSend.append('precioBase', Number(formData.precioBase));
        dataToSend.append('precioActual', formData.enPromocion ? Number(formData.precioActual) : Number(formData.precioBase));
        dataToSend.append('linea', formData.linea);
        dataToSend.append('fechaCreacion', formData.fechaCreacion);
        dataToSend.append('enPromocion', formData.enPromocion);
        
        if (formData.enPromocion && formData.promocionId) {
          dataToSend.append('promocionId', formData.promocionId);
        }
        
        const medidasJSON = JSON.stringify({
          anchoPuente: Number(formData.medidas.anchoPuente),
          altura: Number(formData.medidas.altura),
          ancho: Number(formData.medidas.ancho)
        });
        dataToSend.append('medidas', medidasJSON);
        
        const imagenesJSON = JSON.stringify(formData.imagenes || []);
        dataToSend.append('imagenes', imagenesJSON);
        
        const sucursalesData = formData.sucursales.map(s => ({
          sucursalId: s.sucursalId,
          nombreSucursal: s.nombreSucursal || '',
          stock: Number(s.stock) || 0
        }));
        const sucursalesJSON = JSON.stringify(sucursalesData);
        dataToSend.append('sucursales', sucursalesJSON);

        console.log('🌐 URL de actualización:', withBase(`/lentes/${selectedLente._id}`, baseNow));
        console.log('📡 Enviando PUT request con FormData...');
        
        response = await axios.put(
          withBase(`/lentes/${selectedLente._id}`, baseNow), 
          dataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log('✅ PUT exitoso!');
        showAlert('success', 'Lente actualizado exitosamente');
        
      } else {
        console.log('🆕 MODO CREACIÓN (POST con FormData)');
        
        const dataToSend = new FormData();
        
        dataToSend.append('nombre', formData.nombre);
        dataToSend.append('descripcion', formData.descripcion);
        dataToSend.append('categoriaId', formData.categoriaId);
        dataToSend.append('marcaId', formData.marcaId);
        dataToSend.append('material', formData.material);
        dataToSend.append('color', formData.color);
        dataToSend.append('tipoLente', formData.tipoLente);
        dataToSend.append('precioBase', Number(formData.precioBase));
        dataToSend.append('precioActual', formData.enPromocion ? Number(formData.precioActual) : Number(formData.precioBase));
        dataToSend.append('linea', formData.linea);
        dataToSend.append('fechaCreacion', formData.fechaCreacion);
        dataToSend.append('enPromocion', formData.enPromocion);
        
        if (formData.enPromocion && formData.promocionId) {
          dataToSend.append('promocionId', formData.promocionId);
        }
        
        const medidasJSON = JSON.stringify({
          anchoPuente: Number(formData.medidas.anchoPuente),
          altura: Number(formData.medidas.altura),
          ancho: Number(formData.medidas.ancho)
        });
        dataToSend.append('medidas', medidasJSON);
        
        const imagenesJSON = JSON.stringify(formData.imagenes || []);
        dataToSend.append('imagenes', imagenesJSON);
        
        const sucursalesData = (formData.sucursales || []).map(s => ({
          sucursalId: s.sucursalId,
          nombreSucursal: s.nombreSucursal,
          stock: Number(s.stock) || 0
        }));
        const sucursalesJSON = JSON.stringify(sucursalesData);
        dataToSend.append('sucursales', sucursalesJSON);

        console.log('🌐 URL de creación:', withBase('/lentes', baseNow));
        console.log('📡 Enviando POST request...');
        
        response = await axios.post(
          withBase('/lentes', baseNow), 
          dataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log('✅ POST exitoso!');
        showAlert('success', 'Lente creado exitosamente');
      }
      
      console.log('✅ RESPUESTA DEL SERVIDOR:', response.data);
      console.log('🔄 Recargando datos...');
      await fetchData();
      console.log('✅ Datos recargados');
      console.log('🚪 Cerrando modales...');
      handleCloseModals();
      console.log('✅ SUBMIT COMPLETADO EXITOSAMENTE\n');
      
    } catch (error) {
      console.log('❌ ERROR EN EL SUBMIT');
      console.error('🔥 Error completo:', error);
      console.error('📛 Error name:', error.name);
      console.error('📛 Error message:', error.message);
      
      if (error.response) {
        console.error('📡 RESPUESTA DEL SERVIDOR (error.response):');
        console.error('  Status:', error.response.status);
        console.error('  Data:', error.response.data);
      } else if (error.request) {
        console.error('📡 REQUEST ENVIADO (error.request):');
        console.error('  No se recibió respuesta del servidor');
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      showAlert('error', `Error al guardar el lente: ${errorMessage}`);
    }
  };

  // Función de eliminación
  const handleDelete = async () => {
    if (!selectedLente) return;
    
    try {
      await axios.delete(withBase(`/lentes/${selectedLente._id}`, getBase()));
      showAlert('delete', 'Lente eliminado exitosamente');
      await fetchData();
      handleCloseModals();
    } catch (error) {
      console.error("Error deleting lente:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      showAlert('error', `Error al eliminar el lente: ${errorMessage}`);
    }
  };

  // Calcular estadísticas
  const lentesArr = Array.isArray(lentes) ? lentes : [];
  const totalLentes = lentesArr.length;
  const lentesEnPromocion = lentesArr.filter(l => l.enPromocion).length;
  const stockTotal = lentesArr.reduce((total, lente) => {
    return total + getTotalStock(lente);
  }, 0);
  const valorInventario = lentesArr.reduce((sum, l) => sum + ((l.precioActual || l.precioBase || 0) * getTotalStock(l)), 0);

  const stats = [
    { 
      title: "Total de Lentes", 
      value: totalLentes, 
      Icon: Glasses,
      color: "cyan" 
    },
    { 
      title: "En Promoción", 
      value: lentesEnPromocion, 
      Icon: Tag,
      color: "green" 
    },
    { 
      title: "Stock Total", 
      value: stockTotal, 
      Icon: Package,
      color: "blue" 
    },
    { 
      title: "Valor Inventario", 
      value: `$${valorInventario.toLocaleString()}`, 
      Icon: DollarSign,
      color: "purple" 
    }
  ];

  // Renderizado de filas de la tabla
  const renderTableRows = () => {
    return currentLentes.map((lente) => {
      const categoria = categorias.find(c => c._id === lente.categoriaId?._id || c._id === lente.categoriaId);
      const marca = marcas.find(m => m._id === lente.marcaId?._id || m._id === lente.marcaId);
      const promocion = promociones.find(p => p._id === lente.promocionId?._id || p._id === lente.promocionId);
      const totalStock = getTotalStock(lente);
      const precioActual = lente.enPromocion ? lente.precioActual : lente.precioBase;

      return (
        <tr key={lente._id} className="hover:bg-gray-50 transition-colors">
          {/* Columna Producto */}
          <td className="px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
                <Glasses className="w-6 h-6 text-cyan-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {lente.nombre || 'Sin nombre'}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {lente.linea || 'Sin línea'}
                </div>
              </div>
            </div>
          </td>

          {/* Columna Marca/Categoría */}
          <td className="px-6 py-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {marca?.nombre || 'Sin marca'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {categoria?.nombre || 'Sin categoría'}
                </span>
              </div>
            </div>
          </td>

          {/* Columna Características */}
          <td className="px-6 py-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Palette className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {lente.material || 'N/A'} - {lente.color || 'N/A'}
                </span>
              </div>
              <div className="text-xs">
                <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${
                  lente.tipoLente === 'sol' 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {lente.tipoLente === 'sol' ? '🌞 Sol' : '👓 Graduación'}
                </span>
              </div>
              {lente.enPromocion && (
                <div className="text-xs">
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                    <Tag className="w-3 h-3 mr-1" />
                    {promocion?.nombre || 'Promoción'}
                  </span>
                </div>
              )}
            </div>
          </td>

          {/* Columna Precio */}
          <td className="px-6 py-4">
            <div className="flex flex-col space-y-1">
              <div className="text-sm font-semibold text-gray-900">
                ${precioActual?.toLocaleString() || '0'}
              </div>
              {lente.enPromocion && (
                <div className="text-xs text-gray-500 line-through">
                  ${lente.precioBase?.toLocaleString() || '0'}
                </div>
              )}
            </div>
          </td>

          {/* Columna Stock */}
          <td className="px-6 py-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                totalStock > 10 ? 'bg-green-500' : 
                totalStock > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                totalStock > 10 ? 'text-green-700' : 
                totalStock > 0 ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {totalStock} unidades
              </span>
            </div>
          </td>

          {/* Columna Estado */}
          <td className="px-6 py-4">
            <div className="space-y-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                lente.activo !== false 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {lente.activo !== false ? 'Activo' : 'Inactivo'}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                totalStock > 0 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {totalStock > 0 ? 'Disponible' : 'Sin Stock'}
              </span>
            </div>
          </td>

          {/* Columna Acciones */}
          <td className="px-6 py-4">
            <div className="flex space-x-2">
              <button
                onClick={() => handleOpenDetailModal(lente)}
                className="inline-flex items-center p-2 text-sm font-medium text-cyan-600 bg-cyan-50 rounded-lg border border-cyan-200 hover:bg-cyan-100 hover:text-cyan-700 transition-colors"
                title="Ver detalles"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleOpenEditModal(lente)}
                className="inline-flex items-center p-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleOpenDeleteModal(lente)}
                className="inline-flex items-center p-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 hover:text-red-700 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      );
    });
  };

  // Renderizado del componente
  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SISTEMA DE NOTIFICACIONES */}
      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={hideAlert}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <PageHeader
          title="Gestión de Lentes"
          subtitle="Administra el catálogo completo de lentes"
          Icon={Glasses}
          buttonText="Agregar Lente"
          onButtonClick={handleOpenAddModal}
          buttonIcon={Plus}
        />

        {/* Estadísticas */}
        <StatsGrid stats={stats} />

        {/* Panel de Filtros y Búsqueda */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-cyan-500 to-cyan-600">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Catálogo de Lentes
              </h2>
              <div className="flex items-center space-x-3">
                {/* Botón de Ordenamiento */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <SortAsc className="w-4 h-4" />
                    <span>Ordenar</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showSortDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-2">
                        {SORT_OPTIONS.map((option) => {
                          const Icon = option.icon;
                          const isSelected = sortBy === option.value.split('-')[0] && sortOrder === option.value.split('-')[1];
                          
                          return (
                            <button
                              key={option.value}
                              onClick={() => handleSortChange(option.value)}
                              className={`flex items-center space-x-3 w-full px-3 py-2 text-sm rounded-md transition-colors ${
                                isSelected 
                                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' 
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{option.label}</span>
                              {isSelected && <CheckCircle className="w-4 h-4 ml-auto text-cyan-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón de Filtros */}
                <button
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    hasActiveFilters() 
                      ? 'bg-orange-500 text-white hover:bg-orange-600' 
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtros</span>
                  {hasActiveFilters() && (
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Búsqueda y Filtros Rápidos */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Búsqueda */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar lentes por nombre, descripción, material..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {/* Filtros Rápidos */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={filters.categoria}
                  onChange={(e) => handleFilterChange('categoria', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                >
                  <option value="todas">Todas las categorías</option>
                  {categorias.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.marca}
                  onChange={(e) => handleFilterChange('marca', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                >
                  <option value="todas">Todas las marcas</option>
                  {marcas.map((marca) => (
                    <option key={marca._id} value={marca._id}>
                      {marca.nombre}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.tipoLente}
                  onChange={(e) => handleFilterChange('tipoLente', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="sol">Sol</option>
                  <option value="graduacion">Graduación</option>
                </select>
              </div>
            </div>

            {/* Información de resultados */}
            <div className="mt-3 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Mostrando {currentLentes.length} de {filteredAndSortedLentes.length} lentes
                {hasActiveFilters() && (
                  <span className="text-cyan-600 ml-2">
                    (filtros aplicados)
                  </span>
                )}
              </div>
              
              {hasActiveFilters() && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Limpiar filtros</span>
                </button>
              )}
            </div>
          </div>

          {/* Panel de Filtros Avanzados */}
          {showFiltersPanel && (
            <div className="px-6 py-4 border-b bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Material */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material
                  </label>
                  <select
                    value={filters.material}
                    onChange={(e) => handleFilterChange('material', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                  >
                    <option value="todos">Todos los materiales</option>
                    {uniqueMateriales.map((material) => (
                      <option key={material} value={material}>
                        {material}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <select
                    value={filters.color}
                    onChange={(e) => handleFilterChange('color', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                  >
                    <option value="todos">Todos los colores</option>
                    {uniqueColores.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Promoción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Promoción
                  </label>
                  <select
                    value={filters.enPromocion}
                    onChange={(e) => handleFilterChange('enPromocion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                  >
                    <option value="todos">Todos</option>
                    <option value="con_promocion">Con promoción</option>
                    <option value="sin_promocion">Sin promoción</option>
                  </select>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <select
                    value={filters.stock}
                    onChange={(e) => handleFilterChange('stock', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                  >
                    <option value="todos">Todos</option>
                    <option value="con_stock">Con stock</option>
                    <option value="sin_stock">Sin stock</option>
                  </select>
                </div>

                {/* Rango de Precios */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rango de Precio
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Mínimo"
                      value={filters.precioMin}
                      onChange={(e) => handleFilterChange('precioMin', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Máximo"
                      value={filters.precioMax}
                      onChange={(e) => handleFilterChange('precioMax', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                    />
                  </div>
                </div>

                {/* Rango de Fechas */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rango de Fecha de Creación
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={filters.fechaDesde}
                      onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                    />
                    <input
                      type="date"
                      value={filters.fechaHasta}
                      onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de Lentes */}
        <DataTable
          columns={TABLE_COLUMNS}
          data={currentLentes}
          renderRows={renderTableRows}
          emptyMessage="No se encontraron lentes que coincidan con los criterios de búsqueda."
        />

        {/* Paginación */}
        <Pagination
          currentPage={paginationProps.currentPage}
          totalPages={paginationProps.totalPages}
          onPageChange={paginationProps.goToPage}
          onPrevious={paginationProps.previousPage}
          onNext={paginationProps.nextPage}
          hasPrevious={paginationProps.hasPrevious}
          hasNext={paginationProps.hasNext}
          totalItems={filteredAndSortedLentes.length}
          itemsPerPage={ITEMS_PER_PAGE}
          showingStart={paginationProps.showingStart}
          showingEnd={paginationProps.showingEnd}
        />
      </div>

      {/* Modales */}
      {showAddEditModal && (
        <LentesFormModal
          isOpen={showAddEditModal}
          onClose={handleCloseModals}
          onSubmit={handleFormSubmit}
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
          categorias={categorias}
          marcas={marcas}
          promociones={promociones}
          sucursales={sucursales}
          isEditing={!!selectedLente}
          selectedLente={selectedLente}
        />
      )}

      {showDetailModal && selectedLente && (
        <DetailModal
          isOpen={showDetailModal}
          onClose={handleCloseModals}
          title="Detalles del Lente"
          data={selectedLente}
          type="lente"
          categorias={categorias}
          marcas={marcas}
          promociones={promociones}
          sucursales={sucursales}
        />
      )}

      {showDeleteModal && selectedLente && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleCloseModals}
          onConfirm={handleDelete}
          title="Eliminar Lente"
          message={`¿Estás seguro de que deseas eliminar el lente "${selectedLente.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="delete"
        />
      )}
    </div>
  );
};

export default LentesContent;