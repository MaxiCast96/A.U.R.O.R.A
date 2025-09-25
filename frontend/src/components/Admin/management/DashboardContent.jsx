import React, { useState } from 'react';
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

// Componente Skeleton para KPIs individuales
const KPISkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
    {Array.from({ length: 4 }, (_, i) => (
      <div key={i} className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200 animate-pulse">
        <div className="flex items-center">
          <div className="p-2 sm:p-3 rounded-full bg-gray-200 w-12 h-12"></div>
          <div className="ml-3 sm:ml-4 flex-1">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Componente Skeleton para gráficos individuales
const ChartSkeleton = ({ isDonut = false }) => (
  <div className="h-48 sm:h-56 md:h-64 bg-gray-100 rounded flex items-center justify-center animate-pulse">
    {isDonut ? (
      <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full"></div>
      </div>
    ) : (
      <div className="flex items-end justify-around px-6 pb-6 w-full h-full">
        {Array.from({ length: 6 }, (_, i) => (
          <div 
            key={i} 
            className="bg-gray-200 rounded-t w-8"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          ></div>
        ))}
      </div>
    )}
  </div>
);

// Componente Skeleton Loader para Dashboard completo (solo primera carga)
const DashboardSkeletonLoader = React.memo(() => (
  <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50 animate-pulse">
    {/* Header Skeleton */}
    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <div>
        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-80"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-32"></div>
    </div>

    {/* KPI Cards Skeleton */}
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
      <div className="h-6 bg-gray-200 rounded w-64 mb-6"></div>
      <KPISkeleton />
    </div>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
        <ChartSkeleton />
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <ChartSkeleton isDonut />
      </div>
    </div>

    {/* Quick Actions Skeleton */}
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
      <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-gray-200 p-3 sm:p-4 rounded-lg flex flex-col items-center justify-center h-20">
            <div className="w-6 h-6 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
));

const DashboardContent = ({ onNavigate, visibleIds = [] }) => {
  const { 
    dashboardData, 
    loading, 
    error, 
    refreshData 
  } = useDashboard();
  const { user } = useAuth();
  
  // Estados para controlar la carga de secciones específicas
  const [kpiLoading, setKpiLoading] = useState(false);
  const [chartsLoading, setChartsLoading] = useState(false);

  // Paleta de colores personalizada
  const COLORS = ['#009BBF', '#00B8E6', '#33C7E6', '#66D6E6'];

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

  // Función para actualizar solo KPIs y gráficos
  const handleRefreshData = async () => {
    setKpiLoading(true);
    setChartsLoading(true);
    
    try {
      await refreshData();
    } finally {
      // Simular un pequeño delay diferente para cada sección para mejor UX
      setTimeout(() => setKpiLoading(false), 500);
      setTimeout(() => setChartsLoading(false), 800);
    }
  };

  // Si está cargando completamente (primera vez), mostrar skeleton completo
  if (loading) return <DashboardSkeletonLoader />;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Debe iniciar sesión para ver el dashboard</div>;

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-gray-50">
      {/* Header - SIEMPRE VISIBLE, NO SE ACTUALIZA */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3C3C3B] mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Bienvenido al panel de administración</p>
        </div>
        <button
          onClick={handleRefreshData}
          disabled={kpiLoading || chartsLoading}
          className={`w-full sm:w-auto bg-[#009BBF] hover:bg-[#0088A8] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base ${
            (kpiLoading || chartsLoading) ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw className={`h-4 w-4 ${(kpiLoading || chartsLoading) ? 'animate-spin' : ''}`} />
          {(kpiLoading || chartsLoading) ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* 1. KPI - Estadísticas - SE ACTUALIZA */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold text-[#3C3C3B] mb-4 sm:mb-6">Indicadores Clave de Rendimiento</h2>
        {kpiLoading ? (
          <KPISkeleton />
        ) : (
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
        )}
      </div>

      {/* 2. Gráficos - SE ACTUALIZAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Gráfico de Ventas Mensuales */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-[#3C3C3B] mb-4">Ventas Mensuales</h3>
          {chartsLoading ? (
            <ChartSkeleton />
          ) : (
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
          )}
        </div>

        {/* Gráfico de Estado de Citas - Donut */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-[#3C3C3B] mb-4">Estado de Citas</h3>
          {chartsLoading ? (
            <ChartSkeleton isDonut />
          ) : (
            <div className="h-48 sm:h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData?.estadoCitas || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ estado, cantidad }) => `${estado}: ${cantidad}`}
                    outerRadius={80}
                    innerRadius={40}
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
          )}
        </div>
      </div>

      {/* 3. Acciones Rápidas - NO SE ACTUALIZA */}
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