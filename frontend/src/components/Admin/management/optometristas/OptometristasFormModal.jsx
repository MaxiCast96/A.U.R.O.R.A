// src/components/management/optometristas/OptometristasFormModal.jsx
import React from 'react';
import FormModal from '../../ui/FormModal'; // Assuming FormModal is in ../../ui/

const OptometristasFormModal = ({ isOpen, onClose, onSubmit, title, formData, handleInputChange, errors, submitLabel }) => {
    const especialidadOptions = [
        'General', 'Pediátrica', 'Contactología', 'Baja Visión', 'Ortóptica'
    ];
    const sucursalOptions = [ 
        'Principal', 'Quezaltepeque'
    ];
    const disponibilidadDiasOptions = [
        'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'
    ];

    const fields = [
        { name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Ingrese el nombre del optometrista', required: true },
        { name: 'email', label: 'Correo Electrónico', type: 'email', placeholder: 'Ingrese el correo electrónico', required: true },
        { name: 'telefono', label: 'Teléfono', type: 'text', placeholder: 'Ingrese el teléfono (ej. 7xxxx-xxxx)', required: true },
        { name: 'especialidad', label: 'Especialidad', type: 'select', options: especialidadOptions, placeholder: 'Seleccione la especialidad', required: true },
        { name: 'licencia', label: 'Número de Licencia', type: 'text', placeholder: 'Ingrese el número de licencia', required: true },
        { name: 'experiencia', label: 'Años de Experiencia', type: 'number', placeholder: 'Ingrese años de experiencia', min: 0, required: true },
        { name: 'fotoPerfil', label: 'URL Foto de Perfil', type: 'url', placeholder: 'Ingrese la URL de la foto de perfil', required: false },
        {
            name: 'disponibilidad',
            label: 'Disponibilidad (Días)',
            type: 'multi-select', 
            options: disponibilidadDiasOptions,
            placeholder: 'Seleccione días de disponibilidad',
            required: false 
        },
        {
            name: 'sucursalesAsignadas',
            label: 'Sucursales Asignadas',
            type: 'multi-select', 
            options: sucursalOptions,
            placeholder: 'Seleccione sucursales asignadas',
            required: false 
        },
        { name: 'disponible', label: 'Disponible', type: 'boolean', required: true }, 
        { name: 'pacientesAtendidos', label: 'Pacientes Atendidos', type: 'number', placeholder: 'Ingrese el número de pacientes atendidos', min: 0, required: false },
    ];

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
        />
    );
};

export default OptometristasFormModal;