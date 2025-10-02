// src/components/management/aros/ArosFormModal.jsx
import React from 'react';
import LentesFormModal from '../../management/lentes/LentesFormModal.jsx';

// Nota: Reusamos el mismo formulario de Lentes para Aros por ahora.
// Si más adelante difieren campos, clonaremos la implementación y ajustaremos los labels/campos.

const ArosFormModal = (props) => {
  const newProps = {
    ...props,
    title: props.isEditing ? 'Editar Aro' : 'Agregar Aro',
  };
  return <LentesFormModal {...newProps} />;
};

export default ArosFormModal;
