// src/components/management/optometristas/OptometristasFormModal.jsx
import React, { useState, useEffect } from 'react';
import FormModal from '../../ui/FormModal';
import { Plus, Trash2, Clock } from 'lucide-react';

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
    selectedOptometrista
}) => {
    const especialidadOptions = [
        'General', 
        'Pediátrica', 
        'Contactología', 
        'Baja Visión', 
        'Ortóptica'
    ];

    // Convertir empleados a opciones para el select
    const empleadosOptions = empleados?.map(emp => ({
        value: emp._id,
        label: `${emp.nombre} ${emp.apellido} - ${emp.correo}`
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
                const endHour = item.horaFin.includes(':59') ? 
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
    const handleHoraToggle = (dia, hora, event) => {
        // Prevenir comportamiento por defecto y propagación
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

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
    };

    // Función helper para obtener la siguiente hora
    const getNextHour = (hora) => {
        const currentIndex = horasDisponibles.indexOf(hora);
        if (currentIndex >= 0 && currentIndex < horasDisponibles.length - 1) {
            return horasDisponibles[currentIndex + 1];
        }
        // Para la última hora, agregar :59 para indicar el final de la hora
        const [hourPart] = hora.split(':');
        return `${hourPart}:59`;
    };

    // Manejar cambios en multi-select de sucursales
    const handleSucursalesChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({
            ...prev,
            sucursalesAsignadas: selectedOptions
        }));
    };

    // Función para limpiar todos los horarios de un día
    const clearDaySchedule = (dia, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

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
    const selectAllDaySchedule = (dia, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const normalized = normalizeDisponibilidad(formData.disponibilidad);
        // Remover cualquier horario existente para este día
        const filteredNormalized = normalized.filter(item => item.dia !== dia);
        
        // Agregar todas las horas para este día
        const newHorarios = horasDisponibles.map(hora => ({ dia, hora }));
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
    };

    // Función para contar horas seleccionadas por día
    const getSelectedHoursCount = (dia) => {
        const normalized = normalizeDisponibilidad(formData.disponibilidad);
        return normalized.filter(d => d.dia === dia).length;
    };

    // Campo personalizado para horarios de disponibilidad
    const HorariosDisponibilidadField = () => (
        <div className="space-y-4">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Disponibilidad:</h3>
                <p className="text-sm text-gray-600">Selecciona las horas disponibles para cada día. Puedes elegir horas no consecutivas.</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                                            onClick={(e) => selectAllDaySchedule(dia.key, e)}
                                            className="text-xs px-2 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
                                            title="Seleccionar todo el día"
                                        >
                                            Todo
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => clearDaySchedule(dia.key, e)}
                                            className="text-xs px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                                            title="Limpiar día"
                                        >
                                            Limpiar
                                        </button>
                                        {selectedCount > 0 && (
                                            <span className="text-xs text-cyan-600 font-medium">
                                                {selectedCount}h
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
                                            onClick={(e) => handleHoraToggle(dia.key, hora, e)}
                                            className={`w-full py-2 px-2 text-sm font-medium rounded transition-all duration-200 ${
                                                isSelected
                                                    ? 'bg-cyan-500 text-white shadow-md hover:bg-cyan-600 scale-105'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
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
        </div>
    );

    const fields = [
        {
            name: 'empleadoId',
            label: 'Empleado',
            type: 'select',
            options: empleadosOptions,
            placeholder: 'Seleccione un empleado',
            required: true,
            disabled: !!selectedOptometrista // Deshabilitar en modo edición
        },
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

    // Campo personalizado para sucursales (multi-select)
    const SucursalesField = () => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                Sucursales Asignadas *
            </label>
            <select
                multiple
                value={Array.isArray(formData.sucursalesAsignadas) ? formData.sucursalesAsignadas : []}
                onChange={handleSucursalesChange}
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm ${
                    errors.sucursalesAsignadas ? 'border-red-500' : 'border-gray-300'
                }`}
                size="4"
            >
                {sucursalesOptions.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {errors.sucursalesAsignadas && (
                <p className="text-red-500 text-sm">{errors.sucursalesAsignadas}</p>
            )}
            <p className="text-xs text-gray-500">
                Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples sucursales
            </p>
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
            fields={fields}
            gridCols={2}
        >
            <div className="md:col-span-2 space-y-6">
                <SucursalesField />
                <HorariosDisponibilidadField />
            </div>
        </FormModal>
    );
};

export default OptometristasFormModal;