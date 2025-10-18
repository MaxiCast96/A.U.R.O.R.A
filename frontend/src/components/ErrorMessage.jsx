import React from 'react';

const ErrorMessage = ({ error, onRetry }) => {
  const getErrorMessage = (error) => {
    if (error.includes('404')) {
      return 'No se pudo encontrar la información solicitada';
    } else if (error.includes('500')) {
      return 'Error interno del servidor. Por favor, intenta más tarde';
    } else if (error.includes('network')) {
      return 'Error de conexión. Verifica tu conexión a internet';
    } else if (error.includes('timeout')) {
      return 'La solicitud tardó demasiado. Por favor, intenta nuevamente';
    } else {
      return 'Ocurrió un error inesperado. Por favor, intenta más tarde';
    }
  };

  const getErrorIcon = (error) => {
    if (error.includes('404')) return '🔍';
    if (error.includes('500')) return '⚠️';
    if (error.includes('network')) return '📡';
    if (error.includes('timeout')) return '⏰';
    return ' ';
  };

  const getSuggestions = (error) => {
    const suggestions = [];
    
    if (error.includes('404')) {
      suggestions.push('Verifica que la URL sea correcta');
      suggestions.push('Intenta recargar la página');
    } else if (error.includes('500')) {
      suggestions.push('Espera unos minutos e intenta nuevamente');
      suggestions.push('Si el problema persiste, contacta al soporte');
    } else if (error.includes('network')) {
      suggestions.push('Verifica tu conexión a internet');
      suggestions.push('Intenta conectarte a otra red');
    } else if (error.includes('timeout')) {
      suggestions.push('Verifica tu conexión a internet');
      suggestions.push('Intenta en unos minutos');
    } else {
      suggestions.push('Recarga la página');
      suggestions.push('Contacta al soporte si el problema persiste');
    }
    
    return suggestions;
  };

  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        {/* Icono de error */}
        <div className="text-6xl mb-4">
          {getErrorIcon(error)}
        </div>
        
        {/* Título */}
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Ocurrió un error
        </h3>
        
        {/* Mensaje de error */}
        <p className="text-gray-600 mb-6">
          {getErrorMessage(error)}
        </p>
        
        {/* Sugerencias */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-red-800 mb-3">💡 ¿Qué puedes hacer?</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {getSuggestions(error).map((suggestion, index) => (
              <li key={index} className="flex items-center justify-center">
                <span className="text-red-500 mr-2">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-[#0097c2] text-white px-6 py-2 rounded-full hover:bg-[#0077a2] transition-colors duration-200"
            >
              🔄 Intentar nuevamente
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-300 transition-colors duration-200"
          >
            🔄 Recargar página
          </button>
        </div>
        
        {/* Información adicional */}
        <div className="mt-8 text-sm text-gray-500">
          <p>¿El problema persiste?</p>
          <p className="mt-1">
            Contacta con nuestro equipo de soporte técnico
          </p>
        </div>
        
        {/* Detalles técnicos (opcional) */}
        <details className="mt-4 text-xs text-gray-400">
          <summary className="cursor-pointer hover:text-gray-600">
            Ver detalles técnicos
          </summary>
          <div className="mt-2 p-2 bg-gray-100 rounded text-left">
            <code className="break-all">{error}</code>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ErrorMessage;
