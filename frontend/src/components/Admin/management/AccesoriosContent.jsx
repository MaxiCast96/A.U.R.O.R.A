import React, { useState } from 'react';
import { Search, Plus, Trash2, Eye, Edit, ShoppingBag, Tags, Package, DollarSign } from 'lucide-react';

const AccesoriosContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [setShowAddModal] = useState(false);

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

export default AccesoriosContent;