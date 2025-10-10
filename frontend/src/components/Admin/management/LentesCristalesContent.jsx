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
import LentesCristalesFormModal from '../management/LentesCristalesFormModal';

// Iconos
import { 
  Search, Plus, Trash2, Eye, Edit, Filter, X, ChevronDown, SortAsc, SortDesc, 
  CheckCircle, RefreshCcw, Zap, Package, TrendingUp, DollarSign, Layers,
  Palette, Ruler, Shield
} from 'lucide-react';

const ITEMS_PER_PAGE = 12;

const INITIAL_FILTERS = {
  tipo: 'todos',
  material: 'todos',
  tratamiento: 'todos',
  color: 'todos',
  stock: 'todos',
  precioMin: '',
  precioMax: ''
};

const SORT_OPTIONS = [
  { value: 'fechaCreacion-desc', label: 'Más Recientes Primero', icon: Package },
  { value: 'fechaCreacion-asc', label: 'Más Antiguos Primero', icon: Package },
  { value: 'nombre-asc', label: 'Nombre A-Z', icon: Layers },
  { value: 'nombre-desc', label: 'Nombre Z-A', icon: Layers },
  { value: 'precio-desc', label: 'Precio: Mayor a Menor', icon: DollarSign },
  { value: 'precio-asc', label: 'Precio: Menor a Mayor', icon: DollarSign },
  { value: 'stock-desc', label: 'Mayor Stock', icon: Package },
  { value: 'stock-asc', label: 'Menor Stock', icon: Package },
];

