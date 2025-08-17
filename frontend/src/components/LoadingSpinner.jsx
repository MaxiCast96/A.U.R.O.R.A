import React from 'react';

const LoadingSpinner = ({ message = "Cargando productos..." }) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        {/* Spinner animado */}
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#0097c2] rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#00b4e4] rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
        </div>
        
        {/* Mensaje */}
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Cargando productos
        </h3>
        <p className="text-gray-600 mb-4">{message}</p>
        
        {/* Indicador de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-gradient-to-r from-[#0097c2] to-[#00b4e4] h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        
        {/* Texto de ayuda */}
        <div className="text-sm text-gray-500">
          <p>Estamos preparando todo para ti...</p>
          <p className="mt-1">Esto solo tomará un momento</p>
        </div>
        
        {/* Iconos decorativos */}
        <div className="flex justify-center space-x-4 mt-6">
          <div className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>👓</div>
          <div className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>👜</div>
          <div className="text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>✨</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
