import React from 'react';

const ContactHelp = () => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg mt-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          ¿Necesitas ayuda?
        </h3>
        <p className="text-gray-600">
          Nuestro equipo de expertos está aquí para asesorarte
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contacto telefónico */}
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-3xl mb-3">📞</div>
          <h4 className="font-semibold text-gray-800 mb-2">Llámanos</h4>
          <p className="text-sm text-gray-600 mb-3">
            Habla directamente con nuestros expertos
          </p>
          <a 
            href="tel:+50312345678"
            className="text-[#0097c2] font-semibold hover:underline"
          >
            +503 1234-5678
          </a>
        </div>
        
        {/* WhatsApp */}
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-3xl mb-3">💬</div>
          <h4 className="font-semibold text-gray-800 mb-2">WhatsApp</h4>
          <p className="text-sm text-gray-600 mb-3">
            Envíanos un mensaje directo
          </p>
          <a 
            href="https://wa.me/50312345678"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 font-semibold hover:underline"
          >
            Enviar mensaje
          </a>
        </div>
        
        {/* Visita */}
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-3xl mb-3">🏢</div>
          <h4 className="font-semibold text-gray-800 mb-2">Visítanos</h4>
          <p className="text-sm text-gray-600 mb-3">
            Ven a nuestra sucursal más cercana
          </p>
          <a 
            href="/sucursales"
            className="text-[#0097c2] font-semibold hover:underline"
          >
            Ver ubicaciones
          </a>
        </div>
      </div>
      
      {/* Horarios de atención */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-3 text-center">
          🕒 Horarios de Atención
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Lunes a Viernes:</p>
            <p className="text-gray-600">8:00 AM - 6:00 PM</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Sábados:</p>
            <p className="text-gray-600">8:00 AM - 4:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactHelp;
