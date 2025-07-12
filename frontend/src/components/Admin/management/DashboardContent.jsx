import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  Calendar, 
  ShoppingCart, 
  DollarSign,
  Eye,
  Stethoscope,
  Tag,
  RefreshCw
} from 'lucide-react';
import useDashboard from '../../../hooks/useDashboard';

const DashboardContent = () => {
  const { 
    dashboardData, 
    loading, 
    error, 
    refreshData 
  } = useDashboard();

  // Paleta de colores personalizada
  const COLORS = ['#009BBF', '#00B8E6', '#33C7E6', '#66D6E6'];
  const PRIMARY_COLOR = '#009BBF';
  const DARK_COLOR = '#3C3C3B';

  const quickActions = [
    {
      title: 'Crear Lentes',
      icon: Eye,
      onClick: () => console.log('Crear Lentes')
    },
    {
      title: 'Crear Cita',
      icon: Calendar,
      onClick: () => console.log('Crear Cita')
    },
    {
      title: 'Crear Receta',
      icon: Stethoscope,
      onClick: () => console.log('Crear Receta')
    },
    {
      title: 'Crear Promoción',
      icon: Tag,
      onClick: () => console.log('Crear Promoción')
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009BBF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-4">
          <p className="text-lg font-semibold">Error al cargar el dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={refreshData}
          className="bg-[#009BBF] hover:bg-[#0088A8] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#3C3C3B] mb-2">Dashboard</h1>
          <p className="text-gray-600">Bienvenido al panel de administración</p>
        </div>
        <button
          onClick={refreshData}
          className="bg-[#009BBF] hover:bg-[#0088A8] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* 1. KPI - Estadísticas */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-[#3C3C3B] mb-6">Indicadores Clave de Rendimiento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#009BBF]/10">
                <Users className="h-6 w-6 text-[#009BBF]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-[#3C3C3B]">
                  {dashboardData.stats.totalClientes.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#009BBF]/10">
                <Calendar className="h-6 w-6 text-[#009BBF]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                <p className="text-2xl font-bold text-[#3C3C3B]">
                  {dashboardData.stats.citasHoy}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#009BBF]/10">
                <ShoppingCart className="h-6 w-6 text-[#009BBF]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ventas del Mes</p>
                <p className="text-2xl font-bold text-[#3C3C3B]">
                  {dashboardData.stats.ventasDelMes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#009BBF]/10">
                <DollarSign className="h-6 w-6 text-[#009BBF]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos del Mes</p>
                <p className="text-2xl font-bold text-[#3C3C3B]">
                  ${dashboardData.stats.totalIngresos.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Ventas Mensuales */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-[#3C3C3B] mb-4">Ventas Mensuales</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.ventasMensuales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 12, fill: '#3C3C3B' }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#3C3C3B' }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    color: '#3C3C3B'
                  }}
                />
                <Bar 
                  dataKey="ventas" 
                  fill="#009BBF" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Estado de Citas */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-[#3C3C3B] mb-4">Estado de Citas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.estadoCitas}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ estado, cantidad }) => `${estado}: ${cantidad}`}
                  outerRadius={80}
                  fill="#009BBF"
                  dataKey="cantidad"
                >
                  {dashboardData.estadoCitas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    color: '#3C3C3B'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Acciones Rápidas */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-[#3C3C3B] mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="bg-[#009BBF] hover:bg-[#0088A8] text-white p-4 rounded-lg flex flex-col items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              <action.icon className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">{action.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;