import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-6xl font-extrabold text-cyan-600">404</h1>
      <p className="mt-4 text-2xl font-semibold text-gray-800">Página no encontrada</p>
      <p className="mt-2 text-gray-500">No existe la ruta: <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code></p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="px-4 py-2 rounded bg-cyan-600 text-white hover:bg-cyan-700">Ir al inicio</Link>
        <Link to="/productos" className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Ver productos</Link>
      </div>
    </div>
  );
};

export default NotFound;
