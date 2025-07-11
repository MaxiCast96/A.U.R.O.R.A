import React, { useState } from 'react';
import { Search, Plus, Trash2, Eye, Edit, Bookmark, Package, UserCheck, Tags } from 'lucide-react';

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

export default MarcasContent;