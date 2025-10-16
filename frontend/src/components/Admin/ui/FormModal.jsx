import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

// Componentes auxiliares
const InputField = ({ name, label, error, formData, handleInputChange, nested, ...props }) => {
  const getValue = () => {
    if (nested) {
      const keys = name.split('.');
      const val = keys.reduce((obj, key) => obj?.[key], formData);
      // Si es number y null, devolver '' para que el input quede vacío
      if (props.type === 'number') return val === null || val === undefined ? '' : val;
      return val || '';
    }
    // Si es number y null, devolver '' para que el input quede vacío
    if (props.type === 'number') return formData[name] === null || formData[name] === undefined ? '' : formData[name];
    return formData[name] || '';
  };

  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        value={getValue()}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm ${
          error ? 'border-red-500 animate-shake' : 'border-gray-300 hover:border-cyan-300'
        }`}
        {...props}
      />
      {error && (
        <div className="mt-1 text-red-500 text-xs sm:text-sm flex items-center space-x-1 animate-slideInDown">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

const CheckboxField = ({ name, label, error, formData, handleInputChange, nested, ...props }) => {
  const getChecked = () => {
    if (nested) {
      const keys = name.split('.');
      const val = keys.reduce((obj, key) => obj?.[key], formData);
      return Boolean(val);
    }
    return Boolean(formData[name]);
  };

  const onChange = (e) => {
    handleInputChange({
      target: {
        name,
        value: e.target.checked
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <input
        name={name}
        type="checkbox"
        checked={getChecked()}
        onChange={onChange}
        className={`h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 ${error ? 'border-red-500 animate-shake' : ''}`}
        {...props}
      />
      <label className="text-xs sm:text-sm font-medium text-gray-700">{label}</label>
      {error && (
        <div className="mt-1 text-red-500 text-xs sm:text-sm flex items-center space-x-1 animate-slideInDown">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
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
    // Manejar valores booleanos para el campo disponible
    const value = formData[name];
    if (typeof value === 'boolean') {
      return value.toString();
    }
    return value || '';
  };

  const handleChange = (e) => {
    const value = e.target.value;
    
    // Manejar conversión de valores booleanos
    if (name === 'disponible') {
      handleInputChange({
        target: {
          name,
          value: value === 'true'
        }
      });
      return;
    }
    
    handleInputChange(e);
  };

  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        value={getValue()}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm ${
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
        <div className="mt-1 text-red-500 text-xs sm:text-sm flex items-center space-x-1 animate-slideInDown">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
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
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        name={name}
        value={getValue()}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-none text-xs sm:text-sm ${
          error ? 'border-red-500 animate-shake' : 'border-gray-300 hover:border-cyan-300'
        }`}
        rows="3"
        {...props}
      />
      {error && (
        <div className="mt-1 text-red-500 text-xs sm:text-sm flex items-center space-x-1 animate-slideInDown">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

const MultiSelectField = ({ name, label, error, formData, handleInputChange, options, placeholder, ...props }) => {
  const getValue = () => {
    const value = formData[name];
    return Array.isArray(value) ? value : [];
  };

  const handleChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    handleInputChange({
      target: {
        name,
        value: selectedOptions
      }
    });
  };

  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        multiple
        value={getValue()}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm ${
          error ? 'border-red-500 animate-shake' : 'border-gray-300 hover:border-cyan-300'
        }`}
        size="4"
        {...props}
      >
        {options.map(option => (
          <option key={typeof option === 'object' ? option.value : option} 
          value={typeof option === 'object' ? option.value : option}>
            {typeof option === 'object' ? option.label : option}
          </option>
        ))}
      </select>
      {error && (
        <div className="mt-1 text-red-500 text-xs sm:text-sm flex items-center space-x-1 animate-slideInDown">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>{error}</span>
        </div>
      )}
      <p className="text-xs text-gray-500 mt-1">
        Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples opciones
      </p>
    </div>
  );
};

const BooleanField = ({ name, label, error, formData, handleInputChange, ...props }) => {
  const getValue = () => {
    const value = formData[name];
    return typeof value === 'boolean' ? value.toString() : (value || 'true');
  };

  const handleChange = (e) => {
    handleInputChange({
      target: {
        name,
        value: e.target.value === 'true'
      }
    });
  };

  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        value={getValue()}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm ${
          error ? 'border-red-500 animate-shake' : 'border-gray-300 hover:border-cyan-300'
        }`}
        {...props}
      >
        <option value="true">Disponible</option>
        <option value="false">No Disponible</option>
      </select>
      {error && (
        <div className="mt-1 text-red-500 text-xs sm:text-sm flex items-center space-x-1 animate-slideInDown">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
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
  submitIcon,
  fields = [],
  children,
  customFields = {},
  gridCols = 2,
  // NUEVAS PROPS PARA LOADING Y ERROR
  isLoading = false,
  isError = false,
  hasValidationErrors = false,
  errorDuration = 1000 // Reducido a 1 segundo como solicitaste
}) => {
  // Estado local para manejar el error temporal
  const [localError, setLocalError] = useState(false);

  // Efecto para manejar el estado de error temporal (tanto de validación como de API)
  useEffect(() => {
    if (isError || hasValidationErrors) {
      setLocalError(true);
      const timer = setTimeout(() => {
        setLocalError(false);
      }, errorDuration);
      
      return () => clearTimeout(timer);
    }
  }, [isError, hasValidationErrors, errorDuration]);

  // Determinar el estado actual del botón
  const getButtonState = () => {
    if (isLoading) return 'loading';
    if (localError) return 'error';
    return 'normal';
  };

  const buttonState = getButtonState();

  // Obtener configuración del botón según el estado
  const getButtonConfig = () => {
    switch (buttonState) {
      case 'loading':
        return {
          bgColor: 'bg-cyan-500',
          hoverColor: 'bg-cyan-500',
          text: 'Procesando...',
          icon: <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />,
          disabled: true
        };
      case 'error':
        return {
          bgColor: 'bg-red-500',
          hoverColor: 'bg-red-600',
          text: 'Error',
          icon: <X className="w-4 h-4" />,
          disabled: false
        };
      default:
        return {
          bgColor: 'bg-cyan-500',
          hoverColor: 'bg-cyan-600',
          text: submitLabel,
          icon: submitIcon || <Save className="w-4 h-4" />,
          disabled: false
        };
    }
  };

  const buttonConfig = getButtonConfig();

  // CORRECCIÓN: Manejar el envío del formulario correctamente
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // No permitir envío si está cargando
    if (!isLoading) {
      onSubmit(e);
    }
  };

  const renderField = (field, index) => {
    const { name, label, type, options, required, colSpan = 1, nested, hidden, ...fieldProps } = field;
    if (hidden) return null;
    const displayLabel = required ? `${label} *` : label;
    const error = errors[name];

    // Verificar si hay un campo personalizado para este nombre
    if (customFields[name]) {
      return (
        <div key={name || index} className={`col-span-${colSpan}`}>
          {customFields[name]}
        </div>
      );
    }

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
        case 'checkbox':
          return (
            <CheckboxField
              {...commonProps}
            />
          );
        case 'select':
          return (
            <SelectField
              {...commonProps}
              options={options}
            />
          );
        case 'multi-select':
          return (
            <MultiSelectField
              {...commonProps}
              options={options}
            />
          );
        case 'boolean':
          return (
            <BooleanField
              {...commonProps}
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
      <div key={name || index} className={`col-span-${colSpan}`}>
        {fieldElement}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-2 sm:p-4 animate-fadeIn">      <form 
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideInScale"
      >
        <div className="bg-cyan-500 text-white p-4 sm:p-6 rounded-t-xl sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-lg sm:text-xl font-bold">{title}</h3>
            <button 
              type="button" 
              onClick={onClose} 
              className="text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg p-1.5 sm:p-2 transition-all duration-200 hover:scale-110"
              disabled={isLoading}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-3 sm:gap-4`}>
            {/* Renderizar los campos personalizados (children) primero */}
            {children}
            
            {/* Luego renderizar los campos normales */}
            {fields.map((field, index) => renderField(field, index))}
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-gray-50 rounded-b-xl flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 sticky bottom-0 z-10">
          <button 
            type="button" 
            onClick={onClose} 
            className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200 hover:scale-105 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className={`w-full sm:w-auto px-4 py-2 ${buttonConfig.bgColor} text-white rounded-lg hover:${buttonConfig.hoverColor} transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            disabled={buttonConfig.disabled || isLoading}
          >
            {buttonConfig.icon}
            <span>{buttonConfig.text}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormModal;