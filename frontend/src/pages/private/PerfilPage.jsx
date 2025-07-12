import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const PerfilPage = () => {
  const { user, logout } = useAuth();
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
    user.nombre = formData.nombre;
    user.apellido = formData.apellido;
    user.telefono = formData.telefono;
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Mensaje de error */}
        {errorMessage && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            {errorMessage}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
              {user.nombre?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {user.nombre} {user.apellido}
              </h2>
              <p className="text-gray-600">{user.correo}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                user.rol === 'Cliente' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user.rol}
              </span>
            </div>
          </div>

          {/* Información detallada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h3>
              {editMode ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido</label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Nombre:</span>
                    <p className="text-gray-800">{user.nombre}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Apellido:</span>
                    <p className="text-gray-800">{user.apellido}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Teléfono:</span>
                    <p className="text-gray-800">{user.telefono}</p>
                  </div>
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Editar Información
                  </button>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Accesos Disponibles</h3>
              <div className="space-y-3">
                {user.rol === 'Cliente' ? (
                  <>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
                        ✓
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">Cotizaciones</p>
                        <p className="text-sm text-blue-600">Crear y ver cotizaciones</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg opacity-50">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm mr-3">
                        ✗
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Dashboard Admin</p>
                        <p className="text-sm text-gray-500">Solo para empleados</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
                        ✓
                      </div>
                      <div>
                        <p className="font-medium text-green-800">Dashboard Admin</p>
                        <p className="text-sm text-green-600">Acceso completo al sistema</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
                        ✓
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">Cotizaciones</p>
                        <p className="text-sm text-blue-600">Crear y ver cotizaciones</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/cotizaciones')}
              className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
            >
              <h4 className="font-medium text-blue-800">Ver Cotizaciones</h4>
              <p className="text-sm text-gray-600">Gestionar tus cotizaciones</p>
            </button>
            
            {user.rol !== 'Cliente' && (
              <button
                onClick={() => navigate('/dashboard')}
                className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left"
              >
                <h4 className="font-medium text-green-800">Dashboard Admin</h4>
                <p className="text-sm text-gray-600">Acceder al panel de administración</p>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilPage; 