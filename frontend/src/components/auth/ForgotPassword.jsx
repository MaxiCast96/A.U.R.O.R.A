import React, { useState } from 'react';

const ForgotPassword = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para cada paso
    setStep(step + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
        <img 
              src="https://i.imgur.com/rYfBDzN.png" 
              alt="Óptica La Inteligente" 
              className="w-27 h-14 object-contain hover:scale-105 transition-transform duration-300 hover:drop-shadow-lg"
            />
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-gray-800">Olvidé mi contraseña</h2>
            <p className="text-gray-600 text-center">
              Ingresa tu correo electrónico y te enviaremos un código de verificación
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0097c2] focus:border-[#0097c2]"
                  placeholder="nombre@ejemplo.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#0097c2] text-white py-2 px-4 rounded-md hover:bg-[#0088b0] transition-all duration-300"
              >
                Siguiente
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-gray-800">Verificación</h2>
            <p className="text-gray-600 text-center">
              Ingresa el código de verificación que enviamos a tu correo
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Código de verificación</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0097c2] focus:border-[#0097c2]"
                  placeholder="Ingresa el código"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#0097c2] text-white py-2 px-4 rounded-md hover:bg-[#0088b0] transition-all duration-300"
              >
                Verificar
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-gray-800">Nueva Contraseña</h2>
            <p className="text-gray-600 text-center">
              Ingresa tu nueva contraseña
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0097c2] focus:border-[#0097c2]"
                  placeholder="********"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0097c2] focus:border-[#0097c2]"
                  placeholder="********"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#0097c2] text-white py-2 px-4 rounded-md hover:bg-[#0088b0] transition-all duration-300"
              >
                Cambiar Contraseña
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;