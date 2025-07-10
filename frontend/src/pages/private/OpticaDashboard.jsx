import React, { useState } from 'react';
import Sidebar from '../../components/Admin/Sidebar';
import '../../App.css';
import { 
  LayoutDashboard, Users, UserCheck, Eye, Package, Glasses, ShoppingBag, Tags, Bookmark, Calendar, FileText, Receipt, Settings, Search, Filter, Trash2, Edit, Plus, TrendingUp, TrendingDown, Clock, MapPin, Percent, Menu, X, Building, CheckCircle, DollarSign, Building2, Tag, XCircle,Image, Phone, Mail, UserX, Award, ChevronDown, User, LogOut, AlertCircle, Save, Check
} from 'lucide-react';
import Clientes from '../../components/Admin/management/Clientes';
import Empleados from '../../components/Admin/management/Empleados';
import Optometristas from '../../components/Admin/management/Optometristas'

const OpticaDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Datos de ejemplo
  const dashboardData = {
    ventas: { value: '$15,240', change: '12.5%', trend: 'up' },
    clientes: { value: '254', change: '8.2%', trend: 'up' },
    cotizaciones: { value: '23', change: '18.7%', trend: 'up' },
    citas: { value: '42', change: '5.3%', trend: 'up' }
  };

  const productosRecientes = [
    { nombre: 'Armazón Ray-Ban RB3025', tipo: 'Lente', precio: '$189.99', stock: 15 },
    { nombre: 'Lentes de Contacto Acuvue', tipo: 'Lente', precio: '$45.50', stock: 32 },
    { nombre: 'Gafas de Sol Polarizadas', tipo: 'Lente', precio: '$120.00', stock: 8 },
    { nombre: 'Estuche para Lentes Premium', tipo: 'Accesorio', precio: '$25.99', stock: 42 }
  ];

  const citasProximas = [
    { cliente: 'Marina Gonzales', servicio: 'Examen Visual', fecha: 'Hoy, 14:30', sucursal: 'Principal' },
    { cliente: 'Juan Pérez', servicio: 'Adaptación de Lentes', fecha: 'Mañana, 10:15', sucursal: 'Principal' },
    { cliente: 'Ana Rodríguez', servicio: 'Examen Visual', fecha: '23 Mayo, 16:00', sucursal: 'Quezalte' },
    { cliente: 'Carlos Martínez', servicio: 'Consulta Oftalmológica', fecha: '24 Mayo, 11:30', sucursal: 'Quezalte' }
  ];

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

  const DashboardContent = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(dashboardData).map(([key, data]) => (
          <div key={key} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium capitalize">
                  {key === 'ventas' ? 'Ventas Totales' : 
                   key === 'clientes' ? 'Clientes Activos' :
                   key === 'cotizaciones' ? 'Cotizaciones' : 'Citas Agendadas'}
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{data.value}</p>
              </div>
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                data.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {data.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{data.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos Recientes */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="bg-cyan-500 text-white p-6">
            <h3 className="text-xl font-bold">Productos Recientes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {productosRecientes.map((producto, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800">{producto.nombre}</p>
                    <p className="text-sm text-gray-500">{producto.tipo}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-cyan-600">{producto.precio}</p>
                    <p className="text-sm text-gray-500">Stock: {producto.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Citas Próximas */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="bg-cyan-500 text-white p-6">
            <h3 className="text-xl font-bold">Citas Próximas</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {citasProximas.map((cita, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{cita.cliente}</p>
                    <p className="text-sm text-gray-500">{cita.servicio}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">{cita.fecha}</p>
                    <p className="text-sm text-cyan-600">{cita.sucursal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="bg-cyan-500 text-white p-6">
          <h3 className="text-xl font-bold">Acciones Rápidas</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Nuevo Lente', icon: Plus },
              { label: 'Nuevo Cliente', icon: Plus },
              { label: 'Nueva Cotización', icon: Plus },
              { label: 'Nueva Cita', icon: Plus }
            ].map((action, index) => (
              <button
                key={index}
                className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg hover:bg-cyan-50 hover:text-cyan-700 transition-all duration-200 transform hover:scale-105"
              >
                <action.icon className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const OptometristasContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [setShowAddModal] = useState(false);

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Datos de ejemplo para optometristas
  const optometristas = [
    {
      _id: "3de939ed28a595d73ec46613",
      empleadoId: "abb46881fa25120ffd6d97f",
      nombre: "Dr. Javier Méndez",
      email: "javier.mendez@optica.com",
      telefono: "7123-4567",
      especialidad: "General",
      licencia: "L8489",
      experiencia: 8,
      fotoPerfil: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
      disponibilidad: [
        { dia: "jueves", horaInicio: "08:00", horaFin: "17:00" },
        { dia: "viernes", horaInicio: "08:00", horaFin: "17:00" },
        { dia: "lunes", horaInicio: "08:00", horaFin: "17:00" }
      ],
      sucursalesAsignadas: ["912e77e8978d9c7f256f1d3f", "821949238f2d576ef36e347f"],
      disponible: true,
      fechaCreacion: "2024-01-15",
      pacientesAtendidos: 1250
    },
    {
      _id: "4ef040fe39b606e84fd57724",
      empleadoId: "bcc57992gb36231gge7e08g",
      nombre: "Dra. María Rodríguez",
      email: "maria.rodriguez@optica.com",
      telefono: "7234-5678",
      especialidad: "Pediátrica",
      licencia: "L9012",
      experiencia: 6,
      fotoPerfil: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      disponibilidad: [
        { dia: "lunes", horaInicio: "08:00", horaFin: "16:00" },
        { dia: "martes", horaInicio: "08:00", horaFin: "16:00" },
        { dia: "miércoles", horaInicio: "08:00", horaFin: "16:00" }
      ],
      sucursalesAsignadas: ["912e77e8978d9c7f256f1d3f"],
      disponible: true,
      fechaCreacion: "2024-01-20",
      pacientesAtendidos: 890
    },
    {
      _id: "5fg151gf50c717f95ge68835",
      empleadoId: "cdd68003hc47342hh8f19h",
      nombre: "Dr. Carlos Hernández",
      email: "carlos.hernandez@optica.com",
      telefono: "7345-6789",
      especialidad: "Contactología",
      licencia: "L7856",
      experiencia: 10,
      fotoPerfil: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
      disponibilidad: [
        { dia: "martes", horaInicio: "09:00", horaFin: "18:00" },
        { dia: "jueves", horaInicio: "09:00", horaFin: "18:00" },
        { dia: "sábado", horaInicio: "08:00", horaFin: "14:00" }
      ],
      sucursalesAsignadas: ["821949238f2d576ef36e347f"],
      disponible: true,
      fechaCreacion: "2024-02-01",
      pacientesAtendidos: 1420
    },
    {
      _id: "6gh262hg61d828g06hf79946",
      empleadoId: "dee79114id58453ii9g20i",
      nombre: "Dra. Ana López",
      email: "ana.lopez@optica.com",
      telefono: "7456-7890",
      especialidad: "General",
      licencia: "L6543",
      experiencia: 4,
      fotoPerfil: "https://images.unsplash.com/photo-1594824885093-45c3fce3238b?w=150&h=150&fit=crop&crop=face",
      disponibilidad: [
        { dia: "lunes", horaInicio: "08:00", horaFin: "17:00" },
        { dia: "miércoles", horaInicio: "08:00", horaFin: "17:00" },
        { dia: "viernes", horaInicio: "08:00", horaFin: "17:00" }
      ],
      sucursalesAsignadas: ["821949238f2d576ef36e347f"],
      disponible: true,
      fechaCreacion: "2024-02-10",
      pacientesAtendidos: 980
    },
    {
      _id: "7hi373ih72e939h17ig80057",
      empleadoId: "eff80225je69564jj0h31j",
      nombre: "Dr. Luis García",
      email: "luis.garcia@optica.com",
      telefono: "7567-8901",
      especialidad: "Baja Visión",
      licencia: "L5432",
      experiencia: 12,
      fotoPerfil: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=150&h=150&fit=crop&crop=face",
      disponibilidad: [
        { dia: "martes", horaInicio: "08:00", horaFin: "16:00" },
        { dia: "jueves", horaInicio: "08:00", horaFin: "16:00" }
      ],
      sucursalesAsignadas: ["912e77e8978d9c7f256f1d3f"],
      disponible: false,
      fechaCreacion: "2024-03-05",
      pacientesAtendidos: 650
    },
    {
      _id: "8ij484ji83f040i28jh91168",
      empleadoId: "fgg91336kg70675kk1i42k",
      nombre: "Dra. Patricia Vásquez",
      email: "patricia.vasquez@optica.com",
      telefono: "7678-9012",
      especialidad: "Ortóptica",
      licencia: "L4321",
      experiencia: 7,
      fotoPerfil: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face",
      disponibilidad: [
        { dia: "lunes", horaInicio: "09:00", horaFin: "17:00" },
        { dia: "miércoles", horaInicio: "09:00", horaFin: "17:00" },
        { dia: "viernes", horaInicio: "09:00", horaFin: "17:00" }
      ],
      sucursalesAsignadas: ["912e77e8978d9c7f256f1d3f", "821949238f2d576ef36e347f"],
      disponible: true,
      fechaCreacion: "2024-03-10",
      pacientesAtendidos: 1100
    },
    {
      _id: "9jk595kj94g151j39ki02279",
      empleadoId: "ghh02447lh81786ll2j53l",
      nombre: "Dr. Roberto Martínez",
      email: "roberto.martinez@optica.com",
      telefono: "7789-0123",
      especialidad: "Contactología",
      licencia: "L3210",
      experiencia: 5,
      fotoPerfil: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
      disponibilidad: [
        { dia: "martes", horaInicio: "08:00", horaFin: "18:00" },
        { dia: "jueves", horaInicio: "08:00", horaFin: "18:00" },
        { dia: "sábado", horaInicio: "08:00", horaFin: "14:00" }
      ],
      sucursalesAsignadas: ["821949238f2d576ef36e347f"],
      disponible: true,
      fechaCreacion: "2024-03-15",
      pacientesAtendidos: 780
    },
    {
      _id: "0kl606lk05h262k40lj13380",
      empleadoId: "hii13558mi92897mm3k64m",
      nombre: "Dra. Sofia Ramírez",
      email: "sofia.ramirez@optica.com",
      telefono: "7890-1234",
      especialidad: "General",
      licencia: "L2109",
      experiencia: 3,
      fotoPerfil: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=150&h=150&fit=crop&crop=face",
      disponibilidad: [
        { dia: "lunes", horaInicio: "08:00", horaFin: "17:00" },
        { dia: "miércoles", horaInicio: "08:00", horaFin: "17:00" },
        { dia: "viernes", horaInicio: "08:00", horaFin: "17:00" }
      ],
      sucursalesAsignadas: ["912e77e8978d9c7f256f1d3f"],
      disponible: false,
      fechaCreacion: "2024-03-20",
      pacientesAtendidos: 420
    }
  ];

  // Mapeo de sucursales para mostrar nombres legibles
  const sucursalesMap = {
    "912e77e8978d9c7f256f1d3f": "Principal",
    "821949238f2d576ef36e347f": "Quezaltepeque"
  };

  const filteredOptometristas = optometristas.filter(optometrista => {
    const matchesSearch = optometrista.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         optometrista.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         optometrista.especialidad.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter === 'principal') {
      matchesFilter = optometrista.sucursalesAsignadas.includes("912e77e8978d9c7f256f1d3f");
    } else if (selectedFilter === 'quezaltepeque') {
      matchesFilter = optometrista.sucursalesAsignadas.includes("821949238f2d576ef36e347f");
    } else if (selectedFilter === 'disponibles') {
      matchesFilter = optometrista.disponible === true;
    } else if (selectedFilter === 'no-disponibles') {
      matchesFilter = optometrista.disponible === false;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Calculamos la cantidad total de páginas
  const totalPages = Math.ceil(filteredOptometristas.length / pageSize);

  // Obtenemos los optometristas de la página actual
  const currentOptometristas = filteredOptometristas.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  // Funciones para cambiar de página
  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () => setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  const goToNextPage = () => setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  const getEspecialidadColor = (especialidad) => {
    const colorMap = {
      'General': 'bg-blue-100 text-blue-800',
      'Pediátrica': 'bg-green-100 text-green-800',
      'Contactología': 'bg-purple-100 text-purple-800',
      'Baja Visión': 'bg-orange-100 text-orange-800',
      'Ortóptica': 'bg-pink-100 text-pink-800'
    };
    return colorMap[especialidad] || 'bg-gray-100 text-gray-800';
  };

  const getDisponibilidadColor = (disponible) => {
    return disponible 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getSucursalesTexto = (sucursalesIds) => {
    return sucursalesIds.map(id => sucursalesMap[id] || 'Desconocida').join(', ');
  };

  // Estadísticas calculadas
  const totalOptometristas = optometristas.length;
  const optometristasDisponibles = optometristas.filter(o => o.disponible === true).length;
  const totalPacientes = optometristas.reduce((sum, o) => sum + o.pacientesAtendidos, 0);
  const experienciaPromedio = Math.round(optometristas.reduce((sum, o) => sum + o.experiencia, 0) / totalOptometristas);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Estadísticas rápidas arriba */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Optometristas</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalOptometristas}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Disponibles</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{optometristasDisponibles}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Pacientes</p>
              <p className="text-3xl font-bold text-cyan-600 mt-2">{totalPacientes.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Experiencia Promedio</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{experienciaPromedio} años</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestión de Optometristas</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Optometrista</span>
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar optometrista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilter('todos')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'todos' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedFilter('disponibles')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'disponibles' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Disponibles
              </button>
              <button
                onClick={() => setSelectedFilter('principal')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'principal' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Principal
              </button>
              <button
                onClick={() => setSelectedFilter('quezaltepeque')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'quezaltepeque' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Quezaltepeque
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Optometrista</th>
                <th className="px-6 py-4 text-left font-semibold">Especialidad</th>
                <th className="px-6 py-4 text-left font-semibold">Sucursales</th>
                <th className="px-6 py-4 text-left font-semibold">Licencia</th>
                <th className="px-6 py-4 text-left font-semibold">Experiencia</th>
                <th className="px-6 py-4 text-left font-semibold">Pacientes</th>
                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                <th className="px-6 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentOptometristas.map((optometrista) => (
                <tr key={optometrista._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={optometrista.fotoPerfil}
                        alt={optometrista.nombre}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{optometrista.nombre}</div>
                        <div className="text-sm text-gray-500">{optometrista.email}</div>
                        <div className="text-sm text-gray-500">{optometrista.telefono}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEspecialidadColor(optometrista.especialidad)}`}>
                      {optometrista.especialidad}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {getSucursalesTexto(optometrista.sucursalesAsignadas)}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono">
                    {optometrista.licencia}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">{optometrista.experiencia}</span>
                      <span className="text-sm text-gray-500">años</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-cyan-600 font-bold text-lg">
                    {optometrista.pacientesAtendidos.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDisponibilidadColor(optometrista.disponible)}`}>
                      {optometrista.disponible ? 'Disponible' : 'No Disponible'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredOptometristas.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron optometristas
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza registrando tu primer optometrista'}
            </p>
          </div>
        )}

        {/* Controles de paginación */}
        <div className="mt-4 flex flex-col items-center gap-4 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Mostrar</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="border border-cyan-500 rounded py-1 px-2"
            >
              {[5, 10, 15, 20].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-gray-700">por página</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<<"}
            </button>
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<"}
            </button>
            <span className="text-gray-700 font-medium">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">"}
            </button>
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">>"}
            </button>
          </div>
        </div>
      </div>

      
    </div>
  );
};

  const LentesContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [setShowAddModal] = useState(false);

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Datos de ejemplo basados en la estructura de MongoDB
  const lentes = [
    {
      _id: "74063ad29b9b9ce9d672f937",
      nombre: "Lente Premium 74063a",
      descripcion: "Lente de alta calidad con tecnología anti-reflejo",
      categoriaId: "46c9de168705501d56b9453c",
      marcaId: "8ef394122f2cc2476559b22f",
      material: "Acetato",
      color: "Negro",
      tipoLente: "Monofocal",
      precioBase: 120.50,
      precioActual: 95.99,
      linea: "Premium",
      medidas: {
        anchoPuente: 19.35,
        altura: 48.99,
        ancho: 55.07
      },
      imagenes: [
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=300&h=300&fit=crop&crop=center"
      ],
      enPromocion: true,
      promocionId: "2315796b7a1b2754c849306c",
      tag: "2022-04-01",
      sucursales: [
        {
          sucursalId: "62f45ad527014e17c7a203b8",
          nombreSucursal: "Sucursal X",
          stock: 25
        },
        {
          sucursalId: "66b9149af2e2cbf8d5259866",
          nombreSucursal: "Sucursal Y",
          stock: 13
        }
      ]
    },
    {
      _id: "84063ad29b9b9ce9d672f938",
      nombre: "Lente Sport Vision",
      descripcion: "Lentes deportivos con protección UV y resistencia al impacto",
      categoriaId: "46c9de168705501d56b9453c",
      marcaId: "8ef394122f2cc2476559b22f",
      material: "Titanio",
      color: "Azul",
      tipoLente: "Progresivo",
      precioBase: 250.00,
      precioActual: 199.99,
      linea: "Sport",
      medidas: {
        anchoPuente: 18.00,
        altura: 52.00,
        ancho: 58.00
      },
      imagenes: [
        "https://images.unsplash.com/photo-1556306504-d53a75bc0b4b?w=300&h=300&fit=crop&crop=center"
      ],
      enPromocion: false,
      promocionId: null,
      tag: "2024-01-15",
      sucursales: [
        {
          sucursalId: "62f45ad527014e17c7a203b8",
          nombreSucursal: "Sucursal X",
          stock: 45
        }
      ]
    },
    {
      _id: "94063ad29b9b9ce9d672f939",
      nombre: "Lente Classic Retro",
      descripcion: "Diseño clásico con marcos vintage y cristales de alta definición",
      categoriaId: "46c9de168705501d56b9453c",
      marcaId: "8ef394122f2cc2476559b22f",
      material: "Acetato",
      color: "Marrón",
      tipoLente: "Bifocal",
      precioBase: 180.00,
      precioActual: 165.50,
      linea: "Classic",
      medidas: {
        anchoPuente: 20.00,
        altura: 45.00,
        ancho: 54.00
      },
      imagenes: [
        "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=300&h=300&fit=crop&crop=center"
      ],
      enPromocion: true,
      promocionId: "2315796b7a1b2754c849306c",
      tag: "2024-02-20",
      sucursales: [
        {
          sucursalId: "62f45ad527014e17c7a203b8",
          nombreSucursal: "Sucursal X",
          stock: 8
        },
        {
          sucursalId: "66b9149af2e2cbf8d5259866",
          nombreSucursal: "Sucursal Y",
          stock: 15
        }
      ]
    },
    {
      _id: "a4063ad29b9b9ce9d672f940",
      nombre: "Lente Executive Pro",
      descripcion: "Lentes ejecutivos con filtro de luz azul y diseño profesional",
      categoriaId: "46c9de168705501d56b9453c",
      marcaId: "8ef394122f2cc2476559b22f",
      material: "Metal",
      color: "Plateado",
      tipoLente: "Monofocal",
      precioBase: 320.00,
      precioActual: 285.00,
      linea: "Executive",
      medidas: {
        anchoPuente: 17.50,
        altura: 50.00,
        ancho: 56.50
      },
      imagenes: [
        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=300&h=300&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=300&fit=crop&crop=center"
      ],
      enPromocion: false,
      promocionId: null,
      tag: "2024-03-10",
      sucursales: [
        {
          sucursalId: "62f45ad527014e17c7a203b8",
          nombreSucursal: "Sucursal X",
          stock: 30
        },
        {
          sucursalId: "66b9149af2e2cbf8d5259866",
          nombreSucursal: "Sucursal Y",
          stock: 22
        }
      ]
    },
    {
      _id: "b4063ad29b9b9ce9d672f941",
      nombre: "Lente Fashion Trend",
      descripcion: "Lentes de moda con monturas oversized y cristales polarizados",
      categoriaId: "46c9de168705501d56b9453c",
      marcaId: "8ef394122f2cc2476559b22f",
      material: "Acetato",
      color: "Rosa",
      tipoLente: "Monofocal",
      precioBase: 150.00,
      precioActual: 125.00,
      linea: "Fashion",
      medidas: {
        anchoPuente: 16.00,
        altura: 55.00,
        ancho: 60.00
      },
      imagenes: [
        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=300&h=300&fit=crop&crop=center"
      ],
      enPromocion: true,
      promocionId: "2315796b7a1b2754c849306c",
      tag: "2024-03-25",
      sucursales: [
        {
          sucursalId: "62f45ad527014e17c7a203b8",
          nombreSucursal: "Sucursal X",
          stock: 60
        }
      ]
    },
    {
      _id: "c4063ad29b9b9ce9d672f942",
      nombre: "Lente Kids Protection",
      descripcion: "Lentes especiales para niños con protección extra y materiales seguros",
      categoriaId: "46c9de168705501d56b9453c",
      marcaId: "8ef394122f2cc2476559b22f",
      material: "Silicona",
      color: "Multicolor",
      tipoLente: "Monofocal",
      precioBase: 90.00,
      precioActual: 75.00,
      linea: "Kids",
      medidas: {
        anchoPuente: 15.00,
        altura: 40.00,
        ancho: 48.00
      },
      imagenes: [
        "https://images.unsplash.com/photo-1556306504-d53a75bc0b4b?w=300&h=300&fit=crop&crop=center"
      ],
      enPromocion: false,
      promocionId: null,
      tag: "2024-04-05",
      sucursales: [
        {
          sucursalId: "62f45ad527014e17c7a203b8",
          nombreSucursal: "Sucursal X",
          stock: 35
        },
        {
          sucursalId: "66b9149af2e2cbf8d5259866",
          nombreSucursal: "Sucursal Y",
          stock: 28
        }
      ]
    }
  ];

  // Función para obtener el stock total de un lente
  const getTotalStock = (lente) => {
    return lente.sucursales.reduce((total, sucursal) => total + sucursal.stock, 0);
  };

  // Filtrado de lentes
  const filteredLentes = lentes.filter(lente => {
    const matchesSearch = lente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lente.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lente.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lente.color.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'todos' || 
                         (selectedFilter === 'promocion' && lente.enPromocion) ||
                         (selectedFilter === 'monofocal' && lente.tipoLente === 'Monofocal') ||
                         (selectedFilter === 'progresivo' && lente.tipoLente === 'Progresivo') ||
                         (selectedFilter === 'bifocal' && lente.tipoLente === 'Bifocal');
    
    return matchesSearch && matchesFilter;
  });

  // Calculamos la cantidad total de páginas
  const totalPages = Math.ceil(filteredLentes.length / pageSize);

  // Obtenemos los lentes de la página actual
  const currentLentes = filteredLentes.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  // Funciones para cambiar de página
  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () => setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  const goToNextPage = () => setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  // Función para obtener el color del stock
  const getStockColor = (stock) => {
    if (stock > 50) return 'bg-green-100 text-green-800';
    if (stock > 20) return 'bg-yellow-100 text-yellow-800';
    if (stock > 0) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  // Cálculos para estadísticas
  const totalLentes = lentes.length;
  const lentesEnPromocion = lentes.filter(l => l.enPromocion).length;
  const stockTotal = lentes.reduce((sum, l) => sum + getTotalStock(l), 0);
  const valorInventario = lentes.reduce((sum, l) => sum + (l.precioActual * getTotalStock(l)), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Estadísticas rápidas arriba */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Lentes</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalLentes}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <Glasses className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">En Promoción</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{lentesEnPromocion}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Stock Total</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stockTotal}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Valor Inventario</p>
              <p className="text-3xl font-bold text-green-600 mt-2">${valorInventario.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestión de Lentes</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Lente</span>
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar lente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedFilter('todos')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'todos' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedFilter('promocion')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'promocion' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                En Promoción
              </button>
              <button
                onClick={() => setSelectedFilter('monofocal')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'monofocal' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Monofocal
              </button>
              <button
                onClick={() => setSelectedFilter('progresivo')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'progresivo' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Progresivo
              </button>
              <button
                onClick={() => setSelectedFilter('bifocal')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'bifocal' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Bifocal
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Imagen</th>
                <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                <th className="px-6 py-4 text-left font-semibold">Descripción</th>
                <th className="px-6 py-4 text-left font-semibold">Material/Color</th>
                <th className="px-6 py-4 text-left font-semibold">Tipo</th>
                <th className="px-6 py-4 text-left font-semibold">Precio</th>
                <th className="px-6 py-4 text-left font-semibold">Stock</th>
                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                <th className="px-6 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentLentes.map((lente) => {
                const totalStock = getTotalStock(lente);
                return (
                  <tr key={lente._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={lente.imagenes[0]} 
                          alt={lente.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{lente.nombre}</div>
                        <div className="text-sm text-gray-500">Línea: {lente.linea}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      <div className="truncate">
                        {lente.descripcion}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{lente.material}</div>
                        <div className="text-gray-500">{lente.color}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {lente.tipoLente}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {lente.enPromocion && (
                          <div className="text-gray-500 line-through">${lente.precioBase}</div>
                        )}
                        <div className="text-lg font-bold text-cyan-600">${lente.precioActual}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStockColor(totalStock)}`}>
                        {totalStock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {lente.enPromocion ? (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                          En Promoción
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredLentes.length === 0 && (
          <div className="p-8 text-center">
            <Glasses className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron lentes
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer lente'}
            </p>
          </div>
        )}

        {/* Controles de paginación */}
        <div className="mt-4 flex flex-col items-center gap-4 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Mostrar</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="border border-cyan-500 rounded py-1 px-2"
            >
              {[5, 10, 15, 20].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-gray-700">por página</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<<"}
            </button>
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<"}
            </button>
            <span className="text-gray-700 font-medium">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">"}
            </button>
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">>"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccesoriosContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [ setShowAddModal] = useState(false);

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Datos de ejemplo actualizados según el modelo de MongoDB
  const accesorios = [
    {
      _id: "b163ff84128afec8a3dc4228",
      nombre: "Gomas para Lentes Premium",
      descripcion: "Gomas de repuesto antideslizantes para lentes",
      tipo: "plaquetas",
      marcaId: "818a89e98b3b742205285ea2",
      material: "Goma de silicona",
      color: "Transparente",
      precioBase: 25.99,
      precioActual: 22.50,
      imagenes: [
        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=150&h=150&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1556306535-38febf6782e7?w=150&h=150&fit=crop&crop=center"
      ],
      enPromocion: true,
      promocionId: "0789a6cabc739c773e71f957",
      fechaCreacion: "2023-01-25",
      sucursales: [
        { id: "suc1", stock: 45 },
        { id: "suc2", stock: 23 }
      ]
    },
    {
      _id: "c264gg94239bged9b4ed5339",
      nombre: "Estuche Premium Rígido",
      descripcion: "Estuche rígido de alta calidad con forro interno",
      tipo: "estuche",
      marcaId: "919b90f09c4c853306396fb3",
      material: "Plástico ABS",
      color: "Negro",
      precioBase: 45.00,
      precioActual: 45.00,
      imagenes: [
        "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=150&h=150&fit=crop&crop=center"
      ],
      enPromocion: false,
      fechaCreacion: "2023-02-10",
      sucursales: [
        { id: "suc1", stock: 18 },
        { id: "suc2", stock: 12 }
      ]
    },
    {
      _id: "d375hh05340chfe0c5fe6440",
      nombre: "Cadena Decorativa Elegante",
      descripcion: "Cadena elegante dorada para lentes con diseño vintage",
      tipo: "cadena",
      marcaId: "020c01g10d5d964417407gc4",
      material: "Aleación dorada",
      color: "Dorado",
      precioBase: 38.99,
      precioActual: 35.50,
      imagenes: [
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=150&h=150&fit=crop&crop=center"
      ],
      enPromocion: true,
      promocionId: "1890b7dbcd840d884f82g068",
      fechaCreacion: "2023-03-05",
      sucursales: [
        { id: "suc1", stock: 8 },
        { id: "suc2", stock: 15 }
      ]
    },
    {
      _id: "e486ii16451digg1d6gg7551",
      nombre: "Kit Limpieza Profesional",
      descripcion: "Kit completo de limpieza con spray y paño microfibra",
      tipo: "limpieza",
      marcaId: "131d12h21e6e075528518hd5",
      material: "Líquido + Microfibra",
      color: "Azul",
      precioBase: 28.50,
      precioActual: 25.99,
      imagenes: [
        "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=150&h=150&fit=crop&crop=center"
      ],
      enPromocion: true,
      fechaCreacion: "2023-03-15",
      sucursales: [
        { id: "suc1", stock: 32 },
        { id: "suc2", stock: 28 }
      ]
    },
    {
      _id: "f597jj27562ejhh2e7hh8662",
      nombre: "Paño Microfibra Premium",
      descripcion: "Paño de microfibra ultrasuave para lentes delicados",
      tipo: "limpieza",
      marcaId: "242e23i32f7f186639629ie6",
      material: "Microfibra",
      color: "Gris",
      precioBase: 12.00,
      precioActual: 12.00,
      imagenes: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop&crop=center"
      ],
      enPromocion: false,
      fechaCreacion: "2023-04-01",
      sucursales: [
        { id: "suc1", stock: 67 },
        { id: "suc2", stock: 43 }
      ]
    },
    {
      _id: "g608kk38673fkii3f8ii9773",
      nombre: "Estuche Blando Deportivo",
      descripcion: "Estuche flexible y resistente para actividades deportivas",
      tipo: "estuche",
      marcaId: "353f34j43g8g297740730jf7",
      material: "Neopreno",
      color: "Verde",
      precioBase: 32.50,
      precioActual: 29.99,
      imagenes: [
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=150&h=150&fit=crop&crop=center"
      ],
      enPromocion: true,
      fechaCreacion: "2023-04-12",
      sucursales: [
        { id: "suc1", stock: 21 },
        { id: "suc2", stock: 16 }
      ]
    },
    {
      _id: "h719ll49784gljj4g9jj0884",
      nombre: "Soporte Elegante Madera",
      descripcion: "Base de escritorio en madera natural para exhibir lentes",
      tipo: "soporte",
      marcaId: "464g45k54h9h308851841kg8",
      material: "Madera de roble",
      color: "Natural",
      precioBase: 65.00,
      precioActual: 58.50,
      imagenes: [
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center"
      ],
      enPromocion: true,
      fechaCreacion: "2023-05-08",
      sucursales: [
        { id: "suc1", stock: 5 },
        { id: "suc2", stock: 8 }
      ]
    },
    {
      _id: "i820mm50895hmkk5h0kk1995",
      nombre: "Kit Reparación Completo",
      descripcion: "Herramientas profesionales para reparación de lentes",
      tipo: "herramientas",
      marcaId: "575h56l65i0i419962952lh9",
      material: "Acero inoxidable",
      color: "Plateado",
      precioBase: 48.99,
      precioActual: 45.00,
      imagenes: [
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=150&h=150&fit=crop&crop=center"
      ],
      enPromocion: true,
      fechaCreacion: "2023-05-20",
      sucursales: [
        { id: "suc1", stock: 12 },
        { id: "suc2", stock: 9 }
      ]
    }
  ];

  const filteredAccesorios = accesorios.filter(accesorio => {
    const matchesSearch = accesorio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         accesorio.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         accesorio.material.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'todos' || accesorio.tipo === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculamos la cantidad total de páginas
  const totalPages = Math.ceil(filteredAccesorios.length / pageSize);

  // Obtenemos los accesorios de la página actual
  const currentAccesorios = filteredAccesorios.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  // Funciones para cambiar de página
  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () => setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  const goToNextPage = () => setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  const getMaterialColor = (material) => {
    const materialColors = {
      'Goma de silicona': 'bg-orange-100 text-orange-800',
      'Plástico ABS': 'bg-blue-100 text-blue-800',
      'Aleación dorada': 'bg-yellow-100 text-yellow-800',
      'Líquido + Microfibra': 'bg-cyan-100 text-cyan-800',
      'Microfibra': 'bg-purple-100 text-purple-800',
      'Neopreno': 'bg-green-100 text-green-800',
      'Madera de roble': 'bg-amber-100 text-amber-800',
      'Acero inoxidable': 'bg-gray-100 text-gray-800'
    };
    return materialColors[material] || 'bg-gray-100 text-gray-800';
  };

  const getColorIndicator = (color) => {
    const colorMap = {
      'Transparente': 'bg-white border-2 border-gray-400',
      'Negro': 'bg-black',
      'Dorado': 'bg-yellow-400',
      'Azul': 'bg-blue-500',
      'Gris': 'bg-gray-400',
      'Verde': 'bg-green-500',
      'Natural': 'bg-amber-200',
      'Plateado': 'bg-gray-300'
    };
    return colorMap[color] || 'bg-gray-300';
  };

  // Cálculos para estadísticas
  const totalAccesorios = accesorios.length;
  const accesoriosEnPromocion = accesorios.filter(a => a.enPromocion).length;
  const stockTotal = accesorios.reduce((sum, a) => 
    sum + a.sucursales.reduce((stockSum, s) => stockSum + s.stock, 0), 0
  );
  const valorPromedio = accesorios.reduce((sum, a) => sum + a.precioActual, 0) / accesorios.length;
  //const tiposUnicos = [...new Set(accesorios.map(a => a.tipo))].length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Estadísticas rápidas arriba */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Accesorios</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalAccesorios}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">En Promoción</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{accesoriosEnPromocion}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Tags className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Stock Total</p>
              <p className="text-3xl font-bold text-cyan-600 mt-2">{stockTotal}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Precio Promedio</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">${valorPromedio.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestión de Accesorios</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Accesorio</span>
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar accesorio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['todos', 'estuche', 'cadena', 'limpieza', 'plaquetas', 'soporte', 'herramientas'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                    selectedFilter === filter 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Imagen</th>
                <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                <th className="px-6 py-4 text-left font-semibold">Descripción</th>
                <th className="px-6 py-4 text-left font-semibold">Material</th>
                <th className="px-6 py-4 text-left font-semibold">Color</th>
                <th className="px-6 py-4 text-left font-semibold">Precio</th>
                <th className="px-6 py-4 text-left font-semibold">Stock</th>
                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                <th className="px-6 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentAccesorios.map((accesorio) => (
                <tr key={accesorio._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={accesorio.imagenes[0]} 
                        alt={accesorio.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{accesorio.nombre}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs">
                    <div className="truncate">{accesorio.descripcion}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMaterialColor(accesorio.material)}`}>
                      {accesorio.material}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full border border-gray-300 ${getColorIndicator(accesorio.color)}`}></div>
                      <span className="text-sm text-gray-600">{accesorio.color}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-cyan-600 font-bold text-lg">${accesorio.precioActual}</span>
                      {accesorio.enPromocion && accesorio.precioBase !== accesorio.precioActual && (
                        <span className="text-gray-400 line-through text-sm">${accesorio.precioBase}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-center">
                      <span className="text-lg font-semibold text-gray-900">
                        {accesorio.sucursales.reduce((sum, s) => sum + s.stock, 0)}
                      </span>
                      <div className="text-xs text-gray-500">unidades</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      accesorio.enPromocion ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {accesorio.enPromocion ? 'En Promoción' : 'Regular'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredAccesorios.length === 0 && (
          <div className="p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron accesorios
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer accesorio'}
            </p>
          </div>
        )}

        {/* Controles de paginación */}
        <div className="mt-4 flex flex-col items-center gap-4 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Mostrar</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="border border-cyan-500 rounded py-1 px-2"
            >
              {[5, 10, 15, 20].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-gray-700">por página</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<<"}
            </button>
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<"}
            </button>
            <span className="text-gray-700 font-medium">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">"}
            </button>
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">>"}
            </button>
          </div>
        </div>
      </div>

      
    </div>
  );
};

const PersonalizadosContent = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [ setShowAddModal] = useState(false);

    // Datos de ejemplo para productos personalizados
    const productosPersonalizados = [
      {
        id: 1,
        nombre: 'Lente Personalizado',
        descripcion: 'Lente Personalizado para Cliente',
        categoria: 'Lentes',
        color: 'Negro',
        precio: '$500',
        cliente: 'Juan Pérez',
        fechaCreacion: '2024-05-15',
        estado: 'En Proceso'
      },
      {
        id: 2,
        nombre: 'Armazón Personalizado',
        descripcion: 'Armazón diseñado especialmente',
        categoria: 'Lentes',
        color: 'Dorado',
        precio: '$350',
        cliente: 'María García',
        fechaCreacion: '2024-05-18',
        estado: 'Completado'
      },
      {
        id: 3,
        nombre: 'Lente Bifocal Custom',
        descripcion: 'Lente bifocal con medidas específicas',
        categoria: 'Lentes',
        color: 'Transparente',
        precio: '$450',
        cliente: 'Roberto Martínez',
        fechaCreacion: '2024-05-20',
        estado: 'Pendiente'
      },
      {
        id: 4,
        nombre: 'Gafas Deportivas Custom',
        descripcion: 'Gafas deportivas personalizadas',
        categoria: 'Lentes',
        color: 'Azul',
        precio: '$280',
        cliente: 'Ana López',
        fechaCreacion: '2024-05-22',
        estado: 'En Proceso'
      },
      {
        id: 5,
        nombre: 'Gafas Deportivas Custom',
        descripcion: 'Gafas deportivas personalizadas',
        categoria: 'Lentes',
        color: 'Azul',
        precio: '$280',
        cliente: 'Ana López',
        fechaCreacion: '2024-05-22',
        estado: 'En Proceso'
      },
      {
        id: 6,
        nombre: 'Gafas Deportivas Custom',
        descripcion: 'Gafas deportivas personalizadas',
        categoria: 'Lentes',
        color: 'Azul',
        precio: '$280',
        cliente: 'Ana López',
        fechaCreacion: '2024-05-22',
        estado: 'En Proceso'
      },
      {
        id: 7,
        nombre: 'Gafas Deportivas Custom',
        descripcion: 'Gafas deportivas personalizadas',
        categoria: 'Lentes',
        color: 'Azul',
        precio: '$280',
        cliente: 'Ana López',
        fechaCreacion: '2024-05-22',
        estado: 'En Proceso'
      },
      {
        id: 8,
        nombre: 'Gafas Deportivas Custom',
        descripcion: 'Gafas deportivas personalizadas',
        categoria: 'Lentes',
        color: 'Azul',
        precio: '$280',
        cliente: 'Ana López',
        fechaCreacion: '2024-05-22',
        estado: 'En Proceso'
      },
      {
        id: 9,
        nombre: 'Gafas Deportivas Custom',
        descripcion: 'Gafas deportivas personalizadas',
        categoria: 'Lentes',
        color: 'Azul',
        precio: '$280',
        cliente: 'Ana López',
        fechaCreacion: '2024-05-22',
        estado: 'En Proceso'
      },
      {
        id: 10,
        nombre: 'Gafas Deportivas Custom',
        descripcion: 'Gafas deportivas personalizadas',
        categoria: 'Lentes',
        color: 'Azul',
        precio: '$280',
        cliente: 'Ana López',
        fechaCreacion: '2024-05-22',
        estado: 'En Proceso'
      },
      {
        id: 11,
        nombre: 'Gafas Deportivas Custom',
        descripcion: 'Gafas deportivas personalizadas',
        categoria: 'Lentes',
        color: 'Azul',
        precio: '$280',
        cliente: 'Ana López',
        fechaCreacion: '2024-05-22',
        estado: 'En Proceso'
      }

    ];

    const filteredProducts = productosPersonalizados.filter(producto => {
      const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           producto.cliente.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'todos' || producto.categoria === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const getEstadoColor = (estado) => {
      switch(estado) {
        case 'Completado': return 'bg-green-100 text-green-800';
        case 'En Proceso': return 'bg-yellow-100 text-yellow-800';
        case 'Pendiente': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    // Estado para la página actual y tamaño de página.
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Calculamos la cantidad total de páginas
  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  // Obtenemos los productos de la página actual
  const currentProducts = filteredProducts.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  // Funciones para cambiar de página
  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () => setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  const goToNextPage = () => setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

    return (
      <div className="space-y-6 animate-fade-in">

          {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 ">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Personalizados</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{productosPersonalizados.length}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">En Proceso</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {productosPersonalizados.filter(p => p.estado === 'En Proceso').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Completados</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {productosPersonalizados.filter(p => p.estado === 'Completado').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden ">
          <div className="bg-cyan-500 text-white p-6">
            <div className="flex justify-between items-center ">
              <h2 className="text-2xl font-bold">Productos Personalizados</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir Personalizado</span>
              </button>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por producto o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCategory('todos')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'todos' 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setSelectedCategory('Lentes')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'Lentes' 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Lentes
                </button>
                <button
                  onClick={() => setSelectedCategory('Accesorios')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'Accesorios' 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Accesorios
                </button>
              </div>
            </div>
          </div>

        <div>
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-cyan-500 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Producto</th>
              <th className="px-6 py-4 text-left font-semibold">Cliente</th>
              <th className="px-6 py-4 text-left font-semibold">Categoría</th>
              <th className="px-6 py-4 text-left font-semibold">Color</th>
              <th className="px-6 py-4 text-left font-semibold">Precio</th>
              <th className="px-6 py-4 text-left font-semibold">Fecha</th>
              <th className="px-6 py-4 text-left font-semibold">Estado</th>
              <th className="px-6 py-4 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentProducts.map((producto) => (
              <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{producto.nombre}</div>
                    <div className="text-sm text-gray-500">{producto.descripcion}</div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{producto.cliente}</td>
                <td className="px-6 py-4 text-gray-600">{producto.categoria}</td>
                <td className="px-6 py-4 text-gray-600">{producto.color}</td>
                <td className="px-6 py-4 font-semibold text-cyan-600">{producto.precio}</td>
                <td className="px-6 py-4 text-gray-600">{producto.fechaCreacion}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(producto.estado)}`}>
                    {producto.estado}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mensaje cuando no hay resultados */}
      {filteredProducts.length === 0 && (
            <div className="p-8 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron productos personalizados
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primer producto personalizado'}
              </p>
            </div>
          )}

      {/* Controles de paginación centrados */}
      <div className="mt-4 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
          <span className="text-gray-700">Mostrar</span>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(0);
            }}
            className="border border-cyan-500 rounded py-1 px-2"
          >
            {[5, 10, 15, 20].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-gray-700">por página</span>
        </div>
        <div className="flex items-center gap-2 m-[25px]">
          <button
            onClick={goToFirstPage}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
          >
            {"<<"}
          </button>
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
          >
            {"<"}
          </button>
          <span className="text-gray-700 font-medium">
            Página {currentPage + 1} de {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
          >
            {">"}
          </button>
          <button
            type='button'
            onClick={goToLastPage}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
          >
            {">>"}
          </button>
        </div>

        
      </div>
        </div>
    </div>       

        
      </div>
    );
  };

  const CategoriasContent = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('todas');
    const [setShowAddModal] = useState(false);

    // Estado para la paginación
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // Datos de ejemplo para categorías
    const categorias = [
      {
        id: 1,
        nombre: 'Lentes',
        descripcion: 'Categoría para Lentes',
        icono: 'Glasses',
        totalProductos: 45,
        estado: 'Activo',
        fechaCreacion: '2024-01-15'
      },
      {
        id: 2,
        nombre: 'Accesorios',
        descripcion: 'Categoría para Accesorios',
        icono: 'ShoppingBag',
        totalProductos: 23,
        estado: 'Activo',
        fechaCreacion: '2024-01-20'
      },
      {
        id: 3,
        nombre: 'Personalizados',
        descripcion: 'Categoría para Producto Personalizado',
        icono: 'Package',
        totalProductos: 8,
        estado: 'Activo',
        fechaCreacion: '2024-02-01'
      },
      {
        id: 4,
        nombre: 'Contactos',
        descripcion: 'Categoría para Lentes de Contacto',
        icono: 'Eye',
        totalProductos: 12,
        estado: 'Inactivo',
        fechaCreacion: '2024-02-10'
      },
      {
        id: 5,
        nombre: 'Soluciones',
        descripcion: 'Categoría para Soluciones de Limpieza',
        icono: 'Droplets',
        totalProductos: 6,
        estado: 'Activo',
        fechaCreacion: '2024-03-05'
      },
      {
        id: 6,
        nombre: 'Monturas',
        descripcion: 'Categoría para Monturas de Lentes',
        icono: 'Glasses',
        totalProductos: 15,
        estado: 'Activo',
        fechaCreacion: '2024-03-10'
      },
      {
        id: 7,
        nombre: 'Cristales',
        descripcion: 'Categoría para Cristales Especiales',
        icono: 'Eye',
        totalProductos: 20,
        estado: 'Activo',
        fechaCreacion: '2024-03-15'
      },
      {
        id: 8,
        nombre: 'Estuches',
        descripcion: 'Categoría para Estuches y Fundas',
        icono: 'Package',
        totalProductos: 18,
        estado: 'Inactivo',
        fechaCreacion: '2024-03-20'
      }
    ];

    const filteredCategorias = categorias.filter(categoria => {
      const matchesSearch = categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = selectedFilter === 'todas' || categoria.estado.toLowerCase() === selectedFilter;
      return matchesSearch && matchesFilter;
    });

    // Calculamos la cantidad total de páginas
    const totalPages = Math.ceil(filteredCategorias.length / pageSize);

    // Obtenemos las categorías de la página actual
    const currentCategorias = filteredCategorias.slice(
      currentPage * pageSize,
      currentPage * pageSize + pageSize
    );

    // Funciones para cambiar de página
    const goToFirstPage = () => setCurrentPage(0);
    const goToPreviousPage = () => setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
    const goToNextPage = () => setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
    const goToLastPage = () => setCurrentPage(totalPages - 1);

    const getIconComponent = (iconName) => {
      const iconMap = {
        'Glasses': Glasses,
        'ShoppingBag': ShoppingBag,
        'Package': Package,
        'Eye': Eye,
        'Droplets': Tags // Usamos Tags como fallback para Droplets
      };
      const IconComponent = iconMap[iconName] || Tags;
      return <IconComponent className="w-6 h-6" />;
    };

    const getEstadoColor = (estado) => {
      return estado === 'Activo' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800';
    };

    const totalCategorias = categorias.length;
    const categoriasActivas = categorias.filter(c => c.estado === 'Activo').length;
    const totalProductos = categorias.reduce((sum, c) => sum + c.totalProductos, 0);

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Estadísticas rápidas arriba */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Categorías</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{totalCategorias}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <Tags className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Categorías Activas</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{categoriasActivas}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Productos</p>
                <p className="text-3xl font-bold text-cyan-600 mt-2">{totalProductos}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla principal */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-cyan-500 text-white p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestión de Categorías</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir Categoría</span>
              </button>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedFilter('todas')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedFilter === 'todas' 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setSelectedFilter('activo')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedFilter === 'activo' 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Activas
                </button>
                <button
                  onClick={() => setSelectedFilter('inactivo')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedFilter === 'inactivo' 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Inactivas
                </button>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cyan-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                  <th className="px-6 py-4 text-left font-semibold">Descripción</th>
                  <th className="px-6 py-4 text-left font-semibold">Icono</th>
                  <th className="px-6 py-4 text-left font-semibold">Productos</th>
                  <th className="px-6 py-4 text-left font-semibold">Estado</th>
                  <th className="px-6 py-4 text-left font-semibold">Fecha Creación</th>
                  <th className="px-6 py-4 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentCategorias.map((categoria) => (
                  <tr key={categoria.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{categoria.nombre}</td>
                    <td className="px-6 py-4 text-gray-600">{categoria.descripcion}</td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600">
                        {getIconComponent(categoria.icono)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-900">{categoria.totalProductos}</span>
                        <span className="text-sm text-gray-500">productos</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(categoria.estado)}`}>
                        {categoria.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{categoria.fechaCreacion}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mensaje cuando no hay resultados */}
          {filteredCategorias.length === 0 && (
            <div className="p-8 text-center">
              <Tags className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron categorías
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primera categoría'}
              </p>
            </div>
          )}

          {/* Controles de paginación */}
          <div className="mt-4 flex flex-col items-center gap-4 pb-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Mostrar</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="border border-cyan-500 rounded py-1 px-2"
              >
                {[5, 10, 15, 20].map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-gray-700">por página</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
              >
                {"<<"}
              </button>
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
              >
                {"<"}
              </button>
              <span className="text-gray-700 font-medium">
                Página {currentPage + 1} de {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
              >
                {">"}
              </button>
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
              >
                {">>"}
              </button>
            </div>
          </div>
        </div>

        {/* Vista de cards alternativa (opcional) */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-cyan-500 text-white p-6">
            <h3 className="text-xl font-bold">Vista Rápida de Categorías</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategorias.slice(0, 6).map((categoria) => (
                <div key={`card-${categoria.id}`} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600">
                      {getIconComponent(categoria.icono)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{categoria.nombre}</h4>
                      <p className="text-sm text-gray-500">{categoria.totalProductos} productos</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(categoria.estado)}`}>
                      {categoria.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  const MarcasContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todas');
  const [setShowAddModal] = useState(false);

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Datos actualizados según la estructura de la base de datos
  const marcas = [
    {
      _id: "f1935b6615eeea2cc06c6dc4",
      nombre: "Ray-Ban",
      descripcion: "Marca premium de lentes y gafas de sol con diseño icónico",
      logo: "https://logos-world.net/wp-content/uploads/2020/12/Ray-Ban-Logo.png",
      paisOrigen: "El Salvador", // Usando paisOrigen como en la BD
      lineas: ["Premium"], // Array como en la BD
      totalProductos: 28,
      estado: "Activo",
      fechaCreacion: "2024-01-10"
    },
    {
      _id: "f1935b6615eeea2cc06c6dc5",
      nombre: "Oakley",
      descripcion: "Marca deportiva especializada en gafas de alta performance",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Oakley-Logo.png",
      paisOrigen: "Estados Unidos",
      lineas: ["Premium", "Económica"], // Múltiples líneas
      totalProductos: 22,
      estado: "Activo",
      fechaCreacion: "2024-01-15"
    },
    {
      _id: "f1935b6615eeea2cc06c6dc6",
      nombre: "Converse",
      descripcion: "Marca icónica de calzado urbano y lifestyle",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Converse-Logo.png",
      paisOrigen: "Estados Unidos",
      lineas: ["Premium"],
      totalProductos: 15,
      estado: "Activo",
      fechaCreacion: "2024-02-01"
    },
    {
      _id: "f1935b6615eeea2cc06c6dc7",
      nombre: "Puma",
      descripcion: "Marca deportiva alemana de calzado y ropa deportiva",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Puma-Logo.png",
      paisOrigen: "Alemania",
      lineas: ["Premium"],
      totalProductos: 18,
      estado: "Activo",
      fechaCreacion: "2024-02-05"
    },
    {
      _id: "f1935b6615eeea2cc06c6dc8",
      nombre: "True Religion",
      descripcion: "Marca premium de jeans y ropa casual americana",
      logo: "https://logos-world.net/wp-content/uploads/2020/11/True-Religion-Logo.png",
      paisOrigen: "Estados Unidos",
      lineas: ["Económica"],
      totalProductos: 12,
      estado: "Activo",
      fechaCreacion: "2024-02-10"
    },
    {
      _id: "f1935b6615eeea2cc06c6dc9",
      nombre: "Adidas",
      descripcion: "Marca deportiva alemana líder mundial en equipamiento deportivo",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png",
      paisOrigen: "Alemania",
      lineas: ["Premium", "Económica"],
      totalProductos: 20,
      estado: "Inactivo",
      fechaCreacion: "2024-01-20"
    },
    {
      _id: "f1935b6615eeea2cc06c6dca",
      nombre: "Nike",
      descripcion: "Marca deportiva americana número uno en el mundo",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png",
      paisOrigen: "Estados Unidos",
      lineas: ["Premium"],
      totalProductos: 35,
      estado: "Activo",
      fechaCreacion: "2024-01-05"
    },
    {
      _id: "f1935b6615eeea2cc06c6dcb",
      nombre: "Vans",
      descripcion: "Marca californiana de calzado y ropa para skateboarding",
      logo: "https://logos-world.net/wp-content/uploads/2020/11/Vans-Logo.png",
      paisOrigen: "Estados Unidos",
      lineas: ["Económica"],
      totalProductos: 14,
      estado: "Activo",
      fechaCreacion: "2024-02-15"
    }
  ];

  // Función para obtener todas las líneas únicas
  const getAllLineas = () => {
    const todasLineas = marcas.flatMap(marca => marca.lineas);
    return [...new Set(todasLineas)];
  };

  // Función para verificar si una marca tiene cierta línea
  const marcaTieneLinea = (marca, linea) => {
    return marca.lineas.includes(linea);
  };

  const filteredMarcas = marcas.filter(marca => {
    const matchesSearch = marca.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         marca.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'todas' || 
                         (selectedFilter === 'activo' && marca.estado === 'Activo') ||
                         (selectedFilter === 'inactivo' && marca.estado === 'Inactivo') ||
                         marcaTieneLinea(marca, selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1));
    return matchesSearch && matchesFilter;
  });

  // Calculamos la cantidad total de páginas
  const totalPages = Math.ceil(filteredMarcas.length / pageSize);

  // Obtenemos las marcas de la página actual
  const currentMarcas = filteredMarcas.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  // Funciones para cambiar de página
  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () => setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  const goToNextPage = () => setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  const getEstadoColor = (estado) => {
    return estado === 'Activo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getLineaColor = (linea) => {
    switch(linea) {
      case 'Premium': return 'bg-purple-100 text-purple-800';
      case 'Deportiva': return 'bg-blue-100 text-blue-800';
      case 'Económica': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalMarcas = marcas.length;
  const marcasActivas = marcas.filter(m => m.estado === 'Activo').length;
  const totalProductos = marcas.reduce((sum, m) => sum + m.totalProductos, 0);

  // Obtener conteo de líneas Premium
  const marcasPremium = marcas.filter(m => marcaTieneLinea(m, 'Premium')).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Marcas</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalMarcas}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Marcas Activas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{marcasActivas}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Productos</p>
              <p className="text-3xl font-bold text-cyan-600 mt-2">{totalProductos}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Líneas Premium</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{marcasPremium}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Tags className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestión de Marcas</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Marca</span>
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedFilter('todas')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'todas' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setSelectedFilter('activo')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'activo' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Activas
              </button>
              {getAllLineas().map(linea => (
                <button
                  key={linea}
                  onClick={() => setSelectedFilter(linea.toLowerCase())}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedFilter === linea.toLowerCase() 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {linea}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla con paginación */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                <th className="px-6 py-4 text-left font-semibold">Descripción</th>
                <th className="px-6 py-4 text-left font-semibold">Logo</th>
                <th className="px-6 py-4 text-left font-semibold">Líneas</th>
                <th className="px-6 py-4 text-left font-semibold">Productos</th>
                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                <th className="px-6 py-4 text-left font-semibold">País Origen</th>
                <th className="px-6 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentMarcas.map((marca) => (
                <tr key={marca._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{marca.nombre}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{marca.descripcion}</td>
                  <td className="px-6 py-4">
                    <div className="w-16 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                      <img 
                        src={marca.logo} 
                        alt={`Logo de ${marca.nombre}`}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-full bg-gray-100 items-center justify-center text-gray-400 text-xs">
                        Sin logo
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {marca.lineas.map((linea, index) => (
                        <span 
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getLineaColor(linea)}`}
                        >
                          {linea}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">{marca.totalProductos}</span>
                      <span className="text-sm text-gray-500">productos</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(marca.estado)}`}>
                      {marca.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{marca.paisOrigen}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredMarcas.length === 0 && (
          <div className="p-8 text-center">
            <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron marcas
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primera marca'}
            </p>
          </div>
        )}

        {/* Controles de paginación */}
        <div className="mt-4 flex flex-col items-center gap-4 p-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Mostrar</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="border border-cyan-500 rounded py-1 px-2"
            >
              {[5, 10, 15, 20].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-gray-700">por página</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<<"}
            </button>
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<"}
            </button>
            <span className="text-gray-700 font-medium">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">"}
            </button>
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">>"}
            </button>
          </div>
        </div>
      </div>

      {/* Vista de cards por línea */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <h3 className="text-xl font-bold">Marcas por Línea</h3>
        </div>
        <div className="p-6">
          {getAllLineas().map((linea) => {
            const marcasLinea = marcas.filter(m => marcaTieneLinea(m, linea));
            if (marcasLinea.length === 0) return null;
            
            return (
              <div key={linea} className="mb-6 last:mb-0">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLineaColor(linea)}`}>
                    {linea}
                  </span>
                  <span className="text-sm text-gray-500">({marcasLinea.length} marcas)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marcasLinea.map((marca) => (
                    <div key={`card-${marca._id}`} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img 
                            src={marca.logo} 
                            alt={`Logo de ${marca.nombre}`}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-full bg-gray-100 items-center justify-center text-gray-400 text-xs">
                            Sin logo
                          </div>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{marca.nombre}</h5>
                          <p className="text-sm text-gray-500">{marca.totalProductos} productos • {marca.paisOrigen}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(marca.estado)}`}>
                          {marca.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const CitasContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todas');
  const [setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Datos de ejemplo para citas
  const citas = [
    {
      id: 1,
      cliente: 'Juan Pérez',
      optometrista: 'Dr. Javier Méndez',
      fecha: '2024-06-08',
      hora: '16:00',
      sucursal: 'Principal',
      servicio: 'Examen Visual',
      estado: 'Confirmada',
      telefono: '7777-8888',
      notas: 'Primera consulta, revisar antecedentes familiares',
      duracion: 60,
      precio: '$25.00'
    },
    {
      id: 2,
      cliente: 'Marina Gonzales',
      optometrista: 'Dr. Javier Méndez',
      fecha: '2024-06-08',
      hora: '14:30',
      sucursal: 'Principal',
      servicio: 'Examen Visual',
      estado: 'En Proceso',
      telefono: '6666-7777',
      notas: 'Control mensual, ajuste de graduación',
      duracion: 45,
      precio: '$25.00'
    },
    {
      id: 3,
      cliente: 'Ana Rodríguez',
      optometrista: 'Dr. Carlos López',
      fecha: '2024-06-09',
      hora: '10:15',
      sucursal: 'Quezalte',
      servicio: 'Adaptación de Lentes',
      estado: 'Pendiente',
      telefono: '7555-4444',
      notas: 'Adaptación de lentes progresivos',
      duracion: 30,
      precio: '$15.00'
    },
    {
      id: 4,
      cliente: 'Carlos Martínez',
      optometrista: 'Dr. María Hernández',
      fecha: '2024-06-10',
      hora: '16:00',
      sucursal: 'Quezalte',
      servicio: 'Consulta Oftalmológica',
      estado: 'Confirmada',
      telefono: '7222-3333',
      notas: 'Seguimiento post-cirugía',
      duracion: 90,
      precio: '$45.00'
    },
    {
      id: 5,
      cliente: 'Laura Vásquez',
      optometrista: 'Dr. Javier Méndez',
      fecha: '2024-06-11',
      hora: '09:00',
      sucursal: 'Principal',
      servicio: 'Examen Visual',
      estado: 'Cancelada',
      telefono: '7888-9999',
      notas: 'Reagendar para la próxima semana',
      duracion: 60,
      precio: '$25.00'
    },
    {
      id: 6,
      cliente: 'Roberto Silva',
      optometrista: 'Dr. Carlos López',
      fecha: '2024-06-12',
      hora: '11:30',
      sucursal: 'Principal',
      servicio: 'Control de Seguimiento',
      estado: 'Confirmada',
      telefono: '7111-2222',
      notas: 'Revisión de adaptación a bifocales',
      duracion: 45,
      precio: '$20.00'
    }
  ];

  const filteredCitas = citas.filter(cita => {
    const matchesSearch = cita.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cita.optometrista.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cita.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cita.sucursal.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = false;
    const today = new Date().toISOString().split('T')[0];
    
    switch(selectedFilter) {
      case 'todas':
        matchesFilter = true;
        break;
      case 'hoy':
        matchesFilter = cita.fecha === today;
        break;
      case 'confirmada':
        matchesFilter = cita.estado === 'Confirmada';
        break;
      case 'pendiente':
        matchesFilter = cita.estado === 'Pendiente';
        break;
      case 'proceso':
        matchesFilter = cita.estado === 'En Proceso';
        break;
      case 'cancelada':
        matchesFilter = cita.estado === 'Cancelada';
        break;
      default:
        matchesFilter = true;
    }

    const matchesDate = !selectedDate || cita.fecha === selectedDate;
    
    return matchesSearch && matchesFilter && matchesDate;
  });

  // Calculamos la cantidad total de páginas
  const totalPages = Math.ceil(filteredCitas.length / pageSize);

  // Obtenemos las citas de la página actual
  const currentCitas = filteredCitas.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  // Funciones para cambiar de página
  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () => setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  const goToNextPage = () => setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'Confirmada': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'En Proceso': return 'bg-blue-100 text-blue-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServicioColor = (servicio) => {
    switch(servicio) {
      case 'Examen Visual': return 'bg-cyan-100 text-cyan-800';
      case 'Adaptación de Lentes': return 'bg-purple-100 text-purple-800';
      case 'Consulta Oftalmológica': return 'bg-orange-100 text-orange-800';
      case 'Control de Seguimiento': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const isTomorrow = (dateString) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateString === tomorrow.toISOString().split('T')[0];
  };

  const getDateLabel = (dateString) => {
    if (isToday(dateString)) return 'Hoy';
    if (isTomorrow(dateString)) return 'Mañana';
    return formatDate(dateString);
  };

  // Estadísticas
  const totalCitas = citas.length;
  const citasHoy = citas.filter(c => isToday(c.fecha)).length;
  const citasConfirmadas = citas.filter(c => c.estado === 'Confirmada').length;
  const citasPendientes = citas.filter(c => c.estado === 'Pendiente').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Citas</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalCitas}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Citas Hoy</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{citasHoy}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Confirmadas</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{citasConfirmadas}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{citasPendientes}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestión de Citas</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Cita</span>
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, optometrista, servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedFilter('todas')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'todas' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setSelectedFilter('hoy')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'hoy' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setSelectedFilter('confirmada')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'confirmada' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Confirmadas
              </button>
              <button
                onClick={() => setSelectedFilter('pendiente')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'pendiente' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setSelectedFilter('proceso')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'proceso' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                En Proceso
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Cliente</th>
                <th className="px-6 py-4 text-left font-semibold">Optometrista</th>
                <th className="px-6 py-4 text-left font-semibold">Fecha</th>
                <th className="px-6 py-4 text-left font-semibold">Hora</th>
                <th className="px-6 py-4 text-left font-semibold">Sucursal</th>
                <th className="px-6 py-4 text-left font-semibold">Servicio</th>
                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                <th className="px-6 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentCitas.map((cita) => (
                <tr key={cita.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{cita.cliente}</p>
                      <p className="text-sm text-gray-500">{cita.telefono}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{cita.optometrista}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${isToday(cita.fecha) ? 'text-green-600' : 'text-gray-900'}`}>
                        {getDateLabel(cita.fecha)}
                      </span>
                      {isToday(cita.fecha) && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          HOY
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">{cita.hora}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">{cita.sucursal}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getServicioColor(cita.servicio)}`}>
                      {cita.servicio}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(cita.estado)}`}>
                      {cita.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancelar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredCitas.length === 0 && (
          <div className="p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron citas
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedDate || selectedFilter !== 'todas' 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'Comienza agendando tu primera cita'}
            </p>
          </div>
        )}

        {/* Controles de paginación */}
        <div className="mt-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Mostrar</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="border border-cyan-500 rounded py-1 px-2"
            >
              {[5, 10, 15, 20].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-gray-700">por página</span>
          </div>
          <div className="flex items-center gap-2 m-[25px]">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<<"}
            </button>
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<"}
            </button>
            <span className="text-gray-700 font-medium">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">"}
            </button>
            <button
              type='button'
              onClick={goToLastPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">>"}
            </button>
          </div>
        </div>
      </div>

      {/* Vista de agenda del día */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <h3 className="text-xl font-bold">Agenda del Día</h3>
        </div>
        <div className="p-6">
          {citas
            .filter(cita => isToday(cita.fecha))
            .sort((a, b) => a.hora.localeCompare(b.hora))
            .map((cita) => (
              <div key={`agenda-${cita.id}`} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-4 last:mb-0 hover:bg-gray-100 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-cyan-700">{cita.hora}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{cita.cliente}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cita.estado)}`}>
                      {cita.estado}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{cita.servicio} • {cita.optometrista}</p>
                  <p className="text-sm text-gray-500">{cita.sucursal} • {cita.duracion} min • {cita.precio}</p>
                  {cita.notas && (
                    <p className="text-sm text-gray-500 mt-2 italic">"{cita.notas}"</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Completar">
                    <UserCheck className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          
          {citas.filter(cita => isToday(cita.fecha)).length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No hay citas programadas para hoy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HistorialMedicoContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [setShowAddModal] = useState(false);
  const [setSelectedPatient] = useState(null);

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Datos de ejemplo para historial médico
  const historiales = [
    {
      id: 1,
      paciente: 'Juan Pérez',
      cedula: '12345678-9',
      edad: 45,
      telefono: '7123-4567',
      ultimaVisita: '2024-05-15',
      totalConsultas: 3,
      estado: 'Activo',
      padecimientos: [
        { tipo: 'Miopía', valor: '2.0', ojo: 'Ambos' },
        { tipo: 'Astigmatismo', valor: '0.75', ojo: 'Derecho' }
      ],
      recetas: [
        {
          fecha: '2024-05-15',
          od: { esfera: '-2.25', cilindro: '-0.75', eje: '180°' },
          oi: { esfera: '-2.00', cilindro: '-1.00', eje: '170°' },
          observaciones: 'Control rutinario'
        }
      ],
      notas: 'Paciente con miopía progresiva. Recomendado control cada 6 meses.'
    },
    {
      id: 2,
      paciente: 'María González',
      cedula: '98765432-1',
      edad: 32,
      telefono: '7987-6543',
      ultimaVisita: '2024-05-10',
      totalConsultas: 2,
      estado: 'Activo',
      padecimientos: [
        { tipo: 'Hipermetropía', valor: '1.5', ojo: 'Ambos' },
        { tipo: 'Presbicia', valor: '1.25', ojo: 'Ambos' }
      ],
      recetas: [
        {
          fecha: '2024-05-10',
          od: { esfera: '+1.50', cilindro: '0.00', eje: '---' },
          oi: { esfera: '+1.75', cilindro: '0.00', eje: '---' },
          observaciones: 'Primera consulta'
        }
      ],
      notas: 'Paciente nueva. Hipermetropía leve con inicio de presbicia.'
    },
    {
      id: 3,
      paciente: 'Carlos Martínez',
      cedula: '11223344-5',
      edad: 28,
      telefono: '7456-7890',
      ultimaVisita: '2024-04-20',
      totalConsultas: 1,
      estado: 'Inactivo',
      padecimientos: [
        { tipo: 'Astigmatismo', valor: '1.0', ojo: 'Izquierdo' }
      ],
      recetas: [
        {
          fecha: '2024-04-20',
          od: { esfera: '0.00', cilindro: '0.00', eje: '---' },
          oi: { esfera: '0.00', cilindro: '-1.00', eje: '90°' },
          observaciones: 'Astigmatismo simple'
        }
      ],
      notas: 'Paciente joven con astigmatismo unilateral.'
    }
  ];

  const filteredHistoriales = historiales.filter(historial => {
    const matchesSearch = historial.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         historial.cedula.includes(searchTerm) ||
                         historial.padecimientos.some(p => p.tipo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = selectedFilter === 'todos' || 
                         (selectedFilter === 'activo' && historial.estado === 'Activo') ||
                         (selectedFilter === 'inactivo' && historial.estado === 'Inactivo') ||
                         (selectedFilter === 'reciente' && new Date(historial.ultimaVisita) > new Date('2024-05-01'));
    return matchesSearch && matchesFilter;
  });

  // Calculamos la cantidad total de páginas
  const totalPages = Math.ceil(filteredHistoriales.length / pageSize);

  // Obtenemos los historiales de la página actual
  const currentHistoriales = filteredHistoriales.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  // Funciones para cambiar de página
  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () => setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  const goToNextPage = () => setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  const getEstadoColor = (estado) => {
    return estado === 'Activo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getPadecimientoColor = (tipo) => {
    switch(tipo) {
      case 'Miopía': return 'bg-blue-100 text-blue-800';
      case 'Hipermetropía': return 'bg-orange-100 text-orange-800';
      case 'Astigmatismo': return 'bg-purple-100 text-purple-800';
      case 'Presbicia': return 'bg-gray-100 text-gray-800';
      default: return 'bg-cyan-100 text-cyan-800';
    }
  };

  const totalPacientes = historiales.length;
  const pacientesActivos = historiales.filter(h => h.estado === 'Activo').length;
  const totalConsultas = historiales.reduce((sum, h) => sum + h.totalConsultas, 0);
  const consultasRecientes = historiales.filter(h => new Date(h.ultimaVisita) > new Date('2024-05-01')).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Estadísticas rápidas al inicio */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Pacientes</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalPacientes}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pacientes Activos</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{pacientesActivos}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Consultas</p>
              <p className="text-3xl font-bold text-cyan-600 mt-2">{totalConsultas}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Consultas Recientes</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{consultasRecientes}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Historial Médico</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Historial</span>
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por paciente, cédula o padecimiento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedFilter('todos')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'todos' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedFilter('activo')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'activo' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Activos
              </button>
              <button
                onClick={() => setSelectedFilter('reciente')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'reciente' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Recientes
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Paciente</th>
                <th className="px-6 py-4 text-left font-semibold">Padecimientos</th>
                <th className="px-6 py-4 text-left font-semibold">Receta Actual</th>
                <th className="px-6 py-4 text-left font-semibold">Última Visita</th>
                <th className="px-6 py-4 text-left font-semibold">Consultas</th>
                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                <th className="px-6 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentHistoriales.map((historial) => (
                <tr key={historial.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{historial.paciente}</div>
                      <div className="text-sm text-gray-500">
                        Cédula: {historial.cedula}
                      </div>
                      <div className="text-sm text-gray-500">
                        {historial.edad} años • {historial.telefono}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {historial.padecimientos.map((padecimiento, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPadecimientoColor(padecimiento.tipo)}`}>
                            {padecimiento.tipo}
                          </span>
                          <span className="text-sm text-gray-600">
                            {padecimiento.valor} ({padecimiento.ojo})
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {historial.recetas.length > 0 && (
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 mb-1">
                          Fecha: {historial.recetas[0].fecha}
                        </div>
                        <div className="space-y-1">
                          <div>
                            <span className="font-medium text-gray-700">OD:</span>
                            <span className="ml-1 text-gray-600">
                              {historial.recetas[0].od.esfera} {historial.recetas[0].od.cilindro} {historial.recetas[0].od.eje}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">OI:</span>
                            <span className="ml-1 text-gray-600">
                              {historial.recetas[0].oi.esfera} {historial.recetas[0].oi.cilindro} {historial.recetas[0].oi.eje}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{historial.ultimaVisita}</div>
                      <div className="text-gray-500">
                        {Math.floor((new Date() - new Date(historial.ultimaVisita)) / (1000 * 60 * 60 * 24))} días
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">{historial.totalConsultas}</span>
                      <span className="text-sm text-gray-500">consultas</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(historial.estado)}`}>
                      {historial.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="Ver historial completo"
                        onClick={() => setSelectedPatient(historial)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" 
                        title="Nueva receta"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredHistoriales.length === 0 && (
          <div className="p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron historiales
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer historial médico'}
            </p>
          </div>
        )}

        {/* Controles de paginación */}
        <div className="mt-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Mostrar</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="border border-cyan-500 rounded py-1 px-2"
            >
              {[5, 10, 15, 20].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-gray-700">por página</span>
          </div>
          <div className="flex items-center gap-2 m-[25px]">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<<"}
            </button>
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<"}
            </button>
            <span className="text-gray-700 font-medium">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">"}
            </button>
            <button
              type='button'
              onClick={goToLastPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">>"}
            </button>
          </div>
        </div>
      </div>

      {/* Resumen por padecimientos */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <h3 className="text-xl font-bold">Resumen por Padecimientos</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Miopía', 'Hipermetropía', 'Astigmatismo', 'Presbicia'].map((padecimiento) => {
              const count = historiales.filter(h => 
                h.padecimientos.some(p => p.tipo === padecimiento)
              ).length;
              
              return (
                <div key={padecimiento} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-900">{padecimiento}</h5>
                      <p className="text-2xl font-bold text-cyan-600 mt-1">{count}</p>
                      <p className="text-sm text-gray-500">pacientes</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getPadecimientoColor(padecimiento)}`}>
                      <Eye className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const RecetasContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todas');
  const [setShowAddModal] = useState(false);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Datos de ejemplo para recetas
  const recetas = [
    {
      id: 1,
      paciente: 'Juan Pérez',
      fecha: '10/05/2025',
      motivo: 'Revisión anual',
      optometrista: 'Dr. Javier Méndez',
      receta: {
        od: { esfera: -2.25, cilindro: -0.75, eje: 180 },
        oi: { esfera: -2.00, cilindro: -1.00, eje: 170 }
      },
      estado: 'Activa',
      observaciones: 'Paciente con miopía progresiva. Recomendar uso constante.',
      fechaVencimiento: '10/05/2026'
    },
    {
      id: 2,
      paciente: 'María González',
      fecha: '08/05/2025',
      motivo: 'Primera consulta',
      optometrista: 'Dr. Javier Méndez',
      receta: {
        od: { esfera: +1.50, cilindro: -0.50, eje: 90 },
        oi: { esfera: +1.75, cilindro: -0.25, eje: 85 }
      },
      estado: 'Activa',
      observaciones: 'Hipermetropía leve con astigmatismo.',
      fechaVencimiento: '08/05/2026'
    },
    {
      id: 3,
      paciente: 'Carlos Martínez',
      fecha: '05/05/2025',
      motivo: 'Control de seguimiento',
      optometrista: 'Dra. Ana Rodríguez',
      receta: {
        od: { esfera: -3.00, cilindro: -1.25, eje: 175 },
        oi: { esfera: -2.75, cilindro: -1.50, eje: 170 }
      },
      estado: 'Vencida',
      observaciones: 'Miopía alta. Uso obligatorio de lentes.',
      fechaVencimiento: '05/05/2024'
    },
    {
      id: 4,
      paciente: 'Ana Rodríguez',
      fecha: '02/05/2025',
      motivo: 'Examen preventivo',
      optometrista: 'Dr. Luis Herrera',
      receta: {
        od: { esfera: +0.50, cilindro: 0, eje: 0 },
        oi: { esfera: +0.75, cilindro: 0, eje: 0 }
      },
      estado: 'Activa',
      observaciones: 'Hipermetropía leve. Uso para lectura.',
      fechaVencimiento: '02/05/2026'
    },
    {
      id: 5,
      paciente: 'Pedro Sánchez',
      fecha: '01/05/2025',
      motivo: 'Cambio de lentes',
      optometrista: 'Dr. Javier Méndez',
      receta: {
        od: { esfera: -1.75, cilindro: -0.50, eje: 165 },
        oi: { esfera: -1.50, cilindro: -0.75, eje: 160 }
      },
      estado: 'Pendiente',
      observaciones: 'Pendiente de elaboración de lentes.',
      fechaVencimiento: '01/05/2026'
    },
    {
      id: 6,
      paciente: 'Laura Fernández',
      fecha: '28/04/2025',
      motivo: 'Control de rutina',
      optometrista: 'Dra. Ana Rodríguez',
      receta: {
        od: { esfera: -1.25, cilindro: -0.25, eje: 15 },
        oi: { esfera: -1.00, cilindro: -0.50, eje: 10 }
      },
      estado: 'Activa',
      observaciones: 'Miopía leve estable.',
      fechaVencimiento: '28/04/2026'
    },
    {
      id: 7,
      paciente: 'Roberto Castro',
      fecha: '25/04/2025',
      motivo: 'Primera visita',
      optometrista: 'Dr. Luis Herrera',
      receta: {
        od: { esfera: +2.00, cilindro: -1.00, eje: 90 },
        oi: { esfera: +1.75, cilindro: -0.75, eje: 95 }
      },
      estado: 'Pendiente',
      observaciones: 'Hipermetropía con astigmatismo.',
      fechaVencimiento: '25/04/2026'
    },
    {
      id: 8,
      paciente: 'Isabel Morales',
      fecha: '22/04/2025',
      motivo: 'Revisión anual',
      optometrista: 'Dr. Javier Méndez',
      receta: {
        od: { esfera: -0.75, cilindro: 0, eje: 0 },
        oi: { esfera: -1.00, cilindro: 0, eje: 0 }
      },
      estado: 'Vencida',
      observaciones: 'Miopía leve.',
      fechaVencimiento: '22/04/2024'
    }
  ];

  const filteredRecetas = recetas.filter(receta => {
    const matchesSearch = receta.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receta.optometrista.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receta.motivo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'todas' || 
                         (selectedFilter === 'activa' && receta.estado === 'Activa') ||
                         (selectedFilter === 'vencida' && receta.estado === 'Vencida') ||
                         (selectedFilter === 'pendiente' && receta.estado === 'Pendiente');
    return matchesSearch && matchesFilter;
  });

  // Cálculos para la paginación
  const totalPages = Math.ceil(filteredRecetas.length / pageSize);
  const currentRecetas = filteredRecetas.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  // Funciones para cambiar de página
  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () => setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  const goToNextPage = () => setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'Activa': return 'bg-green-100 text-green-800';
      case 'Vencida': return 'bg-red-100 text-red-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatReceta = (ojo) => {
    const esfera = ojo.esfera > 0 ? `+${ojo.esfera}` : ojo.esfera.toString();
    const cilindro = ojo.cilindro !== 0 ? (ojo.cilindro > 0 ? `+${ojo.cilindro}` : ojo.cilindro.toString()) : '0.00';
    const eje = ojo.eje !== 0 ? `${ojo.eje}°` : '-';
    return { esfera, cilindro, eje };
  };

  const totalRecetas = recetas.length;
  const recetasActivas = recetas.filter(r => r.estado === 'Activa').length;
  const recetasVencidas = recetas.filter(r => r.estado === 'Vencida').length;
  const recetasPendientes = recetas.filter(r => r.estado === 'Pendiente').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Estadísticas rápidas arriba */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Recetas</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalRecetas}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <Receipt className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Recetas Activas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{recetasActivas}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Recetas Vencidas</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{recetasVencidas}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{recetasPendientes}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla principal con paginación */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestión de Recetas</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Receta</span>
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por paciente, optometrista o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedFilter('todas')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'todas' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setSelectedFilter('activa')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'activa' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Activas
              </button>
              <button
                onClick={() => setSelectedFilter('vencida')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'vencida' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Vencidas
              </button>
              <button
                onClick={() => setSelectedFilter('pendiente')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'pendiente' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Pendientes
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                <th className="px-6 py-4 text-left font-semibold">Observaciones</th>
                <th className="px-6 py-4 text-left font-semibold">Optometrista</th>
                <th className="px-6 py-4 text-left font-semibold">Receta</th>
                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                <th className="px-6 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentRecetas.map((receta) => {
                const odFormatted = formatReceta(receta.receta.od);
                const oiFormatted = formatReceta(receta.receta.oi);
                
                return (
                  <tr key={receta.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{receta.paciente}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="space-y-1">
                        <p className="text-sm">Paciente: {receta.paciente}</p>
                        <p className="text-sm">Fecha: {receta.fecha}</p>
                        <p className="text-sm">Motivo: {receta.motivo}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{receta.optometrista}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">OD:</span> {odFormatted.esfera} {odFormatted.cilindro} {odFormatted.eje}
                        </div>
                        <div>
                          <span className="font-medium">OI:</span> {oiFormatted.esfera} {oiFormatted.cilindro} {oiFormatted.eje}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(receta.estado)}`}>
                        {receta.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredRecetas.length === 0 && (
          <div className="p-8 text-center">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron recetas
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primera receta'}
            </p>
          </div>
        )}

        {/* Controles de paginación */}
        <div className="mt-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Mostrar</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="border border-cyan-500 rounded py-1 px-2"
            >
              {[5, 10, 15, 20].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-gray-700">por página</span>
          </div>
          <div className="flex items-center gap-2 m-[25px]">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<<"}
            </button>
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<"}
            </button>
            <span className="text-gray-700 font-medium">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">"}
            </button>
            <button
              type='button'
              onClick={goToLastPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">>"}
            </button>
          </div>
        </div>
      </div>

      {/* Vista de cards por estado */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <h3 className="text-xl font-bold">Recetas por Estado</h3>
        </div>
        <div className="p-6">
          {['Activa', 'Pendiente', 'Vencida'].map((estado) => {
            const recetasEstado = recetas.filter(r => r.estado === estado);
            if (recetasEstado.length === 0) return null;
            
            return (
              <div key={estado} className="mb-6 last:mb-0">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(estado)}`}>
                    {estado}
                  </span>
                  <span className="text-sm text-gray-500">({recetasEstado.length} recetas)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recetasEstado.map((receta) => {
                    const odFormatted = formatReceta(receta.receta.od);
                    const oiFormatted = formatReceta(receta.receta.oi);
                    
                    return (
                      <div key={`card-${receta.id}`} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-gray-900">{receta.paciente}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(receta.estado)}`}>
                              {receta.estado}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p><span className="font-medium">Fecha:</span> {receta.fecha}</p>
                            <p><span className="font-medium">Optometrista:</span> {receta.optometrista}</p>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="bg-white p-2 rounded border">
                              <p><span className="font-medium">OD:</span> {odFormatted.esfera} {odFormatted.cilindro} {odFormatted.eje}</p>
                              <p><span className="font-medium">OI:</span> {oiFormatted.esfera} {oiFormatted.cilindro} {oiFormatted.eje}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SucursalesContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todas');
  const [setShowAddModal] = useState(false);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Datos de ejemplo para sucursales
  const sucursales = [
    {
      id: 1,
      nombre: 'Sucursal Principal',
      direccion: 'Colonia Médica, Avenida Dr. Max Bloch #23, San Salvador.',
      telefono: '3442-6325',
      correo: 'OpticaLaInteligente@gmail.com',
      estado: 'Activa',
      empleados: 12,
      ventasMes: 45000,
      clientesRegistrados: 324,
      fechaApertura: '2020-01-15',
      gerente: 'María González',
      servicios: ['Exámenes', 'Lentes', 'Contacto', 'Cirugía']
    },
    {
      id: 2,
      nombre: 'Lentes de contacto diarios',
      direccion: '1ra Avenida Norte y 8va Calle Poniente, #22, Quezaltepeque, La Libertad.',
      telefono: '5325-4242',
      correo: 'OpticaLaInteligente@gmail.com',
      estado: 'Activa',
      empleados: 8,
      ventasMes: 32000,
      clientesRegistrados: 187,
      fechaApertura: '2021-05-10',
      gerente: 'Carlos Martínez',
      servicios: ['Exámenes', 'Lentes', 'Contacto']
    },
    {
      id: 3,
      nombre: 'Sucursal Centro',
      direccion: 'Boulevard de los Héroes, Plaza Centro, Local 45, San Salvador.',
      telefono: '2234-5678',
      correo: 'centro@opticalainteligente.com',
      estado: 'Activa',
      empleados: 10,
      ventasMes: 38000,
      clientesRegistrados: 256,
      fechaApertura: '2021-03-20',
      gerente: 'Ana Rodríguez',
      servicios: ['Exámenes', 'Lentes', 'Accesorios']
    },
    {
      id: 4,
      nombre: 'Sucursal Santa Tecla',
      direccion: 'Calle Las Flores #15, Santa Tecla, La Libertad.',
      telefono: '2289-9876',
      correo: 'santatecla@opticalainteligente.com',
      estado: 'Inactiva',
      empleados: 6,
      ventasMes: 0,
      clientesRegistrados: 98,
      fechaApertura: '2022-08-15',
      gerente: 'Roberto Silva',
      servicios: ['Exámenes', 'Lentes']
    },
    {
      id: 5,
      nombre: 'Sucursal Soyapango',
      direccion: 'Avenida Central #789, Soyapango, San Salvador.',
      telefono: '2278-4567',
      correo: 'soyapango@opticalainteligente.com',
      estado: 'Activa',
      empleados: 7,
      ventasMes: 28000,
      clientesRegistrados: 143,
      fechaApertura: '2022-02-28',
      gerente: 'Laura Fernández',
      servicios: ['Exámenes', 'Lentes', 'Contacto', 'Accesorios']
    },
    {
      id: 6,
      nombre: 'Sucursal Apopa',
      direccion: 'Calle Principal #456, Apopa, San Salvador.',
      telefono: '2245-7890',
      correo: 'apopa@opticalainteligente.com',
      estado: 'Activa',
      empleados: 5,
      ventasMes: 22000,
      clientesRegistrados: 89,
      fechaApertura: '2023-01-10',
      gerente: 'Pedro Ramírez',
      servicios: ['Exámenes', 'Lentes']
    }
  ];

  const filteredSucursales = sucursales.filter(sucursal => {
    const matchesSearch = sucursal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sucursal.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sucursal.gerente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sucursal.telefono.includes(searchTerm) ||
                         sucursal.correo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'todas' || 
                         (selectedFilter === 'activa' && sucursal.estado === 'Activa') ||
                         (selectedFilter === 'inactiva' && sucursal.estado === 'Inactiva') ||
                         (selectedFilter === 'reciente' && new Date(sucursal.fechaApertura) > new Date('2022-01-01'));
    return matchesSearch && matchesFilter;
  });

  // Calculamos la cantidad total de páginas
  const totalPages = Math.ceil(filteredSucursales.length / pageSize);

  // Obtenemos las sucursales de la página actual
  const currentSucursales = filteredSucursales.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  // Funciones para cambiar de página
  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () => setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  const goToNextPage = () => setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  const getEstadoColor = (estado) => {
    return estado === 'Activa' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getServicioColor = (servicio) => {
    switch(servicio) {
      case 'Exámenes': return 'bg-blue-100 text-blue-800';
      case 'Lentes': return 'bg-purple-100 text-purple-800';
      case 'Contacto': return 'bg-green-100 text-green-800';
      case 'Cirugía': return 'bg-red-100 text-red-800';
      case 'Accesorios': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalSucursales = sucursales.length;
  const sucursalesActivas = sucursales.filter(s => s.estado === 'Activa').length;
  const totalEmpleados = sucursales.reduce((sum, s) => sum + s.empleados, 0);
  const ventasTotales = sucursales.reduce((sum, s) => sum + s.ventasMes, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Estadísticas rápidas al inicio */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Sucursales</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalSucursales}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Sucursales Activas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{sucursalesActivas}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Empleados</p>
              <p className="text-3xl font-bold text-cyan-600 mt-2">{totalEmpleados}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Ventas del Mes</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{formatCurrency(ventasTotales)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestión de Sucursales</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Sucursal</span>
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, dirección, gerente, teléfono o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedFilter('todas')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'todas' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setSelectedFilter('activa')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'activa' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Activas
              </button>
              <button
                onClick={() => setSelectedFilter('inactiva')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'inactiva' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Inactivas
              </button>
              <button
                onClick={() => setSelectedFilter('reciente')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'reciente' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Recientes
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                <th className="px-6 py-4 text-left font-semibold">Dirección</th>
                <th className="px-6 py-4 text-left font-semibold">Teléfono</th>
                <th className="px-6 py-4 text-left font-semibold">Correo</th>
                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                <th className="px-6 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentSucursales.map((sucursal) => (
                <tr key={sucursal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{sucursal.nombre}</div>
                      <div className="text-sm text-gray-500">
                        Gerente: {sucursal.gerente}
                      </div>
                      <div className="text-sm text-gray-500">
                        {sucursal.empleados} empleados • {sucursal.clientesRegistrados} clientes
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {sucursal.direccion}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{sucursal.telefono}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{sucursal.correo}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(sucursal.estado)}`}>
                      {sucursal.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredSucursales.length === 0 && (
          <div className="p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron sucursales
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primera sucursal'}
            </p>
          </div>
        )}

        {/* Controles de paginación */}
        <div className="mt-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Mostrar</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="border border-cyan-500 rounded py-1 px-2"
            >
              {[5, 10, 15, 20].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-gray-700">por página</span>
          </div>
          <div className="flex items-center gap-2 m-[25px]">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<<"}
            </button>
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<"}
            </button>
            <span className="text-gray-700 font-medium">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">"}
            </button>
            <button
              type='button'
              onClick={goToLastPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">>"}
            </button>
          </div>
        </div>
      </div>

      {/* Resumen por servicios */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <h3 className="text-xl font-bold">Servicios por Sucursal</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentSucursales.map((sucursal) => (
              <div key={`services-${sucursal.id}`} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-gray-900">{sucursal.nombre}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(sucursal.estado)}`}>
                      {sucursal.estado}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">Ventas:</span> {formatCurrency(sucursal.ventasMes)}</p>
                    <p><span className="font-medium">Empleados:</span> {sucursal.empleados}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Servicios:</p>
                    <div className="flex flex-wrap gap-1">
                      {sucursal.servicios.map((servicio, index) => (
                        <span key={index} className={`px-2 py-1 rounded-full text-xs font-medium ${getServicioColor(servicio)}`}>
                          {servicio}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PromocionesContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todas');
  const [setShowAddModal] = useState(false);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Datos de ejemplo para promociones (actualizados con esquema de DB)
  const promociones = [
    {
      _id: "a862a44a42596bf1f90be631",
      nombre: "Promo a86234",
      descripcion: "Promoción especial",
      tipoDescuento: "porcentaje",
      valorDescuento: 22.08,
      idsAplicacion: [
        "92df8d52662fcc8f8ea122c2",
        "f680e78a4f847bb96bb1460"
      ],
      fechaInicio: "2021-07-24",
      fechaFin: "2021-09-28",
      codigoPromo: "C6124",
      activo: false,
      imagen: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop",
      usuariosUsaron: 45,
      ventasGeneradas: 12500.00,
      fechaCreacion: "2021-07-20"
    },
    {
      _id: "b972b55b53607cg2g01cf742",
      nombre: "Black Friday 2024",
      descripcion: "Descuentos masivos para Black Friday en toda la tienda",
      tipoDescuento: "porcentaje",
      valorDescuento: 60.00,
      idsAplicacion: [
        "92df8d52662fcc8f8ea122c2"
      ],
      fechaInicio: "2024-11-24",
      fechaFin: "2024-11-30",
      codigoPromo: "BLACKFRIDAY60",
      activo: true,
      imagen: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=400&fit=crop",
      usuariosUsaron: 1250,
      ventasGeneradas: 85000.00,
      fechaCreacion: "2024-11-15"
    },
    {
      _id: "c083c66c64718dh3h12dg853",
      nombre: "Promoción Verano",
      descripcion: "Ofertas especiales en lentes de sol para el verano",
      tipoDescuento: "fijo",
      valorDescuento: 25.00,
      idsAplicacion: [
        "92df8d52662fcc8f8ea122c2",
        "f680e78a4f847bb96bb1460"
      ],
      fechaInicio: "2024-06-01",
      fechaFin: "2024-08-31",
      codigoPromo: "SUMMER2024",
      activo: true,
      imagen: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&h=400&fit=crop",
      usuariosUsaron: 567,
      ventasGeneradas: 42300.00,
      fechaCreacion: "2024-05-25"
    },
    {
      _id: "d194d77d75829ei4i23eh964",
      nombre: "Estudiantes 2024",
      descripcion: "Descuento especial para estudiantes universitarios",
      tipoDescuento: "porcentaje",
      valorDescuento: 20.00,
      idsAplicacion: [
        "92df8d52662fcc8f8ea122c2"
      ],
      fechaInicio: "2024-01-15",
      fechaFin: "2024-12-15",
      codigoPromo: "STUDENT20",
      activo: true,
      imagen: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop",
      usuariosUsaron: 823,
      ventasGeneradas: 28750.00,
      fechaCreacion: "2024-01-10"
    },
    {
      _id: "e2a5e88e86939fj5j34fi075",
      nombre: "Fin de Año 2023",
      descripcion: "Últimas ofertas del año en toda la colección",
      tipoDescuento: "porcentaje",
      valorDescuento: 45.00,
      idsAplicacion: [
        "92df8d52662fcc8f8ea122c2",
        "f680e78a4f847bb96bb1460",
        "a571a33a31485aa7a79aa348"
      ],
      fechaInicio: "2023-12-20",
      fechaFin: "2023-12-31",
      codigoPromo: "YEAREND45",
      activo: false,
      imagen: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop",
      usuariosUsaron: 389,
      ventasGeneradas: 56900.00,
      fechaCreacion: "2023-12-15"
    },
    {
      _id: "f3b6f99f97a4agk6k45gj186",
      nombre: "Cyber Monday",
      descripcion: "Ofertas digitales exclusivas para Cyber Monday",
      tipoDescuento: "porcentaje",
      valorDescuento: 35.00,
      idsAplicacion: [
        "f680e78a4f847bb96bb1460"
      ],
      fechaInicio: "2024-12-02",
      fechaFin: "2024-12-02",
      codigoPromo: "CYBER35",
      activo: true,
      imagen: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
      usuariosUsaron: 234,
      ventasGeneradas: 18900.00,
      fechaCreacion: "2024-11-25"
    }
  ];

  // Mapeo de IDs de aplicación a nombres (simularía una consulta a la DB)
  const aplicacionesMap = {
    "92df8d52662fcc8f8ea122c2": { nombre: "Lentes", color: "bg-blue-100 text-blue-800" },
    "f680e78a4f847bb96bb1460": { nombre: "Accesorios", color: "bg-purple-100 text-purple-800" },
    "a571a33a31485aa7a79aa348": { nombre: "Personalizados", color: "bg-orange-100 text-orange-800" }
  };

  const filteredPromociones = promociones.filter(promocion => {
    const aplicacionesNombres = promocion.idsAplicacion.map(id => aplicacionesMap[id]?.nombre || 'Desconocido');
    const matchesSearch = promocion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promocion.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promocion.codigoPromo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aplicacionesNombres.some(app => app.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const today = new Date();
    const fechaInicio = new Date(promocion.fechaInicio);
    const fechaFin = new Date(promocion.fechaFin);
    
    const matchesFilter = selectedFilter === 'todas' || 
                         (selectedFilter === 'activa' && promocion.activo && fechaFin >= today) ||
                         (selectedFilter === 'inactiva' && !promocion.activo) ||
                         (selectedFilter === 'vencida' && fechaFin < today) ||
                         (selectedFilter === 'vigente' && fechaInicio <= today && fechaFin >= today);
    return matchesSearch && matchesFilter;
  });

  // Cálculos para la paginación
  const totalPages = Math.ceil(filteredPromociones.length / pageSize);
  const currentPromociones = filteredPromociones.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  // Funciones para cambiar de página
  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () => setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  const goToNextPage = () => setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  const getEstadoPromocion = (promocion) => {
    const today = new Date();
    const fechaInicio = new Date(promocion.fechaInicio);
    const fechaFin = new Date(promocion.fechaFin);
    
    if (!promocion.activo) return { estado: 'Inactiva', color: 'bg-gray-100 text-gray-800' };
    if (fechaFin < today) return { estado: 'Vencida', color: 'bg-red-100 text-red-800' };
    if (fechaInicio <= today && fechaFin >= today) return { estado: 'Vigente', color: 'bg-green-100 text-green-800' };
    if (fechaInicio > today) return { estado: 'Programada', color: 'bg-blue-100 text-blue-800' };
    return { estado: 'Activa', color: 'bg-cyan-100 text-cyan-800' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (fechaFin) => {
    const today = new Date();
    const endDate = new Date(fechaFin);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Estadísticas
  const totalPromociones = promociones.length;
  const promocionesActivas = promociones.filter(p => {
    const today = new Date();
    const fechaInicio = new Date(p.fechaInicio);
    const fechaFin = new Date(p.fechaFin);
    return p.activo && fechaInicio <= today && fechaFin >= today;
  }).length;
  const promocionesVencidas = promociones.filter(p => new Date(p.fechaFin) < new Date()).length;
  const totalVentas = promociones.reduce((sum, p) => sum + p.ventasGeneradas, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Promociones</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalPromociones}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <Tag className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Promociones Activas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{promocionesActivas}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Promociones Vencidas</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{promocionesVencidas}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Ventas Generadas</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{formatCurrency(totalVentas)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Percent className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestión de Promociones</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Promoción</span>
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, descripción, código o aplicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['todas', 'vigente', 'activa', 'vencida', 'inactiva'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                    selectedFilter === filter 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Promoción</th>
                <th className="px-6 py-4 text-left font-semibold">Descuento</th>
                <th className="px-6 py-4 text-left font-semibold">Aplicaciones</th>
                <th className="px-6 py-4 text-left font-semibold">Vigencia</th>
                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                <th className="px-6 py-4 text-left font-semibold">Rendimiento</th>
                <th className="px-6 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPromociones.map((promocion) => {
                const estadoInfo = getEstadoPromocion(promocion);
                const diasRestantes = getDaysRemaining(promocion.fechaFin);
                
                return (
                  <tr 
                    key={promocion._id} 
                    className="hover:bg-gray-50 transition-colors relative"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0.85)), url(${promocion.imagen})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                          <img 
                            src={promocion.imagen} 
                            alt={promocion.nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">{promocion.nombre}</div>
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {promocion.descripcion}
                          </div>
                          <div className="text-xs text-gray-500">
                            Código: <span className="font-mono bg-gray-100 px-1 rounded">{promocion.codigoPromo}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {promocion._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600">
                          {promocion.tipoDescuento === 'porcentaje' 
                            ? `${promocion.valorDescuento}%` 
                            : formatCurrency(promocion.valorDescuento)
                          }
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          {promocion.tipoDescuento}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {promocion.idsAplicacion.map((idAplicacion) => {
                          const aplicacion = aplicacionesMap[idAplicacion];
                          return aplicacion ? (
                            <span 
                              key={idAplicacion} 
                              className={`px-2 py-1 rounded-full text-xs font-medium ${aplicacion.color}`}
                            >
                              {aplicacion.nombre}
                            </span>
                          ) : (
                            <span 
                              key={idAplicacion} 
                              className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              Desconocido
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Inicio:</span>
                          <span className="font-medium">{formatDate(promocion.fechaInicio)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Fin:</span>
                          <span className="font-medium">{formatDate(promocion.fechaFin)}</span>
                        </div>
                        {diasRestantes > 0 && (
                          <div className="text-xs text-amber-600 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{diasRestantes} días restantes</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoInfo.color}`}>
                        {estadoInfo.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-2">
                          <Package className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">{promocion.usuariosUsaron} usos</span>
                        </div>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(promocion.ventasGeneradas)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Creada: {formatDate(promocion.fechaCreacion)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                          title="Editar promoción"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" 
                          title="Ver imagen completa"
                        >
                          <Image className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Eliminar promoción"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredPromociones.length === 0 && (
          <div className="p-8 text-center">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron promociones
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primera promoción'}
            </p>
          </div>
        )}

        {/* Controles de paginación */}
        <div className="mt-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Mostrar</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="border border-cyan-500 rounded py-1 px-2"
            >
              {[5, 10, 15, 20].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-gray-700">por página</span>
          </div>
          <div className="flex items-center gap-2 m-[25px]">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<<"}
            </button>
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {"<"}
            </button>
            <span className="text-gray-700 font-medium">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">"}
            </button>
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {">>"}
            </button>
          </div>
        </div>
      </div>

      {/* Resumen por aplicación */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <h3 className="text-xl font-bold">Resumen por Aplicación</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(aplicacionesMap).map(([id, aplicacion]) => {
              const count = promociones.filter(p => 
                p.idsAplicacion.includes(id)
              ).length;
              const ventasAplicacion = promociones
                .filter(p => p.idsAplicacion.includes(id))
                .reduce((sum, p) => sum + p.ventasGeneradas, 0);
              
              return (
                <div key={id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-900">{aplicacion.nombre}</h5>
                      <p className="text-2xl font-bold text-cyan-600 mt-1">{count}</p>
                      <p className="text-sm text-gray-500">promociones</p>
                      <p className="text-sm font-medium text-green-600 mt-1">
                        {formatCurrency(ventasAplicacion)}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${aplicacion.color}`}>
                      <Tag className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

    const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        return <DashboardContent />;
      case 'clientes':
        return <Clientes/>;
      case 'empleados':  
        return <Empleados />;
      case 'optometristas':
        return <Optometristas />;
      case 'lentes':
        return <LentesContent />;
      case 'accesorios':
        return <AccesoriosContent />;
      case 'personalizados':
        return <PersonalizadosContent />;
      case 'categorias':
        return<CategoriasContent />;
      case 'marcas':
        return <MarcasContent />;
      case 'citas': 
        return <CitasContent />;
      case 'historial': 
        return <HistorialMedicoContent />;
      case 'recetas': 
        return <RecetasContent />;
      case 'sucursales':
        return <SucursalesContent />;
      case 'promociones':
        return <PromocionesContent />;
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
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        {/* Header móvil */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-cyan-600 truncate">
            {activeSection === 'dashboard' 
              ? 'Panel de Administración' 
              : menuItems.find(item => item.id === activeSection)?.label
            }
          </h1>
          <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
            
          </div>
        </div>

        {/* Header escritorio */}
        <header className="hidden lg:block bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-cyan-600">
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
        <main className="p-4 lg:p-6">
          <div key={activeSection} className="animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>

      <style jsx>{`
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