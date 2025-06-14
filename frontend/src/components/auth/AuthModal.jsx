import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from './ForgotPassword'; // Importa el componente de recuperación de contraseña

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dui: '',
    telefono: '',
    direccion: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotPassword = () => {
    onClose();
    navigate('/recuperar-password');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí irá la lógica de autenticación
    console.log('Form data:', formData);
  };

  if (!isOpen) return null;

  if (showForgotPassword) {
    return <ForgotPassword onClose={() => setShowForgotPassword(false)} />;
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'bg-black/30 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl overflow-y-auto max-h-[90vh] transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button - Updated hitbox and positioning */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
          aria-label="Cerrar modal"
        >
          <svg 
            className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Logo and Title */}
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Logo" className="h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </h2>
        </div>

        {/* Toggle buttons */}
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 transition-all duration-300 ${
              isLogin ? 'text-[#0097c2] border-b-2 border-[#0097c2]' : 'text-gray-500 hover:text-[#0097c2]'
            }`}
            onClick={() => setIsLogin(true)}
          >
            Iniciar Sesión
          </button>
          <button
            className={`flex-1 py-2 transition-all duration-300 ${
              !isLogin ? 'text-[#0097c2] border-b-2 border-[#0097c2]' : 'text-gray-500 hover:text-[#0097c2]'
            }`}
            onClick={() => setIsLogin(false)}
          >
            Registrarse
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`space-y-4 transition-all duration-300 ${
            !isLogin ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0 overflow-hidden'
          }`}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0097c2] focus:border-[#0097c2] transition-colors"
                placeholder="Ingresa tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0097c2] focus:border-[#0097c2] transition-colors"
                placeholder="Ingresa tu apellido"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">DUI</label>
              <input
                type="text"
                name="dui"
                value={formData.dui}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0097c2] focus:border-[#0097c2] transition-colors"
                placeholder="00000000-0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0097c2] focus:border-[#0097c2] transition-colors"
                placeholder="0000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0097c2] focus:border-[#0097c2] transition-colors"
                placeholder="Ingresa tu dirección"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0097c2] focus:border-[#0097c2] transition-colors"
              placeholder="nombre@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0097c2] focus:border-[#0097c2] transition-colors"
              placeholder="********"
            />
          </div>
          {isLogin && (
            <div className="text-right">
              <button 
                onClick={handleForgotPassword}
                className="text-sm text-[#0097c2] hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-[#0097c2] text-white py-2 px-4 rounded-md hover:bg-[#0088b0] transition-all duration-300 transform hover:scale-[1.02]"
          >
            {isLogin ? 'Iniciar Sesión' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;