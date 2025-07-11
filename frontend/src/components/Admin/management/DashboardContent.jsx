import React from 'react';
import { TrendingUp, TrendingDown, Clock, Plus } from 'lucide-react';

const DashboardContent = () => {
  // Datos de ejemplo
  const dashboardData = {
    ventas: { value: '$15,240', change: '12.5%', trend: 'up' },
    clientes: { value: '254', change: '8.2%', trend: 'up' },
    cotizaciones: { value: '23', change: '18.7%', trend: 'up' },
    citas: { value: '42', change: '5.3%', trend: 'up' }
  };

  const productosRecientes = [
    { nombre: 'Armazón Ray-Ban RB3025', tipo: 'Lente', precio: '$189.99', stock: 15 },
    { nombre: 'Lentes de Contacto Acuvue', tipo: 'Lente', precio: '$45.50', stock: 32 },
    { nombre: 'Gafas de Sol Polarizadas', tipo: 'Lente', precio: '$120.00', stock: 8 },
    { nombre: 'Estuche para Lentes Premium', tipo: 'Accesorio', precio: '$25.99', stock: 42 }
  ];

  const citasProximas = [
    { cliente: 'Marina Gonzales', servicio: 'Examen Visual', fecha: 'Hoy, 14:30', sucursal: 'Principal' },
    { cliente: 'Juan Pérez', servicio: 'Adaptación de Lentes', fecha: 'Mañana, 10:15', sucursal: 'Principal' },
    { cliente: 'Ana Rodríguez', servicio: 'Examen Visual', fecha: '23 Mayo, 16:00', sucursal: 'Quezalte' },
    { cliente: 'Carlos Martínez', servicio: 'Consulta Oftalmológica', fecha: '24 Mayo, 11:30', sucursal: 'Quezalte' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(dashboardData).map(([key, data]) => (
          <div key={key} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium capitalize">
                  {key === 'ventas' ? 'Ventas Totales' : 
                   key === 'clientes' ? 'Clientes Activos' :
                   key === 'cotizaciones' ? 'Cotizaciones' : 'Citas Agendadas'}
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{data.value}</p>
              </div>
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                data.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {data.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{data.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos Recientes */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="bg-cyan-500 text-white p-6">
            <h3 className="text-xl font-bold">Productos Recientes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {productosRecientes.map((producto, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800">{producto.nombre}</p>
                    <p className="text-sm text-gray-500">{producto.tipo}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-cyan-600">{producto.precio}</p>
                    <p className="text-sm text-gray-500">Stock: {producto.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Citas Próximas */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="bg-cyan-500 text-white p-6">
            <h3 className="text-xl font-bold">Citas Próximas</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {citasProximas.map((cita, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{cita.cliente}</p>
                    <p className="text-sm text-gray-500">{cita.servicio}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">{cita.fecha}</p>
                    <p className="text-sm text-cyan-600">{cita.sucursal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="bg-cyan-500 text-white p-6">
          <h3 className="text-xl font-bold">Acciones Rápidas</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Nuevo Lente', icon: Plus },
              { label: 'Nuevo Cliente', icon: Plus },
              { label: 'Nueva Cotización', icon: Plus },
              { label: 'Nueva Cita', icon: Plus }
            ].map((action, index) => (
              <button
                key={index}
                className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg hover:bg-cyan-50 hover:text-cyan-700 transition-all duration-200 transform hover:scale-105"
              >
                <action.icon className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;