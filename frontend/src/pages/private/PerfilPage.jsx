import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Building, Calendar, Edit2, Save, Camera, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    direccion: '',
    sucursal: '',
    fotoPerfil: '',
    // Para empleados
    cargo: '',
    fechaIngreso: '',
    // Para cambio de contraseña
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Inicializar datos del formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        correo: user.correo || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        sucursal: user.sucursal || '',
        fotoPerfil: user.fotoPerfil || '',
        cargo: user.cargo || '',
        fechaIngreso: user.fechaIngreso || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setEditMode(false);
      setShowPasswordChange(false);
      setMessage({ type: '', text: '' });
    }
  }, [isOpen, user]);

  // Función para obtener la imagen de perfil con fallbacks
  const getProfileImage = (userData) => {
    if (userData?.fotoPerfil && userData.fotoPerfil.trim()) {
      return userData.fotoPerfil;
    }
    
    if (userData?.avatar && userData.avatar.trim()) {
      return userData.avatar;
    }
    
    const nombre = userData?.nombre || '';
    const apellido = userData?.apellido || '';
    const fullName = `${nombre} ${apellido}`.trim();
    
    if (fullName) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=200&background=06b6d4&color=ffffff&bold=true&font-size=0.6`;
    }
    
    const userType = userData?.rol || 'Usuario';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userType)}&size=200&background=64748b&color=ffffff&bold=true&font-size=0.6`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // En un caso real, aquí subirías la imagen a tu servidor
      // Por ahora, creamos una URL local
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        fotoPerfil: imageUrl
      }));
      setMessage({ type: 'info', text: 'Imagen cargada. Recuerda guardar los cambios.' });
    }
  };

  const validatePasswordChange = () => {
    if (!formData.currentPassword) {
      setMessage({ type: 'error', text: 'Ingresa tu contraseña actual' });
      return false;
    }
    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Validar cambio de contraseña si está activo
      if (showPasswordChange && !validatePasswordChange()) {
        setSaving(false);
        return;
      }

      // Simular guardado (en un caso real, harías una petición al servidor)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar el usuario en el contexto
      const updatedUser = {
        ...user,
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        direccion: formData.direccion,
        fotoPerfil: formData.fotoPerfil
      };

      setUser(updatedUser);
      
      // Actualizar en localStorage si existe
      try {
        localStorage.setItem('aurora_user', JSON.stringify(updatedUser));
      } catch (error) {
        console.warn('No se pudo actualizar localStorage:', error);
      }

      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      setEditMode(false);
      setShowPasswordChange(false);
      
      // Limpiar campos de contraseña
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6" />
              <h2 className="text-xl font-bold">Mi Perfil</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
          <form onSubmit={handleSave} className="p-6">
            {/* Mensaje de estado */}
            {message.text && (
              <div className={`mb-4 p-3 rounded-lg ${
                message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
                message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' :
                'bg-blue-100 text-blue-700 border border-blue-300'
              }`}>
                {message.text}
              </div>
            )}

            {/* Foto de perfil */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img
                  src={getProfileImage({ ...user, fotoPerfil: formData.fotoPerfil })}
                  alt="Foto de perfil"
                  className="w-24 h-24 rounded-full object-cover border-4 border-cyan-200 shadow-lg"
                  onError={(e) => {
                    const fallbackName = `${formData.nombre} ${formData.apellido}`.trim() || 'Usuario';
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&size=200&background=06b6d4&color=ffffff&bold=true&font-size=0.6`;
                  }}
                />
                {editMode && (
                  <label className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-gray-800">
                {formData.nombre} {formData.apellido}
              </h3>
              <p className="text-sm text-gray-500">{user?.rol || 'Usuario'}</p>
            </div>

            {/* Información personal */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800">Información Personal</h4>
                {!editMode ? (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded-lg font-medium disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Guardando...' : 'Guardar'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setShowPasswordChange(false);
                        setMessage({ type: '', text: '' });
                      }}
                      className="px-3 py-1 text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <p className="py-2 px-3 bg-gray-50 rounded-lg">{user?.nombre || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <p className="py-2 px-3 bg-gray-50 rounded-lg">{user?.apellido || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                  <div className="flex items-center py-2 px-3 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{user?.correo || 'No especificado'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  {editMode ? (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center py-2 px-3 bg-gray-50 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">{user?.telefono || 'No especificado'}</span>
                    </div>
                  )}
                </div>

                {/* Campos adicionales para empleados */}
                {user?.rol !== 'Cliente' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                      <div className="flex items-center py-2 px-3 bg-gray-50 rounded-lg">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{user?.cargo || user?.rol || 'No especificado'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal</label>
                      <div className="flex items-center py-2 px-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{user?.sucursal || 'No especificado'}</span>
                      </div>
                    </div>

                    {user?.fechaIngreso && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de ingreso</label>
                        <div className="flex items-center py-2 px-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{new Date(user.fechaIngreso).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Sección de cambio de contraseña */}
              {editMode && (
                <div className="border-t pt-4 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">Seguridad</h4>
                    <button
                      type="button"
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      className="text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      {showPasswordChange ? 'Cancelar cambio' : 'Cambiar contraseña'}
                    </button>
                  </div>

                  {showPasswordChange && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required={showPasswordChange}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          >
                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required={showPasswordChange}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          >
                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required={showPasswordChange}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;