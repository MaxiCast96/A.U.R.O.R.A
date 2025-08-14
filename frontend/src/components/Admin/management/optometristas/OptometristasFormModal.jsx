// src/components/management/optometristas/OptometristasFormModal.jsx
import React, { useState } from 'react';
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

    // Función para verificar si una hora está seleccionada para un día
    const isHoraSelected = (dia, hora) => {
        if (!Array.isArray(formData.disponibilidad)) return false;
        return formData.disponibilidad.some(d => 
            d.dia === dia && d.horaInicio <= hora && d.horaFin > hora
        );
    };

    // Función para manejar selección de horas
    const handleHoraToggle = (dia, hora) => {
        const currentDisponibilidad = Array.isArray(formData.disponibilidad) ? [...formData.disponibilidad] : [];
        
        // Buscar si ya existe disponibilidad para este día
        const existingIndex = currentDisponibilidad.findIndex(item => item.dia === dia);
        
        if (existingIndex >= 0) {
            // Si la hora ya está seleccionada, la removemos del rango
            const existing = currentDisponibilidad[existingIndex];
            const horaIndex = horasDisponibles.indexOf(hora);
            const inicioIndex = horasDisponibles.indexOf(existing.horaInicio);
            const finIndex = horasDisponibles.indexOf(existing.horaFin) - 1;
            
            if (horaIndex >= inicioIndex && horaIndex <= finIndex) {
                // Remover esta hora del rango
                if (inicioIndex === finIndex && inicioIndex === horaIndex) {
                    // Solo había una hora seleccionada, remover todo el día
                    currentDisponibilidad.splice(existingIndex, 1);
                } else if (horaIndex === inicioIndex) {
                    // Remover desde el inicio
                    existing.horaInicio = horasDisponibles[horaIndex + 1];
                } else if (horaIndex === finIndex) {
                    // Remover desde el final
                    existing.horaFin = horasDisponibles[horaIndex];
                } else {
                    // Dividir el rango (solo mantenemos la primera parte por simplicidad)
                    existing.horaFin = horasDisponibles[horaIndex];
                }
            } else {
                // Extender el rango para incluir esta hora
                const newInicio = Math.min(inicioIndex, horaIndex);
                const newFin = Math.max(finIndex + 1, horaIndex + 1);
                existing.horaInicio = horasDisponibles[newInicio];
                existing.horaFin = horasDisponibles[newFin];
            }
        } else {
            // Crear nueva disponibilidad para este día
            currentDisponibilidad.push({
                dia,
                horaInicio: hora,
                horaFin: horasDisponibles[horasDisponibles.indexOf(hora) + 1]
            });
        }
        
        setFormData(prev => ({
            ...prev,
            disponibilidad: currentDisponibilidad
        }));
    };

    // Manejar cambios en multi-select de sucursales
    const handleSucursalesChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({
            ...prev,
            sucursalesAsignadas: selectedOptions
        }));
    };

    // Campo personalizado para horarios de disponibilidad
    const HorariosDisponibilidadField = () => (
        <div className="space-y-4">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Disponibilidad:</h3>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header con días */}
                <div className="bg-cyan-50 border-b border-gray-200">
                    <div className="grid grid-cols-7 text-center">
                        {diasSemana.map((dia) => (
                            <div key={dia.key} className="py-3 px-2 font-medium text-sm text-gray-700 border-r border-gray-200 last:border-r-0">
                                {dia.label}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Grid de horas */}
                <div className="p-4">
                    {horasDisponibles.map((hora) => (
                        <div key={hora} className="grid grid-cols-7 mb-2">
                            {diasSemana.map((dia) => (
                                <div key={`${dia.key}-${hora}`} className="px-1">
                                    <button
                                        type="button"
                                        onClick={() => handleHoraToggle(dia.key, hora)}
                                        className={`w-full py-2 px-2 text-sm font-medium rounded transition-all duration-200 ${
                                            isHoraSelected(dia.key, hora)
                                                ? 'bg-cyan-500 text-white shadow-md hover:bg-cyan-600'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {hora}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                
                {/* Leyenda */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                            <span className="text-gray-600">Disponible</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                            <span className="text-gray-600">No disponible</span>
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