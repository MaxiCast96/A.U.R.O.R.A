import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const PerfilPage = () => {
  const { user, setUser, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    telefono: user?.telefono || ''
  });
  const [showLoginMsg, setShowLoginMsg] = useState(false);
  const [errorMessage, setErrorMessage] = useState(location.state?.message || null);
  const [savedMsg, setSavedMsg] = useState(null);

  useEffect(() => {
    if (!user) {
      setShowLoginMsg(true);
      setTimeout(() => {
        navigate('/');
      }, 1800);
    }
  }, [user, navigate]);

  // Limpiar mensaje de error después de 5 segundos
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded shadow-md text-lg font-semibold">
          Debes iniciar sesión para ver tu perfil.
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...user,
      nombre: formData.nombre,
      apellido: formData.apellido,
      telefono: formData.telefono,
    };
    setUser(updated);
    try {
      localStorage.setItem('aurora_user', JSON.stringify(updated));
    } catch (_) {}
    setEditMode(false);
    setSavedMsg('Cambios guardados correctamente.');
    setTimeout(() => setSavedMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-2 rounded-md transition"
            >
              <span className="text-lg">←</span>
              <span className="text-sm font-medium">Volver</span>
            </button>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
              {user.nombre?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-white text-2xl sm:text-3xl font-bold leading-tight">
                {user.nombre} {user.apellido}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-white/90 text-sm sm:text-base">{user.correo}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ml-2 ${
                  user.rol === 'Cliente' ? 'bg-white/15 text-white' : 'bg-emerald-400/20 text-emerald-100'
                }`}>
                  {user.rol}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex bg-white text-blue-600 font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 pb-10">
        {/* Global alerts */}
        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded">
            {errorMessage}
          </div>
        )}
        {savedMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded">
            {savedMsg}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-6">
            {/* Personal info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Información Personal</h3>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    Editar
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleSave} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Apellido</label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-3 flex flex-col sm:flex-row gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      Guardar cambios
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="bg-slate-100 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-200 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-md border border-slate-100 bg-slate-50">
                    <p className="text-xs text-slate-500">Nombre</p>
                    <p className="text-slate-800 font-medium">{user.nombre || '-'}</p>
                  </div>
                  <div className="p-3 rounded-md border border-slate-100 bg-slate-50">
                    <p className="text-xs text-slate-500">Apellido</p>
                    <p className="text-slate-800 font-medium">{user.apellido || '-'}</p>
                  </div>
                  <div className="p-3 rounded-md border border-slate-100 bg-slate-50">
                    <p className="text-xs text-slate-500">Teléfono</p>
                    <p className="text-slate-800 font-medium">{user.telefono || '-'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Acciones rápidas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/cotizaciones')}
                  className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-left transition"
                >
                  <p className="text-slate-800 font-medium">Ver cotizaciones</p>
                  <p className="text-slate-500 text-sm">Gestionar tus cotizaciones</p>
                </button>
                {user.rol !== 'Cliente' && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="p-4 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-left transition"
                  >
                    <p className="text-slate-800 font-medium">Dashboard Admin</p>
                    <p className="text-slate-500 text-sm">Ir al panel de administración</p>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilPage; 