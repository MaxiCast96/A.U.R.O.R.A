// Sidebar.jsx - Versión corregida sin errores de JSX

import React, { useState } from 'react';
import Alert from './ui/Alert';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, X, ChevronDown, User, LogOut, Menu } from 'lucide-react';

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  menuItems, 
  activeSection, 
  setActiveSection 
}) => {
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const profileMenuRef = React.useRef(null);
  const headerRef = React.useRef(null);
  const footerRef = React.useRef(null);
  const [contentHeight, setContentHeight] = React.useState(null);
  
  // Datos del usuario autenticado
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutNotification, setLogoutNotification] = useState(false);
  
  // Construir el perfil según el tipo de usuario autenticado
  let currentUser = {
    name: 'Usuario',
    role: 'Sin rol',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80'
  };
  
  if (user) {
    // Función para obtener la imagen de perfil con fallbacks
    const getProfileImage = (userData) => {
      // Primera prioridad: fotoPerfil (usado en empleados)
      if (userData.fotoPerfil && userData.fotoPerfil.trim()) {
        return userData.fotoPerfil;
      }
      
      // Segunda prioridad: avatar (genérico)
      if (userData.avatar && userData.avatar.trim()) {
        return userData.avatar;
      }
      
      // Tercera prioridad: foto (alternativo)
      if (userData.foto && userData.foto.trim()) {
        return userData.foto;
      }
      
      // Fallback: Generar avatar con iniciales usando UI Avatars (más robusto que dicebear)
      const nombre = userData.nombre || userData.name || '';
      const apellido = userData.apellido || '';
      const fullName = `${nombre} ${apellido}`.trim();
      
      if (fullName) {
        // UI Avatars con configuración personalizada
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=150&background=06b6d4&color=ffffff&bold=true&font-size=0.6`;
      }
      
      // Fallback final basado en rol
      const userType = userData.userType || userData.rol || 'Usuario';
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(userType)}&size=150&background=64748b&color=ffffff&bold=true&font-size=0.6`;
    };

    if (user.userType === 'cliente' || user.rol === 'Cliente') {
      currentUser = {
        name: `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Cliente',
        role: user.rol || 'Cliente',
        avatar: getProfileImage(user)
      };
    } else {
      currentUser = {
        name: user.nombre || user.name || 'Empleado',
        role: user.rol || user.role || 'Empleado',
        avatar: getProfileImage(user)
      };
    }
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Cerrar menú de perfil al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mejoras responsive: bloquear scroll en móvil y cerrar con Escape
  React.useEffect(() => {
    if (mobileMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = (e) => {
        if (e.key === 'Escape') closeMobileMenu();
      };
      document.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = original;
        document.removeEventListener('keydown', onKey);
      };
    }
  }, [mobileMenuOpen]);

  // Recalcular altura útil del contenedor scroll (viewport - header - footer)
  React.useEffect(() => {
    const recalc = () => {
      const headerH = headerRef.current?.offsetHeight || 0;
      const footerH = footerRef.current?.offsetHeight || 0;
      const vh = window.innerHeight || 0;
      const h = Math.max(vh - headerH - footerH, 120);
      setContentHeight(h);
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    if (headerRef.current) ro.observe(headerRef.current);
    if (footerRef.current) ro.observe(footerRef.current);
    window.addEventListener('resize', recalc);
    const id = setTimeout(recalc, 0);
    return () => {
      clearTimeout(id);
      window.removeEventListener('resize', recalc);
      try { ro.disconnect(); } catch {}
    };
  }, [sidebarOpen, mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    setLogoutNotification(true);
    setTimeout(() => setLogoutNotification(false), 2500);
    setTimeout(() => navigate('/'), 800);
  };

  const handleViewProfile = () => {
    console.log('Ver perfil...');
    setProfileMenuOpen(false);
  };

  return (
    <>
      {logoutNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Alert type="info" message="Sesión cerrada correctamente" onClose={() => setLogoutNotification(false)} />
        </div>
      )}
      
      {/* Botón de menú hamburguesa flotante para móvil - NUEVA FUNCIONALIDAD */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Abrir menú"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      {/* Overlay para móvil */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fadeIn backdrop-blur-sm"
          onClick={closeMobileMenu}
        />
      )}
      
      <div className={`
        bg-white shadow-xl min-h-screen fixed left-0 top-0 z-50 overflow-visible
        transition-all duration-300 ease-out transform-gpu
        
        /* Medidas: móvil más grandes, desktop como la versión antigua */
        ${sidebarOpen 
          ? 'w-[85vw] max-w-[280px] sm:w-[80vw] sm:max-w-[300px] md:w-60 lg:w-64' 
          : 'w-[85vw] max-w-[280px] sm:w-[80vw] sm:max-w-[300px] md:w-16'}
        
        /* Estados de visibilidad */
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        
        /* Bordes y sombras */
        border-r border-gray-200
        
        /* Backdrop filter para efecto glass en móvil */
        backdrop-blur-md md:backdrop-blur-none
        bg-white/95 md:bg-white
      `}>
        {/* Header de la sidebar con logo - Tamaños móvil aumentados */}
        <div ref={headerRef} className="p-2 sm:p-3 md:p-2 lg:p-3 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center justify-between md:justify-start">
            {/* Botón de expandir/contraer - Con medidas originales */}
            <button
              onClick={() => window.innerWidth >= 768 && setSidebarOpen(!sidebarOpen)}
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 bg-white rounded-lg shadow-md flex items-center justify-center p-1 flex-shrink-0 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0 group"
              title={sidebarOpen ? "Contraer menú" : "Expandir menú"}
            >
              <div className={`transform transition-all duration-700 ease-in-out group-hover:scale-125 ${
                sidebarOpen ? 'rotate-180' : 'rotate-0'
              }`}>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 text-gray-600 transition-all duration-700 ease-in-out" />
              </div>
            </button>
            
            {/* Logo y título - Móvil más grande */}
            <div className={`ml-2 sm:ml-3 md:ml-2 lg:ml-3 min-w-0 transition-all duration-700 ease-in-out transform ${
              sidebarOpen || window.innerWidth < 768 ? 'opacity-100 translate-x-0 scale-100' : 'md:opacity-0 md:-translate-x-4 md:scale-95 opacity-100 translate-x-0 scale-100'
            }`}>
              <img 
                src="https://i.imgur.com/rYfBDzN.png" 
                alt="Óptica La Inteligente" 
                className="w-20 h-8 sm:w-22 sm:h-9 md:w-20 md:h-8 lg:w-27 lg:h-14 object-contain hover:scale-105 transition-transform duration-300 hover:drop-shadow-lg"
              />
              <span className="text-xs sm:text-sm md:text-[10px] lg:text-xs text-gray-500 block truncate animate-pulse">
                Sistema de Gestión
              </span>
            </div>

            {/* Botón de cerrar en móvil */}
            <button
              onClick={closeMobileMenu}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 hover:rotate-90 active:scale-90"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Contenedor principal - Padding móvil aumentado */}
        <div 
          className="py-2 sm:py-3 md:py-2 overflow-y-auto custom-scrollbar" 
          style={{ height: contentHeight ? `${contentHeight}px` : undefined }}
        >
          {['Principal', 'Personal', 'Productos', 'Médico', 'Administración'].map((section, sectionIndex) => {
            const itemsBySection = (menuItems || []).filter(item => item.section === section);
            if (itemsBySection.length === 0) return null;
            
            return (
              <div key={section} className="mb-3 sm:mb-4 md:mb-3 lg:mb-4" style={{ animationDelay: `${sectionIndex * 100}ms` }}>
                {/* Título de sección - Móvil más grande */}
                <h3 className={`px-3 sm:px-4 md:px-3 lg:px-4 mb-2 sm:mb-3 md:mb-2 text-xs sm:text-sm md:text-xs font-semibold text-gray-500 uppercase tracking-wider transition-all duration-700 ease-in-out transform ${
                  sidebarOpen || window.innerWidth < 768 ? 'opacity-100 translate-x-0 scale-100' : 'md:opacity-0 md:-translate-x-4 md:scale-95 opacity-100 translate-x-0 scale-100'
                }`}>
                  {section}
                </h3>
                
                {/* Items del menú - Móvil más grande */}
                {itemsBySection.map((item, itemIndex) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      console.log('[Sidebar] click item ->', item.id);
                      setActiveSection(item.id);
                      setTimeout(() => closeMobileMenu(), 0);
                    }}
                    className={`w-full flex items-center px-3 sm:px-4 md:px-3 lg:px-4 py-2 sm:py-3 md:py-2 lg:py-2.5 text-left bg-white hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-700 transition-all duration-300 group relative transform hover:scale-105 hover:translate-x-1 active:scale-95 active:translate-x-0 overflow-hidden ${
                      activeSection === item.id 
                        ? 'active-gradient-item text-cyan-700 border-r-4 border-cyan-500 shadow-sm' 
                        : 'text-gray-600'
                    }`}
                    style={{ 
                      animationDelay: `${(sectionIndex * 200) + (itemIndex * 50)}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    {/* Efectos de fondo para item activo */}
                    {activeSection === item.id && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 animate-gradientFlow"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-100 animate-gradientFlowReverse"></div>
                      </div>
                    )}
                    
                    {/* Icono - Móvil más grande */}
                    <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-4 md:h-4 lg:w-5 lg:h-5 ${
                      activeSection === item.id ? 'text-cyan-600' : 'text-gray-400'
                    } group-hover:text-cyan-600 transition-all duration-300 flex-shrink-0 transform group-hover:scale-125 group-hover:rotate-12 group-hover:animate-bounce-soft relative z-10`} />
                    
                    {/* Label del item - Móvil más grande */}
                    <span className={`ml-3 sm:ml-4 md:ml-2 lg:ml-3 font-medium text-sm sm:text-base md:text-sm truncate transform transition-all duration-700 ease-in-out group-hover:translate-x-1 relative z-10 ${
                      sidebarOpen || window.innerWidth < 768 ? 'opacity-100 translate-x-0 scale-100' : 'md:opacity-0 md:-translate-x-4 md:scale-95 opacity-100 translate-x-0 scale-100'
                    }`}>
                      {item.label}
                    </span>
                    
                    {/* Tooltip para desktop cuando sidebar está colapsado */}
                    {!sidebarOpen && (
                      <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs sm:text-sm rounded opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 transform scale-75 group-hover:scale-100 animate-pop-in">
                        {item.label}
                      </div>
                    )}
                    
                    {/* Efectos visuales adicionales */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:animate-shine pointer-events-none z-20"></div>
                    
                    {activeSection === item.id && (
                      <>
                        <div className="absolute right-3 sm:right-4 md:right-2 top-1/2 transform -translate-y-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-0.5 md:h-0.5 bg-cyan-400 rounded-full animate-twinkle z-30"></div>
                        <div className="absolute right-4 sm:right-5 md:right-4 top-1/3 transform -translate-y-1/2 w-0.5 h-0.5 sm:w-1 sm:h-1 md:w-0.5 md:h-0.5 bg-blue-400 rounded-full animate-twinkle z-30" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute right-3.5 sm:right-4.5 md:right-3 top-2/3 transform -translate-y-1/2 w-0.5 h-0.5 sm:w-1 sm:h-1 md:w-0.5 md:h-0.5 bg-cyan-300 rounded-full animate-twinkle z-30" style={{ animationDelay: '1s' }}></div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Sección de perfil del usuario - Móvil más grande */}
        <div ref={footerRef} className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-1.5 border-t border-gray-200 bg-white bg-gradient-to-r from-gray-50 to-gray-100 relative z-40">
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => {
                if (!sidebarOpen && window.innerWidth >= 768) {
                  setSidebarOpen(true);
                  setTimeout(() => {
                    setProfileMenuOpen(true);
                  }, 400);
                } else {
                  setProfileMenuOpen(!profileMenuOpen);
                }
              }}
              className={`w-full flex items-center bg-white hover:bg-white rounded-lg transition-all duration-300 group hover:shadow-md transform hover:scale-105 active:scale-95 ${
                sidebarOpen || window.innerWidth < 768 ? 'p-2 sm:p-3 md:p-1.5' : 'p-1 justify-center'
              }`}
            >
              {/* Avatar - Móvil más grande */}
              <div className="relative flex-shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className={`rounded-full object-cover border-2 border-cyan-200 group-hover:border-cyan-400 transition-all duration-300 shadow-md group-hover:shadow-lg ${
                    sidebarOpen || window.innerWidth < 768 
                      ? 'w-10 h-10 sm:w-12 sm:h-12 md:w-10 md:h-10 lg:w-12 lg:h-12' 
                      : 'w-8 h-8 sm:w-10 sm:h-10 md:w-8 md:h-8'
                  }`}
                  onError={(e) => {
                    // Fallback si la imagen no carga
                    const fallbackName = currentUser.name || 'Usuario';
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&size=150&background=06b6d4&color=ffffff&bold=true&font-size=0.6`;
                  }}
                  loading="lazy"
                />
                {/* Indicador de estado online */}
                <div className={`absolute -bottom-0.5 -right-0.5 bg-green-400 border-2 border-white rounded-full animate-pulse ${
                  sidebarOpen || window.innerWidth < 768 
                    ? 'w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-2 md:h-2' 
                    : 'w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-1.5 md:h-1.5'
                }`} title="En línea"></div>
              </div>

              {/* Información del usuario - Móvil más grande */}
              <div className={`ml-3 sm:ml-4 md:ml-2 flex-1 min-w-0 transition-all duration-700 ease-in-out transform ${
                sidebarOpen || window.innerWidth < 768 ? 'opacity-100 translate-x-0 scale-100' : 'md:opacity-0 md:-translate-x-4 md:scale-95 opacity-100 translate-x-0 scale-100'
              }`}>
                <p className="text-sm sm:text-base md:text-xs lg:text-sm font-semibold text-gray-800 truncate group-hover:text-cyan-700 transition-colors leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-xs sm:text-sm md:text-[10px] lg:text-xs text-gray-500 truncate leading-tight">
                  {currentUser.role}
                </p>
              </div>

              {/* Icono chevron - Móvil más grande */}
              {(sidebarOpen || window.innerWidth < 768) && (
                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 md:w-3 md:h-3 text-gray-400 group-hover:text-cyan-600 transition-all duration-300 transform ${
                  profileMenuOpen ? 'rotate-180' : 'rotate-0'
                }`} />
              )}
            </button>

            {/* Menú desplegable de perfil - Móvil más grande */}
            {profileMenuOpen && (sidebarOpen || window.innerWidth < 768) && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-slideUp z-[60]">
                <button
                  onClick={handleViewProfile}
                  className="w-full bg-white flex items-center px-3 sm:px-4 md:px-3 py-2 sm:py-3 md:py-1.5 text-sm sm:text-base md:text-xs text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-all duration-200 group"
                >
                  <User className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-3 sm:mr-4 md:mr-2 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                  Ver Perfil
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex bg-white items-center px-3 sm:px-4 md:px-3 py-2 sm:py-3 md:py-1.5 text-sm sm:text-base md:text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
                >
                  <LogOut className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 mr-3 sm:mr-4 md:mr-2 text-red-500 group-hover:text-red-600 transition-colors" />
                  Cerrar Sesión
                </button>
              </div>
            )}

            {/* Tooltip para desktop cuando sidebar está colapsado - Móvil más grande */}
            {!sidebarOpen && window.innerWidth >= 768 && (
              <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 transform scale-75 group-hover:scale-100 animate-pop-in">
                {currentUser.name}
              </div>
            )}
          </div>
        </div>
        
        {/* Efectos de borde brillante - Móvil más visible */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-1 sm:w-1.5 md:w-0.5 h-full bg-gradient-to-b from-cyan-400 via-blue-500 to-cyan-400 opacity-30 animate-pulse"></div>
        </div>
      </div>

      {/* Estilos CSS personalizados con breakpoints de la versión antigua */}
      <style>{`
        /* Custom scrollbar mejorado */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #06b6d4 #f1f5f9;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4, #0891b2);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #0891b2, #0e7490);
        }
        
        /* Animaciones de la versión antigua */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes gradientFlow {
          0% { 
            background-size: 200% 100%;
            background-position: 0% 0%;
          }
          100% { 
            background-size: 200% 100%;
            background-position: 200% 0%;
          }
        }
        
        @keyframes gradientFlowReverse {
          0% { 
            background-size: 200% 100%;
            background-position: 200% 0%;
            opacity: 0.3;
          }
          100% { 
            background-size: 200% 100%;
            background-position: 0% 0%;
            opacity: 0.7;
          }
        }
        
        @keyframes pop-in {
          0% { 
            opacity: 0; 
            transform: scale(0.8) translateY(10px);
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(300%) skewX(-12deg); }
        }
        
        @keyframes twinkle {
          0%, 100% { 
            opacity: 0; 
            transform: scale(0);
          }
          50% { 
            opacity: 1; 
            transform: scale(1);
          }
        }
        
        @keyframes bounce-soft {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(3deg); }
          50% { transform: scale(1.05) rotate(-2deg); }
          75% { transform: scale(1.08) rotate(1deg); }
        }
        
        /* Clases de animación */
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
        .animate-bounce-soft {
          animation: bounce-soft 0.6s ease-in-out;
        }
        .animate-pop-in {
          animation: pop-in 0.3s ease-out;
        }
        .animate-shine {
          animation: shine 0.8s ease-out;
        }
        .animate-twinkle {
          animation: twinkle 2s infinite;
        }
        .animate-gradientFlow {
          animation: gradientFlow 4s linear infinite;
        }
        .animate-gradientFlowReverse {
          animation: gradientFlowReverse 4s linear infinite;
        }
        
        /* Estilos especiales */
        .active-gradient-item {
          position: relative;
        }
        .transform-gpu {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
        
        /* Responsive breakpoints de la versión antigua */
        @media (max-width: 480px) {
          .responsive-sidebar {
            font-size: 0.7rem;
          }
        }
        
        @media (min-width: 481px) and (max-width: 768px) {
          .responsive-sidebar {
            font-size: 0.75rem;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
          .responsive-sidebar {
            font-size: 0.85rem;
          }
        }
        
        @media (min-width: 1025px) {
          .responsive-sidebar {
            font-size: 1rem;
          }
        }
        
        /* Mejoras de accesibilidad */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* Focus styles mejorados */
        .focus\\:outline-none:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
        }
        
        .focus\\:ring-2:focus {
          box-shadow: 0 0 0 2px #06b6d4;
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .border-gray-200 {
            border-color: #000;
          }
          .text-gray-500 {
            color: #000;
          }
          .text-gray-600 {
            color: #000;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;