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

    // Función para manejar cambios en disponibilidad
    const handleDisponibilidadChange = (dia, field, value) => {
        const currentDisponibilidad = Array.isArray(formData.disponibilidad) ? [...formData.disponibilidad] : [];
        
        // Buscar si ya existe un horario para este día
        const existingIndex = currentDisponibilidad.findIndex(item => item.dia === dia);
        
        if (existingIndex >= 0) {
            // Actualizar el horario existente
            currentDisponibilidad[existingIndex][field] = value;
        } else {
            // Crear nuevo horario para el día
            currentDisponibilidad.push({
                dia,
                [field]: value,
                ...(field === 'horaInicio' ? { horaFin: '' } : { horaInicio: '' })
            });
        }
        
        setFormData(prev => ({
            ...prev,
            disponibilidad: currentDisponibilidad
        }));
    };

    // Función para remover disponibilidad de un día
    const removeDisponibilidadDay = (dia) => {
        const currentDisponibilidad = Array.isArray(formData.disponibilidad) ? [...formData.disponibilidad] : [];
        const filtered = currentDisponibilidad.filter(item => item.dia !== dia);
        
        setFormData(prev => ({
            ...prev,
            disponibilidad: filtered
        }));
    };

    // Obtener horario para un día específico
    const getHorarioForDay = (dia) => {
        if (!Array.isArray(formData.disponibilidad)) return null;
        return formData.disponibilidad.find(item => item.dia === dia) || null;
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
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    Horarios de Disponibilidad
                </label>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Selecciona días y horarios laborales</span>
                </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
                        <div>Día</div>
                        <div>Hora Inicio</div>
                        <div>Hora Fin</div>
                        <div>Acciones</div>
                    </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                    {diasSemana.map((dia) => {
                        const horario = getHorarioForDay(dia.key);
                        const hasHorario = horario !== null;
                        
                        return (
                            <div key={dia.key} className={`px-4 py-3 ${hasHorario ? 'bg-cyan-50' : 'bg-white'}`}>
                                <div className="grid grid-cols-4 gap-4 items-center">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-3 h-3 rounded-full ${hasHorario ? 'bg-cyan-500' : 'bg-gray-300'}`}></div>
                                        <span className={`text-sm ${hasHorario ? 'font-medium text-cyan-900' : 'text-gray-600'}`}>
                                            {dia.label}
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <input
                                            type="time"
                                            value={horario?.horaInicio || ''}
                                            onChange={(e) => handleDisponibilidadChange(dia.key, 'horaInicio', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <input
                                            type="time"
                                            value={horario?.horaFin || ''}
                                            onChange={(e) => handleDisponibilidadChange(dia.key, 'horaFin', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        {hasHorario ? (
                                            <button
                                                type="button"
                                                onClick={() => removeDisponibilidadDay(dia.key)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Eliminar horario"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleDisponibilidadChange(dia.key, 'horaInicio', '08:00')}
                                                className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors"
                                                title="Agregar horario"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="text-xs text-gray-500 flex items-center space-x-1">
                <span>💡 Tip: Haz clic en el botón + para agregar horarios o configura las horas directamente</span>
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