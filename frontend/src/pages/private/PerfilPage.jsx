import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const PerfilPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    telefono: user?.telefono || ''
  });
  const [showLoginMsg, setShowLoginMsg] = useState(false);

  useEffect(() => {
    if (!user) {
      setShowLoginMsg(true);
      setTimeout(() => {
        navigate('/');
      }, 1800);
    }
  }, [user, navigate]);

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
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-[#0097c2] flex items-center gap-2">
          <svg className="w-8 h-8 text-[#0097c2]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Mi Perfil
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-full shadow transition flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Regresar
        </button>
      </div>
      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[#0097c2] mb-1">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition ${editMode ? 'bg-white border-[#0097c2]' : 'bg-gray-100 border-gray-200'}`}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0097c2] mb-1">Apellido</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition ${editMode ? 'bg-white border-[#0097c2]' : 'bg-gray-100 border-gray-200'}`}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0097c2] mb-1">Correo</label>
          <input
            type="email"
            value={user.correo || user.email}
            disabled
            className="w-full px-4 py-2 border rounded-lg bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0097c2] mb-1">DUI</label>
          <input
            type="text"
            value={user.dui}
            disabled
            className="w-full px-4 py-2 border rounded-lg bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0097c2] mb-1">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition ${editMode ? 'bg-white border-[#0097c2]' : 'bg-gray-100 border-gray-200'}`}
          />
        </div>
        <div className="flex gap-4 mt-6">
          {editMode ? (
            <>
              <button
                type="submit"
                className="bg-[#0097c2] hover:bg-[#0077a2] text-white px-6 py-2 rounded-full shadow transition font-semibold"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => { setEditMode(false); setFormData({ nombre: user.nombre, apellido: user.apellido, telefono: user.telefono }); }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full shadow transition font-semibold"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="bg-[#0097c2] hover:bg-[#0077a2] text-white px-6 py-2 rounded-full shadow transition font-semibold"
            >
              Editar Perfil
            </button>
          )}
          <button
            type="button"
            onClick={() => { logout(); navigate('/'); }}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full shadow transition font-semibold ml-auto"
          >
            Cerrar sesión
          </button>
        </div>
      </form>
    </div>
  );
};

export default PerfilPage; 