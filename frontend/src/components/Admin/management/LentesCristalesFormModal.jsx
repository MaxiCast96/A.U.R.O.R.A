import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Upload, X, Package, Edit3, Eye, EyeOff, Plus, Trash2, AlertCircle, Check, Loader, DollarSign, Tag } from 'lucide-react';

const MATERIALS = ['Vidrio', 'Policarbonato', 'Cr39'];
const VISION = ['Sencilla', 'Multifocal', 'Bifocal'];
const PROTECCIONES = ['Antirreflejante', 'Filtro azul', 'Fotocromático', 'Fotogray', 'Transition'];
const INDICES = ['1.50', '1.56', '1.60', '1.67', '1.74'];

// Componente de subida de imágenes (igual que en Accesorios)
const ImageUploadComponent = ({ currentImages = [], onImagesChange, maxImages = 5 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  useEffect(() => {
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
      script.async = true;
      document.head.appendChild(script);
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, []);

  const handleOpenWidget = () => {
    if (!window.cloudinary) {
      alert('El sistema de carga de imágenes no está disponible. Por favor, recarga la página.');
      return;
    }

    const widget = window.cloudinary.createUploadWidget({
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      sources: ['local', 'camera', 'url'],
      folder: "lentes_cristales",
      multiple: true,
      maxFiles: Math.max(1, maxImages - currentImages.length),
      cropping: false,
      maxImageFileSize: 10000000,
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
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
          "queue.title": "Subir Imágenes",
          "local.browse": "Seleccionar",
          "camera.capture": "Tomar foto"
        }
      }
    }, (error, result) => {
      if (error) {
        console.error('Error uploading:', error);
        setIsUploading(false);
        setUploadingCount(0);
        return;
      }
      
      if (result && result.event === "queues-start") {
        setIsUploading(true);
        setUploadingCount(result.info.files?.length || 1);
      }
      
      if (result && result.event === "success") {
        const newImageUrl = result.info.secure_url;
        const newImages = [...currentImages, newImageUrl];
        onImagesChange(newImages);
      }
      
      if (result && result.event === "queues-end") {
        setIsUploading(false);
        setUploadingCount(0);
      }
    });

    widget.open();
  };

  const removeImage = (index) => {
    const newImages = currentImages.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...currentImages];
    const movedImage = newImages.splice(fromIndex, 1)[0];
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  const normalizeImageUrl = (image) => {
    if (!image) return null;
    
    if (typeof image === 'string') {
      if (image.startsWith('http://') || image.startsWith('https://')) {
        return image.replace('http://', 'https://');
      }
      if (image.includes('cloudinary') || !image.startsWith('http')) {
        return `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${image}`;
      }
      return image;
    }
    
    if (typeof image === 'object' && image !== null) {
      return image.secure_url || image.url || null;
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Imágenes del Producto</h3>
        <div className="flex items-center space-x-3">
          {currentImages.length > 0 && (
            <span className="text-sm text-gray-500">{currentImages.length}/{maxImages}</span>
          )}
          <button
            type="button"
            onClick={handleOpenWidget}
            disabled={isUploading || currentImages.length >= maxImages}
            className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Subiendo {uploadingCount > 1 ? `${uploadingCount} imágenes` : 'imagen'}...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {currentImages.length === 0 ? 'Subir Imágenes' : 'Agregar Más'}
              </>
            )}
          </button>
        </div>
      </div>

      {currentImages.length === 0 && !isUploading && (
        <div 
          onClick={handleOpenWidget}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-colors"
        >
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">
            Sube las imágenes del producto
          </h4>
          <p className="text-gray-500 mb-4">
            Arrastra imágenes aquí o haz clic para seleccionar archivos
          </p>
          <p className="text-xs text-gray-400">
            Formatos: JPG, PNG, WEBP • Máximo {maxImages} imágenes • Hasta 10MB cada una
          </p>
        </div>
      )}

      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentImages.map((image, index) => {
            const imageUrl = normalizeImageUrl(image);
            
            return (
              <div key={`image-${index}-${imageUrl}`} className="relative group">
                <div className={`aspect-square rounded-lg overflow-hidden border-2 ${
                  index === 0 ? 'border-cyan-500 shadow-lg' : 'border-gray-200'
                } bg-gray-100 relative`}>
                  
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                      loading="lazy"
                      style={{ display: 'block', zIndex: 1 }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div 
                    className="w-full h-full absolute inset-0 items-center justify-center bg-gray-200"
                    style={{ display: 'none', zIndex: 2 }}
                  >
                    <div className="text-center">
                      <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-xs text-gray-500">Error al cargar</span>
                    </div>
                  </div>
                  
                  {index === 0 && (
                    <div className="absolute -top-2 -left-2 bg-cyan-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg z-20">
                      Principal
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium text-gray-700 z-10">
                    {index + 1}
                  </div>
                </div>
                
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 z-30">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, 0)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-cyan-50 transition-colors border"
                      title="Hacer principal"
                    >
                      <Tag className="w-3 h-3 text-cyan-600" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors border"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              </div>
            );
          })}
          
          {currentImages.length < maxImages && (
            <div 
              onClick={handleOpenWidget}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-colors"
            >
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-xs text-gray-500">Agregar más</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente para campo de precio
const PriceField = ({ label, value, onChange, error, required = false, placeholder = "0.00" }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= 0) {
      onChange(numValue);
    } else if (newValue === '') {
      onChange(0);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && ' *'}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <DollarSign className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="number"
          step="0.01"
          min="0"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 ${
            error ? 'border-red-500 animate-shake' : 'border-gray-300 hover:border-cyan-300'
          }`}
        />
      </div>
      {error && (
        <div className="mt-1 text-red-500 text-sm flex items-center space-x-1 animate-slideInDown">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Componente para selector de promociones
const PromocionSelector = ({ promociones = [], selectedPromocion, onPromocionChange, precioBase, error }) => {
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  
  const promocionesActivas = promociones.filter(promo => {
    if (!promo.fechaFin) return true;
    const fechaFin = new Date(promo.fechaFin);
    const hoy = new Date();
    return fechaFin >= hoy;
  });

  useEffect(() => {
    if (selectedPromocion && precioBase) {
      const promo = promocionesActivas.find(p => p._id === selectedPromocion);
      if (promo) {
        let newPrice = precioBase;
        if (promo.tipoDescuento === 'porcentaje') {
          newPrice = precioBase * (1 - (promo.valorDescuento / 100));
        } else if (promo.tipoDescuento === 'monto_fijo') {
          newPrice = Math.max(0, precioBase - promo.valorDescuento);
        }
        setCalculatedPrice(newPrice.toFixed(2));
      }
    } else {
      setCalculatedPrice(null);
    }
  }, [selectedPromocion, precioBase, promocionesActivas]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Promoción Disponible
      </label>
      
      {promocionesActivas.length === 0 ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              No hay promociones activas disponibles
            </span>
          </div>
        </div>
      ) : (
        <>
          <select
            value={selectedPromocion || ''}
            onChange={onPromocionChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 ${
              error ? 'border-red-500 animate-shake' : 'border-gray-300 hover:border-cyan-300'
            }`}
          >
            <option value="">Seleccionar promoción...</option>
            {promocionesActivas.map((promo) => {
              const descuento = promo.tipoDescuento === 'porcentaje' 
                ? `${promo.valorDescuento}% OFF`
                : `${promo.valorDescuento} OFF`;
              const fechaFin = promo.fechaFin 
                ? new Date(promo.fechaFin).toLocaleDateString('es-ES')
                : null;
              
              return (
                <option key={promo._id} value={promo._id}>
                  {promo.nombre} - {descuento}
                  {fechaFin && ` (Hasta ${fechaFin})`}
                </option>
              );
            })}
          </select>
          
          {calculatedPrice && precioBase && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-800">
                  <span className="font-medium">Precio original:</span> ${precioBase.toFixed(2)}
                </span>
                <span className="text-lg font-bold text-green-600">
                  ${calculatedPrice}
                </span>
              </div>
              <div className="text-xs text-green-600 mt-1">
                Ahorro: ${(precioBase - parseFloat(calculatedPrice)).toFixed(2)}
              </div>
            </div>
          )}
        </>
      )}
      
      {error && (
        <div className="mt-1 text-red-500 text-sm flex items-center space-x-1 animate-slideInDown">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Componente principal
export default function LentesCristalesFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  marcas = [],
  categorias = [],
  promociones = []
}) {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    categoriaId: '',
    marcaId: '',
    vision: 'Sencilla',
    material: 'Vidrio',
    protecciones: [],
    indice: '1.50',
    precioBase: '',
    precioActual: '',
    enPromocion: false,
    promocionId: '',
    imagenes: [],
  });

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        ...initialData,
        categoriaId: initialData.categoriaId?._id || initialData.categoriaId || '',
        marcaId: initialData.marcaId?._id || initialData.marcaId || '',
        vision: initialData.vision || 'Sencilla',
        material: initialData.material || 'Vidrio',
        protecciones: initialData.protecciones || [],
        indice: initialData.indice || '1.50',
        precioActual: initialData.enPromocion
          ? initialData.precioActual || initialData.precioBase
          : initialData.precioBase,
        imagenes: initialData.imagenes || [],
      }));
    }
  }, [initialData]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProteccionesChange = (value) => {
    setForm((prev) => {
      const exists = prev.protecciones.includes(value);
      return {
        ...prev,
        protecciones: exists
          ? prev.protecciones.filter((p) => p !== value)
          : [...prev.protecciones, value],
      };
    });
  };

  const handleImagesChange = (newImages) => {
    setForm((prev) => ({ ...prev, imagenes: newImages }));
  };

  const handlePrecioBaseChange = (newPrice) => {
    setForm((prev) => ({
      ...prev,
      precioBase: newPrice,
      precioActual: prev.enPromocion ? prev.precioActual : newPrice
    }));
  };

  const handlePromocionChange = (e) => {
    const enPromocion = e.target.checked;
    setForm((prev) => ({
      ...prev,
      enPromocion,
      precioActual: enPromocion ? prev.precioActual : prev.precioBase,
      promocionId: enPromocion ? prev.promocionId : ''
    }));
  };

  const handlePromocionSelectChange = (e) => {
    const promocionId = e.target.value;
    
    setForm((prev) => {
      let newPrecioActual = prev.precioBase;
      
      if (promocionId && prev.precioBase) {
        const promo = promociones.find(p => p._id === promocionId);
        if (promo) {
          if (promo.tipoDescuento === 'porcentaje') {
            newPrecioActual = prev.precioBase * (1 - (promo.valorDescuento / 100));
          } else if (promo.tipoDescuento === 'monto_fijo') {
            newPrecioActual = Math.max(0, prev.precioBase - promo.valorDescuento);
          }
          newPrecioActual = parseFloat(newPrecioActual.toFixed(2));
        }
      }
      
      return {
        ...prev,
        promocionId,
        precioActual: newPrecioActual
      };
    });
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ form, files: [] });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slideInScale">
        <div className="bg-cyan-500 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">
              {initialData ? 'Editar Lente (Cristal)' : 'Agregar Nuevo Lente'}
            </h3>
            <button 
              type="button"
              onClick={onClose} 
              className="text-white hover:bg-cyan-600 rounded-lg p-2 transition-all duration-200 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes slideInScale {
            from {
              transform: scale(0.95) translateY(20px);
              opacity: 0;
            }
            to {
              transform: scale(1) translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          
          @keyframes slideInDown {
            from {
              transform: translateY(-10px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
          
          .animate-slideInScale {
            animation: slideInScale 0.3s ease-out;
          }
          
          .animate-shake {
            animation: shake 0.3s ease-in-out;
          }
          
          .animate-slideInDown {
            animation: slideInDown 0.2s ease-out;
          }
        `}</style>

        <form onSubmit={submit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto">
            
            {/* Información Básica */}
            <div className="bg-white border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 hover:border-cyan-300"
                    placeholder="Ej: Lente Antirreflejante Premium"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca *
                  </label>
                  <select
                    name="marcaId"
                    value={form.marcaId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 hover:border-cyan-300"
                    required
                  >
                    <option value="">Seleccione una marca...</option>
                    {marcas.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    name="categoriaId"
                    value={form.categoriaId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 hover:border-cyan-300"
                  >
                    <option value="">(Opcional)</option>
                    {categorias.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-none hover:border-cyan-300"
                    rows={3}
                    placeholder="Describe las características y beneficios del lente..."
                  />
                </div>
              </div>
            </div>

            {/* Características del Lente */}
            <div className="bg-white border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                Características del Lente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Visión *
                  </label>
                  <select
                    name="vision"
                    value={form.vision}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 hover:border-cyan-300"
                  >
                    {VISION.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material *
                  </label>
                  <select
                    name="material"
                    value={form.material}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 hover:border-cyan-300"
                  >
                    {MATERIALS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Índice de Refracción *
                  </label>
                  <select
                    name="indice"
                    value={form.indice}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 hover:border-cyan-300"
                  >
                    {INDICES.map((idx) => (
                      <option key={idx} value={idx}>
                        {idx}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Protecciones
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {PROTECCIONES.map((p) => (
                      <label
                        key={p}
                        className={`px-4 py-2 rounded-full border cursor-pointer transition-colors ${
                          form.protecciones.includes(p)
                            ? 'bg-cyan-100 border-cyan-300 text-cyan-700'
                            : 'bg-white border-gray-300 hover:border-cyan-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={form.protecciones.includes(p)}
                          onChange={() => handleProteccionesChange(p)}
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Imágenes */}
            <div className="bg-white border rounded-xl p-6">
              <ImageUploadComponent
                currentImages={form.imagenes}
                onImagesChange={handleImagesChange}
                maxImages={5}
              />
            </div>

            {/* Precios y Promoción */}
            <div className="bg-white border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                Información de Precios
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PriceField
                  label="Precio Base"
                  value={form.precioBase}
                  onChange={handlePrecioBaseChange}
                  required={true}
                  placeholder="0.00"
                />
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="enPromocion"
                      name="enPromocion"
                      checked={form.enPromocion || false}
                      onChange={handlePromocionChange}
                      className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="enPromocion" className="text-sm font-medium text-gray-700">
                      Producto en promoción
                    </label>
                  </div>
                  
                  {form.enPromocion && (
                    <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <PromocionSelector
                        promociones={promociones}
                        selectedPromocion={form.promocionId}
                        onPromocionChange={handlePromocionSelectChange}
                        precioBase={form.precioBase}
                      />
                      
                      <PriceField
                        label="Precio con Promoción (ajustar manualmente si es necesario)"
                        value={form.precioActual}
                        onChange={(value) => {
                          setForm(prev => ({
                            ...prev,
                            precioActual: value
                          }));
                        }}
                        required={true}
                        placeholder="0.00"
                      />
                      
                      {form.precioBase && form.precioActual && form.precioBase > form.precioActual && (
                        <div className="bg-green-100 border border-green-300 rounded p-3">
                          <p className="text-green-800 text-sm font-medium">
                            Descuento: ${(form.precioBase - form.precioActual).toFixed(2)} 
                            ({(((form.precioBase - form.precioActual) / form.precioBase) * 100).toFixed(1)}% OFF)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!form.enPromocion && form.precioBase && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      <p><span className="font-medium">Precio actual:</span> ${form.precioBase.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-1">El precio actual es igual al precio base cuando no hay promoción</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 bg-gray-50 rounded-b-xl">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200 hover:scale-105 font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all duration-200 hover:scale-105 font-medium inline-flex items-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>{initialData ? 'Actualizar' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}