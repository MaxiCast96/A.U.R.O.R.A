// src/components/ui/Alert.jsx
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, Trash2, X } from 'lucide-react';

const Alert = ({ type = 'success', message = '', onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose && onClose();
      }, 300);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const configs = {
    success: {
      bg: 'bg-emerald-500',
      iconBg: 'bg-emerald-400',
      icon: <CheckCircle className="w-6 h-6 text-white" strokeWidth={2.5} />,
      shadow: 'rgba(16, 185, 129, 0.25)'
    },
    error: {
      bg: 'bg-rose-500',
      iconBg: 'bg-rose-400',
      icon: <AlertCircle className="w-6 h-6 text-white" strokeWidth={2.5} />,
      shadow: 'rgba(244, 63, 94, 0.25)'
    },
    info: {
      bg: 'bg-blue-500',
      iconBg: 'bg-blue-400',
      icon: <Info className="w-6 h-6 text-white" strokeWidth={2.5} />,
      shadow: 'rgba(59, 130, 246, 0.25)'
    },
    delete: {
      bg: 'bg-orange-500',
      iconBg: 'bg-orange-400',
      icon: <Trash2 className="w-6 h-6 text-white" strokeWidth={2.5} />,
      shadow: 'rgba(249, 115, 22, 0.25)'
    }
  };

  const config = configs[type] || configs.success;

  return (
    <div className="fixed top-0 left-0 right-0 flex justify-center px-4 pt-6 pointer-events-none" style={{ zIndex: 9999 }}>
      <div
        className={`pointer-events-auto relative flex items-center gap-4 px-6 py-4 rounded-2xl ${config.bg} text-white shadow-2xl transform transition-all duration-300 ease-out ${
          isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
        }`}
        style={{
          boxShadow: `0 20px 60px -12px ${config.shadow}, 0 8px 24px -8px rgba(0, 0, 0, 0.2)`,
          maxWidth: '480px',
          minWidth: '320px'
        }}
      >
        {/* Icono con fondo */}
        <div className={`flex-shrink-0 p-2 rounded-xl ${config.iconBg}`}>
          {config.icon}
        </div>
        
        {/* Mensaje */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-relaxed tracking-wide">
            {message}
          </p>
        </div>
        
        {/* Botón cerrar */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose && onClose(), 300);
          }}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/20 active:bg-white/30 transition-all duration-200 transform hover:scale-110 active:scale-95"
          aria-label="Cerrar notificación"
        >
          <X className="w-5 h-5 text-white" strokeWidth={2.5} />
        </button>

        {/* Barra de progreso */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-2xl overflow-hidden">
          <div 
            className="h-full bg-white/30 animate-shrink origin-left"
            style={{
              animation: isVisible ? 'shrink 5s linear forwards' : 'none'
            }}
          ></div>
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};

export default Alert;