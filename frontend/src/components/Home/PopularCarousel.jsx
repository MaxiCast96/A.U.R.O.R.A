import React, { useState, useEffect } from 'react';

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex-shrink-0 px-2" style={{ width: `${100 / 3}%` }}>
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
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
          <h3 className="font-medium text-gray-800 mb-1">{product.nombre}</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">${product.precioActual?.toFixed(2)}</span>
            {product.enPromocion && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                -{Math.round(100 - (product.precioActual / product.precioBase * 100))}%
              </span>
            )}
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
  const itemsToShow = 3;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/lentes/populares');
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
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-light text-center mb-8 text-gray-800">Lentes Destacados</h2>
      
      <div className="relative">
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-out"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
              width: `${(products.length / itemsToShow) * 100}%`
            }}
          >
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
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
    </div>
  );
};

export default PopularCarousel;