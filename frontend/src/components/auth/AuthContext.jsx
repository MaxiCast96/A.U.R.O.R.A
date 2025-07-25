import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_BASE_URL = 'https://a-u-r-o-r-a.onrender.com/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => {
        // Intentar recuperar el token del localStorage al iniciar
        return localStorage.getItem('aurora_token');
    });

    const login = async (credentials) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
            
            if (response.data.success) {
                const { token, user } = response.data;
                setToken(token);
                setUser(user);
                localStorage.setItem('aurora_token', token);
                return { success: true };
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
    };

    const value = {
        user,
        token,
        login,
        logout
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