import React, { useState } from 'react';
import FormModal from '../../ui/FormModal';
import { Folder, AlertCircle, Save, Tag, Package } from 'lucide-react';

// Componente para campos de entrada mejorados
const EnhancedField = ({ 
  field, 
  value, 
  onChange, 
  error,
  formData
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
    </div>
  );
};

const CategoriasFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  formData, 
  handleInputChange, 
  errors, 
  submitLabel,
  isEditing = false,
  selectedCategoria = null
}) => {
  // NUEVOS ESTADOS PARA LOADING Y ERROR
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);

  const handleFormSubmit = async () => {
    // Validar campos requeridos
    const requiredFields = ['nombre', 'codigo', 'tipoProducto', 'estado'];
    const hasErrors = requiredFields.some(field => !formData[field]);
    
    if (hasErrors) {
      setHasValidationErrors(true);
      return;
    }

    setHasValidationErrors(false);
    setIsLoading(true);
    setIsError(false);

    try {
      await onSubmit();
    } catch (error) {
      setIsError(true);
      console.error('Error al guardar categoría:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    {
      title: "Información General",
      fields: [
        { 
          name: 'nombre', 
          label: 'Nombre de la Categoría', 
          type: 'text', 
          required: true,
          placeholder: 'Ej: Lentes de Sol, Monturas, Accesorios',
          className: 'md:col-span-2'
        },
        { 
          name: 'descripcion', 
          label: 'Descripción', 
          type: 'textarea',
          placeholder: 'Breve descripción de la categoría y los productos que incluye...',
          className: 'md:col-span-2'
        },
      ]
    },
    {
      title: "Configuración",
      fields: [
        { 
          name: 'codigo', 
          label: 'Código de Categoría', 
          type: 'text',
          placeholder: 'Ej: CAT-001, LENTES-SOL',
          required: true
        },
        { 
          name: 'tipoProducto', 
          label: 'Tipo de Producto', 
          type: 'select',
          options: [
            'Lentes',
            'Monturas', 
            'Accesorios',
            'Lentes de Contacto',
            'Productos de Limpieza',
            'Estuches',
            'Otros'
          ],
          required: true,
          placeholder: 'Seleccione el tipo de producto'
        },
        { 
          name: 'orden', 
          label: 'Orden de Visualización', 
          type: 'number',
          placeholder: '1',
          min: 1
        },
        { 
          name: 'estado', 
          label: 'Estado de la Categoría', 
          type: 'select', 
          options: ['Activa', 'Inactiva'], 
          required: true 
        },
      ]
    }
  ];

  const customContent = (
    <div className="space-y-8">
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
      size="lg"
      // NUEVAS PROPS
      isLoading={isLoading}
      isError={isError}
      hasValidationErrors={hasValidationErrors}
      errorDuration={1000}
    >
      {customContent}
    </FormModal>
  );
};

export default CategoriasFormModal;