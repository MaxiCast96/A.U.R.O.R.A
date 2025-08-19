import { useState } from "react";
import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./components/auth/AuthContext";
import { CartProvider } from "./context/CartContext";
import LoadingSpinner from "./components/auth/LoadingSpinner";
import OpticaDashboard from "./pages/private/OpticaDashboard";
import PrivateRoute from "./components/auth/PrivateRoute";
import PerfilPage from "./pages/private/PerfilPage";

// Importación de las páginas públicas
import Home from "./pages/public/Home";
import Producto from "./pages/public/Producto";
import Cotizaciones from "./pages/public/Cotizaciones";
import Servicio from "./pages/public/Servicio";
import AgendarCitas from "./pages/public/AgendarCitas";
import Nosotros from "./pages/public/Nosotros";
import Cart from "./pages/public/Cart";

//Importacion de paginas extra de publicas
import CrearCotizacionPage from "./pages/public/CrearCotizacionPage";
import VerCotizacionPage from "./pages/public/VerCotizacionPage";

// Importación de la página de recuperación de contraseña
import RecuperarPassword from "./pages/auth/RecuperarPassword";
import NotFound from "./pages/public/NotFound";
import AccessDenied from "./pages/public/AccessDenied";

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
        {/* Redirección de ruta eliminada */}
        <Route path="/productos/personalizables" element={<Navigate to="/productos" replace />} />
        
        {/* Rutas que requieren autenticación de cliente */}
        <Route path="/cotizaciones" element={
          <PrivateRoute requiredRole="Cliente" noRedirect={true}>
            <Cotizaciones />
          </PrivateRoute>
        } />
        <Route path="/carrito" element={
          <PrivateRoute requiredRole="Cliente" noRedirect={true}>
            <Cart />
          </PrivateRoute>
        } />
        <Route path="/cotizaciones/crear" element={
          <PrivateRoute requiredRole="Cliente">
            <CrearCotizacionPage />
          </PrivateRoute>
        } />
        <Route path="/cotizaciones/:id" element={
          <PrivateRoute requiredRole="Cliente">
            <VerCotizacionPage />
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

        {/* Acceso denegado */}
        <Route path="/acceso-denegado" element={<AccessDenied />} />

        {/* 404 Not Found - catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

// Componente principal App
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router basename="/A.U.R.O.R.A">
          <AnimatedRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
