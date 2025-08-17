import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import PageTransition from "../../components/transition/PageTransition.jsx";
import Navbar from "../../components/layout/Navbar";
import useData from '../../hooks/useData';
import { useAuth } from '../../components/auth/AuthContext';
import API_CONFIG, { buildApiUrl } from '../../config/api';

const Cotizaciones = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [showLoginMsg, setShowLoginMsg] = useState(false);
  // Mover TODOS los hooks al tope del componente para respetar las reglas de hooks
  const { data: cotizaciones, loading, error } = useData('cotizaciones');
  const [cotizacionesState, setCotizacionesState] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, id: null });
  const [convertingId, setConvertingId] = useState(null);
  
  useEffect(() => {
    if (!user) {
      setShowLoginMsg(true);
    }
  }, [user]);
  
  if (!user) {
    return (
      <PageTransition>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded shadow-md text-lg font-semibold">
            Debes iniciar sesión para ver cotizaciones.
          </div>
        </div>
        <footer className="bg-gradient-to-r from-[#0097c2] to-[#00b4e4] text-white mt-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-4 py-12">
              <div className="md:col-span-4 space-y-4">
                <div className="flex items-center space-x-3">
                <img 
              src="https://i.imgur.com/rYfBDzN.png" 
              alt="Óptica La Inteligente" 
              className="w-27 h-14 object-contain hover:scale-105 transition-transform duration-300 hover:drop-shadow-lg"
            />
                  <h2 className="text-xl font-bold">Óptica La Inteligente</h2>
                </div>
                <p className="text-sm text-gray-100">
                  Comprometidos con tu Salud Visual desde 2010. Ofrecemos Servicios Profesionales y Productos de Alta Calidad para el Cuidado de tus Ojos.
                </p>
                <div className="flex space-x-4 mt-4">
                  <a href="https://facebook.com" className="hover:text-gray-200 transition-colors p-2 bg-white/10 rounded-full" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
                  <a href="https://instagram.com" className="hover:text-gray-200 transition-colors p-2 bg-white/10 rounded-full" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
                  <a href="https://wa.me/1234567890" className="hover:text-gray-200 transition-colors p-2 bg-white/10 rounded-full" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp"></i></a>
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-semibold text-lg mb-4">Servicios</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/servicios" className="hover:text-gray-200 transition-colors flex items-center"><span className="mr-2">→</span>Examen Visual</a></li>
                  <li><a href="/servicios" className="hover:text-gray-200 transition-colors flex items-center"><span className="mr-2">→</span>Adaptación de Lentes</a></li>
                  <li><a href="/servicios" className="hover:text-gray-200 transition-colors flex items-center"><span className="mr-2">→</span>Reparaciones</a></li>
                </ul>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-semibold text-lg mb-4">Compañía</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/nosotros" className="hover:text-gray-200 transition-colors flex items-center"><span className="mr-2">→</span>Sobre Nosotros</a></li>
                  <li><a href="/nosotros" className="hover:text-gray-200 transition-colors flex items-center"><span className="mr-2">→</span>Historia</a></li>
                  <li><a href="/nosotros" className="hover:text-gray-200 transition-colors flex items-center"><span className="mr-2">→</span>Misión y Visión</a></li>
                </ul>
              </div>
              <div className="md:col-span-4">
                <h3 className="font-semibold text-lg mb-4">Contacto</h3>
                <div className="space-y-4 text-sm">
                  <p className="flex items-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>123 Calle Principal, San Salvador</p>
                  <p className="flex items-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>+503 1234-5678</p>
                  <p className="flex items-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>info@opticalainteligente.com</p>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10">
              <div className="px-4 py-6 text-sm text-center">
                <p>© {new Date().getFullYear()} Óptica La Inteligente. Todos los Derechos Reservados.</p>
              </div>
            </div>
          </div>
        </footer>
      </PageTransition>
    );
  }
  // Handler para eliminar cotización
  const handleEliminarCotizacion = (id) => {
    setModalEliminar({ abierto: true, id });
  };

  const confirmarEliminarCotizacion = async () => {
    const id = modalEliminar.id;
    try {
      const res = await fetch(`https://a-u-r-o-r-a.onrender.com/api/cotizaciones/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje('Cotización eliminada exitosamente.');
        if (cotizacionesState) {
          setCotizacionesState(cotizacionesState.filter(c => c._id !== id));
        } else if (cotizaciones) {
          setCotizacionesState(cotizaciones.filter(c => c._id !== id));
        }
      } else {
        setMensaje(data.message || 'Error al eliminar la cotización.');
      }
    } catch (err) {
      setMensaje('Error al eliminar la cotización.');
    }
    setModalEliminar({ abierto: false, id: null });
    setTimeout(() => setMensaje(null), 3000);
  };

  const cancelarEliminarCotizacion = () => {
    setModalEliminar({ abierto: false, id: null });
  };

  // Convertir a pedido desde listado público
  const handleConvertirCotizacion = async (id) => {
    try {
      setConvertingId(id);
      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.COTIZACIONES}/${id}/convertir-a-pedido`);
      const res = await fetch(url, {
        method: 'POST',
        credentials: API_CONFIG.FETCH_CONFIG.credentials,
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMensaje(data?.message || 'No se pudo convertir la cotización.');
      } else {
        setMensaje('Cotización convertida en pedido correctamente.');
        // Refrescar estado local marcando como convertida
        const base = cotizacionesState || cotizaciones || [];
        const updated = base.map(c => c._id === id ? { ...c, estado: 'convertida' } : c);
        setCotizacionesState(updated);
      }
    } catch (err) {
      setMensaje('Error al convertir la cotización.');
    } finally {
      setConvertingId(null);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  return (
    <PageTransition>
      <Navbar />
      <div className="container mx-auto px-2 sm:px-4 py-8 font-['Lato']">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800">Cotizaciones</h1>

        {/* Buscar Cotización */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Buscar Cotización</h2>
          <form className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              placeholder="Ingrese el número de cotización"
              className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all text-sm sm:text-base"
            />
            <button
              type="submit"
              className="bg-[#0097c2] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#0077a2] transition-all shadow-sm text-sm sm:text-base"
            >
              Buscar
            </button>
          </form>
          {cotizaciones && cotizaciones.length === 0 && !loading && !error && (
            <div className="text-center text-gray-500 mt-4">No hay cotizaciones disponibles actualmente.</div>
          )}
        </div>

        {/* Nueva Cotización */}
        <div className="mb-8">
          <Link
            to="/cotizaciones/crear"
            className="inline-block bg-[#0097c2] text-white px-6 py-2 rounded-lg hover:bg-[#0077a2] transition-all shadow-sm"
          >
            Nueva Cotización
          </Link>
        </div>

        {/* Listado de Cotizaciones */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <h2 className="text-xl font-semibold p-6 text-gray-800">Listado de Cotizaciones</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm md:text-base">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-4">Cargando...</td></tr>
                ) : error ? (
                  <tr><td colSpan={4} className="text-center py-4 text-red-500">Error: {error}</td></tr>
                ) : cotizaciones && cotizaciones.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-4">No hay cotizaciones disponibles actualmente.</td></tr>
                ) : (cotizacionesState || cotizaciones) && (cotizacionesState || cotizaciones).length > 0 ? (
                  (cotizacionesState || cotizaciones).map((cot) => (
                    <tr key={cot._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700">{cot.numero || (cot._id ? `COT-${String(cot._id).slice(-6).toUpperCase()}` : '-')}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{cot.fecha ? new Date(cot.fecha).toLocaleString() : '-'}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                          {cot.estado || 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-4">
                          <Link
                            to={`/cotizaciones/${cot._id}`}
                            className="flex items-center text-[#0097c2] hover:text-[#0077a2] transition-colors"
                          >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Ver</span>
                          </Link>
                          <Link
                            to={`/cotizaciones/${cot._id}?print=1`}
                            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Descargar</span>
                          </Link>
                          {(!cot.estado || cot.estado !== 'convertida') && (
                            <button
                              onClick={() => handleConvertirCotizacion(cot._id)}
                              disabled={convertingId === cot._id}
                              className={`flex items-center ${convertingId === cot._id ? 'text-gray-400' : 'text-green-600 hover:text-green-800'} transition-colors`}
                            >
                              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>{convertingId === cot._id ? 'Convirtiendo...' : 'Convertir a pedido'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleEliminarCotizacion(cot._id)}
                            className="flex items-center text-red-600 hover:text-red-800 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#0097c2] to-[#00b4e4] text-white mt-10 text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto px-2 sm:px-4">
            {/* Top Footer with main content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-8 px-0 sm:px-4 py-8 sm:py-12">
              {/* Logo and description column */}
              <div className="md:col-span-4 space-y-4">
                <div className="flex items-center space-x-3">
                <img 
              src="https://i.imgur.com/rYfBDzN.png" 
              alt="Óptica La Inteligente" 
              className="w-27 h-14 object-contain hover:scale-105 transition-transform duration-300 hover:drop-shadow-lg"
            />
                  <h2 className="text-xl font-bold">Óptica La Inteligente</h2>
                </div>
                <p className="text-sm text-gray-100">
                  Comprometidos con tu Salud Visual desde 2010. Ofrecemos
                  Servicios Profesionales y Productos de Alta Calidad para el
                  Cuidado de tus Ojos.
                </p>
                <div className="flex space-x-4 mt-4">
                  <a
                    href="https://facebook.com"
                    className="hover:text-gray-200 transition-colors p-2 bg-white/10 rounded-full"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a
                    href="https://instagram.com"
                    className="hover:text-gray-200 transition-colors p-2 bg-white/10 rounded-full"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a
                    href="https://wa.me/1234567890"
                    className="hover:text-gray-200 transition-colors p-2 bg-white/10 rounded-full"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-whatsapp"></i>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="md:col-span-2">
                <h3 className="font-semibold text-lg mb-4">Servicios</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="/servicios"
                      className="hover:text-gray-200 transition-colors flex items-center"
                    >
                      <span className="mr-2">→</span>
                      Examen Visual
                    </a>
                  </li>
                  <li>
                    <a
                      href="/servicios"
                      className="hover:text-gray-200 transition-colors flex items-center"
                    >
                      <span className="mr-2">→</span>
                      Adaptación de Lentes
                    </a>
                  </li>
                  <li>
                    <a
                      href="/servicios"
                      className="hover:text-gray-200 transition-colors flex items-center"
                    >
                      <span className="mr-2">→</span>
                      Reparaciones
                    </a>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div className="md:col-span-2">
                <h3 className="font-semibold text-lg mb-4">Compañía</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="/nosotros"
                      className="hover:text-gray-200 transition-colors flex items-center"
                    >
                      <span className="mr-2">→</span>
                      Sobre Nosotros
                    </a>
                  </li>
                  <li>
                    <a
                      href="/nosotros"
                      className="hover:text-gray-200 transition-colors flex items-center"
                    >
                      <span className="mr-2">→</span>
                      Historia
                    </a>
                  </li>
                  <li>
                    <a
                      href="/nosotros"
                      className="hover:text-gray-200 transition-colors flex items-center"
                    >
                      <span className="mr-2">→</span>
                      Misión y Visión
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div className="md:col-span-4">
                <h3 className="font-semibold text-lg mb-4">Contacto</h3>
                <div className="space-y-4 text-sm">
                  <p className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    123 Calle Principal, San Salvador
                  </p>
                  <p className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    +503 1234-5678
                  </p>
                  <p className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    info@opticalainteligente.com
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-white/10">
              <div className="px-4 py-6 text-sm text-center">
                <p>
                  © {new Date().getFullYear()} Óptica La Inteligente. Todos los
                  Derechos Reservados.
                </p>
              </div>
            </div>
          </div>
        </footer>

        {mensaje && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded shadow-lg z-50">
            {mensaje}
          </div>
        )}

        {modalEliminar.abierto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Confirmar Eliminación</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar esta cotización? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelarEliminarCotizacion}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminarCotizacion}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
    </PageTransition>
  );
}

export default Cotizaciones;
