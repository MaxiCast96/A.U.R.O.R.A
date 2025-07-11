import React, { useState } from 'react';
import { 
  Users, Building2, CheckCircle, DollarSign, Search, Plus, Trash2, Eye, Edit, MapPin
} from 'lucide-react';

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

export default SucursalesContent;