import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../config/api';
import { 
  Search, Plus, Trash2, Eye, Edit, Tag, Calendar, Percent, CheckCircle, 
  Image as ImageIcon, Star, Users, Camera, Upload, Filter, X, 
  ChevronDown, SortAsc, SortDesc,
} from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import Alert from '../ui/Alert';
import FormModal from '../ui/FormModal';
import DetailModal from '../ui/DetailModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import PromocionesFormModal from '../management/employees/PromocionesFormModal';

// Helpers
const withBase = (path, base = API_CONFIG.BASE_URL) => `${base}${path}`;

// Ensure cookies (HTTP-only JWT) are sent with requests
axios.defaults.withCredentials = true;

// Estados iniciales para filtros
const INITIAL_FILTERS = {
  estado: 'todas',
  tipoDescuento: 'todos',
  aplicaA: 'todos',
  fechaDesde: '',
  fechaHasta: '',
  mostrarEnCarrusel: 'todos',
  valorMin: '',
  valorMax: ''
};

// Opciones de ordenamiento
const SORT_OPTIONS = [
  { value: 'fechaCreacion-desc', label: 'Más Recientes Primero', icon: Calendar },
  { value: 'fechaCreacion-asc', label: 'Más Antiguos Primero', icon: Calendar },
  { value: 'nombre-asc', label: 'Nombre A-Z', icon: Tag },
  { value: 'nombre-desc', label: 'Nombre Z-A', icon: Tag },
  { value: 'prioridad-desc', label: 'Prioridad: Mayor a Menor', icon: Star },
  { value: 'prioridad-asc', label: 'Prioridad: Menor a Mayor', icon: Star },
  { value: 'valorDescuento-desc', label: 'Valor: Mayor a Menor', icon: Percent },
  { value: 'valorDescuento-asc', label: 'Valor: Menor a Mayor', icon: Percent },
];

