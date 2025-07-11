import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthModal from "../auth/AuthModal";
import { useAuth } from '../auth/AuthContext';
import { Menu, X } from 'lucide-react';

const Navbar = ({ onOpenAuth }) => {
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { user } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsProductMenuOpen(false);
  };

  return (
    <>
      {/* Barra superior - Solo se muestra en Home */}
      {isHome && (
        <div className="bg-[#0097c2] text-white text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4 flex flex-col md:flex-row justify-center items-center">
          <span>Envío gratis en compras mayores a $1000</span>
          <a href="/promociones" className="ml-1 sm:ml-2 underline">
            Ver más
          </a>
        </div>
      )}

      {/* Info de contacto - Solo se muestra en Home */}
      {isHome && (
        <div className="flex flex-col lg:flex-row justify-between items-center bg-[#f5fafd] px-2 sm:px-4 lg:px-8 py-2 sm:py-3 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row items-center space-y-1 sm:space-y-2 lg:space-y-0 lg:space-x-3 xl:space-x-4">
            <span className="text-[#0097c2] font-semibold text-xs sm:text-sm flex items-center">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h2.28a2 2 0 011.7.95l1.6 2.6a2 2 0 01-.45 2.7l-.7.7a16.001 16.001 0 006.6 6.6l.7-.7a2 2 0 012.7-.45l2.6 1.6a2 2 0 01.95 1.7V19a2 2 0 01-2 2h-1C7.82 21 3 16.18 3 10V9a2 2 0 012-2z"
                />
              </svg>
              <span className="hidden sm:inline">009-555-5555</span>
              <span className="sm:hidden">009-555-5555</span>
            </span>
            <span className="text-[#0097c2] font-semibold text-xs sm:text-sm flex items-center">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 12H8m8 0a8 8 0 11-16 0 8 8 0 0116 0z"
                />
              </svg>
              <span className="hidden xl:inline">info@opticalainteligente.com</span>
              <span className="xl:hidden">info@opticalainteligente.com</span>
            </span>
          </div>
          <div className="hidden xl:block text-[10px] sm:text-xs text-gray-500">
            Lun-Vie: 8AM-6PM | Sáb: 9AM-3PM
          </div>
        </div>
      )}

      {/* Navbar principal - Se muestra en todas las páginas */}
      <nav className="bg-white py-2 sm:py-4 px-3 sm:px-6 shadow-md relative">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="https://i.imgur.com/rYfBDzN.png" 
              alt="Óptica La Inteligente" 
              className="w-20 h-8 sm:w-24 sm:h-10 lg:w-27 lg:h-14 object-contain hover:scale-105 transition-transform duration-300 hover:drop-shadow-lg"
            />
            <span className="font-semibold text-sm sm:text-lg lg:text-xl text-[#0097c2] ml-1 sm:ml-2 hidden sm:block">
              Óptica La Inteligente
            </span>
          </div>

          {/* Menú de escritorio */}
          <ul className="hidden xl:flex space-x-3 sm:space-x-4 lg:space-x-6 font-medium text-sm sm:text-base">
            <li>
              <Link to="/" className="hover:text-[#0097c2] h-full flex items-center">
                Inicio
              </Link>
            </li>
            <li className="relative">
              <div className="h-full flex items-center">
                <Link
                  to="/productos"
                  className="hover:text-[#0097c2] flex items-center gap-1"
                  onMouseEnter={() => setIsProductMenuOpen(true)}
                >
                  Productos
                  <svg
                    className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform inline-block ml-1 ${
                      isProductMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Link>
              </div>
              <div
                className={`absolute left-0 mt-0 w-40 sm:w-48 bg-white shadow-lg rounded-lg py-1 sm:py-2 z-50 ${
                  isProductMenuOpen ? "block" : "hidden"
                }`}
                onMouseEnter={() => setIsProductMenuOpen(true)}
                onMouseLeave={() => setIsProductMenuOpen(false)}
              >
                <Link
                  to="/productos/lentes"
                  className="block px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-100 hover:text-[#0097c2] text-sm"
                >
                  Lentes
                </Link>
                <Link
                  to="/productos/accesorios"
                  className="block px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-100 hover:text-[#0097c2] text-sm"
                >
                  Accesorios
                </Link>
                <Link
                  to="/productos/personalizables"
                  className="block px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-100 hover:text-[#0097c2] text-sm"
                >
                  Personalizables
                </Link>
              </div>
            </li>
            <li>
              <Link to="/cotizaciones" className="hover:text-[#0097c2] h-full flex items-center">
                Cotizaciones
              </Link>
            </li>
            <li>
              <Link to="/servicios" className="hover:text-[#0097c2] h-full flex items-center">
                Servicios
              </Link>
            </li>
            <li>
              <Link to="/agendar" className="hover:text-[#0097c2] h-full flex items-center">
                Agendar Citas
              </Link>
            </li>
            <li>
              <Link to="/nosotros" className="hover:text-[#0097c2] h-full flex items-center">
                Nosotros
              </Link>
            </li>
          </ul>

          {/* Botón de sesión/perfil */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* Mostrar enlace al dashboard para cualquier rol que NO sea Cliente */}
                {user.rol !== 'Cliente' && (
                  <Link
                    to="/dashboard"
                    className="bg-cyan-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow hover:bg-cyan-700 transition text-xs sm:text-sm"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/perfil"
                  className="bg-[#0097c2] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow hover:bg-[#0077a2] transition text-xs sm:text-sm"
                >
                  Perfil
                </Link>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-[#0097c2] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow hover:bg-[#0077a2] transition text-xs sm:text-sm"
              >
                Iniciar Sesión
              </button>
            )}

            {/* Botón hamburguesa para móvil y tablet */}
            <button
              onClick={toggleMobileMenu}
              className="xl:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Menú móvil y tablet */}
        {isMobileMenuOpen && (
          <div className="xl:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
            <div className="px-4 py-2 space-y-1">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="block py-2 px-3 text-gray-700 hover:text-[#0097c2] hover:bg-gray-50 rounded-lg transition-colors"
              >
                Inicio
              </Link>
              
              {/* Productos con submenú */}
              <div className="relative">
                <button
                  onClick={() => setIsProductMenuOpen(!isProductMenuOpen)}
                  className="w-full text-left py-2 px-3 text-gray-700 hover:text-[#0097c2] hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
                >
                  Productos
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isProductMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isProductMenuOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link
                      to="/productos/lentes"
                      onClick={closeMobileMenu}
                      className="block py-2 px-3 text-gray-600 hover:text-[#0097c2] hover:bg-gray-50 rounded-lg transition-colors text-sm"
                    >
                      Lentes
                    </Link>
                    <Link
                      to="/productos/accesorios"
                      onClick={closeMobileMenu}
                      className="block py-2 px-3 text-gray-600 hover:text-[#0097c2] hover:bg-gray-50 rounded-lg transition-colors text-sm"
                    >
                      Accesorios
                    </Link>
                    <Link
                      to="/productos/personalizables"
                      onClick={closeMobileMenu}
                      className="block py-2 px-3 text-gray-600 hover:text-[#0097c2] hover:bg-gray-50 rounded-lg transition-colors text-sm"
                    >
                      Personalizables
                    </Link>
                  </div>
                )}
              </div>

              {/* Mostrar cotizaciones solo si el usuario está autenticado */}
              {user && (
                <Link
                  to="/cotizaciones"
                  onClick={closeMobileMenu}
                  className="block py-2 px-3 text-gray-700 hover:text-[#0097c2] hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cotizaciones
                </Link>
              )}

              <Link
                to="/servicios"
                onClick={closeMobileMenu}
                className="block py-2 px-3 text-gray-700 hover:text-[#0097c2] hover:bg-gray-50 rounded-lg transition-colors"
              >
                Servicios
              </Link>
              <Link
                to="/agendar"
                onClick={closeMobileMenu}
                className="block py-2 px-3 text-gray-700 hover:text-[#0097c2] hover:bg-gray-50 rounded-lg transition-colors"
              >
                Agendar Citas
              </Link>
              <Link
                to="/nosotros"
                onClick={closeMobileMenu}
                className="block py-2 px-3 text-gray-700 hover:text-[#0097c2] hover:bg-gray-50 rounded-lg transition-colors"
              >
                Nosotros
              </Link>

              {/* Mostrar dashboard para cualquier rol que NO sea Cliente */}
              {user && user.rol !== 'Cliente' && (
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="block py-2 px-3 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors font-semibold"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Add the AuthModal component */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;