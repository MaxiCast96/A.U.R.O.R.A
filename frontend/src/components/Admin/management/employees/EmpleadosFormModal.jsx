import React, { useState, useEffect, useMemo } from 'react';
import FormModal from '../../ui/FormModal';
import { Camera, Upload, X, User, Edit3, Eye, EyeOff, Lock, Unlock, Check, AlertCircle, Phone as PhoneIcon, ArrowRight, Save } from 'lucide-react';
import { EL_SALVADOR_DATA } from '../../constants/ElSalvadorData';

// Componente de subida de foto profesional
const PhotoUploadComponent = ({ 
  currentPhoto, 
  onPhotoChange, 
  uploading = false,
  employeeName = '',
  size = 'large'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const sizeConfigs = {
    small: { container: 'w-16 h-16', overlay: 'w-16 h-16', icon: 'w-4 h-4', text: 'text-xs' },
    medium: { container: 'w-24 h-24', overlay: 'w-24 h-24', icon: 'w-5 h-5', text: 'text-sm' },
    large: { container: 'w-32 h-32', overlay: 'w-32 h-32', icon: 'w-6 h-6', text: 'text-base' }
  };

  const config = sizeConfigs[size];

  const handleOpenWidget = () => {
    if (!window.cloudinary) {
      console.error("Cloudinary script not loaded");
      return;
    }

    const widget = window.cloudinary.createUploadWidget({
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      sources: ['local', 'camera', 'url'],
      folder: "empleados_perfil",
      multiple: false,
      maxFiles: 1,
      cropping: true,
      croppingAspectRatio: 1,
      croppingShowBackButton: true,
      croppingCoordinatesMode: 'custom',
      showAdvancedOptions: false,
      maxImageFileSize: 5000000,
      maxVideoFileSize: 10000000,
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      styles: {
        palette: {
          window: "#FFFFFF",
          windowBorder: "#0891B2",
          tabIcon: "#0891B2",
          menuIcons: "#5A616A",
          textDark: "#000000",
          textLight: "#FFFFFF",
          link: "#0891B2",
          action: "#0891B2",
          inactiveTabIcon: "#0E2F5A",
          error: "#F44235",
          inProgress: "#0891B2",
          complete: "#20B832",
          sourceBg: "#E4EBF1"
        }
      },
      text: {
        es: {
          "queue.title": "Subir Foto de Perfil",
          "queue.title_uploading_with_counter": "Subiendo {{num}} archivo",
          "queue.title_uploading_processing_complete": "Procesando...",
          "local.browse": "Seleccionar archivo",
          "local.dd_title_single": "Arrastra tu foto aquí",
          "camera.capture": "Tomar foto",
          "camera.cancel": "Cancelar",
          "camera.take_pic": "Tomar foto",
          "camera.explanation": "Asegúrate de permitir el acceso a la cámara",
          "crop.title": "Recortar foto",
          "crop.crop_btn": "Recortar",
          "crop.skip_btn": "Usar original",
          "crop.reset_btn": "Restablecer"
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
        setUploadProgress(10);
      }
      if (result && result.event === "upload-progress") {
        setUploadProgress(result.info.progress || 50);
      }
      if (result && result.event === "success") {
        console.log('Upload successful:', result.info);
        setUploadProgress(100);
        onPhotoChange(result.info.secure_url);
        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
        }, 1000);
      }
    });

    widget.open();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length > 1 ? 
      `${parts[0][0]}${parts[1][0]}` : 
      parts[0][0];
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div 
        className={`relative ${config.container} group cursor-pointer`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleOpenWidget}
      >
        <div className={`${config.container} rounded-full overflow-hidden bg-gradient-to-br from-cyan-100 to-blue-100 border-4 border-white shadow-lg transition-all duration-300 group-hover:shadow-xl`}>
          {currentPhoto ? (
            <img 
              src={currentPhoto} 
              alt={employeeName || 'Foto de perfil'} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-200 to-blue-200">
              {employeeName ? (
                <span className="text-cyan-800 font-bold text-xl select-none">
                  {getInitials(employeeName)}
                </span>
              ) : (
                <User className="w-8 h-8 text-cyan-600" />
              )}
            </div>
          )}
        </div>

        <div className={`absolute inset-0 ${config.container} rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center`}>
          <div className="text-white text-center">
            {isUploading ? (
              <div className="flex flex-col items-center space-y-1">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">Subiendo...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-1">
                <Edit3 className={config.icon} />
                <span className="text-xs font-medium">
                  {currentPhoto ? 'Cambiar' : 'Subir'}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          className={`absolute -bottom-1 -right-1 w-8 h-8 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center border-2 border-white ${isHovered ? 'scale-110' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenWidget();
          }}
        >
          <Camera className="w-4 h-4" />
        </button>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="absolute inset-0 rounded-full border-4 border-transparent">
            <div 
              className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"
              style={{
                background: `conic-gradient(from 0deg, #0891B2 ${uploadProgress * 3.6}deg, transparent ${uploadProgress * 3.6}deg)`
              }}
            />
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          {currentPhoto ? 'Cambiar foto de perfil' : 'Agregar foto de perfil'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Haz clic para {currentPhoto ? 'cambiar' : 'subir'} una foto
        </p>
      </div>

      <button
        type="button"
        onClick={handleOpenWidget}
        disabled={isUploading}
        className="sm:hidden w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {isUploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Subiendo...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>{currentPhoto ? 'Cambiar foto' : 'Subir foto'}</span>
          </>
        )}
      </button>
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

  if (isEditing && !isEditingPassword) {
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
  formData
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getFieldValue = () => {
    if (nested) {
      const keys = field.name.split('.');
      return formData?.direccion?.[keys[1]] || ''; 
    }
    return value || '';
  };

  const handleFieldChange = (e) => {
    const { name, value: inputValue } = e.target;

    if (nested) {
      const keys = name.split('.');
      onChange({
        target: {
          name: keys[0],
          value: {
            ...formData.direccion,
            [keys[1]]: inputValue
          }
        }
      });
      
      if (keys[1] === 'departamento' && inputValue !== formData.direccion?.departamento) {
        onChange({
          target: {
            name: 'direccion',
            value: {
              ...formData.direccion,
              departamento: inputValue,
              municipio: ''
            }
          }
        });
      }
    } else {
      onChange(e);
    }
  };

  const inputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-base ${
    error ? 'border-red-500 bg-red-50' : isFocused ? 'border-cyan-500' : 'border-gray-300 bg-white'
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
        >
          <option value="">
            {field.placeholder || `Seleccione ${field.label.toLowerCase()}`}
          </option>
          {Array.isArray(field.options) && field.options.map((option, index) => {
            if (typeof option === 'string') {
              return (
                <option key={`${field.name}-${index}-${option}`} value={option}>
                  {option}
                </option>
              );
            } else if (typeof option === 'object' && option.value && option.label) {
              return (
                <option key={`${field.name}-${index}-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              );
            }
            return null;
          })}
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
            value={value}
            onChange={onChange}
            placeholder="78901234"
            className={`flex-1 px-4 py-3 border-t border-b border-r rounded-r-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-base ${
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
        step={field.type === 'number' ? '0.01' : undefined}
        min={field.type === 'number' ? '0' : undefined}
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
          <span>Ejemplo: empleado@empresa.com</span>
        </p>
      )}
      {field.name === 'dui' && (
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Formato: 12345678-9</span>
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
    errors, 
    submitLabel, 
    sucursales,
    setFormData,
    selectedEmpleado = null,
    onReturnToOptometristaEdit
}) => {
    const [uploading, setUploading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const isEditing = !!selectedEmpleado;

    useEffect(() => {
        if (isEditing && selectedEmpleado) {
            setCurrentPassword(selectedEmpleado.password || '');
        }
    }, [isEditing, selectedEmpleado]);

    // Función corregida para manejar cambios de foto
    const handlePhotoChange = (photoUrl) => {
        console.log('Nueva foto URL:', photoUrl);
        setFormData(prev => ({ ...prev, fotoPerfil: photoUrl }));
    };

    // NUEVO: Función personalizada para manejar cambios en campos (especialmente cargo)
    const handleCustomInputChange = (e) => {
        const { name, value } = e.target;
        
        // Log para debugging del cambio de cargo
        if (name === 'cargo') {
            console.log('🔄 Cambio de cargo detectado:', {
                anterior: formData.cargo,
                nuevo: value,
                esEdicion: isEditing,
                cargoOriginal: selectedEmpleado?.cargo
            });
        }
        
        // Llamar al handleInputChange original
        handleInputChange(e);
    };

    // Función de envío que maneja correctamente la lógica
    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        // Si estamos editando y no hay contraseña, usar la actual
        if (isEditing && !formData.password) {
            setFormData(prev => ({ ...prev, password: currentPassword }));
        }
        
        // Llamar a la función onSubmit pasada desde el componente padre
        onSubmit();
    };

    // Obtener los departamentos y municipios dinámicamente
    const departments = useMemo(() => Object.keys(EL_SALVADOR_DATA), []);
    const municipalities = useMemo(() => {
        const selectedDepartment = formData?.direccion?.departamento;
        return selectedDepartment ? EL_SALVADOR_DATA[selectedDepartment] : [];
    }, [formData?.direccion?.departamento]);

    const sections = [
        {
            title: "📋 Información Personal",
            fields: [
                { name: 'nombre', label: 'Nombre Completo', type: 'text', placeholder: 'Ej: Juan Carlos', required: true },
                { name: 'apellido', label: 'Apellidos', type: 'text', placeholder: 'Ej: García López', required: true },
                { name: 'dui', label: 'Número de DUI', type: 'text', placeholder: '12345678-9', required: true },
                { name: 'telefono', label: 'Teléfono', type: 'text', required: true },
                { name: 'correo', label: 'Correo Electrónico', type: 'email', placeholder: 'juan.garcia@empresa.com', required: true },
            ]
        },
        {
            title: "🏠 Información de Residencia",
            fields: [
                { 
                    name: 'direccion.departamento', 
                    label: 'Departamento', 
                    type: 'select', 
                    options: departments, 
                    placeholder: 'Seleccione un departamento',
                    nested: true 
                },
                { 
                    name: 'direccion.municipio', 
                    label: 'Municipio', 
                    type: 'select', 
                    options: municipalities, 
                    placeholder: 'Seleccione un municipio',
                    nested: true,
                    disabled: !formData?.direccion?.departamento || municipalities.length === 0
                },
                { name: 'direccion.direccionDetallada', label: 'Dirección Completa', type: 'textarea', placeholder: 'Colonia Las Flores, Calle Principal #123, Casa azul con portón blanco', nested: true },
            ]
        },
        {
            title: "💼 Información Laboral",
            fields: [
                { 
                    name: 'sucursalId', 
                    label: 'Sucursal de Trabajo', 
                    type: 'select', 
                    options: sucursales ? sucursales.map(s => ({ value: s._id, label: s.nombre })) : [], 
                    required: true 
                },
                { 
                    name: 'cargo', 
                    label: 'Puesto de Trabajo', 
                    type: 'select', 
                    options: ['Administrador', 'Gerente', 'Vendedor', 'Optometrista', 'Técnico', 'Recepcionista'], 
                    required: true,
                    // NUEVO: Indicador visual para optometrista
                    highlighted: formData?.cargo === 'Optometrista'
                },
                { name: 'salario', label: 'Salario Mensual (USD)', type: 'number', placeholder: '500.00', required: true },
                { name: 'fechaContratacion', label: 'Fecha de Contratación', type: 'date', required: true },
                { name: 'estado', label: 'Estado del Empleado', type: 'select', options: ['Activo', 'Inactivo'], required: true },
            ]
        }
    ];

    // Función para determinar el ícono correcto del botón
    const getSubmitIcon = () => {
        if (isEditing) {
            return <Save className="w-4 h-4" />;
        }
        if (formData?.cargo === 'Optometrista') {
            return <ArrowRight className="w-4 h-4" />;
        }
        return <Save className="w-4 h-4" />;
    };

    const customContent = (
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-2xl border-2 border-cyan-100">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">📸 Foto de Perfil</h3>
              <p className="text-sm text-gray-600">Sube una foto clara del rostro del empleado</p>
            </div>
            <div className="flex justify-center">
              <PhotoUploadComponent
                currentPhoto={formData?.fotoPerfil}
                onPhotoChange={handlePhotoChange}
                uploading={uploading}
                employeeName={`${formData?.nombre || ''} ${formData?.apellido || ''}`.trim()}
                size="large"
              />
            </div>
          </div>

          {sections.map((section, sectionIndex) => (
            <div key={`section-${sectionIndex}`} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                {section.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.fields.map((field, fieldIndex) => (
                  <div key={`field-${sectionIndex}-${fieldIndex}`} 
                       className={`${field.type === 'textarea' ? 'md:col-span-2' : ''} ${
                         field.highlighted ? 'relative' : ''
                       }`}>
                    
                    {/* NUEVO: Indicador especial para el campo cargo cuando es Optometrista */}
                    {field.name === 'cargo' && formData?.cargo === 'Optometrista' && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-cyan-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                          ✨ Especialista
                        </div>
                      </div>
                    )}
                    
                    <EnhancedField
                      field={field}
                      value={formData?.[field.name]}
                      onChange={handleCustomInputChange} // CORRECCIÓN: Usar la función personalizada
                      error={errors?.[field.name] || (field.nested && errors?.[field.name.split('.')[1]])}
                      nested={field.nested}
                      placeholder={field.placeholder}
                      formData={formData}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              🔒 Acceso y Seguridad
            </h3>
            <div className="max-w-md">
              <PasswordField
                value={formData?.password || ''}
                onChange={handleCustomInputChange} // CORRECCIÓN: Usar la función personalizada
                error={errors?.password}
                isEditing={isEditing}
                currentPassword={currentPassword}
                placeholder="Contraseña para acceder al sistema"
              />
            </div>
          </div>

          {/* NUEVO: Indicador visual cuando se selecciona Optometrista */}
          {formData?.cargo === 'Optometrista' && !isEditing && (
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-cyan-800">¡Perfil de Optometrista Seleccionado!</h4>
                  <p className="text-sm text-cyan-600 mt-1">
                    Después de guardar la información básica, podrás configurar los horarios, especialidades y sucursales asignadas.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ArrowRight className="w-8 h-8 text-cyan-500" />
                </div>
              </div>
            </div>
          )}

          {/* Footer personalizado para flujos especiales */}
          {formData?.fromOptometristaPage && onReturnToOptometristaEdit && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-blue-800">Edición desde Optometrista</h4>
                  <p className="text-xs text-blue-600">Puedes regresar a editar la información específica del optometrista</p>
                </div>
                <button
                  type="button"
                  onClick={() => onReturnToOptometristaEdit(selectedEmpleado?._id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
                >
                  Editar Optometrista
                </button>
              </div>
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
            handleInputChange={handleCustomInputChange} // CORRECCIÓN: Usar la función personalizada
            errors={errors}
            submitLabel={submitLabel}
            submitIcon={getSubmitIcon()}
            fields={[]}
            gridCols={1}
            size="xl"
        >
            {customContent}
        </FormModal>
    );
};

export default EmpleadosFormModal;