import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../../components/transition/PageTransition";
import Navbar from "../../components/layout/Navbar";
import BrandsCarousel from "../../components/Home/BrandCarousel";
import PopularCarousel from "../../components/Home/PopularCarousel";
import useData from "../../hooks/useData";

//imagenes
import Lente1 from "../public/img/Lente1.png";

const Home = () => {
  // ==================== STATE MANAGEMENT ====================
  const [currentPopularSlide, setCurrentPopularSlide] = useState(0);
  const [promoIndex, setPromoIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sucursalIndex, setSucursalIndex] = useState(0);
  const [isSucursalHover, setIsSucursalHover] = useState(false);
  const [sucursalPageSize, setSucursalPageSize] = useState(4);

  // ==================== REFS ====================
  const autoplayRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // ==================== CONSTANTS ====================
  const brandsVisibleItems = 5;

  // ==================== DATA FETCHING ====================
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

  const {
    data: sucursales,
    loading: loadingSucursales,
    error: errorSucursales,
  } = useData('sucursales');

  // ==================== COMPUTED VALUES ====================
  const safePromociones = promociones || [];
  const safeBrands = brands || [];
  const safePopulars = populars || [];
  const safeSucursales = Array.isArray(sucursales) ? sucursales : [];
  const totalSucursalPages = Math.max(1, Math.ceil((safeSucursales.length || 0) / sucursalPageSize));

  // ==================== HELPER FUNCTIONS ====================
  const getPromoTitle = (p) => {
    if (!p) return "";
    const base = p.nombre || p.titulo;
    if (base && base.trim()) return base;
    const tipo = p.tipoDescuento;
    const valor = p.valorDescuento;
    if (tipo === 'porcentaje' && typeof valor === 'number') return `-${valor}% en óptica`;
    if (tipo === 'monto_fijo' && typeof valor === 'number') return `Ahorra $${valor}`;
    return "";
  };

  const getPromoDesc = (p) => {
    if (!p) return "";
    if (p.descripcion && p.descripcion.trim()) return p.descripcion;
    if (p.aplicaA === 'categoria') return 'Válido en categorías seleccionadas';
    if (p.aplicaA === 'lente') return 'Aplicable a lentes seleccionados';
    return 'Promoción por tiempo limitado';
  };

  const getPromoImage = (p) => {
    if (!p) return null;
    return p.imagenPromocion || p.imagen || p.bannerUrl || p.imagenUrl || null;
  };

  // ==================== MEMOIZED VALUES ====================
  const heroPromos = React.useMemo(() => {
    const now = new Date();
    const list = Array.isArray(safePromociones) ? safePromociones.slice() : [];
    const active = list.filter(p => {
      const inicio = p?.fechaInicio ? new Date(p.fechaInicio) : null;
      const fin = p?.fechaFin ? new Date(p.fechaFin) : null;
      const isActiveFlag = p?.activo !== false;
      const inWindow = (!inicio || inicio <= now) && (!fin || fin >= now);
      return isActiveFlag && inWindow;
    });
    const base = active.length > 0 ? active : list;
    return base.sort((a, b) => {
      const aDate = a?.fechaInicio ? new Date(a.fechaInicio).getTime() : 0;
      const bDate = b?.fechaInicio ? new Date(b.fechaInicio).getTime() : 0;
      return bDate - aDate;
    });
  }, [safePromociones]);

  const currentPromo = heroPromos.length > 0
    ? heroPromos[promoIndex % heroPromos.length]
    : null;

  // ==================== EVENT HANDLERS ====================
  const handlePopularSlideChange = (newSlide) => {
    setCurrentPopularSlide(newSlide);
  };

  const handlePrevPromo = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setPromoIndex((prev) =>
        prev === 0 ? heroPromos.length - 1 : prev - 1
      );
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const handleNextPromo = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setPromoIndex((prev) =>
        prev === heroPromos.length - 1 ? 0 : prev + 1
      );
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
    touchEndX.current = null;
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartX.current == null || touchEndX.current == null) return;
    const delta = touchEndX.current - touchStartX.current;
    const threshold = 50;
    if (delta > threshold) {
      setSucursalIndex((i) => (i - 1 + totalSucursalPages) % totalSucursalPages);
    } else if (delta < -threshold) {
      setSucursalIndex((i) => (i + 1) % totalSucursalPages);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (promoIndex > 0 && promoIndex >= heroPromos.length) {
      setPromoIndex(0);
    }
  }, [heroPromos.length]);

  useEffect(() => {
    const updatePageSize = () => {
      const width = window.innerWidth;
      if (width < 640) setSucursalPageSize(1);
      else if (width < 768) setSucursalPageSize(2);
      else if (width < 1024) setSucursalPageSize(3);
      else setSucursalPageSize(4);
    };
    updatePageSize();
    window.addEventListener('resize', updatePageSize);
    return () => window.removeEventListener('resize', updatePageSize);
  }, []);

  useEffect(() => {
    if (sucursalIndex >= totalSucursalPages) setSucursalIndex(0);
  }, [totalSucursalPages]);

  useEffect(() => {
    if (!safeSucursales.length) return;
    if (isSucursalHover) return;
    autoplayRef.current && clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setSucursalIndex((i) => (i + 1) % totalSucursalPages);
    }, 5000);
    return () => autoplayRef.current && clearInterval(autoplayRef.current);
  }, [totalSucursalPages, safeSucursales.length, isSucursalHover]);

  useEffect(() => {
    const autoAnimate = setInterval(() => {
      if (!isAnimating) {
        handleNextPromo();
      }
    }, 5000);
    return () => clearInterval(autoAnimate);
  }, [isAnimating]);

  useEffect(() => {
    const popularTimer = setInterval(() => {
      setCurrentPopularSlide(
        (prev) => (prev + 1) % Math.ceil(safePopulars.length / 3)
      );
    }, 4000);
    return () => clearInterval(popularTimer);
  }, [safePopulars.length]);

  // ==================== ANIMATION VARIANTS ====================
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // ==================== MAIN RENDER ====================
  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white min-h-screen flex flex-col"
      >
        <Navbar />

        {/* Hero Section - Enhanced with Dynamic Background */}