const TABLE_COLUMNS = [
  { header: 'Producto', key: 'producto' },
  { header: 'Material/Índice', key: 'material' },
  { header: 'Marca/Protecciones', key: 'marca' },
  { header: 'Precio', key: 'precio' },
  { header: 'Categoría', key: 'categoria' },
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="h-10 bg-gray-200 rounded-lg w-full max-w-md"></div>
          <div className="flex space-x-3">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
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
                  {Array.from({ length: 7 }, (_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
));

const LentesCristalesContent = () => {
  const [cristales, setCristales] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCristal, setSelectedCristal] = useState(null);
  const [alert, setAlert] = useState(null);

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('fechaCreacion');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const initialFormData = {
    nombre: '',
    descripcion: '',
    tipo: '',
    material: '',
    indiceRefraccion: '',
    tratamiento: '',
    color: '',
    diametro: '',
    esferico: '',
    cilindrico: '',
    precio: 0,
    stock: 0,
    sucursales: [],
    fechaCreacion: new Date().toISOString().split('T')[0],
  };

  const { formData, setFormData, handleInputChange, resetForm, validateForm, errors, setErrors } = useForm(
    initialFormData,
    (data) => {
      const newErrors = {};
      
      if (!data.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
      if (!data.descripcion?.trim()) newErrors.descripcion = 'La descripción es requerida';
      if (!data.tipo?.trim()) newErrors.tipo = 'El tipo es requerido';
      if (!data.material?.trim()) newErrors.material = 'El material es requerido';
      if (!data.indiceRefraccion) newErrors.indiceRefraccion = 'El índice de refracción es requerido';
      if (!data.tratamiento?.trim()) newErrors.tratamiento = 'El tratamiento es requerido';
      if (!data.color?.trim()) newErrors.color = 'El color es requerido';
      if (!data.diametro || data.diametro <= 0) newErrors.diametro = 'El diámetro debe ser mayor a 0';
      if (!data.esferico) newErrors.esferico = 'El valor esférico es requerido';
      if (!data.cilindrico) newErrors.cilindrico = 'El valor cilíndrico es requerido';
      if (!data.precio || data.precio <= 0) newErrors.precio = 'El precio debe ser mayor a 0';
      if (data.stock < 0) newErrors.stock = 'El stock no puede ser negativo';
      if (!data.sucursales || data.sucursales.length === 0) {
        newErrors.sucursales = 'Debe seleccionar al menos una sucursal';
      }

      return newErrors;
    }
  );

  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
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
        case 'precio':
          valueA = parseFloat(a.precio) || 0;
          valueB = parseFloat(b.precio) || 0;
          break;
        case 'stock':
          valueA = a.stock || 0;
          valueB = b.stock || 0;
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
  }, [sortBy, sortOrder]);

  const applyAdvancedFilters = useCallback((cristal) => {
    if (filters.tipo !== 'todos' && cristal.tipo?.toLowerCase() !== filters.tipo.toLowerCase()) {
      return false;
    }
    if (filters.material !== 'todos' && cristal.material?.toLowerCase() !== filters.material.toLowerCase()) {
      return false;
    }
    if (filters.tratamiento !== 'todos' && cristal.tratamiento?.toLowerCase() !== filters.tratamiento.toLowerCase()) {
      return false;
    }
    if (filters.color !== 'todos' && cristal.color?.toLowerCase() !== filters.color.toLowerCase()) {
      return false;
    }
    if (filters.stock === 'con_stock' && (!cristal.stock || cristal.stock <= 0)) {
      return false;
    }
    if (filters.stock === 'sin_stock' && cristal.stock > 0) {
      return false;
    }
    if (filters.precioMin && parseFloat(cristal.precio || 0) < parseFloat(filters.precioMin)) {
      return false;
    }
    if (filters.precioMax && parseFloat(cristal.precio || 0) > parseFloat(filters.precioMax)) {
      return false;
    }
    return true;
  }, [filters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const base = API_CONFIG.BASE_URL;
      const [cristalesRes, marcasRes, categoriasRes] = await Promise.all([
        axios.get(`${base}/lentes-cristales`),
        axios.get(`${base}/marcas`),
        axios.get(`${base}/categoria`),
      ]);
      
      const cristalesData = Array.isArray(cristalesRes.data?.data) 
        ? cristalesRes.data.data 
        : (Array.isArray(cristalesRes.data) ? cristalesRes.data : []);
      
      setCristales(cristalesData);
      setMarcas(Array.isArray(marcasRes.data?.data) ? marcasRes.data.data : (marcasRes.data || []));
      setCategorias(Array.isArray(categoriasRes.data?.data) ? categoriasRes.data.data : (categoriasRes.data || []));
      
    } catch (error) {
      showAlert('error', 'Error al cargar los datos: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAndSortedCristales = useMemo(() => {
    let currentCristales = Array.isArray(cristales) ? cristales : [];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      currentCristales = currentCristales.filter(
        (cristal) =>
          cristal.nombre?.toLowerCase().includes(searchLower) ||
          cristal.descripcion?.toLowerCase().includes(searchLower) ||
          cristal.material?.toLowerCase().includes(searchLower) ||
          cristal.color?.toLowerCase().includes(searchLower) ||
          cristal.tipo?.toLowerCase().includes(searchLower) ||
          cristal.tratamiento?.toLowerCase().includes(searchLower)
      );
    }

    currentCristales = currentCristales.filter(applyAdvancedFilters);
    return sortData(currentCristales);
  }, [cristales, searchTerm, applyAdvancedFilters, sortData]);

  const { paginatedData: currentCristales, ...paginationProps } = usePagination(filteredAndSortedCristales, ITEMS_PER_PAGE);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setSearchTerm('');
  }, []);

  const hasActiveFilters = useCallback(() => {
    return searchTerm || 
           filters.tipo !== 'todos' || 
           filters.material !== 'todos' || 
           filters.tratamiento !== 'todos' || 
           filters.color !== 'todos' || 
           filters.stock !== 'todos' || 
           filters.precioMin || 
           filters.precioMax;
  }, [searchTerm, filters]);

  const uniqueTipos = useMemo(() => {
    const tipos = cristales.map(c => c.tipo).filter(Boolean).filter((t, i, arr) => arr.indexOf(t) === i);
    return tipos.sort();
  }, [cristales]);

  const uniqueMateriales = useMemo(() => {
    const materiales = cristales.map(c => c.material).filter(Boolean).filter((m, i, arr) => arr.indexOf(m) === i);
    return materiales.sort();
  }, [cristales]);

  const uniqueTratamientos = useMemo(() => {
    const tratamientos = cristales.map(c => c.tratamiento).filter(Boolean).filter((t, i, arr) => arr.indexOf(t) === i);
    return tratamientos.sort();
  }, [cristales]);

  const uniqueColores = useMemo(() => {
    const colores = cristales.map(c => c.color).filter(Boolean).filter((c, i, arr) => arr.indexOf(c) === i);
    return colores.sort();
  }, [cristales]);

  const handleCloseModals = useCallback(() => {
    setShowAddEditModal(false);
    setShowDetailModal(false);
    setShowDeleteModal(false);
    setSelectedCristal(null);
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setSelectedCristal(null);
    setShowAddEditModal(true);
  }, []);

  const handleOpenEditModal = useCallback((cristal) => {
    setSelectedCristal(cristal);
    setShowAddEditModal(true);
  }, []);

  const handleOpenDetailModal = useCallback((cristal) => {
    setSelectedCristal(cristal);
    setShowDetailModal(true);
  }, []);

  const handleOpenDeleteModal = useCallback((cristal) => {
    setSelectedCristal(cristal);
    setShowDeleteModal(true);
  }, []);

  const handleFormSubmit = async ({ form, files }) => {
    try {
      setLoading(true);
      const base = API_CONFIG.BASE_URL;
      const fd = new FormData();
      
      // Campos básicos
      fd.append('nombre', form.nombre || '');
      fd.append('descripcion', form.descripcion || '');
      if (form.categoriaId) fd.append('categoriaId', form.categoriaId);
      if (form.marcaId) fd.append('marcaId', form.marcaId);
      if (form.material) fd.append('material', form.material);
      if (form.indice) fd.append('indice', form.indice);
      if (form.vision) fd.append('vision', form.vision);
      if (Array.isArray(form.protecciones)) {
        form.protecciones.forEach(p => fd.append('protecciones', p));
      }
      
      // Precios
      if (form.precioBase !== undefined) fd.append('precioBase', String(form.precioBase));
      const enPromo = !!form.enPromocion;
      fd.append('enPromocion', String(enPromo));
      if (enPromo && form.precioActual !== undefined) fd.append('precioActual', String(form.precioActual));
      if (enPromo && form.promocionId) fd.append('promocionId', form.promocionId);
      
      // Imágenes existentes
      if (Array.isArray(form.imagenes) && form.imagenes.length > 0) {
        form.imagenes.forEach((url) => {
          if (typeof url === 'string' && url.trim()) fd.append('imagenes', url.trim());
        });
      }
      
      // Nuevos archivos
      (files || []).slice(0, 5).forEach(f => fd.append('imagenes', f));

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      
      if (selectedCristal && selectedCristal._id) {
        await axios.put(`${base}/lentes-cristales/${selectedCristal._id}`, fd, config);
        showAlert('success', 'Cristal actualizado exitosamente');
      } else {
        await axios.post(`${base}/lentes-cristales`, fd, config);
        showAlert('success', 'Cristal creado exitosamente');
      }
      
      await fetchData();
      handleCloseModals();
    } catch (error) {
      showAlert('error', 'Error al guardar: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCristal) return;
    
    try {
      const base = API_CONFIG.BASE_URL;
      await axios.delete(`${base}/lentes-cristales/${selectedCristal._id}`);
      showAlert('success', 'Cristal eliminado exitosamente');
      fetchData();
      handleCloseModals();
    } catch (error) {
      showAlert('error', 'Error al eliminar el cristal: ' + (error.response?.data?.message || error.message));
    }
  };

  const cristalesArr = Array.isArray(cristales) ? cristales : [];
  const totalCristales = cristalesArr.length;
  const cristalesEnPromocion = cristalesArr.filter(c => c.enPromocion).length;
  const precioPromedio = totalCristales > 0 
    ? cristalesArr.reduce((sum, c) => sum + ((c.enPromocion ? c.precioActual : c.precioBase) || 0), 0) / totalCristales 
    : 0;

  const stats = [
    { title: "Total de Cristales", value: totalCristales, Icon: Layers, color: "cyan" },
    { title: "En Promoción", value: cristalesEnPromocion, Icon: TrendingUp, color: "cyan" },
    { title: "Precio Promedio", value: precioPromedio.toLocaleString('es-SV', { style: 'currency', currency: 'USD' }), Icon: DollarSign, color: "cyan" },
    { title: "Catálogo Activo", value: `${totalCristales} items`, Icon: Package, color: "cyan" },
  ];

  const renderRow = useCallback((cristal) => {
    return (
      <>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border overflow-hidden">
                {(Array.isArray(cristal.imagenes) && cristal.imagenes[0]) ? (
                  <img
                    src={typeof cristal.imagenes[0] === 'string' ? cristal.imagenes[0] : (cristal.imagenes[0]?.secure_url || cristal.imagenes[0]?.url || '')}
                    alt={cristal.nombre}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Layers className="w-6 h-6 text-cyan-600" />
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{cristal.nombre}</p>
              <p className="text-sm text-gray-500 truncate">{cristal.descripcion}</p>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Ruler className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-900">{cristal.material} / {cristal.indice}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Visión: {cristal.vision || 'N/A'}</span>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-900">{cristal.marcaId?.nombre || 'Sin marca'}</span>
            </div>
            {cristal.protecciones && cristal.protecciones.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {cristal.protecciones.slice(0, 2).map((p, i) => (
                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                    {p}
                  </span>
                ))}
                {cristal.protecciones.length > 2 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{cristal.protecciones.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            {cristal.enPromocion ? (
              <>
                <div className="text-lg font-bold text-green-600">
                  ${(cristal.precioActual || 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 line-through">
                  ${(cristal.precioBase || 0).toFixed(2)}
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  OFERTA
                </span>
              </>
            ) : (
              <div className="text-lg font-semibold text-gray-900">
                ${(cristal.precioBase || 0).toFixed(2)}
              </div>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="text-sm text-gray-900">
            {cristal.categoriaId?.nombre || 'Sin categoría'}
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              cristal.enPromocion ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {cristal.enPromocion ? '🔥 Promoción' : 'Precio normal'}
            </span>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="flex space-x-1">
            <button onClick={() => handleOpenDeleteModal(cristal)} className="p-1.5 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" title="Eliminar">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={() => handleOpenDetailModal(cristal)} className="p-1.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" title="Ver detalles">
              <Eye className="w-4 h-4" />
            </button>
            <button onClick={() => handleOpenEditModal(cristal)} className="p-1.5 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" title="Editar">
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </td>
      </>
    );
  }, [handleOpenDetailModal, handleOpenEditModal, handleOpenDeleteModal]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      
      <div className="w-full flex justify-center">
        <div className="w-full max-w-none">
          <StatsGrid stats={stats} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <PageHeader 
          title="Gestión de Cristales para Lentes" 
          buttonLabel="Agregar Cristal" 
          onButtonClick={handleOpenAddModal} 
        />

        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar cristales..."
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
                      filters.tipo !== 'todos' && 1,
                      filters.material !== 'todos' && 1,
                      filters.tratamiento !== 'todos' && 1,
                      filters.color !== 'todos' && 1,
                      filters.stock !== 'todos' && 1,
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
              {filteredAndSortedCristales.length} cristal{filteredAndSortedCristales.length !== 1 ? 'es' : ''} 
              {hasActiveFilters() && ` (filtrado${filteredAndSortedCristales.length !== 1 ? 's' : ''} de ${cristales.length})`}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={filters.tipo}
                    onChange={(e) => handleFilterChange('tipo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="todos">Todos los tipos</option>
                    {uniqueTipos.map((tipo) => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
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
                    {uniqueMateriales.map((material) => (
                      <option key={material} value={material}>{material}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tratamiento</label>
                  <select
                    value={filters.tratamiento}
                    onChange={(e) => handleFilterChange('tratamiento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="todos">Todos los tratamientos</option>
                    {uniqueTratamientos.map((tratamiento) => (
                      <option key={tratamiento} value={tratamiento}>{tratamiento}</option>
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
                    {uniqueColores.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
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
                    <option value="con_stock">Con Stock</option>
                    <option value="sin_stock">Sin Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio Mínimo</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={filters.precioMin}
                    onChange={(e) => handleFilterChange('precioMin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio Máximo</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={filters.precioMax}
                    onChange={(e) => handleFilterChange('precioMax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
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
              data={currentCristales}
              renderRow={renderRow}
              isLoading={false}
              noDataMessage="No se encontraron cristales"
              noDataSubMessage={hasActiveFilters() ? 'Intenta ajustar los filtros de búsqueda' : 'Aún no hay cristales registrados'}
            />
          </div>
        </div>
        
        <Pagination {...paginationProps} />
      </div>

      {showAddEditModal && (
        <LentesCristalesFormModal
          open={showAddEditModal}
          onClose={handleCloseModals}
          onSubmit={handleFormSubmit}
          initialData={selectedCristal}
          marcas={marcas}
          categorias={categorias}
        />
      )}

      {showDetailModal && selectedCristal && (
        <DetailModal
          isOpen={showDetailModal}
          onClose={handleCloseModals}
          title="Detalles del Cristal"
          data={selectedCristal}
          fields={[
            { label: 'Nombre', key: 'nombre' },
            { label: 'Descripción', key: 'descripcion' },
            { label: 'Tipo', key: 'tipo' },
            { label: 'Material', key: 'material' },
            { label: 'Índice de Refracción', key: 'indiceRefraccion' },
            { label: 'Tratamiento', key: 'tratamiento' },
            { label: 'Color', key: 'color' },
            { label: 'Diámetro', key: 'diametro', suffix: 'mm' },
            { label: 'Esférico', key: 'esferico' },
            { label: 'Cilíndrico', key: 'cilindrico' },
            { label: 'Precio', key: 'precio', type: 'currency' },
            { label: 'Stock', key: 'stock' },
            { label: 'Fecha de Creación', key: 'fechaCreacion', type: 'date' },
          ]}
        />
      )}

      {showDeleteModal && selectedCristal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleCloseModals}
          onConfirm={handleDelete}
          title="Eliminar Cristal"
          message={`¿Estás seguro de que deseas eliminar el cristal "${selectedCristal.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
        />
      )}

      {showSortDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowSortDropdown(false)}
        />
      )}
    </div>
  );
};

export default LentesCristalesContent;