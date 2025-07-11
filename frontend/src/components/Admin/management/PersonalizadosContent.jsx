import React, { useState } from 'react';
import { Search, Plus, Trash2, Eye, Edit, Package, Clock, UserCheck } from 'lucide-react';

const PersonalizadosContent = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [setShowAddModal] = useState(false);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
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

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-cyan-500 text-white p-6">
            <div className="flex justify-between items-center">
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

  export default PersonalizadosContent;