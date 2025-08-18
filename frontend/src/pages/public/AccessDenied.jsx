import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AccessDenied = () => {
  const location = useLocation();
  const message = location.state?.message || 'No tienes permisos para acceder a esta página.';
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-5xl font-extrabold text-red-600">Acceso denegado</h1>
      <h3 className="text-2xl font-semibold text-gray-800">Error 404</h3>
      <p className="mt-4 text-lg text-gray-700">{message}</p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="px-4 py-2 rounded bg-cyan-600 text-white hover:bg-cyan-700">Ir al inicio</Link>
        <Link to="/perfil" className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Ir a mi perfil</Link>
      </div>
    </div>
  );
};

export default AccessDenied;
