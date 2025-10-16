import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Award, TrendingUp } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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
  const [currentIndex, setCurrentIndex] = useState(() => {
    const base = Array.isArray(items) ? items.length : 0;
    return Math.max(0, base);
  });
  const setSlideState = isControlled ? onSlideChange : setCurrentIndex;

  const total = Math.max(1, (Array.isArray(items) && items.length > 0) ? items.length * 3 : 1);
  const normalize = (idx) => ((idx % total) + total) % total;
  
  const generatePlaceholder = (width = 180, height = 140) => {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:#0891b2;stop-opacity:0.2" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" rx="12"/>
        <rect x="25%" y="30%" width="50%" height="40%" fill="#06b6d4" opacity="0.15" rx="8"/>
        <text x="50%" y="55%" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#0891b2" text-anchor="middle">
          PREMIUM
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const infiniteItems = items.length > 0 ? [...items, ...items, ...items] : [];

  useEffect(() => {
    if (!isControlled) {
      setCurrentIndex(items.length);
    }
  }, [items.length]);

  const getVisibleBrands = () => {
    if (infiniteItems.length === 0) return [];
    const count = Math.min(visibleItems, infiniteItems.length);
    const visible = Array.from({ length: count }, (_, i) => infiniteItems[normalize(currentIndex + i)]);
    const centerIndex = Math.floor((count - 1) / 2);

    return visible.map((brand, idx) => {
      const distanceFromCenter = Math.abs(idx - centerIndex);
      const maxDistance = Math.max(centerIndex, count - 1 - centerIndex);
      const normalizedDistance = maxDistance > 0 ? distanceFromCenter / maxDistance : 0;
      const scale = 0.75 + (1 - normalizedDistance) * 0.25;
      const opacity = 0.4 + (1 - normalizedDistance) * 0.6;
      const leftPercent = count > 1 ? (idx / (count - 1)) * 70 + 15 : 50;
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

  useEffect(() => {
    if (!isControlled && items.length > visibleItems) {
      const interval = setInterval(() => {
        setSlideState(prev => normalize((typeof prev === 'number' ? prev : currentIndex) + 1));
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isControlled, items.length, visibleItems, setSlideState, normalize, currentIndex]);

  const nextSlide = () => setSlideState(prev => normalize((typeof prev === 'number' ? prev : currentIndex) + 1));
  const prevSlide = () => setSlideState(prev => normalize((typeof prev === 'number' ? prev : currentIndex) - 1));

  if (loading) {
    return (
      <section className="w-full py-24 bg-gradient-to-br from-gray-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-cyan-500 rounded-full animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded-lg w-64 mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-24 bg-gradient-to-br from-gray-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 inline-block">
            <p className="text-red-600 font-medium">Error al cargar nuestras marcas</p>
            <p className="text-red-500 text-sm mt-2">{String(error)}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="w-full py-24 bg-gradient-to-br from-gray-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="bg-white/80 backdrop-blur-sm border border-cyan-100 rounded-2xl p-12 inline-block shadow-lg">
            <Award className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Próximamente nuevas marcas premium</p>
          </div>
        </div>
      </section>
    );
  }

  const visibleBrands = getVisibleBrands();

  return (
    <section className="w-full relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-cyan-50">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 py-24">
        {/* Header */}
        <div className="text-center mb-16">
          
          {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-cyan-100 shadow-lg">
            <Award className="w-8 h-8 text-cyan-500" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Calidad Garantizada</p>
              <p className="text-sm text-gray-600">Productos certificados por nuestros colaboradores</p>
            </div>
          </div>
        </div>

        <br/>
          <Motion.h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          
            Nuestras <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Marcas</span>
        
          </Motion.h2>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
            Colaboramos exclusivamente con las marcas de confianza para ofrecerte 
            <span className="font-semibold text-cyan-700"> calidad excepcional</span> en cada producto
          </p>

          
        </div>

        {/* Carousel */}
        <div className="relative w-full min-h-[500px] flex items-center justify-center">
          {/* Background glow for center item */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-80 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
          </div>

          {visibleBrands.map((brand) => (
            <div
              key={`${brand._id || brand.id || 'brand'}-${brand.globalIndex}`}
              className="absolute transition-all duration-1000 ease-out cursor-pointer group"
              style={{
                transform: `translateX(-50%) scale(${brand.scale})`,
                opacity: brand.opacity,
                zIndex: brand.zIndex,
                left: `${brand.leftPercent}%`,
              }}
            >
              <Link to={`${(import.meta?.env?.BASE_URL || '/').replace(/\/$/, '')}/productos?marca=${encodeURIComponent(brand.nombre || brand.name || '')}`}>
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

        {/* Dots indicator */}
        {items.length > 1 && (
          <div className="flex justify-center mt-12 gap-3">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSlideState(items.length + idx)}
                className={`
                  w-3 h-3 rounded-full transition-all duration-300
                  ${normalize(currentIndex) % items.length === idx 
                    ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50' 
                    : 'bg-gray-300 hover:bg-gray-400'
                  }
                `}
              />
            ))}
          </div>
        )}

        
      </div>

      {/* Navigation - FUERA del contenedor max-w-7xl */}
      {items.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 w-10 h-16 sm:w-12 sm:h-20 lg:w-14 lg:h-24 bg-white/90 backdrop-blur-sm hover:bg-white text-cyan-600 rounded-r-full shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-cyan-300 flex items-center justify-center z-50 pl-1"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 transition-colors" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-16 sm:w-12 sm:h-20 lg:w-14 lg:h-24 bg-white/90 backdrop-blur-sm hover:bg-white text-cyan-600 rounded-l-full shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-cyan-300 flex items-center justify-center z-50 pr-1"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 transition-colors" />
          </button>
        </>
      )}
    </section>
  );
};

export default BrandsCarousel;