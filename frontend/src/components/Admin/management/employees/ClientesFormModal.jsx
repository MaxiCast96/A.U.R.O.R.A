import React from 'react';
import FormModal from '../../ui/FormModal';

const ClientesFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  formData, 
  handleInputChange, 
  errors, 
  submitLabel,
  isEditing // --- PROPIEDAD AÑADIDA ---
}) => {
  const departamentoOptions = [
    'San Salvador', 'La Libertad', 'Santa Ana', 'San Miguel', 'La Paz', 'Sonsonate', 
    'Usulután', 'Ahuachapán', 'Chalatenango', 'Cuscatlán', 'La Unión', 'Morazán', 
    'Cabañas', 'San Vicente'
  ];

  const estadoOptions = ['Activo', 'Inactivo'];

  const fields = [
    { name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Ingrese el nombre', required: true },
    { name: 'apellido', label: 'Apellido', type: 'text', placeholder: 'Ingrese el apellido', required: true },
    { name: 'edad', label: 'Edad', type: 'number', placeholder: 'Ingrese la edad', min: 18, max: 100, required: true },
    { name: 'dui', label: 'DUI', type: 'text', placeholder: '12345678-9', required: true },
    { name: 'telefono', label: 'Teléfono', type: 'text', placeholder: '+50377123456', required: true },
    { name: 'correo', label: 'Email', type: 'email', placeholder: 'ejemplo@mail.com', required: true },
    { name: 'calle', label: 'Dirección (Calle)', type: 'text', placeholder: 'Calle, Avenida, etc.', required: true },
    { name: 'ciudad', label: 'Ciudad', type: 'text', placeholder: 'San Salvador', required: true },
    { name: 'departamento', label: 'Departamento', type: 'select', options: departamentoOptions, placeholder: 'Seleccione departamento', required: true },
    { name: 'estado', label: 'Estado', type: 'select', options: estadoOptions, required: true },
    // --- CAMPO DE CONTRASEÑA AÑADIDO ---
    { 
      name: 'password', 
      label: isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña', 
      type: 'password', 
      placeholder: 'Dejar en blanco para no cambiar', 
      required: !isEditing // Requerido solo al crear
    },
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

export default ClientesFormModal;