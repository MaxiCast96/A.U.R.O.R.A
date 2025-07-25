import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        // Verificar autenticación al cargar
        const verifyAuth = async () => {
            try {
                const response = await axios.get('https://a-u-r-o-r-a.onrender.com/api/auth/verify', {
                    withCredentials: true
                });
                if (response.data.success) {
                    setUser(response.data.user);
                    setToken(response.data.token);
                }
            } catch (error) {
                console.error('Error verificando autenticación:', error);
                setUser(null);
                setToken(null);
            }
        };

        verifyAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, setUser, setToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);