import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../../components/transition/PageTransition';
import Navbar from '../../components/layout/Navbar';

const RecuperarPassword = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 3) {
      if (formData.newPassword !== formData.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      
      try {
        // Aquí iría la lógica para cambiar la contraseña
        console.log('Cambiando contraseña:', formData);
        
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/'); // Simplemente navegar al home
        }, 3000);
      } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al cambiar la contraseña');
      }
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBackToLogin = () => {
    navigate('/'); // Simplemente navegar al home
  };

  if (showSuccess) {
    return (
      <PageTransition>
        <div className="fixed inset-0 flex items-center justify-center bg-white">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <svg 
                className="w-16 h-16 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              ¡Contraseña cambiada con éxito!
            </h2>
            <p className="text-gray-600">
              Serás redirigido al inicio de sesión en unos segundos...
            </p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <img src="/logo.png" alt="Logo" className="h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800">
                {step === 1 ? 'Recuperar Contraseña' : 
                 step === 2 ? 'Verificar Código' : 'Nueva Contraseña'}
              </h2>
            </div>

            {step === 1 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0097c2] focus:border-transparent transition-all"
                    placeholder="nombre@ejemplo.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0097c2] text-white py-3 rounded-xl font-medium hover:bg-[#0088b0] transition-all duration-300"
                >
                  Enviar Código
                </button>
                <button
                  type="button" // Cambiado a type="button"
                  onClick={handleBackToLogin}
                  className="w-full text-[#0097c2] py-2 font-medium hover:underline"
                >
                  Volver al inicio de sesión
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código de verificación
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0097c2] focus:border-transparent transition-all"
                    placeholder="Ingresa el código de 6 dígitos"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0097c2] text-white py-3 rounded-xl font-medium hover:bg-[#0088b0] transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Verificar Código
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0097c2] focus:border-transparent transition-all"
                    placeholder="********"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0097c2] focus:border-transparent transition-all"
                    placeholder="********"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0097c2] text-white py-3 rounded-xl font-medium hover:bg-[#0088b0] transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Cambiar Contraseña
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default RecuperarPassword;