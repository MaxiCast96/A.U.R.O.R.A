// src/components/management/optometristas/OptometristasFormModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import FormModal from '../../ui/FormModal';
import { Plus, Trash2, Clock, X, User, Mail, Phone, ChevronDown, Check, MapPin, ArrowLeft, AlertCircle} from 'lucide-react';

const OptometristasFormModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    title, 
    formData, 
    setFormData,
    handleInputChange, 
    errors, 
    submitLabel,
    empleados,
    sucursales,
    selectedOptometrista,
    isCreationFlow = false,
    preloadedEmployeeData = null,
    onBackToEmployeeForm = null,
    isCreating = false,
    creationStep = '',
    creationProgress = 0,
    // PROPS CORREGIDOS para navegación con el sistema de dashboard
    setActiveSection = null,
    onCreationComplete = null
}) => {
    // Estado para la alerta de límite de horas
    const [showLimitAlert, setShowLimitAlert] = useState(false);
    // Estado para el dropdown de empleados
    const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
    // Estado para validaciones locales
    const [localErrors, setLocalErrors] = useState({});
    const [showValidationAlert, setShowValidationAlert] = useState(false);

    const especialidadOptions = [
        'General', 
        'Pediátrica', 
        'Contactología', 
        'Baja Visión', 
        'Ortóptica'
    ];

    // Efecto para establecer el empleadoId cuando estamos en flujo de creación
    useEffect(() => {
        if (isCreationFlow && preloadedEmployeeData && !formData.empleadoId) {
            console.log('🔄 Estableciendo empleadoId para flujo de creación:', preloadedEmployeeData);
            setFormData(prev => ({
                ...prev,
                empleadoId: preloadedEmployeeData._id || 'temp_employee_id'
            }));
        }
    }, [isCreationFlow, preloadedEmployeeData, formData.empleadoId, setFormData]);

    // Validar campos del formulario
    const validateForm = () => {
        const newErrors = {};
        
        // Validar especialidad
        if (!formData.especialidad || formData.especialidad.trim() === '') {
            newErrors.especialidad = 'La especialidad es obligatoria';
        }
        
        // Validar licencia
        if (!formData.licencia || formData.licencia.trim() === '') {
            newErrors.licencia = 'El número de licencia es obligatorio';
        } else if (formData.licencia.trim().length < 3) {
            newErrors.licencia = 'El número de licencia debe tener al menos 3 caracteres';
        }
        
        // Validar experiencia
        if (!formData.experiencia && formData.experiencia !== 0) {
            newErrors.experiencia = 'Los años de experiencia son obligatorios';
        } else if (parseInt(formData.experiencia) < 0) {
            newErrors.experiencia = 'Los años de experiencia no pueden ser negativos';
        } else if (parseInt(formData.experiencia) > 50) {
            newErrors.experiencia = 'Los años de experiencia no pueden exceder 50 años';
        }
        
        // Validar empleado (solo si no es flujo de creación)
        if (!isCreationFlow && (!formData.empleadoId || formData.empleadoId.trim() === '')) {
            newErrors.empleadoId = 'Debe seleccionar un empleado';
        }
        
        // Validar sucursales
        if (!formData.sucursalesAsignadas || formData.sucursalesAsignadas.length === 0) {
            newErrors.sucursalesAsignadas = 'Debe asignar al menos una sucursal';
        }
        
        // Validar disponibilidad
        if (!formData.disponibilidad || formData.disponibilidad.length === 0) {
            newErrors.disponibilidad = 'Debe configurar al menos una hora de disponibilidad';
        } else {
            const totalHoras = normalizeDisponibilidad(formData.disponibilidad).length;
            if (totalHoras > 44) {
                newErrors.disponibilidad = 'No puede exceder las 44 horas semanales';
            }
        }
        
        // Validar estado de disponibilidad
        if (formData.disponible === undefined || formData.disponible === null || formData.disponible === '') {
            newErrors.disponible = 'Debe seleccionar el estado de disponibilidad';
        }

        return newErrors;
    };

    // Convertir empleados a opciones para el select
    const empleadosOptions = empleados?.map(emp => ({
        value: emp._id,
        label: `${emp.nombre} ${emp.apellido} - ${emp.correo}`,
        empleado: emp
    })) || [];

    // Convertir sucursales a opciones para el multi-select
    const sucursalesOptions = sucursales?.map(suc => ({
        value: suc._id,
        label: suc.nombre
    })) || [];

    // Días de la semana
    const diasSemana = [
        { key: 'lunes', label: 'Lunes' },
        { key: 'martes', label: 'Martes' },
        { key: 'miercoles', label: 'Miércoles' },
        { key: 'jueves', label: 'Jueves' },
        { key: 'viernes', label: 'Viernes' },
        { key: 'sabado', label: 'Sábado' },
        { key: 'domingo', label: 'Domingo' }
    ];

    // Horas disponibles (8:00 AM a 4:00 PM)
    const horasDisponibles = [
        '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
    ];

    // Normalizar la disponibilidad para trabajar con formato uniforme
    const normalizeDisponibilidad = (disponibilidad) => {
        if (!Array.isArray(disponibilidad)) return [];
        
        const normalized = [];
        disponibilidad.forEach(item => {
            if (item.hora) {
                // Formato nuevo: cada hora individual
                normalized.push({
                    dia: item.dia,
                    hora: item.hora
                });
            } else if (item.horaInicio && item.horaFin) {
                // Formato antiguo: rangos de horas
                const startIndex = horasDisponibles.indexOf(item.horaInicio);
                const endHour = item.horaFin.includes(':00') ? 
                    item.horaFin.split(':')[0] + ':00' : 
                    item.horaFin;
                const endIndex = horasDisponibles.indexOf(endHour);
                
                if (startIndex >= 0 && endIndex > startIndex) {
                    for (let i = startIndex; i < endIndex; i++) {
                        normalized.push({
                            dia: item.dia,
                            hora: horasDisponibles[i]
                        });
                    }
                } else if (startIndex >= 0 && endIndex === -1) {
                    // Solo una hora
                    normalized.push({
                        dia: item.dia,
                        hora: item.horaInicio
                    });
                }
            }
        });
        
        return normalized;
    };

    // Función para verificar si una hora está seleccionada para un día
    const isHoraSelected = (dia, hora) => {
        const normalized = normalizeDisponibilidad(formData.disponibilidad);
        return normalized.some(d => d.dia === dia && d.hora === hora);
    };

    // Función mejorada para manejar selección de horas individuales
    const handleHoraToggle = (dia, hora) => {
        const normalized = normalizeDisponibilidad(formData.disponibilidad);
        
        // Buscar si ya existe esta combinación día-hora
        const existingIndex = normalized.findIndex(item => 
            item.dia === dia && item.hora === hora
        );
        
        let newDisponibilidad;
        if (existingIndex >= 0) {
            // Si ya existe, la removemos (toggle off)
            newDisponibilidad = normalized.filter((_, index) => index !== existingIndex);
        } else {
            // Verificar límite de 44 horas semanales antes de agregar
            if (normalized.length >= 44) {
                showHourLimitAlert();
                return;
            }
            // Si no existe, la agregamos (toggle on)
            newDisponibilidad = [...normalized, { dia, hora }];
        }
        
        // Convertir de vuelta al formato esperado por el backend
        const backendFormat = newDisponibilidad.map(item => ({
            dia: item.dia,
            hora: item.hora,
            horaInicio: item.hora,
            horaFin: getNextHour(item.hora)
        }));
        
        setFormData(prev => ({
            ...prev,
            disponibilidad: backendFormat
        }));

        // Limpiar error de disponibilidad si existe
        if (localErrors.disponibilidad && backendFormat.length > 0) {
            setLocalErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.disponibilidad;
                return newErrors;
            });
        }
    };

    // Función helper para obtener la siguiente hora
    const getNextHour = (hora) => {
        const currentIndex = horasDisponibles.indexOf(hora);
        if (currentIndex >= 0 && currentIndex < horasDisponibles.length - 1) {
            return horasDisponibles[currentIndex + 1];
        }
        if (hora === '16:00') {
        return '17:00';
    }
        // Para la última hora, agregar :59 para indicar el final de la hora
        const [hourPart] = hora.split(':');
        return `${hourPart}:00`;
    };

    // Manejar cambios en multi-select de sucursales
    const handleSucursalesChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({
            ...prev,
            sucursalesAsignadas: selectedOptions
        }));

        // Limpiar error de sucursales si existe
        if (localErrors.sucursalesAsignadas && selectedOptions.length > 0) {
            setLocalErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.sucursalesAsignadas;
                return newErrors;
            });
        }
    };

    // Función para limpiar todos los horarios de un día
    const clearDaySchedule = (dia) => {
        const normalized = normalizeDisponibilidad(formData.disponibilidad);
        const filteredNormalized = normalized.filter(item => item.dia !== dia);
        
        // Convertir de vuelta al formato del backend
        const backendFormat = filteredNormalized.map(item => ({
            dia: item.dia,
            hora: item.hora,
            horaInicio: item.hora,
            horaFin: getNextHour(item.hora)
        }));
        
        setFormData(prev => ({
            ...prev,
            disponibilidad: backendFormat
        }));
    };

    // Función para seleccionar todas las horas de un día
    const selectAllDaySchedule = (dia) => {
        const normalized = normalizeDisponibilidad(formData.disponibilidad);
        // Remover cualquier horario existente para este día
        const filteredNormalized = normalized.filter(item => item.dia !== dia);
        
        // Calcular cuántas horas ya están ocupadas sin este día
        const horasOcupadas = filteredNormalized.length;
        
        // Calcular cuántas horas podemos agregar sin superar 44
        const horasDisponiblesParaAgregar = 44 - horasOcupadas;
        
        // Si no hay espacio para ninguna hora, mostrar alerta y salir
        if (horasDisponiblesParaAgregar <= 0) {
            showHourLimitAlert();
            return;
        }
        
        // Determinar cuántas horas agregar (máximo las disponibles en el día o las que quepan)
        const horasAgregar = Math.min(horasDisponibles.length, horasDisponiblesParaAgregar);
        
        // Agregar las horas que quepan para este día
        const newHorarios = horasDisponibles.slice(0, horasAgregar).map(hora => ({ dia, hora }));
        const allHorarios = [...filteredNormalized, ...newHorarios];
        
        // Convertir al formato del backend
        const backendFormat = allHorarios.map(item => ({
            dia: item.dia,
            hora: item.hora,
            horaInicio: item.hora,
            horaFin: getNextHour(item.hora)
        }));
        
        setFormData(prev => ({
            ...prev,
            disponibilidad: backendFormat
        }));
        
        // Si no se pudieron agregar todas las horas del día, mostrar alerta
        if (horasAgregar < horasDisponibles.length) {
            showHourLimitAlert();
        }
    };

    // Función para contar horas seleccionadas por día
    const getSelectedHoursCount = (dia) => {
        const normalized = normalizeDisponibilidad(formData.disponibilidad);
        return normalized.filter(d => d.dia === dia).length;
    };

    // Función para mostrar alerta de límite de horas
    const showHourLimitAlert = () => {
        setShowLimitAlert(true);
        setTimeout(() => {
            setShowLimitAlert(false);
        }, 4000);
    };

    // Mostrar alerta de validación
    const showValidationErrors = () => {
        setShowValidationAlert(true);
        setTimeout(() => {
            setShowValidationAlert(false);
        }, 5000);
    };

    // Obtener empleado seleccionado
    const getSelectedEmpleado = () => {
        if (!formData.empleadoId) return null;
        return empleados?.find(emp => emp._id === formData.empleadoId) || null;
    };

    // Manejar selección de empleado
    const handleEmpleadoSelection = (empleadoId) => {
        handleInputChange({
            target: {
                name: 'empleadoId',
                value: empleadoId
            }
        });
        setIsEmployeeDropdownOpen(false);

        // Limpiar error de empleado si existe
        if (localErrors.empleadoId) {
            setLocalErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.empleadoId;
                return newErrors;
            });
        }
    };

    // Función mejorada para manejar cambios en inputs y limpiar errores
    const handleInputChangeWithValidation = (e) => {
        const { name, value } = e.target;
        
        // Llamar al handleInputChange original
        handleInputChange(e);
        
        // Limpiar error específico si el campo ahora tiene valor
        if (localErrors[name] && value && value.trim() !== '') {
            setLocalErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // FUNCIÓN CORREGIDA para manejar el envío del formulario
    const handleFormSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('=== ENVÍO DEL FORMULARIO OPTOMETRISTA ===');
        console.log('isCreationFlow:', isCreationFlow);
        console.log('formData actual:', formData);
        
        // Validar formulario antes de enviar
        const validationErrors = validateForm();
        
        if (Object.keys(validationErrors).length > 0) {
            console.error('❌ Errores de validación:', validationErrors);
            setLocalErrors(validationErrors);
            showValidationErrors();
            return; // No enviar si hay errores de validación
        }
        
        // Limpiar errores locales si la validación es exitosa
        setLocalErrors({});
        
        // Preparar datos finales - NO incluir empleadoId en creationFlow
        const finalFormData = {
            especialidad: formData.especialidad?.trim(),
            licencia: formData.licencia?.trim(),
            experiencia: parseInt(formData.experiencia) || 0,
            disponibilidad: Array.isArray(formData.disponibilidad) 
                ? formData.disponibilidad.map(item => ({
                    dia: item.dia,
                    hora: item.hora,
                    horaInicio: item.horaInicio || item.hora,
                    horaFin: item.horaFin || getNextHour(item.hora)
                }))
                : [],
            sucursalesAsignadas: Array.isArray(formData.sucursalesAsignadas) 
                ? formData.sucursalesAsignadas 
                : [],
            disponible: formData.disponible !== false && formData.disponible !== 'false'
        };
        
        // Solo agregar empleadoId si NO estamos en flujo de creación
        if (!isCreationFlow && formData.empleadoId) {
            finalFormData.empleadoId = formData.empleadoId;
        }
        
        console.log('📦 Datos finales para envío:', finalFormData);
        
        // NAVEGACIÓN CORREGIDA: Usar el sistema de dashboard
        const handlePostSubmission = () => {
            console.log('✅ Optometrista guardado exitosamente');
            
            if (isCreationFlow && setActiveSection) {
                // Si estamos en flujo de creación, navegar a la sección de optometristas
                console.log('🧭 Navegando a sección optometristas');
                setActiveSection('optometristas');
                
                // También cerrar el modal
                onClose();
                
            } else if (onCreationComplete && typeof onCreationComplete === 'function') {
                // Fallback si onCreationComplete está disponible
                console.log('✅ Llamando onCreationComplete');
                onCreationComplete();
                
            } else {
                // Si no hay método de navegación específico, solo cerrar el modal
                console.log('🔄 Cerrando modal (navegación estándar)');
                onClose();
            }
        };
        
        try {
            // Llamar a onSubmit y manejar la respuesta
            const result = onSubmit(finalFormData);
            
            // Si onSubmit devuelve una promesa, esperarla
            if (result && typeof result.then === 'function') {
                result
                    .then(() => {
                        handlePostSubmission();
                    })
                    .catch((error) => {
                        console.error('❌ Error al enviar formulario:', error);
                    });
            } else {
                // Si no es una promesa, ejecutar inmediatamente
                handlePostSubmission();
            }
            
        } catch (error) {
            console.error('❌ Error al enviar formulario:', error);
        }
    };

    // Función para manejar el botón de regresar
    const handleBackButton = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🔙 Botón regresar presionado');
        if (onBackToEmployeeForm && typeof onBackToEmployeeForm === 'function') {
            onBackToEmployeeForm();
        } else {
            console.warn('⚠️ onBackToEmployeeForm no está definido o no es una función');
        }
    };

    // Componente de alerta para validaciones (usando Portal)
    const ValidationAlert = () => {
        if (!showValidationAlert || Object.keys(localErrors).length === 0) return null;
        
        const alertContent = (
            <div 
                className="fixed top-4 right-4 bg-white rounded-lg shadow-lg border border-red-200 p-4 max-w-sm transform transition-all duration-300 ease-out animate-slideInDown"
                style={{ zIndex: 9999 }}
            >
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-700 font-medium">
                            Campos incompletos
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Por favor complete todos los campos obligatorios
                        </p>
                        <div className="mt-2 space-y-1">
                            {Object.entries(localErrors).slice(0, 3).map(([field, message]) => (
                                <p key={field} className="text-xs text-red-600">
                                    • {message}
                                </p>
                            ))}
                            {Object.keys(localErrors).length > 3 && (
                                <p className="text-xs text-red-500">
                                    +{Object.keys(localErrors).length - 3} errores más...
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowValidationAlert(false)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
        
        return createPortal(alertContent, document.body);
    };

    // Componente de alerta minimalista para límite de horas (usando Portal)
    const HourLimitAlert = () => {
        if (!showLimitAlert) return null;
        
        const alertContent = (
            <div 
                className="fixed top-4 right-4 bg-white rounded-lg shadow-lg border border-amber-200 p-4 max-w-sm transform transition-all duration-300 ease-out animate-slideInDown"
                style={{ zIndex: 9999 }}
            >
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                            <Clock className="w-3 h-3 text-amber-600" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-700 font-medium">
                            Límite de horas alcanzado
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Máximo 44 horas semanales por optometrista
                        </p>
                    </div>
                    <button
                        onClick={() => setShowLimitAlert(false)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
        
        return createPortal(alertContent, document.body);
    };

    // Campo personalizado para selección de empleado con tarjetas
    const EmpleadoSelectorField = () => {
        const currentError = localErrors.empleadoId || errors.empleadoId;
        
        if (isCreationFlow) {
            // VISTA PARA EL FLUJO DE CREACIÓN
            // Muestra una tarjeta estática con los datos del empleado que se está creando
            if (!preloadedEmployeeData) return <p>Cargando datos del empleado...</p>;
            
            return (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Empleado *</label>
                    <div className="w-full p-4 border rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200 flex items-center space-x-3">
                        <img 
                            src={preloadedEmployeeData.fotoPerfil || `https://ui-avatars.com/api/?name=${preloadedEmployeeData.nombre}+${preloadedEmployeeData.apellido}`} 
                            alt={preloadedEmployeeData.nombre} 
                            className="w-12 h-12 rounded-full object-cover border-2 border-cyan-200" 
                        />
                        <div className="flex-1">
                            <div className="font-medium text-gray-900">{preloadedEmployeeData.nombre} {preloadedEmployeeData.apellido}</div>
                            <div className="text-sm text-gray-600">{preloadedEmployeeData.correo}</div>
                            <div className="text-xs text-cyan-600 font-medium">✓ Empleado nuevo - Se guardará automáticamente</div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Empleado *
                </label>
                
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                        disabled={!!selectedOptometrista}
                        className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-left ${
                            currentError ? 'border-red-500' : 'border-gray-300'
                        } ${selectedOptometrista ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-cyan-300'}`}
                    >
                        {getSelectedEmpleado() ? (
                            <div className="flex items-center space-x-3">
                                <img 
                                    src={getSelectedEmpleado().fotoPerfil || `https://ui-avatars.com/api/?name=${getSelectedEmpleado().nombre}+${getSelectedEmpleado().apellido}&background=0891b2&color=fff`} 
                                    alt={`${getSelectedEmpleado().nombre}`} 
                                    className="w-12 h-12 rounded-full object-cover border-2 border-cyan-200" 
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{getSelectedEmpleado().nombre} {getSelectedEmpleado().apellido}</div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <Mail className="w-4 h-4" />
                                            <span>{getSelectedEmpleado().correo}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Phone className="w-4 h-4" />
                                            <span>{getSelectedEmpleado().telefono}</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform ${isEmployeeDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <span className="text-gray-500">Seleccione un empleado...</span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform ${isEmployeeDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>
                        )}
                    </button>

                    {/* Dropdown con tarjetas de empleados */}
                    {isEmployeeDropdownOpen && !selectedOptometrista && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                            {empleadosOptions.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    No hay empleados optometristas disponibles
                                </div>
                            ) : (
                                <div className="p-2 space-y-1">
                                    {empleadosOptions.map((option) => {
                                        const emp = option.empleado;
                                        const isSelected = formData.empleadoId === option.value;
                                        
                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => handleEmpleadoSelection(option.value)}
                                                className={`w-full p-3 rounded-lg text-left transition-all hover:bg-cyan-50 ${
                                                    isSelected ? 'bg-cyan-100 border border-cyan-300' : 'hover:border-transparent'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <img 
                                                        src={emp.fotoPerfil || `https://ui-avatars.com/api/?name=${emp.nombre}+${emp.apellido}&background=0891b2&color=fff`} 
                                                        alt={`${emp.nombre}`} 
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-gray-900 truncate">
                                                            {emp.nombre} {emp.apellido}
                                                        </div>
                                                        <div className="text-sm text-gray-500 truncate">
                                                            {emp.correo}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {emp.telefono}
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <Check className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {currentError && (
                    <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{currentError}</span>
                    </p>
                )}

                {selectedOptometrista && (
                    <p className="text-xs text-gray-500 mt-1">
                        El empleado no se puede cambiar al editar un optometrista
                    </p>
                )}
            </div>
        );
    };

    // Campo personalizado para horarios de disponibilidad
    const HorariosDisponibilidadField = () => {
        const totalHoras = normalizeDisponibilidad(formData.disponibilidad).length;
        const isOverLimit = totalHoras > 44;
        const currentError = localErrors.disponibilidad || errors.disponibilidad;

        return (
            <div className="space-y-4">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Horarios de Disponibilidad:</h3>
                    <p className="text-sm text-gray-600">Selecciona las horas disponibles para cada día. Puedes elegir horas no consecutivas.</p>
                    
                    {/* Indicador de horas */}
                    <div className={`mt-3 inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
                        isOverLimit ? 'bg-red-500 text-white border-2 border-red-600' :
                        'bg-green-100 text-green-800 border-2 border-green-200'
                    }`}>
                        <Clock className="w-4 h-4" />
                        <span>{totalHoras} horas semanales</span>
                        {isOverLimit && <span className="text-white font-bold">!</span>}
                    </div>
                </div>
            
                <div className={`bg-white rounded-lg border overflow-hidden ${
                    currentError ? 'border-red-500' : 'border-gray-200'
                }`}>
                    {/* Header con días y controles */}
                    <div className="bg-cyan-50 border-b border-gray-200">
                        <div className="grid grid-cols-7 text-center">
                            {diasSemana.map((dia) => {
                                const selectedCount = getSelectedHoursCount(dia.key);
                                
                                return (
                                    <div key={dia.key} className="py-3 px-2 border-r border-gray-200 last:border-r-0">
                                        <div className="font-medium text-sm text-gray-700 mb-2">{dia.label}</div>
                                        <div className="flex flex-col space-y-1">
                                            <button
                                                type="button"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    selectAllDaySchedule(dia.key);
                                                }}
                                                className="text-xs px-2 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1"
                                                title="Seleccionar todo el día"
                                            >
                                                Todo
                                            </button>
                                            <button
                                                type="button"
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    clearDaySchedule(dia.key);
                                                }}
                                                className="text-xs px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                                                title="Limpiar día"
                                            >
                                                Limpiar
                                            </button>
                                            {selectedCount > 0 ? (
                                                <span className="text-xs text-cyan-600 font-medium">
                                                    {selectedCount}h
                                                </span>
                                            ) : (
                                                <span className="text-xs text-transparent">
                                                    0h
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Grid de horas */}
                    <div className="p-4">
                        {horasDisponibles.map((hora) => (
                            <div key={hora} className="grid grid-cols-7 mb-2 last:mb-0">
                                {diasSemana.map((dia) => {
                                    const isSelected = isHoraSelected(dia.key, hora);
                                    return (
                                        <div key={`${dia.key}-${hora}`} className="px-1">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleHoraToggle(dia.key, hora);
                                                }}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                }}
                                                className={`w-full py-2 px-2 text-sm font-medium rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                                    isSelected
                                                        ? 'bg-cyan-500 text-white shadow-md hover:bg-cyan-600 scale-105 focus:ring-cyan-500'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 focus:ring-gray-400'
                                                }`}
                                            >
                                                {hora}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    
                    {/* Leyenda y resumen */}
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6 text-sm">
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                                    <span className="text-gray-600">Disponible</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                                    <span className="text-gray-600">No disponible</span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                Total: {normalizeDisponibilidad(formData.disponibilidad).length} horas seleccionadas
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mostrar error si no hay disponibilidad */}
                {currentError && (
                    <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{currentError}</span>
                    </p>
                )}
            </div>
        );
    };

    // Campo personalizado para sucursales (multi-select)
    const SucursalesField = () => {
        const currentError = localErrors.sucursalesAsignadas || errors.sucursalesAsignadas;
        
        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Sucursales Asignadas *
                </label>
                <select
                    multiple
                    value={Array.isArray(formData.sucursalesAsignadas) ? formData.sucursalesAsignadas : []}
                    onChange={handleSucursalesChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm ${
                        currentError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    size="4"
                >
                    {sucursalesOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {currentError && (
                    <p className="text-red-500 text-sm flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{currentError}</span>
                    </p>
                )}
                <p className="text-xs text-gray-500">
                    Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples sucursales
                </p>
            </div>
        );
    };

    // Campos básicos de información
    const fields = [
        {
            name: 'especialidad',
            label: 'Especialidad',
            type: 'select',
            options: especialidadOptions.map(esp => ({ value: esp, label: esp })),
            placeholder: 'Seleccione la especialidad',
            required: true
        },
        {
            name: 'licencia',
            label: 'Número de Licencia',
            type: 'text',
            placeholder: 'Ingrese el número de licencia',
            required: true
        },
        {
            name: 'experiencia',
            label: 'Años de Experiencia',
            type: 'number',
            placeholder: 'Ingrese años de experiencia',
            min: 0,
            max: 50,
            required: true
        },
        {
            name: 'disponible',
            label: 'Estado de Disponibilidad',
            type: 'select',
            options: [
                { value: true, label: 'Disponible' },
                { value: false, label: 'No Disponible' }
            ],
            required: true
        }
    ];

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isEmployeeDropdownOpen && !event.target.closest('.relative')) {
                setIsEmployeeDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEmployeeDropdownOpen]);

    return (
        <>
            <ValidationAlert />
            <HourLimitAlert />
            <FormModal
                isOpen={isOpen}
                onClose={() => {
                    setIsEmployeeDropdownOpen(false);
                    setLocalErrors({});
                    onClose();
                }}
                onSubmit={handleFormSubmit}
                title={title}
                formData={formData}
                handleInputChange={handleInputChangeWithValidation}
                errors={{...errors, ...localErrors}}
                submitLabel={submitLabel}
                fields={[]} // Array vacío porque ahora renderizamos los campos directamente
                gridCols={2}
                // Botón personalizado de regresar para el flujo de creación
                customButtons={isCreationFlow && onBackToEmployeeForm ? (
                    <button
                        type="button"
                        onClick={handleBackButton}
                        className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Regresar</span>
                    </button>
                ) : null}
            >
                <div className="md:col-span-2 space-y-6">
                    {/* 1. INFORMACIÓN DEL OPTOMETRISTA */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-cyan-600 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Información del Optometrista
                        </h4>
                        <div className="space-y-4">
                            <EmpleadoSelectorField />
                            
                            {/* Campos de información básica en grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                {fields.map((field) => {
                                    const { name, label, type, options, required, ...fieldProps } = field;
                                    const displayLabel = required ? `${label} *` : label;
                                    const currentError = localErrors[name] || errors[name];

                                    if (type === 'select') {
                                        return (
                                            <div key={name}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {displayLabel}
                                                </label>
                                                <select
                                                    name={name}
                                                    value={formData[name] || ''}
                                                    onChange={handleInputChangeWithValidation}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm ${
                                                        currentError ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    {...fieldProps}
                                                >
                                                    <option value="">{fieldProps.placeholder || 'Seleccione una opción'}</option>
                                                    {options.map(option => (
                                                        <option key={typeof option === 'object' ? option.value : option} 
                                                                value={typeof option === 'object' ? option.value : option}>
                                                            {typeof option === 'object' ? option.label : option}
                                                        </option>
                                                    ))}
                                                </select>
                                                {currentError && (
                                                    <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                                                        <AlertCircle className="w-4 h-4" />
                                                        <span>{currentError}</span>
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={name}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {displayLabel}
                                            </label>
                                            <input
                                                name={name}
                                                type={type}
                                                value={formData[name] || ''}
                                                onChange={handleInputChangeWithValidation}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm ${
                                                    currentError ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                {...fieldProps}
                                            />
                                            {currentError && (
                                                <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>{currentError}</span>
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 2. HORARIOS DE DISPONIBILIDAD */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-cyan-600 mb-4 flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            Configuración de Horarios
                        </h4>
                        <HorariosDisponibilidadField />
                    </div>

                    {/* 3. SUCURSALES ASIGNADAS */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-cyan-600 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
                            Asignación de Sucursales
                        </h4>
                        <SucursalesField />
                    </div>
                </div>
            </FormModal>

            {/* Estilos CSS para animaciones */}
            <style jsx>{`
                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                .animate-slideInDown {
                    animation: slideInDown 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default OptometristasFormModal;