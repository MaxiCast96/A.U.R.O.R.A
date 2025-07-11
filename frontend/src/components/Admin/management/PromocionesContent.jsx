import React, { useState } from 'react';
import { Search, Plus, Trash2, Eye, Edit, Tag, Calendar, Percent, CheckCircle, XCircle } from 'lucide-react';

const PromocionesContent = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('todas');
    const [setShowAddModal] = useState(false);

    // Estado para la paginación
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // Datos de ejemplo para promociones
    const promociones = [
      {
        id: 1,
        nombre: 'Descuento de Verano',
        descripcion: '20% de descuento en todos los lentes de sol',
        tipoDescuento: 'Porcentaje',
        valorDescuento: 20,
        fechaInicio: '2024-06-01',
        fechaFin: '2024-08-31',
        estado: 'Activa'
      },
      {
        id: 2,
        nombre: '2x1 en Lentes de Contacto',
        descripcion: 'Compra una caja y llévate la segunda gratis',
        tipoDescuento: '2x1',
        valorDescuento: null,
        fechaInicio: '2024-05-15',
        fechaFin: '2024-06-15',
        estado: 'Expirada'
      },
      {
        id: 3,
        nombre: 'Día del Padre',
        descripcion: '$50 de descuento en compras mayores a $300',
        tipoDescuento: 'Monto Fijo',
        valorDescuento: 50,
        fechaInicio: '2024-06-10',
        fechaFin: '2024-06-17',
        estado: 'Activa'
      },
      {
        id: 4,
        nombre: 'Vuelta a Clases',
        descripcion: '15% de descuento en lentes para niños',
        tipoDescuento: 'Porcentaje',
        valorDescuento: 15,
        fechaInicio: '2024-08-01',
        fechaFin: '2024-09-15',
        estado: 'Programada'
      },
      {
        id: 5,
        nombre: 'Promoción de Aniversario',
        descripcion: '30% en toda la tienda',
        tipoDescuento: 'Porcentaje',
        valorDescuento: 30,
        fechaInicio: '2024-07-01',
        fechaFin: '2024-07-31',
        estado: 'Programada'
      },
      {
        id: 6,
        nombre: 'Liquidación de Invierno',
        descripcion: 'Hasta 50% en productos seleccionados',
        tipoDescuento: 'Porcentaje',
        valorDescuento: 50,
        fechaInicio: '2024-01-01',
        fechaFin: '2024-02-28',
        estado: 'Expirada'
      },
      {
        id: 7,
        nombre: 'Buen Fin',
        descripcion: 'Descuentos exclusivos en toda la tienda',
        tipoDescuento: 'Monto Fijo',
        valorDescuento: 100,
        fechaInicio: '2024-11-15',
        fechaFin: '2024-11-18',
        estado: 'Programada'
      }
    ];

    const filteredPromociones = promociones.filter(promo => {
      const matchesSearch = promo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           promo.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = selectedFilter === 'todas' || promo.estado.toLowerCase() === selectedFilter;
      return matchesSearch && matchesFilter;
    });

    // Calculamos la cantidad total de páginas
    const totalPages = Math.ceil(filteredPromociones.length / pageSize);

    // Obtenemos las promociones de la página actual
    const currentPromociones = filteredPromociones.slice(
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
        case 'Expirada': return 'bg-red-100 text-red-800';
        case 'Programada': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getTipoIcono = (tipo) => {
      switch(tipo) {
        case 'Porcentaje': return <Percent className="w-5 h-5 text-cyan-600" />;
        case 'Monto Fijo': return <Tag className="w-5 h-5 text-purple-600" />;
        case '2x1': return <Tag className="w-5 h-5 text-orange-600" />;
        default: return null;
      }
    };

    const totalPromociones = promociones.length;
    const promocionesActivas = promociones.filter(p => p.estado === 'Activa').length;
    const promocionesProgramadas = promociones.filter(p => p.estado === 'Programada').length;

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Estadísticas rápidas arriba */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <p className="text-gray-500 text-sm font-medium">Promociones Programadas</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{promocionesProgramadas}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
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
                  placeholder="Buscar promoción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                {['todas', 'activa', 'expirada', 'programada'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                      selectedFilter === filter 
                        ? 'bg-cyan-500 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}s
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
                  <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                  <th className="px-6 py-4 text-left font-semibold">Descripción</th>
                  <th className="px-6 py-4 text-left font-semibold">Tipo</th>
                  <th className="px-6 py-4 text-left font-semibold">Valor</th>
                  <th className="px-6 py-4 text-left font-semibold">Vigencia</th>
                  <th className="px-6 py-4 text-left font-semibold">Estado</th>
                  <th className="px-6 py-4 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentPromociones.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{promo.nombre}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-sm truncate">{promo.descripcion}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getTipoIcono(promo.tipoDescuento)}
                        <span className="text-gray-800 font-medium">{promo.tipoDescuento}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-cyan-600">
                        {promo.tipoDescuento === 'Porcentaje' ? `${promo.valorDescuento}%` : 
                         promo.tipoDescuento === 'Monto Fijo' ? `$${promo.valorDescuento}` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-800">
                          <span className="font-semibold">Inicio:</span> {promo.fechaInicio}
                        </span>
                        <span className="text-sm text-gray-500">
                          <span className="font-semibold">Fin:</span> {promo.fechaFin}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(promo.estado)}`}>
                        {promo.estado}
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
  
  export default PromocionesContent;