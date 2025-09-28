import React, { useState, useEffect, useMemo } from 'react';
import FormModal from '../../ui/FormModal';
import { Camera, Upload, X, User, Edit3, Eye, EyeOff, Lock, Unlock, Check, AlertCircle, Phone as PhoneIcon, ArrowRight, Save, Loader } from 'lucide-react';
import { EL_SALVADOR_DATA } from '../../constants/ElSalvadorData';

// URL base de tu API
const API_URL = 'https://aurora-production-7e57.up.railway.app/api/empleados';

// Componente de subida de foto profesional
const PhotoUploadComponent = ({ currentPhoto, onPhotoChange, employeeName = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleOpenWidget = () => {
    if (!window.cloudinary) return;
    const widget = window.cloudinary.createUploadWidget({
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      sources: ['local', 'camera', 'url'], folder: "empleados_perfil", multiple: false,
      cropping: true, croppingAspectRatio: 1, maxImageFileSize: 5000000,
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      styles: { palette: { window: "#FFFFFF", windowBorder: "#0891B2", tabIcon: "#0891B2", link: "#0891B2", action: "#0891B2" } },
      text: { es: { "queue.title": "Subir Foto", "local.browse": "Seleccionar", "camera.capture": "Tomar foto", "crop.title": "Recortar foto" } }
    }, (error, result) => {
      if (error) { setIsUploading(false); return; }
      if (result && result.event === "upload-added") setIsUploading(true);
      if (result && result.event === "success") {
        onPhotoChange(result.info.secure_url);
        setIsUploading(false);
      }
    });
    widget.open();
  };

  const getInitials = (name) => {
    if (!name || name.trim() === '') return null;
    const cleanName = name.trim();
    const parts = cleanName.split(' ').filter(part => part.length > 0);
    if (parts.length === 0) return null;
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
  };

  const initials = getInitials(employeeName);

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative w-32 h-32 group cursor-pointer" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={handleOpenWidget}>
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
          {currentPhoto ? (
            <img src={currentPhoto} alt={employeeName} className="w-full h-full object-cover" />
          ) : initials ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-200 to-blue-200">
              <span className="text-cyan-800 font-bold text-2xl">{initials}</span>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <User className="w-12 h-12 text-gray-500" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-white text-center">
            {isUploading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Edit3 className="w-6 h-6" /><span className="text-xs font-medium">{currentPhoto ? 'Cambiar' : 'Subir'}</span></>}
          </div>
        </div>
        <button type="button" className={`absolute -bottom-1 -right-1 w-8 h-8 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg flex items-center justify-center border-2 border-white transition-transform ${isHovered ? 'scale-110' : ''}`} onClick={(e) => { e.stopPropagation(); handleOpenWidget(); }}><Camera className="w-4 h-4" /></button>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">{currentPhoto ? 'Cambiar foto de perfil' : 'Agregar foto de perfil'}</p>
        <p className="text-xs text-gray-500 mt-1">Haz clic en la imagen para {currentPhoto ? 'cambiar' : 'subir'}</p>
      </div>
    </div>
  );
};

const PasswordField = ({ value, onChange, error, isEditing = false }) => {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isEditing && !isEditingPassword) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
        <div className="w-full px-4 py-3 bg-gray-50 border rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3"><Lock className="w-5 h-5 text-gray-400" /><span>••••••••</span></div>
            <button type="button" onClick={() => setIsEditingPassword(true)} className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-sm rounded-lg flex items-center space-x-2"><Edit3 className="w-4 h-4" /><span>Cambiar</span></button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{isEditing ? 'Nueva Contraseña' : 'Contraseña *'}</label>
      <div className="relative">
        <input type={showPassword ? 'text' : 'password'} name="password" value={value} onChange={onChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Ingrese la contraseña" autoComplete="new-password" minLength="6" maxLength="50" />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}</button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!isEditing && (
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Debe tener entre 6 y 50 caracteres</span>
        </p>
      )}
    </div>
  );
};

// Función para formatear DUI automáticamente
const formatDUI = (value) => {
  // Remover todo lo que no sean números
  const numbers = value.replace(/\D/g, '');
  
  // Limitar a 9 dígitos máximo
  const limitedNumbers = numbers.slice(0, 9);
  
  // Aplicar formato: 12345678-9
  if (limitedNumbers.length <= 8) {
    return limitedNumbers;
  } else {
    return `${limitedNumbers.slice(0, 8)}-${limitedNumbers.slice(8)}`;
  }
};

