import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../../components/transition/PageTransition";
import Navbar from "../../components/layout/Navbar";
import BrandsCarousel from "../../components/Home/BrandCarousel";
import PopularCarousel from "../../components/Home/PopularCarousel";
import useData from "../../hooks/useData";

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
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [currentBrandSlide, setCurrentBrandSlide] = useState(0);
  const [currentPopularSlide, setCurrentPopularSlide] = useState(0);

  // TODOS los datos se manejan en el componente padre (Home)
  const {
    data: promociones,
    loading: loadingPromos,
    error: errorPromos,
  } = useData("promociones");
  const {
    data: brands,
    loading: loadingBrands,
    error: errorBrands,
  } = useData("marcas");
  const {
    data: populars,
    loading: loadingPopulars,
    error: errorPopulars,
  } = useData("lentes?popular=true");

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
      setPromoIndex((prev) =>
        prev === 0 ? safePromociones.length - 1 : prev - 1
      );
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const handleNextPromo = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setPromoIndex((prev) =>
        prev === safePromociones.length - 1 ? 0 : prev + 1
      );
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
      setCurrentBrandSlide(
        (prev) => (prev + 1) % Math.ceil(safeBrands.length / 3)
      );
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
        <Navbar />

        {/* Hero inspirado en NovoTec - Carrusel con colores de la óptica */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full relative py-0 px-0 overflow-hidden"
        >
          {/* Contenedor principal ampliado sin sombras */}
          <div className="relative w-full h-[500px] sm:h-[550px] md:h-[600px] lg:h-[650px] bg-white overflow-hidden">
            {loadingPromos ? (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-12 h-12 border-3 border-gray-300 border-t-[#0097c2] rounded-full mx-auto mb-4"
                  />
                  <p className="text-lg font-medium text-gray-600">
                    Cargando promociones...
                  </p>
                </div>
              </div>
            ) : errorPromos ? (
              <div className="flex items-center justify-center h-full bg-gray-50 text-center">
                <div>
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <p className="text-lg font-medium text-red-600">
                    Error al cargar promociones
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative h-full">
                {/* Contenido principal */}
                <div className="grid lg:grid-cols-2 h-full">
                  {/* Sección de contenido (lado izquierdo) */}
                  <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 xl:p-20 bg-gray-50 lg:bg-transparent relative">
                    {safePromociones.length > 0 ? (
                      <motion.div
                        key={`content-${promoIndex}`}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="space-y-6"
                      >
                        {/* Badge de promoción */}
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            delay: 0.2,
                            type: "spring",
                            stiffness: 300,
                          }}
                          className="inline-flex items-center px-4 py-2 bg-[#0097c2] text-white text-sm font-semibold rounded-full w-fit"
                        >
                          ¡OFERTA ESPECIAL!
                        </motion.div>

                        {/* Título principal */}
                        <motion.h1
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 leading-tight"
                        >
                          {safePromociones[promoIndex]?.titulo || (
                            <>
                              Súper precios
                              <br />
                              en tus lentes
                              <br />
                              favoritos
                            </>
                          )}
                        </motion.h1>

                        {/* Descripción */}
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.6 }}
                          className="text-lg md:text-xl lg:text-2xl text-gray-600 font-light max-w-lg"
                        >
                          {safePromociones[promoIndex]?.descripcion ||
                            "Tu visión es nuestra prioridad"}
                        </motion.p>

                        {/* Botón de acción */}
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.6 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-[#0097c2] hover:bg-[#0083a8] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 w-fit"
                        >
                          Ver Oferta
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                      >
                        <div className="inline-flex items-center px-4 py-2 bg-[#0097c2] text-white text-sm font-semibold rounded-full w-fit">
                          ¡OFERTA ESPECIAL!
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 leading-tight">
                          Súper precios
                          <br />
                          en tus lentes
                          <br />
                          favoritos
                        </h1>

                        <p className="text-lg md:text-xl lg:text-2xl text-gray-600 font-light max-w-lg">
                          Tu visión es nuestra prioridad
                        </p>

                        <button className="bg-[#0097c2] hover:bg-[#0083a8] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 w-fit">
                          Explorar productos
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* Sección de imagen (lado derecho) */}
                  <div className="relative flex items-center justify-center p-8 md:p-12 lg:p-16 bg-gradient-to-br">
                    {/* Elementos decorativos de fondo */}
                    <div className="absolute inset-0 overflow-hidden">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute top-20 right-20 w-32 h-32 bg-[#0097c2]/20 rounded-full blur-2xl"
                      />
                      <motion.div
                        animate={{
                          scale: [1.1, 1, 1.1],
                          opacity: [0.05, 0.15, 0.05],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute bottom-20 left-10 w-40 h-40 bg-[#0097c2]/15 rounded-full blur-3xl"
                      />

                      {/* Patrón de ondas sutil */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJ3YXZlIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxwYXRoIGQ9Ik0wIDUwIEMyMCAzMCA0MCAzMCA2MCA1MCBDODAgNzAgMTAwIDcwIDEwMCA1MCIgc3Ryb2tlPSIjMDA5N2MyIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjd2F2ZSkiLz48L3N2Zz4=')]"></div>
                      </div>
                    </div>

                    {/* Imagen del producto */}
                    {safePromociones.length > 0 ? (
                      <motion.div
                        key={`image-${promoIndex}`}
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -50 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="relative z-10"
                      >
                        <motion.img
                          animate={{
                            y: [0, -8, 0],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          src={safePromociones[promoIndex]?.imagen || Lente1}
                          alt={safePromociones[promoIndex]?.titulo}
                          className="w-80 h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] xl:w-[500px] xl:h-[500px] object-contain"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        animate={{
                          y: [0, -8, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="relative z-10"
                      >
                        <img
                          src={Lente1}
                          alt="Lentes de la óptica"
                          className="w-80 h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] xl:w-[500px] xl:h-[500px] object-contain"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Controles de navegación minimalistas */}
                {safePromociones.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: "#0083a8" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handlePrevPromo}
                      className="absolute left-6 top-1/2 -translate-y-1/2 bg-[#0097c2] hover:bg-[#0083a8] text-white rounded-full p-3 transition-all duration-300 z-20"
                      aria-label="Anterior"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: "#0083a8" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleNextPromo}
                      className="absolute right-6 top-1/2 -translate-y-1/2 bg-[#0097c2] hover:bg-[#0083a8] text-white rounded-full p-3 transition-all duration-300 z-20"
                      aria-label="Siguiente"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </motion.button>

                    {/* Indicadores minimalistas */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {safePromociones.map((_, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setPromoIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === promoIndex
                              ? "bg-[#0097c2] w-8"
                              : "bg-gray-300 hover:bg-gray-400"
                          }`}
                          aria-label={`Ir a promoción ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}

               
              </div>
            )}
          </div>
        </motion.section>
        <br />
        <br />
        <br />
        <br />

        {/* Carrusel de Marcas - AHORA RECIBE DATOS COMO PROPS */}
        <BrandsCarousel
          brands={safeBrands}
          loading={loadingBrands}
          error={errorBrands}
          currentSlide={currentBrandSlide}
          onSlideChange={handleBrandSlideChange}
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

        {/* Sección de Productos Populares - AHORA RECIBE DATOS COMO PROPS */}
        <PopularCarousel
          items={safePopulars}
          loading={loadingPopulars}
          error={errorPopulars}
          currentSlide={currentPopularSlide}
          onSlideChange={handlePopularSlideChange}
        />
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
                el Examen Visual fue muy profesional. ¡Definitivamente
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
                  derechos reservados.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </PageTransition>
  );
};

export default Home;
