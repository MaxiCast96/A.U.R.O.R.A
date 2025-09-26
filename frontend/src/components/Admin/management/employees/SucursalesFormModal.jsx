import React, { useState, useEffect, useMemo } from 'react';
import FormModal from '../../ui/FormModal';
import { Building2, MapPin, Phone as PhoneIcon, AlertCircle, Clock, User } from 'lucide-react';
import { EL_SALVADOR_DATA } from '../../constants/ElSalvadorData';

// Componente para campos de entrada mejorados
const EnhancedField = ({ 
  field, 
  value, 
  onChange, 
  error, 
  nested = false,
  placeholder,
  formData,
  isDisabled = false
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getFieldValue = () => {
    if (nested) {
      const keys = field.name.split('.');
      return formData[keys[0]] ? formData[keys[0]][keys[1]] || '' : '';
    }
    return value || '';
  };

  const handleFieldChange = (e) => {
    const { name, value: inputValue } = e.target;

    if (nested) {
      const keys = name.split('.');
      const parentKey = keys[0];
      const childKey = keys[1];
      
      const parentObject = formData[parentKey] || {};
      
      onChange({
        target: {
          name: parentKey,
          value: {
            ...parentObject,
            [childKey]: inputValue
          }
        }
      });
      
      if (childKey === 'departamento' && inputValue !== parentObject.departamento) {
        onChange({
          target: {
            name: parentKey,
            value: {
              ...parentObject,
              departamento: inputValue,
              municipio: ''
            }
          }
        });
      }
    } else {
      onChange(e);
      
      // Si se cambia el departamento, resetear municipio
      if (name === 'departamento' && inputValue !== formData.departamento) {
        onChange({
          target: {
            name: 'municipio',
            value: ''
          }
        });
      }
    }
  };

  const inputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base ${
    error ? 'border-red-500 bg-red-50' : 
    isDisabled ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' :
    isFocused ? 'border-blue-500' : 'border-gray-300 bg-white'
  }`;

  if (field.type === 'select') {
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
          disabled={isDisabled}
        >
          <option value="">
            {isDisabled ? `Primero selecciona ${field.name === 'municipio' ? 'un departamento' : field.label.toLowerCase()}` : 
             field.placeholder || `Seleccione ${field.label.toLowerCase()}`}
          </option>
          {Array.isArray(field.options) && field.options.map((option, index) => (
            <option key={`${field.name}-${index}-${option}`} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}
        {field.name === 'municipio' && isDisabled && (
          <p className="text-blue-500 text-sm flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>Primero selecciona un departamento</span>
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
          placeholder={placeholder || field.placeholder}
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

  if (field.name === 'telefono') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center">
          <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-l-lg flex items-center space-x-2 text-gray-600">
            <PhoneIcon className="w-5 h-5 text-gray-500" />
            <span>+503</span>
          </div>
          <input
            type="tel"
            name={field.name}
            value={value.replace('+503', '')}
            onChange={(e) => onChange({ target: { name: field.name, value: '+503' + e.target.value } })}
            placeholder="78901234"
            className={`flex-1 px-4 py-3 border-t border-b border-r rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base ${
              error ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength="8"
            inputMode="numeric"
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Ingrese 8 dígitos. Ej: 78901234</span>
        </p>
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
        placeholder={placeholder || field.placeholder}
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
      {field.type === 'email' && (
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Ejemplo: sucursal@email.com</span>
        </p>
      )}
    </div>
  );
};

const SucursalesFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  formData, 
  handleInputChange, 
  errors, 
  submitLabel,
  selectedSucursal = null
}) => {
  const isEditing = !!selectedSucursal;
  const departments = useMemo(() => Object.keys(EL_SALVADOR_DATA), []);
  
  const municipalities = useMemo(() => {
    const selectedDepartment = formData.departamento;
    
    if (!selectedDepartment) {
      return [];
    }
    
    let municipios = EL_SALVADOR_DATA[selectedDepartment];
    
    if (!municipios) {
      const departmentKey = Object.keys(EL_SALVADOR_DATA).find(key => 
        key.normalize('NFD').replace(/[\u0300-\u036f]/g, '') === 
        selectedDepartment.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      );
      
      if (departmentKey) {
        municipios = EL_SALVADOR_DATA[departmentKey];
      }
    }
    
    return municipios || [];
  }, [formData.departamento]);

  const isMunicipalityDisabled = !formData.departamento;

  const sections = [
    {
      title: "Información General",
      fields: [
        { name: 'nombre', label: 'Nombre de la Sucursal', type: 'text', placeholder: 'Ej: Sucursal Centro', required: true },
        { name: 'codigo', label: 'Código de Sucursal', type: 'text', placeholder: 'Ej: SUC-001', required: true },
        { name: 'correo', label: 'Correo Electrónico', type: 'email', placeholder: 'sucursal@email.com', required: true },
        { name: 'telefono', label: 'Teléfono', type: 'text', required: true },
      ]
    },
    {
      title: "Ubicación",
      fields: [
        { 
          name: 'departamento', 
          label: 'Departamento', 
          type: 'select', 
          options: departments, 
          placeholder: 'Seleccione un departamento',
          required: true
        },
        { 
          name: 'municipio', 
          label: 'Municipio', 
          type: 'select', 
          options: municipalities, 
          placeholder: isMunicipalityDisabled ? 'Primero selecciona un departamento' : 'Seleccione un municipio',
          required: true
        },
        { 
          name: 'direccion', 
          label: 'Dirección Completa', 
          type: 'textarea', 
          placeholder: 'Avenida Central, frente al Banco Nacional, Edificio Torre Azul, Local 101',
          required: true,
          className: 'md:col-span-2'
        },
      ]
    },
    {
      title: "Información Operacional",
      fields: [
        { 
          name: 'horarioApertura', 
          label: 'Horario de Apertura', 
          type: 'time', 
          required: true 
        },
        { 
          name: 'horarioCierre', 
          label: 'Horario de Cierre', 
          type: 'time', 
          required: true 
        },
        { 
          name: 'gerente', 
          label: 'Nombre del Gerente', 
          type: 'text', 
          placeholder: 'Juan Carlos Pérez',
          required: true 
        },
        { 
          name: 'estado', 
          label: 'Estado de la Sucursal', 
          type: 'select', 
          options: ['Activa', 'Inactiva', 'En Mantenimiento'], 
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
            {sectionIndex === 0 && <Building2 className="w-5 h-5 mr-2 text-blue-600" />}
            {sectionIndex === 1 && <MapPin className="w-5 h-5 mr-2 text-green-600" />}
            {sectionIndex === 2 && <Clock className="w-5 h-5 mr-2 text-orange-600" />}
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
                  nested={false}
                  placeholder={field.placeholder}
                  formData={formData}
                  isDisabled={field.name === 'municipio' && isMunicipalityDisabled}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Resumen de la sucursal */}
      {formData?.nombre && formData?.departamento && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Resumen de la Sucursal
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Nombre:</span> {formData.nombre}</p>
              <p><span className="font-medium">Código:</span> {formData.codigo}</p>
              <p><span className="font-medium">Ubicación:</span> {formData.municipio}, {formData.departamento}</p>
            </div>
            <div>
              <p><span className="font-medium">Gerente:</span> {formData.gerente}</p>
              <p><span className="font-medium">Estado:</span> {formData.estado}</p>
              {formData.horarioApertura && formData.horarioCierre && (
                <p><span className="font-medium">Horario:</span> {formData.horarioApertura} - {formData.horarioCierre}</p>
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
      submitLabel={submitLabel}
      submitIcon={<Building2 className="w-4 h-4" />}
      fields={[]}
      gridCols={1}
      size="xl"
    >
      {customContent}
    </FormModal>
  );
};

export default SucursalesFormModal;