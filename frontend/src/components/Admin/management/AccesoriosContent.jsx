import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useForm } from '../../../hooks/admin/useForm';
import { usePagination } from '../../../hooks/admin/usePagination';
import PageHeader from '../ui/PageHeader';
import StatsGrid from '../ui/StatsGrid';
import FilterBar from '../ui/FilterBar';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import ConfirmationModal from '../ui/ConfirmationModal';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';
import AccesoriosFormModal from '../management/employees/AccesoriosFormModal';
import { 
  Search, Plus, Trash2, Eye, Edit, ShoppingBag, Tags, Package, DollarSign, Clock, 
  ImageIcon, Building2, Palette, Layers, Filter, X, ChevronDown, SortAsc, SortDesc, 
  CheckCircle 
} from 'lucide-react';

const API_URL = 'https://aurora-production-7e57.up.railway.app/api/accesorios';
const MARCAS_URL = 'https://aurora-production-7e57.up.railway.app/api/marcas';
const CATEGORIAS_URL = 'https://aurora-production-7e57.up.railway.app/api/categoria';
const SUCURSALES_URL = 'https://aurora-production-7e57.up.railway.app/api/sucursales';
const PROMOCIONES_URL = 'https://aurora-production-7e57.up.railway.app/api/promociones';

const ITEMS_PER_PAGE = 12;

