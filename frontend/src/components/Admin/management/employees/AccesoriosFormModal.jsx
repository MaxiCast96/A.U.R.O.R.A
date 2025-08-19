import React, { useState, useEffect, useMemo } from 'react';
import FormModal from '../../ui/FormModal';
import { Camera, Upload, X, Package, Edit3, Eye, EyeOff, Plus, Trash2, AlertCircle, Check, Loader, DollarSign, Tag } from 'lucide-react';

// Componente de subida de imágenes profesional con fix para imágenes negras
const ImageUploadComponent = ({ currentImages = [], onImagesChange, maxImages = 5 }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [imageLoadStates, setImageLoadStates] = useState(new Map()); // Nuevo estado para tracking

  const handleOpenWidget = () => {
    if (!window.cloudinary) return;
    const widget = window.cloudinary.createUploadWidget({
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      sources: ['local', 'camera', 'url'],
      folder: "accesorios",
      multiple: true,
      maxFiles: maxImages - currentImages.length,
      cropping: false,
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
          "queue.title": "Subir Imágenes",
          "local.browse": "Seleccionar",
          "camera.capture": "Tomar foto",
          "crop.title": "Recortar imagen"
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
        setUploadingCount(result.info.files.length);
      }
      
      if (result && result.event === "success") {
        const newImages = [...currentImages, result.info.secure_url];
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
    // Limpiar estados relacionados con la imagen eliminada
    setImageLoadErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    setImageLoadStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(index);
      return newMap;
    });
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...currentImages];
    const movedImage = newImages.splice(fromIndex, 1)[0];
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  const handleImageError = (index, imageUrl) => {
    console.error(`Error loading image at index ${index}:`, imageUrl);
    setImageLoadErrors(prev => new Set([...prev, index]));
    setImageLoadStates(prev => new Map([...prev, [index, 'error']]));
  };

  const handleImageLoad = (index) => {
    setImageLoadErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    setImageLoadStates(prev => new Map([...prev, [index, 'loaded']]));
  };

  const handleImageLoadStart = (index) => {
    setImageLoadStates(prev => new Map([...prev, [index, 'loading']]));
  };

  // Función para normalizar URLs de Cloudinary
  const normalizeImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // Si es una URL de Cloudinary, asegurar que use HTTPS
    if (imageUrl.includes('cloudinary.com')) {
      return imageUrl.replace('http://', 'https://');
    }
    
    // Si es un objeto con propiedades de imagen
    if (typeof imageUrl === 'object') {
      return imageUrl.secure_url || imageUrl.url || null;
    }
    
    return imageUrl;
  };

  // Función para generar URL alternativa en caso de error
  const getAlternativeImageUrl = (originalUrl) => {
    if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
      return originalUrl;
    }
    
    try {
      // Intentar transformar la URL para forzar regeneración
      const url = new URL(originalUrl);
      const pathParts = url.pathname.split('/');
      
      // Buscar el índice donde están los parámetros de transformación
      const uploadIndex = pathParts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex < pathParts.length - 1) {
        // Insertar parámetros de transformación básicos
        pathParts.splice(uploadIndex + 1, 0, 'f_auto,q_auto');
        url.pathname = pathParts.join('/');
        return url.toString();
      }
    } catch (error) {
      console.error('Error processing Cloudinary URL:', error);
    }
    
    return originalUrl;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Imágenes del Producto</h3>
        {currentImages.length > 0 && (
          <span className="text-sm text-gray-500">{currentImages.length}/{maxImages} imágenes</span>
        )}
      </div>
      
      {/* Botón para agregar imágenes */}
      {currentImages.length > 0 && (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {currentImages.map((image, index) => {
      const hasError = imageLoadErrors.has(index);
      const imageUrl = typeof image === 'string' ? image : image?.secure_url || image?.url;
      
      return (
        <div key={`${imageUrl}-${index}`} className="relative bg-white rounded-lg shadow-sm border">
          {/* IMAGEN LIMPIA */}
          <div className={`aspect-square rounded-t-lg overflow-hidden ${
            index === 0 ? 'ring-2 ring-cyan-500' : ''
          }`}>
            {hasError ? (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-xs text-gray-500">Error al cargar</span>
                </div>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(index)}
                onLoad={() => handleImageLoad(index)}
                loading="lazy"
                crossOrigin="anonymous"
              />
            )}
          </div>
          
          {/* CONTROLES EN BARRA INFERIOR */}
          <div className="p-2 flex items-center justify-between bg-gray-50 rounded-b-lg">
            <span className="text-xs text-gray-600">
              {index === 0 ? '🏷️ Principal' : `Imagen ${index + 1}`}
            </span>
            
            <div className="flex space-x-1">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => moveImage(index, 0)}
                  className="p-1 text-cyan-600 hover:bg-cyan-100 rounded transition-colors"
                  title="Hacer principal"
                >
                  <Tag className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                title="Eliminar imagen"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      );
    })}
  </div>
)}

      {/* Grid de imágenes con fix mejorado */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {currentImages.map((image, index) => {
            const hasError = imageLoadErrors.has(index);
            const loadState = imageLoadStates.get(index);
            const normalizedUrl = normalizeImageUrl(image);
            const alternativeUrl = getAlternativeImageUrl(normalizedUrl);
            const imageKey = `image-${index}-${normalizedUrl}`; // Key único para forzar re-render
            
            return (
              <div key={imageKey} className="relative group">
                <div className={`aspect-square rounded-lg overflow-hidden border-2 ${
                  index === 0 ? 'border-cyan-500' : 'border-gray-200'
                } bg-gray-100`}>
                  {hasError ? (
                    <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center p-2">
                      <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500 text-center">Error al cargar imagen</span>
                      <button 
                        onClick={() => {
                          // Intentar recargar la imagen
                          setImageLoadErrors(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(index);
                            return newSet;
                          });
                          setImageLoadStates(prev => {
                            const newMap = new Map(prev);
                            newMap.delete(index);
                            return newMap;
                          });
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                      >
                        Reintentar
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      {loadState === 'loading' && (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                          <Loader className="w-6 h-6 text-gray-400 animate-spin" />
                        </div>
                      )}
                      
                      <img
                        src={alternativeUrl || normalizedUrl}
                        alt={`Imagen ${index + 1}`}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          loadState === 'loaded' ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoadStart={() => handleImageLoadStart(index)}
                        onLoad={() => handleImageLoad(index)}
                        onError={() => handleImageError(index, normalizedUrl)}
                        loading="lazy"
                        crossOrigin="anonymous"
                        // Atributos adicionales para debugging
                        data-original-url={normalizedUrl}
                        data-alternative-url={alternativeUrl}
                      />
                    </div>
                  )}
                </div>
                
                {/* Badge de imagen principal */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-cyan-500 text-white px-2 py-1 rounded-full text-xs font-medium z-20">
                    Principal
                  </div>
                )}
                
                {/* Indicador de estado de carga */}
                {loadState === 'loading' && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full z-20">
                    <Loader className="w-3 h-3 animate-spin" />
                  </div>
                )}
                
                {/* Controles de imagen */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-2 z-30">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, 0)}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-all"
                        title="Hacer principal"
                      >
                        <Tag className="w-4 h-4 text-cyan-600" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-all"
                      title="Eliminar imagen"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                
                {/* Debug info (solo en desarrollo) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 truncate">
                    {loadState || 'unknown'} - {normalizedUrl?.substring(0, 30)}...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {currentImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">
            <span className="font-medium">Nota:</span> La primera imagen será la imagen principal del producto. 
            Puedes reordenar haciendo clic en "Hacer principal".
          </p>
          
          {/* Información de debug para desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
              <strong>Debug Info:</strong>
              <ul className="mt-1 space-y-1">
                <li>Total imágenes: {currentImages.length}</li>
                <li>Errores de carga: {imageLoadErrors.size}</li>
                <li>Estados de carga: {JSON.stringify(Object.fromEntries(imageLoadStates))}</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente para selección múltiple de sucursales
const SucursalesSelector = ({ sucursales, selectedSucursales, onChange, errors }) => {
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    setIsAllSelected(selectedSucursales.length === sucursales.length && sucursales.length > 0);
  }, [selectedSucursales, sucursales]);

  const handleToggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      const allSucursales = sucursales.map(sucursal => ({
        sucursalId: sucursal._id,
        nombreSucursal: sucursal.nombre,
        stock: 0
      }));
      onChange(allSucursales);
    }
  };

  const handleToggleSucursal = (sucursal) => {
    const exists = selectedSucursales.find(s => s.sucursalId === sucursal._id);
    
    if (exists) {
      const newSelected = selectedSucursales.filter(s => s.sucursalId !== sucursal._id);
      onChange(newSelected);
    } else {
      const newSelected = [...selectedSucursales, {
        sucursalId: sucursal._id,
        nombreSucursal: sucursal.nombre,
        stock: 0
      }];
      onChange(newSelected);
    }
  };

  const handleStockChange = (sucursalId, stock) => {
    const newSelected = selectedSucursales.map(s => 
      s.sucursalId === sucursalId ? { ...s, stock: parseInt(stock) || 0 } : s
    );
    onChange(newSelected);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Sucursales Disponibles *
        </label>
        <button
          type="button"
          onClick={handleToggleAll}
          className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
        >
          {isAllSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
        </button>
      </div>
      
      <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
        {sucursales.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay sucursales disponibles</p>
        ) : (
          <div className="space-y-3">
            {sucursales.map((sucursal) => {
              const isSelected = selectedSucursales.find(s => s.sucursalId === sucursal._id);
              
              return (
                <div key={sucursal._id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                  <input
                    type="checkbox"
                    id={`sucursal-${sucursal._id}`}
                    checked={!!isSelected}
                    onChange={() => handleToggleSucursal(sucursal)}
                    className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                  />
                  <label
                    htmlFor={`sucursal-${sucursal._id}`}
                    className="flex-1 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {sucursal.nombre}
                  </label>
                  
                  {isSelected && (
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-gray-500">Stock:</label>
                      <input
                        type="number"
                        min="0"
                        value={isSelected.stock}
                        onChange={(e) => handleStockChange(sucursal._id, e.target.value)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {selectedSucursales.length > 0 && (
        <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
          ✓ {selectedSucursales.length} sucursal(es) seleccionada(s)
        </div>
      )}
      
      {errors && <p className="text-red-500 text-sm">{errors}</p>}
    </div>
  );
};

// Componente para campo de precio con validación
const PriceField = ({ label, value, onChange, error, required = false, placeholder = "0.00" }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Validar que sea un número válido
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
          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

// Componente para selector de promociones mejorado
const PromocionSelector = ({ promociones, selectedPromocion, onPromocionChange, precioBase, error }) => {
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  
  // Filtrar promociones activas
  const promocionesActivas = promociones.filter(promo => {
    if (!promo.fechaFin) return true; // Sin fecha de fin, siempre activa
    const fechaFin = new Date(promo.fechaFin);
    const hoy = new Date();
    return fechaFin >= hoy;
  });

  // Calcular precio con descuento cuando cambie la selección
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
        Promoción Disponible *
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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccionar promoción...</option>
            {promocionesActivas.map((promo) => {
              const descuento = promo.tipoDescuento === 'porcentaje' 
                ? `${promo.valorDescuento}% OFF`
                : `$${promo.valorDescuento} OFF`;
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
          
          {/* Vista previa del precio con descuento */}
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
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

const AccesoriosFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  formData,
  handleInputChange,
  errors,
  isEditing = false,
  marcas = [],
  categorias = [],
  sucursales = [],
  promociones = [], // Nueva prop para promociones
  selectedAccesorio = null
}) => {
  // Estados locales para manejo de imágenes y líneas
  const [lineasDisponibles, setLineasDisponibles] = useState([]);
  const [loadingLineas, setLoadingLineas] = useState(false);

  // Cargar líneas cuando cambia la marca
  useEffect(() => {
    if (formData.marcaId) {
      setLoadingLineas(true);
      // Simular carga de líneas desde la marca
      setTimeout(() => {
        const lineasPorMarca = {
          // Esto debería venir del backend, pero por ahora simulo datos
          default: ['Económica', 'Estándar', 'Premium', 'Luxury']
        };
        setLineasDisponibles(lineasPorMarca.default || []);
        setLoadingLineas(false);
      }, 500);
    } else {
      setLineasDisponibles([]);
    }
  }, [formData.marcaId]);

  // Manejar cambio de imágenes
  const handleImagesChange = (newImages) => {
    handleInputChange({
      target: {
        name: 'imagenes',
        value: newImages
      }
    });
  };

  // Manejar cambio de sucursales
  const handleSucursalesChange = (newSucursales) => {
    handleInputChange({
      target: {
        name: 'sucursales',
        value: newSucursales
      }
    });
  };

  // Manejar cambio de precio base
  const handlePrecioBaseChange = (newPrice) => {
    handleInputChange({
      target: {
        name: 'precioBase',
        value: newPrice
      }
    });
    
    // Si no está en promoción, el precio actual es igual al precio base
    if (!formData.enPromocion) {
      handleInputChange({
        target: {
          name: 'precioActual',
          value: newPrice
        }
      });
    }
  };

  // Manejar cambio de estado de promoción
  const handlePromocionChange = (e) => {
    const enPromocion = e.target.checked;
    handleInputChange(e);
    
    // Si se desactiva la promoción, el precio actual vuelve a ser el precio base
    if (!enPromocion) {
      handleInputChange({
        target: {
          name: 'precioActual',
          value: formData.precioBase || 0
        }
      });
      handleInputChange({
        target: {
          name: 'promocionId',
          value: ''
        }
      });
    }
  };

  // Manejar selección de promoción específica
  const handlePromocionSelectChange = (e) => {
    const promocionId = e.target.value;
    
    handleInputChange({
      target: {
        name: 'promocionId',
        value: promocionId
      }
    });

    // Calcular precio automáticamente
    if (promocionId && formData.precioBase) {
      const promo = promociones.find(p => p._id === promocionId);
      if (promo) {
        let newPrice = formData.precioBase;
        if (promo.tipoDescuento === 'porcentaje') {
          newPrice = formData.precioBase * (1 - (promo.valorDescuento / 100));
        } else if (promo.tipoDescuento === 'monto_fijo') {
          newPrice = Math.max(0, formData.precioBase - promo.valorDescuento);
        }
        
        handleInputChange({
          target: {
            name: 'precioActual',
            value: parseFloat(newPrice.toFixed(2))
          }
        });
      }
    }
  };

  const sections = [
    {
      title: "📦 Información Básica",
      fields: [
        {
          name: 'nombre',
          label: 'Nombre del Accesorio',
          type: 'text',
          placeholder: 'Ej: Estuche de cuero premium',
          required: true,
          className: 'md:col-span-2'
        },
        {
          name: 'descripcion',
          label: 'Descripción',
          type: 'textarea',
          placeholder: 'Describe las características y beneficios del accesorio...',
          required: true,
          className: 'md:col-span-2'
        }
      ]
    },
    {
      title: "🏷️ Categorización",
      fields: [
        {
          name: 'tipo',
          label: 'Categoría',
          type: 'select',
          options: categorias?.map(cat => ({ value: cat._id, label: cat.nombre })) || [],
          placeholder: 'Seleccione una categoría',
          required: true
        },
        {
          name: 'marcaId',
          label: 'Marca',
          type: 'select',
          options: marcas?.map(marca => ({ value: marca._id, label: marca.nombre })) || [],
          placeholder: 'Seleccione una marca',
          required: true
        },
        {
          name: 'linea',
          label: 'Línea de Producto',
          type: 'select',
          options: lineasDisponibles.map(linea => ({ value: linea, label: linea })),
          placeholder: loadingLineas ? 'Cargando líneas...' : 'Seleccione una línea',
          required: true,
          disabled: !formData.marcaId || loadingLineas
        }
      ]
    },
    {
      title: "🎨 Características Físicas",
      fields: [
        {
          name: 'material',
          label: 'Material',
          type: 'select',
          options: [
            'Cuero', 'Cuero sintético', 'Tela', 'Plástico', 'Metal', 
            'Silicona', 'Goma', 'Madera', 'Fibra de carbono', 'Otro'
          ],
          placeholder: 'Seleccione el material',
          required: true
        },
        {
          name: 'color',
          label: 'Color',
          type: 'select',
          options: [
            'Negro', 'Marrón', 'Blanco', 'Gris', 'Azul', 'Rojo', 
            'Verde', 'Amarillo', 'Naranja', 'Rosa', 'Morado', 'Multicolor'
          ],
          placeholder: 'Seleccione el color',
          required: true
        }
      ]
    }
  ];

  const customContent = (
    <div className="space-y-8">
      {/* Secciones de campos básicos */}
      {sections.map((section, idx) => (
        <div key={idx} className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
            {section.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.fields.map((field, fIdx) => (
              <div key={fIdx} className={field.className || ''}>
                <EnhancedField
                  field={field}
                  value={formData?.[field.name]}
                  onChange={handleInputChange}
                  error={errors?.[field.name]}
                  formData={formData}
                  loadingLineas={loadingLineas}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Sección de imágenes */}
      <div className="bg-white border rounded-xl p-6">
        <ImageUploadComponent
          currentImages={formData?.imagenes || []}
          onImagesChange={handleImagesChange}
          maxImages={5}
        />
      </div>

      {/* Sección de precios mejorada */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
          💰 Información de Precios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PriceField
            label="Precio Base"
            value={formData?.precioBase}
            onChange={handlePrecioBaseChange}
            error={errors?.precioBase}
            required={true}
            placeholder="0.00"
          />
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enPromocion"
                name="enPromocion"
                checked={formData?.enPromocion || false}
                onChange={handlePromocionChange}
                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <label htmlFor="enPromocion" className="text-sm font-medium text-gray-700">
                Producto en promoción
              </label>
            </div>
            
            {formData?.enPromocion && (
              <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                {/* Selector de promoción */}
                <PromocionSelector
                  promociones={promociones}
                  selectedPromocion={formData?.promocionId}
                  onPromocionChange={handlePromocionSelectChange}
                  precioBase={formData?.precioBase}
                  error={errors?.promocionId}
                />
                
                {/* Campo manual de precio promocional */}
                <PriceField
                  label="Precio con Promoción (ajustar manualmente si es necesario)"
                  value={formData?.precioActual}
                  onChange={(value) => handleInputChange({
                    target: { name: 'precioActual', value }
                  })}
                  error={errors?.precioActual}
                  required={true}
                  placeholder="0.00"
                />
                
                {formData?.precioBase && formData?.precioActual && formData.precioBase > formData.precioActual && (
                  <div className="bg-green-100 border border-green-300 rounded p-3">
                    <p className="text-green-800 text-sm font-medium">
                      💰 Descuento: ${(formData.precioBase - formData.precioActual).toFixed(2)} 
                      ({(((formData.precioBase - formData.precioActual) / formData.precioBase) * 100).toFixed(1)}% OFF)
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {!formData?.enPromocion && formData?.precioBase && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p><span className="font-medium">Precio actual:</span> ${formData.precioBase.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">El precio actual es igual al precio base cuando no hay promoción</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección de sucursales */}
      <div className="bg-white border rounded-xl p-6">
        <SucursalesSelector
          sucursales={sucursales}
          selectedSucursales={formData?.sucursales || []}
          onChange={handleSucursalesChange}
          errors={errors?.sucursales}
        />
      </div>

      {/* Resumen final */}
      {formData?.nombre && formData?.precioBase && (formData?.sucursales?.length > 0) && (
        <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-6">
          <h4 className="font-semibold text-cyan-800 mb-3">📋 Resumen del Producto</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Producto:</span> {formData.nombre}</p>
              <p><span className="font-medium">Precio:</span> ${formData.precioActual || formData.precioBase || 0}</p>
              {formData.enPromocion && formData.promocionId && (
                <p className="text-green-600">
                  <span className="font-medium">🏷️ En promoción:</span> {
                    promociones.find(p => p._id === formData.promocionId)?.nombre || 'Promoción seleccionada'
                  }
                </p>
              )}
            </div>
            <div>
              <p><span className="font-medium">Sucursales:</span> {formData.sucursales?.length || 0}</p>
              <p><span className="font-medium">Imágenes:</span> {formData.imagenes?.length || 0}</p>
              <p><span className="font-medium">Stock total:</span> {
                formData.sucursales?.reduce((total, s) => total + (s.stock || 0), 0) || 0
              } unidades</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      formData={formData}
      handleInputChange={handleInputChange}
      errors={errors}
      submitLabel={isEditing ? "Actualizar Accesorio" : "Crear Accesorio"}
      submitIcon={<Package className="w-4 h-4" />}
      fields={[]}
      gridCols={1}
      size="xl"
    >
      {customContent}
    </FormModal>
  );
};

// Componente auxiliar para campos mejorados
const EnhancedField = ({ field, value, onChange, error, formData, loadingLineas }) => {
  const getFieldValue = () => value || '';

  const inputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
    error ? 'border-red-500' : 'border-gray-300'
  } ${field.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`;

  if (field.type === 'select') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}{field.required && ' *'}
        </label>
        <div className="relative">
          <select
            name={field.name}
            value={getFieldValue()}
            onChange={onChange}
            className={inputClasses}
            disabled={field.disabled}
          >
            <option value="">{field.placeholder || 'Seleccione'}</option>
            {field.options?.map((opt, idx) => 
              typeof opt === 'object' ? 
                <option key={idx} value={opt.value}>{opt.label}</option> : 
                <option key={idx} value={opt}>{opt}</option>
            )}
          </select>
          {loadingLineas && field.name === 'linea' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader className="w-4 h-4 text-gray-400 animate-spin" />
            </div>
          )}
        </div>
        {field.disabled && field.name === 'linea' && !formData?.marcaId && (
          <p className="text-gray-500 text-xs">Primero selecciona una marca</p>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}{field.required && ' *'}
        </label>
        <textarea
          name={field.name}
          value={getFieldValue()}
          onChange={onChange}
          placeholder={field.placeholder}
          className={`${inputClasses} resize-none`}
          rows={3}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}{field.required && ' *'}
      </label>
      <input
        type={field.type}
        name={field.name}
        value={getFieldValue()}
        onChange={onChange}
        placeholder={field.placeholder}
        className={inputClasses}
        step={field.type === 'number' ? '0.01' : undefined}
        min={field.type === 'number' ? '0' : undefined}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default AccesoriosFormModal;