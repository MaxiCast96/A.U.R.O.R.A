import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../config/api';
import { Search, Plus, Trash2, Eye, Edit, Tag, Calendar, Percent, CheckCircle, Image as ImageIcon, Star, Users, Camera, Upload } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import Alert from '../ui/Alert';
import FormModal from '../ui/FormModal';
import DetailModal from '../ui/DetailModal';
import ConfirmationModal from '../ui/ConfirmationModal';

// Helpers
const withBase = (path, base = API_CONFIG.BASE_URL) => `${base}${path}`;

// Ensure cookies (HTTP-only JWT) are sent with requests
axios.defaults.withCredentials = true;

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
      croppingAspectRatio: 16/9, // Ratio ideal para carrusel
      maxImageFileSize: 10000000, // 10MB
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
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todas'); // todas | activa | expirada | programada | agotada

  // Data state
  const [promociones, setPromociones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]); // CAMBIO: productos en lugar de solo lentes
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Form state
  const initialForm = {
    nombre: '',
    descripcion: '',
    tipoDescuento: 'porcentaje', // porcentaje | monto | 2x1
    valorDescuento: 0,
    aplicaA: 'todos', // todos | categoria | lente
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

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // ✅ FUNCIÓN CORREGIDA - Manejo correcto de la respuesta paginada
  const fetchData = async () => {
    setLoading(true);
    try {
      // Hacer las peticiones por separado para mejor control de errores
      const promosRes = await axios.get(withBase(API_CONFIG.ENDPOINTS.PROMOCIONES));
      const catRes = await axios.get(withBase(API_CONFIG.ENDPOINTS.CATEGORIAS));
      const lentesRes = await axios.get(withBase(API_CONFIG.ENDPOINTS.LENTES));
      
      setPromociones(Array.isArray(promosRes.data) ? promosRes.data : []);
      setCategorias(Array.isArray(catRes.data) ? catRes.data : []);
      
      // ✅ CORRECCIÓN: Manejo correcto de la respuesta paginada de lentes
      let lentesData = [];
      
      // Verificar si la respuesta tiene estructura de paginación
      if (lentesRes.data && lentesRes.data.data && Array.isArray(lentesRes.data.data)) {
        // Respuesta con paginación: { success: true, data: [...], pagination: {...} }
        lentesData = lentesRes.data.data;
        console.log('Lentes cargados (paginación):', lentesData.length);
      } else if (Array.isArray(lentesRes.data)) {
        // Respuesta directa: [...]
        lentesData = lentesRes.data;
        console.log('Lentes cargados (directo):', lentesData.length);
      }
      
      // Intentar cargar accesorios solo si el endpoint existe
      let accesoriosData = [];
      try {
        const accesoriosRes = await axios.get(withBase(API_CONFIG.ENDPOINTS.ACCESORIOS));
        
        // Manejar respuesta de accesorios de forma similar
        if (accesoriosRes.data && accesoriosRes.data.data && Array.isArray(accesoriosRes.data.data)) {
          accesoriosData = accesoriosRes.data.data;
        } else if (Array.isArray(accesoriosRes.data)) {
          accesoriosData = accesoriosRes.data;
        }
        
        console.log('Accesorios cargados:', accesoriosData.length);
      } catch (accesoriosError) {
        console.warn('Endpoint de accesorios no disponible:', accesoriosError.message);
        // No es un error crítico, continuamos solo con lentes
      }
      
      // Combinar lentes y accesorios con tipo identificador
      const todosLosProductos = [
        ...lentesData.map(lente => ({ ...lente, tipo: 'lente' })),
        ...accesoriosData.map(accesorio => ({ ...accesorio, tipo: 'accesorio' }))
      ];
      
      setProductos(todosLosProductos);
      console.log('Total productos finales:', todosLosProductos.length);
      
    } catch (err) {
      console.error('Error detallado cargando datos:', err.response || err);
      showAlert('error', 'Error cargando datos de promociones: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // ✅ DEBUGGING: Log temporal para verificar productos
  useEffect(() => {
    console.log('Estado productos actualizado:', productos.length, productos);
  }, [productos]);

  // Filters helpers
  const getEstadoPromo = (promo) => {
    const now = new Date();
    const ini = promo.fechaInicio ? new Date(promo.fechaInicio) : null;
    const fin = promo.fechaFin ? new Date(promo.fechaFin) : null;
    
    if (promo.activo === false) return 'Inactiva';
    if (promo.limiteUsos && promo.usos >= promo.limiteUsos) return 'Agotada';
    if (ini && now < ini) return 'Programada';
    if (fin && now > fin) return 'Expirada';
    return 'Activa';
  };

  const filteredPromociones = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = Array.isArray(promociones) ? promociones : [];
    if (term) {
      list = list.filter(p =>
        p.nombre?.toLowerCase().includes(term) ||
        p.descripcion?.toLowerCase().includes(term) ||
        p.codigoPromo?.toLowerCase().includes(term)
      );
    }
    if (selectedFilter !== 'todas') {
      list = list.filter(p => getEstadoPromo(p).toLowerCase() === selectedFilter);
    }
    return list;
  }, [promociones, searchTerm, selectedFilter]);

  const totalPages = Math.ceil((filteredPromociones.length || 0) / pageSize) || 1;
  const currentPromociones = filteredPromociones.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () => setCurrentPage(p => (p > 0 ? p - 1 : p));
  const goToNextPage = () => setCurrentPage(p => (p < totalPages - 1 ? p + 1 : p));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Activa': return 'bg-green-100 text-green-800';
      case 'Expirada': return 'bg-red-100 text-red-800';
      case 'Programada': return 'bg-blue-100 text-blue-800';
      case 'Agotada': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcono = (tipo) => {
    const t = (tipo || '').toString().toLowerCase();
    switch (t) {
      case 'porcentaje': return <Percent className="w-5 h-5 text-cyan-600" />;
      case 'monto': return <Tag className="w-5 h-5 text-purple-600" />;
      case '2x1': return <Tag className="w-5 h-5 text-orange-600" />;
      default: return null;
    }
  };

  const totalPromos = promociones.length;
  const promosActivas = promociones.filter(p => getEstadoPromo(p) === 'Activa').length;
  const promosProgramadas = promociones.filter(p => getEstadoPromo(p) === 'Programada').length;
  const promosCarrusel = promociones.filter(p => p.mostrarEnCarrusel && getEstadoPromo(p) === 'Activa').length;

  // Handlers
  const openAdd = () => { 
    setSelectedPromo(null); 
    setFormData(initialForm); 
    setErrors({}); 
    setShowAddEditModal(true); 
  };

  const openEdit = (promo) => {
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
  };

  const openView = (promo) => { setSelectedPromo(promo); setShowDetailModal(true); };
  const openDelete = (promo) => { setSelectedPromo(promo); setShowDeleteModal(true); };
  const closeModals = () => { 
    setShowAddEditModal(false); 
    setShowDetailModal(false); 
    setShowDeleteModal(false); 
    setSelectedPromo(null); 
    setErrors({}); 
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleImageChange = (imageData) => {
    setFormData(prev => ({
      ...prev,
      imagenPromocion: imageData.url,
      imagenMetadata: imageData.metadata
    }));
  };

  const validate = (data) => {
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

    // fechas
    if (data.fechaInicio && data.fechaFin) {
      const ini = new Date(data.fechaInicio);
      const fin = new Date(data.fechaFin);
      if (fin <= ini) errs.fechaFin = 'Debe ser posterior a inicio';
    }
    return errs;
  };

  const onSubmitForm = async () => {
    const data = { ...formData };
    const errs = validate(data);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Normalizar payload
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
  };

  const onConfirmDelete = async () => {
    try {
      await axios.delete(withBase(`${API_CONFIG.ENDPOINTS.PROMOCIONES}/${selectedPromo._id}`));
      showAlert('success', 'Promoción eliminada');
      closeModals();
      fetchData();
    } catch (err) {
      showAlert('error', 'Error eliminando promoción: ' + (err.response?.data?.message || err.message));
    }
  };

  // ✅ CORREGIDO: Options para selects con verificación de datos
  const categoriaOptions = categorias.map(c => ({ value: c._id, label: c.nombre }));
  const productosOptions = productos.map(p => ({ 
    value: p._id, 
    label: `${p.nombre} (${p.tipo === 'lente' ? 'Lente' : 'Accesorio'})` 
  }));

  // ✅ DEBUGGING: Log temporal para verificar options
  console.log('Categoria options:', categoriaOptions.length);
  console.log('Productos options:', productosOptions.length);

  // Detail fields
  const detailFields = selectedPromo ? [
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
      selectedPromo.categoriasAplicables.map(c => c?.nombre || c).join(', ') : '-' },
    { label: 'Productos', value: Array.isArray(selectedPromo.lentesAplicables) ? 
      selectedPromo.lentesAplicables.map(l => l?.nombre || l).join(', ') : '-' },
    { label: 'Inicio', value: selectedPromo.fechaInicio ? 
      new Date(selectedPromo.fechaInicio).toLocaleDateString() : '-' },
    { label: 'Fin', value: selectedPromo.fechaFin ? 
      new Date(selectedPromo.fechaFin).toLocaleDateString() : '-' },
    { label: 'Código', value: selectedPromo.codigoPromo },
    { label: 'Prioridad', value: selectedPromo.prioridad || 0 },
    { label: 'En Carrusel', value: selectedPromo.mostrarEnCarrusel ? 'Sí' : 'No' },
    { label: 'Usos', value: selectedPromo.usos || 0 },
    { label: 'Límite Usos', value: selectedPromo.limiteUsos || 'Ilimitado' },
    { label: 'Estado', value: getEstadoPromo(selectedPromo) },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Gestión de Promociones"
        subtitle="Crea, edita y administra las promociones de la óptica"
        icon={Tag}
        buttonText="Añadir Promoción"
        onButtonClick={openAdd}
      />

      {alert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* Stats mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Promociones</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalPromos}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <Tag className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Promociones Activas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{promosActivas}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Promociones Programadas</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{promosProgramadas}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">En Carrusel</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{promosCarrusel}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Listado de Promociones</h2>
            <button onClick={openAdd} className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nueva Promoción</span>
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
                placeholder="Buscar promoción..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['todas', 'activa', 'expirada', 'programada', 'agotada'].map(filter => (
                <button
                  key={filter}
                  onClick={() => { setSelectedFilter(filter); setCurrentPage(0); }}
                  className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                    selectedFilter === filter 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla */}
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
              {loading ? (
                <tr><td className="px-6 py-6 text-center" colSpan={10}>Cargando promociones...</td></tr>
              ) : currentPromociones.length > 0 ? (
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
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openView(promo)} 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openEdit(promo)} 
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                            title="Editar"
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
                    <p className="text-gray-500">{searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primera promoción'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="mt-4 flex flex-col items-center gap-4 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Mostrar</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
              className="border border-cyan-500 rounded py-1 px-2"
            >
              {[5,10,15,20].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-gray-700">por página</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToFirstPage} disabled={currentPage === 0} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors">{'<<'}</button>
            <button onClick={goToPreviousPage} disabled={currentPage === 0} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors">{'<'}</button>
            <span className="text-gray-700 font-medium">Página {currentPage + 1} de {totalPages}</span>
            <button onClick={goToNextPage} disabled={currentPage === totalPages - 1} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors">{'>'}</button>
            <button onClick={goToLastPage} disabled={currentPage === totalPages - 1} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors">{'>>'}</button>
          </div>
        </div>
      </div>

      {/* Modales */}
      <FormModal
        isOpen={showAddEditModal}
        onClose={closeModals}
        onSubmit={onSubmitForm}
        title={selectedPromo ? 'Editar Promoción' : 'Nueva Promoción'}
        formData={formData}
        handleInputChange={handleInputChange}
        errors={errors}
        submitLabel={selectedPromo ? 'Guardar cambios' : 'Crear promoción'}
        gridCols={2}
        size="xl"
        fields={[
          // SECCIÓN 1: INFORMACIÓN BÁSICA
          { name: 'nombre', label: 'Nombre de la Promoción', type: 'text', required: true, colSpan: 2 },
          { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true, colSpan: 2 },
          
          // SECCIÓN 2: CONFIGURACIÓN DEL DESCUENTO
          { name: 'tipoDescuento', label: 'Tipo de Descuento', type: 'select', options: [
            { value: 'porcentaje', label: 'Porcentaje (%)' },
            { value: 'monto', label: 'Monto fijo ($)' },
            { value: '2x1', label: '2x1' },
          ], required: true },
          
          { name: 'valorDescuento', label: 'Valor del Descuento', type: 'number', required: true },
          
          // SECCIÓN 3: APLICABILIDAD
          { name: 'aplicaA', label: 'Aplicar Promoción A', type: 'select', options: [
            { value: 'todos', label: 'Todos los productos' },
            { value: 'categoria', label: 'Categorías específicas' },
            { value: 'lente', label: 'Productos específicos' },
          ], required: true, colSpan: 2 },
          
          { name: 'categoriasAplicables', label: 'Categorías Aplicables', type: 'multi-select', options: categoriaOptions, hidden: formData.aplicaA !== 'categoria', colSpan: 2 },
          
          { name: 'lentesAplicables', label: 'Productos Aplicables', type: 'multi-select', options: productosOptions, hidden: formData.aplicaA !== 'lente', colSpan: 2 },
          
          // SECCIÓN 4: VIGENCIA Y CÓDIGO
          { name: 'fechaInicio', label: 'Fecha de Inicio', type: 'date', required: true },
          { name: 'fechaFin', label: 'Fecha de Fin', type: 'date', required: true },
          
          { name: 'codigoPromo', label: 'Código de Promoción', type: 'text', required: true, colSpan: 2, placeholder: 'Ej: DESCUENTO20, VERANO2024' },
          
          // SECCIÓN 5: CONFIGURACIÓN AVANZADA
          { name: 'prioridad', label: 'Prioridad (0-10)', type: 'number', min: 0, max: 10, placeholder: '0 = Baja, 10 = Alta' },
          { name: 'limiteUsos', label: 'Límite de Usos', type: 'number', min: 1, placeholder: 'Vacío = Ilimitado' },
          
          { name: 'mostrarEnCarrusel', label: 'Mostrar en Carrusel Principal', type: 'boolean' },
          { name: 'activo', label: 'Promoción Activa', type: 'boolean' },
        ]}
      >
        {/* Contenido personalizado para la imagen */}
        <div className="mt-6 border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Imagen de la Promoción</h4>
          <PromocionImageUpload 
            currentImage={formData?.imagenPromocion}
            onImageChange={handleImageChange}
            promocionName={formData?.nombre}
          />
        </div>
      </FormModal>

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
    </div>
  );
};

export default PromocionesContent;