import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
  Search, Plus, Trash2, Eye, Edit, Calendar, User, Clock, CheckCircle, XCircle, 
  AlertTriangle, MapPin, ChevronLeft, ChevronRight, Filter, X, ChevronDown, 
  SortAsc, SortDesc
} from 'lucide-react';
import CitasFormModal from '../management/employees/CitasFormModal';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';
import ConfirmationModal from '../ui/ConfirmationModal';

const API_URL = 'https://aurora-production-7e57.up.railway.app/api';

const initialFormState = {
  clienteId: '',
  optometristaId: '',
  sucursalId: '',
  fechaHora: '',
  tipoConsulta: '',
  duracionEstimada: 30,
  estado: 'Programada',
  motivoConsulta: '',
  observaciones: ''
};

// Estados iniciales para filtros
const INITIAL_FILTERS = {
  estado: 'todos',
  sucursal: 'todos',
  optometrista: 'todos',
  fechaDesde: '',
  fechaHasta: '',
  horaDesde: '',
  horaHasta: ''
};

const SORT_OPTIONS = [
  { value: 'fecha-desc', label: 'MÃƒÂ¡s Recientes Primero', icon: Calendar },
  { value: 'fecha-asc', label: 'MÃƒÂ¡s Antiguos Primero', icon: Calendar },
  { value: 'cliente-asc', label: 'Cliente A-Z', icon: User },
  { value: 'cliente-desc', label: 'Cliente Z-A', icon: User },
  { value: 'hora-asc', label: 'Hora: Temprano a Tarde', icon: Clock },
  { value: 'hora-desc', label: 'Hora: Tarde a Temprano', icon: Clock },
  { value: 'estado-asc', label: 'Estado A-Z', icon: CheckCircle },
  { value: 'estado-desc', label: 'Estado Z-A', icon: CheckCircle },
];

