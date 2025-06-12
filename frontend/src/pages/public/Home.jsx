import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../../components/transition/PageTransition";
import Navbar from "../../components/layout/Navbar";
import BrandCarousel from "../../components/Home/BrandCarousel";
import PopularCarousel from "../../components/Home/PopularCarousel";
import AuthModal from "../../components/auth/AuthModal";

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

  const brands = [
    { id: 1, name: "Converse", image: Converse },
    { id: 2, name: "Puma", image: Puma },
    { id: 3, name: "True", image: True },
  ];

  const populars = [
    { id: 1, image: Lente1, name: "Lentes Ray-Ban Classic" },
    { id: 2, image: Lente2, name: "Monturas Oakley Sport" },
    { id: 3, image: Lente3, name: "Gafas de Sol Premium" },
  ];

  // Promociones para el carrusel
  const promociones = [
    {
      titulo: "2x1 en Lentes Oftálmicos",
      descripcion: "Aprovecha nuestra promoción especial y obtén dos lentes al precio de uno. Solo por tiempo limitado.",
      imagen: Lente1,
      enlace: "/promociones/2x1"
    },
    {
      titulo: "Examen Visual Gratis",
      descripcion: "Realiza tu compra y recibe un examen visual completamente gratis con nuestros expertos.",
      imagen: Lente2,
      enlace: "/promociones/examen-gratis"
    },
    {
      titulo: "30% de Descuento en Armazones",
      descripcion: "Descuento especial en armazones seleccionados. Renueva tu look hoy mismo.",
      imagen: Lente3,
      enlace: "/promociones/30-descuento"
    },
  ];
  const [promoIndex, setPromoIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePrevPromo = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setPromoIndex((prev) => (prev === 0 ? promociones.length - 1 : prev - 1));
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const handleNextPromo = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setPromoIndex((prev) => (prev === promociones.length - 1 ? 0 : prev + 1));
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
      setCurrentBrandSlide((prev) => (prev + 1) % Math.ceil(brands.length / 3));
    }, 3000);

    const popularTimer = setInterval(() => {
      setCurrentPopularSlide(
        (prev) => (prev + 1) % Math.ceil(populars.length / 3)
      );
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
          className="w-full relative py-8 px-4 md:px-8 overflow-hidden"
        >
          {/* Fondo principal con diseño moderno */}
          <div className="absolute inset-0 bg-[#0097c2]"></div>
          
          {/* Efecto de ondas */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJ3YXZlIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxwYXRoIGQ9Ik0wIDUwIEMyMCAzMCA0MCAzMCA2MCA1MCBDODAgNzAgMTAwIDcwIDEwMCA1MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjd2F2ZSkiLz48L3N2Zz4=')]"></div>
          </div>

          {/* Efectos de luz */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-[1000px] mx-auto relative">
            {/* Botón anterior */}
            <button
              onClick={handlePrevPromo}
              className="absolute -left-12 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 shadow-lg transition-all duration-300 hover:scale-110 z-20 transform hover:rotate-12 backdrop-blur-sm border border-white/20"
              aria-label="Anterior"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>

            {/* Contenido de la promoción */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 min-h-[300px]">
              <motion.div
                key={promoIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="flex-1 text-white max-w-xl flex flex-col items-center justify-center px-4 md:px-6 text-center transform transition-transform duration-300"
              >
                <motion.h2 
                  animate={{ 
                    scale: [1, 1.05, 1],
                    translateZ: [0, 20, 0]
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="text-2xl md:text-3xl font-bold mb-4 text-center text-white drop-shadow-lg"
                >
                  {promociones[promoIndex].titulo}
                </motion.h2>
                <motion.p 
                  animate={{ 
                    translateZ: [0, 10, 0]
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="mb-6 text-base text-center leading-relaxed text-white/90 max-w-md mx-auto drop-shadow"
                >
                  {promociones[promoIndex].descripcion}
                </motion.p>
                <motion.div 
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="flex justify-center w-full"
                >
                  <a
                    href={promociones[promoIndex].enlace}
                    className="bg-white text-[#0097c2] font-semibold px-5 py-2 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 text-sm border-2 border-white hover:bg-transparent hover:text-white"
                  >
                    Ver Promoción
                  </a>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex-1 flex justify-center items-center"
              >
                <motion.div
                  animate={{ 
                    rotateY: [0, 5, 0],
                    rotateX: [0, 5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="relative transform-style-3d"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full blur-xl transform -rotate-2 translate-z-[-20px]"></div>
                  <motion.img
                    key={promociones[promoIndex].imagen}
                    src={promociones[promoIndex].imagen}
                    alt={promociones[promoIndex].titulo}
                    className="rounded-full w-64 h-64 md:w-[300px] md:h-[300px] object-cover shadow-2xl relative z-10 border-2 border-white/30"
                    style={{
                      transformStyle: 'preserve-3d',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full transform translate-z-[-10px]"></div>
                </motion.div>
              </motion.div>
            </div>

            {/* Botón siguiente */}
            <button
              onClick={handleNextPromo}
              className="absolute -right-12 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 shadow-lg transition-all duration-300 hover:scale-110 z-20 transform hover:-rotate-12 backdrop-blur-sm border border-white/20"
              aria-label="Siguiente"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </motion.section>
        <br />
        <br />
        <br />
        <br />

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
        <br />
        <br />

        {/* Servicios con animaciones más sutiles */}
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

        {/* Productos Destacados con animations */}
        <section className="max-w-6xl mx-auto px-4 mb-12">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-2xl font-bold text-center mb-8"
          >
            Productos Destacados
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6 flex flex-col items-center"
              >
                <img
                  src={Lente4}
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
              </motion.div>
            ))}
          </motion.div>
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
