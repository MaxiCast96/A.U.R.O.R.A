import React, { useState, useEffect } from 'react';
import FormModal from '../../ui/FormModal';
import { Calendar, Clock, User, Stethoscope, AlertCircle, MapPin } from 'lucide-react';

// Componente para campos de entrada mejorados
const EnhancedField = ({ 
  field, 
  value, 
  onChange, 
  error, 
  formData,
  clientes = [],
  optometristas = [],
  sucursales = []
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getFieldValue = () => value || '';

  const inputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base ${
    error ? 'border-red-500 bg-red-50' : 
    isFocused ? 'border-blue-500' : 'border-gray-300 bg-white'
  }`;

  if (field.type === 'select') {
    let options = [];
    
    if (field.name === 'clienteId') {
      options = clientes.map(cliente => ({
        value: cliente._id,
        label: `${cliente.nombre || ''} ${cliente.apellido || ''}`
      }));
    } else if (field.name === 'optometristaId') {
      options = optometristas.map(opt => {
        const emp = opt.empleadoId;
        let nombre = 'Optometrista';
        if (emp && (emp.nombre || emp.apellido)) {
          nombre = `Dr(a). ${emp.nombre || ''} ${emp.apellido || ''}`.trim();
        } else if (opt._id) {
          const shortId = opt._id.slice(-6).toUpperCase();
          nombre = `Dr(a). ${shortId}`;
        }
        return {
          value: opt._id,
          label: nombre
        };
      });
    } else if (field.name === 'sucursalId') {
      options = sucursales.map(suc => ({
        value: suc._id,
        label: suc.nombre
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
        min={field.type === 'datetime-local' ? new Date().toISOString().slice(0, 16) : field.min}
        max={field.max}
      />
      {error && (
        <p className="text-red-500 text-sm flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </p>
      )}
      {field.type === 'datetime-local' && (
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Seleccione fecha y hora de la cita</span>
        </p>
      )}
      {field.type === 'number' && field.name === 'duracionEstimada' && (
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>Duración recomendada: 30-60 minutos</span>
        </p>
      )}
    </div>
  );
};

const CitasFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  formData, 
  handleInputChange, 
  errors, 
  submitLabel,
  clientes = [],
  optometristas = [],
  sucursales = [],
  selectedCita = null
}) => {
  const isEditing = !!selectedCita;
  // NUEVOS ESTADOS PARA LOADING Y ERROR
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);

  // CORRECCIÓN: Manejar el evento correctamente
  const handleFormSubmit = async (e) => {
    // Prevenir el comportamiento por defecto del formulario
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Validar campos requeridos
    const requiredFields = ['clienteId', 'sucursalId', 'optometristaId', 'fechaHora', 'tipoConsulta', 'duracionEstimada', 'estado'];
    const hasErrors = requiredFields.some(field => !formData[field]);
    
    if (hasErrors) {
      setHasValidationErrors(true);
      return;
    }

    // Validar fecha y hora
    const dateTimeError = validateDateTime();
    if (dateTimeError) {
      setHasValidationErrors(true);
      return;
    }

    setHasValidationErrors(false);
    setIsLoading(true);
    setIsError(false);

    try {
      // CORRECCIÓN: Llamar onSubmit sin parámetros si no espera el evento
      await onSubmit(e);
    } catch (error) {
      setIsError(true);
      console.error('Error al guardar cita:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    {
      title: "Información del Cliente",
      fields: [
        { 
          name: 'clienteId', 
          label: 'Cliente', 
          type: 'select', 
          required: true,
          placeholder: 'Seleccione un cliente',
          className: 'md:col-span-2'
        },
        { 
          name: 'sucursalId', 
          label: 'Sucursal', 
          type: 'select', 
          required: true,
          placeholder: 'Seleccione una sucursal'
        },
        { 
          name: 'optometristaId', 
          label: 'Optometrista', 
          type: 'select', 
          required: true,
          placeholder: 'Seleccione un optometrista'
        },
      ]
    },
    {
      title: "Programación de la Cita",
      fields: [
        { 
          name: 'fechaHora', 
          label: 'Fecha y Hora', 
          type: 'datetime-local', 
          required: true 
        },
        { 
          name: 'tipoConsulta', 
          label: 'Tipo de Consulta', 
          type: 'select', 
          options: [
            { value: 'Examen Rutinario', label: 'Examen Rutinario' },
            { value: 'Consulta Especializada', label: 'Consulta Especializada' },
            { value: 'Control Post-Cirugía', label: 'Control Post-Cirugía' },
            { value: 'Urgencia', label: 'Urgencia' },
            { value: 'Primera Consulta', label: 'Primera Consulta' },
            { value: 'Seguimiento', label: 'Seguimiento' }
          ],
          required: true 
        },
        { 
          name: 'duracionEstimada', 
          label: 'Duración Estimada (minutos)', 
          type: 'number', 
          placeholder: '30',
          min: 15,
          max: 120,
          required: true 
        },
        { 
          name: 'estado', 
          label: 'Estado de la Cita', 
          type: 'select', 
          options: [
            { value: 'Programada', label: 'Programada' },
            { value: 'Confirmada', label: 'Confirmada' },
            { value: 'En Proceso', label: 'En Proceso' },
            { value: 'Completada', label: 'Completada' },
            { value: 'Cancelada', label: 'Cancelada' },
            { value: 'No Asistió', label: 'No Asistió' }
          ],
          required: true 
        },
      ]
    },
    {
      title: "Detalles Adicionales",
      fields: [
        { 
          name: 'motivoConsulta', 
          label: 'Motivo de la Consulta', 
          type: 'textarea', 
          placeholder: 'Describa brevemente el motivo de la consulta...',
          className: 'md:col-span-2'
        },
        { 
          name: 'observaciones', 
          label: 'Observaciones', 
          type: 'textarea', 
          placeholder: 'Notas adicionales, instrucciones especiales, etc...',
          className: 'md:col-span-2'
        },
      ]
    }
  ];

  // Validar fecha mínima
  const validateDateTime = () => {
    if (formData.fechaHora) {
      const selectedDate = new Date(formData.fechaHora);
      const now = new Date();
      
      if (selectedDate < now) {
        return 'No se pueden programar citas en fechas pasadas';
      }
      
      const hour = selectedDate.getHours();
      if (hour < 8 || hour > 18) {
        return 'Las citas deben programarse entre 8:00 AM y 6:00 PM';
      }
    }
    return null;
  };

  const dateTimeError = validateDateTime();

  const customContent = (
    <div className="space-y-8">
      {sections.map((section, sectionIndex) => (
        <div key={`section-${sectionIndex}`} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
            
            {section.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.fields.map((field, fieldIndex) => (
              <div key={`field-${sectionIndex}-${fieldIndex}`} className={field.className || ''}>
                <EnhancedField
                  field={field}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  error={errors[field.name] || (field.name === 'fechaHora' && dateTimeError)}
                  formData={formData}
                  clientes={clientes}
                  optometristas={optometristas}
                  sucursales={sucursales}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Información de programación */}
      {formData?.fechaHora && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Información de horario:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Horario de atención: 8:00 AM - 6:00 PM</li>
                <li>Las citas se programan con intervalos de 30 minutos</li>
                <li>Llegue 15 minutos antes de su cita</li>
                <li>Confirme su cita 24 horas antes</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Alertas de validación */}
      {dateTimeError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Error en fecha y hora:</p>
              <p>{dateTimeError}</p>
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
      submitIcon={<Calendar className="w-4 h-4" />}
      fields={[]}
      gridCols={1}
      size="xl"
      // NUEVAS PROPS
      isLoading={isLoading}
      isError={isError}
      hasValidationErrors={hasValidationErrors}
      errorDuration={1000}
    >
      {customContent}
    </FormModal>
  );
};

export default CitasFormModal;