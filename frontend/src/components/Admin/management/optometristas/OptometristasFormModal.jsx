// src/components/management/optometristas/OptometristasFormModal.jsx
import React from 'react';
import FormModal from '../../ui/FormModal';

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

    // Opciones para disponibilidad (días de la semana)
    const diasSemanaOptions = [
        { value: 'lunes', label: 'Lunes' },
        { value: 'martes', label: 'Martes' },
        { value: 'miércoles', label: 'Miércoles' },
        { value: 'jueves', label: 'Jueves' },
        { value: 'viernes', label: 'Viernes' },
        { value: 'sábado', label: 'Sábado' },
        { value: 'domingo', label: 'Domingo' }
    ];

    // Función para manejar cambios en campos de disponibilidad
    const handleDisponibilidadChange = (dayIndex, field, value) => {
        const newDisponibilidad = [...(formData.disponibilidad || [])];
        
        if (!newDisponibilidad[dayIndex]) {
            newDisponibilidad[dayIndex] = {};
        }
        
        newDisponibilidad[dayIndex][field] = value;
        
        setFormData(prev => ({
            ...prev,
            disponibilidad: newDisponibilidad
        }));
    };

    // Función para agregar un día de disponibilidad
    const addDisponibilidadDay = () => {
        const newDisponibilidad = [...(formData.disponibilidad || [])];
        newDisponibilidad.push({
            dia: '',
            horaInicio: '',
            horaFin: ''
        });
        
        setFormData(prev => ({
            ...prev,
            disponibilidad: newDisponibilidad
        }));
    };

    // Función para remover un día de disponibilidad
    const removeDisponibilidadDay = (index) => {
        const newDisponibilidad = [...(formData.disponibilidad || [])];
        newDisponibilidad.splice(index, 1);
        
        setFormData(prev => ({
            ...prev,
            disponibilidad: newDisponibilidad
        }));
    };

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
            name: 'sucursalesAsignadas',
            label: 'Sucursales Asignadas',
            type: 'multi-select',
            options: sucursalesOptions,
            placeholder: 'Seleccione sucursales asignadas',
            required: true
        },
        {
            name: 'disponible',
            label: 'Estado de Disponibilidad',
            type: 'boolean',
            required: true
        }
    ];

    // Campo personalizado para disponibilidad
    const DisponibilidadField = () => (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
                Horarios de Disponibilidad
            </label>
            
            {(formData.disponibilidad || []).map((horario, index) => (
                <div key={index} className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg">
                    <select
                        value={horario.dia || ''}
                        onChange={(e) => handleDisponibilidadChange(index, 'dia', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Seleccione día</option>
                        {diasSemanaOptions.map(dia => (
                            <option key={dia.value} value={dia.value}>
                                {dia.label}
                            </option>
                        ))}
                    </select>
                    
                    <input
                        type="time"
                        value={horario.horaInicio || ''}
                        onChange={(e) => handleDisponibilidadChange(index, 'horaInicio', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Hora inicio"
                    />
                    
                    <input
                        type="time"
                        value={horario.horaFin || ''}
                        onChange={(e) => handleDisponibilidadChange(index, 'horaFin', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Hora fin"
                    />
                    
                    <button
                        type="button"
                        onClick={() => removeDisponibilidadDay(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                        ✕
                    </button>
                </div>
            ))}
            
            <button
                type="button"
                onClick={addDisponibilidadDay}
                className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
                + Agregar Horario
            </button>
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
            customFields={{
                disponibilidad: <DisponibilidadField />
            }}
        />
    );
};

export default OptometristasFormModal;