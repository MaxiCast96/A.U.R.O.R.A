import React, { useState } from 'react';
import { Search, Plus, Trash2, Eye, Edit, Glasses, TrendingUp, Package, DollarSign } from 'lucide-react';

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

export default LentesContent;