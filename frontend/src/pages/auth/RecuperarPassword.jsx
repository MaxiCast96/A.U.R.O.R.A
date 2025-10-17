import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_CONFIG } from '../../config/api';

// Helper fetch con fallback
const fetchWithFallback = async (path, options = {}) => {
  const buildUrl = (base) => `${base}${path}`;
  const tryOnce = async (base) => {
    const res = await fetch(buildUrl(base), {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    if (!res.ok) return res;
    API_CONFIG.BASE_URL = base;
    return res;
  };

  const primary = API_CONFIG.BASE_URL;
  const secondary = primary.includes('localhost')
    ? 'https://aurora-production-7e57.up.railway.app/api'
    : 'http://localhost:4000/api';

  try {
    let r = await tryOnce(primary);
    // Si la respuesta del primario es 5xx y estamos en dev, probar el secundario
    if (r && r.status >= 500 && !import.meta.env.PROD) {
      r = await tryOnce(secondary);
      return r;
    }
    return r;
  } catch (e1) {
    const msg = e1?.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ECONNREFUSED')) {
      return await tryOnce(secondary);
    }
    throw e1;
  }
};

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
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ type: 'info', message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = (formData.email || '').trim().toLowerCase();

    if (step === 1) {
      setLoading(true);
      try {
        // Intentar en clientes
        let res = await fetchWithFallback(`${API_CONFIG.ENDPOINTS.CLIENTES}/forgot-password`, {
          method: 'POST',
          body: JSON.stringify({ correo: normalizedEmail })
        });
        let data = await res.json();
        if (!res.ok && data.message?.toLowerCase().includes('no existe')) {
          // Si no existe en clientes, intentar en empleados
          res = await fetchWithFallback(`${API_CONFIG.ENDPOINTS.EMPLEADOS}/forgot-password`, {
            method: 'POST',
            body: JSON.stringify({ correo: normalizedEmail })
          });
          data = await res.json();
        }
        if (!res.ok) throw new Error(data.message || 'No pudimos enviar el código. Intenta nuevamente.');
        setNotice({ type: 'success', message: 'Te enviamos un código de verificación. Revisa tu bandeja de entrada o spam.' });
        setStep(2);
      } catch (error) {
        setNotice({ type: 'error', message: error.message || 'Ocurrió un error. Intenta nuevamente.' });
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      if (formData.newPassword !== formData.confirmPassword) {
        setNotice({ type: 'warning', message: 'Las contraseñas no coinciden.' });
        return;
      }
      setLoading(true);
      try {
        // Intentar en clientes
        let res = await fetchWithFallback(`${API_CONFIG.ENDPOINTS.CLIENTES}/reset-password`, {
          method: 'POST',
          body: JSON.stringify({
            correo: normalizedEmail,
            code: formData.code,
            newPassword: formData.newPassword
          })
        });
        let data = await res.json();
        if (!res.ok && data.message?.toLowerCase().includes('correo')) {
          // Si no existe en clientes, intentar en empleados
          res = await fetchWithFallback(`${API_CONFIG.ENDPOINTS.EMPLEADOS}/reset-password`, {
            method: 'POST',
            body: JSON.stringify({
              correo: normalizedEmail,
              code: formData.code,
              newPassword: formData.newPassword
            })
          });
          data = await res.json();
        }
        if (!res.ok) throw new Error(data.message || 'No pudimos cambiar tu contraseña. Intenta nuevamente.');
        setShowSuccess(true);
        setNotice({ type: 'success', message: '¡Contraseña actualizada! Redirigiendo…' });
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        setNotice({ type: 'error', message: error.message || 'Ocurrió un error. Intenta nuevamente.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
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
            {/* Notificaciones inline */}
            {notice?.message && (
              <div
                className={`mb-6 text-sm rounded-md px-3 py-2 ${
                  notice.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                  notice.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                  notice.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
                role="status"
                aria-live="polite"
              >
                {notice.message}
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-800">
              ¡Contraseña cambiada con éxito!
            </h2>
            <p className="text-gray-600">
              Serás redirigido al inicio de sesión en unos segundos…
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
            <div className="text-center mb-8">
              <img 
                src="https://i.imgur.com/rYfBDzN.png" 
                alt="Óptica La Inteligente" 
                className="w-27 h-14 object-contain hover:scale-105 transition-transform duration-300 hover:drop-shadow-lg"
              />
              <h2 className="text-3xl font-bold text-gray-800">
                {step === 1 ? 'Recuperar Contraseña' : 'Nueva Contraseña'}
              </h2>
            </div>

            {/* Notificaciones inline */}
            {notice?.message && (
              <div
                className={`mb-6 text-sm rounded-md px-3 py-2 ${
                  notice.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                  notice.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                  notice.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
                role="status"
                aria-live="polite"
              >
                {notice.message}
              </div>
            )}

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
                  className="w-full bg-[#0097c2] text-white py-3 rounded-xl font-medium hover:bg-[#0088b0] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Código'}
                </button>
                <button
                  type="button"
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
                  className="w-full bg-[#0097c2] text-white py-3 rounded-xl font-medium hover:bg-[#0088b0] transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
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