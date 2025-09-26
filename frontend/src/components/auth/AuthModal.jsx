import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from './ForgotPassword'; // Importa el componente de recuperación de contraseña
import { useAuth } from './AuthContext';
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
    if (!res.ok) return res; // devolver para que el caller maneje mensajes
    API_CONFIG.BASE_URL = base; // recordar base exitoso
    return res;
  };

  const primary = API_CONFIG.BASE_URL;
  const secondary = primary.includes('localhost')
    ? 'https://aurora-production-7e57.up.railway.app/api'
    : 'http://localhost:4000/api';

  // Primer intento
  try {
    const r = await tryOnce(primary);
    // Si fallo por red, intentamos fallback
    if (r.type === 'opaque') return r;
    return r;
  } catch (e1) {
    const msg = e1?.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ECONNREFUSED')) {
      const r2 = await tryOnce(secondary);
      return r2;
    }
    throw e1;
  }
};

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [userType, setUserType] = useState('cliente'); 
  const [backdropMouseDown, setBackdropMouseDown] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dui: '',
    telefono: '',
    calle: '',
    ciudad: '',
    departamento: '',
    email: '',
    password: ''
  });

  const { login } = useAuth();
  const [loginError, setLoginError] = useState(null);
  const [registerMsg, setRegisterMsg] = useState(null);
  const [showVerify, setShowVerify] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyMsg, setVerifyMsg] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setRegisterMsg(null);
    if (isLogin) {
      try {
        const result = await login({
          correo: formData.email.trim(),
          password: formData.password
        });
        
        if (result.success) {
          onClose();
          // Redirección según rol
          const role = result.user?.rol;
          if (role === 'Cliente') navigate('/');
          else navigate('/dashboard');
        } else {
          setLoginError(result.message);
        }
      } catch (err) {
        setLoginError('Error de red o del servidor');
      }
    } else {
      // Registro real
      try {
        const res = await fetchWithFallback(`${API_CONFIG.ENDPOINTS.REGISTRO_CLIENTES}`, {
          method: 'POST',
          body: JSON.stringify({
            nombre: formData.nombre,
            apellido: formData.apellido,
            edad: 18, // Puedes pedirlo en el formulario si lo necesitas
            dui: formData.dui,
            telefono: formData.telefono,
            correo: formData.email,
            direccion: {
              calle: formData.calle,
              ciudad: formData.ciudad,
              departamento: formData.departamento
            },
            password: formData.password
          })
        });
        const data = await res.json();
        if (!res.ok || data.message?.toLowerCase().includes('error')) {
          setRegisterMsg(data.message || 'Error al registrarse');
          return;
        }
        // Si el backend retorna un código de verificación en desarrollo, úsalo
        if (data.devVerificationCode) {
          setRegisterMsg('Registro en desarrollo: se generó un código de verificación automáticamente.');
          setShowVerify(true);
          setVerifyCode(data.devVerificationCode);
        } else {
          setRegisterMsg('Registro exitoso. Revisa tu correo para verificar tu cuenta.');
          setShowVerify(true);
        }
      } catch (err) {
        setRegisterMsg('Error de red o del servidor');
      }
    }
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
      onMouseDown={(e) => {
        // Solo considerar cierre si el mousedown inició en el backdrop (no en el contenido)
        setBackdropMouseDown(e.target === e.currentTarget);
      }}
      onClick={(e) => {
        // Cerrar solo si el clic empezó y terminó en el backdrop
        if (backdropMouseDown && e.target === e.currentTarget) {
          onClose();
        }
        // Resetear flag después del clic
        setBackdropMouseDown(false);
      }}
    >
      <div 
        className={`bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl overflow-y-auto max-h-[90vh] transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
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
        <img 
              src="https://i.imgur.com/rYfBDzN.png" 
              alt="Óptica La Inteligente" 
              className="w-27 h-14 object-contain hover:scale-105 transition-transform duration-300 hover:drop-shadow-lg"
            />
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </h2>
        </div>

        {/* Selector de tipo de usuario */}
        {/* Eliminar el bloque de botones para seleccionar tipo de usuario */}

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
        {!showVerify ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {registerMsg && !isLogin && (
              <div className={`mb-2 p-2 rounded text-center text-sm ${registerMsg.toLowerCase().includes('exitoso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{registerMsg}</div>
            )}
            {loginError && (
              <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-center text-sm">{loginError}</div>
            )}
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
                <label className="block text-sm font-medium text-gray-700">Calle</label>
                <input
                  type="text"
                  name="calle"
                  value={formData.calle}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0097c2] focus:border-[#0097c2] transition-colors"
                  placeholder="Ingresa tu calle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0097c2] focus:border-[#0097c2] transition-colors"
                  placeholder="Ingresa tu ciudad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Departamento</label>
                <input
                  type="text"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0097c2] focus:border-[#0097c2] transition-colors"
                  placeholder="Ingresa tu departamento"
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
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </form>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault();
            setVerifyMsg(null);
            try {
              const res = await fetchWithFallback(`${API_CONFIG.ENDPOINTS.REGISTRO_CLIENTES}/verifyCodeEmail`, {
                method: 'POST',
                body: JSON.stringify({ verificationCodeRequest: verifyCode })
              });
              const data = await res.json();
              if (!res.ok || data.message?.toLowerCase().includes('error')) {
                setVerifyMsg(data.message || 'Error al verificar el código');
                return;
              }
              setVerifyMsg('¡Email verificado con éxito! Ahora puedes iniciar sesión.');
              setTimeout(() => {
                setShowVerify(false);
                setIsLogin(true);
                setRegisterMsg(null);
                setVerifyMsg(null);
              }, 2000);
            } catch (err) {
              setVerifyMsg('Error de red o del servidor');
            }
          }} className="space-y-4">
            <div className="mb-2 p-2 bg-blue-100 text-blue-700 rounded text-center text-sm">
              Ingresa el código de verificación que recibiste por correo.
            </div>
            <input
              type="text"
              value={verifyCode}
              onChange={e => setVerifyCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0097c2] focus:border-[#0097c2]"
              placeholder="Código de verificación"
              required
            />
            <button type="submit" className="w-full bg-[#0097c2] text-white py-2 px-4 rounded-md hover:bg-[#0088b0] transition-all duration-300">
              Verificar Email
            </button>
            {verifyMsg && (
              <div className={`mt-2 p-2 rounded text-center text-sm ${verifyMsg.toLowerCase().includes('éxito') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{verifyMsg}</div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;