import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useForm } from '../../../hooks/admin/useForm';
import { usePagination } from '../../../hooks/admin/usePagination';
import PageHeader from '../ui/PageHeader';
import StatsGrid from '../ui/StatsGrid';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import ConfirmationModal from '../ui/ConfirmationModal';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';
import ArosFormModal from './aros/ArosFormModal.jsx';
import { 
  Search, Plus, Trash2, Eye, Edit, Glasses, Tags, Package, DollarSign,
  Filter, X, ChevronDown, SortAsc, SortDesc, CheckCircle, Palette, Layers
} from 'lucide-react';

const API_URL = 'https://aurora-production-7e57.up.railway.app/api/aros';
const MARCAS_URL = 'https://aurora-production-7e57.up.railway.app/api/marcas';
const CATEGORIAS_URL = 'https://aurora-production-7e57.up.railway.app/api/categoria';
const SUCURSALES_URL = 'https://aurora-production-7e57.up.railway.app/api/sucursales';
const PROMOCIONES_URL = 'https://aurora-production-7e57.up.railway.app/api/promociones';

const ITEMS_PER_PAGE = 12;

const INITIAL_FILTERS = {
  categoria: 'todas',
  marca: 'todas',
  enPromocion: 'todos',
  stock: 'todos',
  precioMin: '',
  precioMax: '',
  material: 'todos',
  color: 'todos',
  tipoLente: 'todos'
};

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Más Recientes Primero', icon: Package },
  { value: 'createdAt-asc', label: 'Más Antiguos Primero', icon: Package },
  { value: 'nombre-asc', label: 'Nombre A-Z', icon: Glasses },
  { value: 'nombre-desc', label: 'Nombre Z-A', icon: Glasses },
  { value: 'precioBase-desc', label: 'Precio: Mayor a Menor', icon: DollarSign },
  { value: 'precioBase-asc', label: 'Precio: Menor a Mayor', icon: DollarSign },
  { value: 'stock-desc', label: 'Mayor Stock', icon: Package },
  { value: 'stock-asc', label: 'Menor Stock', icon: Package },
];

const TABLE_COLUMNS = [
  { header: 'Producto', key: 'producto' },
  { header: 'Marca/Categoría', key: 'marca_categoria' },
  { header: 'Características', key: 'caracteristicas' },
  { header: 'Precio', key: 'precio' },
  { header: 'Stock', key: 'stock' },
  { header: 'Estado', key: 'estado' },
  { header: 'Acciones', key: 'acciones' }
];

const SkeletonLoader = React.memo(() => (
  <div className="animate-pulse">
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-cyan-500 to-cyan-600">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-cyan-400 rounded w-48"></div>
          <div className="h-10 bg-cyan-400 rounded w-32"></div>
        </div>
      </div>
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="h-10 bg-gray-200 rounded-lg w-full max-w-md mb-3"></div>
        <div className="flex space-x-3">
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  </div>
));

