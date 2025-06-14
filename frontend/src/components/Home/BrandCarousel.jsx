import React from 'react';

const BrandCarousel = ({ brands, currentSlide, onSlideChange }) => {
  return (
    <div className="relative overflow-hidden">
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        <div className="flex items-center justify-center gap-8 min-w-full">
          {brands.slice(currentSlide * 3, currentSlide * 3 + 3).map((brand) => (
            <div 
              key={brand.id}
              className="w-32 h-32 bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all flex items-center justify-center"
            >
              <img
                src={brand.image}
                alt={brand.name}
                className="w-24 h-24 object-contain transition-transform duration-300 hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: Math.ceil(brands.length / 3) }).map((_, index) => (
          <button
            key={index}
            onClick={() => onSlideChange(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === index ? 'bg-[#0097c2] w-4' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BrandCarousel;