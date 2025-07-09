import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PageTransition from "../../components/transition/PageTransition.jsx";
import Navbar from "../../components/layout/Navbar";
import useData from '../../hooks/useData';

const Producto = () => {
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const location = useLocation();

  // Hooks para traer datos reales
  const { data: lentes, loading: loadingLentes, error: errorLentes } = useData('lentes');
  const { data: accesorios, loading: loadingAccesorios, error: errorAccesorios } = useData('accesorios');
  const { data: personalizables, loading: loadingPersonalizables, error: errorPersonalizables } = useData('productosPersonalizados');

  const renderContent = () => {
    switch (location.pathname) {
      case "/productos/lentes":
        return (
          <div className="container mx-auto py-10">
            <h2 className="text-4xl font-bold text-center mb-12">Lentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {loadingLentes ? (
                <div>Cargando...</div>
              ) : errorLentes ? (
                <div className="text-red-500">Error al cargar lentes</div>
              ) : lentes && lentes.length === 0 ? (
                <div className="col-span-4 text-center">No hay lentes disponibles actualmente.</div>
              ) : lentes && lentes.length > 0 ? (
                lentes.map((lente) => (
                  <div key={lente.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <img src={lente.imagen || "/lentes-modelo.jpg"} alt={lente.nombre} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2">{lente.nombre}</h3>
                      <p className="text-gray-600 text-sm mb-4">{lente.descripcion}</p>
                      <button className="w-full bg-[#0097c2] text-white py-2 rounded-full hover:bg-[#0077a2] transition">Ver detalles</button>
                    </div>
                  </div>
                ))
              ) : null}
            </div>
          </div>
        );

      case "/productos/accesorios":
        return (
          <div className="container mx-auto py-10">
            <h2 className="text-4xl font-bold text-center mb-12">Accesorios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {loadingAccesorios ? (
                <div>Cargando...</div>
              ) : errorAccesorios ? (
                <div className="text-red-500">Error al cargar accesorios</div>
              ) : accesorios && accesorios.length === 0 ? (
                <div className="col-span-4 text-center">No hay accesorios disponibles actualmente.</div>
              ) : accesorios && accesorios.length > 0 ? (
                accesorios.map((acc) => (
                  <div key={acc.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <img src={acc.imagen || "/accesorio-modelo.jpg"} alt={acc.nombre} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2">{acc.nombre}</h3>
                      <p className="text-gray-600 text-sm mb-4">{acc.descripcion}</p>
                      <button className="w-full bg-[#0097c2] text-white py-2 rounded-full hover:bg-[#0077a2] transition">Ver detalles</button>
                    </div>
                  </div>
                ))
              ) : null}
            </div>
          </div>
        );

      case "/productos/personalizables":
        return (
          <div className="container mx-auto py-10">
            <h2 className="text-4xl font-bold text-center mb-12">Productos Personalizables</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {loadingPersonalizables ? (
                <div>Cargando...</div>
              ) : errorPersonalizables ? (
                <div className="text-red-500">Error al cargar productos personalizables</div>
              ) : personalizables && personalizables.length === 0 ? (
                <div className="col-span-4 text-center">No hay productos personalizables disponibles actualmente.</div>
              ) : personalizables && personalizables.length > 0 ? (
                personalizables.map((pers) => (
                  <div key={pers.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <img src={pers.imagen || "/personalizable-modelo.jpg"} alt={pers.nombre} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2">{pers.nombre}</h3>
                      <p className="text-gray-600 text-sm mb-4">{pers.descripcion}</p>
                      <button className="w-full bg-[#0097c2] text-white py-2 rounded-full hover:bg-[#0077a2] transition">Personalizar</button>
                    </div>
                  </div>
                ))
              ) : null}
            </div>
          </div>
        );

      default:
        return (
          <div className="container mx-auto py-10">
            <h2 className="text-4xl font-bold text-center mb-12">
              Todos los Productos
            </h2>
            {/* ... resto del contenido existente ... */}
          </div>
        );
    }
  };

  return (
    <PageTransition>
      <Navbar />
      <div>
        {/* Anuncio de producto */}
        <div className="container mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
          <h1 className="text-3xl font-bold text-[#0097c2] mb-4">
            Producto Destacado
          </h1>
          <img
            src="/producto.jpg"
            alt="Producto"
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          <p className="text-gray-700 mb-4">
            Descripción del producto destacado. Aquí puedes incluir detalles
            sobre las características, beneficios y cualquier otra información
            relevante.
          </p>
          <button className="bg-[#0097c2] text-white px-6 py-2 rounded-full hover:bg-[#0077a2] transition">
            Comprar Ahora
          </button>
        </div>
      </div>

      {renderContent()}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#0097c2] to-[#00b4e4] text-white">
        <div className="max-w-7xl mx-auto">
          {/* Top Footer with main content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-4 py-12">
            {/* Logo and description column */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center space-x-3">
                <img src="/logo.png" alt="Logo" className="w-10 h-10" />
                <h2 className="text-xl font-bold">Óptica La Inteligente</h2>
              </div>
              <p className="text-sm text-gray-100">
                Comprometidos con tu salud visual desde 2010. Ofrecemos
                servicios profesionales y productos de alta calidad para el
                cuidado de tus ojos.
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
                derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </PageTransition>
  );
};

export default Producto;
