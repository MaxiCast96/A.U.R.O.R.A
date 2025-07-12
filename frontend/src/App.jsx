import { useState } from "react";
import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./components/auth/AuthContext";
import LoadingSpinner from "./components/auth/LoadingSpinner";
import OpticaDashboard from "./pages/private/OpticaDashboard";
import PrivateRoute from "./components/auth/PrivateRoute";

// Importación de las páginas públicas
import Home from "./pages/public/Home";
import Producto from "./pages/public/Producto";
import Cotizaciones from "./pages/public/Cotizaciones";
import Servicio from "./pages/public/Servicio";
import AgendarCitas from "./pages/public/AgendarCitas";
import Nosotros from "./pages/public/Nosotros";
import PerfilPage from './pages/private/PerfilPage';

//Importacion de paginas extra de publicas
import CrearCotizacion from "./components/Cotizaciones/CrearCotizacion";
import VerCotizacion from "./components/Cotizaciones/VerCotizacion";

// Importación de la página de recuperación de contraseña
import RecuperarPassword from "./pages/auth/RecuperarPassword";

// Componente separado para las rutas con AnimatePresence
function AnimatedRoutes() {
  const location = useLocation();
  const { loading } = useAuth();

  // Mostrar spinner mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner message="Verificando autenticación..." />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Producto />} />
        <Route path="/servicios" element={<Servicio />} />
        <Route path="/agendar" element={<AgendarCitas />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        
        {/* Rutas de productos específicos */}
        <Route path="/productos/lentes" element={<Producto />} />
        <Route path="/productos/accesorios" element={<Producto />} />
        <Route path="/productos/personalizables" element={<Producto />} />
        
        {/* Rutas que requieren autenticación de cliente */}
        <Route path="/cotizaciones" element={
          <PrivateRoute requiredRole="Cliente">
            <Cotizaciones />
          </PrivateRoute>
        } />
        <Route path="/cotizaciones/crear" element={
          <PrivateRoute requiredRole="Cliente">
            <CrearCotizacion />
          </PrivateRoute>
        } />
        <Route path="/cotizaciones/:id" element={
          <PrivateRoute requiredRole="Cliente">
            <VerCotizacion />
          </PrivateRoute>
        } />
        
        {/* Rutas que requieren autenticación de empleado */}
        <Route path="/dashboard" element={
          <PrivateRoute requiredRole="Empleado">
            <OpticaDashboard />
          </PrivateRoute>
        } />
        
        {/* Ruta de perfil - accesible para todos los usuarios autenticados */}
        <Route path="/perfil" element={
          <PrivateRoute>
            <PerfilPage />
          </PrivateRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}

// Componente principal App
function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
