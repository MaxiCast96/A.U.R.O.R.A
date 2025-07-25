import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://a-u-r-o-r-a.onrender.com/api';

const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalClientes: 0,
      citasHoy: 0,
      ventasDelMes: 0,
      totalIngresos: 0
    },
    ventasMensuales: [],
    estadoCitas: [],
    productosPopulares: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/dashboard/all`, {
        withCredentials: true
      });

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError('Error al cargar los datos del dashboard');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
        withCredentials: true
      });

      if (response.data.success) {
        setDashboardData(prev => ({
          ...prev,
          stats: response.data.data
        }));
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchVentasMensuales = async (year = new Date().getFullYear()) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/ventas-mensuales?year=${year}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setDashboardData(prev => ({
          ...prev,
          ventasMensuales: response.data.data
        }));
      }
    } catch (err) {
      console.error('Error fetching monthly sales:', err);
    }
  };

  const fetchEstadoCitas = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/estado-citas`, {
        withCredentials: true
      });

      if (response.data.success) {
        setDashboardData(prev => ({
          ...prev,
          estadoCitas: response.data.data
        }));
      }
    } catch (err) {
      console.error('Error fetching appointment status:', err);
    }
  };

  const fetchProductosPopulares = async (limit = 5) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/productos-populares?limit=${limit}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setDashboardData(prev => ({
          ...prev,
          productosPopulares: response.data.data
        }));
      }
    } catch (err) {
      console.error('Error fetching popular products:', err);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    dashboardData,
    loading,
    error,
    refreshData,
    fetchStats,
    fetchVentasMensuales,
    fetchEstadoCitas,
    fetchProductosPopulares
  };
};

export default useDashboard; 