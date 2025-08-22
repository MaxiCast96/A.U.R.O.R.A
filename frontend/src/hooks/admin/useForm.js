import { useState, useCallback } from 'react';

/**
 * Custom hook para manejo de formularios con validaciones avanzadas
 * @param {Object} initialState - Estado inicial del formulario
 * @param {Function} validate - Función de validación personalizada
 * @returns {Object} Objeto con métodos y estado del formulario
 */
export const useForm = (initialState, validate) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  /**
   * Maneja cambios en los campos del formulario
   * @param {Event} e - Evento del input
   */
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    // Determinar el valor basado en el tipo de input
    let inputValue = value;
    if (type === 'checkbox') {
      inputValue = checked;
    } else if (type === 'number') {
      inputValue = value === '' ? '' : Number(value);
    }

    // Check if this is a nested field (e.g., 'direccion.departamento')
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: inputValue
        }
      }));
      
      // Clear error for this field if it exists
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    } else {
      // Handle non-nested fields
      setFormData(prev => ({ ...prev, [name]: inputValue }));
      
      // Clear error for this field if it exists
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    }
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
  }, [errors]);

  /**
   * Maneja cambios en campos anidados (ej: direccion.calle)
   * @param {string} name - Nombre del campo con notación de punto
   * @param {any} value - Valor del campo
   */
  const handleNestedChange = useCallback((name, value) => {
    const keys = name.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      // Navegar hasta el penúltimo nivel
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      // Asignar el valor en el último nivel
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    
    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Marcar campo como tocado
    setTouched(prev => ({ ...prev, [name]: true }));
  }, [errors]);

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialState]);

  /**
   * Valida el formulario usando la función de validación proporcionada
   * @param {boolean} isEditing - Indica si se está editando un registro existente
   * @returns {boolean} True si el formulario es válido
   */
  const validateForm = useCallback((isEditing = false) => {
    if (!validate) return true;
    
    const newErrors = validate(formData, isEditing);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validate]);

  /**
   * Valida un campo específico
   * @param {string} fieldName - Nombre del campo a validar
   * @returns {boolean} True si el campo es válido
   */
  const validateField = useCallback((fieldName) => {
    if (!validate) return true;
    
    const fieldErrors = validate(formData, false);
    const fieldError = fieldErrors[fieldName];
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldError
    }));
    
    return !fieldError;
  }, [formData, validate]);

  /**
   * Maneja el envío del formulario con validación
   * @param {Function} onSubmit - Función a ejecutar si la validación es exitosa
   * @param {boolean} isEditing - Indica si se está editando
   */
  const handleSubmit = useCallback(async (onSubmit, isEditing = false) => {
    setIsSubmitting(true);
    
    try {
      if (validateForm(isEditing)) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Error en submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  /**
   * Actualiza el estado del formulario con nuevos datos
   * @param {Object} newData - Nuevos datos para el formulario
   */
  const setFormDataWithReset = useCallback((newData) => {
    setFormData(newData);
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Verifica si el formulario ha sido modificado
   * @returns {boolean} True si el formulario ha sido modificado
   */
  const isFormDirty = useCallback(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialState);
  }, [formData, initialState]);

  /**
   * Obtiene el valor de un campo, incluyendo campos anidados
   * @param {string} name - Nombre del campo
   * @returns {any} Valor del campo
   */
  const getFieldValue = useCallback((name) => {
    if (name.includes('.')) {
      const keys = name.split('.');
      return keys.reduce((obj, key) => obj?.[key], formData);
    }
    return formData[name];
  }, [formData]);

  /**
   * Verifica si un campo tiene error
   * @param {string} name - Nombre del campo
   * @returns {boolean} True si el campo tiene error
   */
  const hasError = useCallback((name) => {
    return !!errors[name];
  }, [errors]);

  /**
   * Verifica si un campo ha sido tocado
   * @param {string} name - Nombre del campo
   * @returns {boolean} True si el campo ha sido tocado
   */
  const isFieldTouched = useCallback((name) => {
    return !!touched[name];
  }, [touched]);

  return {
    // Estado
    formData,
    errors,
    touched,
    isSubmitting,
    
    // Métodos principales
    handleInputChange,
    handleNestedChange,
    resetForm,
    validateForm,
    validateField,
    handleSubmit,
    setFormData: setFormDataWithReset,
    
    // Utilidades
    isFormDirty,
    getFieldValue,
    hasError,
    isFieldTouched,
    
    // Métodos de acceso directo (para compatibilidad)
    setFormData: setFormDataWithReset,
    setErrors
  };
};

/**
 * Validaciones comunes para formularios
 */
export const commonValidations = {
  /**
   * Valida formato de email
   * @param {string} email - Email a validar
   * @returns {string|null} Mensaje de error o null si es válido
   */
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'El email es requerido';
    if (!emailRegex.test(email)) return 'Formato de email inválido';
    return null;
  },

  /**
   * Valida formato de DUI salvadoreño
   * @param {string} dui - DUI a validar
   * @returns {string|null} Mensaje de error o null si es válido
   */
  dui: (dui) => {
    const duiRegex = /^\d{8}-\d$/;
    if (!dui) return 'El DUI es requerido';
    if (!duiRegex.test(dui)) return 'Formato de DUI inválido (12345678-9)';
    return null;
  },

  /**
   * Valida formato de teléfono salvadoreño
   * @param {string} phone - Teléfono a validar
   * @returns {string|null} Mensaje de error o null si es válido
   */
  phone: (phone) => {
    const phoneRegex = /^\+503[6-7]\d{7}$/;
    if (!phone) return 'El teléfono es requerido';
    if (!phoneRegex.test(phone)) return 'Formato de teléfono inválido (+503XXXXXXXX)';
    return null;
  },

  /**
   * Valida que un campo no esté vacío
   * @param {string} value - Valor a validar
   * @param {string} fieldName - Nombre del campo para el mensaje de error
   * @returns {string|null} Mensaje de error o null si es válido
   */
  required: (value, fieldName) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} es requerido`;
    }
    return null;
  },

  /**
   * Valida longitud mínima
   * @param {string} value - Valor a validar
   * @param {number} minLength - Longitud mínima
   * @param {string} fieldName - Nombre del campo
   * @returns {string|null} Mensaje de error o null si es válido
   */
  minLength: (value, minLength, fieldName) => {
    if (value && value.length < minLength) {
      return `${fieldName} debe tener al menos ${minLength} caracteres`;
    }
    return null;
  },

  /**
   * Valida rango numérico
   * @param {number} value - Valor a validar
   * @param {number} min - Valor mínimo
   * @param {number} max - Valor máximo
   * @param {string} fieldName - Nombre del campo
   * @returns {string|null} Mensaje de error o null si es válido
   */
  numberRange: (value, min, max, fieldName) => {
    if (value !== '' && (value < min || value > max)) {
      return `${fieldName} debe estar entre ${min} y ${max}`;
    }
    return null;
  }
};