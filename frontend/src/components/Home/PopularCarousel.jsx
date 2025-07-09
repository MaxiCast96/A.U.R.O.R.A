import React from 'react';

const PopularCarousel = ({ items, currentSlide, onSlideChange }) => {
  const safeItems = Array.isArray(items) ? items : [];
  return (
    <div className="relative overflow-hidden bg-[#0097c2] rounded-2xl p-8">
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        <div className="flex items-center justify-center gap-8 min-w-full">
          {safeItems.slice(currentSlide * 3, currentSlide * 3 + 3).map((item, idx) => (
            <div 
              key={item.id || idx}
              className="w-40 h-40 bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
            >
              <img
                src={item.image || item.imagen || ''}
                alt={`Popular ${item.id || idx}`}
                className="w-32 h-32 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: Math.ceil(safeItems.length / 3) }).map((_, index) => (
          <button
            key={index}
            onClick={() => onSlideChange(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === index ? 'bg-white w-4' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PopularCarousel;