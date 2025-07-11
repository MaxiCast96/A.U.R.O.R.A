import React from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

// Componentes auxiliares
const InputField = ({ name, label, error, formData, handleInputChange, nested, ...props }) => {
  const getValue = () => {
    if (nested) {
      const keys = name.split('.');
      return keys.reduce((obj, key) => obj?.[key], formData) || '';
    }
    return formData[name] || '';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        value={getValue()}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 ${
          error ? 'border-red-500 animate-shake' : 'border-gray-300 hover:border-cyan-300'
        }`}
        {...props}
      />
      {error && (
        <div className="mt-1 text-red-500 text-sm flex items-center space-x-1 animate-slideInDown">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

const SelectField = ({ name, label, error, formData, handleInputChange, options, placeholder, nested, ...props }) => {
  const getValue = () => {
    if (nested) {
      const keys = name.split('.');
      return keys.reduce((obj, key) => obj?.[key], formData) || '';
    }
    return formData[name] || '';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        value={getValue()}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 ${
          error ? 'border-red-500 animate-shake' : 'border-gray-300 hover:border-cyan-300'
        }`}
        {...props}
      >
        <option value="">{placeholder || 'Seleccione una opción'}</option>
        {options.map(option => (
          <option key={typeof option === 'object' ? option.value : option} 
          value={typeof option === 'object' ? option.value : option}>
      {typeof option === 'object' ? option.label : option}
  </option>
        ))}
      </select>
      {error && (
        <div className="mt-1 text-red-500 text-sm flex items-center space-x-1 animate-slideInDown">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

const TextAreaField = ({ name, label, error, formData, handleInputChange, nested, ...props }) => {
  const getValue = () => {
    if (nested) {
      const keys = name.split('.');
      return keys.reduce((obj, key) => obj?.[key], formData) || '';
    }
    return formData[name] || '';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        name={name}
        value={getValue()}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-none ${
          error ? 'border-red-500 animate-shake' : 'border-gray-300 hover:border-cyan-300'
        }`}
        rows="3"
        {...props}
      />
      {error && (
        <div className="mt-1 text-red-500 text-sm flex items-center space-x-1 animate-slideInDown">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  formData,
  handleInputChange,
  errors,
  submitLabel = 'Guardar',
  fields = [],
  children, // Agregamos children para componentes personalizados
  gridCols = 2 // Agregamos flexibilidad para las columnas
}) => {
  if (!isOpen) return null;

  const renderField = (field) => {
    const { name, label, type, options, required, colSpan = 1, nested, ...fieldProps } = field;
    const displayLabel = required ? `${label} *` : label;
    const error = errors[name];

    const commonProps = {
      name,
      label: displayLabel,
      error,
      formData,
      handleInputChange,
      nested,
      ...fieldProps
    };

    const fieldElement = (() => {
      switch (type) {
        case 'select':
          return (
            <SelectField
              {...commonProps}
              options={options}
            />
          );
        case 'textarea':
          return (
            <TextAreaField
              {...commonProps}
            />
          );
        case 'number':
          return (
            <InputField
              {...commonProps}
              type="number"
            />
          );
        case 'email':
          return (
            <InputField
              {...commonProps}
              type="email"
            />
          );
        case 'date':
          return (
            <InputField
              {...commonProps}
              type="date"
            />
          );
        case 'url':
          return (
            <InputField
              {...commonProps}
              type="url"
            />
          );
        case 'password':
          return (
            <InputField
              {...commonProps}
              type="password"
            />
          );
        case 'text':
        default:
          return (
            <InputField
              {...commonProps}
              type="text"
            />
          );
      }
    })();

    return (
      <div key={name} className={`col-span-${colSpan}`}>
        {fieldElement}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <form 
        onSubmit={(e) => { 
          e.preventDefault(); 
          onSubmit(e); // Pasar el evento al onSubmit
        }} 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideInScale"
      >
        <div className="bg-cyan-500 text-white p-6 rounded-t-xl sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">{title}</h3>
            <button 
              type="button" 
              onClick={onClose} 
              className="text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg p-2 transition-all duration-200 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-4`}>
            {/* Renderizar los campos personalizados (children) primero */}
            {children}
            
            {/* Luego renderizar los campos normales */}
            {fields.map(renderField)}
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end space-x-3 sticky bottom-0 z-10">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200 hover:scale-105"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all duration-200 hover:scale-105 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{submitLabel}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormModal;