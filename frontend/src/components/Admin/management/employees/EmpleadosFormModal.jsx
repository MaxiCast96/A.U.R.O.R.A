import React, { useState, useEffect, useMemo } from 'react';
import FormModal from '../../ui/FormModal';
import { Camera, Upload, X, User, Edit3, Eye, EyeOff, Lock, Unlock, Check, AlertCircle, Phone as PhoneIcon, ArrowRight, Save, Loader } from 'lucide-react';
import { EL_SALVADOR_DATA } from '../../constants/ElSalvadorData';
import axios from 'axios';

// URL base de tu API
const API_URL = 'https://a-u-r-o-r-a.onrender.com/api/empleados';

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
            placeholder="Ingrese la contraseña" autoComplete="new-password" />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}</button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

// NUEVO: Componente para mostrar validaciones en tiempo real
const ValidationAlert = ({ type, message, isVisible }) => {
  if (!isVisible) return null;
  
  const bgColor = type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const textColor = type === 'error' ? 'text-red-800' : 'text-green-800';
  const icon = type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />;
  
  return (
    <div className={`${bgColor} border rounded-lg p-3 flex items-center space-x-2 transition-all duration-300`}>
      <div className={textColor}>{icon}</div>
      <p className={`text-sm ${textColor}`}>{message}</p>
    </div>
  );
};

const EnhancedField = ({ field, value, onChange, error, formData, handleNestedChange, selectedEmpleado, onValidationChange }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Función para validar DUI y correo duplicados
  const validateUniqueness = async (fieldValue, fieldType) => {
    if (!fieldValue || fieldValue.trim() === '') {
      setValidationResult(null);
      return;
    }

    // No validar si estamos editando y el valor no ha cambiado
    if (selectedEmpleado && selectedEmpleado[fieldType] === fieldValue) {
      setValidationResult({ type: 'success', message: 'Campo actual' });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await axios.get(`${API_URL}/validate`, {
        params: { 
          field: fieldType, 
          value: fieldValue,
          excludeId: selectedEmpleado?._id // Excluir el ID actual si estamos editando
        }
      });

      if (response.data.exists) {
        setValidationResult({ 
          type: 'error', 
          message: `Este ${fieldType === 'dui' ? 'DUI' : 'correo'} ya está registrado` 
        });
        onValidationChange?.(fieldType, false);
      } else {
        setValidationResult({ 
          type: 'success', 
          message: `${fieldType === 'dui' ? 'DUI' : 'Correo'} disponible` 
        });
        onValidationChange?.(fieldType, true);
      }
    } catch (error) {
      console.error(`Error validating ${fieldType}:`, error);
      setValidationResult(null);
      onValidationChange?.(fieldType, true); // Asumir válido si hay error de red
    } finally {
      setIsValidating(false);
    }
  };

  // Efecto para validar DUI y correo con debounce
  useEffect(() => {
    if (field.name === 'dui' || field.name === 'correo') {
      const timeoutId = setTimeout(() => {
        validateUniqueness(value, field.name);
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [value, field.name]);

  const getFieldValue = () => {
    if (field.nested) {
      const keys = field.name.split('.');
      // Handle nested address data
      if (keys[0] === 'direccion') {
        // Get the nested value with proper null checks
        // First check if we have formData.direccion, if not, check selectedEmpleado.direccion
        const direccionData = formData?.direccion || selectedEmpleado?.direccion || {};
        return direccionData[keys[1]] || '';
      }
      // Handle other nested fields if needed
      const nestedObj = formData?.[keys[0]] || selectedEmpleado?.[keys[0]] || {};
      return nestedObj[keys[1]] || '';
    }
    // Handle non-nested fields - check both formData and selectedEmpleado
    return value ?? formData?.[field.name] ?? selectedEmpleado?.[field.name] ?? '';
  };

  const handleFieldChange = (e) => {
    const { value } = e.target;
    
    if (field.nested) {
      // Use handleNestedChange for nested fields
      handleNestedChange(field.name, value);
      
      // If department changed, reset the municipality
      if (field.name === 'direccion.departamento' && value !== selectedEmpleado?.direccion?.departamento) {
        handleNestedChange('direccion.municipio', '');
      }
    } else {
      // Handle non-nested fields
      onChange({
        target: {
          name: field.name,
          value: value
        }
      });
      
      // Clear previous validation when changing the field
      if (field.name === 'dui' || field.name === 'correo') {
        setValidationResult(null);
      }
    }
  };

  const inputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${
    error || (validationResult?.type === 'error') ? 'border-red-500' : 
    validationResult?.type === 'success' ? 'border-green-500' : 'border-gray-300'
  } ${field.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`;

  if (field.type === 'select') return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{field.label}{field.required && ' *'}</label>
      <div className="relative">
        <select 
          name={field.name} 
          value={getFieldValue()} 
          onChange={handleFieldChange} 
          className={inputClasses} 
          disabled={field.disabled}
        >
          <option value="">{field.placeholder || 'Seleccione'}</option>
          {field.options?.map((opt, idx) => typeof opt === 'object' ? <option key={idx} value={opt.value}>{opt.label}</option> : <option key={idx} value={opt}>{opt}</option>)}
        </select>
        {field.disabled && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
      {field.disabled && !formData?.direccion?.departamento && (
        <p className="text-gray-500 text-xs">Primero selecciona un departamento</p>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );

  if (field.type === 'textarea') return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{field.label}{field.required && ' *'}</label>
      <textarea name={field.name} value={getFieldValue()} onChange={handleFieldChange} placeholder={field.placeholder} className={`${inputClasses} resize-none`} rows={3} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{field.label}{field.required && ' *'}</label>
      <div className="relative">
        <input 
          type={field.type} 
          name={field.name} 
          value={getFieldValue()} 
          onChange={handleFieldChange} 
          placeholder={field.placeholder} 
          className={inputClasses} 
          step={field.type === 'number' ? '0.01' : undefined} 
          min={field.type === 'number' ? '0' : undefined} 
        />
        {isValidating && (field.name === 'dui' || field.name === 'correo') && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        )}
      </div>
      
      {/* Mostrar resultado de validación */}
      {(field.name === 'dui' || field.name === 'correo') && (
        <ValidationAlert 
          type={validationResult?.type} 
          message={validationResult?.message} 
          isVisible={!!validationResult}
        />
      )}
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
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
    const departments = useMemo(() => Object.keys(EL_SALVADOR_DATA), []);
    const municipalities = useMemo(() => formData?.direccion?.departamento ? EL_SALVADOR_DATA[formData.direccion.departamento] : [], [formData?.direccion?.departamento]);
    
    // NUEVO: Estado para manejar validaciones de unicidad
    const [validationStatus, setValidationStatus] = useState({
      dui: true,
      correo: true
    });
    const [canSubmit, setCanSubmit] = useState(true);

    // NUEVO: Función para manejar cambios en validación
    const handleValidationChange = (field, isValid) => {
      setValidationStatus(prev => ({
        ...prev,
        [field]: isValid
      }));
    };

    // Initialize form with employee data when editing
    useEffect(() => {
      if (selectedEmpleado) {
        console.log('Initializing form with employee data:', selectedEmpleado);
        setFormData(prev => ({
          ...prev,
          ...selectedEmpleado,
          // Ensure direccion is properly initialized
          direccion: {
            departamento: '',
            municipio: '',
            direccionDetallada: '',
            ...(selectedEmpleado.direccion || {})
          },
          // Format date for date input
          fechaContratacion: selectedEmpleado.fechaContratacion 
            ? new Date(selectedEmpleado.fechaContratacion).toISOString().split('T')[0]
            : ''
        }));
      } else {
        // Reset form when adding new employee
        setFormData(prev => ({
          ...prev,
          direccion: {
            departamento: '',
            municipio: '',
            direccionDetallada: ''
          }
        }));
      }
    }, [selectedEmpleado]);

    // Efecto para determinar si se puede enviar el formulario
    useEffect(() => {
      const allValid = Object.values(validationStatus).every(status => status === true);
      setCanSubmit(allValid);
    }, [validationStatus]);

    const sections = [
        { title: "📋 Información Personal", fields: [
            { name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Juan Carlos', required: true },
            { name: 'apellido', label: 'Apellido', type: 'text', placeholder: 'García López', required: true },
            { name: 'dui', label: 'DUI', type: 'text', placeholder: '12345678-9', required: true },
            { name: 'telefono', label: 'Teléfono', type: 'text', placeholder: '78901234', required: true },
            { name: 'correo', label: 'Correo Electrónico', type: 'email', placeholder: 'juan.garcia@email.com', required: true },
        ]},
        { title: "🏠 Información de Residencia", fields: [
            { name: 'direccion.departamento', label: 'Departamento', type: 'select', options: departments, placeholder: 'Seleccione departamento', nested: true, required: true },
            { name: 'direccion.municipio', label: 'Municipio', type: 'select', options: municipalities, placeholder: 'Seleccione municipio', nested: true, disabled: !formData?.direccion?.departamento, required: true },
            { name: 'direccion.direccionDetallada', label: 'Dirección Completa', type: 'textarea', placeholder: 'Colonia, calle, # de casa', nested: true, className: 'md:col-span-2', required: true },
        ]},
        { title: "💼 Información Laboral", fields: [
            { name: 'sucursalId', label: 'Sucursal', type: 'select', options: sucursales?.map(s => ({ value: s._id, label: s.nombre })) || [], required: true },
            { name: 'cargo', label: 'Puesto', type: 'select', options: ['Administrador', 'Gerente', 'Vendedor', 'Optometrista', 'Técnico', 'Recepcionista'], required: true },
            { name: 'salario', label: 'Salario (USD)', type: 'number', placeholder: '500.00', required: true },
            { name: 'fechaContratacion', label: 'Fecha de Contratación', type: 'date', required: true },
            { name: 'estado', label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'], required: true },
        ]}
    ];

    // CORRECCIÓN: Función para determinar el ícono del botón
    const getSubmitIcon = () => {
        if (selectedEmpleado) return <Save className="w-4 h-4" />;
        if (formData?.cargo === 'Optometrista') return <ArrowRight className="w-4 h-4" />;
        return <Save className="w-4 h-4" />;
    };

    // CORRECCIÓN: Función para determinar el label del botón
    const getSubmitLabel = () => {
        if (selectedEmpleado) {
            // Si estamos editando y cambiamos a optometrista
            if (selectedEmpleado.cargo !== 'Optometrista' && formData?.cargo === 'Optometrista') {
                return 'Continuar';
            }
            return 'Actualizar Empleado';
        }
        // Si estamos creando y es optometrista
        if (formData?.cargo === 'Optometrista') {
            return 'Continuar';
        }
        return 'Guardar Empleado';
    };

    // NUEVO: Función para manejar el envío del formulario
    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        // Verificar validaciones de unicidad antes de enviar
        if (!canSubmit) {
            // Mostrar alerta sobre campos duplicados
            const duplicateFields = Object.entries(validationStatus)
                .filter(([key, value]) => !value)
                .map(([key]) => key === 'dui' ? 'DUI' : 'Correo');
            
            alert(`No se puede guardar el empleado. Los siguientes campos ya están registrados: ${duplicateFields.join(', ')}`);
            return;
        }
        
        onSubmit();
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
            
            {/* NUEVO: Alerta de validación global */}
            {!canSubmit && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                    <div>
                        <h4 className="font-semibold text-red-800">Datos duplicados detectados</h4>
                        <p className="text-sm text-red-600 mt-1">
                            Corrige los campos marcados antes de continuar.
                        </p>
                    </div>
                </div>
            )}
            
            {sections.map((section, idx) => (
                <div key={idx} className="bg-white border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">{section.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {section.fields.map((field, fIdx) => (
                            <div key={fIdx} className={field.className || ''}>
                                <div key={field.name} className="w-full">
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
                                                // Reset municipio when department changes
                                                handleNestedChange('direccion.municipio', '');
                                            }
                                            handleNestedChange(field.name, value);
                                        } : handleInputChange}
                                        error={errors[field.name]}
                                        formData={formData}
                                        selectedEmpleado={selectedEmpleado}
                                        onValidationChange={(isValid) => {
                                            if (field.name === 'dui' || field.name === 'correo') {
                                                handleValidationChange(field.name, isValid);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            
            <div className="bg-white border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">🔐 Acceso y Seguridad</h3>
                <PasswordField 
                    value={formData?.password || ''} 
                    onChange={handleInputChange} 
                    error={errors?.password} 
                    isEditing={!!selectedEmpleado} 
                />
            </div>
            
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
            
            {/* CORRECCIÓN: Mostrar alerta también para empleados existentes que cambian a optometrista */}
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
            onSubmit={handleFormSubmit} // CORRECCIÓN: Usar nuestra función personalizada
            title={title}
            formData={formData} 
            handleInputChange={handleInputChange} 
            errors={errors} 
            submitLabel={getSubmitLabel()} // CORRECCIÓN: Usar función dinámica
            submitIcon={getSubmitIcon()} 
            fields={[]} 
            gridCols={1} 
            size="xl"
            submitDisabled={!canSubmit} // NUEVO: Deshabilitar botón si hay validaciones pendientes
        >
            {customContent}
        </FormModal>
    );
};

export default EmpleadosFormModal;