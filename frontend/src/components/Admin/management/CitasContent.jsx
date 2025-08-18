import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Trash2, Eye, Edit, Calendar, User, Clock, CheckCircle, XCircle, AlertTriangle, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import FormModal from '../ui/FormModal';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';
import ConfirmationModal from '../ui/ConfirmationModal';

const API_URL = 'https://a-u-r-o-r-a.onrender.com/api';

const initialFormState = {
  clienteId: '',
  optometristaId: '',
  sucursalId: '',
  fecha: '',
  hora: '',
  estado: 'Pendiente',
  motivoCita: '',
  tipoLente: '',
  graduacion: '',
  notasAdicionales: ''
};

const CitasContent = () => {
    const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [optometristas, setOptometristas] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [detailCita, setDetailCita] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, cita: null });

  // Nombre de optometrista con fallback amigable
  const getOptometristaNombre = (opt) => {
    if (!opt) return 'N/A';
    const emp = opt.empleadoId;
    if (emp && (emp.nombre || emp.apellido)) {
      return `${emp.nombre || ''} ${emp.apellido || ''}`.trim() || 'N/A';
    }
    // Si no hay empleado poblado, mostrar identificador corto legible
    const id = opt._id || opt.id || '';
    if (id) {
      const shortId = String(id).slice(-6).toUpperCase();
      return `Optometrista ${shortId}`;
    }
    return 'Optometrista';
  };

  // Resolver robusto: si en la cita viene solo el ID o no viene poblado, busca en la lista cargada
  const resolveOptometristaNombre = (optFromCita) => {
    if (!optFromCita) return 'N/A';
    // Caso 1: objeto con posible empleadoId
    if (typeof optFromCita === 'object') {
      const name = getOptometristaNombre(optFromCita);
      if (!/^Optometrista\s/i.test(name)) return name; // ya es nombre real
      // intentar mejorar con lista cargada
      const oid = optFromCita._id || optFromCita.id;
      if (oid) {
        const found = optometristas.find(o => o._id === oid);
        if (found) return getOptometristaNombre(found);
      }
      return name;
    }
    // Caso 2: string ID -> buscar en lista
    const idStr = String(optFromCita);
    const found = optometristas.find(o => o._id === idStr);
    if (found) return getOptometristaNombre(found);
    const shortId = idStr.slice(-6).toUpperCase();
    return `Optometrista ${shortId}`;
  };

  // Fetch datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [citasRes, clientesRes, optosRes, sucursalesRes] = await Promise.all([
          axios.get(`${API_URL}/citas`),
          axios.get(`${API_URL}/clientes`),
          axios.get(`${API_URL}/optometrista`),
          axios.get(`${API_URL}/sucursales`)
        ]);
        setCitas(Array.isArray(citasRes.data) ? citasRes.data : []);
        setClientes(clientesRes.data || []);
        setOptometristas(optosRes.data || []);
        setSucursales(sucursalesRes.data || []);
      } catch (err) {
        setError('Error al cargar datos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAddModal = () => {
    setFormData(initialFormState);
    setShowAddModal(true);
    setSelectedCita(null);
  };

  const handleOpenEditModal = (cita) => {
    setFormData({
      clienteId: cita.clienteId?._id || cita.clienteId || '',
      optometristaId: cita.optometristaId?._id || cita.optometristaId || '',
      sucursalId: cita.sucursalId?._id || cita.sucursalId || '',
      fecha: cita.fecha ? cita.fecha.slice(0, 10) : '',
      hora: cita.hora || '',
      estado: cita.estado || 'Pendiente',
      motivoCita: cita.motivoCita || '',
      tipoLente: cita.tipoLente || '',
      graduacion: cita.graduacion || '',
      notasAdicionales: cita.notasAdicionales || ''
    });
    setSelectedCita(cita);
    setShowEditModal(true);
    setShowDetailModal(false); // Cierra el modal de detalle si está abierto
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedCita(null);
    setFormData(initialFormState);
  };

  const handleShowDetail = (cita) => {
    setDetailCita(cita);
    setShowDetailModal(true);
  };

  // Opciones para selects
  const clienteOptions = clientes.map(c => ({
    value: c._id,
    label: `${c.nombre} ${c.apellido}`
  }));
  const optometristaOptions = optometristas.map(o => ({
    value: o._id,
    label: getOptometristaNombre(o)
  }));
  const sucursalOptions = sucursales.map(s => ({
    value: s._id,
    label: s.nombre
  }));
  const estadoOptions = [
    { value: 'agendada', label: 'Agendada' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'completada', label: 'Completada' }
  ];

  // Definición de campos para el FormModal
  const fields = [
    {
      name: 'clienteId',
      label: 'Cliente',
      type: 'select',
      options: clienteOptions,
      placeholder: 'Seleccione un cliente',
      required: true,
      colSpan: 2
    },
    {
      name: 'optometristaId',
      label: 'Optometrista',
      type: 'select',
      options: optometristaOptions,
      placeholder: 'Seleccione un optometrista',
      required: true,
      colSpan: 2
    },
    {
      name: 'sucursalId',
      label: 'Sucursal',
      type: 'select',
      options: sucursalOptions,
      placeholder: 'Seleccione una sucursal',
      required: true,
      colSpan: 2
    },
    {
      name: 'fecha',
      label: 'Fecha',
      type: 'date',
      required: true,
      colSpan: 1
    },
    {
      name: 'hora',
      label: 'Hora',
      type: 'text',
      placeholder: 'Ej. 10:30',
      required: true,
      colSpan: 1
    },
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      options: estadoOptions,
      required: true,
      colSpan: 2
    },
    {
      name: 'motivoCita',
      label: 'Motivo de la cita',
      type: 'text',
      placeholder: 'Ej. Examen Visual',
      required: true,
      colSpan: 4
    },
    {
      name: 'tipoLente',
      label: 'Tipo de lente',
      type: 'text',
      placeholder: 'Ej. Monofocal',
      colSpan: 2
    },
    {
      name: 'graduacion',
      label: 'Graduación',
      type: 'text',
      placeholder: 'Ej. -1.25',
      colSpan: 2
    },
    {
      name: 'notasAdicionales',
      label: 'Notas adicionales',
      type: 'textarea',
      placeholder: 'Observaciones...',
      colSpan: 4
    }
  ];

  // Validación simple
  const validate = () => {
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = 'Este campo es obligatorio';
      }
    });
    // Validar tipoLente y graduacion explícitamente
    if (!formData.tipoLente) newErrors.tipoLente = 'Este campo es obligatorio';
    if (!formData.graduacion) newErrors.graduacion = 'Este campo es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Refactorizar handleSubmit para usar validación y feedback visual
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Asegurar que la fecha se envía como Date
      const dataToSend = {
        ...formData,
        fecha: formData.fecha ? new Date(formData.fecha) : undefined
      };
      if (selectedCita) {
        await axios.put(`${API_URL}/citas/${selectedCita._id}`, dataToSend);
        showNotification('Cita editada correctamente', 'success');
      } else {
        await axios.post(`${API_URL}/citas`, dataToSend);
        showNotification('Cita creada correctamente', 'success');
      }
      // Refrescar citas
      const citasRes = await axios.get(`${API_URL}/citas`);
      setCitas(Array.isArray(citasRes.data) ? citasRes.data : []);
      handleCloseModal();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError('Error: ' + err.response.data.message);
        showNotification('Error: ' + err.response.data.message, 'error');
      } else {
        setError('Error al guardar la cita.');
        showNotification('Error al guardar la cita.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cita (desde tabla o modal de detalle)
  const handleDelete = (cita) => {
    setConfirmDelete({ open: true, cita });
  };

  const confirmDeleteCita = async () => {
    const cita = confirmDelete.cita;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/citas/${cita._id}`);
      setCitas(citas.filter(c => c._id !== cita._id));
      setShowDetailModal(false);
      setConfirmDelete({ open: false, cita: null });
      const clienteNombre = cita.clienteId && (cita.clienteId.nombre || cita.clienteId.apellido)
        ? `${cita.clienteId.nombre || ''} ${cita.clienteId.apellido || ''}`.trim()
        : 'cliente';
      showNotification(`Cita de ${clienteNombre} eliminada permanentemente.`, 'delete');
    } catch (err) {
      setError('Error al eliminar la cita.');
      showNotification('Error al eliminar la cita.', 'error');
    } finally {
      setLoading(false);
    }
  };

    const filteredCitas = citas.filter(cita => {
        const clienteStr = (cita.cliente || '').toLowerCase();
        const servicioStr = (cita.servicio || '').toLowerCase();
        const matchesSearch = clienteStr.includes(searchTerm.toLowerCase()) ||
                              servicioStr.includes(searchTerm.toLowerCase());
        const matchesDate = !selectedDate || (cita.fecha && (new Date(cita.fecha).toISOString().split('T')[0] === selectedDate));
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

    // Función para avanzar o retroceder días en el calendario
    const changeDay = (direction) => {
      let baseDate;
      if (!selectedDate) {
        baseDate = new Date();
      } else {
        baseDate = new Date(selectedDate);
      }
      baseDate.setDate(baseDate.getDate() + direction);
      setSelectedDate(baseDate.toISOString().split('T')[0]);
    };

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Personaliza notificaciones para visualizar y eliminar cita
  useEffect(() => {
    if (showDetailModal && detailCita) {
      showNotification('Visualizando cita de ' + (detailCita.clienteId ? `${detailCita.clienteId.nombre || ''} ${detailCita.clienteId.apellido || ''}`.trim() : 'N/A'), 'info');
    }
    // eslint-disable-next-line
  }, [showDetailModal, detailCita]);

    return (
      <div className="space-y-6 animate-fade-in">
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <Alert type={notification.type} message={notification.message} />
        </div>
      )}
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
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeDay(-1)}
                className="p-2 rounded-full hover:bg-cyan-100 transition-colors"
                title="Día anterior"
              >
                <ChevronLeft className="w-5 h-5 text-cyan-500" />
              </button>
              <Calendar className="w-5 h-5 text-gray-400 absolute left-10 top-3" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent min-w-[140px]"
                style={{ minWidth: '140px' }}
              />
              <button
                type="button"
                onClick={() => changeDay(1)}
                className="p-2 rounded-full hover:bg-cyan-100 transition-colors"
                title="Día siguiente"
              >
                <ChevronRight className="w-5 h-5 text-cyan-500" />
              </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cyan-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Cliente</th>
                  <th className="px-6 py-4 text-left font-semibold">Servicio</th>
                <th className="px-6 py-4 text-left font-semibold">Optometrista</th>
                  <th className="px-6 py-4 text-left font-semibold">Fecha y Hora</th>
                  <th className="px-6 py-4 text-left font-semibold">Sucursal</th>
                  <th className="px-6 py-4 text-left font-semibold">Estado</th>
                  <th className="px-6 py-4 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentCitas.map((cita) => {
                  const estadoInfo = getEstadoInfo(cita.estado);
                // Obtener nombres de los campos populados
                const clienteNombre = cita.clienteId ? `${cita.clienteId.nombre || ''} ${cita.clienteId.apellido || ''}`.trim() : '';
                const sucursalNombre = cita.sucursalId ? cita.sucursalId.nombre || '' : '';
                const optometristaNombre = resolveOptometristaNombre(cita.optometristaId);

                // Motivo de la cita como servicio
                const servicio = cita.motivoCita || '';
                  return (
                  <tr key={cita._id || cita.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{clienteNombre || 'N/A'}</span>
                        </div>
                      </td>
                    <td className="px-6 py-4 text-gray-600">{servicio || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{optometristaNombre}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <div>
                          <div className="font-medium text-gray-900">{cita.fecha ? (new Date(cita.fecha)).toLocaleDateString() : ''}</div>
                            <div className="text-sm text-gray-500">{cita.hora}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-800">{sucursalNombre || 'N/A'}</span>
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
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar" onClick={() => handleDelete(cita)}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles" onClick={() => handleShowDetail(cita)}>
                            <Eye className="w-4 h-4" />
                          </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar" onClick={() => handleOpenEditModal(cita)}>
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
    {/* MODAL DE ALTA/EDICIÓN */}
    <FormModal
      isOpen={showAddModal || showEditModal}
      onClose={handleCloseModal}
      onSubmit={handleSubmit}
      title={selectedCita ? 'Editar Cita' : 'Agendar Cita'}
      formData={formData}
      handleInputChange={handleInputChange}
      errors={errors}
      submitLabel={selectedCita ? 'Guardar cambios' : 'Agendar'}
      fields={fields}
      gridCols={4}
    />
    {/* MODAL DE DETALLE DE CITA */}
    <DetailModal
      isOpen={showDetailModal}
      onClose={() => setShowDetailModal(false)}
      title="Detalle de Cita"
      item={detailCita}
      data={[
        { label: 'Cliente', value: detailCita && detailCita.clienteId ? `${detailCita.clienteId.nombre || ''} ${detailCita.clienteId.apellido || ''}`.trim() : 'N/A' },
        { label: 'Optometrista', value: detailCita ? resolveOptometristaNombre(detailCita.optometristaId) : 'N/A' },
        { label: 'Sucursal', value: detailCita && detailCita.sucursalId ? detailCita.sucursalId.nombre : 'N/A' },
        { label: 'Fecha', value: detailCita && detailCita.fecha ? (new Date(detailCita.fecha)).toLocaleDateString() : 'N/A' },
        { label: 'Hora', value: detailCita && detailCita.hora ? detailCita.hora : 'N/A' },
        { label: 'Estado', value: detailCita && detailCita.estado ? detailCita.estado : 'N/A' },
        { label: 'Motivo de la cita', value: detailCita && detailCita.motivoCita ? detailCita.motivoCita : 'N/A' },
        { label: 'Tipo de lente', value: detailCita && detailCita.tipoLente ? detailCita.tipoLente : 'N/A' },
        { label: 'Graduación', value: detailCita && detailCita.graduacion ? detailCita.graduacion : 'N/A' },
        { label: 'Notas adicionales', value: detailCita && detailCita.notasAdicionales ? detailCita.notasAdicionales : 'N/A' },
      ]}
      actions={[
        {
          label: 'Editar',
          onClick: () => detailCita && handleOpenEditModal(detailCita),
          color: 'green',
          icon: <Edit className="w-4 h-4 inline-block align-middle" />
        },
        {
          label: 'Eliminar',
          onClick: () => detailCita && handleDelete(detailCita),
          color: 'red',
          icon: <Trash2 className="w-4 h-4 inline-block align-middle" />
        }
      ]}
    />
    {/* MODAL DE CONFIRMACIÓN DE ELIMINAR CITA */}
    <ConfirmationModal
      isOpen={confirmDelete.open}
      onClose={() => setConfirmDelete({ open: false, cita: null })}
      onConfirm={confirmDeleteCita}
      title="¿Estás seguro de eliminar la cita?"
      message="Esta acción eliminará la cita de forma permanente."
    />
    {/* ... otros modales si aplica ... */}
      </div>
    );
};

export default CitasContent;