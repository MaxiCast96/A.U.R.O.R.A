import React from 'react';
import { Link } from 'react-router-dom';

const ExamenVisualCard = () => {
  return (
    <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#0097c2] to-[#00b4e4] text-white p-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">
            Examen Visual Profesional
          </h2>
          <p className="text-white/90 mb-6">
            Nuestro Examen Visual completo evalúa la salud de tus ojos y determina
            si necesitas corrección visual utilizando tecnología de vanguardia.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Benefits Card */}
            <div className="bg-gray-50/50 p-6 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-[#0097c2]/5 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-[#0097c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  Beneficios Incluidos
                </h4>
              </div>
              <ul className="space-y-3">
                {[
                  "Evaluación completa de salud ocular",
                  "Medición precisa de graduación",
                  "Detección temprana de problemas",
                  "Asesoría personalizada",
                  "Recomendaciones específicas",
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-600 group">
                    <svg
                      className="w-5 h-5 mr-3 text-[#0097c2] group-hover:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Service Info Card */}
            <div className="bg-gray-50/50 p-6 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-[#0097c2]/5 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-[#0097c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  Información del Servicio
                </h4>
              </div>
              <ul className="space-y-4">
                {[
                  { icon: "⏱️", text: "Duración: 30 minutos aproximadamente" },
                  { icon: "✅", text: "Resultados inmediatos" },
                  { icon: "📋", text: "Seguimiento incluido" }
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-600 group">
                    <span className="mr-3 text-lg group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Process Card */}
            <div className="bg-gray-50/50 p-6 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-[#0097c2]/5 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-[#0097c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-800">
                  Proceso del Examen
                </h4>
              </div>
              <ul className="space-y-4">
                {[
                  {
                    title: "Historia Clínica",
                    desc: "Recopilación de información médica y antecedentes"
                  },
                  {
                    title: "Evaluación Visual",
                    desc: "Medición de agudeza visual a diferentes distancias"
                  },
                  {
                    title: "Refracción",
                    desc: "Determinación precisa de tu graduación"
                  },
                  {
                    title: "Salud Ocular",
                    desc: "Examen completo de la salud de tus ojos"
                  }
                ].map((step, index) => (
                  <li key={index} className="flex items-start group">
                    <span className="flex items-center justify-center bg-[#0097c2]/10 text-[#0097c2] rounded-full w-6 h-6 mt-1 mr-3 flex-shrink-0 font-semibold group-hover:bg-[#0097c2] group-hover:text-white transition-colors">
                      {index + 1}
                    </span>
                    <div>
                      <h5 className="font-medium text-gray-800">{step.title}</h5>
                      <p className="text-gray-600 text-sm">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <Link
              to="/agendar"
              className="block bg-[#0097c2] text-white text-center py-4 px-6 rounded-xl font-semibold hover:bg-[#0088b0] transition-colors"
            >
              Agendar Examen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamenVisualCard;