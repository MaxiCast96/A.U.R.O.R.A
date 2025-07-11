import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BrandsCarousel = ({ brands }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const safeBrands = Array.isArray(brands) ? brands.filter(brand => brand.image || brand.logo) : [];
  
  if (safeBrands.length === 0) {
    return <div className="text-center py-8">No se encontraron marcas.</div>;
  }

  const itemsPerSlide = 5;
  const totalSlides = Math.ceil(safeBrands.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  // Auto-play del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000); // Aumenté a 5 segundos para dar tiempo a ver la animación

    return () => clearInterval(interval);
  }, [totalSlides]);

  const getCurrentSlideItems = () => {
    const startIndex = currentSlide * itemsPerSlide;
    const endIndex = startIndex + itemsPerSlide;
    return safeBrands.slice(startIndex, endIndex);
  };

  return (
    <section className="w-full bg-white-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative">
          {/* Contenedor del carrusel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-in-out min-h-[120px]"
              style={{ 
                transform: `translateX(-${currentSlide * (100 / totalSlides)}%)`,
                width: `${totalSlides * 100}%`
              }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div 
                  key={slideIndex}
                  className="flex items-center justify-center gap-8"
                  style={{ width: `${100 / totalSlides}%` }}
                >
                  {safeBrands
                    .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                    .map((brand, idx) => (
                      <div 
                        key={brand.id || idx}
                        className="flex items-center justify-center p-6 transition-transform duration-300 hover:scale-110 cursor-pointer"
                      >
                        <img
                          src={brand.image || brand.logo}
                          alt={brand.name || 'Marca'}
                          className="h-35 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                        />
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>

          {/* Botones de navegación */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl z-10"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl z-10"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}
        </div>

        {/* Indicadores de página */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-blue-600 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir a la página ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BrandsCarousel;