// Estados iniciales para filtros
const INITIAL_FILTERS = {
  categoria: 'todas',
  marca: 'todas',
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
  { value: 'createdAt-desc', label: 'Más Recientes Primero', icon: Package },
  { value: 'createdAt-asc', label: 'Más Antiguos Primero', icon: Package },
  { value: 'nombre-asc', label: 'Nombre A-Z', icon: ShoppingBag },
  { value: 'nombre-desc', label: 'Nombre Z-A', icon: ShoppingBag },
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

const AccesoriosContent = () => {
  // Estados principales
  const [accesorios, setAccesorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccesorio, setSelectedAccesorio] = useState(null);
  const [alert, setAlert] = useState(null);
  
  // Estados de modales
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estados para datos relacionados
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [promociones, setPromociones] = useState([]);

  // Estados de filtros y ordenamiento
  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // Hook de formulario con validación completa
  const { formData, setFormData, handleInputChange, resetForm, errors, validateForm } = useForm({
    nombre: '',
    descripcion: '',
    tipo: '',
    marcaId: '',
    linea: '',
    material: '',
    color: '',
    precioBase: 0,
    precioActual: 0,
    imagenes: [],
    enPromocion: false,
    promocionId: '',
    sucursales: []
  }, (data) => {
    const newErrors = {};
    
    // Validaciones básicas
    if (!data.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!data.descripcion?.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!data.tipo) newErrors.tipo = 'La categoría es requerida';
    if (!data.marcaId) newErrors.marcaId = 'La marca es requerida';
    if (!data.linea) newErrors.linea = 'La línea es requerida';
    if (!data.material) newErrors.material = 'El material es requerido';
    if (!data.color) newErrors.color = 'El color es requerido';
    
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
    
    // Validación de sucursales
    if (!data.sucursales || data.sucursales.length === 0) {
      newErrors.sucursales = 'Debe seleccionar al menos una sucursal';
    }
    
    // Validación de stock
    const hasInvalidStock = data.sucursales?.some(s => s.stock < 0);
    if (hasInvalidStock) {
      newErrors.sucursales = 'El stock no puede ser negativo';
    }
    
    // Validación de imágenes
    if (!data.imagenes || data.imagenes.length === 0) {
      newErrors.imagenes = 'Debe agregar al menos una imagen';
    }
    
    return newErrors;
  });

  // Funciones utilitarias
  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
    const timer = setTimeout(() => setAlert(null), 5000);
    return () => clearTimeout(timer);
  }, []);

  const getTotalStock = useCallback((accesorio) => {
    return accesorio.sucursales ? accesorio.sucursales.reduce((sum, s) => sum + (s.stock || 0), 0) : 0;
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
        case 'createdAt':
          valueA = new Date(a.createdAt || new Date(0));
          valueB = new Date(b.createdAt || new Date(0));
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
  const applyAdvancedFilters = useCallback((accesorio) => {
    // Filtro por categoría
    if (filters.categoria !== 'todas' && accesorio.tipo?._id !== filters.categoria) {
      return false;
    }

    // Filtro por marca
    if (filters.marca !== 'todas' && accesorio.marcaId?._id !== filters.marca) {
      return false;
    }

    // Filtro por promoción
    if (filters.enPromocion === 'con_promocion' && !accesorio.enPromocion) {
      return false;
    }
    if (filters.enPromocion === 'sin_promocion' && accesorio.enPromocion) {
      return false;
    }

    // Filtro por stock
    const stockTotal = getTotalStock(accesorio);
    if (filters.stock === 'con_stock' && stockTotal <= 0) {
      return false;
    }
    if (filters.stock === 'sin_stock' && stockTotal > 0) {
      return false;
    }

    // Filtro por material
    if (filters.material !== 'todos' && accesorio.material?.toLowerCase() !== filters.material.toLowerCase()) {
      return false;
    }

    // Filtro por color
    if (filters.color !== 'todos' && accesorio.color?.toLowerCase() !== filters.color.toLowerCase()) {
      return false;
    }

    // Filtro por precio
    const precio = accesorio.enPromocion ? accesorio.precioActual : accesorio.precioBase;
    if (filters.precioMin && parseFloat(precio || 0) < parseFloat(filters.precioMin)) {
      return false;
    }
    if (filters.precioMax && parseFloat(precio || 0) > parseFloat(filters.precioMax)) {
      return false;
    }

    // Filtro por fecha de creación
    if (filters.fechaDesde) {
      const fechaDesde = new Date(filters.fechaDesde);
      if (new Date(accesorio.createdAt || new Date(0)) < fechaDesde) {
        return false;
      }
    }
    if (filters.fechaHasta) {
      const fechaHasta = new Date(filters.fechaHasta);
      fechaHasta.setHours(23, 59, 59);
      if (new Date(accesorio.createdAt || new Date(0)) > fechaHasta) {
        return false;
      }
    }

    return true;
  }, [filters, getTotalStock]);

  // Funciones de carga de datos
  const fetchAccesorios = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      console.log('Accesorios response:', response.data);
      // Manejar diferentes estructuras de respuesta
      const data = response.data.data || response.data;
      setAccesorios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching accesorios:", error);
      showAlert('error', 'Error al cargar los accesorios: ' + (error.response?.data?.message || error.message));
      setAccesorios([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [marcasRes, categoriasRes, sucursalesRes, promocionesRes] = await Promise.all([
        axios.get(MARCAS_URL),
        axios.get(CATEGORIAS_URL),
        axios.get(SUCURSALES_URL),
        axios.get(PROMOCIONES_URL)
      ]);
      
      console.log('Dependencies loaded:', {
        marcas: marcasRes.data,
        categorias: categoriasRes.data,
        sucursales: sucursalesRes.data,
        promociones: promocionesRes.data
      });
      
      setMarcas(Array.isArray(marcasRes.data) ? marcasRes.data : marcasRes.data.data || []);
      setCategorias(Array.isArray(categoriasRes.data) ? categoriasRes.data : categoriasRes.data.data || []);
      setSucursales(Array.isArray(sucursalesRes.data) ? sucursalesRes.data : sucursalesRes.data.data || []);
      setPromociones(Array.isArray(promocionesRes.data) ? promocionesRes.data : promocionesRes.data.data || []);
      
    } catch (error) {
      console.error("Error fetching dependencies:", error);
      showAlert('error', 'Error al cargar marcas, categorías, sucursales o promociones: ' + (error.response?.data?.message || error.message));
      
      // Establecer arrays vacíos en caso de error
      setMarcas([]);
      setCategorias([]);
      setSucursales([]);
      setPromociones([]);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchAccesorios();
    fetchDependencies();
    
    // Cargar script de Cloudinary
    const script = document.createElement('script');
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Lógica de filtrado, ordenamiento y paginación
  const filteredAndSortedAccesorios = useMemo(() => {
    let currentAccesorios = Array.isArray(accesorios) ? accesorios : [];

    // Filtro por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      currentAccesorios = currentAccesorios.filter(
        (accesorio) =>
          accesorio.nombre?.toLowerCase().includes(searchLower) ||
          accesorio.descripcion?.toLowerCase().includes(searchLower) ||
          accesorio.material?.toLowerCase().includes(searchLower) ||
          accesorio.color?.toLowerCase().includes(searchLower) ||
          accesorio.marcaId?.nombre?.toLowerCase().includes(searchLower) ||
          accesorio.tipo?.nombre?.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar filtros avanzados
    currentAccesorios = currentAccesorios.filter(applyAdvancedFilters);

    return sortData(currentAccesorios);
  }, [accesorios, searchTerm, applyAdvancedFilters, sortData]);

  const { paginatedData: currentAccesorios, ...paginationProps } = usePagination(filteredAndSortedAccesorios, ITEMS_PER_PAGE);

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
  }, []);

  const hasActiveFilters = useCallback(() => {
    return searchTerm || 
           filters.categoria !== 'todas' || 
           filters.marca !== 'todas' || 
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
    const materiales = accesorios
      .map(a => a.material)
      .filter(Boolean)
      .filter((material, index, arr) => arr.indexOf(material) === index);
    return materiales.sort();
  }, [accesorios]);

  const uniqueColores = useMemo(() => {
    const colores = accesorios
      .map(a => a.color)
      .filter(Boolean)
      .filter((color, index, arr) => arr.indexOf(color) === index);
    return colores.sort();
  }, [accesorios]);

  // Funciones de manejo de modales
  const handleCloseModals = useCallback(() => {
    setShowAddEditModal(false);
    setShowDetailModal(false);
    setShowDeleteModal(false);
    setSelectedAccesorio(null);
    resetForm();
  }, [resetForm]);

  const handleOpenAddModal = useCallback(() => {
    resetForm();
    setSelectedAccesorio(null);
    setFormData({
      nombre: '',
      descripcion: '',
      tipo: '',
      marcaId: '',
      linea: '',
      material: '',
      color: '',
      precioBase: 0,
      precioActual: 0,
      imagenes: [],
      enPromocion: false,
      promocionId: '',
      sucursales: []
    });
    setShowAddEditModal(true);
  }, [resetForm, setFormData]);

  const handleOpenEditModal = useCallback((accesorio) => {
    setSelectedAccesorio(accesorio);
    
    // Función para normalizar las imágenes
    const normalizeImages = (images) => {
      if (!images || !Array.isArray(images)) return [];
      
      return images.map(img => {
        // Si es un string (URL directa)
        if (typeof img === 'string') {
          return img.startsWith('http') ? img : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${img}`;
        }
        
        // Si es un objeto con propiedades
        if (typeof img === 'object' && img !== null) {
          // Priorizar secure_url, luego url, luego public_id
          return img.secure_url || img.url || (img.public_id ? `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${img.public_id}` : '');
        }
        
        return '';
      }).filter(url => url && url.length > 0); // Filtrar URLs vacías
    };

    // Función para normalizar sucursales
    const normalizeSucursales = (sucursales) => {
      if (!sucursales || !Array.isArray(sucursales)) return [];
      
      return sucursales.map(s => ({
        sucursalId: s.sucursalId?._id || s.sucursalId || s._id || '',
        nombreSucursal: s.nombreSucursal || s.sucursalId?.nombre || s.nombre || '',
        stock: parseInt(s.stock) || 0
      }));
    };

    // Preparar datos para edición con normalización mejorada
    const editData = {
      nombre: accesorio.nombre || '',
      descripcion: accesorio.descripcion || '',
      tipo: accesorio.tipo?._id || accesorio.tipo || '',
      marcaId: accesorio.marcaId?._id || accesorio.marcaId || '',
      linea: accesorio.linea || '',
      material: accesorio.material || '',
      color: accesorio.color || '',
      precioBase: parseFloat(accesorio.precioBase) || 0,
      precioActual: parseFloat(accesorio.precioActual || accesorio.precioBase) || 0,
      imagenes: normalizeImages(accesorio.imagenes),
      enPromocion: Boolean(accesorio.enPromocion),
      promocionId: accesorio.promocionId?._id || accesorio.promocionId || '',
      sucursales: normalizeSucursales(accesorio.sucursales)
    };
    
    setFormData(editData);
    setShowAddEditModal(true);
  }, [setFormData]);

  const handleOpenDetailModal = useCallback((accesorio) => {
    setSelectedAccesorio(accesorio);
    setShowDetailModal(true);
  }, []);

  const handleOpenDeleteModal = useCallback((accesorio) => {
    setSelectedAccesorio(accesorio);
    setShowDeleteModal(true);
  }, []);

  // Función de envío del formulario
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form data before validation:', formData);
    
    if (!validateForm()) {
      showAlert('error', 'Por favor, corrige los errores del formulario.');
      return;
    }

    // Preparar FormData para el envío
    const dataToSend = new FormData();
    
    // Agregar campos básicos
    Object.keys(formData).forEach(key => {
      if (key === 'sucursales') {
        dataToSend.append('sucursales', JSON.stringify(formData.sucursales));
      } else if (key === 'imagenes') {
        // Las imágenes ya son URLs de Cloudinary, enviarlas como JSON
        dataToSend.append('imagenes', JSON.stringify(formData.imagenes));
      } else if (key === 'promocionId') {
        // Solo enviar promocionId si está en promoción
        if (formData.enPromocion && formData.promocionId) {
          dataToSend.append(key, formData[key]);
        }
      } else {
        dataToSend.append(key, formData[key]);
      }
    });

    // Debug: Ver qué se está enviando
    console.log('Sending data:', Object.fromEntries(dataToSend));

    try {
      let response;
      if (selectedAccesorio) {
        // Actualizar accesorio existente
        response = await axios.put(`${API_URL}/${selectedAccesorio._id}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showAlert('success', 'Accesorio actualizado exitosamente');
      } else {
        // Crear nuevo accesorio
        response = await axios.post(API_URL, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showAlert('success', 'Accesorio creado exitosamente');
      }
      
      console.log('Server response:', response.data);
      
      // Recargar datos y cerrar modal
      await fetchAccesorios();
      handleCloseModals();
      
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      showAlert('error', `Error al guardar el accesorio: ${errorMessage}`);
    }
  };

  // Función de eliminación
  const handleDelete = async () => {
    if (!selectedAccesorio) return;
    
    try {
      await axios.delete(`${API_URL}/${selectedAccesorio._id}`);
      showAlert('success', 'Accesorio eliminado exitosamente');
      await fetchAccesorios();
      handleCloseModals();
    } catch (error) {
      console.error("Error deleting accesorio:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      showAlert('error', `Error al eliminar el accesorio: ${errorMessage}`);
    }
  };

  // Calcular estadísticas
  const accesoriosArr = Array.isArray(accesorios) ? accesorios : [];
  const totalAccesorios = accesoriosArr.length;
  const accesoriosEnPromocion = accesoriosArr.filter(a => a.enPromocion).length;
  const stockTotal = accesoriosArr.reduce((total, accesorio) => {
    return total + getTotalStock(accesorio);
  }, 0);
  const valorInventario = accesoriosArr.reduce((sum, a) => sum + ((a.precioActual || a.precioBase || 0) * getTotalStock(a)), 0);

  const stats = [
    { 
      title: "Total Accesorios", 
      value: totalAccesorios, 
      Icon: Package,
      color: "cyan" 
    },
    { 
      title: "En Promoción", 
      value: accesoriosEnPromocion, 
      Icon: Tags,
      color: "green" 
    },
    { 
      title: "Stock Total", 
      value: stockTotal, 
      Icon: ShoppingBag,
      color: "purple" 
    },
    { 
      title: "Valor Inventario", 
      value: valorInventario.toLocaleString('es-SV', { style: 'currency', currency: 'USD' }), 
      Icon: DollarSign,
      color: "yellow" 
    }
  ];

  // Función para renderizar filas
  const renderRow = useCallback((accesorio) => {
    const stockTotal = getTotalStock(accesorio);
    const tieneStock = stockTotal > 0;
    
    return (
      <>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12">
              {accesorio.imagenes && accesorio.imagenes.length > 0 ? (
                <img 
                  src={accesorio.imagenes[0]} 
                  alt={accesorio.nombre}
                  className="w-12 h-12 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {accesorio.nombre}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {accesorio.descripcion}
              </p>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Tags className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-900 truncate">
                {accesorio.marcaId?.nombre || 'Sin marca'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-500 truncate">
                {accesorio.tipo?.nombre || accesorio.tipo || 'Sin categoría'}
              </span>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{accesorio.color}</span>
            </div>
            <div className="text-gray-500 truncate">
              {accesorio.material}
            </div>
            {accesorio.linea && (
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">
                {accesorio.linea}
              </div>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            {accesorio.enPromocion ? (
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-green-600">
                    ${(accesorio.precioActual || 0).toFixed(2)}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    OFERTA
                  </span>
                </div>
                <div className="text-sm text-gray-500 line-through">
                  ${(accesorio.precioBase || 0).toFixed(2)}
                </div>
                {accesorio.promocionId?.nombre && (
                  <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full inline-block">
                    {accesorio.promocionId.nombre}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-lg font-semibold text-gray-900">
                ${(accesorio.precioBase || 0).toFixed(2)}
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
              en {accesorio.sucursales?.length || 0} sucursal(es)
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="flex flex-col space-y-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              accesorio.enPromocion 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {accesorio.enPromocion ? '  Promoción' : 'Precio normal'}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              tieneStock 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {tieneStock ? '  Disponible' : '⏱ Sin stock'}
            </span>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="flex space-x-1">
            <button 
              onClick={() => handleOpenDeleteModal(accesorio)} 
              className="p-1.5 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" 
              title="Eliminar"
              aria-label={`Eliminar accesorio ${accesorio.nombre}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleOpenDetailModal(accesorio)} 
              className="p-1.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" 
              title="Ver detalles"
              aria-label={`Ver detalles de ${accesorio.nombre}`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleOpenEditModal(accesorio)} 
              className="p-1.5 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" 
              title="Editar"
              aria-label={`Editar accesorio ${accesorio.nombre}`}
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </td>
      </>
    );
  }, [getTotalStock, handleOpenDeleteModal, handleOpenDetailModal, handleOpenEditModal]);

  // Renderizado del componente
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
          title="Gestión de Accesorios" 
          buttonLabel="Agregar Accesorio" 
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
                aria-label="Buscar accesorios"
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
              {filteredAndSortedAccesorios.length} accesorio{filteredAndSortedAccesorios.length !== 1 ? 's' : ''} 
              {hasActiveFilters() && ` (filtrado${filteredAndSortedAccesorios.length !== 1 ? 's' : ''} de ${accesorios.length})`}
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
              data={currentAccesorios}
              renderRow={renderRow}
              isLoading={false}
              noDataMessage="No se encontraron accesorios"
              noDataSubMessage={hasActiveFilters() ? 'Intenta ajustar los filtros de búsqueda' : 'Aún no hay accesorios registrados'}
            />
          </div>
        </div>
        
        <Pagination {...paginationProps} />
      </div>

      {/* MODALES */}
      {/* Modal de formulario mejorado con soporte para promociones */}
      <AccesoriosFormModal
        isOpen={showAddEditModal}
        onClose={handleCloseModals}
        onSubmit={handleFormSubmit}
        title={selectedAccesorio ? "Editar Accesorio" : "Agregar Nuevo Accesorio"}
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        errors={errors}
        isEditing={!!selectedAccesorio}
        marcas={marcas}
        categorias={categorias}
        sucursales={sucursales}
        promociones={promociones}
        selectedAccesorio={selectedAccesorio}
      />

      {/* Modal de detalles mejorado */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModals}
        title="Detalles del Accesorio"
        item={selectedAccesorio}
        data={selectedAccesorio ? [
          { label: "Nombre", value: selectedAccesorio.nombre },
          { label: "Descripción", value: selectedAccesorio.descripcion },
          { label: "Categoría", value: selectedAccesorio.tipo?.nombre || selectedAccesorio.tipo },
          { label: "Marca", value: selectedAccesorio.marcaId?.nombre },
          { label: "Línea", value: selectedAccesorio.linea },
          { label: "Material", value: selectedAccesorio.material },
          { label: "Color", value: selectedAccesorio.color },
          { label: "Precio Base", value: `${(selectedAccesorio.precioBase || 0).toFixed(2)}` },
          { 
            label: "Precio Actual", 
            value: `${(selectedAccesorio.precioActual || selectedAccesorio.precioBase || 0).toFixed(2)}`,
            color: selectedAccesorio.enPromocion ? 'text-green-600' : 'text-gray-900'
          },
          { 
            label: "Estado", 
            value: selectedAccesorio.enPromocion ? 'En Promoción' : 'Precio Normal',
            color: selectedAccesorio.enPromocion ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
          },
          ...(selectedAccesorio.enPromocion && selectedAccesorio.promocionId ? [{
            label: "Promoción Aplicada",
            value: selectedAccesorio.promocionId?.nombre || 'Promoción sin nombre',
            color: 'text-orange-600'
          }] : []),
          { 
            label: "Stock Total", 
            value: `${getTotalStock(selectedAccesorio)} unidades`
          },
          { 
            label: "Disponibilidad por Sucursal", 
            value: selectedAccesorio.sucursales?.map(s => 
              `${s.nombreSucursal || s.sucursalId?.nombre}: ${s.stock || 0} unidades`
            ).join(' | ') || 'Sin stock'
          },
          { label: "Imágenes", value: `${selectedAccesorio.imagenes?.length || 0} imagen(es)` },
          { label: "Fecha de Creación", value: selectedAccesorio.createdAt ? new Date(selectedAccesorio.createdAt).toLocaleDateString('es-ES') : 'N/A' }
        ] : []}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseModals}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el accesorio "${selectedAccesorio?.nombre}"? Esta acción no se puede deshacer.`}
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

export default AccesoriosContent;