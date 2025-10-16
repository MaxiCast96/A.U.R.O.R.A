import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Briefcase, CheckCircle, AlertCircle, LogOut, FileText, LayoutDashboard } from 'lucide-react';

// ========== UTILIDAD PARA OBTENER FOTO DE PERFIL (INTEGRADA) ==========
const getProfileImage = (userData) => {
  if (!userData) {
    return generateFallbackAvatar('Usuario');
  }

  // Primera prioridad: fotoPerfil (usado en empleados)
  if (userData.fotoPerfil && userData.fotoPerfil.trim()) {
    return userData.fotoPerfil;
  }
  
  // Segunda prioridad: avatar (genérico)
  if (userData.avatar && userData.avatar.trim()) {
    return userData.avatar;
  }
  
  // Tercera prioridad: foto (alternativo)
  if (userData.foto && userData.foto.trim()) {
    return userData.foto;
  }
  
  // Fallback: Generar avatar con iniciales
  const nombre = userData.nombre || userData.name || '';
  const apellido = userData.apellido || '';
  const fullName = `${nombre} ${apellido}`.trim();
  
  if (fullName) {
    return generateFallbackAvatar(fullName);
  }
  
  // Fallback final basado en rol
  const userType = userData.userType || userData.rol || 'Usuario';
  return generateFallbackAvatar(userType);
};

const generateFallbackAvatar = (name, options = {}) => {
  const {
    size = 150,
    background = '06b6d4',
    color = 'ffffff',
    bold = true,
    fontSize = 0.6
  } = options;

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=${background}&color=${color}&bold=${bold}&font-size=${fontSize}`;
};

const getInitials = (name) => {
  if (!name || name.trim() === '') return '?';
  
  const cleanName = name.trim();
  const parts = cleanName.split(' ').filter(part => part.length > 0);
  
  if (parts.length === 0) return '?';
  
  return parts.length > 1 
    ? `${parts[0][0]}${parts[1][0]}` 
    : parts[0][0];
};
// ========== FIN DE UTILIDADES ==========

const PerfilPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [errorMessage, setErrorMessage] = useState(location.state?.message || null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!user) {
      setTimeout(() => {
        navigate('/');
      }, 1800);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    try {
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/');
      }
    } catch (_) {
      navigate('/');
    }
  };

  const handleImageError = (e) => {
    setImageError(true);
    const fullName = `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Usuario';
    e.target.src = generateFallbackAvatar(fullName);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded shadow-md text-lg font-semibold">
          Debes iniciar sesión para ver tu perfil.
        </div>
      </div>
    );
  }

  // Obtener la imagen de perfil usando la utilidad integrada
  const profileImageUrl = getProfileImage(user);
  const initials = getInitials(`${user.nombre || ''} ${user.apellido || ''}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver</span>
        </button>

        {errorMessage && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm animate-fade-in">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-700 font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-600 px-8 py-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-cyan-100 to-cyan-200 border-4 border-white shadow-xl">
                    {!imageError ? (
                      <img 
                        src={profileImageUrl} 
                        alt={`${user.nombre || ''} ${user.apellido || ''}`} 
                        className="w-full h-full object-cover" 
                        onError={handleImageError}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-cyan-700 font-bold text-3xl">{initials}</span>
                      </div>
                    )}
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {user.nombre} {user.apellido}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="text-white text-lg">{user.correo}</span>
                  <span className={`px-4 py-1.5 backdrop-blur-sm text-white rounded-full text-sm font-medium border ${
                    user.rol === 'Cliente' 
                      ? 'bg-white/15 border-white/30' 
                      : 'bg-emerald-400/20 border-emerald-200/30'
                  }`}>
                    {user.rol}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="flex items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Información Personal
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</p>
                  </div>
                  <p className="text-gray-900 font-semibold text-lg">{user.nombre || '-'}</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Apellido</p>
                  </div>
                  <p className="text-gray-900 font-semibold text-lg">{user.apellido || '-'}</p>
                </div>

                <div className="md:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teléfono</p>
                  </div>
                  <p className="text-gray-900 font-semibold text-lg">{user.telefono || '-'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-6">
                <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                Información de Cuenta
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Correo Electrónico</p>
                  </div>
                  <p className="text-gray-900 font-semibold text-lg break-all">{user.correo}</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rol</p>
                  </div>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200">
                    {user.rol}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-6">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Acciones Rápidas
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/cotizaciones')}
                  className="p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-left transition-all shadow-sm hover:shadow-md group"
                >
                  <FileText className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-gray-900 font-semibold mb-1">Ver cotizaciones</p>
                  <p className="text-gray-600 text-sm">Gestionar tus cotizaciones</p>
                </button>

                {user.rol !== 'Cliente' && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="p-5 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-left transition-all shadow-sm hover:shadow-md group"
                  >
                    <LayoutDashboard className="w-6 h-6 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-gray-900 font-semibold mb-1">Dashboard Admin</p>
                    <p className="text-gray-600 text-sm">Ir al panel de administración</p>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="p-5 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 text-left transition-all shadow-sm hover:shadow-md group sm:col-span-2"
                >
                  <LogOut className="w-6 h-6 text-red-600 mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-gray-900 font-semibold mb-1">Cerrar Sesión</p>
                  <p className="text-gray-600 text-sm">Salir de tu cuenta de forma segura</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PerfilPage;