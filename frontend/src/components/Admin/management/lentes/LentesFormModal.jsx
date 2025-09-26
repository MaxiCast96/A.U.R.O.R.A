// src/components/management/lentes/LentesFormModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import FormModal from '../../ui/FormModal';
import { Camera, Upload, X, Package, Edit3, Eye, EyeOff, Plus, Trash2, AlertCircle, Check, Loader, DollarSign, Tag, Glasses, Ruler } from 'lucide-react';

// Componente de subida de imágenes usando Cloudinary
const ImageUploadComponent = ({ currentImages = [], onImagesChange, maxImages = 5 }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  useEffect(() => {
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
      script.async = true;
      script.onload = () => {
        console.log('Cloudinary script loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load Cloudinary script');
      };
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
      folder: "lentes",
      multiple: true,
      maxFiles: Math.max(1, maxImages - currentImages.length),
      cropping: false,
      maxImageFileSize: 10000000,
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ],
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
        console.log('Image uploaded successfully:', newImageUrl);
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
        <h3 className="text-lg font-medium text-gray-900">Imágenes del Lente</h3>
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
            Sube las imágenes del lente
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
                      alt={`Lente ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        console.error('Error loading image:', imageUrl);
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', imageUrl);
                        e.target.style.display = 'block';
                        if (e.target.nextElementSibling) {
                          e.target.nextElementSibling.style.display = 'none';
                        }
                      }}
                      loading="lazy"
                      style={{ display: 'block', zIndex: 1 }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Glasses className="w-8 h-8 text-gray-400" />
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

// Componente para medidas del lente
const MedidasFields = ({ medidas, onChange, errors }) => {
  const handleMedidaChange = (field, value) => {
    const newMedidas = {
      ...medidas,
      [field]: value
    };
    onChange(newMedidas);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Ancho Puente (mm) *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Ruler className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="number"
            step="0.1"
            min="0"
            value={medidas?.anchoPuente || ''}
            onChange={(e) => handleMedidaChange('anchoPuente', e.target.value)}
            placeholder="14.0"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
              errors?.['medidas.anchoPuente'] ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors?.['medidas.anchoPuente'] && <p className="text-red-500 text-sm">{errors['medidas.anchoPuente']}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Altura (mm) *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Ruler className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="number"
            step="0.1"
            min="0"
            value={medidas?.altura || ''}
            onChange={(e) => handleMedidaChange('altura', e.target.value)}
            placeholder="45.0"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
              errors?.['medidas.altura'] ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors?.['medidas.altura'] && <p className="text-red-500 text-sm">{errors['medidas.altura']}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Ancho Total (mm) *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Ruler className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="number"
            step="0.1"
            min="0"
            value={medidas?.ancho || ''}
            onChange={(e) => handleMedidaChange('ancho', e.target.value)}
            placeholder="140.0"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
              errors?.['medidas.ancho'] ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors?.['medidas.ancho'] && <p className="text-red-500 text-sm">{errors['medidas.ancho']}</p>}
      </div>
    </div>
  );
};

// Componente para selector de promociones
const PromocionSelector = ({ promociones, selectedPromocion, onPromocionChange, precioBase, error }) => {
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

const LentesFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  formData,
  setFormData,
  handleInputChange,
  errors,
  isEditing = false,
  categorias = [],
  marcas = [],
  promociones = [],
  sucursales = [],
  selectedLente = null
}) => {
  const [lineasDisponibles, setLineasDisponibles] = useState([]);
  const [loadingLineas, setLoadingLineas] = useState(false);

  // Cargar líneas cuando cambia la marca
  useEffect(() => {
    if (formData.marcaId) {
      setLoadingLineas(true);
      setTimeout(() => {
        const lineasPorMarca = {
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
    if (setFormData) {
      setFormData(prev => ({
        ...prev,
        imagenes: newImages
      }));
    } else {
      handleInputChange({
        target: {
          name: 'imagenes',
          value: newImages
        }
      });
    }
  };

  // Manejar cambio de sucursales
  const handleSucursalesChange = (newSucursales) => {
    if (setFormData) {
      setFormData(prev => ({
        ...prev,
        sucursales: newSucursales
      }));
    } else {
      handleInputChange({
        target: {
          name: 'sucursales',
          value: newSucursales
        }
      });
    }
  };

  // Manejar cambio de medidas
  const handleMedidasChange = (newMedidas) => {
    if (setFormData) {
      setFormData(prev => ({
        ...prev,
        medidas: newMedidas
      }));
    } else {
      handleInputChange({
        target: {
          name: 'medidas',
          value: newMedidas
        }
      });
    }
  };

  // Manejar cambio de precio base
  const handlePrecioBaseChange = (newPrice) => {
    if (setFormData) {
      setFormData(prev => ({
        ...prev,
        precioBase: newPrice,
        precioActual: prev.enPromocion ? prev.precioActual : newPrice
      }));
    } else {
      handleInputChange({
        target: {
          name: 'precioBase',
          value: newPrice
        }
      });
      
      if (!formData.enPromocion) {
        handleInputChange({
          target: {
            name: 'precioActual',
            value: newPrice
          }
        });
      }
    }
  };

  // Manejar cambio de estado de promoción
  const handlePromocionChange = (e) => {
    const enPromocion = e.target.checked;
    
    if (setFormData) {
      setFormData(prev => ({
        ...prev,
        enPromocion,
        precioActual: enPromocion ? prev.precioActual : prev.precioBase,
        promocionId: enPromocion ? prev.promocionId : ''
      }));
    } else {
      handleInputChange(e);
      
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
    }
  };

  // Manejar selección de promoción específica
  const handlePromocionSelectChange = (e) => {
    const promocionId = e.target.value;
    
    if (setFormData) {
      setFormData(prev => {
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
    }
  };

  const sections = [
    {
      title: " Información Básica",
      fields: [
        {
          name: 'nombre',
          label: 'Nombre del Lente',
          type: 'text',
          placeholder: 'Ej: Lente progresivo transitions',
          required: true,
          className: 'md:col-span-2'
        },
        {
          name: 'descripcion',
          label: 'Descripción',
          type: 'textarea',
          placeholder: 'Describe las características y beneficios del lente...',
          required: true,
          className: 'md:col-span-2'
        }
      ]
    },
    {
      title: "  Categorización",
      fields: [
        {
          name: 'categoriaId',
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
        },
        {
          name: 'tipoLente',
          label: 'Tipo de Lente',
          type: 'select',
          options: [
            { value: 'Monofocal', label: 'Monofocal' },
            { value: 'Bifocal', label: 'Bifocal' },
            { value: 'Progresivo', label: 'Progresivo' },
            { value: 'Ocupacional', label: 'Ocupacional' }
          ],
          placeholder: 'Seleccione el tipo',
          required: true
        }
      ]
    },
    {
      title: " Características Físicas",
      fields: [
        {
          name: 'material',
          label: 'Material',
          type: 'select',
          options: [
            'Orgánico', 'Policarbonato', 'Trivex', 'Alto índice', 'Cristal mineral', 'CR-39', 'Otro'
          ],
          placeholder: 'Seleccione el material',
          required: true
        },
        {
          name: 'color',
          label: 'Color',
          type: 'select',
          options: [
            'Transparente', 'Amarillo', 'Azul', 'Gris', 'Marrón', 'Verde', 
            'Rosa', 'Fotocromático', 'Polarizado', 'Espejado', 'Degradado'
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

      {/* Sección de medidas */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
           Medidas del Lente
        </h3>
        <MedidasFields
          medidas={formData?.medidas}
          onChange={handleMedidasChange}
          errors={errors}
        />
      </div>

      {/* Sección de imágenes */}
      <div className="bg-white border rounded-xl p-6">
        <ImageUploadComponent
          currentImages={formData?.imagenes || []}
          onImagesChange={handleImagesChange}
          maxImages={5}
        />
      </div>

      {/* Sección de precios */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
           Información de Precios
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
                Lente en promoción
              </label>
            </div>
            
            {formData?.enPromocion && (
              <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <PromocionSelector
                  promociones={promociones}
                  selectedPromocion={formData?.promocionId}
                  onPromocionChange={handlePromocionSelectChange}
                  precioBase={formData?.precioBase}
                  error={errors?.promocionId}
                />
                
                <PriceField
                  label="Precio con Promoción (ajustar manualmente si es necesario)"
                  value={formData?.precioActual}
                  onChange={(value) => {
                    if (setFormData) {
                      setFormData(prev => ({
                        ...prev,
                        precioActual: value
                      }));
                    } else {
                      handleInputChange({
                        target: { name: 'precioActual', value }
                      });
                    }
                  }}
                  error={errors?.precioActual}
                  required={true}
                  placeholder="0.00"
                />
                
                {formData?.precioBase && formData?.precioActual && formData.precioBase > formData.precioActual && (
                  <div className="bg-green-100 border border-green-300 rounded p-3">
                    <p className="text-green-800 text-sm font-medium">
                       Descuento: ${(formData.precioBase - formData.precioActual).toFixed(2)} 
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

      {/* Sección de fecha */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
           Información Adicional
        </h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Fecha de Creación *
          </label>
          <input
            type="date"
            name="fechaCreacion"
            value={formData?.fechaCreacion || ''}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
              errors?.fechaCreacion ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors?.fechaCreacion && <p className="text-red-500 text-sm">{errors.fechaCreacion}</p>}
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
          <h4 className="font-semibold text-cyan-800 mb-3">  Resumen del Lente</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Lente:</span> {formData.nombre}</p>
              <p><span className="font-medium">Tipo:</span> {formData.tipoLente}</p>
              <p><span className="font-medium">Precio:</span> ${(formData.precioActual || formData.precioBase || 0).toFixed(2)}</p>
              {formData.enPromocion && formData.promocionId && (
                <p className="text-green-600">
                  <span className="font-medium">  En promoción:</span> {
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
              {formData.medidas && (
                <p><span className="font-medium">Medidas:</span> {formData.medidas.ancho}x{formData.medidas.altura}x{formData.medidas.anchoPuente}mm</p>
              )}
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
      submitLabel={isEditing ? "Actualizar Lente" : "Crear Lente"}
      submitIcon={<Glasses className="w-4 h-4" />}
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

export default LentesFormModal;