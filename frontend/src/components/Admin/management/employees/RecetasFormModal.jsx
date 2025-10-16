import React, { useState } from 'react';
import FormModal from '../../ui/FormModal';
import { FileText, Eye, User, Stethoscope, AlertCircle, Calendar, Clock } from 'lucide-react';

// Componente para campos de entrada mejorados
const EnhancedField = ({ 
  field, 
  value, 
  onChange, 
  error, 
  formData,
  historialesMedicos = [],
  optometristas = []
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getFieldValue = () => {
    if (field.nested && field.name.includes('.')) {
      const [parent, child] = field.name.split('.');
      return formData[parent]?.[child] || '';
    }
    return value || '';
  };

  const inputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base ${
    error ? 'border-red-500 bg-red-50' : 
    isFocused ? 'border-blue-500' : 'border-gray-300 bg-white'
  }`;

  if (field.type === 'select') {
    let options = [];
    
    if (field.name === 'historialMedicoId') {
      options = historialesMedicos.map(historial => {
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
    } else if (field.name === 'optometristaId') {
      options = optometristas.map(optometrista => ({
        value: optometrista._id,
        label: optometrista.empleadoId
          ? `Dr(a). ${optometrista.empleadoId.nombre} ${optometrista.empleadoId.apellido}`
          : `Dr(a). ${optometrista._id?.slice(-6).toUpperCase()}`
      }));
    } else if (field.options) {
      options = field.options.map(opt => 
        typeof opt === 'object' ? opt : { value: opt, label: opt }
      );
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <select
          name={field.name}
          value={getFieldValue()}
          onChange={onChange}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <option value="">{field.placeholder || `Seleccione ${field.label.toLowerCase()}`}</option>
          {options.map((option, index) => (
            <option key={`${field.name}-${index}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          name={field.name}
          value={getFieldValue()}
          onChange={onChange}
          placeholder={field.placeholder}
          className={`${inputClasses} resize-none`}
          rows={3}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {error && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={field.type}
        name={field.name}
        value={getFieldValue()}
        onChange={onChange}
        placeholder={field.placeholder}
        className={inputClasses}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        step={field.step}
        min={field.min}
        max={field.max}
      />
      {error && (
        <p className="text-red-500 text-sm flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </p>
      )}
      {field.name.includes('vigencia') && (
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>Vigencia recomendada: 12-24 meses</span>
        </p>
      )}
    </div>
  );
};

const RecetasFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  formData, 
  handleInputChange, 
  errors, 
  submitLabel,
  historialesMedicos = [],
  optometristas = [],
  selectedReceta = null
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);

  const isEditing = !!selectedReceta;

  const sections = [
    {
      title: "Información del Paciente",
      fields: [
        {
          name: 'historialMedicoId',
          label: 'Cliente (del Historial)',
          type: 'select',
          required: true,
          placeholder: 'Seleccione un cliente',
          className: 'md:col-span-2'
        },
        {
          name: 'optometristaId',
          label: 'Optometrista a cargo',
          type: 'select',
          required: true,
          placeholder: 'Seleccione un optometrista',
          className: 'md:col-span-2'
        },
        {
          name: 'diagnostico',
          label: 'Diagnóstico Principal',
          type: 'text',
          placeholder: 'Ej. Miopía y Astigmatismo',
          required: true,
          className: 'md:col-span-4'
        },
      ]
    },
    {
      title: "Graduación Ojo Derecho (OD)",
      fields: [
        { name: 'ojoDerecho.esfera', label: 'Esfera', type: 'number', placeholder: '-1.25', step: "0.01", nested: true },
        { name: 'ojoDerecho.cilindro', label: 'Cilindro', type: 'number', placeholder: '-0.75', step: "0.01", nested: true },
        { name: 'ojoDerecho.eje', label: 'Eje', type: 'number', placeholder: '180', step: "1", min: "0", max: "180", nested: true },
        { name: 'ojoDerecho.adicion', label: 'Adición', type: 'number', placeholder: '+2.00', step: "0.01", nested: true },
      ]
    },
    {
      title: "Graduación Ojo Izquierdo (OI)",
      fields: [
        { name: 'ojoIzquierdo.esfera', label: 'Esfera', type: 'number', placeholder: '-1.50', step: "0.01", nested: true },
        { name: 'ojoIzquierdo.cilindro', label: 'Cilindro', type: 'number', placeholder: '-0.50', step: "0.01", nested: true },
        { name: 'ojoIzquierdo.eje', label: 'Eje', type: 'number', placeholder: '175', step: "1", min: "0", max: "180", nested: true },
        { name: 'ojoIzquierdo.adicion', label: 'Adición', type: 'number', placeholder: '+2.00', step: "0.01", nested: true },
      ]
    },
    {
      title: "Detalles Adicionales",
      fields: [
        {
          name: 'observaciones',
          label: 'Observaciones Adicionales',
          type: 'textarea',
          placeholder: 'Ej. Tratamiento antireflejante recomendado...',
          className: 'md:col-span-3'
        },
        {
          name: 'vigencia',
          label: 'Vigencia (meses)',
          type: 'number',
          placeholder: '12',
          required: true,
          step: "1",
          min: "1",
          max: "36",
          className: 'md:col-span-1'
        },
      ]
    }
  ];

  const handleFormSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setIsLoading(true);
    setIsError(false);
    setHasValidationErrors(false);

    try {
      await onSubmit(e);
    } catch (error) {
      setIsError(true);
      console.error('Error al guardar receta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const customContent = (
    <div className="space-y-8">
      {sections.map((section, sectionIndex) => (
        <div key={`section-${sectionIndex}`} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
            {section.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {section.fields.map((field, fieldIndex) => (
              <div key={`field-${sectionIndex}-${fieldIndex}`} className={field.className || ''}>
                <EnhancedField
                  field={field}
                  value={field.nested ? formData[field.name.split('.')[0]]?.[field.name.split('.')[1]] : formData[field.name]}
                  onChange={handleInputChange}
                  error={errors[field.name]}
                  formData={formData}
                  historialesMedicos={historialesMedicos}
                  optometristas={optometristas}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {(formData?.ojoDerecho?.esfera || formData?.ojoIzquierdo?.esfera) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Información sobre graduación:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Valores negativos (-) indican miopía</li>
                <li>Valores positivos (+) indican hipermetropía</li>
                <li>El eje se mide de 0° a 180°</li>
                <li>La adición se usa para lentes progresivos</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleFormSubmit}
      title={title}
      formData={formData}
      handleInputChange={handleInputChange}
      errors={errors}
      submitLabel={submitLabel}
      submitIcon={<FileText className="w-4 h-4" />}
      fields={[]}
      gridCols={1}
      size="xl"
      isLoading={isLoading}
      isError={isError}
      hasValidationErrors={hasValidationErrors}
    >
      {customContent}
    </FormModal>
  );
};

export default RecetasFormModal;