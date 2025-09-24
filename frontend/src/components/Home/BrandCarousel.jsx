import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BrandsCarousel = ({
  brands = [],
  loading = false,
  error = null,
  visibleItems = 5,
  currentSlide = 0,
  onSlideChange
}) => {
  const items = Array.isArray(brands) ? brands.filter(b => b.logo || b.image || b.imagen) : [];
  
  const isControlled = !!onSlideChange;
  // initialize in the middle segment to allow smooth backward/forward moves
  const [currentIndex, setCurrentIndex] = useState(() => {
    const base = Array.isArray(items) ? items.length : 0;
    return Math.max(0, base); // start at the first index of the middle segment
  });
  const setSlideState = isControlled ? onSlideChange : setCurrentIndex;

  // Helper to wrap an index within the infinite list length
  const total = Math.max(1, (Array.isArray(items) && items.length > 0) ? items.length * 3 : 1);
  const normalize = (idx) => ((idx % total) + total) % total;
  
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

  const infiniteItems = items.length > 0 ? [...items, ...items, ...items] : [];

  // When items change, reset to middle segment for seamless navigation
  useEffect(() => {
    if (!isControlled) {
      setCurrentIndex(items.length); // beginning of the middle copy
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const getVisibleBrands = () => {
    if (infiniteItems.length === 0) return [];
    // Build visible window using modular indexing to properly wrap near edges
    const count = Math.min(visibleItems, infiniteItems.length);
    const visible = Array.from({ length: count }, (_, i) => infiniteItems[normalize(currentIndex + i)]);
    const centerIndex = Math.floor((count - 1) / 2);

    return visible.map((brand, idx) => {
      const distanceFromCenter = Math.abs(idx - centerIndex);
      const maxDistance = Math.max(centerIndex, count - 1 - centerIndex);
      const normalizedDistance = maxDistance > 0 ? distanceFromCenter / maxDistance : 0;
      const scale = 0.8 + (1 - normalizedDistance) * 0.2;
      const opacity = 0.6 + (1 - normalizedDistance) * 0.4;
      const leftPercent = count > 1 ? (idx / (count - 1)) * 60 + 20 : 50;
      const isCenter = idx === centerIndex;

      return {
        ...brand,
        scale,
        zIndex: 100 + count - distanceFromCenter,
        opacity,
        leftPercent,
        globalIndex: normalize(currentIndex + idx),
        isCenter,
      };
    });
  };

  // autoplay solo si no es controlado
  useEffect(() => {
    if (!isControlled && items.length > visibleItems) {
      const interval = setInterval(() => {
        setSlideState(prev => normalize((typeof prev === 'number' ? prev : currentIndex) + 1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isControlled, items.length, visibleItems, setSlideState, normalize, currentIndex]);

  const nextSlide = () => setSlideState(prev => normalize((typeof prev === 'number' ? prev : currentIndex) + 1));
  const prevSlide = () => setSlideState(prev => normalize((typeof prev === 'number' ? prev : currentIndex) - 1));

  if (loading) {
    return (
      <section className="w-full py-16 text-center">
        Cargando marcas...
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-16 text-center text-red-500">
        Error al cargar marcas: {String(error)}
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="w-full py-16 text-center text-gray-500">
        No hay marcas disponibles
      </section>
    );
  }

  const visibleBrands = getVisibleBrands();

  return (
    <section className="w-full relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Nuestras Marcas</h2>
          <p className="text-gray-600 text-lg">Descubre la calidad de nuestras marcas asociadas</p>
        </div>

        <div className="overflow-hidden relative w-full min-h-[400px] flex items-center justify-center">
          {visibleBrands.map((brand) => (
            <div
              key={`${brand._id || brand.id || 'brand'}-${brand.globalIndex}`}
              className="absolute transition-all duration-700 ease-in-out cursor-pointer"
              style={{
                transform: `translateX(-50%) scale(${brand.scale})`,
                opacity: brand.opacity,
                zIndex: brand.zIndex,
                left: `${brand.leftPercent}%`,
              }}
            >
              <Link to={`/productos?marca=${encodeURIComponent(brand.nombre || brand.name || '')}`}>
                <img
                  src={brand.logo || brand.imagen || brand.image || generatePlaceholder()}
                  alt={brand.nombre || brand.name || 'Marca'}
                  className={`h-48 w-auto object-contain transition-all duration-300 hover:scale-125 block shadow-xl rounded-xl bg-white p-6 border border-gray-200 ${brand.isCenter ? '' : 'filter grayscale'}`}
                  onError={(e) => {
                    if (!e.currentTarget.dataset.fallbackSet) {
                      e.currentTarget.src = generatePlaceholder();
                      e.currentTarget.alt = 'Logo no disponible';
                      e.currentTarget.dataset.fallbackSet = 'true';
                    }
                  }}
                />
                <div className="mt-4 text-center">
                  <p className={`text-base font-semibold ${brand.isCenter ? 'text-gray-800' : 'text-gray-600'}`}>{brand.nombre || brand.name || 'Marca'}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {items.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:scale-110 transition"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:scale-110 transition"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default BrandsCarousel;
