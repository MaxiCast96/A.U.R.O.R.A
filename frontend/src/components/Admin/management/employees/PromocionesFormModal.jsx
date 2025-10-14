import React, { useState, useEffect } from 'react';
import FormModal from '../../ui/FormModal';
import { Tag, Percent, Calendar, Settings, AlertCircle, Gift, Eye, EyeOff, X } from 'lucide-react';

// Componente para subida de imagen de promoción
const PromocionImageUpload = ({ currentImage, onImageChange, promocionName }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleOpenWidget = () => {
    if (!window.cloudinary) return;
    
    const widget = window.cloudinary.createUploadWidget({
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      sources: ['local', 'camera', 'url'],
      folder: "promociones",
      multiple: false,
      cropping: true,
      croppingAspectRatio: 16 / 9,
      maxImageFileSize: 5000000,
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
          "local.browse": "Seleccionar",
          "camera.capture": "Tomar foto"
        }
      }
    }, (error, result) => {
      if (error) {
        console.error('Error uploading:', error);
        setIsUploading(false);
        return;
      }
      
      if (result && result.event === "upload-added") {
        setIsUploading(true);
      }
      
      if (result && result.event === "success") {
        onImageChange(result.info.secure_url);
        setIsUploading(false);
      }
    });

    widget.open();
  };

  return (
    <div className="space-y-4">
      {currentImage ? (
        <div className="relative">
          <img
            src={currentImage}
            alt={promocionName || 'Promoción'}
            className="w-full h-48 object-cover rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={() => onImageChange('')}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div 
          onClick={handleOpenWidget}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-colors"
        >
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Gift className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">
            Subir imagen de promoción
          </h4>
          <p className="text-gray-500 mb-4">
            Formato recomendado: 16:9 (1920x1080px)
          </p>
        </div>
      )}
      
      {!currentImage && (
        <button
          type="button"
          onClick={handleOpenWidget}
          disabled={isUploading}
          className="w-full px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Subiendo...</span>
            </>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              <span>Seleccionar Imagen</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

// Componente para campos de entrada mejorados
const EnhancedField = ({ 
  field, 
  value, 
  onChange, 
  error, 
  formData,
  categoriaOptions = [],
  productosOptions = []
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getFieldValue = () => value || '';

  const inputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base ${
    error ? 'border-red-500 bg-red-50' : 
    isFocused ? 'border-blue-500' : 'border-gray-300 bg-white'
  }`;

  if (field.type === 'select') {
    let options = [];
    
    if (field.options) {
      options = field.options.map(opt => 
        typeof opt === 'object' ? opt : { value: opt, label: opt }
      );
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <select
          name={field.name}
          value={getFieldValue()}
          onChange={onChange}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <option value="">{field.placeholder || `Seleccione ${field.label.toLowerCase()}`}</option>
          {options.map((option, index) => (
            <option key={`${field.name}-${index}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }

  if (field.type === 'multi-select') {
    const selectedValues = Array.isArray(value) ? value : [];
    const options = field.name === 'categoriasAplicables' ? categoriaOptions : productosOptions;

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="border rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
          {options.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay opciones disponibles</p>
          ) : (
            options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2 p-2 hover:bg-white rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked 
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(v => v !== option.value);
                    onChange({ target: { name: field.name, value: newValues } });
                  }}
                  className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))
          )}
        </div>
        {selectedValues.length > 0 && (
          <p className="text-sm text-green-600">
            {selectedValues.length} elemento(s) seleccionado(s)
          </p>
        )}
        {error && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }

  if (field.type === 'boolean') {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name={field.name}
            checked={!!value}
            onChange={(e) => onChange({ target: { name: field.name, value: e.target.checked } })}
            className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
          />
          <label className="text-sm font-medium text-gray-700">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
        </div>
        {error && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          name={field.name}
          value={getFieldValue()}
          onChange={onChange}
          placeholder={field.placeholder}
          className={`${inputClasses} resize-none`}
          rows={3}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {error && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={field.type}
        name={field.name}
        value={getFieldValue()}
        onChange={onChange}
        placeholder={field.placeholder}
        className={inputClasses}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        min={field.min}
        max={field.max}
      />
      {error && (
        <p className="text-red-500 text-sm flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </p>
      )}
      {field.name === 'codigoPromo' && (
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Código único para aplicar la promoción</span>
        </p>
      )}
    </div>
  );
};

const PromocionesFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  formData, 
  handleInputChange, 
  errors, 
  submitLabel,
  categoriaOptions = [],
  productosOptions = [],
  selectedPromo = null
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);

  const isEditing = !!selectedPromo;

  const handleImageChange = (imageUrl) => {
    handleInputChange({
      target: {
        name: 'imagenPromocion',
        value: imageUrl
      }
    });
  };

  const sections = [
    {
      title: "Información Básica",
      fields: [
        { 
          name: 'nombre', 
          label: 'Nombre de la Promoción', 
          type: 'text', 
          required: true, 
          className: 'md:col-span-2',
          placeholder: 'Ej: Descuento de Verano 2024'
        },
        { 
          name: 'descripcion', 
          label: 'Descripción', 
          type: 'textarea', 
          required: true, 
          className: 'md:col-span-2',
          placeholder: 'Describe los beneficios y términos de la promoción...'
        },
      ]
    },
    {
      title: "Configuración del Descuento",
      fields: [
        { 
          name: 'tipoDescuento', 
          label: 'Tipo de Descuento', 
          type: 'select', 
          options: [
            { value: 'porcentaje', label: 'Porcentaje (%)' },
            { value: 'monto', label: 'Monto fijo ($)' },
            { value: '2x1', label: '2x1' },
          ], 
          required: true 
        },
        { 
          name: 'valorDescuento', 
          label: 'Valor del Descuento', 
          type: 'number', 
          required: true,
          placeholder: formData?.tipoDescuento === 'porcentaje' ? '20' : '50.00'
        },
      ]
    },
    {
      title: "Aplicabilidad",
      fields: [
        { 
          name: 'aplicaA', 
          label: 'Aplicar Promoción A', 
          type: 'select', 
          options: [
            { value: 'todos', label: 'Todos los productos' },
            { value: 'categoria', label: 'Categorías específicas' },
            { value: 'lente', label: 'Productos específicos' },
          ], 
          required: true, 
          className: 'md:col-span-2' 
        },
        { 
          name: 'categoriasAplicables', 
          label: 'Categorías Aplicables', 
          type: 'multi-select',
          hidden: formData?.aplicaA !== 'categoria', 
          className: 'md:col-span-2' 
        },
        { 
          name: 'lentesAplicables', 
          label: 'Productos Aplicables', 
          type: 'multi-select',
          hidden: formData?.aplicaA !== 'lente', 
          className: 'md:col-span-2' 
        },
      ]
    },
    {
      title: "Vigencia y Código",
      fields: [
        { 
          name: 'fechaInicio', 
          label: 'Fecha de Inicio', 
          type: 'date', 
          required: true 
        },
        { 
          name: 'fechaFin', 
          label: 'Fecha de Fin', 
          type: 'date', 
          required: true 
        },
        { 
          name: 'codigoPromo', 
          label: 'Código de Promoción', 
          type: 'text', 
          required: true, 
          className: 'md:col-span-2', 
          placeholder: 'Ej: DESCUENTO20, VERANO2024' 
        },
      ]
    },
    {
      title: "Configuración Avanzada",
      fields: [
        { 
          name: 'prioridad', 
          label: 'Prioridad (0-10)', 
          type: 'number', 
          min: 0, 
          max: 10, 
          placeholder: '0 = Baja, 10 = Alta' 
        },
        { 
          name: 'limiteUsos', 
          label: 'Límite de Usos', 
          type: 'number', 
          min: 1, 
          placeholder: 'Vacío = Ilimitado' 
        },
        { 
          name: 'mostrarEnCarrusel', 
          label: 'Mostrar en Carrusel Principal', 
          type: 'boolean' 
        },
        { 
          name: 'activo', 
          label: 'Promoción Activa', 
          type: 'boolean' 
        },
      ]
    }
  ];

  const handleFormSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setIsLoading(true);
    setIsError(false);
    setHasValidationErrors(false);

    try {
      await onSubmit(e);
    } catch (error) {
      setIsError(true);
      console.error('Error al guardar promoción:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const customContent = (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
          Imagen de la Promoción
        </h3>
        <PromocionImageUpload 
          currentImage={formData?.imagenPromocion}
          onImageChange={handleImageChange}
          promocionName={formData?.nombre}
        />
      </div>

      {sections.map((section, sectionIndex) => (
        <div key={`section-${sectionIndex}`} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
            {section.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.fields.map((field, fieldIndex) => {
              if (field.hidden) return null;
              
              return (
                <div key={`field-${sectionIndex}-${fieldIndex}`} className={field.className || ''}>
                  <EnhancedField
                    field={field}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    error={errors[field.name]}
                    formData={formData}
                    categoriaOptions={categoriaOptions}
                    productosOptions={productosOptions}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleFormSubmit}
      title={title}
      formData={formData}
      handleInputChange={handleInputChange}
      errors={errors}
      submitLabel={submitLabel}
      submitIcon={<Tag className="w-4 h-4" />}
      fields={[]}
      gridCols={1}
      size="xl"
      isLoading={isLoading}
      isError={isError}
      hasValidationErrors={hasValidationErrors}
    >
      {customContent}
    </FormModal>
  );
};

export default PromocionesFormModal;