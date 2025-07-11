import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../../components/transition/PageTransition";
import Navbar from "../../components/layout/Navbar";

const AgendarCitas = () => {
  const [step, setStep] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    email: "",
    motivo: "",
    sucursal: "",
    fecha: "",
    hora: "",
    contacto: "telefono", // Default contact method
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const horarios = {
    Lun: ["9:00", "10:00", "11:00", "12:00"],
    Mar: ["9:00", "11:00", "13:00"],
    Mie: ["10:00", "12:00"],
    Jue: ["9:00", "11:00"],
    Vie: ["10:00", "12:00"],
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 3) {
      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
        const res = await fetch('http://localhost:3001/citas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Error al agendar la cita');
        setSuccess(true);
        setFormData({
          nombres: "",
          apellidos: "",
          telefono: "",
          email: "",
          motivo: "",
          sucursal: "",
          fecha: "",
          hora: "",
          contacto: "telefono",
        });
        setStep(1);
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                name="nombres"
                placeholder="Nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all"
                required
              />
            </div>
            <div>
              <input
                type="text"
                name="apellidos"
                placeholder="Apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all"
                required
              />
            </div>
            <div>
              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all"
                required
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all"
                required
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="text"
                name="motivo"
                placeholder="Motivo de cita"
                value={formData.motivo}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all"
                required
              />
            </div>
            <div className="md:col-span-2">
              <select
                name="sucursal"
                value={formData.sucursal}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all"
                required
              >
                <option value="">Seleccionar sucursal</option>
                <option value="principal">Sucursal Principal</option>
                <option value="quezaltepeque">Sucursal Quezaltepeque</option>
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm md:text-base">
                  <thead>
                    <tr>
                      <th className="py-2">Lun</th>
                      <th className="py-2">Mar</th>
                      <th className="py-2">Mie</th>
                      <th className="py-2">Jue</th>
                      <th className="py-2">Vie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["9:00", "10:00", "11:00", "12:00", "13:00"].map((hora) => (
                      <tr key={hora}>
                        {["Lun", "Mar", "Mie", "Jue", "Vie"].map((dia) => (
                          <td key={`${dia}-${hora}`} className="p-2 text-center">
                            {horarios[dia]?.includes(hora) ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleInputChange({
                                    target: { name: "hora", value: `${dia} ${hora}` },
                                  })
                                }
                                className={`w-full py-2 rounded-lg transition-all ${
                                  formData.hora === `${dia} ${hora}`
                                    ? "bg-[#0097c2] text-white"
                                    : "bg-gray-50 hover:bg-gray-100"
                                }`}
                              >
                                {hora}
                              </button>
                            ) : (
                              <span className="text-gray-400">No disponible</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {Object.values(horarios).every(arr => arr.length === 0) && (
                <div className="text-center text-gray-500 mt-4">No hay horarios disponibles actualmente.</div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold mb-4">Forma de contacto</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="contacto"
                  value="telefono"
                  checked={formData.contacto === "telefono"}
                  onChange={handleInputChange}
                  className="text-[#0097c2] focus:ring-[#0097c2]"
                />
                <span>Número telefónico</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="contacto"
                  value="email"
                  checked={formData.contacto === "email"}
                  onChange={handleInputChange}
                  className="text-[#0097c2] focus:ring-[#0097c2]"
                />
                <span>Correo Electrónico</span>
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <Navbar />
      <div className="container mx-auto px-2 sm:px-4 py-8 font-['Lato'] min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto">
          {/* Notification */}
          <AnimatePresence>
            {showNotification && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Cita agendada exitosamente</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card Container */}
          <motion.div
            layout
            className="bg-white rounded-xl shadow-sm p-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800 text-center">Agendar Cita</h1>

            {/* Progress Steps - More minimal version */}
            <div className="flex items-center justify-center mb-12">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <motion.div
                    animate={{
                      backgroundColor: step >= num ? "#0097c2" : "#e5e7eb",
                      color: step >= num ? "#ffffff" : "#6b7280",
                    }}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
                  >
                    {num}
                  </motion.div>
                  {num < 3 && (
                    <motion.div
                      animate={{
                        backgroundColor: step > num ? "#0097c2" : "#e5e7eb",
                      }}
                      className="w-16 h-0.5"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Form with animation */}
            <motion.form
              layout
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">Cita agendada correctamente.</div>}
              {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>

              <motion.div layout className="flex justify-end space-x-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(prev => prev - 1)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Atrás
                  </button>
                )}
                <button
                  type="submit"
                  className="w-full bg-[#0097c2] text-white py-2 rounded-full hover:bg-[#0077a2] transition text-sm sm:text-base"
                >
                  {step === 3 ? "Finalizar" : "Siguiente"}
                </button>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      </div>
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
    </PageTransition>
  );
};

export default AgendarCitas;
