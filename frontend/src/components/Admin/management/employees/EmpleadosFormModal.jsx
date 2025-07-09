import React from 'react';
import FormModal from '../../ui/FormModal'; // Assuming FormModal is in ../../ui/

const EmpleadosFormModal = ({ isOpen, onClose, onSubmit, title, formData, handleInputChange, errors, submitLabel }) => {
    const cargoOptions = [
        'Administrador', 'Gerente', 'Empleado', 'Vendedor', 'Optometrista', 'Técnico', 'Recepcionista'
    ];
    const sucursalOptions = [
        'Principal', 'Quezaltepeque'
    ];
    const estadoOptions = [
        'Activo', 'Inactivo'
    ];

    const fields = [
        { name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Ingrese el nombre', required: true },
        { name: 'apellido', label: 'Apellido', type: 'text', placeholder: 'Ingrese el apellido', required: true },
        { name: 'dui', label: 'DUI', type: 'text', placeholder: 'Ingrese el DUI (ej. 00000000-0)', required: true },
        { name: 'telefono', label: 'Teléfono', type: 'text', placeholder: 'Ingrese el teléfono (ej. +5037xxxx-xxxx)', required: true },
        { name: 'correo', label: 'Correo Electrónico', type: 'email', placeholder: 'Ingrese el correo electrónico', required: true },
        { name: 'cargo', label: 'Cargo', type: 'select', options: cargoOptions, placeholder: 'Seleccione el cargo', required: true },
        { name: 'sucursal', label: 'Sucursal', type: 'select', options: sucursalOptions, placeholder: 'Seleccione la sucursal', required: true },
        { name: 'fechaContratacion', label: 'Fecha de Contratación', type: 'date', required: false },
        { name: 'salario', label: 'Salario', type: 'number', placeholder: 'Ingrese el salario', required: true },
        { name: 'estado', label: 'Estado', type: 'select', options: estadoOptions, required: true },
        { name: 'fotoPerfil', label: 'URL Foto de Perfil', type: 'url', placeholder: 'Ingrese la URL de la foto de perfil', required: false },
        { name: 'direccion.departamento', label: 'Departamento', type: 'text', placeholder: 'Departamento de residencia', nested: true, required: false },
        { name: 'direccion.municipio', label: 'Municipio', type: 'text', placeholder: 'Municipio de residencia', nested: true, required: false },
        { name: 'direccion.direccion', label: 'Dirección Completa', type: 'textarea', placeholder: 'Dirección detallada (Calle, #Casa, etc.)', nested: true, required: false },
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

export default EmpleadosFormModal;