// Función para validar formato DUI
const isValidDUI = (dui) => {
  const duiPattern = /^\d{8}-\d{1}$/;
  return duiPattern.test(dui) && dui.length === 10;
};

// Función para validar email
const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email) && email.length <= 100;
};

// Función para validar teléfono (8 dígitos)
const isValidPhone = (phone) => {
  const phoneNumber = phone.replace('+503', '');
  return phoneNumber.length === 8 && /^\d{8}$/.test(phoneNumber);
};

// Función para validar nombre/apellido
const isValidName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name.trim());
};

// Función para validar salario
const isValidSalary = (salary) => {
  const numSalary = parseFloat(salary);
  return !isNaN(numSalary) && numSalary >= 365 && numSalary <= 50000; // Salario mínimo SV aprox $365
};

const EnhancedField = ({ field, value, onChange, error, formData, handleNestedChange, selectedEmpleado }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Validación en tiempo real mejorada
  const validateField = (fieldValue, fieldType) => {
    switch (fieldType) {
      case 'nombre':
      case 'apellido':
        if (fieldValue && !isValidName(fieldValue)) {
          setValidationError(`${fieldType === 'nombre' ? 'El nombre' : 'El apellido'} debe tener 2-50 caracteres, solo letras y espacios`);
        } else {
          setValidationError('');
        }
        break;
      case 'dui':
        if (fieldValue && !isValidDUI(fieldValue)) {
          setValidationError('DUI debe tener formato: 12345678-9 (9 dígitos)');
        } else {
          setValidationError('');
        }
        break;
      case 'correo':
        if (fieldValue && !isValidEmail(fieldValue)) {
          setValidationError('Formato de correo inválido o muy largo (máx. 100 caracteres)');
        } else {
          setValidationError('');
        }
        break;
      case 'telefono':
        if (fieldValue && !isValidPhone(fieldValue)) {
          setValidationError('El teléfono debe tener exactamente 8 dígitos');
        } else {
          setValidationError('');
        }
        break;
      case 'salario':
        if (fieldValue && !isValidSalary(fieldValue)) {
          setValidationError('El salario debe estar entre $365 y $50,000');
        } else {
          setValidationError('');
        }
        break;
      default:
        setValidationError('');
    }
  };

  const getFieldValue = () => {
    if (field.nested) {
      const keys = field.name.split('.');
      if (keys[0] === 'direccion') {
        const direccionData = formData?.direccion || selectedEmpleado?.direccion || {};
        return direccionData[keys[1]] || '';
      }
      const nestedObj = formData?.[keys[0]] || selectedEmpleado?.[keys[0]] || {};
      return nestedObj[keys[1]] || '';
    }
    return value ?? formData?.[field.name] ?? selectedEmpleado?.[field.name] ?? '';
  };

  const handleFieldChange = (e) => {
    let { name, value: inputValue } = e.target;
    
    // Aplicar formato automático para DUI
    if (name === 'dui') {
      inputValue = formatDUI(inputValue);
      validateField(inputValue, 'dui');
    }

    // Normalizar email a minúsculas
    if (name === 'correo') {
      inputValue = inputValue.toLowerCase().trim();
      validateField(inputValue, 'correo');
    }

    // Limitar nombres y apellidos
    if (name === 'nombre' || name === 'apellido') {
      inputValue = inputValue.slice(0, 50);
      validateField(inputValue, name);
    }

    // Validar teléfono
    if (name === 'telefono') {
      validateField(inputValue, 'telefono');
    }

    // Validar salario
    if (name === 'salario') {
      validateField(inputValue, 'salario');
    }
    
    if (field.nested) {
      handleNestedChange(field.name, inputValue);
      
      // Si cambió el departamento, resetear municipio
      if (field.name === 'direccion.departamento' && inputValue !== selectedEmpleado?.direccion?.departamento) {
        handleNestedChange('direccion.municipio', '');
      }
    } else {
      onChange({
        target: {
          name: field.name,
          value: inputValue
        }
      });
      
      if (field.name === 'departamento' && inputValue !== formData.departamento) {
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
    error || validationError ? 'border-red-500 bg-red-50' : 
    isFocused ? 'border-blue-500' : 'border-gray-300 bg-white'
  } ${field.disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`;

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
          disabled={field.disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <option value="">
            {field.disabled ? `Primero selecciona ${field.name.includes('municipio') ? 'un departamento' : field.label.toLowerCase()}` : 
             field.placeholder || `Seleccione ${field.label.toLowerCase()}`}
          </option>
          {Array.isArray(field.options) && field.options.map((option, index) => {
            const optionValue = typeof option === 'object' && option.value !== undefined ? option.value : option;
            const optionLabel = typeof option === 'object' && option.label !== undefined ? option.label : option;
            
            return (
              <option key={`${field.name}-${index}-${optionValue}`} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
        {(error || validationError) && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error || validationError}</span>
          </p>
        )}
        {field.name.includes('municipio') && field.disabled && (
          <p className="text-blue-500 text-sm flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>Primero selecciona un departamento</span>
          </p>
        )}
      </div>
    );
  }

  if (field.type === 'textarea') return (
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
        maxLength="200"
      />
      {(error || validationError) && (
        <p className="text-red-500 text-sm flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error || validationError}</span>
        </p>
      )}
      <p className="text-xs text-gray-500 flex items-center space-x-1">
        <AlertCircle className="w-3 h-3" />
        <span>Máximo 200 caracteres ({getFieldValue().length}/200)</span>
      </p>
    </div>
  );

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
            onChange={(e) => {
              const phoneValue = e.target.value.replace(/\D/g, '').slice(0, 8);
              const fullPhone = '+503' + phoneValue;
              onChange({ target: { name: field.name, value: fullPhone } });
              validateField(fullPhone, 'telefono');
            }}
            placeholder="78901234"
            className={`flex-1 px-4 py-3 border-t border-b border-r rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base ${
              error || validationError ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength="8"
            inputMode="numeric"
          />
        </div>
        {(error || validationError) && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error || validationError}</span>
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
      <div className="relative">
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
          min={field.type === 'number' && field.name === 'salario' ? '365' : undefined}
          max={field.type === 'number' && field.name === 'salario' ? '50000' : undefined}
          maxLength={
            field.name === 'dui' ? '10' : 
            field.name === 'nombre' || field.name === 'apellido' ? '50' :
            field.name === 'correo' ? '100' : undefined
          }
        />
      </div>
      
      {(error || validationError) && (
        <p className="text-red-500 text-sm flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error || validationError}</span>
        </p>
      )}

      {/* Mensajes informativos específicos por campo */}
      {field.type === 'email' && (
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Ejemplo: empleado@email.com (máx. 100 caracteres)</span>
        </p>
      )}
      {field.name === 'dui' && (
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Formato automático: 12345678-9</span>
        </p>
      )}
      {field.name === 'salario' && (
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Salario en USD ($365 - $50,000)</span>
        </p>
      )}
      {(field.name === 'nombre' || field.name === 'apellido') && (
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Solo letras y espacios (2-50 caracteres)</span>
        </p>
      )}
    </div>
  );
};

const EmpleadosFormModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    title, 
    formData, 
    handleInputChange, 
    handleNestedChange,
    errors, 
    submitLabel, 
    sucursales, 
    setFormData, 
    selectedEmpleado, 
    onReturnToOptometristaEdit 
}) => {
    const [validationErrors, setValidationErrors] = useState({});
    
    const departments = useMemo(() => Object.keys(EL_SALVADOR_DATA), []);
    
    const municipalities = useMemo(() => {
        const selectedDepartment = formData?.direccion?.departamento;
        
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
    }, [formData?.direccion?.departamento]);

    const isMunicipalityDisabled = !formData?.direccion?.departamento;

    // Validación en tiempo real
    const validateField = (name, value) => {
      const newErrors = { ...validationErrors };

      switch (name) {
        case 'nombre':
        case 'apellido':
          if (!value || !isValidName(value)) {
            newErrors[name] = `${name === 'nombre' ? 'El nombre' : 'El apellido'} debe tener 2-50 caracteres, solo letras y espacios`;
          } else {
            delete newErrors[name];
          }
          break;
        
        case 'dui':
          if (!value) {
            newErrors[name] = 'El DUI es obligatorio';
          } else if (!isValidDUI(value)) {
            newErrors[name] = 'DUI debe tener formato: 12345678-9 (9 dígitos)';
          } else {
            delete newErrors[name];
          }
          break;
        
        case 'telefono':
          if (!value) {
            newErrors[name] = 'El teléfono es obligatorio';
          } else if (!isValidPhone(value)) {
            newErrors[name] = 'El teléfono debe tener exactamente 8 dígitos';
          } else {
            delete newErrors[name];
          }
          break;
        
        case 'correo':
          if (!value) {
            newErrors[name] = 'El correo es obligatorio';
          } else if (!isValidEmail(value)) {
            newErrors[name] = 'Formato de correo inválido o muy largo (máx. 100 caracteres)';
          } else {
            delete newErrors[name];
          }
          break;
        
        case 'cargo':
          if (!value) {
            newErrors[name] = 'El cargo es obligatorio';
          } else {
            delete newErrors[name];
          }
          break;
        
        case 'sucursalId':
          if (!value) {
            newErrors[name] = 'La sucursal es obligatoria';
          } else {
            delete newErrors[name];
          }
          break;
        
        case 'salario':
          if (!value) {
            newErrors[name] = 'El salario es obligatorio';
          } else if (!isValidSalary(value)) {
            newErrors[name] = 'El salario debe estar entre $365 y $50,000';
          } else {
            delete newErrors[name];
          }
          break;
        
        case 'fechaContratacion':
          if (!value) {
            newErrors[name] = 'La fecha de contratación es obligatoria';
          } else {
            const selectedDate = new Date(value);
            const today = new Date();
            const minDate = new Date('2000-01-01');
            if (selectedDate > today) {
              newErrors[name] = 'La fecha no puede ser futura';
            } else if (selectedDate < minDate) {
              newErrors[name] = 'Fecha debe ser posterior al año 2000';
            } else {
              delete newErrors[name];
            }
          }
          break;
        
        case 'departamento':
          if (!value) {
            newErrors[name] = 'El departamento es obligatorio';
          } else {
            delete newErrors[name];
          }
          break;
        
        case 'municipio':
          if (!value) {
            newErrors[name] = 'El municipio es obligatorio';
          } else {
            delete newErrors[name];
          }
          break;
        
        case 'direccionDetallada':
          if (!value || value.trim().length < 10 || value.trim().length > 200) {
            newErrors[name] = 'La dirección debe tener entre 10 y 200 caracteres';
          } else {
            delete newErrors[name];
          }
          break;
        
        case 'password':
          if (!selectedEmpleado) { // Solo validar password en creación
            if (!value) {
              newErrors[name] = 'La contraseña es obligatoria';
            } else if (value.length < 6 || value.length > 50) {
              newErrors[name] = 'La contraseña debe tener entre 6 y 50 caracteres';
            } else {
              delete newErrors[name];
            }
          }
          break;
        
        case 'estado':
          if (!value) {
            newErrors[name] = 'El estado es obligatorio';
          } else {
            delete newErrors[name];
          }
          break;
      }

      setValidationErrors(newErrors);
    };

    // Manejar cambios con validación
    const handleValidatedInputChange = (e) => {
      const { name, value } = e.target;
      
      // Manejar direccion como objeto anidado
      if (name.includes('direccion.')) {
        const fieldName = name.split('.')[1];
        const newDireccion = {
          ...formData.direccion,
          [fieldName]: value
        };
        
        // Si cambia departamento, resetear municipio
        if (fieldName === 'departamento') {
          newDireccion.municipio = '';
        }
        
        setFormData(prev => ({
          ...prev,
          direccion: newDireccion
        }));
        
        validateField(fieldName, value);
      } else {
        handleInputChange(e);
        validateField(name, value);
      }
    };

    // Initialize form with employee data when editing
    useEffect(() => {
        if (selectedEmpleado) {
            console.log('Initializing form with employee data:', selectedEmpleado);
            
            let direccionData = {};
            
            if (selectedEmpleado.direccion && typeof selectedEmpleado.direccion === 'object') {
                direccionData = {
                    departamento: selectedEmpleado.direccion.departamento || '',
                    municipio: selectedEmpleado.direccion.municipio || '',
                    direccionDetallada: selectedEmpleado.direccion.direccionDetallada || ''
                };
            } else {
                direccionData = {
                    departamento: selectedEmpleado.departamento || '',
                    municipio: selectedEmpleado.municipio || '',
                    direccionDetallada: selectedEmpleado.direccionDetallada || ''
                };
            }
            
            setFormData(prev => ({
                ...prev,
                ...selectedEmpleado,
                direccion: direccionData,
                fechaContratacion: selectedEmpleado.fechaContratacion 
                    ? new Date(selectedEmpleado.fechaContratacion).toISOString().split('T')[0]
                    : '',
                telefono: selectedEmpleado.telefono?.startsWith('+503') 
                    ? selectedEmpleado.telefono 
                    : '+503' + (selectedEmpleado.telefono || '')
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                direccion: {
                    departamento: '',
                    municipio: '',
                    direccionDetallada: ''
                }
            }));
        }
    }, [selectedEmpleado, setFormData]);

    const sections = [
        { title: "  Información Personal", fields: [
            { name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Juan Carlos', required: true },
            { name: 'apellido', label: 'Apellido', type: 'text', placeholder: 'García López', required: true },
            { name: 'dui', label: 'DUI', type: 'text', placeholder: '12345678-9', required: true },
            { name: 'telefono', label: 'Teléfono', type: 'text', placeholder: '78901234', required: true },
            { name: 'correo', label: 'Correo Electrónico', type: 'email', placeholder: 'juan.garcia@email.com', required: true },
        ]},
        { title: "  Información de Residencia", fields: [
            { 
                name: 'direccion.departamento', 
                label: 'Departamento', 
                type: 'select', 
                options: departments, 
                placeholder: 'Seleccione un departamento',
                nested: true, 
                required: true 
            },
            { 
                name: 'direccion.municipio', 
                label: 'Ciudad/Municipio', 
                type: 'select', 
                options: municipalities, 
                placeholder: isMunicipalityDisabled ? 'Primero selecciona un departamento' : 'Seleccione una ciudad',
                nested: true, 
                disabled: isMunicipalityDisabled, 
                required: true 
            },
            { 
                name: 'direccion.direccionDetallada', 
                label: 'Dirección Completa', 
                type: 'textarea', 
                placeholder: 'Colonia Santa Elena, Calle Los Rosales #456, Casa amarilla con portón negro',
                nested: true, 
                className: 'md:col-span-2', 
                required: true 
            },
        ]},
        { title: " Información Laboral", fields: [
            { name: 'sucursalId', label: 'Sucursal', type: 'select', options: sucursales?.map(s => ({ value: s._id, label: s.nombre })) || [], required: true },
            { name: 'cargo', label: 'Puesto', type: 'select', options: ['Administrador', 'Gerente', 'Vendedor', 'Optometrista', 'Técnico', 'Recepcionista'], required: true },
            { name: 'salario', label: 'Salario (USD)', type: 'number', placeholder: '500.00', required: true },
            { name: 'fechaContratacion', label: 'Fecha de Contratación', type: 'date', required: true },
            { name: 'estado', label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'], required: true },
        ]}
    ];

    const handleFormSubmit = () => {
        // Validar todos los campos antes de enviar
        const fieldsToValidate = [
            'nombre', 'apellido', 'dui', 'telefono', 'correo', 'cargo', 
            'sucursalId', 'salario', 'fechaContratacion', 'estado',
            'departamento', 'municipio', 'direccionDetallada'
        ];
        if (!selectedEmpleado) fieldsToValidate.push('password');

        fieldsToValidate.forEach(field => {
            let value;
            if (['departamento', 'municipio', 'direccionDetallada'].includes(field)) {
                value = formData.direccion?.[field] || '';
            } else {
                value = formData[field] || '';
            }
            validateField(field, value);
        });

        // Si hay errores de validación, no enviar
        if (Object.keys(validationErrors).length === 0) {
            onSubmit();
        }
    };

    const getSubmitIcon = () => {
        if (selectedEmpleado) return <Save className="w-4 h-4" />;
        if (formData?.cargo === 'Optometrista') return <ArrowRight className="w-4 h-4" />;
        return <Save className="w-4 h-4" />;
    };

    const getSubmitLabel = () => {
        if (selectedEmpleado) {
            if (selectedEmpleado.cargo !== 'Optometrista' && formData?.cargo === 'Optometrista') {
                return 'Continuar';
            }
            return 'Actualizar Empleado';
        }
        if (formData?.cargo === 'Optometrista') {
            return 'Continuar';
        }
        return 'Guardar Empleado';
    };

    const customContent = (
        <div className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-2xl border">
                <div className="flex justify-center">
                    <PhotoUploadComponent 
                        currentPhoto={formData?.fotoPerfil} 
                        onPhotoChange={(url) => setFormData(prev => ({ ...prev, fotoPerfil: url }))} 
                        employeeName={`${formData?.nombre || ''} ${formData?.apellido || ''}`.trim()} 
                    />
                </div>
            </div>
            
            {sections.map((section, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">{section.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {section.fields.map((field, fIdx) => (
                            <div key={fIdx} className={field.className || (field.type === 'textarea' ? 'md:col-span-2' : '')}>
                                <EnhancedField
                                    field={field}
                                    value={(() => {
                                        if (field.nested) {
                                            const keys = field.name.split('.');
                                            const nestedObj = formData?.direccion || selectedEmpleado?.direccion || {};
                                            return nestedObj[keys[1]] || '';
                                        }
                                        return formData?.[field.name] || '';
                                    })()}
                                    onChange={field.nested ? (e) => {
                                        const value = e.target.value;
                                        if (field.name === 'direccion.departamento') {
                                            handleNestedChange('direccion.municipio', '');
                                        }
                                        handleNestedChange(field.name, value);
                                        
                                        // Validar el campo
                                        const fieldName = field.name.split('.')[1] || field.name;
                                        validateField(fieldName, value);
                                    } : handleValidatedInputChange}
                                    error={validationErrors[field.name] || validationErrors[field.name?.split('.')[1]] || errors[field.name]}
                                    formData={formData}
                                    handleNestedChange={handleNestedChange}
                                    selectedEmpleado={selectedEmpleado}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">  Acceso y Seguridad</h3>
                <div className="max-w-md">
                    <PasswordField 
                        value={formData?.password || ''} 
                        onChange={handleValidatedInputChange} 
                        error={validationErrors.password || errors?.password} 
                        isEditing={!!selectedEmpleado} 
                    />
                </div>
            </div>
            
            {/* Errores de validación global */}
            {Object.keys(validationErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <h4 className="font-medium text-red-800">Corrige los siguientes errores:</h4>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                        {Object.entries(validationErrors).map(([field, error]) => (
                            <li key={field}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}
            
            {formData?.cargo === 'Optometrista' && !selectedEmpleado && (
                <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-4 flex items-center space-x-3">
                    <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-cyan-800">¡Perfil de Optometrista Seleccionado!</h4>
                        <p className="text-sm text-cyan-600 mt-1">Al continuar, configurarás horarios y especialidades.</p>
                    </div>
                    <ArrowRight className="w-8 h-8 text-cyan-500 shrink-0" />
                </div>
            )}
            
            {formData?.cargo === 'Optometrista' && selectedEmpleado && selectedEmpleado.cargo !== 'Optometrista' && (
                <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-4 flex items-center space-x-3">
                    <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-cyan-800">¡Cambio a Optometrista Detectado!</h4>
                        <p className="text-sm text-cyan-600 mt-1">Al continuar, configurarás los detalles del optometrista.</p>
                    </div>
                    <ArrowRight className="w-8 h-8 text-cyan-500 shrink-0" />
                </div>
            )}
            
            {formData?.fromOptometristaPage && onReturnToOptometristaEdit && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-semibold text-blue-800">Editando desde Optometrista</h4>
                        <p className="text-xs text-blue-600">Puedes regresar a editar los detalles del optometrista.</p>
                    </div>
                    <button type="button" onClick={() => onReturnToOptometristaEdit(selectedEmpleado?._id)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                        Editar Optometrista
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <FormModal 
            isOpen={isOpen} 
            onClose={onClose} 
            onSubmit={handleFormSubmit}
            title={title}
            formData={formData} 
            handleInputChange={handleValidatedInputChange} 
            errors={{...errors, ...validationErrors}} 
            submitLabel={getSubmitLabel()}
            submitIcon={getSubmitIcon()} 
            fields={[]} 
            gridCols={1} 
            size="xl"
            submitDisabled={Object.keys(validationErrors).length > 0}
        >
            {customContent}
        </FormModal>
    );
};

export default EmpleadosFormModal;