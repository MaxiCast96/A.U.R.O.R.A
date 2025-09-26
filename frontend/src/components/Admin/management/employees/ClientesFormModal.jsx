import React, { useState, useEffect, useMemo } from 'react';
import FormModal from '../../ui/FormModal';
import { Eye, EyeOff, Lock, Edit3, X, Check, AlertCircle, User, Phone as PhoneIcon } from 'lucide-react';
import { EL_SALVADOR_DATA } from '../../constants/ElSalvadorData';

// Componente para mostrar avatar con iniciales
const ClientAvatarComponent = ({ clientName = '', size = 'large' }) => {
  const sizeConfigs = {
    small: { container: 'w-16 h-16', text: 'text-sm' },
    medium: { container: 'w-24 h-24', text: 'text-lg' },
    large: { container: 'w-32 h-32', text: 'text-2xl' }
  };

  const config = sizeConfigs[size];

  const getInitials = (name) => {
    if (!name) return 'C';
    const parts = name.split(' ');
    return parts.length > 1 ? 
      `${parts[0][0]}${parts[1][0]}` :
      parts[0][0];
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className={`${config.container} rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-white shadow-lg flex items-center justify-center`}>
        {clientName ? (
          <span className="text-blue-800 font-bold select-none">
            {getInitials(clientName)}
          </span>
        ) : (
          <User className="w-8 h-8 text-blue-600" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          {clientName || 'Nuevo Cliente'}
        </p>
        <p className="text-xs text-gray-500">
          Avatar generado automáticamente
        </p>
      </div>
    </div>
  );
};

// Componente mejorado para manejo de contraseñas
const PasswordField = ({ 
  value, 
  onChange, 
  error, 
  isEditing = false, 
  currentPassword = null,
  placeholder = "Ingrese la contraseña"
}) => {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    if (isEditing && currentPassword) {
      setTempPassword(currentPassword);
    }
  }, [isEditing, currentPassword]);

  const handleEditPassword = () => {
    setIsEditingPassword(true);
    setTempPassword('');
  };

  const handleCancelEdit = () => {
    setIsEditingPassword(false);
    setTempPassword(currentPassword || '');
    setShowPassword(false);
    onChange({ target: { name: 'password', value: currentPassword || '' } });
  };

  const handleSavePassword = () => {
    setIsEditingPassword(false);
    setShowPassword(false);
    onChange({ target: { name: 'password', value: tempPassword } });
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setTempPassword(newPassword);
    onChange({ target: { name: 'password', value: newPassword } });
  };

  // CAMBIO: Verificar si hay contraseña actual para mostrar la interfaz correcta
  if (isEditing && currentPassword && !isEditingPassword) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <div className="relative">
          <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <div className="text-gray-500 select-none tracking-widest">
                ••••••••••••
              </div>
            </div>
            <button
              type="button"
              onClick={handleEditPassword}
              className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Cambiar</span>
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>La contraseña actual se mantendrá sin cambios</span>
        </p>
      </div>
    );
  }

  if (isEditing && isEditingPassword) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nueva Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={tempPassword}
            onChange={handlePasswordChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-base ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ingrese la nueva contraseña"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
            <button
              type="button"
              onClick={handleSavePassword}
              className="p-1 text-green-600 hover:text-green-800 transition-colors"
              title="Guardar contraseña"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="p-1 text-red-600 hover:text-red-800 transition-colors"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {error && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Ingrese una nueva contraseña segura</span>
        </p>
      </div>
    );
  }

  // Campo normal para crear nuevo cliente
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Contraseña *
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-base ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={placeholder}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-sm flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </p>
      )}
      <p className="text-xs text-gray-500 flex items-center space-x-1">
        <AlertCircle className="w-3 h-3" />
        <span>Debe tener al menos 6 caracteres</span>
      </p>
    </div>
  );
};

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
    return value;
  };

  const handleFieldChange = (e) => {
    const { name, value: inputValue } = e.target;

    if (nested) {
      const keys = name.split('.');
      const parentKey = keys[0];
      const childKey = keys[1];
      
      // Crear el objeto padre si no existe
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
      
      // Si se cambia el departamento, resetear el municipio
      if (childKey === 'departamento' && inputValue !== parentObject.departamento) {
        onChange({
          target: {
            name: parentKey,
            value: {
              ...parentObject,
              departamento: inputValue,
              ciudad: ''
            }
          }
        });
      }
    } else {
      onChange(e);
      
      // NUEVO: Si es campo departamento, resetear ciudad
      if (name === 'departamento' && inputValue !== formData.departamento) {
        onChange({
          target: {
            name: 'ciudad',
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
    // Debug específico para el campo ciudad
    if (field.name === 'ciudad') {
      console.log('Renderizando campo ciudad:');
      console.log('- Valor actual:', getFieldValue());
      console.log('- Opciones disponibles:', field.options);
      console.log('- Campo deshabilitado:', isDisabled);
      console.log('- FormData departamento:', formData.departamento);
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
          disabled={isDisabled}
        >
          <option value="">
            {isDisabled ? `Primero selecciona ${field.name === 'ciudad' ? 'un departamento' : field.label.toLowerCase()}` : 
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
        {/* NUEVO: Mensaje informativo para municipio deshabilitado */}
        {field.name === 'ciudad' && isDisabled && (
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
        step={field.type === 'number' ? '1' : undefined}
        min={field.type === 'number' && field.name === 'edad' ? '18' : undefined}
        max={field.type === 'number' && field.name === 'edad' ? '100' : undefined}
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
          <span>Ejemplo: cliente@email.com</span>
        </p>
      )}
      {field.name === 'dui' && (
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Formato: 12345678-9</span>
        </p>
      )}
      {field.name === 'edad' && (
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Edad mínima: 18 años</span>
        </p>
      )}
    </div>
  );
};

const ClientesFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  formData, 
  handleInputChange, 
  errors, 
  submitLabel,
  setFormData,
  selectedCliente = null
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const isEditing = !!selectedCliente;

  // DEBUG: Verificar que los datos de El Salvador estén disponibles
  useEffect(() => {
    console.log('EL_SALVADOR_DATA disponible:', EL_SALVADOR_DATA);
    console.log('Departamentos disponibles:', Object.keys(EL_SALVADOR_DATA));
    console.log('Ejemplo - Municipios de Morazán:', EL_SALVADOR_DATA['Morazán']);
  }, []);

  // CAMBIO: Mejorar el useEffect para establecer la contraseña
  useEffect(() => {
    if (isEditing && selectedCliente) {
      // Establecer la contraseña desde selectedCliente O desde formData
      const passwordToSet = selectedCliente.password || formData.password || '';
      setCurrentPassword(passwordToSet);
      
      // Si formData.password está vacío pero selectedCliente tiene password, actualizarlo
      if (!formData.password && selectedCliente.password) {
        setFormData(prev => ({ ...prev, password: selectedCliente.password }));
      }
    }
  }, [isEditing, selectedCliente, formData.password, setFormData]);

  const handleFormSubmit = () => {
    // Si estamos editando y no se cambió la contraseña, mantener la actual
    if (isEditing && !formData.password) {
      setFormData(prev => ({ ...prev, password: currentPassword }));
    }
    onSubmit();
  };

  // Obtener los departamentos y municipios dinámicamente
  const departments = useMemo(() => Object.keys(EL_SALVADOR_DATA), []);
  
  // CORREGIDO: Mejorar la lógica de municipios con debugging y normalización
  const municipalities = useMemo(() => {
    const selectedDepartment = formData.departamento;
    console.log('Calculando municipios para departamento:', selectedDepartment);
    console.log('FormData actual:', formData);
    console.log('Departamentos disponibles en EL_SALVADOR_DATA:', Object.keys(EL_SALVADOR_DATA));
    
    if (!selectedDepartment) {
      console.log('No hay departamento seleccionado, retornando array vacío');
      return [];
    }
    
    // Buscar el departamento exacto o con normalización de caracteres
    let municipios = EL_SALVADOR_DATA[selectedDepartment];
    
    if (!municipios) {
      // Intentar encontrar coincidencia normalizando caracteres
      const departmentKey = Object.keys(EL_SALVADOR_DATA).find(key => 
        key.normalize('NFD').replace(/[\u0300-\u036f]/g, '') === 
        selectedDepartment.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      );
      
      if (departmentKey) {
        municipios = EL_SALVADOR_DATA[departmentKey];
        console.log('Departamento encontrado con normalización:', departmentKey);
      }
    }
    
    municipios = municipios || [];
    console.log('Municipios encontrados:', municipios);
    console.log('Ciudad actual en formData:', formData.ciudad);
    console.log('¿Ciudad válida para el departamento?', municipios.includes(formData.ciudad));
    
    return municipios;
  }, [formData.departamento, formData.ciudad]);

  // NUEVO: Verificar si el municipio debe estar deshabilitado
  const isMunicipalityDisabled = !formData.departamento;

  const sections = [
    {
      title: "  Información Personal",
      fields: [
        { name: 'nombre', label: 'Nombre Completo', type: 'text', placeholder: 'Ej: María Elena', required: true },
        { name: 'apellido', label: 'Apellidos', type: 'text', placeholder: 'Ej: Rodríguez Pérez', required: true },
        { name: 'edad', label: 'Edad', type: 'number', placeholder: '25', required: true },
        { name: 'dui', label: 'Número de DUI', type: 'text', placeholder: '12345678-9', required: true },
        { name: 'telefono', label: 'Teléfono', type: 'text', required: true },
        { name: 'correo', label: 'Correo Electrónico', type: 'email', placeholder: 'maria.rodriguez@email.com', required: true },
      ]
    },
    {
      title: "  Información de Residencia",
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
          name: 'ciudad', 
          label: 'Ciudad/Municipio', 
          type: 'select', 
          options: municipalities, 
          placeholder: isMunicipalityDisabled ? 'Primero selecciona un departamento' : 'Seleccione una ciudad',
          required: true
        },
        { 
          name: 'calle', 
          label: 'Dirección Completa', 
          type: 'textarea', 
          placeholder: 'Colonia Santa Elena, Calle Los Rosales #456, Casa amarilla con portón negro',
          required: true
        },
      ]
    },
    {
      title: "  Estado del Cliente",
      fields: [
        { 
          name: 'estado', 
          label: 'Estado del Cliente', 
          type: 'select', 
          options: ['Activo', 'Inactivo'], 
          required: true 
        },
      ]
    }
  ];

  const customContent = (
    <div className="space-y-8">
      {/* Secciones de información */}
      {sections.map((section, sectionIndex) => (
        <div key={`section-${sectionIndex}`} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            {section.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.fields.map((field, fieldIndex) => (
              <div key={`field-${sectionIndex}-${fieldIndex}`} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <EnhancedField
                  field={field}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  error={errors[field.name]}
                  nested={false}
                  placeholder={field.placeholder}
                  formData={formData}
                  isDisabled={field.name === 'ciudad' && isMunicipalityDisabled}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Sección de contraseña */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            Acceso y Seguridad
        </h3>
        <div className="max-w-md">
          <PasswordField
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            isEditing={isEditing}
            currentPassword={currentPassword}
            placeholder="Contraseña para acceder al sistema"
          />
        </div>
      </div>
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
      fields={[]}
      gridCols={1}
      size="xl"
    >
      {customContent}
    </FormModal>
  );
};

export default ClientesFormModal;