const ArosContent = () => {
  const [aros, setAros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAro, setSelectedAro] = useState(null);
  const [alert, setAlert] = useState(null);
  
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [promociones, setPromociones] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const { formData, setFormData, handleInputChange, resetForm, errors, validateForm } = useForm({
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
    sucursales: []
  }, (data) => {
    const newErrors = {};
    
    if (!data.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!data.descripcion?.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!data.categoriaId) newErrors.categoriaId = 'La categoría es requerida';
    if (!data.marcaId) newErrors.marcaId = 'La marca es requerida';
    if (!data.material?.trim()) newErrors.material = 'El material es requerido';
    if (!data.color?.trim()) newErrors.color = 'El color es requerido';
    if (!data.tipoLente?.trim()) newErrors.tipoLente = 'El tipo de lente es requerido';
    
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
    
    if (!data.sucursales || data.sucursales.length === 0) {
      newErrors.sucursales = 'Debe seleccionar al menos una sucursal';
    }
    
    const hasInvalidStock = data.sucursales?.some(s => s.stock < 0);
    if (hasInvalidStock) {
      newErrors.sucursales = 'El stock no puede ser negativo';
    }
    
    if (!data.imagenes || data.imagenes.length === 0) {
      newErrors.imagenes = 'Debe agregar al menos una imagen';
    }
    
    return newErrors;
  });

  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
    const timer = setTimeout(() => setAlert(null), 5000);
    return () => clearTimeout(timer);
  }, []);

  const getTotalStock = useCallback((aro) => {
    return aro.sucursales ? aro.sucursales.reduce((sum, s) => sum + (s.stock || 0), 0) : 0;
  }, []);

  const handleSortChange = useCallback((sortValue) => {
    const [field, order] = sortValue.split('-');
    setSortBy(field);
    setSortOrder(order);
    setShowSortDropdown(false);
  }, []);

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

  const applyAdvancedFilters = useCallback((aro) => {
    if (filters.categoria !== 'todas' && aro.categoriaId?._id !== filters.categoria) return false;
    if (filters.marca !== 'todas' && aro.marcaId?._id !== filters.marca) return false;
    if (filters.enPromocion === 'con_promocion' && !aro.enPromocion) return false;
    if (filters.enPromocion === 'sin_promocion' && aro.enPromocion) return false;

    const stockTotal = getTotalStock(aro);
    if (filters.stock === 'con_stock' && stockTotal <= 0) return false;
    if (filters.stock === 'sin_stock' && stockTotal > 0) return false;

    if (filters.material !== 'todos' && aro.material?.toLowerCase() !== filters.material.toLowerCase()) return false;
    if (filters.color !== 'todos' && aro.color?.toLowerCase() !== filters.color.toLowerCase()) return false;
    if (filters.tipoLente !== 'todos' && aro.tipoLente?.toLowerCase() !== filters.tipoLente.toLowerCase()) return false;

    const precio = aro.enPromocion ? aro.precioActual : aro.precioBase;
    if (filters.precioMin && parseFloat(precio || 0) < parseFloat(filters.precioMin)) return false;
    if (filters.precioMax && parseFloat(precio || 0) > parseFloat(filters.precioMax)) return false;

    return true;
  }, [filters, getTotalStock]);

  const fetchAros = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      const data = response.data.data || response.data;
      setAros(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching aros:", error);
      showAlert('error', 'Error al cargar los aros: ' + (error.response?.data?.message || error.message));
      setAros([]);
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
      
      setMarcas(Array.isArray(marcasRes.data) ? marcasRes.data : marcasRes.data.data || []);
      setCategorias(Array.isArray(categoriasRes.data) ? categoriasRes.data : categoriasRes.data.data || []);
      setSucursales(Array.isArray(sucursalesRes.data) ? sucursalesRes.data : sucursalesRes.data.data || []);
      setPromociones(Array.isArray(promocionesRes.data) ? promocionesRes.data : promocionesRes.data.data || []);
    } catch (error) {
      console.error("Error fetching dependencies:", error);
      showAlert('error', 'Error al cargar datos relacionados');
      setMarcas([]);
      setCategorias([]);
      setSucursales([]);
      setPromociones([]);
    }
  };

  useEffect(() => {
    fetchAros();
    fetchDependencies();
  }, []);

  const filteredAndSortedAros = useMemo(() => {
    let currentAros = Array.isArray(aros) ? aros : [];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      currentAros = currentAros.filter(
        (aro) =>
          aro.nombre?.toLowerCase().includes(searchLower) ||
          aro.descripcion?.toLowerCase().includes(searchLower) ||
          aro.material?.toLowerCase().includes(searchLower) ||
          aro.color?.toLowerCase().includes(searchLower) ||
          aro.tipoLente?.toLowerCase().includes(searchLower) ||
          aro.marcaId?.nombre?.toLowerCase().includes(searchLower) ||
          aro.categoriaId?.nombre?.toLowerCase().includes(searchLower)
      );
    }

    currentAros = currentAros.filter(applyAdvancedFilters);
    return sortData(currentAros);
  }, [aros, searchTerm, applyAdvancedFilters, sortData]);

  const { paginatedData: currentAros, ...paginationProps } = usePagination(filteredAndSortedAros, ITEMS_PER_PAGE);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
           filters.tipoLente !== 'todos' ||
           filters.precioMin || 
           filters.precioMax;
  }, [searchTerm, filters]);

  const uniqueMateriales = useMemo(() => {
    const materiales = aros.map(a => a.material).filter(Boolean).filter((m, i, arr) => arr.indexOf(m) === i);
    return materiales.sort();
  }, [aros]);

  const uniqueColores = useMemo(() => {
    const colores = aros.map(a => a.color).filter(Boolean).filter((c, i, arr) => arr.indexOf(c) === i);
    return colores.sort();
  }, [aros]);

  const uniqueTiposLente = useMemo(() => {
    const tipos = aros.map(a => a.tipoLente).filter(Boolean).filter((t, i, arr) => arr.indexOf(t) === i);
    return tipos.sort();
  }, [aros]);

  const handleCloseModals = useCallback(() => {
    setShowAddEditModal(false);
    setShowDetailModal(false);
    setShowDeleteModal(false);
    setSelectedAro(null);
    resetForm();
  }, [resetForm]);

  const handleOpenAddModal = useCallback(() => {
    resetForm();
    setSelectedAro(null);
    setFormData({
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
      sucursales: []
    });
    setShowAddEditModal(true);
  }, [resetForm, setFormData]);

  const handleOpenEditModal = useCallback((aro) => {
    setSelectedAro(aro);
    
    const normalizeImages = (images) => {
      if (!images || !Array.isArray(images)) return [];
      return images.map(img => {
        if (typeof img === 'string') return img;
        if (typeof img === 'object' && img !== null) {
          return img.secure_url || img.url || '';
        }
        return '';
      }).filter(url => url && url.length > 0);
    };

    const normalizeSucursales = (sucursales) => {
      if (!sucursales || !Array.isArray(sucursales)) return [];
      return sucursales.map(s => ({
        sucursalId: s.sucursalId?._id || s.sucursalId || s._id || '',
        nombreSucursal: s.nombreSucursal || s.sucursalId?.nombre || s.nombre || '',
        stock: parseInt(s.stock) || 0
      }));
    };

    const editData = {
      nombre: aro.nombre || '',
      descripcion: aro.descripcion || '',
      categoriaId: aro.categoriaId?._id || aro.categoriaId || '',
      marcaId: aro.marcaId?._id || aro.marcaId || '',
      material: aro.material || '',
      color: aro.color || '',
      tipoLente: aro.tipoLente || '',
      precioBase: parseFloat(aro.precioBase) || 0,
      precioActual: parseFloat(aro.precioActual || aro.precioBase) || 0,
      linea: aro.linea || '',
      medidas: {
        anchoPuente: aro.medidas?.anchoPuente || '',
        altura: aro.medidas?.altura || '',
        ancho: aro.medidas?.ancho || ''
      },
      imagenes: normalizeImages(aro.imagenes),
      enPromocion: Boolean(aro.enPromocion),
      promocionId: aro.promocionId?._id || aro.promocionId || '',
      sucursales: normalizeSucursales(aro.sucursales)
    };
    
    setFormData(editData);
    setShowAddEditModal(true);
  }, [setFormData]);

  const handleOpenDetailModal = useCallback((aro) => {
    setSelectedAro(aro);
    setShowDetailModal(true);
  }, []);

  const handleOpenDeleteModal = useCallback((aro) => {
    setSelectedAro(aro);
    setShowDeleteModal(true);
  }, []);

  const handleFormSubmit = async (e) => {
  e.preventDefault();
  
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   🚀 INICIANDO SUBMIT DE AROS          ║');
  console.log('╚═══════════════════════════════════════╝');
  
  console.log('\n📋 PASO 1: Datos del formulario ANTES de validación');
  console.log('formData completo:', JSON.parse(JSON.stringify(formData)));
  console.log('selectedAro:', selectedAro ? selectedAro._id : 'null (modo creación)');
  console.log('Modo:', selectedAro ? '📝 EDICIÓN' : '➕ CREACIÓN');
  
  console.log('\n✔ PASO 2: Validando formulario...');
  if (!validateForm()) {
    console.error('  Validación FALLÓ. Errores:', errors);
    showAlert('error', 'Por favor, corrige los errores del formulario.');
    return;
  }
  console.log('✅ Validación exitosa');

  console.log('\n🔧 PASO 3: Construyendo FormData...');
  const dataToSend = new FormData();
  
  // 🔥 VALIDACIÓN CRÍTICA: Asegurarse de que sucursales existe
  if (!formData.sucursales || !Array.isArray(formData.sucursales)) {
    console.error('  ERROR: formData.sucursales no es un array válido:', formData.sucursales);
    showAlert('error', 'Error: Debe seleccionar al menos una sucursal');
    return;
  }
  
  // Campos básicos
  dataToSend.append('nombre', formData.nombre);
  dataToSend.append('descripcion', formData.descripcion);
  dataToSend.append('categoriaId', formData.categoriaId);
  dataToSend.append('marcaId', formData.marcaId);
  dataToSend.append('material', formData.material);
  dataToSend.append('color', formData.color);
  dataToSend.append('tipoLente', formData.tipoLente);
  dataToSend.append('precioBase', Number(formData.precioBase));
  dataToSend.append('precioActual', formData.enPromocion ? Number(formData.precioActual) : Number(formData.precioBase));
  dataToSend.append('linea', formData.linea || '');
  dataToSend.append('fechaCreacion', formData.fechaCreacion || new Date().toISOString().split('T')[0]);
  dataToSend.append('enPromocion', Boolean(formData.enPromocion));
  
  // Agregar promocionId solo si está en promoción
  if (formData.enPromocion && formData.promocionId) {
    dataToSend.append('promocionId', formData.promocionId);
    console.log('🎯 Promoción agregada:', formData.promocionId);
  }
  
  // ✅ Medidas como JSON string (el backend lo parsea)
  const medidasJSON = JSON.stringify({
    anchoPuente: Number(formData.medidas?.anchoPuente) || 0,
    altura: Number(formData.medidas?.altura) || 0,
    ancho: Number(formData.medidas?.ancho) || 0
  });
  dataToSend.append('medidas', medidasJSON);
  console.log('📏 Medidas JSON:', medidasJSON);
  
  // ✅ Imágenes como JSON string (son URLs de Cloudinary)
  const imagenesJSON = JSON.stringify(formData.imagenes || []);
  dataToSend.append('imagenes', imagenesJSON);
  console.log('🖼️ Imágenes JSON:', imagenesJSON);
  console.log('🖼️ Cantidad de imágenes:', formData.imagenes?.length);
  
  // ✅ Sucursales como JSON string (CRÍTICO: el backend parsea esto)
  const sucursalesData = formData.sucursales.map(s => ({
    sucursalId: s.sucursalId,
    nombreSucursal: s.nombreSucursal || '',
    stock: Number(s.stock) || 0
  }));
  const sucursalesJSON = JSON.stringify(sucursalesData);
  dataToSend.append('sucursales', sucursalesJSON);
  console.log('🏪 Sucursales JSON:', sucursalesJSON);
  console.log('🏪 Sucursales count:', sucursalesData.length);

  console.log('\n📦 FormData completo:');
  for (let [key, value] of dataToSend.entries()) {
    const displayValue = typeof value === 'string' && value.length > 100 
      ? value.substring(0, 100) + '...' 
      : value;
    console.log(`  ${key}:`, displayValue);
  }

  try {
    console.log('\n🌐 URL base:', API_URL);
    
    if (selectedAro) {
      console.log('\n╔═══════════════════════════════════════════╗');
      console.log('║   📝 MODO ACTUALIZACIÓN (PUT)             ║');
      console.log('╚═══════════════════════════════════════════╝');
      
      const updateUrl = `${API_URL}/${selectedAro._id}`;
      console.log('🔑 ID del aro:', selectedAro._id);
      console.log('🌐 URL de actualización:', updateUrl);
      
      console.log('\n📡 Enviando PUT request...');
      await axios.put(updateUrl, dataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('✅ PUT exitoso!');
      showAlert('success', 'Aro actualizado exitosamente');
      
    } else {
      console.log('\n╔═══════════════════════════════════════════╗');
      console.log('║   ➕ MODO CREACIÓN (POST)                 ║');
      console.log('╚═══════════════════════════════════════════╝');
      
      console.log('🌐 URL de creación:', API_URL);
      
      console.log('\n📡 Enviando POST request...');
      await axios.post(API_URL, dataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('✅ POST exitoso!');
      showAlert('success', 'Aro creado exitosamente');
    }
    
    console.log('\n🔄 Recargando datos...');
    await fetchAros();
    console.log('✅ Datos recargados');
    
    console.log('\n🚪 Cerrando modales...');
    handleCloseModals();
    
    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║   ✅ SUBMIT COMPLETADO EXITOSAMENTE    ║');
    console.log('╚═══════════════════════════════════════╝\n');
    
  } catch (error) {
    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║     ERROR EN EL SUBMIT                ║');
    console.log('╚═══════════════════════════════════════╝');
    
    console.error('\n🔥 Error completo:', error);
    console.error('\n🔶 Error name:', error.name);
    console.error('🔶 Error message:', error.message);
    console.error('🔶 Error code:', error.code);
    
    if (error.response) {
      console.error('\n📡 RESPUESTA DEL SERVIDOR (error.response):');
      console.error('  Status:', error.response.status);
      console.error('  Status Text:', error.response.statusText);
      console.error('  Headers:', error.response.headers);
      console.error('  Data:', error.response.data);
      
      if (error.response.data) {
        console.error('\n📝 Detalles del error del servidor:');
        console.error('  Message:', error.response.data.message);
        console.error('  Error:', error.response.data.error);
        console.error('  Details:', error.response.data.details);
        console.error('  Stack:', error.response.data.stack);
      }
    } else if (error.request) {
      console.error('\n📡 REQUEST ENVIADO (error.request):');
      console.error('  Request:', error.request);
      console.error('  No se recibió respuesta del servidor');
    } else {
      console.error('\n⚠️ Error al configurar la request:', error.message);
    }
    
    console.error('\n🔧 Config de la request:', error.config);
    
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
    console.error('\n💬 Mensaje de error final:', errorMessage);
    
    showAlert('error', `Error al guardar el aro: ${errorMessage}`);
    
    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║     FIN DEL ERROR LOGGING             ║');
    console.log('╚═══════════════════════════════════════╝\n');
  }
};

  const handleDelete = async () => {
    if (!selectedAro) return;
    
    try {
      await axios.delete(`${API_URL}/${selectedAro._id}`);
      showAlert('success', 'Aro eliminado exitosamente');
      await fetchAros();
      handleCloseModals();
    } catch (error) {
      console.error("Error deleting aro:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      showAlert('error', `Error al eliminar el aro: ${errorMessage}`);
    }
  };

  const arosArr = Array.isArray(aros) ? aros : [];
  const totalAros = arosArr.length;
  const arosEnPromocion = arosArr.filter(a => a.enPromocion).length;
  const stockTotal = arosArr.reduce((total, aro) => total + getTotalStock(aro), 0);
  const valorInventario = arosArr.reduce((sum, a) => sum + ((a.precioActual || a.precioBase || 0) * getTotalStock(a)), 0);

  const stats = [
    { title: "Total Aros", value: totalAros, Icon: Glasses, color: "cyan" },
    { title: "En Promoción", value: arosEnPromocion, Icon: Tags, color: "cyan" },
    { title: "Stock Total", value: stockTotal, Icon: Package, color: "cyan" },
    { title: "Valor Inventario", value: valorInventario.toLocaleString('es-SV', { style: 'currency', currency: 'USD' }), Icon: DollarSign, color: "cyan" }
  ];

  const renderRow = useCallback((aro) => {
    const stockTotal = getTotalStock(aro);
    const tieneStock = stockTotal > 0;
    
    return (
      <>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12">
              {aro.imagenes && aro.imagenes.length > 0 ? (
                <img 
                  src={aro.imagenes[0]} 
                  alt={aro.nombre}
                  className="w-12 h-12 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Glasses className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{aro.nombre}</p>
              <p className="text-sm text-gray-500 truncate">{aro.descripcion}</p>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Tags className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-900 truncate">{aro.marcaId?.nombre || 'Sin marca'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-500 truncate">{aro.categoriaId?.nombre || 'Sin categoría'}</span>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{aro.color}</span>
            </div>
            <div className="text-gray-500 truncate">{aro.material}</div>
            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">{aro.tipoLente}</div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            {aro.enPromocion ? (
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-green-600">${(aro.precioActual || 0).toFixed(2)}</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">OFERTA</span>
                </div>
                <div className="text-sm text-gray-500 line-through">${(aro.precioBase || 0).toFixed(2)}</div>
              </div>
            ) : (
              <span className="text-lg font-semibold text-gray-900">${(aro.precioBase || 0).toFixed(2)}</span>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className={`text-sm font-medium ${tieneStock ? 'text-green-600' : 'text-red-600'}`}>
              {stockTotal} unidades
            </div>
            <div className="text-xs text-gray-500">en {aro.sucursales?.length || 0} sucursal(es)</div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="flex flex-col space-y-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              aro.enPromocion ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {aro.enPromocion ? '🏷 Promoción' : 'Precio normal'}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              tieneStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {tieneStock ? '✓ Disponible' : '⏱ Sin stock'}
            </span>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="flex space-x-1">
            <button 
              onClick={() => handleOpenDeleteModal(aro)} 
              className="p-1.5 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" 
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleOpenDetailModal(aro)} 
              className="p-1.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" 
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleOpenEditModal(aro)} 
              className="p-1.5 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" 
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </td>
      </>
    );
  }, [getTotalStock, handleOpenDeleteModal, handleOpenDetailModal, handleOpenEditModal]);

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
      <Alert alert={alert} />
      
      <div className="w-full flex justify-center">
        <div className="w-full max-w-none">
          <StatsGrid stats={stats} />
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <PageHeader 
          title="Gestión de Aros" 
          buttonLabel="Agregar Aro" 
          onButtonClick={handleOpenAddModal} 
        />
        
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, marca, material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown);
                    setShowFiltersPanel(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                      filters.tipoLente !== 'todos' && 1,
                      filters.precioMin && 1,
                      filters.precioMax && 1
                    ].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredAndSortedAros.length} aro{filteredAndSortedAros.length !== 1 ? 's' : ''} 
              {hasActiveFilters() && ` (filtrado${filteredAndSortedAros.length !== 1 ? 's' : ''} de ${aros.length})`}
            </span>
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="text-cyan-600 hover:text-cyan-800 font-medium flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>
        </div>

        {showFiltersPanel && (
          <div className="border-b bg-white">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
                <button
                  onClick={() => setShowFiltersPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                  <select
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Promoción</label>
                  <select
                    value={filters.enPromocion}
                    onChange={(e) => handleFilterChange('enPromocion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="todos">Todos</option>
                    <option value="con_promocion">Con promoción</option>
                    <option value="sin_promocion">Sin promoción</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <select
                    value={filters.stock}
                    onChange={(e) => handleFilterChange('stock', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="todos">Todos</option>
                    <option value="con_stock">Con stock</option>
                    <option value="sin_stock">Sin stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                  <select
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <select
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Lente</label>
                  <select
                    value={filters.tipoLente}
                    onChange={(e) => handleFilterChange('tipoLente', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="todos">Todos los tipos</option>
                    {uniqueTiposLente.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                <div>
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
                    />
                    <input
                      type="number"
                      placeholder="Max $"
                      value={filters.precioMax}
                      onChange={(e) => handleFilterChange('precioMax', e.target.value)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

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
        
        <div className="overflow-x-auto">
          <div style={{ minWidth: '1200px' }}>
            <DataTable
              columns={TABLE_COLUMNS}
              data={currentAros}
              renderRow={renderRow}
              isLoading={false}
              noDataMessage="No se encontraron aros"
              noDataSubMessage={hasActiveFilters() ? 'Intenta ajustar los filtros de búsqueda' : 'Aún no hay aros registrados'}
            />
          </div>
        </div>
        
        <Pagination {...paginationProps} />
      </div>

      <ArosFormModal
        isOpen={showAddEditModal}
        onClose={handleCloseModals}
        onSubmit={handleFormSubmit}
        title={selectedAro ? "Editar Aro" : "Agregar Nuevo Aro"}
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        errors={errors}
        isEditing={!!selectedAro}
        marcas={marcas}
        categorias={categorias}
        sucursales={sucursales}
        promociones={promociones}
        selectedLente={selectedAro}
      />

      <DetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModals}
        title="Detalles del Aro"
        item={selectedAro}
        data={selectedAro ? [
          { label: "Nombre", value: selectedAro.nombre },
          { label: "Descripción", value: selectedAro.descripcion },
          { label: "Categoría", value: selectedAro.categoriaId?.nombre || 'Sin categoría' },
          { label: "Marca", value: selectedAro.marcaId?.nombre || 'Sin marca' },
          { label: "Línea", value: selectedAro.linea || 'N/A' },
          { label: "Material", value: selectedAro.material },
          { label: "Color", value: selectedAro.color },
          { label: "Tipo de Lente", value: selectedAro.tipoLente },
          { label: "Medidas", value: `Ancho: ${selectedAro.medidas?.ancho || 'N/A'} | Altura: ${selectedAro.medidas?.altura || 'N/A'} | Puente: ${selectedAro.medidas?.anchoPuente || 'N/A'}` },
          { label: "Precio Base", value: `${(selectedAro.precioBase || 0).toFixed(2)}` },
          { 
            label: "Precio Actual", 
            value: `${(selectedAro.precioActual || selectedAro.precioBase || 0).toFixed(2)}`,
            color: selectedAro.enPromocion ? 'text-green-600' : 'text-gray-900'
          },
          { 
            label: "Estado", 
            value: selectedAro.enPromocion ? 'En Promoción' : 'Precio Normal',
            color: selectedAro.enPromocion ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
          },
          ...(selectedAro.enPromocion && selectedAro.promocionId ? [{
            label: "Promoción Aplicada",
            value: selectedAro.promocionId?.nombre || 'Promoción sin nombre',
            color: 'text-orange-600'
          }] : []),
          { 
            label: "Stock Total", 
            value: `${getTotalStock(selectedAro)} unidades`
          },
          { 
            label: "Disponibilidad por Sucursal", 
            value: selectedAro.sucursales?.map(s => 
              `${s.nombreSucursal || s.sucursalId?.nombre}: ${s.stock || 0} unidades`
            ).join(' | ') || 'Sin stock'
          },
          { label: "Imágenes", value: `${selectedAro.imagenes?.length || 0} imagen(es)` },
          { label: "Fecha de Creación", value: selectedAro.createdAt ? new Date(selectedAro.createdAt).toLocaleDateString('es-ES') : 'N/A' }
        ] : []}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseModals}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el aro "${selectedAro?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        type="danger"
      />

      {showSortDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowSortDropdown(false)}
        />
      )}
    </div>
  );
};

export default ArosContent;