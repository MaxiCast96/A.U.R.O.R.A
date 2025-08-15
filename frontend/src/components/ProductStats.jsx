import React from 'react';

const ProductStats = ({ products, type }) => {
  const getStats = () => {
    if (!products) return { total: 0, enPromocion: 0, precioPromedio: 0 };
    
    const total = products.length;
    const enPromocion = products.filter(p => p.enPromocion).length;
    const precios = products.map(p => p.precioActual || p.precioBase || 0).filter(p => p > 0);
    const precioPromedio = precios.length > 0 ? precios.reduce((a, b) => a + b, 0) / precios.length : 0;
    
    return { total, enPromocion, precioPromedio };
  };

  const stats = getStats();

  const getTypeIcon = () => {
    switch (type) {
      case 'lentes': return '👓';
      case 'accesorios': return '👜';
      case 'personalizables': return '✨';
      default: return '🛍️';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'lentes': return 'Lentes';
      case 'accesorios': return 'Accesorios';
      case 'personalizables': return 'Personalizables';
      default: return 'Productos';
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6">
      <div className="flex items-center space-x-3 mb-3">
        <span className="text-2xl">{getTypeIcon()}</span>
        <h3 className="text-lg font-semibold text-gray-800">
          Estadísticas de {getTypeLabel()}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-[#0097c2]">{stats.total}</div>
          <div className="text-sm text-gray-600">Total disponible</div>
        </div>
        
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.enPromocion}</div>
          <div className="text-sm text-gray-600">En promoción</div>
        </div>
        
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-orange-600">
            ${stats.precioPromedio.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Precio promedio</div>
        </div>
      </div>
    </div>
  );
};

export default ProductStats;
