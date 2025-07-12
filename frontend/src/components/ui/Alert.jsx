import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Componente de alerta mejorado con múltiples tipos y animaciones
 * @param {Object} props - Propiedades del componente
 * @param {string} props.type - Tipo de alerta ('success', 'error', 'warning', 'info')
 * @param {string} props.message - Mensaje a mostrar
 * @param {boolean} props.show - Controla la visibilidad de la alerta
 * @param {Function} props.onClose - Función llamada al cerrar la alerta
 * @param {number} props.duration - Duración en ms antes de auto-cerrar (0 = no auto-cerrar)
 * @param {boolean} props.dismissible - Si la alerta se puede cerrar manualmente
 * @param {string} props.className - Clases CSS adicionales
 */
const Alert = ({ 
  type = 'info', 
  message, 
  show = false, 
  onClose, 
  duration = 0,
  dismissible = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  // Configuración de tipos de alerta
  const alertConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-500',
      title: 'Éxito'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500',
      title: 'Error'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500',
      title: 'Advertencia'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500',
      title: 'Información'
    }
  };

  const config = alertConfig[type] || alertConfig.info;
  const IconComponent = config.icon;

  // Efecto para manejar la visibilidad
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      
      // Auto-cerrar después de la duración especificada
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      handleClose();
    }
  }, [show, duration]);

  // Función para cerrar la alerta con animación
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Tiempo de animación de salida
  };

  // Si no está visible, no renderizar
  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full ${className}`}>
      <div
        className={`
          ${config.bgColor} 
          ${config.borderColor} 
          ${config.textColor}
          border rounded-lg p-4 shadow-lg
          transform transition-all duration-300 ease-in-out
          ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start">
          {/* Icono */}
          <div className="flex-shrink-0">
            <IconComponent 
              className={`h-5 w-5 ${config.iconColor}`} 
              aria-hidden="true" 
            />
          </div>
          
          {/* Contenido */}
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium">
              {config.title}
            </h3>
            <div className="mt-1 text-sm">
              {message}
            </div>
          </div>
          
          {/* Botón de cerrar */}
          {dismissible && (
            <div className="ml-auto pl-3">
              <button
                type="button"
                className={`
                  inline-flex rounded-md p-1.5 
                  ${config.bgColor} 
                  ${config.textColor} 
                  hover:bg-opacity-75 
                  focus:outline-none focus:ring-2 
                  focus:ring-offset-2 
                  focus:ring-offset-green-50 
                  focus:ring-green-600
                  transition-colors duration-200
                `}
                onClick={handleClose}
                aria-label="Cerrar alerta"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Hook personalizado para manejar alertas
 * @returns {Object} Objeto con métodos para mostrar alertas
 */
export const useAlert = () => {
  const [alertState, setAlertState] = useState({
    show: false,
    type: 'info',
    message: '',
    duration: 5000
  });

  const showAlert = (type, message, duration = 5000) => {
    setAlertState({
      show: true,
      type,
      message,
      duration
    });
  };

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, show: false }));
  };

  const showSuccess = (message, duration) => showAlert('success', message, duration);
  const showError = (message, duration) => showAlert('error', message, duration);
  const showWarning = (message, duration) => showAlert('warning', message, duration);
  const showInfo = (message, duration) => showAlert('info', message, duration);

  return {
    alertState,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

/**
 * Componente de alerta con toast para múltiples mensajes
 */
export const ToastContainer = ({ children }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {children}
    </div>
  );
};

/**
 * Componente de alerta inline (no fijo)
 */
export const InlineAlert = ({ 
  type = 'info', 
  message, 
  className = '',
  dismissible = true,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const alertConfig = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500'
    }
  };

  const config = alertConfig[type] || alertConfig.info;
  const IconComponent = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }[type] || Info;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className={`${config.bgColor} ${config.borderColor} ${config.textColor} border rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="ml-3">
          <p className="text-sm">{message}</p>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              className={`inline-flex rounded-md p-1.5 ${config.bgColor} ${config.textColor} hover:bg-opacity-75 focus:outline-none`}
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert; 