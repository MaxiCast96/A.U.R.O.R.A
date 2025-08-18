import React from 'react';
import { X } from 'lucide-react';

const DetailModal = ({ isOpen, onClose, title, item, data = [], actions = [], children }) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 animate-slideInScale">
        
        {/* Encabezado */}
        <div className="bg-cyan-500 text-white p-5 rounded-t-xl flex justify-between items-center flex-shrink-0">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg p-2 transition-all duration-200 hover:scale-110">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Contenido */}
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
              {item.fotoPerfil ? (
                <img src={item.fotoPerfil} alt={item.nombre} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-cyan-600 font-bold text-2xl">{item.nombre?.charAt(0)}{item.apellido?.charAt(0)}</span>
              )}
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-800">{item.nombre} {item.apellido}</h4>
              <p className="text-gray-500">{item.cargo || `${item.edad} años`}</p>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            {data.map((field, index) => (
              <div key={index} className="flex flex-col sm:flex-row justify-between py-2 border-b last:border-b-0">
                <p className="font-semibold text-gray-600">{field.label}</p>
                {field.color ? (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${field.color} mt-1 sm:mt-0`}>
                    {field.value}
                  </span>
                ) : (
                  // Evitar anidar elementos de bloque dentro de <p>
                  React.isValidElement(field.value) ? (
                    <div className="text-gray-800 text-left sm:text-right break-words">{field.value}</div>
                  ) : (
                    <p className="text-gray-800 text-left sm:text-right break-words">{field.value}</p>
                  )
                )}
              </div>
            ))}
          </div>

          {/* Contenido adicional (children) */}
          {children && (
            <div className="space-y-4">
              {children}
            </div>
          )}
        </div>

        {/* Pie de página */}
        <div className="p-4 bg-gray-50 rounded-b-xl flex flex-wrap gap-2 justify-end flex-shrink-0">
          {actions && actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 ${
                action.color === 'red' ? 'bg-red-500 text-white hover:bg-red-600' :
                action.color === 'green' ? 'bg-green-500 text-white hover:bg-green-600' :
                'bg-cyan-500 text-white hover:bg-cyan-600'
              }`}
              style={action.style}
            >
              {action.icon && <span className="inline-block mr-2 align-middle">{action.icon}</span>}
              {action.label}
            </button>
          ))}
          <button onClick={onClose} className="px-5 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all duration-200 hover:scale-105">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;