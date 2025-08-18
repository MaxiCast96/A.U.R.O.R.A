import React, { useState } from 'react';
import { API_CONFIG } from '../../config/api';

// Helper fetch con fallback (localhost <-> producción)
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
    ? 'https://a-u-r-o-r-a.onrender.com/api'
    : 'http://localhost:4000/api';

  try {
    const r = await tryOnce(primary);
    return r;
  } catch (e1) {
    const msg = e1?.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ECONNREFUSED')) {
      return await tryOnce(secondary);
    }
    throw e1;
  }
};

const ForgotPassword = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
        if (!res.ok && (data.message?.toLowerCase().includes('no existe') || data.message?.toLowerCase().includes('correo'))) {
          // Si no existe en clientes, intentar en empleados
          res = await fetchWithFallback(`${API_CONFIG.ENDPOINTS.EMPLEADOS}/forgot-password`, {
            method: 'POST',
            body: JSON.stringify({ correo: normalizedEmail })
          });
          data = await res.json();
        }
        if (!res.ok) throw new Error(data.message || 'No pudimos enviar el código. Intenta de nuevo.');
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
        setSuccess(true);
        setNotice({ type: 'success', message: '¡Contraseña actualizada! Ya puedes iniciar sesión.' });
        setTimeout(() => {
          if (onClose) onClose();
        }, 2500);
      } catch (error) {
        setNotice({ type: 'error', message: error.message || 'Ocurrió un error. Intenta nuevamente.' });
      } finally {
        setLoading(false);
      }
    }
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

        {/* Notificaciones inline */}
        {notice?.message && (
          <div
            className={`mb-4 text-sm rounded-md px-3 py-2 ${
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

        {step === 1 && !success && (
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
                className="w-full bg-[#0097c2] text-white py-2 px-4 rounded-md hover:bg-[#0088b0] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Enviando…' : 'Siguiente'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && !success && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-gray-800">Verificación</h2>
            <p className="text-gray-600 text-center">
              Ingresa el código de verificación que enviamos a tu correo y tu nueva contraseña
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
                className="w-full bg-[#0097c2] text-white py-2 px-4 rounded-md hover:bg-[#0088b0] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Cambiando…' : 'Cambiar Contraseña'}
              </button>
            </form>
          </div>
        )}

        {success && (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold text-green-600">¡Contraseña cambiada!</h2>
            <p className="text-gray-700">Ahora puedes iniciar sesión con tu nueva contraseña.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;