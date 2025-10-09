import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../components/auth/AuthContext';
import { API_CONFIG } from '../config/api';

// Base URL y endpoints centralizados
const { BASE_URL, ENDPOINTS } = API_CONFIG;

export const useDashboard = () => {
    const { user, token, logout } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = async () => {
        if (!token) {
            setError('No hay token de autenticación. Inicia sesión para ver el dashboard.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`${BASE_URL}${ENDPOINTS.DASHBOARD}/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.data.success) {
                setDashboardData(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error al obtener datos');
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            const status = error?.response?.status;
            if (status === 401) {
                // Sesión inválida/expirada: limpiar y pedir login
                try { logout && logout(); } catch {}
                setError('Sesión expirada o no autorizada. Vuelve a iniciar sesión.');
            } else if (status === 403) {
                setError('Acceso denegado. Tu usuario no tiene permisos para ver el dashboard.');
            } else {
                setError(error.response?.data?.message || 'Error al obtener datos del dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && user) {
            fetchDashboardData();
        }
    }, [token, user]);

    return {
        dashboardData,
        loading,
        error,
        refreshData: fetchDashboardData
    };
};