<section className="relative min-h-[90vh] flex items-center overflow-hidden">
  {/* Dynamic Background with Blurred Promo Image */}
  <div className="absolute inset-0">
    <div />
    <AnimatePresence mode="wait">
      {currentPromo && getPromoImage(currentPromo) && (
        <motion.div
          key={`bg-${promoIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${getPromoImage(currentPromo)})`,
              filter: 'blur(5px) brightness(0.3)',
            }}
          />
          <div className="absolute inset-0 bg-cyan-500/30" />
        </motion.div>
      )}
    </AnimatePresence>
    <div className="absolute inset-0 bg-white/80 z-20" />
  </div>

  {/* Floating Elements */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#0097c2]/10 to-transparent rounded-full blur-3xl z-30" />
  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#00b4e4]/10 to-transparent rounded-full blur-3xl z-30" />
  
  <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 z-40">
    {loadingPromos ? (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#0097c2] rounded-full animate-spin mx-auto" />
          <p className="text-xl font-medium text-gray-600">Cargando promociones...</p>
        </div>
      </div>
    ) : errorPromos ? (
      <div className="flex items-center justify-center min-h-[60vh] text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <p className="text-xl font-medium text-red-600">Error al cargar promociones</p>
        </div>
      </div>
    ) : (
      <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
        {/* Content Section */}
        <div className="space-y-8 order-2 lg:order-1">
          <AnimatePresence mode="wait">
            {heroPromos.length > 0 ? (
              <motion.div
                key={`content-${promoIndex}`}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                className="space-y-6"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
                  {getPromoTitle(currentPromo)}
                </h1>

                <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg">
                  {getPromoDesc(currentPromo)}
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link
                    to="/productos?enPromocion=true"
                    className="group inline-flex items-center px-8 py-4 bg-cyan-600 hover:from-[#0083a8] hover:to-[#0097c2] text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                  >
                    Más información
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </Link>
                  <Link
                    to="/servicios"
                    className="group inline-flex items-center px-8 py-4 border-2 border-gray-300 hover:border-[#0097c2] text-gray-700 hover:text-[#0097c2] rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-lg backdrop-blur-sm bg-white/80"
                  >
                    Nuestros Servicios
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content-empty"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                  Cuidamos tu Visión
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                  Profesionales en salud visual con más de 10 años de experiencia
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Image Section */}
        <div className="relative flex items-center justify-center order-1 lg:order-2">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0097c2]/10 to-[#00b4e4]/10 rounded-full blur-3xl" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={`image-${promoIndex}`}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1 }}
              className="relative z-10 w-full"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0097c2]/20 to-transparent rounded-3xl blur-xl" />
                <img
                  src={getPromoImage(currentPromo) || Lente1}
                  alt={getPromoTitle(currentPromo) || "Lentes profesionales"}
                  className="relative w-full max-w-2xl mx-auto object-contain drop-shadow-2xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = Lente1;
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    )}
  </div>

  {/* Navigation Controls - FUERA del contenedor max-w-7xl */}
  {heroPromos.length > 1 && (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handlePrevPromo}
        className="absolute left-0 top-[55%] -translate-y-1/2 w-10 h-16 sm:w-12 sm:h-20 lg:w-14 lg:h-24 bg-white/90 backdrop-blur-sm hover:bg-white text-[#0097c2] rounded-r-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-50 border border-white/20 pl-1"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleNextPromo}
        className="absolute right-0 top-[55%] -translate-y-1/2 w-10 h-16 sm:w-12 sm:h-20 lg:w-14 lg:h-24 bg-white/90 backdrop-blur-sm hover:bg-white text-[#0097c2] rounded-l-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-50 border border-white/20 pr-1"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
      </motion.button>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-50">
        {heroPromos.map((_, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => setPromoIndex(index)}
            className={`transition-all duration-300 ${
              index === promoIndex
                ? "w-10 h-3 bg-[#0097c2] rounded-full shadow-lg"
                : "w-3 h-3 bg-gray-300 hover:bg-gray-400 rounded-full"
            }`}
          />
        ))}
      </div>
    </>
  )}
