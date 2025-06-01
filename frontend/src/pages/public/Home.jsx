import React from "react";
import "animate.css";

const Home = () => {
  return (
    <div
      className="bg-white min-h-screen flex flex-col"
      style={{ height: "100vh", width: "100%" }}
    >
      {/* Barra superior */}
      <div className="bg-[#0097c2] text-white text-sm py-2 px-4 flex flex-col md:flex-row justify-center items-center">
        <span>Envío gratis en compras mayores a $1000</span>
        <a href="/promociones" className="ml-2 underline">
          Ver más
        </a>
      </div>

      {/* Info de contacto */}
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

      {/* Navbar */}
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
              <a href="/" className="hover:text-[#0097c2]">
                Inicio
              </a>
            </li>
            <li>
              <a href="/productos" className="hover:text-[#0097c2]">
                Productos
              </a>
            </li>
            <li>
              <a href="/cotizaciones" className="hover:text-[#0097c2]">
                Cotizaciones
              </a>
            </li>
            <li>
              <a href="/servicios" className="hover:text-[#0097c2]">
                Servicios
              </a>
            </li>
            <li>
              <a href="/agendar" className="hover:text-[#0097c2]">
                Agendar Citas
              </a>
            </li>
            <li>
              <a href="/nosotros" className="hover:text-[#0097c2]">
                Nosotros
              </a>
            </li>
          </ul>
          <a
            href="/login"
            className="bg-[#0097c2] text-white px-4 py-2 rounded-full shadow hover:bg-[#0077a2] transition"
          >
            Iniciar Sesión
          </a>
        </div>
      </nav>

      {/* Hero principal */}
      <section className="flex flex-col md:flex-row items-center justify-between bg-[#0097c2] rounded-2xl mx-auto mt-8 mb-8 max-w-5xl p-8 shadow-lg animate__animated animate__slideInDown">
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
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center border animate__animated animate__fadeIn animate__delay-1s">
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
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center border animate__animated animate__fadeIn animate__delay-1s">
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
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center border animate__animated animate__fadeIn animate__delay-1s">
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
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center border animate__animated animate__fadeIn animate__delay-1s">
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
          <div className="rounded-xl overflow-hidden shadow-lg relative group animate__animated animate__zoomIn">
            <img
              src="/img/categoria-hombre.jpg"
              alt="Hombres"
              className="w-full h-40 object-cover group-hover:scale-105 transition"
            />
            <span className="absolute bottom-2 left-2 text-white text-lg font-semibold bg-black/40 px-3 py-1 rounded">
              Hombres
            </span>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg relative group animate__animated animate__zoomIn">
            <img
              src="/img/categoria-mujer.jpg"
              alt="Mujeres"
              className="w-full h-40 object-cover group-hover:scale-105 transition"
            />
            <span className="absolute bottom-2 left-2 text-white text-lg font-semibold bg-black/40 px-3 py-1 rounded">
              Mujeres
            </span>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg relative group animate__animated animate__zoomIn">
            <img
              src="/img/categoria-nino.jpg"
              alt="Niños"
              className="w-full h-40 object-cover group-hover:scale-105 transition"
            />
            <span className="absolute bottom-2 left-2 text-white text-lg font-semibold bg-black/40 px-3 py-1 rounded">
              Niños
            </span>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg relative group animate__animated animate__zoomIn">
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
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border animate__animated animate__fadeInLeft">
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
              el examen visual fue muy profesional. ¡Definitivamente regresaré!
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
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border animate__animated animate__fadeInLeft">
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
              personal es muy amable y me ayudaron a elegir el armazón perfecto
              para mi rostro.
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
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border animate__animated animate__fadeInLeft">
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
              fue muy rápido y el seguimiento post-venta es de calidad realmente
              valiosa.
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0097c2] text-white rounded-2xl p-6 flex flex-col items-start shadow">
            <h3 className="font-semibold text-lg mb-2">Sucursal Principal</h3>
            <p className="mb-2">
              Colonia Médica, Avenida Dr. Max Bloch #23, San Salvador.
            </p>
            <a
              href="https://maps.google.com"
              className="bg-white text-[#0097c2] px-4 py-2 rounded-full font-semibold shadow hover:bg-gray-100 transition"
            >
              Ver mapa
            </a>
          </div>
          <div className="bg-[#0097c2] text-white rounded-2xl p-6 flex flex-col items-start shadow">
            <h3 className="font-semibold text-lg mb-2">
              Sucursal Quezaltepeque
            </h3>
            <p className="mb-2">
              1ra Avenida Norte y 8va Calle Poniente, #22, Quezaltepeque, La
              Libertad.
            </p>
            <a
              href="https://maps.google.com"
              className="bg-white text-[#0097c2] px-4 py-2 rounded-full font-semibold shadow hover:bg-gray-100 transition"
            >
              Ver mapa
            </a>
          </div>
          <div className="bg-[#0097c2] text-white rounded-2xl p-6 flex flex-col items-start shadow">
            <h3 className="font-semibold text-lg mb-2">
              Sucursal Quezaltepeque
            </h3>
            <p className="mb-2">
              1ra Avenida Norte y 8va Calle Poniente, #22, Quezaltepeque, La
              Libertad.
            </p>
            <a
              href="https://maps.google.com"
              className="bg-white text-[#0097c2] px-4 py-2 rounded-full font-semibold shadow hover:bg-gray-100 transition"
            >
              Ver mapa
            </a>
          </div>
        </div>
      </section>

      {/* Nuestras marcas */}
      <section className="max-w-6xl mx-auto px-4 mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Nuestras marcas</h2>
        <div className="flex justify-center items-center gap-8">
          <img
            src="/img/marca-converse.png"
            alt="Converse"
            className="w-20 h-20 rounded-full bg-white shadow"
          />
          <img
            src="/img/marca-puma.png"
            alt="Puma"
            className="w-20 h-20 rounded-full bg-white shadow"
          />
          <img
            src="/img/marca-true.png"
            alt="True"
            className="w-20 h-20 rounded-full bg-white shadow"
          />
        </div>
      </section>

      {/* Populares */}
      <section className="max-w-6xl mx-auto px-4 mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Populares</h2>
        <div className="flex justify-center gap-6 bg-[#0097c2] rounded-2xl py-6">
          <img
            src="/img/popular1.png"
            alt="Popular 1"
            className="w-28 h-28 object-contain bg-white rounded-full shadow"
          />
          <img
            src="/img/popular2.png"
            alt="Popular 2"
            className="w-28 h-28 object-contain bg-white rounded-full shadow"
          />
          <img
            src="/img/popular3.png"
            alt="Popular 3"
            className="w-28 h-28 object-contain bg-white rounded-full shadow"
          />
          <img
            src="/img/popular4.png"
            alt="Popular 4"
            className="w-28 h-28 object-contain bg-white rounded-full shadow"
          />
        </div>
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
              className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border"
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
      <footer className="bg-[#0097c2] text-white py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="md:col-span-1">
            <h2 className="font-bold text-lg mb-4">Óptica La Inteligente</h2>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Servicios</h3>
            <ul className="space-y-1 text-sm">
              <li>Examen Visual</li>
              <li>Adaptación de lentes</li>
              <li>Reparaciones</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Sobre Nosotros</h3>
            <ul className="space-y-1 text-sm">
              <li>Historia</li>
              <li>Misión y Visión</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Atención al Cliente</h3>
            <ul className="space-y-1 text-sm">
              <li>Contacto</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Síguenos</h3>
            <div className="flex space-x-3 mt-2">
              <a href="https://facebook.com" className="hover:text-gray-200">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://instagram.com" className="hover:text-gray-200">
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://wa.me/1234567890"
                className="hover:text-gray-200"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

<style jsx>{`
  .home-container {
    opacity: 0;
    animation: fadeIn 1s ease-in forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Enhanced hover effects */
  button,
  .group {
    transition: all 0.3s ease-in-out;
  }

  button:hover {
    transform: scale(1.05);
  }

  .group:hover img {
    transform: scale(1.1);
  }

  /* Floating animation for cards */
  .shadow {
    transition: all 0.3s ease-in-out;
  }

  .shadow:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  /* Pulse animation for CTA buttons */
  .bg-[#0097c2]:not(nav, footer) {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(0, 151, 194, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(0, 151, 194, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(0, 151, 194, 0);
    }
  }

  /* Smooth scroll behavior */
  html {
    scroll-behavior: smooth;
  }

  /* Shimmer effect for images */
  .shimmer {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  /* Bounce animation for icons */
  .bounce-hover:hover {
    animation: bounce 0.5s ease infinite;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  /* Rotating border effect */
  .rotating-border {
    position: relative;
    overflow: hidden;
  }

  .rotating-border::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(from 0deg, transparent 0deg, #0097c2 360deg);
    animation: rotate 4s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Text gradient animation */
  .text-gradient {
    background: linear-gradient(45deg, #0097c2, #00c2a8, #0097c2);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradient 3s linear infinite;
  }

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  /* Scale animation for sections */
  .scale-in {
    opacity: 0;
    transform: scale(0.95);
    transition: all 0.5s ease-out;
  }

  .scale-in.visible {
    opacity: 1;
    transform: scale(1);
  }

  /* Card flip effect */
  .card-flip {
    perspective: 1000px;
    transform-style: preserve-3d;
    transition: transform 0.6s;
  }

  .card-flip:hover {
    transform: rotateY(180deg);
  }

  /* Glow effect on hover */
  .glow-hover:hover {
    box-shadow: 0 0 15px rgba(0, 151, 194, 0.6);
  }

  /* Wave animation */
  .wave {
    position: relative;
    overflow: hidden;
  }

  .wave::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 10px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: wave 2s linear infinite;
  }

  @keyframes wave {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`}</style>;
