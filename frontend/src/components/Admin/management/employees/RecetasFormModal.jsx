import React from 'react';
import FormModal from '../../ui/FormModal';

const RecetasFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    formData,
    handleInputChange,
    errors,
    submitLabel,
    historialesMedicos,
    optometristas,
}) => {

    const historialOptions = (historialesMedicos || []).map(historial => {
        let label = '';
        if (historial.clienteId) {
            const nombre = historial.clienteId.nombre || '';
            const apellido = historial.clienteId.apellido || '';
            const fecha = historial.historialVisual?.fecha ? new Date(historial.historialVisual.fecha).toLocaleDateString() : '';
            const diagnostico = historial.historialVisual?.diagnostico || '';
            label = `${nombre} ${apellido}`;
            if (fecha || diagnostico) {
                label += ` - ${fecha}`;
                if (diagnostico) label += ` - ${diagnostico}`;
            }
        } else {
            label = `Historial ${historial._id}`;
        }
        return {
            value: historial._id,
            label
        };
    });

    const optometristaOptions = (optometristas || []).map(optometrista => ({
        value: optometrista._id,
        // Se asume que el objeto optometrista tiene el empleadoId populado.
        label: optometrista.empleadoId
            ? `${optometrista.empleadoId.nombre} ${optometrista.empleadoId.apellido}`
            : `Optometrista ${optometrista._id}`
    }));


    const fields = [
        // --- Sección de Identificación ---
        {
            name: 'historialMedicoId',
            label: 'Cliente (del Historial)',
            type: 'select',
            options: historialOptions,
            placeholder: 'Seleccione un cliente',
            required: true,
            colSpan: 2
        },
        {
            name: 'optometristaId',
            label: 'Optometrista a cargo',
            type: 'select',
            options: optometristaOptions,
            placeholder: 'Seleccione un optometrista',
            required: true,
            colSpan: 2
        },
        {
            name: 'diagnostico',
            label: 'Diagnóstico Principal',
            type: 'text',
            placeholder: 'Ej. Miopía y Astigmatismo',
            required: true,
            colSpan: 4
        },

        // --- Sección de Graduación Ojo Derecho (OD) ---
        { name: 'ojoDerecho.esfera', label: 'OD Esfera', type: 'number', placeholder: '-1.25', step: "0.01", nested: true },
        { name: 'ojoDerecho.cilindro', label: 'OD Cilindro', type: 'number', placeholder: '-0.75', step: "0.01", nested: true },
        { name: 'ojoDerecho.eje', label: 'OD Eje', type: 'number', placeholder: '180', step: "1", nested: true },
        { name: 'ojoDerecho.adicion', label: 'OD Adición', type: 'number', placeholder: '+2.00', step: "0.01", nested: true },

        // --- Sección de Graduación Ojo Izquierdo (OI) ---
        { name: 'ojoIzquierdo.esfera', label: 'OI Esfera', type: 'number', placeholder: '-1.50', step: "0.01", nested: true },
        { name: 'ojoIzquierdo.cilindro', label: 'OI Cilindro', type: 'number', placeholder: '-0.50', step: "0.01", nested: true },
        { name: 'ojoIzquierdo.eje', label: 'OI Eje', type: 'number', placeholder: '175', step: "1", nested: true },
        { name: 'ojoIzquierdo.adicion', label: 'OI Adición', type: 'number', placeholder: '+2.00', step: "0.01", nested: true },

        // --- Sección Final ---
        {
            name: 'observaciones',
            label: 'Observaciones Adicionales',
            type: 'textarea',
            placeholder: 'Ej. Tratamiento antireflejante recomendado...',
            colSpan: 3
        },
        {
            name: 'vigencia',
            label: 'Vigencia (meses)',
            type: 'number',
            placeholder: '12',
            required: true,
            colSpan: 1,
            step: "1"
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
            gridCols={4}
        />
    );
};

export default RecetasFormModal;