</section>



        {/* Brands Carousel - Enhanced */}
        <section className="py-16 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      
          <div className="relative">

            <BrandsCarousel
              brands={safeBrands}
              loading={loadingBrands}
              error={errorBrands}
              visibleItems={brandsVisibleItems}
            />
          </div>
        </section>

        {/* Popular Products - Compact */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50/20 via-transparent to-transparent" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <motion.h2 initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Lentes <span className="text-cyan-600">Destacados</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra selección de lentes más vendidos, elegidos por miles de clientes satisfechos
          </motion.p>

            </motion.div>
            
            {/* Wrapper con estilos personalizados para PopularCarousel */}
            <div className="popular-carousel-wrapper">
              <style>{`
                .popular-carousel-wrapper .popular-item {
                  max-width: 280px !important;
                }
                @media (max-width: 640px) {
                  .popular-carousel-wrapper .popular-item {
                    max-width: 250px !important;
                  }
                }
              `}</style>
              <PopularCarousel
                items={safePopulars}
                loading={loadingPopulars}
                error={errorPopulars}
                currentSlide={currentPopularSlide}
                onSlideChange={handlePopularSlideChange}
              />
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-white relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
              >
                Nuestros Servicios
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
              >
                Ofrecemos servicios profesionales de alta calidad para el cuidado integral de tu visión
              </motion.p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {[
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  ),
                  title: "Examen Visual Completo",
                  description: "Evaluación profesional con equipos de última generación para detectar problemas visuales."
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/>
                    </svg>
                  ),
                  title: "Garantía de Calidad",
                  description: "Todos nuestros productos incluyen garantía completa contra defectos de fabricación."
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M8.25 18.75a1.5 1.5 0 01-3 0V8.25a1.5 1.5 0 013 0v10.5zM12 12.75a1.5 1.5 0 01-3 0V6.75a1.5 1.5 0 013 0v6zM15.75 16.5a1.5 1.5 0 01-3 0V11.25a1.5 1.5 0 013 0v5.25zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  ),
                  title: "Entrega Rápida",
                  description: "Procesamiento eficiente de pedidos con entrega en tiempo récord sin comprometer calidad."
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                    </svg>
                  ),
                  title: "Envío Gratuito",
                  description: "Envío sin costo adicional en compras superiores a $75. Cobertura en todo el país."
                }
              ].map((service, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0097c2] to-[#00b4e4] text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-[#0097c2] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <br />
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
                <h3 className="font-semibold mb-2">
                  Examen Visual Profesional
                </h3>
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
                  Todos nuestros productos cuentan con garantía contra defectos
                  de fabricación.
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
                  Recibe tus lentes en tiempo récord, con la graduación exacta
                  que necesitas.
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
        <br />
        <br />
        <br />

        {/* Sucursales dinámicas desde la API */}
        <motion.section
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-4 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Nuestras Sucursales</h2>
          {loadingSucursales ? (
            <div className="h-56 rounded-2xl bg-gray-100 animate-pulse max-w-3xl mx-auto" />
          ) : errorSucursales ? (
            <div className="text-center text-red-600">Error al cargar sucursales.</div>
          ) : safeSucursales.length === 0 ? (
            <div className="text-center text-gray-500">No hay sucursales para mostrar.</div>
          ) : (
            <div
              className="relative max-w-6xl mx-auto overflow-hidden rounded-2xl bg-gray-50 p-3 sm:p-4"
              onMouseEnter={() => setIsSucursalHover(true)}
              onMouseLeave={() => setIsSucursalHover(false)}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
                {(() => {
                  const start = sucursalIndex * sucursalPageSize;
                  const end = Math.min(start + sucursalPageSize, safeSucursales.length);
                  const visibleSucursales = safeSucursales.slice(start, end);
                  const isSingle = visibleSucursales.length === 1;
                  return visibleSucursales.map((suc, idx) => {
                    const nombre = suc.nombre || suc.nombreSucursal || suc.nombre_sucursal || suc.titulo || 'Sucursal';
                    const rawDireccion = suc.direccion ?? suc.ubicacion ?? suc.address ?? '';
                    const direccion = (rawDireccion && typeof rawDireccion === 'object')
                      ? [rawDireccion.calle, rawDireccion.ciudad, rawDireccion.departamento, rawDireccion.pais].filter(Boolean).join(', ')
                      : (rawDireccion || '');
                    const rawTelefono = suc.telefono ?? suc.telefono1 ?? suc.phone ?? '';
                    const telefono = (rawTelefono && typeof rawTelefono === 'object')
                      ? [rawTelefono.whatsapp, rawTelefono.fijo, rawTelefono.movil].filter(Boolean).join(' / ')
                      : (rawTelefono || '');
                    const rawHorario = suc.horario ?? suc.horarios ?? '';
                    const horario = (rawHorario && typeof rawHorario === 'object')
                      ? Object.values(rawHorario).filter(Boolean).join(' | ')
                      : (rawHorario || '');
                    const lat = suc.lat || suc.latitud || suc.latitude;
                    const lng = suc.lng || suc.longitud || suc.longitude;
                    const mapsQuery = lat && lng ? `${lat},${lng}` : encodeURIComponent(direccion || nombre);
                    const mapsLink = `https://www.google.com/maps?q=${mapsQuery}`;
                    const mapsEmbed = `${mapsLink}&output=embed`;
                    return (
                      <motion.div
                        key={suc._id || suc.id || `${sucursalIndex}-${idx}`}
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        whileHover={{ scale: 1.01 }}
                        className={`rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 h-full ${isSingle ? 'md:col-span-2' : ''}`}
                      >
                        <div className="p-5 sm:p-6 flex flex-col h-full">
                          <div className="flex items-center mb-3">
                            <div className="p-2 bg-[#0097c2]/10 text-[#0097c2] rounded-lg mr-3">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900">{nombre}</h3>
                          </div>
                          {direccion && <p className="text-gray-600 mb-3">{direccion}</p>}
                          <div className="space-y-2 text-sm text-gray-700">
                            {horario && (
                              <p className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {horario}
                              </p>
                            )}
                            {telefono && (
                              <p className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                {telefono}
                              </p>
                            )}
                          </div>
                          <div className="mt-4">
                            <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-[#0097c2] hover:bg-[#0083a8] text-white px-4 py-2 rounded-lg font-semibold shadow transition">
                              Ver en Google Maps
                              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </a>
                          </div>
                          <div className="mt-4 h-48 md:h-56 lg:h-64 w-full bg-gray-100 rounded-xl overflow-hidden">
                            <iframe title={`map-${suc._id || idx}`} src={mapsEmbed} className="w-full h-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                })()}
              </div>
              {/* Controles */}
              <button
                aria-label="Anterior"
                onClick={() => setSucursalIndex((i) => (i - 1 + totalSucursalPages) % totalSucursalPages)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#0097c2] border border-gray-200 rounded-full w-10 h-10 md:w-12 md:h-12 shadow-xl backdrop-blur flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                aria-label="Siguiente"
                onClick={() => setSucursalIndex((i) => (i + 1) % totalSucursalPages)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#0097c2] border border-gray-200 rounded-full w-10 h-10 md:w-12 md:h-12 shadow-xl backdrop-blur flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              {/* Dots */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {Array.from({ length: totalSucursalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSucursalIndex(i)}
                    className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all ${i === sucursalIndex ? 'bg-[#0097c2] ring-2 ring-[#0097c2]/30' : 'bg-gray-300 hover:bg-gray-400'}`}
                    aria-label={`Ir a sucursales página ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.section>

        <br />
        <br />
        <br />
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
                src="https://i.pravatar.cc/56?img=1"
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
                src="https://i.pravatar.cc/56?img=2"
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
                src="https://i.pravatar.cc/56?img=3"
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

        <br />
        <br />
        <br />
        <br />
        <br />
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
                </div>
                <p className="text-sm text-gray-100">
                  Comprometidos con tu Salud Visual desde 2010. Ofrecemos
                  Servicios Profesionales y Productos de Alta Calidad para el
                  Cuidado de tus Ojos.
                </p>
                <div className="flex space-x-4 mt-4">
                  <a
                    href="https://facebook.com"
                    className="transition-colors p-2 rounded-full text-white hover:bg-white/20"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a
                    href="https://instagram.com"
                    className="transition-colors p-2 rounded-full text-white hover:bg-white/20"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a
                    href="https://wa.me/1234567890"
                    className="transition-colors p-2 rounded-full text-white hover:bg-white/20"
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
                      href="/A.U.R.O.R.A/servicios"
                      className="hover:text-gray-200 transition-colors flex items-center"
                    >
                      <span className="mr-2">→</span>
                      Examen Visual
                    </a>
                  </li>
                  <li>
                    <a
                      href="/A.U.R.O.R.A/servicios"
                      className="hover:text-gray-200 transition-colors flex items-center"
                    >
                      <span className="mr-2">→</span>
                      Adaptación de Lentes
                    </a>
                  </li>
                  <li>
                    <a
                      href="/A.U.R.O.R.A/servicios"
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
                      href="/A.U.R.O.R.A/nosotros"
                      className="hover:text-gray-200 transition-colors flex items-center"
                    >
                      <span className="mr-2">→</span>
                      Sobre Nosotros
                    </a>
                  </li>
                  <li>
                    <a
                      href="/A.U.R.O.R.A/nosotros"
                      className="hover:text-gray-200 transition-colors flex items-center"
                    >
                      <span className="mr-2">→</span>
                      Historia
                    </a>
                  </li>
                  <li>
                    <a
                      href="/A.U.R.O.R.A/nosotros"
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
                        strokeLinejoin="round"strokeWidth={2}
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