// --- COMPONENTE SKELETON LOADER MEMOIZADO ---
const SkeletonLoader = React.memo(() => (
  <div className="animate-pulse">
    {/* Skeleton para las estadÃƒÂ­sticas */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Skeleton para la tabla */}
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-cyan-500 p-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-cyan-400 rounded w-48"></div>
          <div className="h-10 bg-cyan-400 rounded w-32"></div>
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-b">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
          <div className="flex items-center gap-2">
            <div className="h-10 bg-gray-200 rounded-full w-10"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            <div className="h-10 bg-gray-200 rounded-full w-10"></div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-cyan-500">
            <tr>
              {Array.from({ length: 7 }, (_, index) => (
                <th key={index} className="px-6 py-4">
                  <div className="h-4 bg-cyan-400 rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 5 }, (_, rowIndex) => (
              <tr key={rowIndex}>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {Array.from({ length: 3 }, (_, btnIndex) => (
                      <div key={btnIndex} className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 pb-6">
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="w-10 h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
));

const CitasContent = () => {
  // --- ESTADOS PRINCIPALES ---
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [detailCita, setDetailCita] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, cita: null });

  // --- ESTADOS DE FILTROS Y ORDENAMIENTO ---
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('fecha');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // Nombre de optometrista con fallback amigable
  const getOptometristaNombre = useCallback((opt) => {
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
  }, []);

  // Resolver robusto: si en la cita viene solo el ID o no viene poblado, busca en la lista cargada
  const resolveOptometristaNombre = useCallback((optFromCita) => {
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
  }, [optometristas, getOptometristaNombre]);

  // --- FUNCIÃƒâ€œN PARA OBTENER DATOS ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [citasRes, clientesRes, optosRes, sucursalesRes] = await Promise.all([
        axios.get(`${API_URL}/citas`),
        axios.get(`${API_URL}/clientes`),
        axios.get(`${API_URL}/optometrista`),
        axios.get(`${API_URL}/sucursales`)
      ]);
      
      const formattedCitas = (citasRes.data || []).map(c => ({
        ...c,
        fechaFormatted: c.fecha ? new Date(c.fecha).toLocaleDateString() : '',
        fechaRaw: c.fecha ? new Date(c.fecha) : null,
      }));
      
      setCitas(formattedCitas);
      setClientes(clientesRes.data || []);
      setOptometristas(optosRes.data || []);
      setSucursales(sucursalesRes.data || []);
    } catch (err) {
      setError('Error al cargar datos.');
      showNotification('Error al cargar los datos desde el servidor.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // --- EFECTO PARA CARGA INICIAL ---
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- FUNCIONES UTILITARIAS ---
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // --- FUNCIÃƒâ€œN PARA MANEJAR ORDENAMIENTO ---
  const handleSortChange = useCallback((sortValue) => {
    const [field, order] = sortValue.split('-');
    setSortBy(field);
    setSortOrder(order);
    setShowSortDropdown(false);
  }, []);

  // --- FUNCIÃƒâ€œN PARA ORDENAR DATOS ---
  const sortData = useCallback((data) => {
    return [...data].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'cliente':
          const clienteA = a.clienteId ? `${a.clienteId.nombre || ''} ${a.clienteId.apellido || ''}`.trim() : '';
          const clienteB = b.clienteId ? `${b.clienteId.nombre || ''} ${b.clienteId.apellido || ''}`.trim() : '';
          valueA = clienteA.toLowerCase();
          valueB = clienteB.toLowerCase();
          break;
        case 'fecha':
          valueA = a.fechaRaw || new Date(0);
          valueB = b.fechaRaw || new Date(0);
          break;
        case 'hora':
          valueA = a.hora || '';
          valueB = b.hora || '';
          break;
        case 'estado':
          valueA = (a.estado || '').toLowerCase();
          valueB = (b.estado || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortBy, sortOrder]);

  // --- FUNCIÃƒâ€œN PARA APLICAR FILTROS AVANZADOS ---
  const applyAdvancedFilters = useCallback((cita) => {
    // Filtro por estado
    if (filters.estado !== 'todos' && cita.estado?.toLowerCase() !== filters.estado) {
      return false;
    }

    // Filtro por sucursal
    if (filters.sucursal !== 'todos') {
      const sucursalId = cita.sucursalId?._id || cita.sucursalId;
      if (sucursalId !== filters.sucursal) {
        return false;
      }
    }

    // Filtro por optometrista
    if (filters.optometrista !== 'todos') {
      const optometristaId = cita.optometristaId?._id || cita.optometristaId;
      if (optometristaId !== filters.optometrista) {
        return false;
      }
    }

    // Filtro por rango de fechas
    if (filters.fechaDesde) {
      const fechaDesde = new Date(filters.fechaDesde);
      if (cita.fechaRaw < fechaDesde) {
        return false;
      }
    }
    if (filters.fechaHasta) {
      const fechaHasta = new Date(filters.fechaHasta);
      fechaHasta.setHours(23, 59, 59);
      if (cita.fechaRaw > fechaHasta) {
        return false;
      }
    }

    // Filtro por rango de horas
    if (filters.horaDesde) {
      if (cita.hora && cita.hora < filters.horaDesde) {
        return false;
      }
    }
    if (filters.horaHasta) {
      if (cita.hora && cita.hora > filters.horaHasta) {
        return false;
      }
    }

    return true;
  }, [filters]);

  // --- LÃƒâ€œGICA DE FILTRADO, ORDENAMIENTO Y PAGINACIÃƒâ€œN ---
  const filteredAndSortedCitas = useMemo(() => {
    const filtered = citas.filter(cita => {
      // BÃƒÂºsqueda por texto
      const search = searchTerm.toLowerCase();
      const clienteStr = cita.clienteId ? `${cita.clienteId.nombre || ''} ${cita.clienteId.apellido || ''}`.toLowerCase() : '';
      const servicioStr = (cita.motivoCita || '').toLowerCase();
      const matchesSearch = !searchTerm || 
        clienteStr.includes(search) ||
        servicioStr.includes(search);
      
      // Filtro por fecha especÃƒÂ­fica (del selector de fecha)
      let matchesDate = true;
      if (selectedDate && cita.fecha) {
        const citaDate = new Date(cita.fecha);
        const year = citaDate.getFullYear();
        const month = String(citaDate.getMonth() + 1).padStart(2, '0');
        const day = String(citaDate.getDate()).padStart(2, '0');
        const citaDateString = `${year}-${month}-${day}`;
        matchesDate = citaDateString === selectedDate;
      } else if (selectedDate) {
        matchesDate = false;
      }
      
      // Filtros avanzados
      const matchesAdvancedFilters = applyAdvancedFilters(cita);
      
      return matchesSearch && matchesDate && matchesAdvancedFilters;
    });
    
    return sortData(filtered);
  }, [citas, searchTerm, selectedDate, applyAdvancedFilters, sortData]);

  // PaginaciÃƒÂ³n
  const totalPages = Math.ceil(filteredAndSortedCitas.length / pageSize);
  const currentCitas = filteredAndSortedCitas.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  // --- FUNCIONES PARA MANEJAR FILTROS ---
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setSearchTerm('');
    setSelectedDate('');
  }, []);

  const hasActiveFilters = useCallback(() => {
    return searchTerm || 
           selectedDate ||
           filters.estado !== 'todos' || 
           filters.sucursal !== 'todos' || 
           filters.optometrista !== 'todos' || 
           filters.fechaDesde || 
           filters.fechaHasta ||
           filters.horaDesde ||
           filters.horaHasta;
  }, [searchTerm, selectedDate, filters]);

  // --- OBTENER LISTAS ÃƒÅ¡NICAS PARA FILTROS ---
  const uniqueSucursales = useMemo(() => {
    return sucursales.filter((sucursal, index, arr) => 
      arr.findIndex(s => s._id === sucursal._id) === index
    );
  }, [sucursales]);

  const uniqueOptometristas = useMemo(() => {
    return optometristas.filter((opt, index, arr) => 
      arr.findIndex(o => o._id === opt._id) === index
    );
  }, [optometristas]);

  // --- MANEJADORES DE FORMULARIO ACTUALIZADOS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'fechaHora') {
      // Convertir datetime-local a los campos internos separados
      if (value) {
        const dateTime = new Date(value);
        const fecha = dateTime.toISOString().split('T')[0];
        const hora = dateTime.toTimeString().slice(0, 5);
        
        setFormData(prev => ({
          ...prev,
          fechaHora: value,
          fecha,
          hora
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          fechaHora: '',
          fecha: '',
          hora: ''
        }));
      }
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        // Mapear campos del modal a campos internos
        ...(name === 'tipoConsulta' && { motivoCita: value }),
        ...(name === 'motivoConsulta' && { motivoCita: value }),
        ...(name === 'observaciones' && { notasAdicionales: value })
      }));
    }
  };

  const handleOpenAddModal = () => {
    setFormData(initialFormState);
    setShowAddModal(true);
    setSelectedCita(null);
    setErrors({});
  };

  const handleOpenEditModal = (cita) => {
    // Convertir fecha y hora separadas a datetime-local
    const fechaHora = cita.fecha && cita.hora 
      ? `${cita.fecha.slice(0, 10)}T${cita.hora}` 
      : '';

    setFormData({
      clienteId: cita.clienteId?._id || cita.clienteId || '',
      optometristaId: cita.optometristaId?._id || cita.optometristaId || '',
      sucursalId: cita.sucursalId?._id || cita.sucursalId || '',
      fechaHora: fechaHora,
      tipoConsulta: cita.motivoCita || 'Examen Rutinario',
      duracionEstimada: 30,
      estado: cita.estado || 'Programada',
      motivoConsulta: cita.motivoCita || '',
      observaciones: cita.notasAdicionales || '',
      // Campos internos para compatibilidad
      fecha: cita.fecha ? cita.fecha.slice(0, 10) : '',
      hora: cita.hora || '',
      motivoCita: cita.motivoCita || '',
      notasAdicionales: cita.notasAdicionales || ''
    });
    
    setSelectedCita(cita);
    setShowEditModal(true);
    setShowDetailModal(false);
    setErrors({});
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedCita(null);
    setFormData(initialFormState);
    setErrors({});
  };

  const handleShowDetail = (cita) => {
    setDetailCita(cita);
    setShowDetailModal(true);
  };

  // ValidaciÃƒÂ³n simple
  const validate = () => {
    const newErrors = {};
    
    if (!formData.clienteId) newErrors.clienteId = 'El cliente es obligatorio';
    if (!formData.optometristaId) newErrors.optometristaId = 'El optometrista es obligatorio';
    if (!formData.sucursalId) newErrors.sucursalId = 'La sucursal es obligatoria';
    if (!formData.fechaHora) newErrors.fechaHora = 'La fecha y hora son obligatorias';
    if (!formData.tipoConsulta) newErrors.tipoConsulta = 'El tipo de consulta es obligatorio';
    if (!formData.duracionEstimada || formData.duracionEstimada < 15) newErrors.duracionEstimada = 'La duraciÃƒÂ³n debe ser mÃƒÂ­nimo 15 minutos';
    if (!formData.estado) newErrors.estado = 'El estado es obligatorio';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      // Preparar datos para enviar al backend
      const dataToSend = {
        clienteId: formData.clienteId,
        optometristaId: formData.optometristaId,
        sucursalId: formData.sucursalId,
        fecha: formData.fecha ? new Date(formData.fecha) : undefined,
        hora: formData.hora,
        estado: formData.estado,
        motivoCita: formData.motivoConsulta || formData.tipoConsulta,
        tipoLente: '', // Campo requerido por el backend
        graduacion: '', // Campo requerido por el backend
        notasAdicionales: formData.observaciones || ''
      };
      
      if (selectedCita) {
        await axios.put(`${API_URL}/citas/${selectedCita._id}`, dataToSend);
        showNotification('Cita editada correctamente', 'success');
      } else {
        await axios.post(`${API_URL}/citas`, dataToSend);
        showNotification('Cita creada correctamente', 'success');
      }
      
      await fetchData();
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

  const handleDelete = (cita) => {
    setConfirmDelete({ open: true, cita });
  };

  const confirmDeleteCita = async () => {
    const cita = confirmDelete.cita;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/citas/${cita._id}`);
      const clienteNombre = cita.clienteId ? `${cita.clienteId.nombre || '} ${cita.clienteId.apellido || '}`.trim() : `${cita.clienteNombre || '} ${cita.clienteApellidos || '}`.trim();
showNotification(`Cita de ${clienteNombre} eliminada permanentemente.`, 'delete');
      await fetchData();
      setShowDetailModal(false);
      setConfirmDelete({ open: false, cita: null });
    } catch (err) {
      setError('Error al eliminar la cita.');
      showNotification('Error al eliminar la cita.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Funciones de navegaciÃƒÂ³n
  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(0, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  const getEstadoInfo = (estado) => {
    switch(estado) {
      case 'Confirmada': return { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> };
      case 'Pendiente': return { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> };
      case 'Programada': return { color: 'bg-blue-100 text-blue-800', icon: <Calendar className="w-4 h-4" /> };
      case 'Realizada': return { color: 'bg-blue-100 text-blue-800', icon: <User className="w-4 h-4" /> };
      case 'Completada': return { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> };
      case 'Cancelada': return { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> };
      default: return { color: 'bg-gray-100 text-gray-800', icon: <AlertTriangle className="w-4 h-4" /> };
    }
  };

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

  // Personaliza notificaciones para visualizar y eliminar cita
  useEffect(() => {
    if (showDetailModal && detailCita) {
      showNotification('Visualizando cita de ' + (detailCita.clienteId ? `${detailCita.clienteId.nombre || ''} ${detailCita.clienteId.apellido || ''}`.trim() : 'N/A'), 'info');
    }
  }, [showDetailModal, detailCita, showNotification]);

  // EstadÃƒÂ­sticas
  const totalCitasHoy = citas.filter(c => {
    const today = new Date().toISOString().split('T')[0];
    const citaDate = c.fecha ? c.fecha.slice(0, 10) : '';
    return citaDate === today;
  }).length;
  const citasPendientes = citas.filter(c => c.estado === 'Pendiente' || c.estado === 'Programada').length;
  const citasConfirmadas = citas.filter(c => c.estado === 'Confirmada' || c.estado === 'Completada').length;

  // --- RENDERIZADO DEL COMPONENTE ---
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {notification && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
            <Alert type={notification.type} message={notification.message} />
          </div>
        )}
        <SkeletonLoader />
      </div>
    );
  }

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
              <p className="text-3xl font-bold text-cyan-600 mt-2">{totalCitasHoy}</p>
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
              <p className="text-3xl font-bold text-cyan-600 mt-2">{citasPendientes}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Confirmadas</p>
              <p className="text-3xl font-bold text-cyan-600 mt-2">{citasConfirmadas}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestión de Citas</h2>
            <button
              onClick={handleOpenAddModal}
              className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Cita</span>
            </button>
          </div>
        </div>
        
        {/* BARRA DE BÃƒÅ¡SQUEDA Y CONTROLES */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Barra de bÃƒÂºsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente o servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                aria-label="Buscar citas"
              />
            </div>

            {/* Controles de fecha, filtro y ordenamiento */}
            <div className="flex items-center space-x-3">
              {/* Selector de fecha con navegaciÃƒÂ³n */}
              <div className="relative flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeDay(-1)}
                  className="p-2 rounded-full hover:bg-cyan-100 transition-colors"
                  title="DÃƒÂ­a anterior"
                >
                  <ChevronLeft className="w-5 h-5 text-cyan-500" />
                </button>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent min-w-[140px]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => changeDay(1)}
                  className="p-2 rounded-full hover:bg-cyan-100 transition-colors"
                  title="DÃƒÂ­a siguiente"
                >
                  <ChevronRight className="w-5 h-5 text-cyan-500" />
                </button>
              </div>

              {/* Dropdown de ordenamiento */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown);
                    setShowFiltersPanel(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-expanded={showSortDropdown}
                  aria-haspopup="true"
                  aria-label="Opciones de ordenamiento"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  <span className="text-sm font-medium">Ordenar</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <div className="py-2">
                      {SORT_OPTIONS.map((option) => {
                        const IconComponent = option.icon;
                        const isActive = `${sortBy}-${sortOrder}` === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                              isActive ? 'bg-cyan-50 text-cyan-600 font-medium' : 'text-gray-700'
                            }`}
                            aria-pressed={isActive}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span>{option.label}</span>
                            {isActive && <CheckCircle className="w-4 h-4 ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* BotÃƒÂ³n de filtros */}
              <button
                onClick={() => {
                  setShowFiltersPanel(!showFiltersPanel);
                  setShowSortDropdown(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all duration-200 ${
                  hasActiveFilters() 
                    ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                aria-expanded={showFiltersPanel}
                aria-label="Filtros avanzados"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filtros</span>
                {hasActiveFilters() && (
                  <span className="bg-white text-cyan-600 text-xs px-2 py-0.5 rounded-full font-bold">
                    {[
                      searchTerm && 1,
                      selectedDate && 1,
                      filters.estado !== 'todos' && 1,
                      filters.sucursal !== 'todos' && 1,
                      filters.optometrista !== 'todos' && 1,
                      filters.fechaDesde && 1,
                      filters.fechaHasta && 1,
                      filters.horaDesde && 1,
                      filters.horaHasta && 1
                    ].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* InformaciÃƒÂ³n de resultados */}
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredAndSortedCitas.length} cita{filteredAndSortedCitas.length !== 1 ? 's' : ''} 
              {hasActiveFilters() && ` (filtrada${filteredAndSortedCitas.length !== 1 ? 's' : ''} de ${citas.length})`}
            </span>
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="text-cyan-600 hover:text-cyan-800 font-medium flex items-center space-x-1"
                aria-label="Limpiar todos los filtros"
              >
                <X className="w-4 h-4" />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* PANEL DE FILTROS */}
        {showFiltersPanel && (
          <div className="border-b bg-white" role="region" aria-labelledby="filtros-titulo">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 id="filtros-titulo" className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
                <button
                  onClick={() => setShowFiltersPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Cerrar panel de filtros"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Filtro por Estado */}
                <div>
                  <label htmlFor="filter-estado" className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    id="filter-estado"
                    value={filters.estado}
                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="programada">Programada</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                {/* Filtro por Sucursal */}
                <div>
                  <label htmlFor="filter-sucursal" className="block text-sm font-medium text-gray-700 mb-2">
                    Sucursal
                  </label>
                  <select
                    id="filter-sucursal"
                    value={filters.sucursal}
                    onChange={(e) => handleFilterChange('sucursal', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="todos">Todas las sucursales</option>
                    {uniqueSucursales.map(sucursal => (
                      <option key={sucursal._id} value={sucursal._id}>{sucursal.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Optometrista */}
                <div>
                  <label htmlFor="filter-optometrista" className="block text-sm font-medium text-gray-700 mb-2">
                    Optometrista
                  </label>
                  <select
                    id="filter-optometrista"
                    value={filters.optometrista}
                    onChange={(e) => handleFilterChange('optometrista', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="todos">Todos los optometristas</option>
                    {uniqueOptometristas.map(opt => (
                      <option key={opt._id} value={opt._id}>{getOptometristaNombre(opt)}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Rango de Fechas */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Fechas</label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        type="date"
                        value={filters.fechaDesde}
                        onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        aria-label="Fecha desde"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="date"
                        value={filters.fechaHasta}
                        onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        aria-label="Fecha hasta"
                      />
                    </div>
                  </div>
                  <div className="flex text-xs text-gray-500 mt-1 space-x-4">
                    <span>Desde</span>
                    <span>Hasta</span>
                  </div>
                </div>

                {/* Filtro por Rango de Horas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Horas</label>
                  <div className="flex space-x-2">
                    <input
                      type="time"
                      value={filters.horaDesde}
                      onChange={(e) => handleFilterChange('horaDesde', e.target.value)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      aria-label="Hora desde"
                    />
                    <input
                      type="time"
                      value={filters.horaHasta}
                      onChange={(e) => handleFilterChange('horaHasta', e.target.value)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      aria-label="Hora hasta"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acciÃƒÂ³n del panel de filtros */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Limpiar Todo
                </button>
                <button
                  onClick={() => setShowFiltersPanel(false)}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

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
                const clienteNombre = (cita.clienteId && (cita.clienteId.nombre || cita.clienteId.apellido))
                  ? `${cita.clienteId.nombre || ''} ${cita.clienteId.apellido || ''}`.trim()
                  : `${cita.clienteNombre || ''} ${cita.clienteApellidos || ''}`.trim();
                const sucursalNombre = cita.sucursalId ? (cita.sucursalId.nombre || '') : '';
                const optometristaNombre = resolveOptometristaNombre(cita.optometristaId);
                const servicio = cita.motivoCita || '';
                
                return (
                  <tr key={cita._id || cita.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{clienteNombre || 'Anónimo'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{servicio || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{optometristaNombre}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{cita.fechaFormatted}</div>
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
                        <button 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Eliminar" 
                          onClick={() => handleDelete(cita)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Ver detalles" 
                          onClick={() => handleShowDetail(cita)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                          title="Editar" 
                          onClick={() => handleOpenEditModal(cita)}
                        >
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

        {filteredAndSortedCitas.length === 0 && (
          <div className="p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron citas
            </h3>
            <p className="text-gray-500">
              {hasActiveFilters() ? 'Intenta con otros filtros o busca un nuevo cliente.' : 'Comienza agendando una nueva cita'}
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

      {/* MODAL DE ALTA/EDICIÃƒâ€œN */}
      <CitasFormModal
        isOpen={showAddModal || showEditModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        title={selectedCita ? 'Editar Cita' : 'Agendar Cita'}
        formData={formData}
        handleInputChange={handleInputChange}
        errors={errors}
        submitLabel={selectedCita ? 'Guardar cambios' : 'Agendar'}
        clientes={clientes}
        optometristas={optometristas}
        sucursales={sucursales}
        selectedCita={selectedCita}
      />
      
      {/* MODAL DE DETALLE DE CITA */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detalle de Cita"
        item={detailCita}
        data={[
          { label: 'Cliente', value: detailCita && detailCita.clienteId ? `${detailCita.clienteId.nombre || ''} ${detailCita.clienteId.apellido || ''}`.trim() : 'N/A' },
          { label: 'Forma de Contacto', value: (() => {
            const fc = detailCita?.formaContacto || (detailCita?.telefono ? 'telefono' : (detailCita?.email ? 'email' : null));
            return fc === 'telefono' ? 'Número Telefónico' : fc === 'email' ? 'Correo Electrónico' : 'N/A';
          })() },
          { label: 'Teléfono', value: detailCita && detailCita.telefono ? detailCita.telefono : 'N/A' },
          { label: 'Correo', value: detailCita && detailCita.email ? detailCita.email : 'N/A' },
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
      
      {/* MODAL DE CONFIRMACIÃƒâ€œN DE ELIMINAR CITA */}
      <ConfirmationModal
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, cita: null })}
        onConfirm={confirmDeleteCita}
        title="Ã‚Â¿EstÃƒÂ¡s seguro de eliminar la cita?"
        message="Esta acciÃƒÂ³n eliminarÃƒÂ¡ la cita de forma permanente."
      />

      {/* OVERLAY PARA DROPDOWN */}
      {showSortDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowSortDropdown(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default CitasContent;



