import React from 'react';
import FormModal from '../../ui/FormModal';

const RecetasFormModal = ({ isOpen, onClose, onSubmit, receta }) => {
    const initialFormData = {
        historialMedicoId: receta?.historialMedicoId || '',
        optometristaId: receta?.optometristaId || '',
        diagnostico: receta?.diagnostico || '', // Asegúrate de que diagnostico siempre esté definido
        ojoDerecho: receta?.ojoDerecho || { esfera: '', cilindro: '', eje: '', adicion: '' },
        ojoIzquierdo: receta?.ojoIzquierdo || { esfera: '', cilindro: '', eje: '', adicion: '' },
        observaciones: receta?.observaciones || '',
        vigencia: receta?.vigencia || 12,
    };

    const [formData, setFormData] = React.useState(initialFormData);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const fields = [
        { name: 'diagnostico', label: 'Diagnóstico', type: 'text', required: true },
        { name: 'vigencia', label: 'Vigencia (meses)', type: 'number', required: true },
        { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
    ];

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            title={receta ? 'Editar Receta' : 'Nueva Receta'}
            formData={formData}
            handleInputChange={handleInputChange}
            fields={fields}
        />
    );
};

export default RecetasFormModal;