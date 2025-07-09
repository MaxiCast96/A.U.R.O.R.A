// Sidebar.jsx

import React from 'react';
import { ChevronRight, X, ChevronDown, User, LogOut } from 'lucide-react';

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  menuItems, 
  activeSection, 
  setActiveSection 
}) => {
  const [isExpanding, setIsExpanding] = React.useState(false);
  const [isContracting, setIsContracting] = React.useState(false);
  const [previousSidebarOpen, setPreviousSidebarOpen] = React.useState(sidebarOpen);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const profileMenuRef = React.useRef(null);
  
  // Datos del empleado en sesión (esto vendría de tu estado global o context)
  const currentUser = {
    name: "Juan Pérez",
    role: "Administrador",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80"
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  // Controlar las animaciones de expansión y contracción
  React.useEffect(() => {
    if (sidebarOpen !== previousSidebarOpen) {
      if (sidebarOpen) {
        setIsExpanding(true);
        setIsContracting(false);
        const timer = setTimeout(() => setIsExpanding(false), 600);
        return () => clearTimeout(timer);
      } else {
        setIsContracting(true);
        setIsExpanding(false);
        const timer = setTimeout(() => setIsContracting(false), 600);
      }
    }
    setPreviousSidebarOpen(sidebarOpen);
  }, [sidebarOpen, previousSidebarOpen]);

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

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    setProfileMenuOpen(false);
  };

  const handleViewProfile = () => {
    console.log('Ver perfil...');
    setProfileMenuOpen(false);
  };

  return (
    <>
      {/* Overlay para móvil */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fadeIn"
          onClick={closeMobileMenu}
        />
      )}
      
      <div className={`
        bg-white shadow-xl min-h-screen fixed left-0 top-0 z-50 overflow-visible
        transition-all duration-700 ease-in-out transform-gpu
        ${sidebarOpen ? 'w-64' : 'w-16'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:translate-x-0 border-r border-gray-200
        ${isExpanding ? 'animate-expandSidebar' : ''}
        ${isContracting ? 'animate-contractSidebar' : ''}
      `}>
        {/* Header de la sidebar con logo */}
         <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center">
            <button
              onClick={() => window.innerWidth >= 1024 && setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center p-1 flex-shrink-0 hover:shadow-lg transition-all duration-300 lg:cursor-pointer hover:scale-110 hover:rotate-3 active:scale-95 active:rotate-0 group"
              title={sidebarOpen ? "Contraer menú" : "Expandir menú"}
            >
              <div className={`transform transition-all duration-700 ease-in-out group-hover:scale-125 ${
                sidebarOpen ? 'rotate-180' : 'rotate-0'
              }`}>
                <ChevronRight className="w-5 h-5 text-gray-600 transition-all duration-700 ease-in-out" />
              </div>
            </button>
            <div className={`ml-3 min-w-0 transition-all duration-700 ease-in-out transform ${
              sidebarOpen ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-95'
            }`}>
               <img 
              src="https://i.imgur.com/rYfBDzN.png" 
              alt="Óptica La Inteligente" 
              className="w-27 h-14 object-contain hover:scale-105 transition-transform duration-300 hover:drop-shadow-lg"
            />
              <span className="text-xs text-gray-500 block truncate animate-pulse">
                Sistema de Gestión
              </span>
            </div>
          </div>

          {/* Botón de cerrar en móvil */}
          <button
            onClick={closeMobileMenu}
            className="absolute right-3 top-3 p-1.5 lg:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 hover:rotate-90 active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="py-2 overflow-y-auto h-[calc(100vh-120px)]">
          {['Principal', 'Personal', 'Productos', 'Médico', 'Administración'].map((section, sectionIndex) => (
            <div key={section} className="mb-4" style={{ animationDelay: `${sectionIndex * 100}ms` }}>
              <h3 className={`px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider transition-all duration-700 ease-in-out transform ${
                sidebarOpen ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-95'
              }`}>
                {section}
              </h3>
              {menuItems
                .filter(item => item.section === section)
                .map((item, itemIndex) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      closeMobileMenu();
                    }}
                    className={`w-full flex items-center px-4 py-2.5 text-left bg-white hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-700 transition-all duration-300 group relative transform hover:scale-105 hover:translate-x-1 active:scale-95 active:translate-x-0 overflow-hidden ${
                      activeSection === item.id 
                        ? 'active-gradient-item text-cyan-700 border-r-4 border-cyan-500 shadow-sm' 
                        : 'text-gray-600'
                    } ${item.id === 'dashboard' ? 'lg:hover:bg-gradient-to-r lg:hover:from-gray-50 lg:hover:to-gray-100 lg:hover:text-gray-700' : ''}`}
                    style={{ 
                      animationDelay: `${(sectionIndex * 200) + (itemIndex * 50)}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    {activeSection === item.id && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 animate-gradientFlow"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-100 animate-gradientFlowReverse"></div>
                      </div>
                    )}
                    
                    <item.icon className={`w-5 h-5 ${
                      activeSection === item.id ? 'text-cyan-600' : 'text-gray-400'
                    } group-hover:text-cyan-600 transition-all duration-300 flex-shrink-0 transform group-hover:scale-125 group-hover:rotate-12 group-hover:animate-bounce-soft relative z-10`} />
                    
                    <span className={`ml-3 font-medium text-sm truncate transform transition-all duration-700 ease-in-out group-hover:translate-x-1 relative z-10 ${
                      sidebarOpen ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-95'
                    }`}>
                      {item.label}
                    </span>
                    
                    {!sidebarOpen && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 transform scale-75 group-hover:scale-100 animate-pop-in">
                        {item.label}
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:animate-shine pointer-events-none z-20"></div>
                    
                    {activeSection === item.id && (
                      <>
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-twinkle z-30"></div>
                        <div className="absolute right-4 top-1/3 transform -translate-y-1/2 w-0.5 h-0.5 bg-blue-400 rounded-full animate-twinkle z-30" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute right-3 top-2/3 transform -translate-y-1/2 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-twinkle z-30" style={{ animationDelay: '1s' }}></div>
                      </>
                    )}
                  </button>
                ))}
            </div>
          ))}
        </div>

        {/* Sección de perfil del usuario */}
        <div className="absolute bottom-0 left-0 right-0 p-1.5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 bg-white">
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => {
                if (!sidebarOpen) {
                  setSidebarOpen(true);
                  setTimeout(() => {
                    setProfileMenuOpen(true);
                  }, 400);
                } else {
                  setProfileMenuOpen(!profileMenuOpen);
                }
              }}
              className={`w-full flex items-center bg-white hover:bg-white rounded-lg transition-all duration-300 group hover:shadow-md transform hover:scale-105 active:scale-95 ${
                sidebarOpen ? 'p-1.5' : 'p-1 justify-center'
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className={`rounded-full object-cover border-2 border-cyan-200 group-hover:border-cyan-400 transition-all duration-300 shadow-md group-hover:shadow-lg ${
                    sidebarOpen ? 'w-12 h-12' : 'w-8 h-8'
                  }`}
                />
                <div className={`absolute -bottom-0.5 -right-0.5 bg-green-400 border-2 border-white rounded-full animate-pulse ${
                  sidebarOpen ? 'w-2 h-2' : 'w-1.5 h-1.5'
                }`}></div>
              </div>

              <div className={`ml-2 flex-1 min-w-0 transition-all duration-700 ease-in-out transform ${
                sidebarOpen ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-95'
              }`}>
                <p className="text-s font-semibold text-gray-800 truncate group-hover:text-cyan-700 transition-colors leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 truncate leading-tight">
                  {currentUser.role}
                </p>
              </div>

              {sidebarOpen && (
                <ChevronDown className={`w-3 h-3 text-gray-400 group-hover:text-cyan-600 transition-all duration-300 transform ${
                  profileMenuOpen ? 'rotate-180' : 'rotate-0'
                }`} />
              )}
            </button>

            {profileMenuOpen && sidebarOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 animate-slideUp z-60">
                <button
                  onClick={handleViewProfile}
                  className="w-full bg-white flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 hover:text-cyan-600 transition-all duration-200 group"
                >
                  <User className="w-5 h-5 mr-2 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                  Ver Perfil
                </button>
                <div className="border-t border-gray-100 my-0.5"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex bg-white items-center px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
                >
                  <LogOut className="w-5 h-5 mr-2 text-red-500 group-hover:text-red-600 transition-colors" />
                  Cerrar Sesión
                </button>
              </div>
            )}

            {!sidebarOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 transform scale-75 group-hover:scale-100 animate-pop-in">
                {currentUser.name}
              </div>
            )}
          </div>
        </div>
        
        {/* Efectos de borde brillante con animación mejorada */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 via-blue-500 to-cyan-400 opacity-30 animate-pulse"></div>
          {isExpanding && (
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 via-blue-100 to-transparent opacity-20 animate-expandGlow"></div>
          )}
          {isContracting && (
            <div className="absolute inset-0 bg-gradient-to-l from-gray-100 via-gray-50 to-transparent opacity-30 animate-contractGlow"></div>
          )}
        </div>
      </div>

      {/* Estilos CSS personalizados mejorados */}
      <style jsx>{`
        /* ... (Todas las animaciones y estilos de la sidebar van aquí) ... */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { 
            opacity: 0;
            transform: translateX(20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
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
        
        @keyframes expandSidebar {
          0% { 
            transform: scaleX(0.95) scaleY(0.98);
            opacity: 0.9;
            box-shadow: 0 0 0 rgba(6, 182, 212, 0);
          }
          30% {
            transform: scaleX(1.03) scaleY(1.01);
            opacity: 1;
            box-shadow: 0 0 25px rgba(6, 182, 212, 0.2);
          }
          70% {
            transform: scaleX(1.01) scaleY(1.005);
            opacity: 1;
            box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
          }
          100% { 
            transform: scaleX(1) scaleY(1);
            opacity: 1;
            box-shadow: 0 0 0 rgba(6, 182, 212, 0);
          }
        }
        
        @keyframes contractSidebar {
          0% { 
            transform: scaleX(1) scaleY(1);
            opacity: 1;
            box-shadow: 0 0 0 rgba(107, 114, 128, 0);
          }
          30% {
            transform: scaleX(0.97) scaleY(0.99);
            opacity: 0.95;
            box-shadow: 0 0 15px rgba(107, 114, 128, 0.15);
          }
          70% {
            transform: scaleX(0.99) scaleY(1.005);
            opacity: 0.98;
            box-shadow: 0 0 8px rgba(107, 114, 128, 0.08);
          }
          100% { 
            transform: scaleX(1) scaleY(1);
            opacity: 1;
            box-shadow: 0 0 0 rgba(107, 114, 128, 0);
          }
        }
        
        @keyframes expandGlow {
          0% { 
            opacity: 0;
            transform: translateX(-100%);
          }
          20% {
            opacity: 0.2;
            transform: translateX(-50%);
          }
          50% {
            opacity: 0.4;
            transform: translateX(0%);
          }
          80% {
            opacity: 0.2;
            transform: translateX(50%);
          }
          100% { 
            opacity: 0;
            transform: translateX(100%);
          }
        }
        
        @keyframes contractGlow {
          0% { 
            opacity: 0;
            transform: translateX(100%);
          }
          20% {
            opacity: 0.15;
            transform: translateX(50%);
          }
          50% {
            opacity: 0.3;
            transform: translateX(0%);
          }
          80% {
            opacity: 0.15;
            transform: translateX(-50%);
          }
          100% { 
            opacity: 0;
            transform: translateX(-100%);
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
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
        .animate-expandSidebar {
          animation: expandSidebar 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .animate-contractSidebar {
          animation: contractSidebar 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .animate-expandGlow {
          animation: expandGlow 0.6s ease-out;
        }
        .animate-contractGlow {
          animation: contractGlow 0.6s ease-out;
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
        .active-gradient-item {
          position: relative;
        }
        .transform-gpu {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </>
  );
};

export default Sidebar;