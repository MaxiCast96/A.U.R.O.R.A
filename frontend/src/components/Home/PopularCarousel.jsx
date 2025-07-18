import React from 'react';

// Componente hijo que recibe TODOS los datos como props desde el padre
const PopularCarousel = ({ 
  items = [], 
  loading = false, 
  error = null, 
  currentSlide = 0, 
  onSlideChange 
}) => {
  const safeItems = Array.isArray(items) ? items.filter(item => item.image || item.imagen) : [];
  
  // Mostrar estados de carga y error
  if (loading) {
    return (
      <section className="w-full bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-8">Cargando productos populares...</div>
        </div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="w-full bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-8 text-red-500">Error al cargar productos: {error}</div>
        </div>
      </section>
    );
  }
  
  if (safeItems.length === 0) {
    return (
      <section className="w-full bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-8 text-black">No se encontraron productos populares.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
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
                    src={item.image || item.imagen}
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
      </div>
    </section>
  );
};

export default PopularCarousel; 