import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../../components/transition/PageTransition";
import Navbar from "../../components/layout/Navbar";
import API_CONFIG, { buildApiUrl } from "../../config/api";
import { useAuth } from "../../components/auth/AuthContext";

const AgendarCitas = () => {
  const [step, setStep] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    email: "",
    motivo: "",
    sucursalId: "",
    optometristaId: "",
    fecha: "",
    hora: "",
    tipoLente: "",
    graduacion: "",
    notasAdicionales: "",
    contacto: "telefono",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sucursales, setSucursales] = useState([]);
  const [optometristas, setOptometristas] = useState([]);
  const { user } = useAuth?.() || {};

  const [horarios, setHorarios] = useState({ Lun: [], Mar: [], Mie: [], Jue: [], Vie: [], Sab: [], Dom: [] });
  const [horasGrid, setHorasGrid] = useState(["9:00", "10:00", "11:00", "12:00", "13:00"]);

  // Helper para mostrar nombre de optometrista con fallback legible
  const getOptometristaNombre = (o) => {
    if (!o) return "Optometrista";
    const emp = o.empleadoId;
    const nombre = emp?.nombre?.trim?.() || "";
    const apellido = emp?.apellido?.trim?.() || "";
    const full = `${nombre} ${apellido}`.trim();
    if (full) return full;
    const suffix = (o._id || "").slice(-6).toUpperCase();
    return `Optometrista ${suffix || o._id || ""}`.trim();
  };

  const getMonday = (date) => {
    const now = new Date(date);
    const day = now.getDay(); // 0=Sun..6=Sat
    const mondayOffset = (day + 6) % 7; // days since Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));

  const dayNames = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
  const getWeekDays = () => {
    return dayNames.map((_, idx) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + idx);
      return d;
    });
  };

  // Helpers para manejar horas y disponibilidad
  const toMinutes = (str) => {
    if (!str) return null;
    const [h, m] = String(str).split(":").map((n) => parseInt(n, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };
  const toHourStr = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}:${String(m).padStart(2, "0")}`;
  };
  // Genera slots cada 60 minutos entre inicio (incl) y fin (excl)
  const generarSlots = (horaInicio, horaFin) => {
    const start = toMinutes(horaInicio);
    const end = toMinutes(horaFin);
    if (start == null || end == null || end <= start) return [];
    const out = [];
    for (let t = start; t < end; t += 60) out.push(toHourStr(t));
    return out;
  };
  // Normaliza día del backend a claves usadas en UI: Lun, Mar, Mie, Jue, Vie, Sab, Dom
  const normalizeDia = (raw) => {
    if (raw === undefined || raw === null) return null;
    const map = {
      lun: "Lun", lunes: "Lun", mon: "Lun", monday: "Lun",
      mar: "Mar", martes: "Mar", tue: "Mar", tuesday: "Mar",
      mie: "Mie", miércoles: "Mie", miercoles: "Mie", wed: "Mie", wednesday: "Mie",
      jue: "Jue", jueves: "Jue", thu: "Jue", thursday: "Jue",
      vie: "Vie", viernes: "Vie", fri: "Vie", friday: "Vie",
      sab: "Sab", sábado: "Sab", sabado: "Sab", sat: "Sab", saturday: "Sab",
      dom: "Dom", domingo: "Dom", sun: "Dom", sunday: "Dom",
    };
    if (typeof raw === 'number') {
      // 1..7 => Lun..Dom (1=Lun)
      return ["Lun","Mar","Mie","Jue","Vie","Sab","Dom"][Math.max(1, Math.min(7, raw)) - 1] || null;
    }
    const key = String(raw).trim().toLowerCase();
    return map[key] || null;
  };

  // Recalcular horarios y grid de horas cuando cambia el optometrista
  useEffect(() => {
    const empty = { Lun: [], Mar: [], Mie: [], Jue: [], Vie: [], Sab: [], Dom: [] };
    if (!formData.optometristaId) {
      setHorarios(empty);
      setHorasGrid(["9:00", "10:00", "11:00", "12:00", "13:00"]);
      return;
    }
    const opt = optometristas.find((o) => o._id === formData.optometristaId);
    if (!opt) {
      setHorarios(empty);
      setHorasGrid(["9:00", "10:00", "11:00", "12:00", "13:00"]);
      return;
    }
    const map = { ...empty };
    (opt.disponibilidad || []).forEach((d) => {
      const dia = normalizeDia(d?.dia);
      if (!dia || !map[dia]) return;
      const slots = generarSlots(d?.horaInicio, d?.horaFin);
      if (!slots.length) return;
      const uniq = new Set([...(map[dia] || []), ...slots]);
      map[dia] = Array.from(uniq).sort((a, b) => toMinutes(a) - toMinutes(b));
    });
    // Construir grid de filas como la unión ordenada de todas las horas de la semana
    const union = new Set();
    Object.values(map).forEach((arr) => arr.forEach((h) => union.add(h)));
    const grid = Array.from(union).sort((a, b) => toMinutes(a) - toMinutes(b));
    setHorarios(map);
    setHorasGrid(grid.length ? grid : ["9:00", "10:00", "11:00", "12:00", "13:00"]);
  }, [formData.optometristaId, optometristas]);

  // Cargar opciones de sucursales y optometristas
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [sRes, oRes] = await Promise.all([
          fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SUCURSALES), API_CONFIG.FETCH_CONFIG),
          fetch(buildApiUrl(API_CONFIG.ENDPOINTS.OPTOMETRISTAS), API_CONFIG.FETCH_CONFIG),
        ]);
        const [sData, oData] = await Promise.all([sRes.json(), oRes.json()]);
        setSucursales(Array.isArray(sData) ? sData : []);
        setOptometristas(Array.isArray(oData) ? oData : []);
      } catch (e) {
        console.error('Error cargando opciones', e);
      }
    };
    fetchOptions();
  }, []);

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
        // Requiere inicio de sesión para asociar la cita al cliente
        const clienteId = user?._id || user?.id;
        if (!clienteId) {
          throw new Error('Inicia sesión para agendar tu cita.');
        }

        // Validaciones mínimas requeridas por backend
        const required = ['sucursalId', 'optometristaId', 'fecha', 'hora', 'motivo', 'tipoLente', 'graduacion'];
        for (const k of required) {
          if (!formData[k]) {
            throw new Error('Completa todos los campos requeridos.');
          }
        }

        const payload = {
          clienteId,
          optometristaId: formData.optometristaId,
          sucursalId: formData.sucursalId,
          fecha: formData.fecha ? new Date(formData.fecha) : null,
          hora: formData.hora,
          estado: 'pendiente',
          motivoCita: formData.motivo,
          tipoLente: formData.tipoLente,
          graduacion: formData.graduacion,
          notasAdicionales: formData.notasAdicionales || ''
        };

        const res = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CITAS), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: API_CONFIG.FETCH_CONFIG.credentials,
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || 'Error al agendar la cita');
        }
        setSuccess(true);
        setFormData({
          nombres: "",
          apellidos: "",
          telefono: "",
          email: "",
          motivo: "",
          sucursalId: "",
          optometristaId: "",
          fecha: "",
          hora: "",
          tipoLente: "",
          graduacion: "",
          notasAdicionales: "",
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
                placeholder="Motivo de cita (Ej. Examen visual)"
                value={formData.motivo}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all"
                required
              />
            </div>
            <div>
              <select
                name="sucursalId"
                value={formData.sucursalId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all"
                required
              >
                <option value="">Seleccionar sucursal</option>
                {sucursales.map(s => (
                  <option key={s._id} value={s._id}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                name="optometristaId"
                value={formData.optometristaId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all"
                required
              >
                <option value="">Seleccionar optometrista</option>
                {optometristas.map(o => (
                  <option key={o._id} value={o._id}>
                    {getOptometristaNombre(o)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="text"
                name="tipoLente"
                placeholder="Tipo de lente (Ej. Monofocal)"
                value={formData.tipoLente}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all"
                required
              />
            </div>
            <div>
              <input
                type="text"
                name="graduacion"
                placeholder="Graduación (Ej. -1.25)"
                value={formData.graduacion}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all"
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h3 className="text-sm font-medium">Selecciona una hora</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(weekStart);
                      d.setDate(weekStart.getDate() - 7);
                      setWeekStart(d);
                    }}
                    className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
                  >
                    ◀ Semana anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeekStart(getMonday(new Date()))}
                    className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
                  >
                    Esta semana
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(weekStart);
                      d.setDate(weekStart.getDate() + 7);
                      setWeekStart(d);
                    }}
                    className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
                  >
                    Semana siguiente ▶
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                {(() => {
                  const weekDays = getWeekDays();
                  const formatDM = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
                  const hours = horasGrid;
                  const opt = optometristas.find(o => o._id === formData.optometristaId);
                  const sucMismatch = opt && formData.sucursalId && !(opt.sucursalesAsignadas || []).some(s => (s._id || s) === formData.sucursalId);
                  const now = new Date();
                  return (
                    <>
                    {sucMismatch && (
                      <div className="mb-3 text-xs sm:text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                        El optometrista seleccionado no atiende en la sucursal elegida. Cambia de sucursal u optometrista.
                      </div>
                    )}
                    <table className="w-full text-xs sm:text-sm md:text-base">
                      <thead>
                        <tr>
                          {dayNames.map((dia, i) => (
                            <th key={dia} className="py-2">
                              <div className="flex flex-col items-center">
                                <span>{dia}</span>
                                <span className="text-[11px] text-gray-500">{formatDM(weekDays[i])}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {hours.map((hora) => (
                          <tr key={hora}>
                            {dayNames.map((dia, i) => {
                              const dayDate = weekDays[i];
                              const iso = new Date(dayDate.getTime());
                              iso.setHours(0, 0, 0, 0);
                              const isoStr = iso.toISOString();
                              const available = horarios[dia]?.includes(hora);
                              // Calcular si el slot ya pasó
                              const [hh, mm] = hora.split(":").map((x) => parseInt(x, 10));
                              const slotDate = new Date(dayDate.getTime());
                              slotDate.setHours(hh || 0, mm || 0, 0, 0);
                              const isPast = slotDate.getTime() < now.getTime();
                              const disabled = !available || isPast;
                              const selected = !disabled && formData.hora === hora && formData.fecha && new Date(formData.fecha).toDateString() === iso.toDateString();
                              return (
                                <td key={`${dia}-${hora}`} className="p-2 text-center">
                                  {!disabled ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleInputChange({ target: { name: "hora", value: hora } });
                                        handleInputChange({ target: { name: "fecha", value: isoStr } });
                                      }}
                                      className={`w-full py-2 rounded-lg transition-all ${selected ? "bg-[#0097c2] text-white" : "bg-gray-50 hover:bg-gray-100"}`}
                                    >
                                      {hora}
                                    </button>
                                  ) : (
                                    <span className="text-gray-400">No disponible</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </>
                  );
                })()}
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
            <h3 className="font-semibold mb-4">Forma de Contacto</h3>
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
                <span>Número Telefónico</span>
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
    </PageTransition>
  );
};

export default AgendarCitas;
