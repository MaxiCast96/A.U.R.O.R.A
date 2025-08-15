import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

<<<<<<< HEAD
const BrandsCarousel = ({
  brands = [],
  loading = false,
  error = null,
  visibleItems = 5,
}) => {
  const items = Array.isArray(brands) ? brands : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Generar placeholder SVG
  const generatePlaceholder = (width = 160, height = 120) => {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <rect x="20%" y="20%" width="60%" height="60%" fill="#d1d5db" rx="4"/>
        <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle">
          Logo
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };
  
  // Crear array infinito duplicando las marcas
  const infiniteItems = items.length > 0 ? [...items, ...items, ...items] : [];
  
  // Calcular el índice efectivo para el array infinito
  const effectiveIndex = currentIndex % items.length;

  const getVisibleBrands = () => {
    if (infiniteItems.length === 0) return [];
    
    // Obtener los items visibles para el slide actual
    const visible = infiniteItems.slice(currentIndex, currentIndex + visibleItems);
    const count = visible.length;
    const centerIndex = Math.floor((count - 1) / 2);

    return visible.map((brand, idx) => {
      const distanceFromCenter = Math.abs(idx - centerIndex);
      const maxDistance = Math.max(centerIndex, count - 1 - centerIndex);
      
      // Suavizar las transiciones de escala y opacidad
      const normalizedDistance = maxDistance > 0 ? distanceFromCenter / maxDistance : 0;
      const scale = 0.8 + (1 - normalizedDistance) * 0.2; // Escala de 0.8 a 1
      const opacity = 0.6 + (1 - normalizedDistance) * 0.4; // Opacidad de 0.6 a 1
      
      // Distribuir uniformemente los elementos
      const leftPercent = count > 1 ? (idx / (count - 1)) * 60 + 20 : 50;

        return {
        ...brand,
        scale,
        zIndex: 100 + count - distanceFromCenter,
        opacity,
        leftPercent,
        globalIndex: currentIndex + idx,
        };
      });
  };

  const nextSlide = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  // Estados de carga y error
  if (loading) {
    return (
      <section className="w-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando marcas...</p>
          </div>
=======
// Componente hijo que recibe TODOS los datos como props desde el padre
const BrandsCarousel = ({ 
  brands = [], 
  loading = false, 
  error = null, 
  currentSlide = 0, 
  onSlideChange 
}) => {
  const [currentSlideInternal, setCurrentSlideInternal] = useState(currentSlide);
  
  // Usar el estado interno solo si no se proporciona onSlideChange
  const isControlled = !!onSlideChange;
  const slideState = isControlled ? currentSlide : currentSlideInternal;
  const setSlideState = isControlled ? onSlideChange : setCurrentSlideInternal;
  
  const safeBrands = Array.isArray(brands) ? brands.filter(brand => brand.image || brand.logo) : [];
  const itemsPerSlide = 5;
  const totalSlides = Math.ceil(safeBrands.length / itemsPerSlide);

  // Auto-play del carrusel (solo si no es controlado externamente)
  useEffect(() => {
    if (!isControlled && totalSlides > 1) {
      const interval = setInterval(() => {
        setSlideState((prev) => (prev + 1) % totalSlides);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [totalSlides, isControlled, setSlideState]);

  const nextSlide = () => {
    setSlideState((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setSlideState((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (slideIndex) => {
    setSlideState(slideIndex);
  };

  const getCurrentSlideItems = () => {
    const startIndex = slideState * itemsPerSlide;
    const endIndex = startIndex + itemsPerSlide;
    return safeBrands.slice(startIndex, endIndex);
  };

  // Mostrar estados de carga y error DESPUÉS de todos los hooks
  if (loading) {
    return (
      <section className="w-full bg-white-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-8">Cargando marcas...</div>
>>>>>>> b7be6ad5b87bf22d65b01498958c3b3ccf92a74c
        </div>
      </section>
    );
  }
<<<<<<< HEAD

  if (error) {
    return (
      <section className="w-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12 text-red-500">
            <p>Error al cargar las marcas</p>
            <p className="text-sm mt-2 text-gray-500">{String(error)}</p>
          </div>
=======
  
  if (error) {
    return (
      <section className="w-full bg-white-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-8 text-red-500">Error al cargar marcas: {error}</div>
>>>>>>> b7be6ad5b87bf22d65b01498958c3b3ccf92a74c
        </div>
      </section>
    );
  }
<<<<<<< HEAD

  if (!items || items.length === 0) {
    return (
      <section className="w-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12 text-gray-500">
            No hay marcas disponibles
          </div>
=======
  
  if (safeBrands.length === 0) {
    return (
      <section className="w-full bg-white-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-8">No se encontraron marcas.</div>
>>>>>>> b7be6ad5b87bf22d65b01498958c3b3ccf92a74c
        </div>
      </section>
    );
  }
<<<<<<< HEAD

  const visibleBrands = getVisibleBrands();
  const shouldShowNavigation = items.length > 1;
  const shouldShowIndicators = items.length > 1;
=======
>>>>>>> b7be6ad5b87bf22d65b01498958c3b3ccf92a74c

  return (
    <section className="w-full relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Título de la sección */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Nuestras Marcas</h2>
          <p className="text-gray-600 text-lg">Descubre la calidad de nuestras marcas asociadas</p>
        </div>

        <div className="relative">
<<<<<<< HEAD
          {/* Carrusel */}
          <div className="overflow-hidden relative w-full">
            <div className="flex justify-center min-h-[400px] items-center relative">
              {visibleBrands.map((brand) => (
                <div
                  key={`${brand._id || brand.id || 'brand'}-${brand.globalIndex}`}
                  className="absolute transition-all duration-700 ease-in-out cursor-pointer will-change-transform"
                  style={{
                    transform: `translateX(-50%) scale(${brand.scale})`,
                    opacity: brand.opacity,
                    zIndex: brand.zIndex,
                    left: `${brand.leftPercent}%`,
                  }}
                >
                  <div className="relative">
                    <img
                      src={brand.logo || brand.imagen || generatePlaceholder()}
                      alt={brand.nombre || brand.name || 'Marca'}
                      className="h-48 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300 hover:scale-125 block shadow-xl rounded-xl bg-white p-6 border-2 border-gray-100 hover:border-blue-200"
                      onError={(e) => {
                        if (!e.currentTarget.dataset.fallbackSet) {
                          e.currentTarget.src = generatePlaceholder();
                          e.currentTarget.alt = 'Logo no disponible';
                          e.currentTarget.dataset.fallbackSet = 'true';
                        }
                      }}
                      onLoad={(e) => {
                        e.currentTarget.style.visibility = 'visible';
                      }}
                      loading="lazy"
                      style={{ visibility: 'visible' }}
                    />
                    {/* Nombre de la marca */}
                    <div className="mt-4 text-center">
                      <p className="text-base font-semibold text-gray-700 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">{brand.nombre || brand.name || 'Marca'}</p>
                    </div>
                  </div>
=======
          {/* Contenedor del carrusel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-in-out min-h-[120px]"
              style={{ 
                transform: `translateX(-${slideState * (100 / totalSlides)}%)`,
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
>>>>>>> b7be6ad5b87bf22d65b01498958c3b3ccf92a74c
                </div>
              ))}
            </div>
          </div>

          {/* Botones de navegación */}
<<<<<<< HEAD
          {shouldShowNavigation && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 z-20 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
=======
          {totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl z-10"
>>>>>>> b7be6ad5b87bf22d65b01498958c3b3ccf92a74c
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              
              <button
                onClick={nextSlide}
<<<<<<< HEAD
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 z-20 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
=======
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl z-10"
>>>>>>> b7be6ad5b87bf22d65b01498958c3b3ccf92a74c
                aria-label="Siguiente"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}
        </div>

<<<<<<< HEAD
=======
        {/* Indicadores de página */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  slideState === index 
                    ? 'bg-blue-600 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir a la página ${index + 1}`}
              />
            ))}
          </div>
        )}
>>>>>>> b7be6ad5b87bf22d65b01498958c3b3ccf92a74c
      </div>
    </section>
  );
};

export default BrandsCarousel;