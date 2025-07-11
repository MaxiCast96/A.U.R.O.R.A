import React, { useState } from 'react';
import {
  Users, UserCheck, Eye, FileText, Receipt, Search, Plus, Trash2, Edit, Clock
} from 'lucide-react';

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

export default HistorialMedicoContent;