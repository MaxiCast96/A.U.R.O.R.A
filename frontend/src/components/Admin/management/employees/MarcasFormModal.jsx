import React, { useState, useEffect } from 'react';
import FormModal from '../../ui/FormModal';
import { Camera, Upload, X, Package, AlertCircle, Save, Tag } from 'lucide-react';

// Componente para subida de logo usando Cloudinary
const LogoUploadComponent = ({ currentLogo, onLogoChange, marcaName }) => {
  const [isUploading, setIsUploading] = useState(false);

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
      folder: "marcas_logos",
      multiple: false,
      cropping: true,
      croppingAspectRatio: 1,
      maxImageFileSize: 5000000,
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
          "queue.title": "Subir Logo",
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
        onLogoChange(result.info.secure_url);
        setIsUploading(false);
      }
    });

    widget.open();
  };

  const removeImage = () => {
    onLogoChange('');
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Logo de la Marca
      </label>
      
      {currentLogo ? (
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={currentLogo}
                alt="Logo preview"
                className="w-32 h-20 object-contain border border-gray-300 rounded-lg bg-white p-2"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleOpenWidget}
              disabled={isUploading}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-all duration-200 flex items-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Cambiar Logo</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-cyan-400 transition-colors">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="w-12 h-12 text-gray-400" />
            </div>
            
            <div>
              <p className="text-gray-600 mb-2">Subir logo de la marca</p>
              <p className="text-sm text-gray-500 mb-4">
                PNG, JPG, JPEG o WEBP (máx. 5MB)
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleOpenWidget}
              disabled={isUploading}
              className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Seleccionar Archivo</span>
                </>
              )}
            </button>
          </div>
        </div>
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
  formData
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // CORRECCIÓN: Manejar valores array para el campo lineas
  const getFieldValue = () => {
    // Si el campo es 'lineas' y el valor es un array, tomar el primer elemento
    if (field.name === 'lineas' && Array.isArray(value)) {
      return value[0] || '';
    }
    return value || '';
  };

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

    // CORRECCIÓN: Manejar el onChange para convertir a array si es necesario
    const handleSelectChange = (e) => {
      if (field.name === 'lineas') {
        // Convertir el valor string a array para mantener consistencia con el backend
        onChange({
          target: {
            name: field.name,
            value: [e.target.value]
          }
        });
      } else {
        onChange(e);
      }
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <select
          name={field.name}
          value={getFieldValue()}
          onChange={handleSelectChange}
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
      />
      {error && (
        <p className="text-red-500 text-sm flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </p>
      )}
      {field.type === 'url' && (
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Ejemplo: https://www.marca.com</span>
        </p>
      )}
    </div>
  );
};

const MarcasFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  formData, 
  handleInputChange, 
  errors, 
  submitLabel,
  selectedMarca = null
}) => {
  const isEditing = !!selectedMarca;
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);

  const handleFormSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Validar campos requeridos
    const requiredFields = ['nombre', 'paisOrigen', 'lineas', 'estado'];
    const hasErrors = requiredFields.some(field => {
      const value = formData[field];
      // Para lineas, verificar si es array vacío o string vacío
      if (field === 'lineas') {
        return !value || (Array.isArray(value) && value.length === 0);
      }
      return !value;
    });
    
    if (hasErrors) {
      setHasValidationErrors(true);
      return;
    }

    setHasValidationErrors(false);
    setIsLoading(true);
    setIsError(false);

    try {
      await onSubmit(e);
    } catch (error) {
      setIsError(true);
      console.error('Error al guardar marca:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = (logoUrl) => {
    handleInputChange({
      target: {
        name: 'logo',
        value: logoUrl
      }
    });
  };

  const sections = [
    {
      title: "Información General",
      fields: [
        { 
          name: 'nombre', 
          label: 'Nombre de la Marca', 
          type: 'text', 
          required: true,
          placeholder: 'Ej: Ray-Ban, Oakley, Armani'
        },
        { 
          name: 'paisOrigen', 
          label: 'País de Origen', 
          type: 'select',
          options: [
            'Estados Unidos', 'Italia', 'Francia', 'Alemania', 'Suiza',
            'Japón', 'China', 'Corea del Sur', 'Brasil', 'España',
            'Reino Unido', 'Países Bajos', 'Austria', 'Dinamarca'
          ],
          required: true
        },
        { 
          name: 'descripcion', 
          label: 'Descripción', 
          type: 'textarea',
          placeholder: 'Breve descripción de la marca...',
          className: 'md:col-span-2'
        },
      ]
    },
    {
      title: "Líneas de Producto",
      fields: [
        {
          name: 'lineas',
          label: 'Línea de Productos',
          type: 'select',
          options: ['Premium', 'Económica'],
          required: true,
          placeholder: 'Seleccione la línea'
        },
        { 
          name: 'estado', 
          label: 'Estado de la Marca', 
          type: 'select', 
          options: ['Activa', 'Inactiva', 'Descontinuada'], 
          required: true 
        },
      ]
    }
  ];

  const customContent = (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <LogoUploadComponent 
          currentLogo={formData?.logo}
          onLogoChange={handleLogoChange}
          marcaName={formData?.nombre}
        />
        {errors.logo && (
          <div className="mt-2 text-red-500 text-sm flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.logo}</span>
          </div>
        )}
      </div>

      {sections.map((section, sectionIndex) => (
        <div key={`section-${sectionIndex}`} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
            {section.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.fields.map((field, fieldIndex) => (
              <div key={`field-${sectionIndex}-${fieldIndex}`} className={field.className || ''}>
                <EnhancedField
                  field={field}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  error={errors[field.name]}
                  formData={formData}
                />
              </div>
            ))}
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
      submitIcon={<Save className="w-4 h-4" />}
      fields={[]}
      gridCols={1}
      size="xl"
      isLoading={isLoading}
      isError={isError}
      hasValidationErrors={hasValidationErrors}
      errorDuration={1000}
    >
      {customContent}
    </FormModal>
  );
};

export default MarcasFormModal;