// --- COMPONENTE SKELETON LOADER MEMOIZADO ---
const SkeletonLoader = React.memo(() => (
  <div className="animate-pulse">
    {/* Skeleton para las estadísticas */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Skeleton para la tabla */}
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-cyan-500 p-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-cyan-400 rounded w-56"></div>
          <div className="h-10 bg-cyan-400 rounded w-40"></div>
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-b">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="h-10 bg-gray-200 rounded-lg w-full md:flex-1"></div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-cyan-500">
            <tr>
              {['Imagen', 'Nombre', 'Descripción', 'Tipo', 'Valor', 'Vigencia', 'Prioridad', 'Usos', 'Estado', 'Acciones'].map((header, index) => (
                <th key={index} className="px-6 py-4">
                  <div className="h-4 bg-cyan-400 rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 5 }, (_, rowIndex) => (
              <tr key={rowIndex}>
                <td className="px-6 py-4">
                  <div className="w-16 h-12 bg-gray-200 rounded-lg"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded w-8"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
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

      <div className="mt-4 flex flex-col items-center gap-4 pb-6">
        <div className="flex items-center gap-2">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="w-12 h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
));

// Componente para subir imagen de promoción
const PromocionImageUpload = ({ currentImage, onImageChange, promocionName = '' }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleOpenWidget = () => {
    if (!window.cloudinary) {
      alert('Error: Cloudinary no está disponible. Recarga la página.');
      return;
    }

    const widget = window.cloudinary.createUploadWidget({
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      sources: ['local', 'url'],
      folder: "promociones",
      multiple: false,
      cropping: true,
      croppingAspectRatio: 16/9,
      maxImageFileSize: 10000000,
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      styles: {
        palette: {
          window: "#FFFFFF",
          windowBorder: "#0891B2",
          tabIcon: "#0891B2",
          link: "#0891B2",
          action: "#0891B2"
        }
      },
      text: {
        es: {
          "queue.title": "Subir Imagen de Promoción",
          "local.browse": "Seleccionar Archivo",
          "crop.title": "Recortar Imagen",
          "crop.crop_btn": "Recortar",
          "crop.cancel_btn": "Cancelar"
        }
      }
    }, (error, result) => {
      if (error) {
        console.error('Error en Cloudinary:', error);
        setIsUploading(false);
        return;
      }

      if (result && result.event === "upload-added") {
        setIsUploading(true);
      }

      if (result && result.event === "success") {
        const imageData = {
          url: result.info.secure_url,
          metadata: {
            publicId: result.info.public_id,
            width: result.info.width,
            height: result.info.height,
            format: result.info.format
          }
        };
        onImageChange(imageData);
        setIsUploading(false);
      }
    });

    widget.open();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Imagen de Promoción</label>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-cyan-500 transition-colors">
        {currentImage ? (
          <div className="relative">
            <img 
              src={currentImage} 
              alt={promocionName}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <button
              type="button"
              onClick={handleOpenWidget}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span>Cambiar Imagen</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <button
              type="button"
              onClick={handleOpenWidget}
              className="bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors mx-auto"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Subir Imagen</span>
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Recomendado: 1200x675px (16:9) para mejor visualización en el carrusel
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const PromocionesContent = () => {
  // --- ESTADOS PRINCIPALES ---
  const [promociones, setPromociones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // --- ESTADOS DE MODALES ---
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);

  // --- ESTADOS DE FILTROS Y ORDENAMIENTO ---
  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('fechaCreacion');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // --- PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Form state
  const initialForm = {
    nombre: '',
    descripcion: '',
    tipoDescuento: 'porcentaje',
    valorDescuento: 0,
    aplicaA: 'todos',
    categoriasAplicables: [],
    lentesAplicables: [],
    fechaInicio: '',
    fechaFin: '',
    codigoPromo: '',
    imagenPromocion: '',
    imagenMetadata: {},
    activo: true,
    prioridad: 0,
    mostrarEnCarrusel: true,
    limiteUsos: null,
  };
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  // --- FUNCIONES UTILITARIAS ---
  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
    const timer = setTimeout(() => setAlert(null), 5000);
    return () => clearTimeout(timer);
  }, []);

  const getEstadoPromo = useCallback((promo) => {
    const now = new Date();
    const ini = promo.fechaInicio ? new Date(promo.fechaInicio) : null;
    const fin = promo.fechaFin ? new Date(promo.fechaFin) : null;
    
    if (promo.activo === false) return 'Inactiva';
    if (promo.limiteUsos && promo.usos >= promo.limiteUsos) return 'Agotada';
    if (ini && now < ini) return 'Programada';
    if (fin && now > fin) return 'Expirada';
    return 'Activa';
  }, []);

  const getEstadoColor = useCallback((estado) => {
    switch (estado) {
      case 'Activa': return 'bg-green-100 text-green-800';
      case 'Expirada': return 'bg-red-100 text-red-800';
      case 'Programada': return 'bg-blue-100 text-blue-800';
      case 'Agotada': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getTipoIcono = useCallback((tipo) => {
    const t = (tipo || '').toString().toLowerCase();
    switch (t) {
      case 'porcentaje': return <Percent className="w-5 h-5 text-cyan-600" />;
      case 'monto': return <Tag className="w-5 h-5 text-purple-600" />;
      case '2x1': return <Tag className="w-5 h-5 text-orange-600" />;
      default: return null;
    }
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
          valueA = (a.nombre || '').toLowerCase();
          valueB = (b.nombre || '').toLowerCase();
          break;
        case 'prioridad':
          valueA = Number(a.prioridad) || 0;
          valueB = Number(b.prioridad) || 0;
          break;
        case 'valorDescuento':
          valueA = Number(a.valorDescuento) || 0;
          valueB = Number(b.valorDescuento) || 0;
          break;
        case 'fechaCreacion':
          valueA = new Date(a.createdAt || a.fechaInicio || 0);
          valueB = new Date(b.createdAt || b.fechaInicio || 0);
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortBy, sortOrder]);

  // --- FUNCIÓN PARA APLICAR FILTROS AVANZADOS ---
  const applyAdvancedFilters = useCallback((promo) => {
    const estado = getEstadoPromo(promo);

    // Filtro por estado
    if (filters.estado !== 'todas' && estado.toLowerCase() !== filters.estado) {
      return false;
    }

    // Filtro por tipo de descuento
    if (filters.tipoDescuento !== 'todos' && promo.tipoDescuento !== filters.tipoDescuento) {
      return false;
    }

    // Filtro por aplicabilidad
    if (filters.aplicaA !== 'todos' && promo.aplicaA !== filters.aplicaA) {
      return false;
    }

    // Filtro por valor de descuento
    if (filters.valorMin && Number(promo.valorDescuento) < Number(filters.valorMin)) {
      return false;
    }
    if (filters.valorMax && Number(promo.valorDescuento) > Number(filters.valorMax)) {
      return false;
    }

    // Filtro por mostrar en carrusel
    if (filters.mostrarEnCarrusel !== 'todos') {
      const enCarrusel = promo.mostrarEnCarrusel === true;
      if (filters.mostrarEnCarrusel === 'si' && !enCarrusel) return false;
      if (filters.mostrarEnCarrusel === 'no' && enCarrusel) return false;
    }

    // Filtro por fecha
    if (filters.fechaDesde) {
      const fechaDesde = new Date(filters.fechaDesde);
      const fechaPromo = new Date(promo.fechaInicio);
      if (fechaPromo < fechaDesde) return false;
    }
    if (filters.fechaHasta) {
      const fechaHasta = new Date(filters.fechaHasta);
      fechaHasta.setHours(23, 59, 59);
      const fechaPromo = new Date(promo.fechaFin || promo.fechaInicio);
      if (fechaPromo > fechaHasta) return false;
    }

    return true;
  }, [filters, getEstadoPromo]);

  // --- LÓGICA DE FILTRADO, ORDENAMIENTO Y PAGINACIÓN ---
  const filteredAndSortedPromociones = useMemo(() => {
    const filtered = promociones.filter(promo => {
      // Búsqueda por texto
      const search = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        (promo.nombre || '').toLowerCase().includes(search) ||
        (promo.descripcion || '').toLowerCase().includes(search) ||
        (promo.codigoPromo || '').toLowerCase().includes(search);
      
      // Filtros avanzados
      const matchesAdvancedFilters = applyAdvancedFilters(promo);
      
      return matchesSearch && matchesAdvancedFilters;
    });
    
    return sortData(filtered);
  }, [promociones, searchTerm, applyAdvancedFilters, sortData]);

  // --- FUNCIONES PARA MANEJAR FILTROS ---
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(0); // Reset página al filtrar
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setSearchTerm('');
    setCurrentPage(0);
  }, []);

  const hasActiveFilters = useCallback(() => {
    return searchTerm || 
           filters.estado !== 'todas' || 
           filters.tipoDescuento !== 'todos' || 
           filters.aplicaA !== 'todos' || 
           filters.mostrarEnCarrusel !== 'todos' ||
           filters.valorMin || 
           filters.valorMax || 
           filters.fechaDesde || 
           filters.fechaHasta;
  }, [searchTerm, filters]);

  // Paginación
  const totalPages = Math.ceil((filteredAndSortedPromociones.length || 0) / pageSize) || 1;
  const currentPromociones = filteredAndSortedPromociones.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const goToFirstPage = useCallback(() => setCurrentPage(0), []);
  const goToPreviousPage = useCallback(() => setCurrentPage(p => (p > 0 ? p - 1 : p)), []);
  const goToNextPage = useCallback(() => setCurrentPage(p => (p < totalPages - 1 ? p + 1 : p)), [totalPages]);
  const goToLastPage = useCallback(() => setCurrentPage(totalPages - 1), [totalPages]);

  // FUNCIÓN PARA OBTENER DATOS
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const promosRes = await axios.get(withBase(API_CONFIG.ENDPOINTS.PROMOCIONES));
      const catRes = await axios.get(withBase(API_CONFIG.ENDPOINTS.CATEGORIAS));
      const lentesRes = await axios.get(withBase(API_CONFIG.ENDPOINTS.LENTES));
      
      setPromociones(Array.isArray(promosRes.data) ? promosRes.data : []);
      setCategorias(Array.isArray(catRes.data) ? catRes.data : []);
      
      let lentesData = [];
      
      if (lentesRes.data && lentesRes.data.data && Array.isArray(lentesRes.data.data)) {
        lentesData = lentesRes.data.data;
      } else if (Array.isArray(lentesRes.data)) {
        lentesData = lentesRes.data;
      }
      
      let accesoriosData = [];
      try {
        const accesoriosRes = await axios.get(withBase(API_CONFIG.ENDPOINTS.ACCESORIOS));
        
        if (accesoriosRes.data && accesoriosRes.data.data && Array.isArray(accesoriosRes.data.data)) {
          accesoriosData = accesoriosRes.data.data;
        } else if (Array.isArray(accesoriosRes.data)) {
          accesoriosData = accesoriosRes.data;
        }
      } catch (accesoriosError) {
        console.warn('Endpoint de accesorios no disponible:', accesoriosError.message);
      }
      
      const todosLosProductos = [
        ...lentesData.map(lente => ({ ...lente, tipo: 'lente' })),
        ...accesoriosData.map(accesorio => ({ ...accesorio, tipo: 'accesorio' }))
      ];
      
      setProductos(todosLosProductos);
      
    } catch (err) {
      console.error('Error detallado cargando datos:', err.response || err);
      showAlert('error', 'Error cargando datos de promociones: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // Handlers
  const openAdd = useCallback(() => { 
    setSelectedPromo(null); 
    setFormData(initialForm); 
    setErrors({}); 
    setShowAddEditModal(true); 
  }, []);

  const openEdit = useCallback((promo) => {
    setSelectedPromo(promo);
    setFormData({
      nombre: promo.nombre || '',
      descripcion: promo.descripcion || '',
      tipoDescuento: (promo.tipoDescuento || 'porcentaje').toString().toLowerCase(),
      valorDescuento: Number(promo.valorDescuento || 0),
      aplicaA: (promo.aplicaA || 'todos').toString().toLowerCase(),
      categoriasAplicables: Array.isArray(promo.categoriasAplicables) ? 
        promo.categoriasAplicables.map(c => (c?._id || c)) : [],
      lentesAplicables: Array.isArray(promo.lentesAplicables) ? 
        promo.lentesAplicables.map(l => (l?._id || l)) : [],
      fechaInicio: promo.fechaInicio ? new Date(promo.fechaInicio).toISOString().slice(0,10) : '',
      fechaFin: promo.fechaFin ? new Date(promo.fechaFin).toISOString().slice(0,10) : '',
      codigoPromo: promo.codigoPromo || '',
      imagenPromocion: promo.imagenPromocion || '',
      imagenMetadata: promo.imagenMetadata || {},
      activo: promo.activo !== false,
      prioridad: promo.prioridad || 0,
      mostrarEnCarrusel: promo.mostrarEnCarrusel !== false,
      limiteUsos: promo.limiteUsos || null,
    });
    setErrors({});
    setShowAddEditModal(true);
  }, []);

  const openView = useCallback((promo) => { 
    setSelectedPromo(promo); 
    setShowDetailModal(true); 
  }, []);

  const openDelete = useCallback((promo) => { 
    setSelectedPromo(promo); 
    setShowDeleteModal(true); 
  }, []);

  const closeModals = useCallback(() => { 
    setShowAddEditModal(false); 
    setShowDetailModal(false); 
    setShowDeleteModal(false); 
    setSelectedPromo(null); 
    setErrors({}); 
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  }, []);

  const handleImageChange = useCallback((imageData) => {
    setFormData(prev => ({
      ...prev,
      imagenPromocion: imageData.url,
      imagenMetadata: imageData.metadata
    }));
  }, []);

  const validate = useCallback((data) => {
    const errs = {};
    if (!data.nombre?.trim()) errs.nombre = 'El nombre es obligatorio';
    if (!data.descripcion?.trim()) errs.descripcion = 'La descripción es obligatoria';
    if (!data.tipoDescuento) errs.tipoDescuento = 'Tipo de descuento requerido';
    if (!data.valorDescuento || Number(data.valorDescuento) <= 0) errs.valorDescuento = 'Debe ser > 0';
    if (!data.aplicaA) errs.aplicaA = 'Campo requerido';
    if (!data.fechaInicio) errs.fechaInicio = 'Fecha inicio requerida';
    if (!data.fechaFin) errs.fechaFin = 'Fecha fin requerida';
    if (!data.codigoPromo?.trim()) errs.codigoPromo = 'Código requerido';
    if (data.tipoDescuento === 'porcentaje' && Number(data.valorDescuento) > 100) 
      errs.valorDescuento = 'No puede ser > 100%';
    if (data.aplicaA === 'categoria' && (!data.categoriasAplicables || data.categoriasAplicables.length === 0)) 
      errs.categoriasAplicables = 'Seleccione al menos una categoría';
    if (data.aplicaA === 'lente' && (!data.lentesAplicables || data.lentesAplicables.length === 0)) 
      errs.lentesAplicables = 'Seleccione al menos un producto';
    if (data.prioridad < 0 || data.prioridad > 10) 
      errs.prioridad = 'Debe estar entre 0 y 10';
    if (data.limiteUsos && data.limiteUsos < 1) 
      errs.limiteUsos = 'Debe ser mayor a 0 o dejarlo vacío';

    if (data.fechaInicio && data.fechaFin) {
      const ini = new Date(data.fechaInicio);
      const fin = new Date(data.fechaFin);
      if (fin <= ini) errs.fechaFin = 'Debe ser posterior a inicio';
    }
    return errs;
  }, []);

  const onSubmitForm = useCallback(async () => {
    const data = { ...formData };
    const errs = validate(data);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim(),
      tipoDescuento: data.tipoDescuento,
      valorDescuento: Number(data.valorDescuento),
      aplicaA: data.aplicaA,
      categoriasAplicables: data.aplicaA === 'categoria' ? data.categoriasAplicables : [],
      lentesAplicables: data.aplicaA === 'lente' ? data.lentesAplicables : [],
      fechaInicio: new Date(data.fechaInicio).toISOString(),
      fechaFin: new Date(data.fechaFin).toISOString(),
      codigoPromo: data.codigoPromo.trim(),
      imagenPromocion: data.imagenPromocion || null,
      imagenMetadata: data.imagenMetadata || {},
      activo: data.activo !== false,
      prioridad: Number(data.prioridad) || 0,
      mostrarEnCarrusel: data.mostrarEnCarrusel !== false,
      limiteUsos: data.limiteUsos ? Number(data.limiteUsos) : null,
    };

    try {
      if (selectedPromo?._id) {
        await axios.put(withBase(`${API_CONFIG.ENDPOINTS.PROMOCIONES}/${selectedPromo._id}`), payload);
        showAlert('success', 'Promoción actualizada exitosamente');
      } else {
        await axios.post(withBase(API_CONFIG.ENDPOINTS.PROMOCIONES), payload);
        showAlert('success', 'Promoción creada exitosamente');
      }
      closeModals();
      fetchData();
    } catch (err) {
      showAlert('error', 'Error guardando promoción: ' + (err.response?.data?.message || err.message));
    }
  }, [formData, selectedPromo, validate, showAlert, fetchData, closeModals]);
  
  const onConfirmDelete = useCallback(async () => {
    try {
      await axios.delete(withBase(`${API_CONFIG.ENDPOINTS.PROMOCIONES}/${selectedPromo._id}`));
      showAlert('success', 'Promoción eliminada');
      closeModals();
      fetchData();
    } catch (err) {
      showAlert('error', 'Error eliminando promoción: ' + (err.response?.data?.message || err.message));
    }
  }, [selectedPromo, showAlert, fetchData, closeModals]);

  // Options para selects
  const categoriaOptions = useMemo(() => categorias.map(c => ({ value: c._id, label: c.nombre })), [categorias]);
  const productosOptions = useMemo(() => productos.map(p => ({ 
    value: p._id, 
    label: `${p.nombre} (${p.tipo === 'lente' ? 'Lente' : 'Accesorio'})` 
  })), [productos]);

  // Tipos de descuento únicos para filtro
  const tiposDescuentoUnicos = useMemo(() => {
    const tipos = promociones
      .map(p => p.tipoDescuento)
      .filter(Boolean)
      .filter((tipo, index, arr) => arr.indexOf(tipo) === index);
    return tipos.sort();
  }, [promociones]);

  // --- CÁLCULO DE ESTADÍSTICAS ---
  const stats = useMemo(() => {
    const totalPromos = promociones.length;
    const promosActivas = promociones.filter(p => getEstadoPromo(p) === 'Activa').length;
    const promosProgramadas = promociones.filter(p => getEstadoPromo(p) === 'Programada').length;
    const promosCarrusel = promociones.filter(p => p.mostrarEnCarrusel && getEstadoPromo(p) === 'Activa').length;

    return [
      { title: 'Total Promociones', value: totalPromos, Icon: Tag, color: 'cyan' },
      { title: 'Promociones Activas', value: promosActivas, Icon: CheckCircle, color: 'green' },
      { title: 'Promociones Programadas', value: promosProgramadas, Icon: Calendar, color: 'blue' },
      { title: 'En Carrusel', value: promosCarrusel, Icon: Star, color: 'purple' },
    ];
  }, [promociones, getEstadoPromo]);

  // Detail fields
  const detailFields = useMemo(() => selectedPromo ? [
    { label: 'ID', value: selectedPromo._id },
    { label: 'Nombre', value: selectedPromo.nombre },
    { label: 'Descripción', value: selectedPromo.descripcion },
    { label: 'Tipo Descuento', value: selectedPromo.tipoDescuento },
    { label: 'Valor', value: selectedPromo.tipoDescuento === 'porcentaje' ? 
      `${selectedPromo.valorDescuento}%` : 
      selectedPromo.tipoDescuento === 'monto' ? 
      `${selectedPromo.valorDescuento}` : '2x1' },
    { label: 'Aplica A', value: selectedPromo.aplicaA },
    { label: 'Categorías', value: Array.isArray(selectedPromo.categoriasAplicables) ? 
      selectedPromo.categoriasAplicables.map(c => c?.nombre || c).join(', ') : '—' },
    { label: 'Productos', value: Array.isArray(selectedPromo.lentesAplicables) ? 
      selectedPromo.lentesAplicables.map(l => l?.nombre || l).join(', ') : '—' },
    { label: 'Inicio', value: selectedPromo.fechaInicio ? 
      new Date(selectedPromo.fechaInicio).toLocaleDateString() : '—' },
    { label: 'Fin', value: selectedPromo.fechaFin ? 
      new Date(selectedPromo.fechaFin).toLocaleDateString() : '—' },
    { label: 'Código', value: selectedPromo.codigoPromo },
    { label: 'Prioridad', value: selectedPromo.prioridad || 0 },
    { label: 'En Carrusel', value: selectedPromo.mostrarEnCarrusel ? 'Sí' : 'No' },
    { label: 'Usos', value: selectedPromo.usos || 0 },
    { label: 'Límite Usos', value: selectedPromo.limiteUsos || 'Ilimitado' },
    { label: 'Estado', value: getEstadoPromo(selectedPromo) },
  ] : [], [selectedPromo, getEstadoPromo]);

  // --- RENDERIZADO DEL COMPONENTE ---
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {alert && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {alert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <p className={`text-3xl font-bold mt-2 ${
                  stat.color === 'cyan' ? 'text-cyan-600' : 
                  stat.color === 'green' ? 'text-green-600' : 
                  stat.color === 'blue' ? 'text-blue-600' :
                  'text-purple-600'
                }`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                stat.color === 'cyan' ? 'bg-cyan-100' : 
                stat.color === 'green' ? 'bg-green-100' : 
                stat.color === 'blue' ? 'bg-blue-100' :
                'bg-purple-100'
              }`}>
                <stat.Icon className={`w-6 h-6 ${
                  stat.color === 'cyan' ? 'text-cyan-600' : 
                  stat.color === 'green' ? 'text-green-600' : 
                  stat.color === 'blue' ? 'text-blue-600' :
                  'text-purple-600'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <PageHeader 
          title="Gestión de Promociones" 
          buttonLabel="Nueva Promoción" 
          onButtonClick={openAdd} 
        />
        
        {/* BARRA DE BÚSQUEDA Y CONTROLES */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Barra de búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar promoción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                aria-label="Buscar promociones"
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
                      filters.estado !== 'todas' && 1,
                      filters.tipoDescuento !== 'todos' && 1,
                      filters.aplicaA !== 'todos' && 1,
                      filters.mostrarEnCarrusel !== 'todos' && 1,
                      filters.valorMin && 1,
                      filters.valorMax && 1,
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
              {filteredAndSortedPromociones.length} promoción{filteredAndSortedPromociones.length !== 1 ? 'es' : ''} 
              {hasActiveFilters() && ` (filtrada${filteredAndSortedPromociones.length !== 1 ? 's' : ''} de ${promociones.length})`}
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
                    <option value="todas">Todos los estados</option>
                    <option value="activa">Activa</option>
                    <option value="inactiva">Inactiva</option>
                    <option value="expirada">Expirada</option>
                    <option value="programada">Programada</option>
                    <option value="agotada">Agotada</option>
                  </select>
                </div>

                {/* Filtro por Tipo de Descuento */}
                <div>
                  <label htmlFor="filter-tipo" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Descuento
                  </label>
                  <select
                    id="filter-tipo"
                    value={filters.tipoDescuento}
                    onChange={(e) => handleFilterChange('tipoDescuento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="todos">Todos los tipos</option>
                    <option value="porcentaje">Porcentaje</option>
                    <option value="monto">Monto Fijo</option>
                    <option value="2x1">2x1</option>
                  </select>
                </div>

                {/* Filtro por Aplicabilidad */}
                <div>
                  <label htmlFor="filter-aplica" className="block text-sm font-medium text-gray-700 mb-2">
                    Aplica A
                  </label>
                  <select
                    id="filter-aplica"
                    value={filters.aplicaA}
                    onChange={(e) => handleFilterChange('aplicaA', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="todos">Todas las aplicaciones</option>
                    <option value="todos">Todos los productos</option>
                    <option value="categoria">Categorías específicas</option>
                    <option value="lente">Productos específicos</option>
                  </select>
                </div>

                {/* Filtro por Rango de Valor */}
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Valor</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={filters.valorMin}
                      onChange={(e) => handleFilterChange('valorMin', e.target.value)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      min="0"
                      aria-label="Valor mínimo"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      value={filters.valorMax}
                      onChange={(e) => handleFilterChange('valorMax', e.target.value)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      min="0"
                      aria-label="Valor máximo"
                    />
                  </div>
                </div>

                {/* Filtro por Carrusel */}
                <div>
                  <label htmlFor="filter-carrusel" className="block text-sm font-medium text-gray-700 mb-2">
                    Mostrar en Carrusel
                  </label>
                  <select
                    id="filter-carrusel"
                    value={filters.mostrarEnCarrusel}
                    onChange={(e) => handleFilterChange('mostrarEnCarrusel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="todos">Todos</option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {/* Filtro por Fecha */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Fechas</label>
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

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Imagen</th>
                <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                <th className="px-6 py-4 text-left font-semibold">Descripción</th>
                <th className="px-6 py-4 text-left font-semibold">Tipo</th>
                <th className="px-6 py-4 text-left font-semibold">Valor</th>
                <th className="px-6 py-4 text-left font-semibold">Vigencia</th>
                <th className="px-6 py-4 text-left font-semibold">Prioridad</th>
                <th className="px-6 py-4 text-left font-semibold">Usos</th>
                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                <th className="px-6 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPromociones.length > 0 ? (
                currentPromociones.map((promo) => {
                  const estado = getEstadoPromo(promo);
                  return (
                    <tr key={promo._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="relative">
                          {promo.imagenPromocion ? (
                            <img 
                              src={promo.imagenPromocion} 
                              alt={promo.nombre}
                              className="w-16 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          {promo.mostrarEnCarrusel && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                              <Star className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{promo.nombre}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-sm truncate">{promo.descripcion}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getTipoIcono(promo.tipoDescuento)}
                          <span className="text-gray-800 font-medium">
                            {(promo.tipoDescuento || '').toString().toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-cyan-600">
                          {promo.tipoDescuento === 'porcentaje' ? `${promo.valorDescuento}%` : 
                           promo.tipoDescuento === 'monto' ? `${promo.valorDescuento}` : 
                           promo.tipoDescuento === '2x1' ? '2x1' : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-800">
                            <span className="font-semibold">Inicio:</span> {
                              promo.fechaInicio ? new Date(promo.fechaInicio).toLocaleDateString() : '—'
                            }
                          </span>
                          <span className="text-sm text-gray-500">
                            <span className="font-semibold">Fin:</span> {
                              promo.fechaFin ? new Date(promo.fechaFin).toLocaleDateString() : '—'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-purple-600">
                          {promo.prioridad || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-800">
                            {promo.usos || 0}
                          </span>
                          {promo.limiteUsos && (
                            <span className="text-xs text-gray-500">
                              / {promo.limiteUsos}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(estado)}`}>
                          {estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => openDelete(promo)} 
                            className="p-1.5 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" 
                            title="Eliminar"
                            aria-label={`Eliminar promoción ${promo.nombre}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openView(promo)} 
                            className="p-1.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" 
                            title="Ver detalles"
                            aria-label={`Ver detalles de ${promo.nombre}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openEdit(promo)} 
                            className="p-1.5 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" 
                            title="Editar"
                            aria-label={`Editar promoción ${promo.nombre}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="p-8 text-center">
                    <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron promociones</h3>
                    <p className="text-gray-500">
                      {hasActiveFilters() ? 'Intenta ajustar los filtros de búsqueda' : 'Comienza creando tu primera promoción'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Mostrar</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
                className="border border-gray-300 rounded py-1 px-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {[5,10,15,20].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span className="text-gray-700">por página</span>
            </div>
            
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-gray-600">
                Mostrando {currentPage * pageSize + 1} a {Math.min(currentPage * pageSize + pageSize, filteredAndSortedPromociones.length)} de {filteredAndSortedPromociones.length} promociones
              </span>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={goToFirstPage} 
                  disabled={currentPage === 0} 
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Primera página"
                >
                  {'<<'}
                </button>
                <button 
                  onClick={goToPreviousPage} 
                  disabled={currentPage === 0} 
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página anterior"
                >
                  {'<'}
                </button>
                <span className="text-gray-700 font-medium px-4">
                  Página {currentPage + 1} de {totalPages}
                </span>
                <button 
                  onClick={goToNextPage} 
                  disabled={currentPage === totalPages - 1} 
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página siguiente"
                >
                  {'>'}
                </button>
                <button 
                  onClick={goToLastPage} 
                  disabled={currentPage === totalPages - 1} 
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Última página"
                >
                  {'>>'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALES */}
      <PromocionesFormModal
  isOpen={showAddEditModal}
  onClose={closeModals}
  onSubmit={onSubmitForm}
  title={selectedPromo ? 'Editar Promoción' : 'Nueva Promoción'}
  formData={formData}
  handleInputChange={handleInputChange}
  errors={errors}
  submitLabel={selectedPromo ? 'Guardar cambios' : 'Crear promoción'}
  categoriaOptions={categoriaOptions}
  productosOptions={productosOptions}
  selectedPromo={selectedPromo}
/>

      <DetailModal
        isOpen={showDetailModal}
        onClose={closeModals}
        title="Detalles de la Promoción"
        item={selectedPromo}
        data={detailFields}
      >
        {/* Mostrar imagen en el modal de detalles */}
        {selectedPromo?.imagenPromocion && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Imagen de Promoción</h4>
            <img 
              src={selectedPromo.imagenPromocion} 
              alt={selectedPromo.nombre}
              className="w-full max-w-md h-48 object-cover rounded-lg border"
            />
          </div>
        )}
      </DetailModal>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeModals}
        onConfirm={onConfirmDelete}
        title="Confirmar Eliminación"
        message={`¿Eliminar la promoción "${selectedPromo?.nombre}"? Esta acción no se puede deshacer y eliminará también la imagen asociada.`}
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

export default PromocionesContent;