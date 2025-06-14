import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthModal from "../auth/AuthModal";

const Navbar = ({ onOpenAuth }) => {
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      {/* Barra superior - Solo se muestra en Home */}
      {isHome && (
        <div className="bg-[#0097c2] text-white text-sm py-2 px-4 flex flex-col md:flex-row justify-center items-center">
          <span>Envío gratis en compras mayores a $1000</span>
          <a href="/promociones" className="ml-2 underline">
            Ver más
          </a>
        </div>
      )}

      {/* Info de contacto - Solo se muestra en Home */}
      {isHome && (
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#f5fafd] px-4 md:px-8 py-3 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <span className="text-[#0097c2] font-semibold text-sm flex items-center">
              <svg
                className="w-5 h-5 mr-1"
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
              009-555-5555
            </span>
            <span className="text-[#0097c2] font-semibold text-sm flex items-center">
              <svg
                className="w-5 h-5 mr-1"
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
              info@opticalainteligente.com
            </span>
          </div>
          <div className="hidden md:block text-xs text-gray-500">
            Lun-Vie: 8AM-6PM | Sáb: 9AM-3PM
          </div>
        </div>
      )}

      {/* Navbar principal - Se muestra en todas las páginas */}
      <nav className="bg-white py-4 px-6 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-10 mr-2" />
            <span className="font-semibold text-xl text-[#0097c2]">
              Óptica La Inteligente
            </span>
          </div>
          <ul className="hidden md:flex space-x-6 font-medium">
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
                    className={`w-4 h-4 transition-transform inline-block ml-1 ${
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
                className={`absolute left-0 mt-0 w-48 bg-white shadow-lg rounded-lg py-2 z-50 ${
                  isProductMenuOpen ? "block" : "hidden"
                }`}
                onMouseEnter={() => setIsProductMenuOpen(true)}
                onMouseLeave={() => setIsProductMenuOpen(false)}
              >
                <Link
                  to="/productos/lentes"
                  className="block px-4 py-2 hover:bg-gray-100 hover:text-[#0097c2]"
                >
                  Lentes
                </Link>
                <Link
                  to="/productos/accesorios"
                  className="block px-4 py-2 hover:bg-gray-100 hover:text-[#0097c2]"
                >
                  Accesorios
                </Link>
                <Link
                  to="/productos/personalizables"
                  className="block px-4 py-2 hover:bg-gray-100 hover:text-[#0097c2]"
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
          <button
            onClick={onOpenAuth}
            className="bg-[#0097c2] text-white px-4 py-2 rounded-full shadow hover:bg-[#0077a2] transition"
          >
            Iniciar Sesión
          </button>
        </div>
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