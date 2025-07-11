import React, { useState } from 'react';
import { Search, Plus, Trash2, Eye, Edit, Tags, Package, UserCheck, Glasses, ShoppingBag } from 'lucide-react';

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

  export default CategoriasContent;