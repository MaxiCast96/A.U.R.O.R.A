import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BrandsCarousel = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleItems = 5; // Mostrar 5 promociones a la vez

  // Fetch desde tu API
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch('https://a-u-r-o-r-a.onrender.com/api/marcas');
        if (!response.ok) throw new Error('Error al cargar promociones');
        const data = await response.json();
        setPromotions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  // Lógica del carrusel 3D
  const getVisiblePromotions = () => {
    return promotions
      .slice(currentIndex, currentIndex + visibleItems)
      .map((promo, idx) => {
        const distanceFromCenter = Math.abs(idx - Math.floor(visibleItems / 2));
        return {
          ...promo,
          scale: 1 - distanceFromCenter * 0.2, // Escala: 100%, 80%, 60%
          zIndex: visibleItems - distanceFromCenter,
          opacity: 1 - distanceFromCenter * 0.2,
        };
      });
  };

  const nextSlide = () => {
    if (currentIndex < promotions.length - visibleItems) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Estados de carga/error
  if (loading) return <div className="text-center py-12">Cargando promociones...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  if (promotions.length === 0) return <div className="text-center py-12">No hay promociones disponibles</div>;

  return (
    <section className="w-full bg-white-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative">
          {/* Carrusel */}
          <div className="overflow-hidden" style={{ position: 'relative', width: '100%' }}>
            <div className="flex justify-center min-h-[250px] items-center relative">
              {getVisiblePromotions().map((promo, idx) => (
                <div
                  key={promo._id || idx}
                  className="absolute transition-all duration-500 ease-out cursor-pointer"
                  style={{
                    transform: `scale(${promo.scale})`,
                    opacity: promo.opacity,
                    zIndex: promo.zIndex,
                    left: `${(idx / (visibleItems - 1)) * 80 + 10}%`, // Distribución horizontal
                  }}
                >
                  <img
                    src={promo.imagen} // Asegúrate de que coincida con el campo de tu API
                    alt={promo.nombre || 'Promoción'}
                    className="h-20 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Botones de navegación */}
          {promotions.length > visibleItems && (
            <>
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10 disabled:opacity-50"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentIndex >= promotions.length - visibleItems}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10 disabled:opacity-50"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}
        </div>

        {/* Indicadores (opcional) */}
        {promotions.length > visibleItems && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: promotions.length - visibleItems + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BrandsCarousel;