import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Trash2, Eye, Edit, Tag, Calendar, Percent, CheckCircle, XCircle, AlertCircle, Save, X, Camera, Upload, User } from 'lucide-react';

// Componente de subida de imagen
const ImageUploadComponent = ({ currentImage, onImageChange, promocionName = '' }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleOpenWidget = () => {
    if (!window.cloudinary) return;
    const widget = window.cloudinary.createUploadWidget({
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-preset',
      sources: ['local', 'url'],
      folder: "promociones",
      multiple: false,
      maxImageFileSize: 5000000,
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      cropping: true,
      croppingAspectRatio: 16/9,
      styles: {
        palette: {
          window: "#FFFFFF",
          windowBorder: "#0891B2",
          tabIcon: "#0891B2",
          link: "#0891B2",
          action: "#0891B2"
        }
      }
    }, (error, result) => {
      if (error) {
        setIsUploading(false);
        return;
      }
      if (result && result.event === "upload-added") setIsUploading(true);
      if (result && result.event === "success") {
        onImageChange(result.info.secure_url);
        setIsUploading(false);
      }
    });
    widget.open();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Imagen de la Promoción</label>
      <div 
        className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-cyan-400 transition-colors group"
        onClick={handleOpenWidget}
      >
        {currentImage ? (
          <>
            <img src={currentImage} alt={promocionName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white text-center">
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Cambiar imagen</span>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
            {isUploading ? (
              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Upload className="w-12 h-12 mb-3" />
                <span className="text-sm font-medium">Subir imagen de promoción</span>
                <span className="text-xs text-gray-400 mt-1">Formato 16:9 recomendado</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Modal de Formulario
const FormModal = ({ isOpen, onClose, onSubmit, title, formData, setFormData, errors, isEdit = false }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
      script.async = true;
      if (!document.querySelector('script[src="https://widget.cloudinary.com/v2.0/global/all.js"]')) {
        document.body.appendChild(script);
      }
    }
  }, [isOpen]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-cyan-500 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">{title}</h3>
            <button onClick={onClose} className="text-white hover:bg-cyan-600 rounded-lg p-2 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sección de imagen */}
          <div className="bg-gray-50 p-6 rounded-xl border">
            <ImageUploadComponent
              currentImage={formData.imagenPromocion || ''}
              onImageChange={(url) => setFormData({...formData, imagenPromocion: url})}
              promocionName={formData.nombre || ''}
            />
          </div>

          {/* Información básica */}
          <div className="bg-white border rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">📋 Información Básica</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Nombre de la promoción"
                  required
                />
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <textarea
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  rows="3"
                  placeholder="Descripción detallada de la promoción"
                  required
                />
                {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código de Promoción *</label>
                <input
                  type="text"
                  value={formData.codigoPromo || ''}
                  onChange={(e) => setFormData({...formData, codigoPromo: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Ej: VERANO2024"
                  required
                />
                {errors.codigoPromo && <p className="text-red-500 text-sm mt-1">{errors.codigoPromo}</p>}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo !== undefined ? formData.activo : true}
                  onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">Promoción activa</label>
              </div>
            </div>
          </div>

          {/* Configuración de descuento */}
          <div className="bg-white border rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">💰 Configuración de Descuento</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Descuento *</label>
                <select
                  value={formData.tipoDescuento || ''}
                  onChange={(e) => setFormData({...formData, tipoDescuento: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccione tipo</option>
                  <option value="porcentaje">Porcentaje</option>
                  <option value="monto_fijo">Monto Fijo</option>
                </select>
                {errors.tipoDescuento && <p className="text-red-500 text-sm mt-1">{errors.tipoDescuento}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor del Descuento *</label>
                <input
                  type="number"
                  min="0"
                  max={formData.tipoDescuento === 'porcentaje' ? 100 : undefined}
                  value={formData.valorDescuento || ''}
                  onChange={(e) => setFormData({...formData, valorDescuento: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder={formData.tipoDescuento === 'porcentaje' ? '15' : '50.00'}
                  required
                />
                {errors.valorDescuento && <p className="text-red-500 text-sm mt-1">{errors.valorDescuento}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aplica a *</label>
                <select
                  value={formData.aplicaA || ''}
                  onChange={(e) => setFormData({...formData, aplicaA: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccione opción</option>
                  <option value="todos">Todos los productos</option>
                  <option value="categoria">Categorías específicas</option>
                  <option value="lente">Lentes específicos</option>
                </select>
                {errors.aplicaA && <p className="text-red-500 text-sm mt-1">{errors.aplicaA}</p>}
              </div>
            </div>
          </div>

          {/* Período de vigencia */}
          <div className="bg-white border rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">📅 Período de Vigencia</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio *</label>
                <input
                  type="date"
                  value={formData.fechaInicio || ''}
                  onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
                {errors.fechaInicio && <p className="text-red-500 text-sm mt-1">{errors.fechaInicio}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin *</label>
                <input
                  type="date"
                  value={formData.fechaFin || ''}
                  onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
                {errors.fechaFin && <p className="text-red-500 text-sm mt-1">{errors.fechaFin}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center space-x-2 font-medium"
            >
              <Save className="w-4 h-4" />
              <span>{isEdit ? 'Actualizar' : 'Crear'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal de Detalles
const DetailModal = ({ isOpen, onClose, promocion }) => {
  if (!isOpen || !promocion) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES');
  };

  const getEstadoText = () => {
    const now = new Date();
    const inicio = new Date(promocion.fechaInicio);
    const fin = new Date(promocion.fechaFin);

    if (!promocion.activo) return 'Inactiva';
    if (now < inicio) return 'Programada';
    if (now > fin) return 'Expirada';
    return 'Activa';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-cyan-500 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Detalles de Promoción</h3>
            <button onClick={onClose} className="text-white hover:bg-cyan-600 rounded-lg p-2 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Imagen de la promoción */}
          {promocion.imagenPromocion && (
            <div className="bg-gray-100 rounded-xl overflow-hidden">
              <img 
                src={promocion.imagenPromocion} 
                alt={promocion.nombre}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div>
            <h4 className="text-2xl font-bold text-gray-800">{promocion.nombre}</h4>
            <p className="text-gray-600 mt-2 text-lg">{promocion.descripcion}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-medium text-gray-500">Código de Promoción</span>
              <p className="text-xl font-bold text-cyan-600 mt-1">{promocion.codigoPromo}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-medium text-gray-500">Tipo de Descuento</span>
              <p className="text-lg font-semibold text-gray-800 mt-1 capitalize">{promocion.tipoDescuento?.replace('_', ' ')}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-medium text-gray-500">Valor del Descuento</span>
              <p className="text-xl font-bold text-green-600 mt-1">
                {promocion.tipoDescuento === 'porcentaje' ? `${promocion.valorDescuento}%` : `$${promocion.valorDescuento}`}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-medium text-gray-500">Aplica a</span>
              <p className="text-lg font-semibold text-gray-800 mt-1 capitalize">{promocion.aplicaA}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-medium text-gray-500">Fecha de Inicio</span>
              <p className="text-lg font-semibold text-gray-800 mt-1">{formatDate(promocion.fechaInicio)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-medium text-gray-500">Fecha de Fin</span>
              <p className="text-lg font-semibold text-gray-800 mt-1">{formatDate(promocion.fechaFin)}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Estado Actual</span>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                getEstadoText() === 'Activa' ? 'bg-green-100 text-green-800' :
                getEstadoText() === 'Expirada' ? 'bg-red-100 text-red-800' :
                getEstadoText() === 'Programada' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {getEstadoText()}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de Confirmación
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Alerta
const Alert = ({ alert }) => {
  if (!alert) return null;

  const bgColor = alert.type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700';
  const icon = alert.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />;

  return (
    <div className={`border px-4 py-3 rounded relative ${bgColor} animate-fade-in`}>
      <div className="flex items-center">
        {icon}
        <span className="ml-2">{alert.message}</span>
      </div>
    </div>
  );
};

const PromocionesContent = () => {
  // Estados principales
  const [promociones, setPromociones] = useState([]);
  const [filteredPromociones, setFilteredPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todas');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  
  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPromocion, setSelectedPromocion] = useState(null);
  const [alert, setAlert] = useState(null);
  
  // Estados para formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipoDescuento: '',
    valorDescuento: '',
    aplicaA: '',
    fechaInicio: '',
    fechaFin: '',
    codigoPromo: '',
    activo: true,
    imagenPromocion: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Cargar promociones al montar el componente
  useEffect(() => {
    fetchPromociones();
  }, []);

  // Filtrar promociones cuando cambien los filtros o datos
  useEffect(() => {
    filterPromociones();
  }, [promociones, searchTerm, selectedFilter]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // API: Obtener todas las promociones
  const fetchPromociones = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/promociones');
      const data = await response.json();
      
      if (response.ok && Array.isArray(data)) {
        setPromociones(data);
      } else {
        setError('Error al cargar promociones');
        setPromociones([]);
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      setPromociones([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar promociones
  const filterPromociones = () => {
    let filtered = promociones.filter(promo => {
      const matchesSearch = promo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           promo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           promo.codigoPromo.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (selectedFilter === 'todas') return true;
      
      const now = new Date();
      const inicio = new Date(promo.fechaInicio);
      const fin = new Date(promo.fechaFin);
      
      switch (selectedFilter) {
        case 'activas':
          return promo.activo && now >= inicio && now <= fin;
        case 'expiradas':
          return now > fin;
        case 'programadas':
          return now < inicio;
        case 'inactivas':
          return !promo.activo;
        default:
          return true;
      }
    });
    
    setFilteredPromociones(filtered);
    setCurrentPage(0);
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      tipoDescuento: '',
      valorDescuento: '',
      aplicaA: '',
      fechaInicio: '',
      fechaFin: '',
      codigoPromo: '',
      activo: true,
      imagenPromocion: ''
    });
    setFormErrors({});
  };

  // Handlers de modales
  const handleOpenAddModal = () => {
    resetForm();
    setSelectedPromocion(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (promocion) => {
    setSelectedPromocion(promocion);
    setFormData({
      nombre: promocion.nombre,
      descripcion: promocion.descripcion,
      tipoDescuento: promocion.tipoDescuento,
      valorDescuento: promocion.valorDescuento,
      aplicaA: promocion.aplicaA,
      fechaInicio: promocion.fechaInicio ? promocion.fechaInicio.split('T')[0] : '',
      fechaFin: promocion.fechaFin ? promocion.fechaFin.split('T')[0] : '',
      codigoPromo: promocion.codigoPromo,
      activo: promocion.activo,
      imagenPromocion: promocion.imagenPromocion || ''
    });
    setShowEditModal(true);
  };

  const handleOpenDetailModal = (promocion) => {
    setSelectedPromocion(promocion);
    setShowDetailModal(true);
  };

  const handleOpenDeleteModal = (promocion) => {
    setSelectedPromocion(promocion);
    setShowDeleteModal(true);
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setShowDeleteModal(false);
    setSelectedPromocion(null);
    resetForm();
    setError('');
  };

  // API: Crear promoción
  const createPromocion = async () => {
    try {
      setFormErrors({});
      
      const response = await fetch('http://localhost:4000/api/promociones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.promocion) {
        await fetchPromociones();
        setShowAddModal(false);
        resetForm();
        showAlert('success', '¡Promoción creada exitosamente!');
      } else {
        if (data.message) {
          showAlert('error', data.message);
        }
      }
    } catch (err) {
      showAlert('error', 'Error al crear la promoción');
    }
  };

  // API: Actualizar promoción
  const updatePromocion = async () => {
    try {
      setFormErrors({});
      
      const response = await fetch(`http://localhost:4000/api/promociones/${selectedPromocion._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.promocion) {
        await fetchPromociones();
        setShowEditModal(false);
        resetForm();
        setSelectedPromocion(null);
        showAlert('success', '¡Promoción actualizada exitosamente!');
      } else {
        if (data.message) {
          showAlert('error', data.message);
        }
      }
    } catch (err) {
      showAlert('error', 'Error al actualizar la promoción');
    }
  };

  // API: Eliminar promoción
  const deletePromocion = async () => {
    if (!selectedPromocion) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/promociones/${selectedPromocion._id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchPromociones();
        setShowDeleteModal(false);
        setSelectedPromocion(null);
        showAlert('success', '¡Promoción eliminada exitosamente!');
      } else {
        showAlert('error', 'Error al eliminar la promoción');
      }
    } catch (err) {
      showAlert('error', 'Error al eliminar la promoción');
    }
  };

  // Obtener estado de la promoción
  const getEstadoPromocion = (promocion) => {
    const now = new Date();
    const inicio = new Date(promocion.fechaInicio);
    const fin = new Date(promocion.fechaFin);
    
    if (!promocion.activo) return { text: 'Inactiva', color: 'bg-gray-100 text-gray-800' };
    if (now < inicio) return { text: 'Programada', color: 'bg-blue-100 text-blue-800' };
    if (now > fin) return { text: 'Expirada', color: 'bg-red-100 text-red-800' };
    return { text: 'Activa', color: 'bg-green-100 text-green-800' };
  };

  // Calcular estadísticas
  const totalPromociones = promociones.length;
  const promocionesActivas = promociones.filter(p => {
    const now = new Date();
    const inicio = new Date(p.fechaInicio);
    const fin = new Date(p.fechaFin);
    return p.activo && now >= inicio && now <= fin;
  }).length;
  const promocionesProgramadas = promociones.filter(p => {
    const now = new Date();
    const inicio = new Date(p.fechaInicio);
    return now < inicio;
  }).length;

  // Paginación
  const totalPages = Math.ceil(filteredPromociones.length / pageSize);
  const currentPromociones = filteredPromociones.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () => setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  const goToNextPage = () => setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Alert alert={alert} />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Promociones</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalPromociones}</p>
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
              <p className="text-3xl font-bold text-green-600 mt-2">{promocionesActivas}</p>
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
              <p className="text-3xl font-bold text-blue-600 mt-2">{promocionesProgramadas}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestión de Promociones</h2>
            <button
              onClick={handleOpenAddModal}
              className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Promoción</span>
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['todas', 'activas', 'expiradas', 'programadas', 'inactivas'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg transition-colors capitalize font-medium ${
                    selectedFilter === filter 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid de promociones */}
        {currentPromociones.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPromociones.map((promo) => {
                const estado = getEstadoPromocion(promo);
                return (
                  <div
                    key={promo._id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                    style={{
                      backgroundImage: promo.imagenPromocion ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${promo.imagenPromocion})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className={`p-6 h-full flex flex-col ${promo.imagenPromocion ? 'text-white' : ''}`}>
                      {/* Header con estado */}
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${estado.color} ${promo.imagenPromocion ? 'backdrop-blur-sm bg-white/20 text-white border border-white/30' : ''}`}>
                          {estado.text}
                        </span>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenDeleteModal(promo)}
                            className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors" 
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenDetailModal(promo)}
                            className="p-2 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-colors" 
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenEditModal(promo)}
                            className="p-2 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-colors" 
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Contenido principal */}
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-2 ${promo.imagenPromocion ? 'text-white' : 'text-gray-900'}`}>
                          {promo.nombre}
                        </h3>
                        <p className={`text-sm mb-4 line-clamp-2 ${promo.imagenPromocion ? 'text-gray-100' : 'text-gray-600'}`}>
                          {promo.descripcion}
                        </p>

                        {/* Código promocional */}
                        <div className={`inline-block px-3 py-1 rounded-lg font-mono text-sm font-bold mb-4 ${
                          promo.imagenPromocion ? 'bg-white/20 text-white backdrop-blur-sm border border-white/30' : 'bg-cyan-100 text-cyan-800'
                        }`}>
                          {promo.codigoPromo}
                        </div>

                        {/* Descuento */}
                        <div className="flex items-center space-x-2 mb-4">
                          {promo.tipoDescuento === 'porcentaje' ? 
                            <Percent className={`w-5 h-5 ${promo.imagenPromocion ? 'text-yellow-300' : 'text-cyan-600'}`} /> : 
                            <Tag className={`w-5 h-5 ${promo.imagenPromocion ? 'text-yellow-300' : 'text-purple-600'}`} />
                          }
                          <span className={`text-2xl font-bold ${promo.imagenPromocion ? 'text-yellow-300' : 'text-green-600'}`}>
                            {promo.tipoDescuento === 'porcentaje' ? 
                              `${promo.valorDescuento}%` : 
                              `${promo.valorDescuento}`
                            }
                          </span>
                          <span className={`text-sm ${promo.imagenPromocion ? 'text-gray-200' : 'text-gray-500'}`}>
                            de descuento
                          </span>
                        </div>
                      </div>

                      {/* Footer con fechas */}
                      <div className={`pt-4 border-t ${promo.imagenPromocion ? 'border-white/20' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-center text-xs">
                          <span className={promo.imagenPromocion ? 'text-gray-200' : 'text-gray-500'}>
                            Inicio: {new Date(promo.fechaInicio).toLocaleDateString('es-ES')}
                          </span>
                          <span className={promo.imagenPromocion ? 'text-gray-200' : 'text-gray-500'}>
                            Fin: {new Date(promo.fechaFin).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron promociones
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primera promoción'}
            </p>
          </div>
        )}

        {/* Controles de paginación */}
        {filteredPromociones.length > 0 && (
          <div className="p-4 flex flex-col items-center gap-4 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium">Mostrar</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="border border-gray-300 rounded py-1 px-2 font-medium"
              >
                {[6, 12, 18, 24].map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-gray-700 font-medium">por página</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 0}
                className="px-3 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors font-medium"
              >
                {"<<"}
              </button>
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
                className="px-3 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors font-medium"
              >
                {"<"}
              </button>
              <span className="text-gray-700 font-medium px-4">
                Página {currentPage + 1} de {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors font-medium"
              >
                {">"}
              </button>
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors font-medium"
              >
                {">>"}
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Mostrando {currentPage * pageSize + 1} a {Math.min((currentPage + 1) * pageSize, filteredPromociones.length)} de {filteredPromociones.length} promociones
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <FormModal
        isOpen={showAddModal}
        onClose={handleCloseModals}
        onSubmit={createPromocion}
        title="Crear Nueva Promoción"
        formData={formData}
        setFormData={setFormData}
        errors={formErrors}
        isEdit={false}
      />

      <FormModal
        isOpen={showEditModal}
        onClose={handleCloseModals}
        onSubmit={updatePromocion}
        title="Editar Promoción"
        formData={formData}
        setFormData={setFormData}
        errors={formErrors}
        isEdit={true}
      />

      <DetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModals}
        promocion={selectedPromocion}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseModals}
        onConfirm={deletePromocion}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar la promoción "${selectedPromocion?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
      />
    </div>
  );
};

export default PromocionesContent;