// src/pages/LentesContent.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../config/api';
import { useForm } from '../../../hooks/admin/useForm';
import { usePagination } from '../../../hooks/admin/usePagination';

// Componentes de UI
import PageHeader from '../ui/PageHeader';
import StatsGrid from '../ui/StatsGrid';
import FilterBar from '../ui/FilterBar';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import ConfirmationModal from '../ui/ConfirmationModal';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';
import LentesFormModal from '../management/lentes/LentesFormModal';

// Iconos
import { 
  Search, Plus, Trash2, Eye, Edit, Glasses, TrendingUp, Package, DollarSign, Tag, Image as ImageIcon, 
  Building2, Palette, Layers, Filter, X, ChevronDown, SortAsc, SortDesc, CheckCircle 
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
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{lente.color}</span>
            </div>
            <div className="text-gray-500 truncate">
              {lente.material} • {lente.tipoLente}
            </div>
            {lente.linea && (
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">
                {lente.linea}
              </div>
            )}
            {lente.medidas && (
              <div className="text-xs text-gray-400">
                {lente.medidas.ancho}×{lente.medidas.altura}×{lente.medidas.anchoPuente}mm
              </div>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            {lente.enPromocion ? (
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-green-600">
                    ${(lente.precioActual || 0).toFixed(2)}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    OFERTA
                  </span>
                </div>
                <div className="text-sm text-gray-500 line-through">
                  ${(lente.precioBase || 0).toFixed(2)}
                </div>
                {lente.promocionId?.nombre && (
                  <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full inline-block">
                    {lente.promocionId.nombre}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-lg font-semibold text-gray-900">
                ${(lente.precioBase || 0).toFixed(2)}
              </span>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className={`text-sm font-medium ${tieneStock ? 'text-green-600' : 'text-red-600'}`}>
              {stockTotal} unidades
            </div>
            <div className="text-xs text-gray-500">
              en {lente.sucursales?.length || 0} sucursal(es)
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="flex flex-col space-y-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              lente.enPromocion 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {lente.enPromocion ? '  Promoción' : 'Precio normal'}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              tieneStock 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {tieneStock ? '  Disponible' : '⌛ Sin stock'}
            </span>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="flex space-x-1">
            <button 
              onClick={() => handleOpenDeleteModal(lente)} 
              className="p-1.5 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" 
              title="Eliminar"
              aria-label={`Eliminar lente ${lente.nombre}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleOpenDetailModal(lente)} 
              className="p-1.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" 
              title="Ver detalles"
              aria-label={`Ver detalles de ${lente.nombre}`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleOpenEditModal(lente)} 
              className="p-1.5 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" 
              title="Editar"
              aria-label={`Editar lente ${lente.nombre}`}
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </td>
      </>
    );
  }, [getTotalStock, handleOpenDeleteModal, handleOpenDetailModal, handleOpenEditModal]);

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
    <div className="space-y-6 animate-fade-in">
      {/* Alerta */}
      <Alert alert={alert} />
      
      {/* Estadísticas */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-none">
          <StatsGrid stats={stats} />
        </div>
      </div>
      
      {/* Tabla principal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <PageHeader 
          title="Gestión de Lentes" 
          buttonLabel="Agregar Lente" 
          onButtonClick={handleOpenAddModal} 
        />
        
        {/* BARRA DE BÚSQUEDA Y CONTROLES */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Barra de búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, marca, material o color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                aria-label="Buscar lentes"
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
                      filters.categoria !== 'todas' && 1,
                      filters.marca !== 'todas' && 1,
                      filters.tipoLente !== 'todos' && 1,
                      filters.enPromocion !== 'todos' && 1,
                      filters.stock !== 'todos' && 1,
                      filters.material !== 'todos' && 1,
                      filters.color !== 'todos' && 1,
                      filters.precioMin && 1,
                      filters.precioMax && 1,
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
              {filteredAndSortedLentes.length} lente{filteredAndSortedLentes.length !== 1 ? 's' : ''} 
              {hasActiveFilters() && ` (filtrado${filteredAndSortedLentes.length !== 1 ? 's' : ''} de ${lentes.length})`}
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
                {/* Filtro por Categoría */}
                <div>
                  <label htmlFor="filter-categoria" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    id="filter-categoria"
                    value={filters.categoria}
                    onChange={(e) => handleFilterChange('categoria', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="todas">Todas las categorías</option>
                    {categorias.map(categoria => (
                      <option key={categoria._id} value={categoria._id}>{categoria.nombre}</option>
                    ))}
                  </select>
                </div>

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
                    {marcas.map(marca => (
                      <option key={marca._id} value={marca._id}>{marca.nombre}</option>
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
                    <option value="monofocal">Monofocal</option>
                    <option value="bifocal">Bifocal</option>
                    <option value="progresivo">Progresivo</option>
                    <option value="ocupacional">Ocupacional</option>
                  </select>
                </div>

                {/* Filtro por Promoción */}
                <div>
                  <label htmlFor="filter-promocion" className="block text-sm font-medium text-gray-700 mb-2">
                    Promoción
                  </label>
                  <select
                    id="filter-promocion"
                    value={filters.enPromocion}
                    onChange={(e) => handleFilterChange('enPromocion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="todos">Todos</option>
                    <option value="con_promocion">Con promoción</option>
                    <option value="sin_promocion">Sin promoción</option>
                  </select>
                </div>

                {/* Filtro por Stock */}
                <div>
                  <label htmlFor="filter-stock" className="block text-sm font-medium text-gray-700 mb-2">
                    Stock
                  </label>
                  <select
                    id="filter-stock"
                    value={filters.stock}
                    onChange={(e) => handleFilterChange('stock', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="todos">Todos</option>
                    <option value="con_stock">Con stock</option>
                    <option value="sin_stock">Sin stock</option>
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
                      aria-label="Precio mínimo"
                    />
                    <input
                      type="number"
                      placeholder="Max $"
                      value={filters.precioMax}
                      onChange={(e) => handleFilterChange('precioMax', e.target.value)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      aria-label="Precio máximo"
                    />
                  </div>
                </div>

                {/* Filtro por Fecha de Creación */}
                <div className="md:col-span-2 lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Creación</label>
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
        
        {/* TABLA DE DATOS */}
        <div className="overflow-x-auto">
          <div style={{ minWidth: '1200px' }}>
            <DataTable
              columns={TABLE_COLUMNS}
              data={currentLentes}
              renderRow={renderRow}
              isLoading={false}
              noDataMessage="No se encontraron lentes"
              noDataSubMessage={hasActiveFilters() ? 'Intenta ajustar los filtros de búsqueda' : 'Aún no hay lentes registrados'}
            />
          </div>
        </div>
        
        <Pagination {...paginationProps} />
      </div>

      {/* MODALES */}
      {/* Modal de formulario */}
      <LentesFormModal
        isOpen={showAddEditModal}
        onClose={handleCloseModals}
        onSubmit={handleFormSubmit}
        title={selectedLente ? "Editar Lente" : "Agregar Nuevo Lente"}
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        errors={errors}
        isEditing={!!selectedLente}
        categorias={categorias}
        marcas={marcas}
        promociones={promociones}
        sucursales={sucursales}
        selectedLente={selectedLente}
      />

      {/* Modal de detalles mejorado */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModals}
        title="Detalles del Lente"
        item={selectedLente}
        data={selectedLente ? [
          { label: "Nombre", value: selectedLente.nombre },
          { label: "Descripción", value: selectedLente.descripcion },
          { label: "Categoría", value: selectedLente.categoriaId?.nombre || selectedLente.categoriaId },
          { label: "Marca", value: selectedLente.marcaId?.nombre || selectedLente.marcaId },
          { label: "Línea", value: selectedLente.linea },
          { label: "Material", value: selectedLente.material },
          { label: "Color", value: selectedLente.color },
          { label: "Tipo de Lente", value: selectedLente.tipoLente },
          { label: "Precio Base", value: `${(selectedLente.precioBase || 0).toFixed(2)}` },
          { 
            label: "Precio Actual", 
            value: `${(selectedLente.precioActual || selectedLente.precioBase || 0).toFixed(2)}`,
            color: selectedLente.enPromocion ? 'text-green-600' : 'text-gray-900'
          },
          { 
            label: "Estado", 
            value: selectedLente.enPromocion ? 'En Promoción' : 'Precio Normal',
            color: selectedLente.enPromocion ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
          },
          ...(selectedLente.enPromocion && selectedLente.promocionId ? [{
            label: "Promoción Aplicada",
            value: selectedLente.promocionId?.nombre || 'Promoción sin nombre',
            color: 'text-orange-600'
          }] : []),
          { label: "Ancho Puente", value: `${selectedLente.medidas?.anchoPuente || 'N/A'} mm` },
          { label: "Altura", value: `${selectedLente.medidas?.altura || 'N/A'} mm` },
          { label: "Ancho", value: `${selectedLente.medidas?.ancho || 'N/A'} mm` },
          { 
            label: "Stock Total", 
            value: `${getTotalStock(selectedLente)} unidades`
          },
          { 
            label: "Disponibilidad por Sucursal", 
            value: selectedLente.sucursales?.map(s => 
              `${s.nombreSucursal || s.sucursalId?.nombre}: ${s.stock || 0} unidades`
            ).join(' | ') || 'Sin stock'
          },
          { label: "Imágenes", value: `${selectedLente.imagenes?.length || 0} imagen(es)` },
          { label: "Fecha de Creación", value: selectedLente.fechaCreacion ? new Date(selectedLente.fechaCreacion).toLocaleDateString('es-ES') : 'N/A' }
        ] : []}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseModals}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el lente "${selectedLente?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        type="danger"
      />

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

export default LentesContent;