import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';

const ProductCard = ({ product, itemWidthPercent, onQuickView }) => {
  const [imageError, setImageError] = useState(false);
  const handleQuickView = () => {
    try {
      console.log('[PopularCarousel] Ver detalles click', product?._id || product?.nombre || product);
    } catch {}
    onQuickView(product);
  };
  return (
    <div className="flex-shrink-0 px-2" style={{ width: `${itemWidthPercent}%` }}>
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow relative z-10 pointer-events-auto">
        <div className="aspect-square bg-gray-50 flex items-center justify-center">
          {product.imagenes?.[0] && !imageError ? (
            <img
              src={product.imagenes[0]}
              alt={product.nombre}
              className="object-contain h-full w-full p-4"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-gray-300">Sin imagen</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-800 mb-1 truncate" title={product.nombre}>{product.nombre}</h3>
          <div className="flex justify-between items-center mb-3 pointer-events-auto">
            <span className="text-gray-700 font-semibold">${product.precioActual?.toFixed(2)}</span>
            {product.enPromocion && (
              <span className="text-xs px-2 py-1 rounded bg-[#e6f7fb] text-[#0097c2]">
                -{Math.round(100 - (product.precioActual / product.precioBase * 100))}%
              </span>
            )}
          </div>
          <div className="flex gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={handleQuickView}
              className="flex-1 text-sm px-3 py-2 rounded-lg font-medium transition-colors pointer-events-auto bg-[#0097c2] hover:bg-[#0083a8] text-white shadow-sm"
            >
              Ver detalles
            </button>
            <Link
              to={`${(import.meta?.env?.BASE_URL || '/').replace(/\/$/, '')}/productos?q=${encodeURIComponent(product.nombre || '')}`}
              className="text-sm px-3 py-2 rounded-lg font-medium transition-colors pointer-events-auto border border-[#0097c2] text-[#0097c2] hover:bg-[#e6f7fb]"
            >
              Ver similares
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const PopularCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickView, setQuickView] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://aurora-production-7e57.up.railway.app/api/lentes/populares');
        const data = await response.json();
        setProducts(data.slice(0, 8));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuickView = (product) => {
    setQuickView(product);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded-lg w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-2xl mb-6"></div>
                <div className="h-6 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-100 rounded-lg mb-6 w-3/4"></div>
                <div className="flex gap-3">
                  <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Award className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay productos destacados</h3>
          <p className="text-gray-500">Vuelve pronto para ver nuestros productos más vendidos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-20 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-50/20 via-transparent to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          {products.map((product, index) => {
            const discount = product.enPromocion && product.precioBase > product.precioActual 
              ? Math.round(100 - (product.precioActual / product.precioBase * 100))
              : 0;

            return (
              <div
                key={product._id}
                className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                {/* Ranking Badge */}
                <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  {index + 1}
                </div>

                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    -{discount}%
                  </div>
                )}

                {/* Image */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  {product.imagenes?.[0] ? (
                    <img
                      src={product.imagenes[0]}
                      alt={product.nombre}
                      className="w-full h-full object-contain p-6 transition-all duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Eye className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4 line-clamp-2 min-h-[3.5rem]">
                    {product.nombre}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        ${product.precioActual?.toFixed(2)}
                      </span>
                      {product.precioBase && product.precioBase > product.precioActual && (
                        <span className="text-sm text-gray-400 line-through ml-2">
                          ${product.precioBase.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {index < 3 && (
                      <div className="flex items-center gap-1 text-cyan-600">
                        <Award className="w-4 h-4" />
                        <span className="text-xs font-semibold">TOP {index + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleQuickView(product)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group/btn"
                  >
                    <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    Ver Detalles
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-8 rounded-xl border border-gray-200 hover:border-cyan-300 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Search className="w-5 h-5" />
            Ver Todos los Productos
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickView && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200" 
          onClick={() => setQuickView(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setQuickView(null)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="grid md:grid-cols-2">
              {/* Image Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8 md:p-12">
                {quickView.imagenes?.[0] ? (
                  <img 
                    src={quickView.imagenes[0]} 
                    alt={quickView.nombre} 
                    className="object-contain w-full h-full max-h-96"
                  />
                ) : (
                  <div className="text-gray-300 h-64 flex items-center justify-center">
                    <Eye className="w-24 h-24" />
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-8 md:p-12 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {quickView.nombre}
                  </h3>
                  
                  {quickView.descripcion && (
                    <p className="text-gray-600 text-base mb-6 leading-relaxed">
                      {quickView.descripcion}
                    </p>
                  )}

                  {/* Price Section */}
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
                    <span className="text-4xl font-bold text-gray-900">
                      ${quickView.precioActual?.toFixed(2)}
                    </span>
                    {quickView.precioBase && quickView.precioActual && quickView.precioBase > quickView.precioActual && (
                      <>
                        <span className="text-xl text-gray-400 line-through">
                          ${quickView.precioBase.toFixed(2)}
                        </span>
                        <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          -{Math.round(100 - (quickView.precioActual / quickView.precioBase * 100))}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`${(import.meta?.env?.BASE_URL || '/').replace(/\/$/, '')}/productos?q=${encodeURIComponent(quickView.nombre || '')}`}
                      className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors border border-[#0097c2] text-[#0097c2] hover:bg-[#e6f7fb] text-center"
                    >
                      Ver similares
                    </Link>
                    <Link
                      to={`${(import.meta?.env?.BASE_URL || '/').replace(/\/$/, '')}/productos?enPromocion=true`}
                      className="px-4 py-2 rounded-lg font-medium transition-colors bg-[#0097c2] hover:bg-[#0083a8] text-white"
                    >
                      Ver promociones
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PopularCarousel;