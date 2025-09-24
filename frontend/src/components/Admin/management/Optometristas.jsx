import React, { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useForm } from '../../../hooks/admin/useForm';
import { usePagination } from '../../../hooks/admin/usePagination';
import HorariosVisualizacion from './optometristas/HorariosVisualizacion';
import { API_CONFIG } from '../../../config/api';

// Componentes de UI
import PageHeader from '../ui/PageHeader';
import StatsGrid from '../ui/StatsGrid';
import FilterBar from '../ui/FilterBar';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import ConfirmationModal from '../ui/ConfirmationModal';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';
import OptometristasFormModal from './optometristas/OptometristasFormModal';
import { useNavigate, useLocation } from 'react-router-dom';

// Iconos
import { 
    Eye, Plus, Edit, Trash2, UserCheck, UserX, Search, Award, Clock, MapPin, Phone, Mail, Building2,
    Filter, X, ChevronDown, SortAsc, SortDesc, User, CheckCircle
} from 'lucide-react';

// Endpoints de la API
const OPTOMETRISTAS_EP = API_CONFIG.ENDPOINTS.OPTOMETRISTAS; // '/optometrista'
const EMPLEADOS_EP = API_CONFIG.ENDPOINTS.EMPLEADOS; // '/empleados'
const SUCURSALES_EP = API_CONFIG.ENDPOINTS.SUCURSALES; // '/sucursales'

// Configuración
const ITEMS_PER_PAGE = 10;

// Estados iniciales para filtros
const INITIAL_FILTERS = {
    especialidad: 'todas',
    disponibilidad: 'todos',
    sucursal: 'todas',
    experienciaMin: '',
    experienciaMax: '',
    fechaDesde: '',
    fechaHasta: ''
};

// Opciones de ordenamiento
const SORT_OPTIONS = [
    { value: 'createdAt-desc', label: 'Más Recientes Primero', icon: Clock },
    { value: 'createdAt-asc', label: 'Más Antiguos Primero', icon: Clock },
    { value: 'nombre-asc', label: 'Nombre A-Z', icon: User },
    { value: 'nombre-desc', label: 'Nombre Z-A', icon: User },
    { value: 'experiencia-desc', label: 'Más Experiencia', icon: Award },
    { value: 'experiencia-asc', label: 'Menos Experiencia', icon: Award },
    { value: 'especialidad-asc', label: 'Especialidad A-Z', icon: Eye },
    { value: 'especialidad-desc', label: 'Especialidad Z-A', icon: Eye },
];

// Columnas de la tabla
const TABLE_COLUMNS = [
    { header: 'Optometrista', key: 'optometrista' },
    { header: 'Contacto', key: 'contacto' },
    { header: 'Especialidad', key: 'especialidad' },
    { header: 'Licencia', key: 'licencia' },
    { header: 'Experiencia', key: 'experiencia' },
    { header: 'Sucursales', key: 'sucursales' },
    { header: 'Estado', key: 'estado' },
    { header: 'Acciones', key: 'acciones' }
];

// Axios helper con fallback (localhost <-> producción)
const axiosWithFallback = async (method, path, data, config = {}) => {
  const buildUrl = (base) => `${base}${path}`;

  const tryOnce = async (base) => {
    const url = buildUrl(base);
    const res = await axios({
      url,
      method,
      data,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json', ...(config.headers || {}) },
      ...config,
    });
    API_CONFIG.BASE_URL = base;
    return res;
  };

  const primary = API_CONFIG.BASE_URL;
  const secondary = primary.includes('localhost')
    ? 'https://a-u-r-o-r-a.onrender.com/api'
    : 'http://localhost:4000/api';

  try {
    return await tryOnce(primary);
  } catch (e1) {
    const msg = e1?.message || '';
    if (e1.code === 'ECONNABORTED' || msg.includes('Network Error') || msg.includes('ECONNREFUSED')) {
      return await tryOnce(secondary);
    }
    throw e1;
  }
};

