import React, { useState, useEffect, useMemo } from 'react';
import FormModal from '../../ui/FormModal';
import { Camera, Upload, X, Package, Edit3, Eye, EyeOff, Plus, Trash2, AlertCircle, Check, Loader, DollarSign, Tag } from 'lucide-react';

// Componente de subida de imágenes profesional
const ImageUploadComponent = ({ currentImages = [], onImagesChange, maxImages = 5 }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

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
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...currentImages];
    const movedImage = newImages.splice(fromIndex, 1)[0];
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
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
      {currentImages.length < maxImages && (
        <button
          type="button"
          onClick={handleOpenWidget}
          disabled={isUploading}
          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-cyan-400 hover:text-cyan-500 transition-all duration-200 bg-gray-50 hover:bg-cyan-50"
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader className="w-8 h-8 animate-spin text-cyan-500" />
              <span className="text-sm">Subiendo {uploadingCount} imagen(es)...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Camera className="w-8 h-8" />
              <span className="text-sm font-medium">
                {currentImages.length === 0 ? 'Agregar imágenes del producto' : 'Agregar más imágenes'}
              </span>
              <span className="text-xs text-gray-400">
                Haz clic para seleccionar o tomar fotos
              </span>
            </div>
          )}
        </button>
      )}

      {/* Grid de imágenes */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {currentImages.map((image, index) => (
            <div key={index} className="relative group">
              <div className={`aspect-square rounded-lg overflow-hidden border-2 ${index === 0 ? 'border-cyan-500' : 'border-gray-200'}`}>
                <img
                  src={image}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Badge de imagen principal */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-cyan-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Principal
                </div>
              )}
              
              {/* Controles de imagen */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
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
            </div>
          ))}
        </div>
      )}
      
      {currentImages.length > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          <span className="font-medium">Nota:</span> La primera imagen será la imagen principal del producto. 
          Puedes reordenar haciendo clic en "Hacer principal".
        </p>
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

      {/* Sección de precios */}
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
                <PriceField
                  label="Precio con Promoción"
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
              {formData.enPromocion && (
                <p className="text-green-600"><span className="font-medium">🏷️ En promoción</span></p>
              )}
            </div>
            <div>
              <p><span className="font-medium">Sucursales:</span> {formData.sucursales?.length || 0}</p>
              <p><span className="font-medium">Imágenes:</span> {formData.imagenes?.length || 0}</p>
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