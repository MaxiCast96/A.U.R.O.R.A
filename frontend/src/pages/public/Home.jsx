import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PageTransition from "../../components/transition/PageTransition";
import Navbar from "../../components/layout/Navbar";
import BrandCarousel from "../../components/Home/BrandCarousel";
import PopularCarousel from "../../components/Home/PopularCarousel";
import AuthModal from "../../components/auth/AuthModal";

const Home = () => {
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [currentBrandSlide, setCurrentBrandSlide] = useState(0);
  const [currentPopularSlide, setCurrentPopularSlide] = useState(0);

  const brands = [
    { id: 1, name: "Converse", image: "/img/marca-converse.png" },
    { id: 2, name: "Puma", image: "/img/marca-puma.png" },
    { id: 3, name: "True", image: "/img/marca-true.png" },
    { id: 4, name: "RayBan", image: "/img/marca-rayban.png" },
    { id: 5, name: "Oakley", image: "/img/marca-oakley.png" }
  ];

  const populars = [
    { id: 1, image: "/img/popular1.png", name: "Lentes Ray-Ban Classic" },
    { id: 2, image: "/img/popular2.png", name: "Monturas Oakley Sport" },
    { id: 3, image: "/img/popular3.png", name: "Gafas de Sol Premium" },
    { id: 4, image: "/img/popular4.png", name: "Lentes de Contacto" }
  ];

  useEffect(() => {
    const brandTimer = setInterval(() => {
      setCurrentBrandSlide((prev) => (prev + 1) % Math.ceil(brands.length / 3));
    }, 3000);

    const popularTimer = setInterval(() => {
      setCurrentPopularSlide((prev) => (prev + 1) % Math.ceil(populars.length / 3));
    }, 4000);

    return () => {
      clearInterval(brandTimer);
      clearInterval(popularTimer);
    };
  }, [brands.length, populars.length]);

  useEffect(() => {
    if (location.state?.openAuthModal) {
      setIsAuthModalOpen(true);
      // Limpiar el estado después de abrir el modal
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);

  return (
    <PageTransition>
      <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />
      <div className="bg-white min-h-screen flex flex-col font-['Lato']">
        {/* Hero principal */}
        <section className="flex flex-col md:flex-row items-center justify-between bg-[#0097c2] rounded-2xl mx-auto mt-8 mb-8 max-w-5xl p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex-1 text-white">
            <h2 className="text-3xl font-bold mb-2 text-center md:text-left">
              Cuida tu visión con expertos
            </h2>
            <p className="mb-6 text-lg text-center md:text-left">
              Descubre nuestra amplia gama de productos ópticos y servicios
              profesionales para el cuidado de tus ojos.
            </p>
            <div className="flex justify-center md:justify-start">
              <a
                href="/agendar"
                className="bg-white text-[#0097c2] font-semibold px-6 py-3 rounded-full shadow hover:bg-gray-100 transition"
              >
                Agendar Examen Visual
              </a>
            </div>
          </div>
          <div className="flex-1 flex justify-center mt-6 md:mt-0">
            <img
              src="/img/hero-hombre.jpg"
              alt="Hombre con lentes"
              className="rounded-xl w-60 h-60 object-cover shadow-lg"
            />
          </div>
        </section>

        {/* ¿Por qué elegirnos? */}
        <section className="max-w-6xl mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-md hover:shadow-lg transition-all">
              <div className="bg-[#0097c2] text-white rounded-full p-3 mb-3">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16s4-2.5 4-6a4 4 0 10-8 0c0 3.5 4 6 4 6z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Examen visual profesional</h3>
              <p className="text-gray-600 text-sm">
                Realizado por optometristas certificados con equipos de última
                generación.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-md hover:shadow-lg transition-all">
              <div className="bg-[#0097c2] text-white rounded-full p-3 mb-3">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <path d="M8 12l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Garantía de calidad</h3>
              <p className="text-gray-600 text-sm">
                Todos nuestros productos cuentan con garantía contra defectos de
                fabricación.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-md hover:shadow-lg transition-all">
              <div className="bg-[#0097c2] text-white rounded-full p-3 mb-3">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 12h18M9 6l-6 6 6 6" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Entrega rápida</h3>
              <p className="text-gray-600 text-sm">
                Recibe tus lentes en tiempo récord, con la graduación exacta que
                necesitas.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-md hover:shadow-lg transition-all">
              <div className="bg-[#0097c2] text-white rounded-full p-3 mb-3">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 8v4l3 3" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Envío gratuito</h3>
              <p className="text-gray-600 text-sm">
                En compras mayores a $1000, el envío va por nuestra cuenta.
              </p>
            </div>
          </div>
        </section>

        {/* Nuestras Categorías */}
        <section className="max-w-6xl mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Nuestras Categorías
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all relative group">
              <img
                src="/img/categoria-hombre.jpg"
                alt="Hombres"
                className="w-full h-40 object-cover group-hover:scale-105 transition"
              />
              <span className="absolute bottom-2 left-2 text-white text-lg font-semibold bg-black/40 px-3 py-1 rounded">
                Hombres
              </span>
            </div>
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all relative group">
              <img
                src="/img/categoria-mujer.jpg"
                alt="Mujeres"
                className="w-full h-40 object-cover group-hover:scale-105 transition"
              />
              <span className="absolute bottom-2 left-2 text-white text-lg font-semibold bg-black/40 px-3 py-1 rounded">
                Mujeres
              </span>
            </div>
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all relative group">
              <img
                src="/img/categoria-nino.jpg"
                alt="Niños"
                className="w-full h-40 object-cover group-hover:scale-105 transition"
              />
              <span className="absolute bottom-2 left-2 text-white text-lg font-semibold bg-black/40 px-3 py-1 rounded">
                Niños
              </span>
            </div>
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all relative group">
              <img
                src="/img/categoria-accesorios.jpg"
                alt="Accesorios"
                className="w-full h-40 object-cover group-hover:scale-105 transition"
              />
              <span className="absolute bottom-2 left-2 text-white text-lg font-semibold bg-black/40 px-3 py-1 rounded">
                Accesorios
              </span>
            </div>
          </div>
        </section>

        {/* Lo que dicen nuestros clientes */}
        <section className="max-w-6xl mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Lo que dicen nuestros clientes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6 flex flex-col items-center">
              <img
                src="/img/cliente1.jpg"
                alt="Cliente 1"
                className="w-14 h-14 rounded-full mb-2 object-cover"
              />
              <h3 className="font-semibold">María González</h3>
              <span className="text-xs text-gray-500 mb-2">
                Cliente desde 2020
              </span>
              <p className="text-center text-gray-700 mb-2">
                Excelente servicio y atención. Me encantaron mis nuevos lentes y
                el examen visual fue muy profesional. ¡Definitivamente
                regresaré!
              </p>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.286 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6 flex flex-col items-center">
              <img
                src="/img/cliente2.jpg"
                alt="Cliente 2"
                className="w-14 h-14 rounded-full mb-2 object-cover"
              />
              <h3 className="font-semibold">Carlos Ramírez</h3>
              <span className="text-xs text-gray-500 mb-2">
                Cliente desde 2019
              </span>
              <p className="text-center text-gray-700 mb-2">
                Encontré exactamente lo que buscaba a un precio accesible. El
                personal es muy amable y me ayudaron a elegir el armazón
                perfecto para mi rostro.
              </p>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.286 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6 flex flex-col items-center">
              <img
                src="/img/cliente3.jpg"
                alt="Cliente 3"
                className="w-14 h-14 rounded-full mb-2 object-cover"
              />
              <h3 className="font-semibold">Laura Sánchez</h3>
              <span className="text-xs text-gray-500 mb-2">
                Cliente desde 2021
              </span>
              <p className="text-center text-gray-700 mb-2">
                La calidad de los lentes es excelente. El proceso de adaptación
                fue muy rápido y el seguimiento post-venta es de calidad
                realmente valiosa.
              </p>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.286 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Nuestras Sucursales */}
        <section className="max-w-6xl mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Nuestras Sucursales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Sucursal Principal */}
            <div className="bg-gradient-to-br from-[#0097c2] to-[#00b4e4] text-white rounded-2xl p-6 flex flex-col shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-white/10 rounded-lg mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg">Sucursal Principal</h3>
              </div>
              <p className="mb-6 text-white/90">
                Colonia Médica, Avenida Dr. Max Bloch #23, San Salvador.
              </p>
              <div className="mt-auto space-y-3">
                <div className="flex items-center text-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lun-Vie: 8:00 AM - 5:00 PM
                </div>
                <div className="flex items-center text-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  2222-2222
                </div>
                <a
                  href="https://maps.google.com"
                  className="inline-flex items-center bg-white text-[#0097c2] px-4 py-2 rounded-xl font-semibold shadow hover:shadow-lg transition-all duration-300 group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Ver en Google Maps</span>
                  <svg 
                    className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Sucursal Quezaltepeque */}
            <div className="bg-gradient-to-br from-[#0097c2] to-[#00b4e4] text-white rounded-2xl p-6 flex flex-col shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-white/10 rounded-lg mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg">Sucursal Quezaltepeque</h3>
              </div>
              <p className="mb-6 text-white/90">
                1ra Avenida Norte y 8va Calle Poniente, #22, Quezaltepeque, La Libertad.
              </p>
              <div className="mt-auto space-y-3">
                <div className="flex items-center text-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lun-Vie: 8:00 AM - 5:00 PM
                </div>
                <div className="flex items-center text-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  2222-2222
                </div>
                <a
                  href="https://maps.google.com"
                  className="inline-flex items-center bg-white text-[#0097c2] px-4 py-2 rounded-xl font-semibold shadow hover:shadow-lg transition-all duration-300 group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Ver en Google Maps</span>
                  <svg 
                    className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Nuestras marcas */}
        <section className="max-w-6xl mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Nuestras marcas
          </h2>
          <BrandCarousel 
            brands={brands}
            currentSlide={currentBrandSlide}
            onSlideChange={setCurrentBrandSlide}
          />
        </section>

        {/* Populares */}
        <section className="max-w-6xl mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Populares</h2>
          <PopularCarousel 
            items={populars}
            currentSlide={currentPopularSlide}
            onSlideChange={setCurrentPopularSlide}
          />
        </section>

        {/* Productos Destacados */}
        <section className="max-w-6xl mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Productos Destacados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6 flex flex-col items-center"
              >
                <img
                  src={`/img/destacado${i}.png`}
                  alt={`Producto Destacado ${i}`}
                  className="w-32 h-24 object-contain mb-4"
                />
                <h3 className="font-semibold mb-2">Código: ABC123</h3>
                <ul className="text-gray-600 text-sm mb-4 list-disc list-inside">
                  <li>Armazón de acetato</li>
                  <li>Incluye estuche y paño</li>
                  <li>Disponible en varios colores</li>
                </ul>
                <a
                  href="#"
                  className="bg-[#0097c2] text-white px-4 py-2 rounded-full font-semibold shadow hover:bg-[#0077a2] transition"
                >
                  Ver detalles
                </a>
              </div>
            ))}
          </div>
        </section>

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
                  Comprometidos con tu salud visual desde 2010. Ofrecemos servicios
                  profesionales y productos de alta calidad para el cuidado de tus ojos.
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

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    </PageTransition>
  );
};

export default Home;