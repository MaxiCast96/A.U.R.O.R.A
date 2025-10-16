import React from 'react';
import { Link } from 'react-router-dom';

const EmptyProducts = ({ type, searchTerm, filters, onClearFilters, onViewAll }) => {
  const getTypeLabel = () => {
    switch (type) {
      case 'lentes': return 'lentes';
      case 'accesorios': return 'accesorios';
      default: return 'productos';
    }
  };

  const getSuggestions = () => {
    const suggestions = [];
    
    if (searchTerm) {
      suggestions.push('Intenta con términos de búsqueda más generales');
      suggestions.push('Verifica la ortografía de tu búsqueda');
    }
    
    if (filters?.selectedCategory !== 'todos') {
      suggestions.push('Prueba con otras categorías');
    }
    
    if (filters?.selectedMarca !== 'todos') {
      suggestions.push('Explora otras marcas disponibles');
    }
    
    if (filters?.priceRange.min > 0 || filters?.priceRange.max < 10000) {
      suggestions.push('Ajusta el rango de precios');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('Pronto tendremos más opciones disponibles');
      suggestions.push('Contacta con nuestro equipo para consultas especiales');
    }
    
    return suggestions;
  };

  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        {/* Icono */}
        <div className="text-6xl mb-4">{type === 'lentes' ? '👓' : type === 'accesorios' ? '👜' : '🛍️'}</div>
        
        {/* Título */}
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          No se encontraron {getTypeLabel()}
        </h3>
        
        {/* Descripción */}
        <p className="text-gray-600 mb-6">
          {searchTerm 
            ? `No encontramos ${getTypeLabel()} que coincidan con "${searchTerm}"`
            : `Actualmente no tenemos ${getTypeLabel()} disponibles con los filtros aplicados`
          }
        </p>
        
        {/* Sugerencias */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">💡 Sugerencias:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {getSuggestions().map((suggestion, index) => (
              <li key={index} className="flex items-center justify-center">
                <span className="text-[#0097c2] mr-2">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => (typeof onClearFilters === 'function' ? onClearFilters() : window.location.reload())}
            className="bg-[#0097c2] text-white px-6 py-2 rounded-full hover:bg-[#0077a2] transition-colors duration-200"
          >
            🔄 Limpiar filtros
          </button>

          {typeof onViewAll === 'function' ? (
            <button
              onClick={() => onViewAll()}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-300 transition-colors duration-200"
            >
              👀 Ver todos los productos
            </button>
          ) : (
            <Link
              to="/productos"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-300 transition-colors duration-200"
            >
              👀 Ver todos los productos
            </Link>
          )}
        </div>
        
        {/* Información adicional */}
        <div className="mt-8 text-sm text-gray-500">
          <p>¿Necesitas ayuda para encontrar lo que buscas?</p>
          <p className="mt-1">
            Contacta con nuestro equipo de atención al cliente
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyProducts;
