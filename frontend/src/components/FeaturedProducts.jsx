import React from 'react';
import { Link } from 'react-router-dom';

const FeaturedProducts = ({ products, type }) => {
  if (!products || products.length === 0) return null;

  // Obtener productos en promoción o destacados
  const featuredProducts = products
    .filter(product => product.enPromocion || product.linea === 'Premium')
    .slice(0, 3);

  if (featuredProducts.length === 0) return null;

  const getTypePath = () => {
    switch (type) {
      case 'lentes': return '/productos/lentes';
      case 'accesorios': return '/productos/accesorios';
      default: return '/productos';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'lentes': return 'Lentes';
      case 'accesorios': return 'Accesorios';
      default: return 'Productos';
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#0097c2] to-[#00b4e4] text-white p-6 rounded-lg mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">🌟 {getTypeLabel()} Destacados</h3>
        <Link 
          to={getTypePath()}
          className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors duration-200"
        >
          Ver todos →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featuredProducts.map((product) => (
          <div key={product._id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">{type === 'lentes' ? '👓' : '👜'}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm line-clamp-2">{product.nombre}</h4>
                <p className="text-xs text-white/80 line-clamp-1">{product.descripcion}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {product.enPromocion && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      ¡OFERTA!
                    </span>
                  )}
                  <span className="text-sm font-bold">
                    ${(product.precioActual || product.precioBase || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;
