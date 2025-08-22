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
import { useDashboard } from '../../../hooks/useDashboard';
import { useAuth } from '../../../components/auth/AuthContext';

const DashboardContent = ({ onNavigate, visibleIds = [] }) => {
  const { 
    dashboardData, 
    loading, 
    error, 
    refreshData 
  } = useDashboard();
  const { user } = useAuth();

  // Paleta de colores personalizada
  const COLORS = ['#009BBF', '#00B8E6', '#33C7E6', '#66D6E6'];
  const PRIMARY_COLOR = '#009BBF';
  const DARK_COLOR = '#3C3C3B';

  const quickActions = [
    {
      id: 'lentes',
      title: 'Crear Lentes',
      icon: Eye,
      onClick: () => onNavigate ? onNavigate('lentes') : console.log('Crear Lentes')
    },
    {
      id: 'citas',
      title: 'Crear Cita',
      icon: Calendar,
      onClick: () => onNavigate ? onNavigate('citas') : console.log('Crear Cita')
    },
    {
      id: 'recetas',
      title: 'Crear Receta',
      icon: Stethoscope,
      onClick: () => onNavigate ? onNavigate('recetas') : console.log('Crear Receta')
    },
    {
      id: 'promociones',
      title: 'Crear Promoción',
      icon: Tag,
      onClick: () => onNavigate ? onNavigate('promociones') : console.log('Crear Promoción')
    }
  ];

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Debe iniciar sesión para ver el dashboard</div>;

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3C3C3B] mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Bienvenido al panel de administración</p>
        </div>
        <button
          onClick={refreshData}
          className="w-full sm:w-auto bg-[#009BBF] hover:bg-[#0088A8] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* 1. KPI - Estadísticas */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold text-[#3C3C3B] mb-4 sm:mb-6">Indicadores Clave de Rendimiento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-[#009BBF]/10">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#009BBF]" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-xl sm:text-2xl font-bold text-[#3C3C3B]">
                  {dashboardData?.stats?.totalClientes?.toLocaleString?.() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-[#009BBF]/10">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-[#009BBF]" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Citas Hoy</p>
                <p className="text-xl sm:text-2xl font-bold text-[#3C3C3B]">
                  {dashboardData?.stats?.citasHoy ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-[#009BBF]/10">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-[#009BBF]" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Ventas del Mes</p>
                <p className="text-xl sm:text-2xl font-bold text-[#3C3C3B]">
                  {dashboardData?.stats?.ventasDelMes ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-[#009BBF]/10">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-[#009BBF]" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Ingresos del Mes</p>
                <p className="text-xl sm:text-2xl font-bold text-[#3C3C3B]">
                  ${dashboardData?.stats?.totalIngresos?.toLocaleString?.() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Gráfico de Ventas Mensuales */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-[#3C3C3B] mb-4">Ventas Mensuales</h3>
          <div className="h-48 sm:h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.ventasMensuales || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 10, fill: '#3C3C3B' }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#3C3C3B' }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    color: '#3C3C3B',
                    fontSize: '12px'
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
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-[#3C3C3B] mb-4">Estado de Citas</h3>
          <div className="h-48 sm:h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData?.estadoCitas || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ estado, cantidad }) => `${estado}: ${cantidad}`}
                  outerRadius={60}
                  fill="#009BBF"
                  dataKey="cantidad"
                >
                  {((dashboardData?.estadoCitas) || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    color: '#3C3C3B',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Acciones Rápidas */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold text-[#3C3C3B] mb-4 sm:mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {quickActions
            .filter(action => !visibleIds.length || visibleIds.includes(action.id))
            .map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="bg-[#009BBF] hover:bg-[#0088A8] text-white p-3 sm:p-4 rounded-lg flex flex-col items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                <action.icon className="h-6 w-6 sm:h-8 sm:w-8 mb-2" />
                <span className="text-xs sm:text-sm font-medium text-center">{action.title}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;