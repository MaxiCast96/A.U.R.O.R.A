import React, { useState } from 'react';
import { Search, Plus, Trash2, Eye, Edit, Calendar, User, Clock, CheckCircle, XCircle, AlertTriangle, MapPin } from 'lucide-react';

const CitasContent = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Fecha actual en formato YYYY-MM-DD
    const [setShowAddModal] = useState(false);
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // Datos de ejemplo para citas
    const citas = [
      {
        id: 1,
        cliente: 'Juan Pérez',
        servicio: 'Examen de la vista',
        fecha: '2024-05-28',
        hora: '10:00',
        sucursal: 'Sucursal Principal',
        estado: 'Confirmada'
      },
      {
        id: 2,
        cliente: 'María García',
        servicio: 'Adaptación de lentes de contacto',
        fecha: '2024-05-28',
        hora: '11:30',
        sucursal: 'Sucursal Centro',
        estado: 'Pendiente'
      },
      {
        id: 3,
        cliente: 'Roberto Martínez',
        servicio: 'Consulta oftalmológica',
        fecha: '2024-05-29',
        hora: '14:00',
        sucursal: 'Sucursal Principal',
        estado: 'Realizada'
      },
      {
        id: 4,
        cliente: 'Ana López',
        servicio: 'Examen de la vista',
        fecha: '2024-05-29',
        hora: '09:00',
        sucursal: 'Sucursal Norte',
        estado: 'Cancelada'
      },
      {
        id: 5,
        cliente: 'Carlos Sánchez',
        servicio: 'Ajuste de armazón',
        fecha: '2024-05-28',
        hora: '15:00',
        sucursal: 'Sucursal Principal',
        estado: 'Confirmada'
      },
      {
        id: 6,
        cliente: 'Laura Gómez',
        servicio: 'Examen de la vista',
        fecha: '2024-05-30',
        hora: '10:30',
        sucursal: 'Sucursal Centro',
        estado: 'Pendiente'
      },
      {
        id: 7,
        cliente: 'Javier Fernández',
        servicio: 'Consulta de seguimiento',
        fecha: '2024-05-30',
        hora: '16:00',
        sucursal: 'Sucursal Norte',
        estado: 'Confirmada'
      }
    ];

    const filteredCitas = citas.filter(cita => {
        const matchesSearch = cita.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              cita.servicio.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = selectedDate ? cita.fecha === selectedDate : true;
        return matchesSearch && matchesDate;
    });

    const totalPages = Math.ceil(filteredCitas.length / pageSize);
    const currentCitas = filteredCitas.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

    const goToFirstPage = () => setCurrentPage(0);
    const goToPreviousPage = () => setCurrentPage(prev => Math.max(0, prev - 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    const goToLastPage = () => setCurrentPage(totalPages - 1);

    const getEstadoInfo = (estado) => {
      switch(estado) {
        case 'Confirmada': return { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> };
        case 'Pendiente': return { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> };
        case 'Realizada': return { color: 'bg-blue-100 text-blue-800', icon: <User className="w-4 h-4" /> };
        case 'Cancelada': return { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> };
        default: return { color: 'bg-gray-100 text-gray-800', icon: <AlertTriangle className="w-4 h-4" /> };
      }
    };

    const totalCitasHoy = citas.filter(c => c.fecha === new Date().toISOString().split('T')[0]).length;
    const citasPendientes = citas.filter(c => c.estado === 'Pendiente').length;
    const citasConfirmadas = citas.filter(c => c.estado === 'Confirmada').length;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Citas para Hoy</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{totalCitasHoy}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-cyan-600" />
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
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Confirmadas</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{citasConfirmadas}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
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
                <span>Agendar Cita</span>
              </button>
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 border-b">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente o servicio..."
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cyan-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Cliente</th>
                  <th className="px-6 py-4 text-left font-semibold">Servicio</th>
                  <th className="px-6 py-4 text-left font-semibold">Fecha y Hora</th>
                  <th className="px-6 py-4 text-left font-semibold">Sucursal</th>
                  <th className="px-6 py-4 text-left font-semibold">Estado</th>
                  <th className="px-6 py-4 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentCitas.map((cita) => {
                  const estadoInfo = getEstadoInfo(cita.estado);
                  return (
                    <tr key={cita.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{cita.cliente}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{cita.servicio}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{cita.fecha}</div>
                            <div className="text-sm text-gray-500">{cita.hora}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-800">{cita.sucursal}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1.5 ${estadoInfo.color}`}>
                          {estadoInfo.icon}
                          <span>{cita.estado}</span>
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredCitas.length === 0 && (
            <div className="p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron citas
              </h3>
              <p className="text-gray-500">
                {searchTerm || selectedDate ? 'Intenta con otros filtros o busca un nuevo cliente.' : 'Comienza agendando una nueva cita'}
              </p>
            </div>
          )}

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
              <button onClick={goToFirstPage} disabled={currentPage === 0} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50">{"<<"}</button>
              <button onClick={goToPreviousPage} disabled={currentPage === 0} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50">{"<"}</button>
              <span className="text-gray-700 font-medium">Página {currentPage + 1} de {totalPages}</span>
              <button onClick={goToNextPage} disabled={currentPage === totalPages - 1} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50">{">"}</button>
              <button onClick={goToLastPage} disabled={currentPage === totalPages - 1} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50">{">>"}</button>
            </div>
          </div>
        </div>
      </div>
    );
};

export default CitasContent;