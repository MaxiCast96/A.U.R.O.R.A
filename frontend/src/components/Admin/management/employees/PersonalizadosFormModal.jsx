import React, { useState, useEffect } from 'react';
import FormModal from '../../ui/FormModal';
import { User, Package, Settings, Calendar, DollarSign, AlertCircle, Save, Glasses, Star } from 'lucide-react';

// Componente para campos de entrada mejorados
const EnhancedField = ({ 
  field, 
  value, 
  onChange, 
  error, 
  formData,
  clienteOptions = [],
  lenteOptions = [],
  categoriaOptions = [],
  marcaOptions = [],
  loadingCategories = false
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getFieldValue = () => {
    if (field.nested && field.name.includes('.')) {
      const keys = field.name.split('.');
      let current = formData;
      for (const key of keys) {
        current = current?.[key];
        if (current === undefined) return '';
      }
      return current || '';
    }
    return value || '';
  };

  const handleFieldChange = (e) => {
    const { name, value: inputValue } = e.target;
    
    if (field.nested && name.includes('.')) {
      const keys = name.split('.');
      const newFormData = { ...formData };
      
      let current = newFormData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = inputValue;
      
      onChange({
        target: {
          name: keys[0],
          value: newFormData[keys[0]]
        }
      });
    } else {
      onChange(e);
    }
  };

  const inputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base ${
    error ? 'border-red-500 bg-red-50' : 
    isFocused ? 'border-blue-500' : 'border-gray-300 bg-white'
  }`;

  if (field.type === 'select') {
    let options = [];
    
    if (field.name === 'clienteId') {
      options = clienteOptions;
    } else if (field.name === 'productoBaseId') {
      options = lenteOptions;
    } else if (field.name === 'categoria') {
      options = categoriaOptions;
    } else if (field.name === 'marcaId') {
      options = marcaOptions;
    } else if (field.options) {
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
          onChange={handleFieldChange}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={field.loading || loadingCategories}
        >
          <option value="">{field.placeholder || `Seleccione ${field.label.toLowerCase()}`}</option>
          {options.map((option, index) => (
            <option key={`${field.name}-${index}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {(field.loading || loadingCategories) && (
          <p className="text-blue-500 text-sm">Cargando opciones...</p>
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

  if (field.type === 'textarea') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          name={field.name}
          value={getFieldValue()}
          onChange={handleFieldChange}
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

  if (field.type === 'number' && (field.name.includes('precio') || field.name.includes('total'))) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="number"
            step="0.01"
            min="0"
            name={field.name}
            value={getFieldValue()}
            onChange={handleFieldChange}
            placeholder={field.placeholder}
            className={`${inputClasses} pl-10`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
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

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={field.type}
        name={field.name}
        value={getFieldValue()}
        onChange={handleFieldChange}
        placeholder={field.placeholder}
        className={inputClasses}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        step={field.type === 'number' ? '0.01' : undefined}
        min={field.type === 'number' ? '0' : undefined}
      />
      {error && (
        <p className="text-red-500 text-sm flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </p>
      )}
      {field.type === 'date' && (
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Fecha estimada de entrega del producto personalizado</span>
        </p>
      )}
    </div>
  );
};

const PersonalizadosFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  formData, 
  handleInputChange, 
  errors, 
  submitLabel,
  clienteOptions = [],
  lenteOptions = [],
  categoriaOptions = [],
  marcaOptions = [],
  loadingCategories = false,
  selectedPersonalizado = null
}) => {
  const isEditing = !!selectedPersonalizado;

  const sections = [
    {
      title: "Información del Cliente",
      fields: [
        { 
          name: 'clienteId', 
          label: 'Cliente', 
          type: 'select', 
          required: true,
          className: 'md:col-span-2'
        },
        { 
          name: 'productoBaseId', 
          label: 'Producto Base (Lente)', 
          type: 'select', 
          required: true,
          className: 'md:col-span-2'
        },
      ]
    },
    {
      title: "Detalles del Producto Personalizado",
      fields: [
        { 
          name: 'nombre', 
          label: 'Nombre del Producto', 
          type: 'text', 
          required: true,
          placeholder: 'Ej: Lentes progresivos personalizados para María'
        },
        { 
          name: 'categoria', 
          label: 'Categoría', 
          type: 'select', 
          required: true, 
          loading: loadingCategories 
        },
        { 
          name: 'descripcion', 
          label: 'Descripción Detallada', 
          type: 'textarea', 
          required: true, 
          className: 'md:col-span-2',
          placeholder: 'Descripción completa de las especificaciones y características personalizadas...'
        },
      ]
    },
    {
      title: "Especificaciones Técnicas",
      fields: [
        { 
          name: 'marcaId', 
          label: 'Marca', 
          type: 'select', 
          required: true 
        },
        { 
          name: 'material', 
          label: 'Material', 
          type: 'text', 
          required: true,
          placeholder: 'Ej: Policarbonato, Orgánico, Alto índice'
        },
        { 
          name: 'color', 
          label: 'Color', 
          type: 'text', 
          required: true,
          placeholder: 'Ej: Transparente, Gris, Marrón'
        },
        { 
          name: 'tipoLente', 
          label: 'Tipo de Lente', 
          type: 'text', 
          required: true,
          placeholder: 'Ej: Progresivo, Bifocal, Monofocal'
        },
      ]
    },
    {
      title: "Información de Costos y Entrega",
      fields: [
        { 
          name: 'precioCalculado', 
          label: 'Precio Base Calculado', 
          type: 'number', 
          required: true,
          placeholder: '0.00'
        },
        { 
          name: 'fechaEntregaEstimada', 
          label: 'Fecha de Entrega Estimada', 
          type: 'date', 
          required: true 
        },
      ]
    },
    {
      title: "Cotización",
      fields: [
        { 
          name: 'cotizacion.total', 
          label: 'Total de la Cotización', 
          type: 'number', 
          required: true, 
          nested: true,
          placeholder: '0.00'
        },
        { 
          name: 'cotizacion.validaHasta', 
          label: 'Cotización Válida Hasta', 
          type: 'date', 
          required: true, 
          nested: true 
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
                  value={field.nested ? getNestedValue(formData, field.name) : formData[field.name]}
                  onChange={handleInputChange}
                  error={errors[field.name]}
                  formData={formData}
                  clienteOptions={clienteOptions}
                  lenteOptions={lenteOptions}
                  categoriaOptions={categoriaOptions}
                  marcaOptions={marcaOptions}
                  loadingCategories={loadingCategories}
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
      onSubmit={onSubmit}
      title={title}
      formData={formData}
      handleInputChange={handleInputChange}
      errors={errors}
      submitLabel={submitLabel}
      submitIcon={<Save className="w-4 h-4" />}
      fields={[]}
      gridCols={1}
      size="xl"
    >
      {customContent}
    </FormModal>
  );
};

// Función auxiliar para obtener valores anidados
const getNestedValue = (obj, path) => {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    current = current?.[key];
    if (current === undefined) return '';
  }
  return current || '';
};

export default PersonalizadosFormModal;