import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => {
        // Intentar recuperar el token del localStorage al iniciar
        return localStorage.getItem('aurora_token');
    });
    const [loading, setLoading] = useState(true);

    // Decodificar JWT sin validar (solo para recuperar datos básicos)
    const decodeJwt = (jwtToken) => {
        try {
            const payload = jwtToken.split('.')[1];
            const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    };

    // Inicializar estado desde localStorage / token
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('aurora_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else if (token) {
                const decoded = decodeJwt(token);
                if (decoded && decoded.id && decoded.rol) {
                    setUser({ id: decoded.id, correo: decoded.correo, rol: decoded.rol });
                }
            }
            if (token) {
                // Adjuntar token a axios por defecto
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                axios.defaults.withCredentials = true;
            }
        } catch (_) {
            // noop
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cuando cambie el token, actualizar axios y persistencia
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.defaults.withCredentials = true;
            localStorage.setItem('aurora_token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('aurora_token');
        }
    }, [token]);

    const login = async (credentials) => {
        try {
            const response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}/login`, credentials, {
                withCredentials: true,
            });

            if (response.data.success) {
                const { token: authToken, user: authUser } = response.data;
                setToken(authToken);
                setUser(authUser);
                // Persistir
                localStorage.setItem('aurora_token', authToken);
                localStorage.setItem('aurora_user', JSON.stringify(authUser));
                // Configurar axios
                axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
                axios.defaults.withCredentials = true;
                return { success: true, user: authUser, token: authToken };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error('Error en login:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Error al iniciar sesión' 
            };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('aurora_token');
        localStorage.removeItem('aurora_user');
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        setUser,
        setToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export default AuthContext;