// --- COMPONENTE SKELETON LOADER MEMOIZADO ---
const SkeletonLoader = React.memo(() => (
    <div className="animate-pulse">
        {/* Skeleton para las estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
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
                </div>
            </div>

            <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                    <div className="h-10 bg-gray-200 rounded-lg w-full max-w-md"></div>
                    <div className="flex space-x-3">
                        <div className="h-10 bg-gray-200 rounded w-24"></div>
                        <div className="h-10 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>
                <div className="mt-3 flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div style={{ minWidth: '1200px' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {TABLE_COLUMNS.map((_, index) => (
                                    <th key={index} className="px-6 py-3">
                                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Array.from({ length: 5 }, (_, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                            <div>
                                                <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                                                <div className="h-3 bg-gray-200 rounded w-20"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                                            <div className="h-3 bg-gray-200 rounded w-40"></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
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
            </div>

            <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                    <div className="flex space-x-2">
                        {Array.from({ length: 4 }, (_, i) => (
                            <div key={i} className="w-10 h-10 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
));

const Optometristas = () => {
    // --- ESTADOS PRINCIPALES ---
    const [optometristas, setOptometristas] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOptometrista, setSelectedOptometrista] = useState(null);
    const [alert, setAlert] = useState(null);
    
    // --- ESTADOS DE MODALES ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // --- ESTADOS DE FILTROS Y ORDENAMIENTO ---
    const [searchTerm, setSearchTerm] = useState('');
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    
    const navigate = useNavigate();
    const location = useLocation();

    // --- EFFECT TO HANDLE RETURN REDIRECT FOR EDITING ---
    useEffect(() => {
        if (location.state?.editOptometristaId) {
            const optometristaToEdit = optometristas.find(o => o._id === location.state.editOptometristaId);
            if (optometristaToEdit) {
                handleEdit(optometristaToEdit);
            }
            // Clear state
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, optometristas, navigate]);

    // New handler to navigate to the employee edit page
    const handleEditEmployeeRequest = (empleadoId) => {
        handleCloseModals();
        navigate('/empleados', { state: { editEmployeeId: empleadoId } });
    };

    // --- FORMULARIO ---
    const { formData, setFormData, handleInputChange, resetForm, validateForm, errors, setErrors } = useForm({
        empleadoId: '',
        especialidad: '',
        licencia: '',
        experiencia: '',
        disponibilidad: [],
        sucursalesAsignadas: [],
        disponible: true
    }, (data) => {
        const newErrors = {};
        if (!data.empleadoId) newErrors.empleadoId = 'El empleado es requerido';
        if (!data.especialidad) newErrors.especialidad = 'La especialidad es requerida';
        if (!data.licencia) newErrors.licencia = 'La licencia es requerida';
        if (!data.experiencia || data.experiencia < 0) newErrors.experiencia = 'La experiencia debe ser un número positivo';
        if (!data.sucursalesAsignadas || data.sucursalesAsignadas.length === 0) newErrors.sucursalesAsignadas = 'Debe asignar al menos una sucursal';
        return newErrors;
    });

    // --- FETCH DE DATOS ---
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [optometristasRes, empleadosRes, sucursalesRes] = await Promise.all([
                axiosWithFallback('get', OPTOMETRISTAS_EP),
                axiosWithFallback('get', EMPLEADOS_EP),
                axiosWithFallback('get', SUCURSALES_EP)
            ]);
            
            // Formatear optometristas con fechas
            const formattedOptometristas = optometristasRes.data.map(optometrista => ({
                ...optometrista,
                createdAt: optometrista.createdAt || new Date().toISOString(),
                createdAtRaw: new Date(optometrista.createdAt || new Date()),
            }));
            
            setOptometristas(formattedOptometristas);
            // Filtrar solo empleados que son optometristas
            const empleadosOptometristas = empleadosRes.data.filter(emp => emp.cargo === 'Optometrista');
            setEmpleados(empleadosOptometristas);
            setSucursales(sucursalesRes.data);
        } catch (error) {
            showAlert('error', 'Error al cargar los datos: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- FUNCIONES UTILITARIAS ---
    const showAlert = useCallback((type, message) => {
        setAlert({ type, message });
        const timer = setTimeout(() => setAlert(null), 5000);
        return () => clearTimeout(timer);
    }, []);

    const getEspecialidadColor = useCallback((especialidad) => {
        const colors = {
            'General': 'bg-blue-100 text-blue-800',
            'Pediátrica': 'bg-pink-100 text-pink-800',
            'Contactología': 'bg-green-100 text-green-800',
            'Baja Visión': 'bg-purple-100 text-purple-800',
            'Ortóptica': 'bg-yellow-100 text-yellow-800'
        };
        return colors[especialidad] || 'bg-gray-100 text-gray-800';
    }, []);

    const getDisponibilidadColor = useCallback((isDisponible) => {
        return isDisponible ? 
            { text: 'Disponible', color: 'bg-green-100 text-green-800' } : 
            { text: 'No Disponible', color: 'bg-red-100 text-red-800' };
    }, []);

    const formatSucursales = useCallback((sucursales) => {
        if (!sucursales || sucursales.length === 0) return 'Sin sucursales asignadas';
        return sucursales.map(s => s.nombre).join(', ');
    }, []);

    const formatFecha = useCallback((fecha) => new Date(fecha).toLocaleDateString('es-ES'), []);

    // --- FUNCIÓN PARA MANEJAR ORDENAMIENTO ---
    const handleSortChange = useCallback((sortValue) => {
        const [field, order] = sortValue.split('-');
        setSortBy(field);
        setSortOrder(order);
        setShowSortDropdown(false);
    }, []);

    // --- FUNCIÓN PARA ORDENAR DATOS ---
    const sortData = useCallback((data) => {
        return [...data].sort((a, b) => {
            let valueA, valueB;
            
            switch (sortBy) {
                case 'nombre':
                    valueA = `${a.empleadoId?.nombre || ''} ${a.empleadoId?.apellido || ''}`.toLowerCase();
                    valueB = `${b.empleadoId?.nombre || ''} ${b.empleadoId?.apellido || ''}`.toLowerCase();
                    break;
                case 'experiencia':
                    valueA = parseFloat(a.experiencia) || 0;
                    valueB = parseFloat(b.experiencia) || 0;
                    break;
                case 'especialidad':
                    valueA = a.especialidad?.toLowerCase() || '';
                    valueB = b.especialidad?.toLowerCase() || '';
                    break;
                case 'createdAt':
                    valueA = a.createdAtRaw || new Date(0);
                    valueB = b.createdAtRaw || new Date(0);
                    break;
                default:
                    return 0;
            }

            if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [sortBy, sortOrder]);

    // --- FUNCIÓN PARA APLICAR FILTROS AVANZADOS ---
    const applyAdvancedFilters = useCallback((optometrista) => {
        // Filtro por especialidad
        if (filters.especialidad !== 'todas' && optometrista.especialidad !== filters.especialidad) {
            return false;
        }

        // Filtro por disponibilidad
        if (filters.disponibilidad === 'disponible' && !optometrista.disponible) {
            return false;
        }
        if (filters.disponibilidad === 'no_disponible' && optometrista.disponible) {
            return false;
        }

        // Filtro por sucursal
        if (filters.sucursal !== 'todas') {
            const tieneSucursal = optometrista.sucursalesAsignadas && 
                optometrista.sucursalesAsignadas.some(sucursal => sucursal._id === filters.sucursal);
            if (!tieneSucursal) {
                return false;
            }
        }

        // Filtro por experiencia
        if (filters.experienciaMin && parseFloat(optometrista.experiencia || 0) < parseFloat(filters.experienciaMin)) {
            return false;
        }
        if (filters.experienciaMax && parseFloat(optometrista.experiencia || 0) > parseFloat(filters.experienciaMax)) {
            return false;
        }

        // Filtro por fecha de registro
        if (filters.fechaDesde) {
            const fechaDesde = new Date(filters.fechaDesde);
            if (optometrista.createdAtRaw < fechaDesde) {
                return false;
            }
        }
        if (filters.fechaHasta) {
            const fechaHasta = new Date(filters.fechaHasta);
            fechaHasta.setHours(23, 59, 59);
            if (optometrista.createdAtRaw > fechaHasta) {
                return false;
            }
        }

        return true;
    }, [filters]);

    // --- LÓGICA DE FILTRADO, ORDENAMIENTO Y PAGINACIÓN ---
    const filteredAndSortedOptometristas = useMemo(() => {
        const filtered = optometristas.filter(optometrista => {
            const empleado = optometrista.empleadoId;
            if (!empleado) return false;

            // Búsqueda por texto
            const search = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                `${empleado.nombre} ${empleado.apellido}`.toLowerCase().includes(search) ||
                empleado.correo.toLowerCase().includes(search) ||
                optometrista.especialidad.toLowerCase().includes(search) ||
                optometrista.licencia.toLowerCase().includes(search);
            
            // Filtros avanzados
            const matchesAdvancedFilters = applyAdvancedFilters(optometrista);
            
            return matchesSearch && matchesAdvancedFilters;
        });
        
        return sortData(filtered);
    }, [optometristas, searchTerm, applyAdvancedFilters, sortData]);

    const { paginatedData: currentOptometristas, ...paginationProps } = usePagination(filteredAndSortedOptometristas, ITEMS_PER_PAGE);

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
    }, []);

    const hasActiveFilters = useCallback(() => {
        return searchTerm || 
               filters.especialidad !== 'todas' || 
               filters.disponibilidad !== 'todos' || 
               filters.sucursal !== 'todas' || 
               filters.experienciaMin || 
               filters.experienciaMax || 
               filters.fechaDesde || 
               filters.fechaHasta;
    }, [searchTerm, filters]);

    // --- OBTENER OPCIONES ÚNICAS ---
    const uniqueEspecialidades = useMemo(() => {
        const especialidades = optometristas
            .map(o => o.especialidad)
            .filter(Boolean)
            .filter((esp, index, arr) => arr.indexOf(esp) === index);
        return especialidades.sort();
    }, [optometristas]);

    // --- HANDLERS ---
    const handleCloseModals = useCallback(() => {
        setIsFormModalOpen(false);
        setIsDetailModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedOptometrista(null);
        resetForm();
        setErrors({});
    }, [resetForm, setErrors]);

    const handleAdd = useCallback(() => {
        resetForm();
        setFormData({
            empleadoId: '',
            especialidad: '',
            licencia: '',
            experiencia: '',
            disponibilidad: [],
            sucursalesAsignadas: [],
            disponible: true
        });
        setSelectedOptometrista(null);
        setIsFormModalOpen(true);
    }, [resetForm, setFormData]);

    const handleEdit = useCallback((optometrista) => {
        setSelectedOptometrista(optometrista);
        setFormData({
            empleadoId: optometrista.empleadoId?._id || '',
            especialidad: optometrista.especialidad,
            licencia: optometrista.licencia,
            experiencia: optometrista.experiencia,
            disponibilidad: optometrista.disponibilidad || [],
            sucursalesAsignadas: optometrista.sucursalesAsignadas?.map(s => s._id) || [],
            disponible: optometrista.disponible
        });
        setErrors({});
        setIsFormModalOpen(true);
    }, [setFormData, setErrors]);

    const handleViewDetails = useCallback((optometrista) => {
        setSelectedOptometrista(optometrista);
        setIsDetailModalOpen(true);
    }, []);

    const handleDeleteAttempt = useCallback((optometrista) => {
        setSelectedOptometrista(optometrista);
        setIsDeleteModalOpen(true);
    }, []);

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const dataToSend = {
                ...formData,
                // Asegurar que disponibilidad sea un array válido
                disponibilidad: Array.isArray(formData.disponibilidad) ? formData.disponibilidad : [],
                // Asegurar que sucursalesAsignadas sea un array válido
                sucursalesAsignadas: Array.isArray(formData.sucursalesAsignadas) ? formData.sucursalesAsignadas : []
            };

            if (selectedOptometrista) {
                // UPDATE
                await axiosWithFallback('put', `${OPTOMETRISTAS_EP}/${selectedOptometrista._id}`, dataToSend);
                showAlert('success', '¡Optometrista actualizado exitosamente!');
            } else {
                // CREATE
                await axiosWithFallback('post', OPTOMETRISTAS_EP, dataToSend);
                showAlert('success', '¡Optometrista creado exitosamente!');
            }
            
            fetchData(); // Recargar datos
            handleCloseModals();
        } catch (error) {
            showAlert('error', 'Error: ' + (error.response?.data?.message || error.message));
        }
    };

    // FUNCIÓN MEJORADA PARA ELIMINAR OPTOMETRISTA Y EMPLEADO ASOCIADO
    const handleDelete = async () => {
        if (!selectedOptometrista) return;
        
        try {
            setLoading(true);
            
            // 1. Eliminar el optometrista primero
            await axiosWithFallback('delete', `${OPTOMETRISTAS_EP}/${selectedOptometrista._id}`);
            
            // 2. Eliminar el empleado asociado
            if (selectedOptometrista.empleadoId?._id) {
                await axiosWithFallback('delete', `${EMPLEADOS_EP}/${selectedOptometrista.empleadoId._id}`);
            }
            
            showAlert('success', '¡Optometrista y empleado asociado eliminados exitosamente!');
            fetchData(); // Recargar datos
            handleCloseModals();
        } catch (error) {
            showAlert('error', 'Error al eliminar: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // --- ESTADÍSTICAS ---
    const totalOptometristas = optometristas.length;
    const optometristasDisponibles = optometristas.filter(o => o.disponible).length;
    const optometristasNoDisponibles = totalOptometristas - optometristasDisponibles;
    const promedioExperiencia = totalOptometristas > 0 ? 
        (optometristas.reduce((sum, o) => sum + (o.experiencia || 0), 0) / totalOptometristas).toFixed(1) : '0';

    // --- RENDERIZADO DE TABLA ---
    const renderRow = useCallback((optometrista) => {
        const empleado = optometrista.empleadoId;
        if (!empleado) return null;

        return (
            <>
                <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <img 
                            src={empleado.fotoPerfil || `https://ui-avatars.com/api/?name=${empleado.nombre}+${empleado.apellido}`} 
                            alt={`${empleado.nombre}`} 
                            className="w-10 h-10 rounded-full object-cover" 
                        />
                        <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">{empleado.nombre} {empleado.apellido}</div>
                            <div className="text-sm text-gray-500">ID: {optometrista.licencia}</div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{empleado.telefono}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate" title={empleado.correo}>{empleado.correo}</span>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEspecialidadColor(optometrista.especialidad)}`}>
                        {optometrista.especialidad}
                    </span>
                </td>
                <td className="px-6 py-4 font-mono text-gray-700">
                    {optometrista.licencia}
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">{optometrista.experiencia || 0} años</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm truncate">{formatSucursales(optometrista.sucursalesAsignadas)}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDisponibilidadColor(optometrista.disponible).color}`}>
                        {getDisponibilidadColor(optometrista.disponible).text}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex space-x-1">
                        <button 
                            onClick={() => handleDeleteAttempt(optometrista)} 
                            className="p-1.5 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" 
                            title="Eliminar"
                            aria-label={`Eliminar optometrista ${empleado.nombre} ${empleado.apellido}`}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleViewDetails(optometrista)} 
                            className="p-1.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" 
                            title="Ver detalles"
                            aria-label={`Ver detalles de ${empleado.nombre} ${empleado.apellido}`}
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleEdit(optometrista)} 
                            className="p-1.5 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" 
                            title="Editar"
                            aria-label={`Editar optometrista ${empleado.nombre} ${empleado.apellido}`}
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </>
        );
    }, [getEspecialidadColor, getDisponibilidadColor, formatSucursales, handleDeleteAttempt, handleViewDetails, handleEdit]);

    // --- RENDERIZADO DEL COMPONENTE ---
    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Alert alert={alert} />
                <SkeletonLoader />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <Alert alert={alert} />
            
            <div className="w-full flex justify-center">
                <div className="w-full max-w-none">
                    <StatsGrid stats={[
                        { title: 'Total Optometristas', value: totalOptometristas, Icon: Eye, color: 'cyan' },
                        { title: 'Disponibles', value: optometristasDisponibles, Icon: UserCheck, color: 'green' },
                        { title: 'No Disponibles', value: optometristasNoDisponibles, Icon: UserX, color: 'red' },
                        { title: 'Experiencia Promedio', value: `${promedioExperiencia} años`, Icon: Award, color: 'purple' },
                    ]} />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* HEADER SIN BOTÓN DE AGREGAR */}
                <PageHeader 
                    title="Gestión de Optometristas"
                    subtitle="Los optometristas se crean desde la sección de empleados"
                />
                
                {/* BARRA DE BÚSQUEDA Y CONTROLES */}
                <div className="px-6 py-4 border-b bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                        {/* Barra de búsqueda */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar optometrista..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                aria-label="Buscar optometristas"
                            />
                        </div>

                        {/* Controles de filtro y ordenamiento */}
                        <div className="flex items-center space-x-3">
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

                            {/* Botón de filtros */}
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
                                            filters.especialidad !== 'todas' && 1,
                                            filters.disponibilidad !== 'todos' && 1,
                                            filters.sucursal !== 'todas' && 1,
                                            filters.experienciaMin && 1,
                                            filters.experienciaMax && 1,
                                            filters.fechaDesde && 1,
                                            filters.fechaHasta && 1
                                        ].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Información de resultados */}
                    <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                        <span>
                            {filteredAndSortedOptometristas.length} optometrista{filteredAndSortedOptometristas.length !== 1 ? 's' : ''} 
                            {hasActiveFilters() && ` (filtrado${filteredAndSortedOptometristas.length !== 1 ? 's' : ''} de ${optometristas.length})`}
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
                                {/* Filtro por Especialidad */}
                                <div>
                                    <label htmlFor="filter-especialidad" className="block text-sm font-medium text-gray-700 mb-2">
                                        Especialidad
                                    </label>
                                    <select
                                        id="filter-especialidad"
                                        value={filters.especialidad}
                                        onChange={(e) => handleFilterChange('especialidad', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    >
                                        <option value="todas">Todas las especialidades</option>
                                        {uniqueEspecialidades.map(especialidad => (
                                            <option key={especialidad} value={especialidad}>{especialidad}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro por Disponibilidad */}
                                <div>
                                    <label htmlFor="filter-disponibilidad" className="block text-sm font-medium text-gray-700 mb-2">
                                        Estado
                                    </label>
                                    <select
                                        id="filter-disponibilidad"
                                        value={filters.disponibilidad}
                                        onChange={(e) => handleFilterChange('disponibilidad', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    >
                                        <option value="todos">Todos los estados</option>
                                        <option value="disponible">Disponible</option>
                                        <option value="no_disponible">No Disponible</option>
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
                                        <option value="todas">Todas las sucursales</option>
                                        {sucursales.map(sucursal => (
                                            <option key={sucursal._id} value={sucursal._id}>{sucursal.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro por Rango de Experiencia */}
                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Años de Experiencia</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.experienciaMin}
                                            onChange={(e) => handleFilterChange('experienciaMin', e.target.value)}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                            min="0"
                                            aria-label="Experiencia mínima"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.experienciaMax}
                                            onChange={(e) => handleFilterChange('experienciaMax', e.target.value)}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                            min="0"
                                            aria-label="Experiencia máxima"
                                        />
                                    </div>
                                </div>

                                {/* Filtro por Fecha de Registro */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Registro</label>
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
                            </div>

                            {/* Botones de acción del panel de filtros */}
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
                
                {/* TABLA DE DATOS */}
                <div className="overflow-x-auto">
                    <div style={{ minWidth: '1200px' }}>
                        <DataTable
                            columns={TABLE_COLUMNS}
                            data={currentOptometristas}
                            renderRow={renderRow}
                            isLoading={false}
                            noDataMessage="No se encontraron optometristas"
                            noDataSubMessage={hasActiveFilters() ? 'Intenta ajustar los filtros de búsqueda' : 'Los optometristas se crean desde la sección de empleados'}
                        />
                    </div>
                </div>

                <Pagination {...paginationProps} />
            </div>

            {/* MODALES */}
            <OptometristasFormModal
                isOpen={isFormModalOpen}
                onClose={handleCloseModals}
                onSubmit={handleSubmit}
                title={selectedOptometrista ? 'Editar Optometrista' : 'Añadir Nuevo Optometrista'}
                formData={formData}
                setFormData={setFormData}
                handleInputChange={handleInputChange}
                errors={errors}
                submitLabel={selectedOptometrista ? 'Actualizar Optometrista' : 'Guardar Optometrista'}
                empleados={empleados}
                sucursales={sucursales}
                selectedOptometrista={selectedOptometrista}
                onEditEmployeeRequest={handleEditEmployeeRequest}
            />

            <DetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseModals}
                title="Detalles del Optometrista"
                item={selectedOptometrista?.empleadoId || {}}
                data={selectedOptometrista ? [
                    { 
                        label: "Nombre Completo", 
                        value: selectedOptometrista.empleadoId ? 
                            `${selectedOptometrista.empleadoId.nombre} ${selectedOptometrista.empleadoId.apellido}` : 
                            'N/A' 
                    },
                    { 
                        label: "Email", 
                        value: selectedOptometrista.empleadoId?.correo || 'N/A' 
                    },
                    { 
                        label: "Teléfono", 
                        value: selectedOptometrista.empleadoId?.telefono || 'N/A' 
                    },
                    { 
                        label: "Especialidad", 
                        value: selectedOptometrista.especialidad, 
                        color: getEspecialidadColor(selectedOptometrista.especialidad) 
                    },
                    { label: "Licencia", value: selectedOptometrista.licencia },
                    { label: "Experiencia", value: `${selectedOptometrista.experiencia || 0} años` },
                    { 
                        label: "Sucursales Asignadas", 
                        value: formatSucursales(selectedOptometrista.sucursalesAsignadas) 
                    },
                    { 
                        label: "Estado", 
                        value: getDisponibilidadColor(selectedOptometrista.disponible).text, 
                        color: getDisponibilidadColor(selectedOptometrista.disponible).color 
                    },
                    { 
                        label: "Fecha de Registro", 
                        value: selectedOptometrista.createdAt ? 
                            formatFecha(selectedOptometrista.createdAt) : 
                            'N/A' 
                    },
                ] : []}
            >
                {/* Visualización gráfica de horarios */}
                {selectedOptometrista && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <HorariosVisualizacion 
                            disponibilidad={selectedOptometrista.disponibilidad || []} 
                        />
                    </div>
                )}
            </DetailModal>

            {/* MODAL DE CONFIRMACIÓN CON MENSAJE MEJORADO */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onConfirm={handleDelete}
                title="⚠️ Confirmar Eliminación Completa"
                message={
                    selectedOptometrista?.empleadoId ? 
                        `¿Estás seguro de que deseas eliminar al optometrista ${selectedOptometrista.empleadoId.nombre} ${selectedOptometrista.empleadoId.apellido}?

⚠️ ATENCIÓN: Esta acción también eliminará:
• El registro del empleado asociado
• Todos los datos del optometrista
• Los horarios y disponibilidad configurados
• Las asignaciones de sucursales

Esta acción NO se puede deshacer.` :
                        '¿Estás seguro de que deseas eliminar este optometrista y su empleado asociado? Esta acción no se puede deshacer.'
                }
                confirmLabel="Sí, eliminar todo"
                cancelLabel="Cancelar"
                type="danger"
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

export default Optometristas;