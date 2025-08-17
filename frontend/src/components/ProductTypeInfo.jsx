import React from 'react';

const ProductTypeInfo = ({ type }) => {
  const getTypeInfo = () => {
    switch (type) {
      case 'lentes':
        return {
          title: '👓 Lentes de Calidad',
          description: 'Descubre nuestra amplia selección de lentes con la mejor tecnología óptica',
          features: [
            'Lentes graduados y de sol',
            'Materiales premium y resistentes',
            'Diseños modernos y clásicos',
            'Garantía de calidad'
          ],
          tips: [
            'Consulta con nuestro optometrista para la graduación correcta',
            'Considera el material según tu estilo de vida',
            'Elige el color que mejor se adapte a tu personalidad'
          ]
        };
      
      case 'accesorios':
        return {
          title: '👜 Accesorios Esenciales',
          description: 'Completa tu look con accesorios de alta calidad para el cuidado de tus lentes',
          features: [
            'Estuches protectores',
            'Paños de limpieza especializados',
            'Cadenas y cordones',
            'Repuestos y mantenimiento'
          ],
          tips: [
            'Limpia tus lentes regularmente para mantener la claridad',
            'Guarda tus lentes en un estuche protector',
            'Usa paños especializados para evitar rayones'
          ]
        };
      
      
      
      default:
        return {
          title: '🛍️ Todos Nuestros Productos',
          description: 'Explora nuestra completa colección de productos ópticos',
          features: [
            'Amplia variedad de opciones',
            'Calidad garantizada',
            'Precios competitivos',
            'Servicio personalizado'
          ],
          tips: [
            'Usa los filtros para encontrar lo que buscas',
            'Compara productos antes de decidir',
            'No dudes en contactarnos para asesoría'
          ]
        };
    }
  };

  const info = getTypeInfo();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{info.title}</h3>
        <p className="text-gray-600">{info.description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Características */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span className="text-[#0097c2] mr-2">✓</span>
            Características Principales
          </h4>
          <ul className="space-y-2">
            {info.features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-500 text-sm mt-1">•</span>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Consejos */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span className="text-[#0097c2] mr-2">💡</span>
            Consejos Útiles
          </h4>
          <ul className="space-y-2">
            {info.tips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-500 text-sm mt-1">•</span>
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Call to action */}
      <div className="mt-6 text-center">
        <div className="bg-gradient-to-r from-[#0097c2] to-[#00b4e4] text-white p-4 rounded-lg">
          <p className="font-semibold mb-2">¿Necesitas ayuda para elegir?</p>
          <p className="text-sm opacity-90">
            Nuestros expertos están aquí para asesorarte en la selección perfecta
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductTypeInfo;
