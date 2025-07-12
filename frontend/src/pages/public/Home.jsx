import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../../components/transition/PageTransition";
import Navbar from "../../components/layout/Navbar";
import BrandsCarousel from "../../components/Home/BrandCarousel";
import PopularCarousel from "../../components/Home/PopularCarousel";
import AuthModal from "../../components/auth/AuthModal";
import useData from '../../hooks/useData';

//imagenes
import Converse from "../public/img/Converse.png";
import Puma from "../public/img/Puma.png";
import True from "../public/img/True.png";

import Lente1 from "../public/img/Lente1.png";
import Lente2 from "../public/img/Lente2.png";
import Lente3 from "../public/img/Lente3.png";
import Lente4 from "../public/img/Lente4.png";
import Lente5 from "../public/img/Lente5.png";
import Lente6 from "../public/img/Lente6.png";

import Hombre from "../public/img/Hombre.png";
import Mujer from "../public/img/Mujer.png";
import Nino from "../public/img/Niño.png";
import Accesorios from "../public/img/Accesorio.png";

const Home = () => {
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [currentBrandSlide, setCurrentBrandSlide] = useState(0);
  const [currentPopularSlide, setCurrentPopularSlide] = useState(0);

  // TODOS los datos se manejan en el componente padre (Home)
  const { data: promociones, loading: loadingPromos, error: errorPromos } = useData('promociones');
  const { data: brands, loading: loadingBrands, error: errorBrands } = useData('marcas');
  const { data: populars, loading: loadingPopulars, error: errorPopulars } = useData('lentes?popular=true');

  const [promoIndex, setPromoIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Aseguro que los datos sean arrays aunque data sea null
  const safePromociones = promociones || [];
  const safeBrands = brands || [];
  const safePopulars = populars || [];

  // Handlers para el carrusel de marcas (se pasan como props)
  const handleBrandSlideChange = (newSlide) => {
    setCurrentBrandSlide(newSlide);
  };

  // Handlers para el carrusel de productos populares (se pasan como props)
  const handlePopularSlideChange = (newSlide) => {
    setCurrentPopularSlide(newSlide);
  };

  const handlePrevPromo = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setPromoIndex((prev) => (prev === 0 ? safePromociones.length - 1 : prev - 1));
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const handleNextPromo = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setPromoIndex((prev) => (prev === safePromociones.length - 1 ? 0 : prev + 1));
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  // Efecto para la animación automática
  useEffect(() => {
    const autoAnimate = setInterval(() => {
      if (!isAnimating) {
        handleNextPromo();
      }
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(autoAnimate);
  }, [isAnimating]);

  useEffect(() => {
    const brandTimer = setInterval(() => {
      setCurrentBrandSlide((prev) => (prev + 1) % Math.ceil(safeBrands.length / 3));
    }, 3000);

    const popularTimer = setInterval(() => {
      setCurrentPopularSlide(
        (prev) => (prev + 1) % Math.ceil(safePopulars.length / 3)
      );
    }, 4000);

    return () => {
      clearInterval(brandTimer);
      clearInterval(popularTimer);
    };
  }, [safeBrands.length, safePopulars.length]);

  useEffect(() => {
    if (location.state?.openAuthModal) {
      setIsAuthModalOpen(true);
      // Limpiar el estado después de abrir el modal
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);

  // Reemplaza las variantes de animación existentes con estas más sutiles
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  // Simplifica las animaciones del hero y sections
  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white min-h-screen flex flex-col font-['Lato']"
      >
        <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

        {/* Hero simplificado ahora es un carrusel de promociones */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full relative py-4 sm:py-6 px-2 sm:px-4 md:px-8 overflow-hidden flex justify-center"
        >
          {/* Contenedor del carrusel con anchura limitada */}
          <div className="relative max-w-7xl w-full mx-auto h-72 sm:h-90  ">
            {/* Fondo principal con diseño moderno */}
            <div className="absolute inset-0 bg-[#0097c2] rounded-lg"></div>

            {/* Efecto de ondas */}
            <div className="absolute inset-0 opacity-20 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJ3YXZlIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxwYXRoIGQ9Ik0wIDUwIEMyMCAzMCA0MCAzMCA2MCA1MCBDODAgNzAgMTAwIDcwIDEwMCA1MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjd2F2ZSkiLz48L3N2Zz4=')]"></div>
            </div>

            {/* Efectos de luz */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {loadingPromos ? (
              <div className="text-center text-white py-12">Cargando promociones...</div>
            ) : errorPromos ? (
              <div className="text-center text-red-200 py-12">Error al cargar promociones</div>
            ) : (
              <div className="relative h-[280px] md:h-[320px]">
                {/* Botón anterior */}
                <button
                  onClick={handlePrevPromo}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/25 text-white rounded-full p-2.5 shadow-lg transition-all duration-300 hover:scale-110 z-20 transform hover:rotate-12 backdrop-blur-sm border border-white/20 "
                  aria-label="Anterior"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>

                {/* Contenido de la promoción */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 h-full px-6 md:px-8">
                  {safePromociones.length > 0 ? (
                    <>
                      <motion.div
                        key={promoIndex}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.4 }}
                        className="flex-1 text-white max-w-lg flex flex-col items-center justify-center text-center"
                      >
                        <motion.h2
                          animate={{
                            scale: [1, 1.02, 1],
                            translateZ: [0, 15, 0]
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                          className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-center text-white drop-shadow-lg"
                        >
                          {safePromociones[promoIndex]?.titulo}
                        </motion.h2>
                        <motion.p
                          animate={{
                            translateZ: [0, 8, 0]
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                          className="text-lg md:text-xl text-white/90 mb-6 drop-shadow-md"
                        >
                          {safePromociones[promoIndex]?.descripcion}
                        </motion.p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-white text-[#0097c2] px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                          Ver Oferta
                        </motion.button>
                      </motion.div>

                      <motion.div
                        key={`image-${promoIndex}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.4 }}
                        className="flex-1 flex justify-center items-center"
                      >
                        <img
                          src={safePromociones[promoIndex]?.imagen || Lente1}
                            alt={safePromociones[promoIndex]?.titulo}
                          className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
                          />
                      </motion.div>
                    </>
                  ) : (
                    <div className="text-center text-white">
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                        Bienvenido a Óptica La Inteligente
                      </h2>
                      <p className="text-lg md:text-xl text-white/90 mb-6">
                        Tu visión es nuestra prioridad
                      </p>
                      <button className="bg-white text-[#0097c2] px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                        Explorar Productos
                      </button>
                    </div>
                  )}
                </div>

                {/* Botón siguiente */}
                <button
                  onClick={handleNextPromo}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/25 text-white rounded-full p-2.5 shadow-lg transition-all duration-300 hover:scale-110 z-20 transform hover:-rotate-12 backdrop-blur-sm border border-white/20"
                  aria-label="Siguiente"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>

                {/* Indicadores */}
                {safePromociones.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {safePromociones.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setPromoIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === promoIndex ? 'bg-white w-6' : 'bg-white/50'
                        }`}
                        aria-label={`Ir a promoción ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.section>

        {/* Carrusel de Marcas - AHORA RECIBE DATOS COMO PROPS */}
        <BrandsCarousel 
          brands={safeBrands}
          loading={loadingBrands}
          error={errorBrands}
          currentSlide={currentBrandSlide}
          onSlideChange={handleBrandSlideChange}
        />

        {/* Sección de Productos Populares - AHORA RECIBE DATOS COMO PROPS */}
        <PopularCarousel 
          items={safePopulars}
          loading={loadingPopulars}
          error={errorPopulars}
          currentSlide={currentPopularSlide}
          onSlideChange={handlePopularSlideChange}
        />

        {/* Categorías simplificadas */}
        <motion.section
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="max-w-6xl mx-auto px-4 mb-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8">
            Nuestras Categorías
          </h2>
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {/* Cada categoría como motion.div */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="rounded-xl overflow-hidden shadow-lg relative cursor-pointer group"
            >
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                src={Hombre}
                alt="Hombres"
                className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute bottom-4 left-4 text-white text-xl font-semibold z-10">
                Hombres
              </span>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="rounded-xl overflow-hidden shadow-lg relative cursor-pointer group"
            >
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                src={Mujer}
                alt="Mujeres"
                className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute bottom-4 left-4 text-white text-xl font-semibold z-10">
                Mujeres
              </span>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="rounded-xl overflow-hidden shadow-lg relative cursor-pointer group"
            >
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                src={Nino}
                alt="Niños"
                className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute bottom-4 left-4 text-white text-xl font-semibold z-10">
                Niños
              </span>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="rounded-xl overflow-hidden shadow-lg relative cursor-pointer group"
            >
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                src={Accesorios}
                alt="Accesorios"
                className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute bottom-4 left-4 text-white text-xl font-semibold z-10">
                Accesorios
              </span>
            </motion.div>
          </motion.div>
        </motion.section>

        <br />


        {/* Servici os con animaciones más sutiles */}
        <motion.section
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="relative w-full py-16"
        >
          {/* Fondo curvo */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9fa] to-white">
            {/* Curva superior */}
            <div className="absolute -top-16 left-0 w-full h-32 bg-[#f8f9fa] rounded-t-[100px]"></div>
            {/* Curva inferior */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] h-32 bg-[#f8f9fa] rounded-b-[200px]"></div>
          </div>

          {/* Contenido */}
          <div className="relative max-w-7xl mx-auto px-4 pt-8">
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
            >
              {/* Mejora las cards con animaciones al hacer hover */}
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-md hover:shadow-xl transition-all duration-300"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="bg-[#0097c2] text-white rounded-full p-3 mb-3"
                >
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
                </motion.div>
                <h3 className="font-semibold mb-2">Examen visual profesional</h3>
                <p className="text-gray-600 text-sm">
                  Realizado por optometristas certificados con equipos de última
                  generación.
                </p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-md hover:shadow-xl transition-all duration-300"
              >
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
              </motion.div>

              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-md hover:shadow-xl transition-all duration-300"
              >
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
              </motion.div>

              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-md hover:shadow-xl transition-all duration-300"
              >
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
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
        <br />
        <br />

        {/* Testimonios más sutiles */}
        <motion.section
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="max-w-6xl mx-auto px-4 mb-12"
        >
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Convertir cada testimonio en un motion.div */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-md p-6"
            >
              <motion.img
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ duration: 0.3 }}
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
            </motion.div>
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-md p-6"
            >
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
            </motion.div>
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-md p-6"
            >
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
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Sucursales con animaciones minimalistas */}
        <motion.section
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="max-w-6xl mx-auto px-4 mb-12"
        >
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-[#0097c2] to-[#00b4e4] text-white rounded-2xl p-6"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-white/10 rounded-lg mr-3">
                  <svg
                    className="w-6 h-6"
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
                </div>
                <h3 className="font-semibold text-lg">Sucursal Principal</h3>
              </div>
              <p className="mb-6 text-white/90">
                Colonia Médica, Avenida Dr. Max Bloch #23, San Salvador.
              </p>
              <div className="mt-auto space-y-3">
                <div className="flex items-center text-sm">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Lun-Vie: 8:00 AM - 5:00 PM
                </div>
                <div className="flex items-center text-sm">
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>
              </div>
            </motion.div>

            {/* Sucursal Quezaltepeque */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-[#0097c2] to-[#00b4e4] text-white rounded-2xl p-6"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-white/10 rounded-lg mr-3">
                  <svg
                    className="w-6 h-6"
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
                </div>
                <h3 className="font-semibold text-lg">
                  Sucursal Quezaltepeque
                </h3>
              </div>
              <p className="mb-6 text-white/90">
                1ra Avenida Norte y 8va Calle Poniente, #22, Quezaltepeque, La
                Libertad.
              </p>
              <div className="mt-auto space-y-3">
                <div className="flex items-center text-sm">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Lun-Vie: 8:00 AM - 5:00 PM
                </div>
                <div className="flex items-center text-sm">
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>





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

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </motion.div>
    </PageTransition>
  );
};

export default Home;
