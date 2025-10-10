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
  Building2, Palette, Layers, Filter, X, ChevronDown, SortAsc, SortDesc, CheckCircle,
  RefreshCcw
} from 'lucide-react';

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

// Helpers para usar BASE_URL dinámico + fallback per-request
const getBase = () => API_CONFIG.BASE_URL;
const PROD_FALLBACK = 'https://aurora-production-7e57.up.railway.app/api';
const withBase = (path, base = getBase()) => `${base}${path}`;

// --- COMPONENTE SKELETON LOADER MEMOIZADO ---
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
  // --- ESTADOS PRINCIPALES ---
  const [lentes, setLentes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLente, setSelectedLente] = useState(null);
  const [alert, setAlert] = useState(null);

  // --- ESTADOS DE MODALES ---
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --- ESTADOS DE FILTROS Y ORDENAMIENTO ---
  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('fechaCreacion');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // --- DATOS INICIALES DEL FORMULARIO ---
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
    medidas: {
      anchoPuente: '',
      altura: '',
      ancho: ''
    },
    imagenes: [],
    enPromocion: false,
    promocionId: '',
    fechaCreacion: new Date().toISOString().split('T')[0],
    sucursales: [],
  };

  // --- HOOK DE FORMULARIO CON VALIDACIÓN ---
  const { formData, setFormData, handleInputChange, resetForm, validateForm, errors, setErrors } = useForm(
    initialFormData,
    (data) => {
      const newErrors = {};
      
      // Validaciones básicas
      if (!data.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
      if (!data.descripcion?.trim()) newErrors.descripcion = 'La descripción es requerida';
      if (!data.categoriaId) newErrors.categoriaId = 'La categoría es requerida';
      if (!data.marcaId) newErrors.marcaId = 'La marca es requerida';
      if (!data.material?.trim()) newErrors.material = 'El material es requerido';
      if (!data.color?.trim()) newErrors.color = 'El color es requerido';
      if (!data.tipoLente?.trim()) newErrors.tipoLente = 'El tipo de lente es requerido';
      if (!data.linea?.trim()) newErrors.linea = 'La línea es requerida';

      // Validaciones de precios
      if (!data.precioBase || data.precioBase <= 0) {
        newErrors.precioBase = 'El precio base debe ser mayor a 0';
      }

      if (data.enPromocion) {
        if (!data.promocionId) {
          newErrors.promocionId = 'Debe seleccionar una promoción';
        }
        
        if (!data.precioActual || data.precioActual <= 0) {
          newErrors.precioActual = 'El precio promocional debe ser mayor a 0';
        } else if (data.precioActual >= data.precioBase) {
          newErrors.precioActual = 'El precio promocional debe ser menor al precio base';
        }
      }

      // Validación de Medidas
      if (data.medidas) {
        if (!data.medidas.anchoPuente || data.medidas.anchoPuente <= 0) 
          newErrors['medidas.anchoPuente'] = 'Ancho de puente inválido';
        if (!data.medidas.altura || data.medidas.altura <= 0) 
          newErrors['medidas.altura'] = 'Altura inválida';
        if (!data.medidas.ancho || data.medidas.ancho <= 0) 
          newErrors['medidas.ancho'] = 'Ancho inválido';
      }

      // Validación de Imágenes
      if (!data.imagenes || data.imagenes.length === 0) {
        newErrors.imagenes = 'Se requiere al menos una imagen';
      }

      // Validación de Stock por Sucursal
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

  // --- FUNCIONES UTILITARIAS ---
  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
    const timer = setTimeout(() => setAlert(null), 5000);
    return () => clearTimeout(timer);
  }, []);

  const getTotalStock = useCallback((lente) => {
    return lente.sucursales ? lente.sucursales.reduce((sum, s) => sum + (s.stock || 0), 0) : 0;
  }, []);

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

  // --- FUNCIÓN PARA APLICAR FILTROS AVANZADOS ---
  const applyAdvancedFilters = useCallback((lente) => {
    // Filtro por categoría
    if (filters.categoria !== 'todas' && lente.categoriaId?._id !== filters.categoria) {
      return false;
    }

    // Filtro por marca
    if (filters.marca !== 'todas' && lente.marcaId?._id !== filters.marca) {
      return false;
    }

    // Filtro por tipo de lente
    if (filters.tipoLente !== 'todos' && lente.tipoLente?.toLowerCase() !== filters.tipoLente.toLowerCase()) {
      return false;
    }

    // Filtro por promoción
    if (filters.enPromocion === 'con_promocion' && !lente.enPromocion) {
      return false;
    }
    if (filters.enPromocion === 'sin_promocion' && lente.enPromocion) {
      return false;
    }

    // Filtro por stock
    const stockTotal = getTotalStock(lente);
    if (filters.stock === 'con_stock' && stockTotal <= 0) {
      return false;
    }
    if (filters.stock === 'sin_stock' && stockTotal > 0) {
      return false;
    }

    // Filtro por material
    if (filters.material !== 'todos' && lente.material?.toLowerCase() !== filters.material.toLowerCase()) {
      return false;
    }

    // Filtro por color
    if (filters.color !== 'todos' && lente.color?.toLowerCase() !== filters.color.toLowerCase()) {
      return false;
    }

    // Filtro por precio
    const precio = lente.enPromocion ? lente.precioActual : lente.precioBase;
    if (filters.precioMin && parseFloat(precio || 0) < parseFloat(filters.precioMin)) {
      return false;
    }
    if (filters.precioMax && parseFloat(precio || 0) > parseFloat(filters.precioMax)) {
      return false;
    }

    // Filtro por fecha de creación
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

  // --- FETCH DE DATOS ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const baseNow = getBase();
      const doFetch = async (base) => Promise.all([
        axios.get(withBase('/lentes', base)),
        axios.get(withBase('/categoria', base)),
        axios.get(withBase('/marcas', base)),
        axios.get(withBase('/promociones', base)),
        axios.get(withBase('/sucursales', base)),
      ]);
      
      let lentesRes, categoriasRes, marcasRes, promocionesRes, sucursalesRes;
      try {
        [lentesRes, categoriasRes, marcasRes, promocionesRes, sucursalesRes] = await doFetch(baseNow);
      } catch (err) {
        const isConnRefused = err?.message?.includes('ERR_CONNECTION_REFUSED') || err?.code === 'ERR_NETWORK';
        const isLocal = baseNow.includes('localhost');
        if (isConnRefused && isLocal) {
          [lentesRes, categoriasRes, marcasRes, promocionesRes, sucursalesRes] = await doFetch(PROD_FALLBACK);
          API_CONFIG.BASE_URL = PROD_FALLBACK;
        } else {
          throw err;
        }
      }
      
      const lentesData = Array.isArray(lentesRes.data)
        ? lentesRes.data
        : (Array.isArray(lentesRes.data?.data) ? lentesRes.data.data : []);
      
      setLentes(lentesData);
      setCategorias(categoriasRes.data);
      setMarcas(marcasRes.data);
      setPromociones(promocionesRes.data);
      setSucursales(sucursalesRes.data);
      
    } catch (error) {
      showAlert('error', 'Error al cargar los datos: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- LÓGICA DE FILTRADO, ORDENAMIENTO Y PAGINACIÓN ---
  const filteredAndSortedLentes = useMemo(() => {
    let currentLentes = Array.isArray(lentes) ? lentes : [];

    // Filtro por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      currentLentes = currentLentes.filter(
        (lente) =>
          lente.nombre?.toLowerCase().includes(searchLower) ||
          lente.descripcion?.toLowerCase().includes(searchLower) ||
          lente.material?.toLowerCase().includes(searchLower) ||
          lente.color?.toLowerCase().includes(searchLower) ||
          lente.tipoLente?.toLowerCase().includes(searchLower) ||
          lente.linea?.toLowerCase().includes(searchLower) ||
          lente.categoriaId?.nombre?.toLowerCase().includes(searchLower) ||
          lente.marcaId?.nombre?.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar filtros avanzados
    currentLentes = currentLentes.filter(applyAdvancedFilters);

    return sortData(currentLentes);
  }, [lentes, searchTerm, applyAdvancedFilters, sortData]);

  const { paginatedData: currentLentes, ...paginationProps } = usePagination(filteredAndSortedLentes, ITEMS_PER_PAGE);

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

  // --- OBTENER OPCIONES ÚNICAS ---
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

  // --- FUNCIONES DE MODAL ---
  const handleCloseModals = useCallback(() => {
    setShowAddEditModal(false);
    setShowDetailModal(false);
    setShowDeleteModal(false);
    setSelectedLente(null);
    resetForm();
    setErrors({});
  }, [resetForm, setErrors]);

  const handleOpenAddModal = useCallback(() => {
    resetForm();
    setSelectedLente(null);
    setFormData(initialFormData);
    setShowAddEditModal(true);
  }, [resetForm, setFormData]);

  const handleOpenEditModal = useCallback((lente) => {
    setSelectedLente(lente);
    
    // Normalizar imágenes
    const normalizeImages = (images) => {
      if (!images || !Array.isArray(images)) return [];
      return images.map(img => {
        if (typeof img === 'string') {
          return img.startsWith('http') ? img : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${img}`;
        }
        if (typeof img === 'object' && img !== null) {
          return img.secure_url || img.url || (img.public_id ? `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${img.public_id}` : '');
        }
        return '';
      }).filter(url => url && url.length > 0);
    };

    // Normalizar sucursales
    const normalizeSucursales = (sucursales) => {
      if (!sucursales || !Array.isArray(sucursales)) return [];
      return sucursales.map(s => ({
        sucursalId: s.sucursalId?._id || s.sucursalId || s._id || '',
        nombreSucursal: s.nombreSucursal || s.sucursalId?.nombre || s.nombre || '',
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
      fechaCreacion: lente.fechaCreacion ? new Date(lente.fechaCreacion).toISOString().split('T')[0] : '',
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

  // --- FUNCIÓN DE ENVÍO DEL FORMULARIO ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('error', 'Por favor, corrige los errores del formulario.');
      return;
    }

    try {
      const medidas = formData.medidas || {};
      let dataToSend = {
        nombre: formData.nombre?.trim(),
        descripcion: formData.descripcion?.trim(),
        categoriaId: formData.categoriaId,
        marcaId: formData.marcaId,
        material: formData.material?.trim(),
        color: formData.color?.trim(),
        tipoLente: formData.tipoLente?.trim(),
        precioBase: Number(formData.precioBase),
        precioActual: formData.enPromocion ? Number(formData.precioActual) : Number(formData.precioBase),
        linea: formData.linea?.trim(),
        medidas: {
          anchoPuente: Number(medidas.anchoPuente),
          altura: Number(medidas.altura),
          ancho: Number(medidas.ancho),
        },
        imagenes: Array.isArray(formData.imagenes) ? formData.imagenes : [],
        enPromocion: !!formData.enPromocion,
        promocionId: formData.enPromocion ? formData.promocionId : undefined,
        fechaCreacion: formData.fechaCreacion,
        sucursales: Array.isArray(formData.sucursales) ? formData.sucursales
          .map(s => ({
            sucursalId: typeof s.sucursalId === 'object' && s.sucursalId?._id ? s.sucursalId._id : s.sucursalId,
            nombreSucursal: s.nombreSucursal || (sucursales.find(x => x._id === (typeof s.sucursalId === 'object' ? s.sucursalId?._id : s.sucursalId))?.nombre) || '',
            stock: Number(s.stock ?? 0),
          }))
          .filter(s => typeof s.sucursalId === 'string' && /^[a-fA-F0-9]{24}$/.test(s.sucursalId))
          : [],
      };

      const baseNow = getBase();
      const safeRequest = async (fn) => {
        try {
          return await fn(baseNow);
        } catch (err) {
          const isConnRefused = err?.message?.includes('ERR_CONNECTION_REFUSED') || err?.code === 'ERR_NETWORK';
          const isLocal = baseNow.includes('localhost');
          if (isConnRefused && isLocal) {
            API_CONFIG.BASE_URL = PROD_FALLBACK;
            return await fn(PROD_FALLBACK);
          }
          throw err;
        }
      };

      if (selectedLente) {
        await safeRequest((base) => axios.put(withBase(`/lentes/${selectedLente._id}`, base), dataToSend));
        showAlert('success', 'Lente actualizado exitosamente');
      } else {
        await safeRequest((base) => axios.post(withBase('/lentes', base), dataToSend));
        showAlert('success', 'Lente creado exitosamente');
      }
      
      fetchData();
      handleCloseModals();
    } catch (error) {
      showAlert('error', 'Error al guardar el lente: ' + (error.response?.data?.message || error.message));
      console.error('Error saving lente:', error.response?.data || error.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedLente) return;
    
    try {
      const baseNow = getBase();
      const safeRequest = async (base) => {
        try {
          return await axios.delete(withBase(`/lentes/${selectedLente._id}`, base));
        } catch (err) {
          const isConnRefused = err?.message?.includes('ERR_CONNECTION_REFUSED') || err?.code === 'ERR_NETWORK';
          const isLocal = baseNow.includes('localhost');
          if (isConnRefused && isLocal) {
            API_CONFIG.BASE_URL = PROD_FALLBACK;
            return await axios.delete(withBase(`/lentes/${selectedLente._id}`, PROD_FALLBACK));
          }
          throw err;
        }
      };

      await safeRequest(baseNow);
      showAlert('success', 'Lente eliminado exitosamente');
      fetchData();
      handleCloseModals();
    } catch (error) {
      showAlert('error', 'Error al eliminar el lente: ' + (error.response?.data?.message || error.message));
    }
  };

  // --- ESTADÍSTICAS ---
  const lentesArr = Array.isArray(lentes) ? lentes : [];
  const totalLentes = lentesArr.length;
  const lentesEnPromocion = lentesArr.filter(l => l.enPromocion).length;
  const stockTotal = lentesArr.reduce((sum, l) => sum + getTotalStock(l), 0);
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
      Icon: TrendingUp,
      color: "cyan" 
    },
    { 
      title: "Stock Total", 
      value: stockTotal, 
      Icon: Package,
      color: "cyan" 
    },
    { 
      title: "Valor Inventario", 
      value: valorInventario.toLocaleString('es-SV', { style: 'currency', currency: 'USD' }), 
      Icon: DollarSign,
      color: "cyan" 
    },
  ];

  // --- FUNCIÓN PARA RENDERIZAR FILAS ---
  const renderRow = useCallback((lente) => {
    const stockTotal = getTotalStock(lente);
    const tieneStock = stockTotal > 0;
    
    return (
      <>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12">
              {lente.imagenes && lente.imagenes.length > 0 ? (
                <img 
                  src={lente.imagenes[0]} 
                  alt={lente.nombre}
                  className="w-12 h-12 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Glasses className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {lente.nombre}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {lente.descripcion}
              </p>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-900 truncate">
                {lente.marcaId?.nombre || 'Sin marca'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-500 truncate">
                {lente.categoriaId?.nombre || 'Sin categoría'}
              </span>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-900">{lente.color}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-500">{lente.material}</span>
            </div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
              {lente.tipoLente}
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className={`text-sm font-medium ${lente.enPromocion ? 'text-green-600' : 'text-gray-900'}`}>
              {lente.precioActual?.toLocaleString('es-SV', { style: 'currency', currency: 'USD' })}
            </div>
            {lente.enPromocion && (
              <div className="text-xs text-gray-500 line-through">
                {lente.precioBase?.toLocaleString('es-SV', { style: 'currency', currency: 'USD' })}
              </div>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="text-sm text-gray-900">
            {stockTotal}
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              tieneStock 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {tieneStock ? 'En Stock' : 'Sin Stock'}
            </span>
            {lente.enPromocion && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                En Promoción
              </span>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleOpenDetailModal(lente)}
              className="text-gray-400 hover:text-cyan-600 transition-colors p-1 rounded-lg hover:bg-cyan-50"
              title="Ver detalles"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleOpenEditModal(lente)}
              className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-lg hover:bg-blue-50"
              title="Editar"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleOpenDeleteModal(lente)}
              className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
              title="Eliminar"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </td>
      </>
    );
  }, [getTotalStock, handleOpenDetailModal, handleOpenEditModal, handleOpenDeleteModal]);

  // --- RENDERIZADO PRINCIPAL ---
  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alertas */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header de la página */}
      <PageHeader
        title="Gestión de Lentes"
        description="Administra el catálogo de lentes de la óptica"
        icon={Glasses}
        buttonText="Agregar Lente"
        onButtonClick={handleOpenAddModal}
      />

      {/* Estadísticas */}
      <StatsGrid stats={stats} />

      {/* Contenedor principal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header de la tabla */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-cyan-500 to-cyan-600">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white">Lista de Lentes</h2>
              <p className="text-cyan-100 text-sm mt-1">
                {filteredAndSortedLentes.length} lentes encontrados
              </p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              title="Actualizar datos"
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="text-sm">Actualizar</span>
            </button>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Búsqueda */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar lentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* Controles de ordenamiento y filtros */}
            <div className="flex items-center space-x-3">
              {/* Dropdown de ordenamiento */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <SortAsc className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {SORT_OPTIONS.find(opt => opt.value === `${sortBy}-${sortOrder}`)?.label || 'Ordenar por'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      {SORT_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                              `${sortBy}-${sortOrder}` === option.value
                                ? 'bg-cyan-50 text-cyan-700'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{option.label}</span>
                            {`${sortBy}-${sortOrder}` === option.value && (
                              <CheckCircle className="w-4 h-4 ml-auto" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de filtros */}
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  hasActiveFilters()
                    ? 'bg-cyan-50 border-cyan-200 text-cyan-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filtros</span>
                {hasActiveFilters() && (
                  <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>

          {/* Resumen de filtros activos */}
          <div className="mt-3 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Mostrando {currentLentes.length} de {filteredAndSortedLentes.length} lentes
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

        {/* Panel de filtros avanzados */}
        {showFiltersPanel && (
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={filters.categoria}
                  onChange={(e) => handleFilterChange('categoria', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="todas">Todas las categorías</option>
                  {categorias.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Marca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <select
                  value={filters.marca}
                  onChange={(e) => handleFilterChange('marca', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="todas">Todas las marcas</option>
                  {marcas.map((marca) => (
                    <option key={marca._id} value={marca._id}>
                      {marca.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Lente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Lente
                </label>
                <select
                  value={filters.tipoLente}
                  onChange={(e) => handleFilterChange('tipoLente', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="graduado">Graduado</option>
                  <option value="sol">Sol</option>
                  <option value="contacto">Contacto</option>
                  <option value="proteccion">Protección</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="todos">Todos</option>
                  <option value="con_promocion">En promoción</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="todos">Todos</option>
                  <option value="con_stock">Con stock</option>
                  <option value="sin_stock">Sin stock</option>
                </select>
              </div>

              {/* Material */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material
                </label>
                <select
                  value={filters.material}
                  onChange={(e) => handleFilterChange('material', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="todos">Todos los colores</option>
                  {uniqueColores.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rango de precios */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rango de Precio (USD)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={filters.precioMin}
                    onChange={(e) => handleFilterChange('precioMin', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={filters.precioMax}
                    onChange={(e) => handleFilterChange('precioMax', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Rango de fechas */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rango de Fecha de Creación
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={filters.fechaDesde}
                    onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <input
                    type="date"
                    value={filters.fechaHasta}
                    onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de datos */}
        <DataTable
          columns={TABLE_COLUMNS}
          data={currentLentes}
          renderRow={renderRow}
          emptyMessage="No se encontraron lentes que coincidan con los criterios de búsqueda."
        />

        {/* Paginación */}
        <Pagination {...paginationProps} />
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
          variant="danger"
        />
      )}
    </div>
  );
};

export default LentesContent;