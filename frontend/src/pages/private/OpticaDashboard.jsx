import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
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
import Ventas from '../../components/Admin/management/VentasContent';
import { useAuth } from '../../components/auth/AuthContext';
import Auditoria from '../../components/Admin/management/Auditoria';


const OpticaDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contentMarginLeft, setContentMarginLeft] = useState(0);
  const { user } = useAuth();

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

  // Calcula el margen izquierdo dinámico del contenido en función del ancho del sidebar
  useEffect(() => {
    const recalc = () => {
      const w = window.innerWidth || 0;
      if (w < 768) {
        // móvil: contenido a ancho completo
        setContentMarginLeft(0);
        return;
      }
      // md y superiores: si está abierto vs colapsado
      if (w >= 1024) {
        // lg+: abierto 16rem (256px), colapsado 4rem (64px)
        setContentMarginLeft(sidebarOpen ? 256 : 64);
      } else {
        // md: abierto 15rem (240px), colapsado 4rem (64px)
        setContentMarginLeft(sidebarOpen ? 240 : 64);
      }
    };
    recalc();
    window.addEventListener('resize', recalc);
    const id = setTimeout(recalc, 0);
    return () => { window.removeEventListener('resize', recalc); clearTimeout(id); };
  }, [sidebarOpen, mobileMenuOpen]);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'Principal', allowedRoles: ['Administrador', 'Gerente', 'Empleado'] },
    { id: 'clientes', icon: Users, label: 'Clientes', section: 'Personal', allowedRoles: ['Administrador', 'Gerente', 'Vendedor', 'Recepcionista', 'Optometrista', 'Empleado'] },
    { id: 'empleados', icon: UserCheck, label: 'Empleados', section: 'Personal', allowedRoles: ['Administrador', 'Gerente'] },
    { id: 'optometristas', icon: Eye, label: 'Optometristas', section: 'Personal', allowedRoles: ['Administrador', 'Gerente'] },
    { id: 'lentes', icon: Glasses, label: 'Lentes', section: 'Productos', allowedRoles: ['Administrador', 'Gerente', 'Técnico', 'Empleado'] },
    { id: 'accesorios', icon: ShoppingBag, label: 'Accesorios', section: 'Productos', allowedRoles: ['Administrador', 'Gerente', 'Técnico', 'Empleado'] },
    { id: 'personalizados', icon: Package, label: 'Personalizados', section: 'Productos', allowedRoles: ['Administrador', 'Gerente', 'Técnico', 'Vendedor', 'Empleado'] },
    { id: 'categorias', icon: Tags, label: 'Categorías', section: 'Productos', allowedRoles: ['Administrador', 'Gerente'] },
    { id: 'marcas', icon: Bookmark, label: 'Marcas', section: 'Productos', allowedRoles: ['Administrador', 'Gerente'] },
    { id: 'ventas', icon: DollarSign, label: 'Ventas', section: 'Administración', allowedRoles: ['Administrador', 'Gerente', 'Vendedor', 'Recepcionista', 'Empleado'] },
    { id: 'citas', icon: Calendar, label: 'Citas', section: 'Médico', allowedRoles: ['Administrador', 'Gerente', 'Recepcionista', 'Optometrista'] },
    { id: 'historial', icon: FileText, label: 'Historial Médico', section: 'Médico', allowedRoles: ['Administrador', 'Gerente', 'Optometrista'] },
    { id: 'recetas', icon: Receipt, label: 'Recetas', section: 'Médico', allowedRoles: ['Administrador', 'Gerente', 'Optometrista'] },
    { id: 'sucursales', icon: MapPin, label: 'Sucursales', section: 'Administración', allowedRoles: ['Administrador', 'Gerente'] },
    { id: 'promociones', icon: Percent, label: 'Promociones', section: 'Productos', allowedRoles: ['Administrador', 'Gerente', 'Vendedor'] }
    ,{ id: 'auditoria', icon: Settings, label: 'Auditoría', section: 'Administración', allowedRoles: ['Administrador'] }
  ];

  // Normalización y aliasado de roles para comparación robusta
  const normalize = (s) => (s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  const mapRole = (r) => {
    const v = normalize(r);
    if (!v) return '';
    if (v.startsWith('admin')) return 'administrador';
    if (v === 'gerente' || v === 'manager') return 'gerente';
    if (v === 'vendedor' || v === 'ventas' || v === 'seller') return 'vendedor';
    if (v === 'recepcionista' || v === 'recepcion') return 'recepcionista';
    if (v === 'optometrista' || v === 'optometra' || v === 'optico') return 'optometrista';
    if (v === 'tecnico' || v === 'técnico' || v === 'tech') return 'tecnico';
    if (v === 'cliente' || v === 'customer') return 'cliente';
    if (v === 'empleado' || v === 'staff' || v === 'user') return 'empleado';
    return v; // fallback a la versión normalizada
  };
  const userRoleRaw = user?.rol || user?.role || (user?.userType === 'cliente' ? 'Cliente' : 'Empleado');
  const userRoleCanon = mapRole(userRoleRaw);
  // Extraer Cargo cuando el rol base es Empleado (para RBAC interno)
  const userCargoRaw = useMemo(() => {
    // Intentar desde el user del contexto
    const ctxCandidates = [
      user?.cargo,
      user?.Cargo,
      user?.puesto,
      user?.Puesto,
      user?.rolCargo,
      user?.roleCargo,
      user?.cargoNombre,
      user?.cargo_name,
      user?.position,
      user?.Position,
      // anidados
      user?.cargo?.nombre,
      user?.cargo?.name,
      user?.empleado?.cargo,
      user?.empleado?.Cargo,
      user?.empleado?.puesto,
      user?.empleado?.Puesto,
      user?.empleado?.cargo?.nombre,
      user?.empleado?.cargo?.name,
      user?.profile?.cargo,
      user?.profile?.puesto,
    ].filter(Boolean);
    if (ctxCandidates.length) return ctxCandidates[0];

    // Fallback: leer del localStorage (aurora_user)
    try {
      const stored = localStorage.getItem('aurora_user');
      if (stored) {
        const lu = JSON.parse(stored);
        const lsCandidates = [
          lu?.cargo,
          lu?.Cargo,
          lu?.puesto,
          lu?.Puesto,
          lu?.rolCargo,
          lu?.roleCargo,
          lu?.cargoNombre,
          lu?.cargo_name,
          lu?.position,
          lu?.Position,
          lu?.cargo?.nombre,
          lu?.cargo?.name,
          lu?.empleado?.cargo,
          lu?.empleado?.Cargo,
          lu?.empleado?.puesto,
          lu?.empleado?.Puesto,
          lu?.empleado?.cargo?.nombre,
          lu?.empleado?.cargo?.name,
          lu?.profile?.cargo,
          lu?.profile?.puesto,
        ].filter(Boolean);
        if (lsCandidates.length) return lsCandidates[0];
      }
    } catch (_) { /* noop */ }
    return null;
  }, [user]);
  const userCargoCanon = mapRole(userCargoRaw);
  // Debug override por query param (solo valores EXACTOS permitidos):
  // ?role=Administrador|Gerente|Vendedor|Optometrista|Técnico|Recepcionista
  const location = useLocation();
  const debugRoleParam = React.useMemo(() => {
    try { return new URLSearchParams(location.search).get('role'); } catch { return null; }
  }, [location.search]);
  const debugCargoParam = React.useMemo(() => {
    try { return new URLSearchParams(location.search).get('cargo'); } catch { return null; }
  }, [location.search]);
  const roleOverrideCanon = React.useMemo(() => {
    if (!debugRoleParam) return null;
    const allowedExact = ['Administrador', 'Gerente', 'Vendedor', 'Optometrista', 'Técnico', 'Recepcionista'];
    if (!allowedExact.includes(debugRoleParam)) return null; // rechazar alias como "admin"
    const mapped = mapRole(debugRoleParam);
    return mapped || null;
  }, [debugRoleParam]);
  const cargoOverrideCanon = React.useMemo(() => {
    if (!debugCargoParam) return null;
    const allowedExact = ['Administrador', 'Gerente', 'Vendedor', 'Optometrista', 'Técnico', 'Recepcionista'];
    if (!allowedExact.includes(debugCargoParam)) return null;
    const mapped = mapRole(debugCargoParam);
    return mapped || null;
  }, [debugCargoParam]);
  // Si el rol base es 'empleado', usar el Cargo como rol efectivo
  const effectiveRole = roleOverrideCanon || (userRoleCanon === 'empleado' ? (cargoOverrideCanon || userCargoCanon || 'empleado') : userRoleCanon);
  const filteredMenuItems = useMemo(() => {
    // Admin ve todo sin filtrar
    if (effectiveRole === 'administrador') return menuItems;
    return menuItems.filter(mi => {
      if (!mi.allowedRoles || mi.allowedRoles.length === 0) return true;
      return mi.allowedRoles.some(r => mapRole(r) === effectiveRole);
    });
  }, [menuItems, effectiveRole]);

  // Debug RBAC: rol, cargo y opciones visibles
  useEffect(() => {
    if (roleOverrideCanon) {
      console.log('[RBAC] OVERRIDE activo (exacto) ->', debugRoleParam, '=>', roleOverrideCanon);
    }
    if (cargoOverrideCanon) {
      console.log('[RBAC] CARGO OVERRIDE activo (exacto) ->', debugCargoParam, '=>', cargoOverrideCanon);
    }
    console.log('[RBAC] roleRaw=', userRoleRaw, 'canon=', userRoleCanon, '| cargoRaw=', userCargoRaw, 'cargoCanon=', userCargoCanon, 'effective=', effectiveRole, 'visible=', filteredMenuItems.map(m => m.id));
  }, [userRoleRaw, userRoleCanon, userCargoRaw, userCargoCanon, effectiveRole, filteredMenuItems, roleOverrideCanon, cargoOverrideCanon, debugRoleParam, debugCargoParam]);

  // Fallback: si no hay items visibles para el rol, mostrar al menos el Dashboard
  const visibleMenuItems = useMemo(() => {
    if (filteredMenuItems.length > 0) return filteredMenuItems;
    return menuItems.filter(mi => mi.id === 'dashboard');
  }, [filteredMenuItems, menuItems]);

  // Garantizar que la sección activa sea válida para el rol actual
  useEffect(() => {
    if (visibleMenuItems.length === 0) return; // nada visible
    if (!visibleMenuItems.some(mi => mi.id === activeSection)) {
      setActiveSection(visibleMenuItems[0]?.id || 'dashboard');
    }
  }, [visibleMenuItems, activeSection]);

  // Debug: log de cambios de sección
  useEffect(() => {
    console.log('[Dashboard] activeSection ->', activeSection);
  }, [activeSection]);

  // Ids permitidos para navegación según menú visible
  const allowedIds = useMemo(() => visibleMenuItems.map(mi => mi.id), [visibleMenuItems]);
  const handleNavigate = (id) => {
    if (!id) return;
    if (allowedIds.includes(id)) {
      setActiveSection(id);
    } else {
      console.warn('[RBAC] Navegación bloqueada a sección no permitida:', id);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };   

    const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        // Pasamos un callback seguro y los ids visibles
        return <Dashboard onNavigate={handleNavigate} visibleIds={allowedIds} />;

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
      case 'ventas':
        return <Ventas />;
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
      case 'auditoria':
        return <Auditoria />;
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
        menuItems={visibleMenuItems}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      
      <div className={`transition-all duration-300 relative z-10`} style={{ marginLeft: mobileMenuOpen ? 0 : contentMarginLeft }}>
        {/* Header móvil */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between">
          {/* Botón de menú hamburguesa eliminado */}
          <div />
          <h1 className="text-base sm:text-lg font-semibold text-cyan-600 truncate px-2">
            {activeSection === 'dashboard' 
              ? 'Panel de Administración' 
              : (visibleMenuItems.find(item => item.id === activeSection)?.label || menuItems.find(item => item.id === activeSection)?.label)
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
                  : (visibleMenuItems.find(item => item.id === activeSection)?.label || menuItems.find(item => item.id === activeSection)?.label)
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