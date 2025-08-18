import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Admin/Sidebar';
import '../../App.css';
import { 
  LayoutDashboard, Users, UserCheck, Eye, Package, Glasses, ShoppingBag, Tags, Bookmark, Calendar, FileText, Receipt, Settings, Search, Filter, Trash2, Edit, Plus, TrendingUp, TrendingDown, Clock, MapPin, Percent, Menu, X, Building, CheckCircle, DollarSign, Building2, Tag, XCircle,Image, Phone, Mail, UserX, Award, ChevronDown, User, LogOut, AlertCircle, Save, Check
} from 'lucide-react';
import Clientes from '../../components/Admin/management/Clientes';
import Empleados from '../../components/Admin/management/Empleados';
import Optometristas from '../../components/Admin/management/Optometristas'
import Recetas from '../../components/Admin/management/Recetas';
import Dashboard from '../../components/Admin/management/DashboardContent';
import Lentes from '../../components/Admin/management/LentesContent';
import Accesorios from '../../components/Admin/management/AccesoriosContent';
import Personalizados from '../../components/Admin/management/PersonalizadosContent';
import Categorias from '../../components/Admin/management/CategoriasContent';
import Marcas from '../../components/Admin/management/MarcasContent';
import Promociones from '../../components/Admin/management/PromocionesContent';
import Citas from '../../components/Admin/management/CitasContent';
import HistorialMedico from '../../components/Admin/management/HistorialMedicoContent';
import Sucursales from '../../components/Admin/management/SucursalesContent';

const OpticaDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setActiveSection('recetas');
    window.addEventListener('goToRecetasAndEdit', handler);
    // Cierra el menú móvil si cambias a escritorio
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('goToRecetasAndEdit', handler);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'Principal' },
    { id: 'clientes', icon: Users, label: 'Clientes', section: 'Personal' },
    { id: 'empleados', icon: UserCheck, label: 'Empleados', section: 'Personal' },
    { id: 'optometristas', icon: Eye, label: 'Optometristas', section: 'Personal' },
    { id: 'lentes', icon: Glasses, label: 'Lentes', section: 'Productos' },
    { id: 'accesorios', icon: ShoppingBag, label: 'Accesorios', section: 'Productos' },
    { id: 'personalizados', icon: Package, label: 'Personalizados', section: 'Productos' },
    { id: 'categorias', icon: Tags, label: 'Categorías', section: 'Productos' },
    { id: 'marcas', icon: Bookmark, label: 'Marcas', section: 'Productos' },
    { id: 'citas', icon: Calendar, label: 'Citas', section: 'Médico' },
    { id: 'historial', icon: FileText, label: 'Historial Médico', section: 'Médico' },
    { id: 'recetas', icon: Receipt, label: 'Recetas', section: 'Médico' },
    { id: 'sucursales', icon: MapPin, label: 'Sucursales', section: 'Administración' },
    { id: 'promociones', icon: Percent, label: 'Promociones', section: 'Productos' }
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };   

    const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        // Pasamos un callback para permitir que el Dashboard cambie la sección activa
        return <Dashboard onNavigate={setActiveSection} />;

      case 'clientes':
        return <Clientes/>;
      case 'empleados':  
        return <Empleados />;
      case 'optometristas':
        return <Optometristas />;
      case 'lentes':
        return <Lentes />;
      case 'accesorios':
        return <Accesorios />;
      case 'personalizados':
        return <Personalizados />;
      case 'categorias':
        return<Categorias />;
      case 'marcas':
        return <Marcas />;
      case 'citas': 
        return <Citas />;
      case 'historial': 
        return <HistorialMedico />;
      case 'recetas': 
        return <Recetas />;
      case 'sucursales':
        return <Sucursales />;
      case 'promociones':
        return <Promociones />;
      default:
        return (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {menuItems.find(item => item.id === activeSection)?.label}
            </h2>
            <p className="text-gray-600">
              Todavia me falta esta sección XD. Pero imagina que es la interfaz {activeSection}.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Llamamos al componente Sidebar y le pasamos las props necesarias */}
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        menuItems={menuItems}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      
      <div className={`transition-all duration-300 relative z-10 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        {/* Header móvil */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between">
          {/* Botón de menú hamburguesa eliminado */}
          <div />
          <h1 className="text-base sm:text-lg font-semibold text-cyan-600 truncate px-2">
            {activeSection === 'dashboard' 
              ? 'Panel de Administración' 
              : menuItems.find(item => item.id === activeSection)?.label
            }
          </h1>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500 rounded-full flex items-center justify-center">
            
          </div>
        </div>

        {/* Header escritorio */}
        <header className="hidden lg:block bg-white shadow-sm border-b border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-cyan-600">
                {activeSection === 'dashboard' 
                  ? 'Panel de Administración' 
                  : menuItems.find(item => item.id === activeSection)?.label
                }
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-3 sm:p-4 lg:p-6">
          <div key={activeSection} className="animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OpticaDashboard;