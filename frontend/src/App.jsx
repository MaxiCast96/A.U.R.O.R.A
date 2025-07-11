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
import OpticaDashboard from "./pages/private/OpticaDashboard";

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
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Producto />} />
        <Route path="/cotizaciones" element={<Cotizaciones />} />
        <Route path="/servicios" element={<Servicio />} />
        <Route path="/agendar" element={<AgendarCitas />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/perfil" element={<PerfilPage />} />
        <Route path="/dashboard" element={<OpticaDashboard />} />
        
        // Rutas adicionales
        <Route path="/cotizaciones/crear" element={<CrearCotizacion />} />
        <Route path="/cotizaciones/:id" element={<VerCotizacion />} />
        <Route path="/productos/lentes" element={<Producto />} />
        <Route path="/productos/accesorios" element={<Producto />} />
        <Route path="/productos/personalizables" element={<Producto />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
      </Routes>
      
    </AnimatePresence>
  );
}

// Componente principal App
function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
