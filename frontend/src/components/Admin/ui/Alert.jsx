// src/components/ui/Alert.jsx
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, Trash2, X } from 'lucide-react';

const Alert = ({ type = 'success', message = '', onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose && onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  let bgColor = 'bg-green-100', textColor = 'text-green-800', borderColor = 'border-green-300', icon = <CheckCircle className="w-7 h-7 text-green-500" />;
  if (type === 'error') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    borderColor = 'border-red-300';
    icon = <AlertCircle className="w-7 h-7 text-red-500" />;
  } else if (type === 'info') {
    bgColor = 'bg-blue-100';
    textColor = 'text-blue-800';
    borderColor = 'border-blue-300';
    icon = <Info className="w-7 h-7 text-blue-500" />;
  } else if (type === 'delete') {
    bgColor = 'bg-red-200';
    textColor = 'text-red-900';
    borderColor = 'border-red-400';
    icon = <Trash2 className="w-7 h-7 text-red-600" />;
  }

  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-4 rounded-xl shadow-2xl border ${bgColor} ${borderColor} ${textColor} animate-fadeInDown font-medium text-base max-w-md mx-auto`}
      style={{ boxShadow: '0 8px 32px 0 rgba(60, 60, 60, 0.18)' }}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="leading-tight" style={{ fontFamily: 'inherit', letterSpacing: '0.01em' }}>{message}</span>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Cerrar notificación"
        tabIndex={0}
      >
        <X className="w-5 h-5" />
      </button>
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown { animation: fadeInDown 0.5s cubic-bezier(.4,0,.2,1); }
      `}</style>
    </div>
  );
};

export default Alert;