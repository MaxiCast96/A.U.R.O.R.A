import React from "react";
import { Link } from "react-router-dom";
import PageTransition from "../../components/transition/PageTransition";
import Navbar from "../../components/layout/Navbar";
import ExamenVisualCard from "../../components/Nosotros/ExamenVisualCard";

const ServiceCard = ({ icon, title, description, features, details }) => (
  <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-all duration-300">
    <div className="bg-gradient-to-r from-[#0097c2] to-[#00b4e4] text-white p-4 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-center mb-4">{title}</h3>
    <p className="text-gray-600 text-center mb-6">{description}</p>
    
    <div className="space-y-6">
      {features && (
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4 text-gray-800">{features.title}:</h4>
          <ul className="space-y-3">
            {features.items.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-[#0097c2] mr-2">•</span>
                <div>
                  <span className="font-medium">{item.title}:</span>
                  <br />
                  {item.description}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {details && (
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4 text-gray-800">{details.title}:</h4>
          <ul className="space-y-2 text-gray-600">
            {details.items.map((item, index) => (
              <li key={index} className="flex items-center">
                <span className="text-[#0097c2] mr-2">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

const BenefitCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-all duration-300 text-center">
    <div className="bg-gradient-to-r from-[#0097c2] to-[#00b4e4] text-white p-4 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
      {icon}
    </div>
    <h3 className="font-semibold text-xl mb-4">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const ProcessStep = ({ title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
    <h3 className="font-semibold text-lg mb-3 text-[#0097c2]">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Servicio = () => {
  return (
    <PageTransition>
      <Navbar />
      <div className="font-['Lato'] bg-gray-50">
        {/* Hero Section */}
        <br />
        <br />
        <ExamenVisualCard />

        {/* Beneficios Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Beneficios de nuestro examen visual
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <BenefitCard
                title="Detección temprana"
                description="Identificamos problemas visuales antes de que se conviertan en condiciones graves."
              />
              <BenefitCard
                title="Precisión garantizada"
                description="Utilizamos equipos de última generación para garantizar la precisión en la medición de tu graduación."
              />
              <BenefitCard
                title="Rápido y eficiente"
                description="Nuestro examen visual completo toma aproximadamente 30 minutos, respetando tu tiempo."
              />
              <BenefitCard
                title="Seguimiento personalizado"
                description="Realizamos un seguimiento de tu salud visual y te recordamos cuándo es momento de tu próximo examen."
              />
            </div>
          </div>
        </section>

        {/* Proceso Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Nuestro proceso
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <ProcessStep
                  title="Historia clínica"
                  description="Recopilamos información sobre tu historial médico, antecedentes familiares y hábitos visuales."
                />
                <ProcessStep
                  title="Evaluación de agudeza visual"
                  description="Medimos tu capacidad para ver detalles a diferentes distancias con y sin corrección."
                />
                <ProcessStep
                  title="Refracción"
                  description="Determinamos tu graduación exacta para corregir problemas como miopía, hipermetropía o astigmatismo."
                />
                <ProcessStep
                  title="Evaluación de la salud ocular"
                  description="Examinamos la salud de tus ojos para detectar posibles condiciones como cataratas, glaucoma o retinopatías."
                />
                <ProcessStep
                  title="Recomendaciones personalizadas"
                  description="Te brindamos recomendaciones específicas para tu caso y te asesoramos en la elección de lentes si los necesitas."
                />
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="/img/proceso-examen.png"
                  alt="Proceso de examen visual"
                  className="rounded-2xl shadow-lg max-w-md w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Nuestros Servicios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ServiceCard
                title="Examen Visual"
                description="Evaluación integral de tu salud visual utilizando tecnología de vanguardia."
                features={{
                  title: "Incluye",
                  items: [
                    {
                      title: "Evaluación completa",
                      description: "Examen detallado de la salud ocular"
                    },
                    {
                      title: "Medición precisa",
                      description: "Determinación exacta de tu graduación usando equipos digitales"
                    },
                    {
                      title: "Detección temprana",
                      description: "Identificación de posibles problemas visuales y condiciones oculares"
                    },
                    {
                      title: "Asesoría personalizada",
                      description: "Recomendaciones específicas para tu caso"
                    }
                  ]
                }}
                details={{
                  title: "Duración y Proceso",
                  items: [
                    "Tiempo aproximado: 30 minutos",
                    "Resultados inmediatos",
                    "Seguimiento incluido"
                  ]
                }}
              />
              <ServiceCard
                title="Adaptación de Lentes"
                description="Servicio completo de adaptación y personalización de lentes, garantizando tu comodidad y satisfacción."
                features={{
                  title: "Servicios incluidos",
                  items: [
                    {
                      title: "Asesoría especializada",
                      description: "Ayuda profesional en la selección de monturas según tu estilo y necesidades"
                    },
                    {
                      title: "Mediciones precisas",
                      description: "Toma de medidas exactas para lentes monofocales y progresivos"
                    },
                    {
                      title: "Ajustes personalizados",
                      description: "Adaptación perfecta de la montura a tu rostro"
                    }
                  ]
                }}
                details={{
                  title: "Garantías",
                  items: [
                    "30 días de garantía de adaptación",
                    "Ajustes gratuitos post-entrega",
                    "Seguimiento personalizado"
                  ]
                }}
              />
              <ServiceCard
                title="Reparaciones"
                description="Servicio técnico especializado para el mantenimiento y reparación de tus lentes."
                features={{
                  title: "Servicios disponibles",
                  items: [
                    {
                      title: "Mantenimiento general",
                      description: "Ajustes, limpieza profunda y revisión completa"
                    },
                    {
                      title: "Reparaciones específicas",
                      description: "Cambio de tornillos, plaquetas y soldadura especializada"
                    },
                    {
                      title: "Servicios express",
                      description: "Reparaciones urgentes en el mismo día"
                    }
                  ]
                }}
                details={{
                  title: "Ventajas",
                  items: [
                    "Garantía en reparaciones",
                    "Presupuesto sin compromiso",
                    "Servicio rápido y profesional"
                  ]
                }}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-[#0097c2] to-[#00b4e4] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              ¡Agenda tu examen visual hoy mismo!
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              No esperes más para cuidar de tu salud visual. Nuestro equipo está
              listo para atenderte con profesionalismo y calidez.
            </p>
            <Link
              to="/agendar"
              className="inline-block bg-white text-[#0097c2] px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Agendar Examen
            </Link>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Servicio;
