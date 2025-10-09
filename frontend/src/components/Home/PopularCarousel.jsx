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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3);
  const [quickView, setQuickView] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://aurora-production-7e57.up.railway.app/api/lentes/populares');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const calcItems = () => {
      const w = window.innerWidth;
      if (w < 640) return 1; // sm-
      if (w < 1024) return 2; // md
      return 3; // lg+
    };
    const apply = () => setItemsToShow(calcItems());
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, []);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % Math.ceil(products.length / itemsToShow));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + Math.ceil(products.length / itemsToShow)) % Math.ceil(products.length / itemsToShow));
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-pulse flex space-x-4">
        {[...Array(itemsToShow)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg w-64 h-64" />
        ))}
      </div>
    </div>
  );

  if (products.length === 0) return (
    <div className="text-center py-12 text-gray-500">
      No hay productos disponibles
    </div>
  );

  return (
    <div className="relative z-[2000] isolate pointer-events-auto" onClickCapture={() => { try { console.log('[PopularCarousel] container capture click'); } catch {} }}>
      <div className="max-w-6xl mx-auto px-4 py-12 pointer-events-auto">
      <h2 className="text-2xl font-light text-center mb-8 text-gray-800">Lentes Destacados</h2>
      
      <div className="relative">
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-out pointer-events-auto"
            onClick={() => {
              try { console.log('[PopularCarousel] Track click'); } catch {}
            }}
            style={{ 
              transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
              width: `${(products.length / itemsToShow) * 100}%`
            }}
          >
            {products.map(product => (
              <ProductCard key={product._id} product={product} itemWidthPercent={100 / itemsToShow} onQuickView={setQuickView} />
            ))}
          </div>
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-2 shadow-sm -ml-4 hover:bg-gray-50 transition-colors"
          aria-label="Anterior"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-2 shadow-sm -mr-4 hover:bg-gray-50 transition-colors"
          aria-label="Siguiente"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex justify-center mt-6 space-x-1">
        {[...Array(Math.ceil(products.length / itemsToShow))].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${currentIndex === i ? 'bg-gray-600' : 'bg-gray-200'}`}
            aria-label={`Ir a slide ${i + 1}`}
          />
        ))}
      </div>

      {quickView && ReactDOM.createPortal(
        (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setQuickView(null)}>
            <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="grid md:grid-cols-2">
                <div className="bg-gray-50 flex items-center justify-center">
                  {quickView.imagenes?.[0] ? (
                    <img src={quickView.imagenes[0]} alt={quickView.nombre} className="object-contain w-full h-full p-6" />
                  ) : (
                    <div className="text-gray-300 h-64 flex items-center justify-center">Sin imagen</div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{quickView.nombre}</h3>
                  {quickView.descripcion && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-5">{quickView.descripcion}</p>
                  )}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl font-bold text-gray-900">${quickView.precioActual?.toFixed(2)}</span>
                    {quickView.precioBase && quickView.precioActual && quickView.precioBase > quickView.precioActual && (
                      <span className="text-sm text-gray-400 line-through">${quickView.precioBase.toFixed(2)}</span>
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
              <div className="p-3 text-right">
                <button type="button" className="text-gray-500 hover:text-gray-700 text-sm" onClick={() => setQuickView(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        ), document.body)}
      </div>
    </div>
  );
};

export default PopularCarousel;