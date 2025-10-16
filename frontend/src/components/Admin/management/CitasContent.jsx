import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Search, Plus, Trash2, Eye, Edit, Calendar, User, Clock, CheckCircle, XCircle, AlertTriangle, MapPin, ChevronLeft, ChevronRight, Save, X as XIcon, AlertCircle as AlertCircleIcon } from 'lucide-react';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';
import ConfirmationModal from '../ui/ConfirmationModal';

const API_URL = 'https://aurora-production-7e57.up.railway.app/api';

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

// --- COMPONENTE SKELETON LOADER ---
const SkeletonLoader = React.memo(() => (
  <div className="animate-pulse">
    {/* Skeleton para las estadísticas */}
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
      <div className="px-6 py-4 border-b bg-gradient-to-r from-cyan-500 to-cyan-600">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-cyan-400 rounded w-48"></div>
          <div className="h-10 bg-cyan-400 rounded w-32"></div>
        </div>
      </div>

      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="h-10 bg-gray-200 rounded-lg w-full max-w-md"></div>
          <div className="h-10 bg-gray-200 rounded w-40"></div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: 7 }, (_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 5 }, (_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: 7 }, (_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
));

// --- COMPONENTE CUSTOM FORM MODAL ---
const CitasFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  formData, 
  handleInputChange, 
  errors, 
  submitLabel,
  isLoading = false,
  isError = false,
  clienteOptions = [],
  optometristaOptions = [],
  sucursalOptions = [],
  estadoOptions = []
}) => {
  const [isFocused, setIsFocused] = useState({});
  const [localError, setLocalError] = useState(false);

  useEffect(() => {
    if (isError) {
      setLocalError(true);
      const timer = setTimeout(() => setLocalError(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isError]);

  const getButtonConfig = () => {
    if (isLoading) {
      return {
        bgColor: 'bg-cyan-500',
        text: 'Procesando...',
        icon: <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />,
        disabled: true
      };
    }
    if (localError) {
      return {
        bgColor: 'bg-red-500',
        text: 'Error',
        icon: <XIcon className="w-4 h-4" />,
        disabled: false
      };
    }
    return {
      bgColor: 'bg-cyan-500 hover:bg-cyan-600',
      text: submitLabel,
      icon: <Save className="w-4 h-4" />,
      disabled: false
    };
  };

  const buttonConfig = getButtonConfig();

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      onSubmit(e);
    }
  };

  const renderField = (field) => {
    const { name, label, type, options, required, placeholder } = field;
    const error = errors[name];
    const displayLabel = required ? `${label} *` : label;
    const value = formData[name] || '';

    const inputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-base ${
      error ? 'border-red-500 bg-red-50' : 
      isFocused[name] ? 'border-cyan-500' : 'border-gray-300 bg-white'
    }`;

    if (type === 'select') {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {displayLabel}
          </label>
          <select
            name={name}
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(prev => ({ ...prev, [name]: true }))}
            onBlur={() => setIsFocused(prev => ({ ...prev, [name]: false }))}
            className={inputClasses}
          >
            <option value="">{placeholder || `Seleccione ${label.toLowerCase()}`}</option>
            {options.map((option, index) => (
              <option key={`${name}-${index}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && (
            <p className="text-red-500 text-sm flex items-center space-x-1">
              <AlertCircleIcon className="w-4 h-4" />
              <span>{error}</span>
            </p>
          )}
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {displayLabel}
          </label>
          <textarea
            name={name}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            onFocus={() => setIsFocused(prev => ({ ...prev, [name]: true }))}
            onBlur={() => setIsFocused(prev => ({ ...prev, [name]: false }))}
            className={`${inputClasses} resize-none`}
            rows={3}
          />
          {error && (
            <p className="text-red-500 text-sm flex items-center space-x-1">
              <AlertCircleIcon className="w-4 h-4" />
              <span>{error}</span>
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {displayLabel}
        </label>
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          onFocus={() => setIsFocused(prev => ({ ...prev, [name]: true }))}
          onBlur={() => setIsFocused(prev => ({ ...prev, [name]: false }))}
          className={inputClasses}
        />
        {error && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <AlertCircleIcon className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}
        {name === 'hora' && (
          <p className="text-xs text-gray-500 flex items-center space-x-1">
            <AlertCircleIcon className="w-3 h-3" />
            <span>Formato 24h. Ejemplo: 14:30</span>
          </p>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  const sections = [
    {
      title: " Información de la Cita",
      fields: [
        { name: 'clienteId', label: 'Cliente', type: 'select', options: clienteOptions, placeholder: 'Seleccione un cliente', required: true },
        { name: 'optometristaId', label: 'Optometrista', type: 'select', options: optometristaOptions, placeholder: 'Seleccione un optometrista', required: true },
        { name: 'sucursalId', label: 'Sucursal', type: 'select', options: sucursalOptions, placeholder: 'Seleccione una sucursal', required: true },
        { name: 'fecha', label: 'Fecha', type: 'date', required: true },
        { name: 'hora', label: 'Hora', type: 'text', placeholder: '14:30', required: true },
        { name: 'estado', label: 'Estado', type: 'select', options: estadoOptions, required: true },
      ]
    },
    {
      title: " Detalles Médicos",
      fields: [
        { name: 'motivoCita', label: 'Motivo de la cita', type: 'text', placeholder: 'Ej: Examen Visual', required: true },
        { name: 'tipoLente', label: 'Tipo de lente', type: 'text', placeholder: 'Ej: Monofocal', required: true },
        { name: 'graduacion', label: 'Graduación', type: 'text', placeholder: 'Ej: -1.25', required: true },
        { name: 'notasAdicionales', label: 'Notas adicionales', type: 'textarea', placeholder: 'Observaciones adicionales...' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <form 
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-300 animate-slideInScale"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-5 flex justify-between items-center sticky top-0 z-10">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <Calendar className="w-6 h-6" />
            <span>{title}</span>
          </h3>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isLoading}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="space-y-6">
            {sections.map((section, sectionIndex) => (
              <div key={`section-${sectionIndex}`} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  {section.title}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={`field-${sectionIndex}-${fieldIndex}`} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3 sticky bottom-0 z-10">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={buttonConfig.disabled || isLoading}
            className={`px-6 py-2.5 ${buttonConfig.bgColor} text-white rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {buttonConfig.icon}
            <span>{buttonConfig.text}</span>
          </button>
        </div>
      </form>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideInScale {
          animation: slideInScale 0.3s ease-out;
        }
      `}</style>
    </div>
  );
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [detailCita, setDetailCita] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, cita: null });
  
  // ESTADOS PARA LOADING DEL BOTÓN
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // Nombre de optometrista con fallback amigable
  const getOptometristaNombre = (opt) => {
    if (!opt) return 'N/A';
    const emp = opt.empleadoId;
    if (emp && (emp.nombre || emp.apellido)) {
      return `${emp.nombre || ''} ${emp.apellido || ''}`.trim() || 'N/A';
    }
    const id = opt._id || opt.id || '';
    if (id) {
      const shortId = String(id).slice(-6).toUpperCase();
      return `Optometrista ${shortId}`;
    }
    return 'Optometrista';
  };

  // Resolver robusto
  const resolveOptometristaNombre = useCallback((optFromCita) => {
    if (!optFromCita) return 'N/A';
    if (typeof optFromCita === 'object') {
      const name = getOptometristaNombre(optFromCita);
      if (!/^Optometrista\s/i.test(name)) return name;
      const oid = optFromCita._id || optFromCita.id;
      if (oid) {
        const found = optometristas.find(o => o._id === oid);
        if (found) return getOptometristaNombre(found);
      }
      return name;
    }
    const idStr = String(optFromCita);
    const found = optometristas.find(o => o._id === idStr);
    if (found) return getOptometristaNombre(found);
    const shortId = idStr.slice(-6).toUpperCase();
    return `Optometrista ${shortId}`;
  }, [optometristas]);

  // Función para mostrar notificaciones
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // Fetch datos
  const fetchData = useCallback(async () => {
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
      showNotification('Error al cargar datos desde el servidor', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOpenAddModal = () => {
    setFormData(initialFormState);
    setErrors({});
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
    setErrors({});
    setSelectedCita(cita);
    setShowEditModal(true);
    setShowDetailModal(false);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedCita(null);
    setFormData(initialFormState);
    setErrors({});
    setIsSubmitting(false);
    setSubmitError(false);
  };

  const handleShowDetail = (cita) => {
    setDetailCita(cita);
    setShowDetailModal(true);
  };

  // Opciones para selects
  const clienteOptions = useMemo(() => 
    clientes.map(c => ({
      value: c._id,
      label: `${c.nombre} ${c.apellido}`
    }))
  , [clientes]);

  const optometristaOptions = useMemo(() => 
    optometristas.map(o => ({
      value: o._id,
      label: getOptometristaNombre(o)
    }))
  , [optometristas]);

  const sucursalOptions = useMemo(() => 
    sucursales.map(s => ({
      value: s._id,
      label: s.nombre
    }))
  , [sucursales]);

  const estadoOptions = [
    { value: 'Agendada', label: 'Agendada' },
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Confirmada', label: 'Confirmada' },
    { value: 'Cancelada', label: 'Cancelada' },
    { value: 'Completada', label: 'Completada' }
  ];

  // Validación
  const validate = () => {
    const newErrors = {};
    if (!formData.clienteId) newErrors.clienteId = 'Seleccione un cliente';
    if (!formData.optometristaId) newErrors.optometristaId = 'Seleccione un optometrista';
    if (!formData.sucursalId) newErrors.sucursalId = 'Seleccione una sucursal';
    if (!formData.fecha) newErrors.fecha = 'Seleccione una fecha';
    if (!formData.hora) newErrors.hora = 'Ingrese la hora';
    if (!formData.estado) newErrors.estado = 'Seleccione un estado';
    if (!formData.motivoCita) newErrors.motivoCita = 'Ingrese el motivo';
    if (!formData.tipoLente) newErrors.tipoLente = 'Ingrese el tipo de lente';
    if (!formData.graduacion) newErrors.graduacion = 'Ingrese la graduación';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      setSubmitError(true);
      setTimeout(() => setSubmitError(false), 1000);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(false);

    try {
      const dataToSend = {
        ...formData,
        fecha: formData.fecha ? new Date(formData.fecha) : undefined
      };

      if (selectedCita) {
        await axios.put(`${API_URL}/citas/${selectedCita._id}`, dataToSend);
        showNotification('¡Cita actualizada exitosamente!', 'success');
      } else {
        await axios.post(`${API_URL}/citas`, dataToSend);
        showNotification('¡Cita creada exitosamente!', 'success');
      }
      
      await fetchData();
      handleCloseModal();
    } catch (err) {
      setSubmitError(true);
      setTimeout(() => setSubmitError(false), 1000);
      const errorMessage = err.response?.data?.message || 'Error al guardar la cita';
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar cita
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
      showNotification(`Cita de ${clienteNombre} eliminada exitosamente`, 'delete');
    } catch (err) {
      showNotification('Error al eliminar la cita', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtrado
  const filteredCitas = useMemo(() => {
    return citas.filter(cita => {
      const clienteStr = cita.clienteId 
        ? `${cita.clienteId.nombre || ''} ${cita.clienteId.apellido || ''}`.toLowerCase()
        : '';
      const servicioStr = (cita.motivoCita || '').toLowerCase();
      const matchesSearch = clienteStr.includes(searchTerm.toLowerCase()) ||
                            servicioStr.includes(searchTerm.toLowerCase());
      
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
      
      return matchesSearch && matchesDate;
    });
  }, [citas, searchTerm, selectedDate]);

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
      case 'Completada': return { color: 'bg-blue-100 text-blue-800', icon: <User className="w-4 h-4" /> };
      case 'Cancelada': return { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> };
      default: return { color: 'bg-gray-100 text-gray-800', icon: <AlertTriangle className="w-4 h-4" /> };
    }
  };

  // Estadísticas
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const totalCitasHoy = citas.filter(c => {
      if (!c.fecha) return false;
      const citaDate = new Date(c.fecha);
      const year = citaDate.getFullYear();
      const month = String(citaDate.getMonth() + 1).padStart(2, '0');
      const day = String(citaDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}` === today;
    }).length;
    
    const citasPendientes = citas.filter(c => c.estado === 'Pendiente').length;
    const citasConfirmadas = citas.filter(c => c.estado === 'Confirmada').length;

    return [
      { title: 'Citas para Hoy', value: totalCitasHoy, Icon: Calendar, color: 'cyan' },
      { title: 'Pendientes', value: citasPendientes, Icon: Clock, color: 'cyan' },
      { title: 'Confirmadas', value: citasConfirmadas, Icon: CheckCircle, color: 'cyan' }
    ];
  }, [citas]);

  // Función para avanzar o retroceder días
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

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {notification && (
          <Alert 
            type={notification.type} 
            message={notification.message} 
            onClose={() => setNotification(null)} 
          />
        )}
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {notification && (
        <Alert 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-cyan-600 mt-2">{stat.value}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <stat.Icon className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestión de Citas</h2>
            <button
              onClick={handleOpenAddModal}
              className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 font-medium"
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
                const clienteNombre = cita.clienteId ? `${cita.clienteId.nombre || ''} ${cita.clienteId.apellido || ''}`.trim() : '';
                const sucursalNombre = cita.sucursalId ? cita.sucursalId.nombre || '' : '';
                const optometristaNombre = resolveOptometristaNombre(cita.optometristaId);
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
                          <div className="font-medium text-gray-900">
                            {cita.fecha ? new Date(cita.fecha).toLocaleDateString() : ''}
                          </div>
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
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1.5 ${estadoInfo.color} inline-flex`}>
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

        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Mostrar</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="border border-gray-300 rounded-lg py-1.5 px-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {[5, 10, 15, 20].map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-700">por página</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={goToFirstPage} 
                disabled={currentPage === 0} 
                className="px-3 py-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {"<<"}
              </button>
              <button 
                onClick={goToPreviousPage} 
                disabled={currentPage === 0} 
                className="px-3 py-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {"<"}
              </button>
              <span className="text-sm text-gray-700 font-medium px-2">
                Página {currentPage + 1} de {totalPages || 1}
              </span>
              <button 
                onClick={goToNextPage} 
                disabled={currentPage === totalPages - 1 || totalPages === 0} 
                className="px-3 py-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {">"}
              </button>
              <button 
                onClick={goToLastPage} 
                disabled={currentPage === totalPages - 1 || totalPages === 0} 
                className="px-3 py-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {">>"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CUSTOM DE ALTA/EDICIÓN */}
      <CitasFormModal
        isOpen={showAddModal || showEditModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        title={selectedCita ? 'Editar Cita' : 'Agendar Nueva Cita'}
        formData={formData}
        handleInputChange={handleInputChange}
        errors={errors}
        submitLabel={selectedCita ? 'Guardar Cambios' : 'Agendar Cita'}
        isLoading={isSubmitting}
        isError={submitError}
        clienteOptions={clienteOptions}
        optometristaOptions={optometristaOptions}
        sucursalOptions={sucursalOptions}
        estadoOptions={estadoOptions}
      />

      {/* MODAL DE DETALLE DE CITA */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detalle de Cita"
        item={detailCita}
        data={[
          { 
            label: 'Cliente', 
            value: detailCita && detailCita.clienteId 
              ? `${detailCita.clienteId.nombre || ''} ${detailCita.clienteId.apellido || ''}`.trim() 
              : 'N/A' 
          },
          { 
            label: 'Optometrista', 
            value: detailCita ? resolveOptometristaNombre(detailCita.optometristaId) : 'N/A' 
          },
          { 
            label: 'Sucursal', 
            value: detailCita && detailCita.sucursalId ? detailCita.sucursalId.nombre : 'N/A' 
          },
          { 
            label: 'Fecha', 
            value: detailCita && detailCita.fecha 
              ? new Date(detailCita.fecha).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) 
              : 'N/A' 
          },
          { 
            label: 'Hora', 
            value: detailCita && detailCita.hora ? detailCita.hora : 'N/A' 
          },
          { 
            label: 'Estado', 
            value: detailCita && detailCita.estado ? detailCita.estado : 'N/A' 
          },
          { 
            label: 'Motivo de la cita', 
            value: detailCita && detailCita.motivoCita ? detailCita.motivoCita : 'N/A' 
          },
          { 
            label: 'Tipo de lente', 
            value: detailCita && detailCita.tipoLente ? detailCita.tipoLente : 'N/A' 
          },
          { 
            label: 'Graduación', 
            value: detailCita && detailCita.graduacion ? detailCita.graduacion : 'N/A' 
          },
          { 
            label: 'Notas adicionales', 
            value: detailCita && detailCita.notasAdicionales ? detailCita.notasAdicionales : 'N/A' 
          },
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
        message={`Esta acción eliminará permanentemente la cita de ${
          confirmDelete.cita?.clienteId 
            ? `${confirmDelete.cita.clienteId.nombre || ''} ${confirmDelete.cita.clienteId.apellido || ''}`.trim()
            : 'este cliente'
        }.`}
      />

      {/* ESTILOS PARA ANIMACIONES */}
      <style>{`
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CitasContent;