import React from "react";
import Navbar from "../../components/layout/Navbar";
import PageTransition from "../../components/transition/PageTransition";

const Nosotros = () => {
  return (
    <PageTransition>
      <Navbar />
      <div className="font-['Lato'] bg-gray-50">
        {/* Hero Section */}
        <section className="bg-[#0097c2] text-white py-16 sm:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0097c2] to-[#00b4e4] opacity-90"></div>
          <div className="container mx-auto px-2 sm:px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">
                Óptica la Inteligente
              </h1>
              <p className="text-base sm:text-xl opacity-90">
                Cuidando tu visión desde hace más de una década
              </p>
            </div>
          </div>
        </section>

        {/* Historia Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Nuestra Historia
            </h2>
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Fundada en 2010, Nuestra Historia comenzó en un pequeño local
                en el centro de la ciudad. Con dedicación y trabajo duro, hemos
                crecido hasta convertirnos en una referencia en servicios
                ópticos de calidad.
              </p>
            </div>
          </div>
        </section>

        {/* Misión y Visión Grid */}
        <section className="py-10 sm:py-16">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Misión Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
                <div className="flex flex-col h-full">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Misión
                  </h2>
                  <p className="text-gray-600 leading-relaxed flex-grow">
                    Ofrecer soluciones visuales accesibles y de alta calidad a los
                    salvadoreños, con atención cercana y asesoría experta,
                    respaldados por la garantía y los valores de servicio,
                    gratitud y empatía que han guiado a nuestra óptica desde sus
                    inicios.
                  </p>
                </div>
              </div>

              {/* Visión Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
                <div className="flex flex-col h-full">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Visión
                  </h2>
                  <p className="text-gray-600 leading-relaxed flex-grow">
                    Ser una óptica líder a nivel nacional, reconocida por la
                    excelencia de sus servicios y su compromiso con la salud visual
                    de todos nuestros pacientes, sin perder jamás la solidaridad
                    ni el espíritu familiar que nos define.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Valores Section with Icons */}
        <section className="py-10 sm:py-20 bg-white">
          <div className="container mx-auto px-2 sm:px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-12">
              Nuestros Valores
            </h2>
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  title: "Compromiso",
                  description:
                    "Dedicación total a la salud visual de nuestros pacientes.",
                  icon: (
                    <svg
                      className="w-12 h-12 text-[#0097c2]"
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
                  ),
                },
                {
                  title: "Calidad",
                  description:
                    "Excelencia en cada servicio y producto que ofrecemos.",
                  icon: (
                    <svg
                      className="w-12 h-12 text-[#0097c2]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Empatía",
                  description:
                    "Comprensión y atención personalizada para cada paciente.",
                  icon: (
                    <svg
                      className="w-12 h-12 text-[#0097c2]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  ),
                },
              ].map((valor, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all text-center"
                >
                  <div className="flex justify-center mb-6">{valor.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {valor.title}
                  </h3>
                  <p className="text-gray-600">{valor.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Estadísticas Section */}
        <section className="py-10 sm:py-16 bg-[#0097c2] text-white">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-center">
              {[
                { number: "10+", label: "Años de Experiencia" },
                { number: "5000+", label: "Pacientes Atendidos" },
                { number: "2", label: "Sucursales" },
                { number: "100%", label: "Satisfacción" },
              ].map((stat, index) => (
                <div key={index} className="p-6">
                  <div className="text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-lg opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="bg-gradient-to-r from-[#0097c2] to-[#00b4e4] text-white">
          <div className="max-w-7xl mx-auto">
            {/* Top Footer with main content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-4 py-12">
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
      </div>
    </PageTransition>
  );
};

export default Nosotros;
