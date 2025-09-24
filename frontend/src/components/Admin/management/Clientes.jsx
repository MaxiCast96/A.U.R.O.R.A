import React, { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useForm } from '../../../hooks/admin/useForm';
import { usePagination } from '../../../hooks/admin/usePagination';

import PageHeader from '../ui/PageHeader';
import StatsGrid from '../ui/StatsGrid';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import ConfirmationModal from '../ui/ConfirmationModal';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';
import ClientesFormModal from './employees/ClientesFormModal';

import { 
    Users, UserCheck, UserX, Trash2, Eye, Edit, Phone, Mail, MapPin, 
    Filter, X, ChevronDown, SortAsc, SortDesc, Calendar, User, 
    CreditCard, CheckCircle, Search
} from 'lucide-react';

// --- CONFIGURACIÓN ---
const API_URL = 'https://a-u-r-o-r-a.onrender.com/api/clientes';
const ITEMS_PER_PAGE = 10;

// Estados iniciales
const INITIAL_FILTERS = {
    estado: 'todos',
    edadMin: '',
    edadMax: '',
    departamento: 'todos',
    fechaDesde: '',
    fechaHasta: ''
};

const SORT_OPTIONS = [
    { value: 'fechaRegistro-desc', label: 'Más Recientes Primero', icon: Calendar },
    { value: 'fechaRegistro-asc', label: 'Más Antiguos Primero', icon: Calendar },
    { value: 'nombre-asc', label: 'Nombre A-Z', icon: User },
    { value: 'nombre-desc', label: 'Nombre Z-A', icon: User },
    { value: 'edad-asc', label: 'Edad: Menor a Mayor', icon: User },
    { value: 'edad-desc', label: 'Edad: Mayor a Menor', icon: User },
    { value: 'dui-asc', label: 'DUI: Ascendente', icon: CreditCard },
    { value: 'dui-desc', label: 'DUI: Descendente', icon: CreditCard },
];

const TABLE_COLUMNS = [
    { header: 'Cliente', key: 'cliente' },
    { header: 'DUI', key: 'dui' },
    { header: 'Contacto', key: 'contacto' },
    { header: 'Dirección', key: 'direccion' },
    { header: 'Estado', key: 'estado' },
    { header: 'Fecha Registro', key: 'fechaRegistro' },
    { header: 'Acciones', key: 'acciones' },
];

// --- COMPONENTE SKELETON LOADER MEMOIZADO ---
const SkeletonLoader = React.memo(() => (
    <div className="animate-pulse">
        {/* Skeleton para las estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {Array.from({ length: 3 }, (_, i) => (
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
                    <div className="h-10 bg-cyan-400 rounded w-32"></div>
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
                                    <th key={index} className="px-4 py-3">
                                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Array.from({ length: 5 }, (_, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td className="px-4 py-4 w-48">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                                                <div className="h-3 bg-gray-200 rounded w-16"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 w-32">
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </td>
                                    <td className="px-4 py-4 w-52">
                                        <div className="space-y-1">
                                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                                            <div className="h-3 bg-gray-200 rounded w-40"></div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 w-48">
                                        <div className="space-y-1">
                                            <div className="h-3 bg-gray-200 rounded w-36"></div>
                                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 w-24">
                                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                    </td>
                                    <td className="px-4 py-4 w-28">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    </td>
                                    <td className="px-4 py-4 w-32">
                                        <div className="flex space-x-1">
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

const Clientes = () => {
    // --- ESTADOS PRINCIPALES ---
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [alert, setAlert] = useState(null);
    
    // --- ESTADOS DE MODALES ---
    const [modals, setModals] = useState({
        addEdit: false,
        detail: false,
        delete: false
    });
    
    // --- ESTADOS DE FILTROS Y ORDENAMIENTO ---
    const [searchTerm, setSearchTerm] = useState('');
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [sortBy, setSortBy] = useState('fechaRegistro');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    // --- HOOK DE FORMULARIO ---
    const { formData, setFormData, handleInputChange, resetForm, validateForm, errors, setErrors } = useForm({
        nombre: '', apellido: '', edad: '', dui: '', telefono: '', correo: '', 
        departamento: '', ciudad: '', calle: '', estado: 'Activo', password: ''
    }, (data, isEditing) => {
        const newErrors = {};
        if (!data.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
        if (!data.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
        if (!data.edad || data.edad < 18 || data.edad > 100) newErrors.edad = 'La edad debe ser entre 18 y 100';
        if (!/^\d{8}-\d$/.test(data.dui)) newErrors.dui = 'DUI inválido (formato: 12345678-9)';
        if (!/^\+503[6-7]\d{7}$/.test(data.telefono)) newErrors.telefono = 'Teléfono inválido (formato: +503XXXXXXXX)';
        if (!/\S+@\S+\.\S+/.test(data.correo)) newErrors.correo = 'Email inválido';
        if (!data.calle.trim()) newErrors.calle = 'La dirección es requerida';
        if (!data.ciudad.trim()) newErrors.ciudad = 'La ciudad es requerida';
        if (!data.departamento.trim()) newErrors.departamento = 'El departamento es requerido';
        if (!isEditing && !data.password) newErrors.password = 'La contraseña es requerida';
        return newErrors;
    });

    // --- FUNCIÓN PARA OBTENER DATOS ---
    const fetchClientes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            const formattedData = response.data.map(c => ({
                ...c,
                fechaRegistro: new Date(c.createdAt).toLocaleDateString(),
                fechaRegistroRaw: new Date(c.createdAt),
            }));
            setClientes(formattedData);
        } catch (error) {
            showAlert('error', 'Error al cargar los clientes desde el servidor.');
            console.error('Error fetching clientes:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // --- EFECTO PARA CARGA INICIAL ---
    useEffect(() => {
        fetchClientes();
    }, [fetchClientes]);

    // --- FUNCIONES UTILITARIAS ---
    const showAlert = useCallback((type, message) => {
        setAlert({ type, message });
        const timer = setTimeout(() => setAlert(null), 5000);
        return () => clearTimeout(timer);
    }, []);

    const getEstadoColor = useCallback((estado) => (
        estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    ), []);

    const normalizeEstado = useCallback((estado) => estado?.toLowerCase() || '', []);

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
                    valueA = `${a.nombre} ${a.apellido}`.toLowerCase();
                    valueB = `${b.nombre} ${b.apellido}`.toLowerCase();
                    break;
                case 'edad':
                    valueA = parseInt(a.edad) || 0;
                    valueB = parseInt(b.edad) || 0;
                    break;
                case 'dui':
                    valueA = a.dui || '';
                    valueB = b.dui || '';
                    break;
                case 'estado':
                    valueA = normalizeEstado(a.estado);
                    valueB = normalizeEstado(b.estado);
                    break;
                case 'fechaRegistro':
                    valueA = a.fechaRegistroRaw || new Date(0);
                    valueB = b.fechaRegistroRaw || new Date(0);
                    break;
                default:
                    return 0;
            }

            if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [sortBy, sortOrder, normalizeEstado]);

    // --- FUNCIÓN PARA APLICAR FILTROS AVANZADOS ---
    const applyAdvancedFilters = useCallback((cliente) => {
        // Filtro por estado (corregido)
        if (filters.estado !== 'todos' && normalizeEstado(cliente.estado) !== filters.estado) {
            return false;
        }

        // Filtro por edad
        if (filters.edadMin && parseInt(cliente.edad) < parseInt(filters.edadMin)) {
            return false;
        }
        if (filters.edadMax && parseInt(cliente.edad) > parseInt(filters.edadMax)) {
            return false;
        }

        // Filtro por departamento
        if (filters.departamento !== 'todos') {
            const clienteDepartamento = cliente.direccion?.departamento?.toLowerCase() || '';
            if (clienteDepartamento !== filters.departamento.toLowerCase()) {
                return false;
            }
        }

        // Filtro por fecha de registro
        if (filters.fechaDesde) {
            const fechaDesde = new Date(filters.fechaDesde);
            if (cliente.fechaRegistroRaw < fechaDesde) {
                return false;
            }
        }
        if (filters.fechaHasta) {
            const fechaHasta = new Date(filters.fechaHasta);
            fechaHasta.setHours(23, 59, 59);
            if (cliente.fechaRegistroRaw > fechaHasta) {
                return false;
            }
        }

        return true;
    }, [filters, normalizeEstado]);

    // --- LÓGICA DE FILTRADO, ORDENAMIENTO Y PAGINACIÓN ---
    const filteredAndSortedClientes = useMemo(() => {
        const filtered = clientes.filter(cliente => {
            // Búsqueda por texto
            const search = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(search) ||
                cliente.dui?.includes(search) ||
                cliente.correo?.toLowerCase().includes(search) ||
                cliente.telefono?.includes(searchTerm);
            
            // Filtros avanzados
            const matchesAdvancedFilters = applyAdvancedFilters(cliente);
            
            return matchesSearch && matchesAdvancedFilters;
        });
        
        return sortData(filtered);
    }, [clientes, searchTerm, applyAdvancedFilters, sortData]);

    const { paginatedData: currentClientes, ...paginationProps } = usePagination(filteredAndSortedClientes, ITEMS_PER_PAGE);

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
               filters.estado !== 'todos' || 
               filters.edadMin || 
               filters.edadMax || 
               filters.departamento !== 'todos' || 
               filters.fechaDesde || 
               filters.fechaHasta;
    }, [searchTerm, filters]);

    // --- OBTENER DEPARTAMENTOS ÚNICOS ---
    const uniqueDepartments = useMemo(() => {
        const departments = clientes
            .map(c => c.direccion?.departamento)
            .filter(Boolean)
            .filter((dept, index, arr) => arr.indexOf(dept) === index);
        return departments.sort();
    }, [clientes]);

    // --- FUNCIONES PARA MANEJAR MODALES ---
    const handleCloseModals = useCallback(() => {
        setModals({ addEdit: false, detail: false, delete: false });
        setSelectedCliente(null);
        resetForm();
    }, [resetForm]);

    const handleOpenAddModal = useCallback(() => {
        resetForm();
        setErrors({});
        setSelectedCliente(null);
        setModals(prev => ({ ...prev, addEdit: true }));
    }, [resetForm, setErrors]);
    
    const handleOpenEditModal = useCallback((cliente) => {
        setSelectedCliente(cliente);
        const direccion = cliente.direccion || {};
        const formDataToSet = {
            nombre: cliente.nombre || '',
            apellido: cliente.apellido || '',
            edad: cliente.edad?.toString() || '',
            dui: cliente.dui || '',
            telefono: cliente.telefono || '',
            correo: cliente.correo || '',
            departamento: direccion.departamento || '',
            ciudad: direccion.ciudad || direccion.municipio || '',
            calle: direccion.calle || direccion.direccionDetallada || '',
            estado: cliente.estado || 'Activo',
            password: ''
        };
        setFormData(formDataToSet);
        setErrors({});
        setModals(prev => ({ ...prev, addEdit: true }));
    }, [setFormData, setErrors]);

    const handleOpenDetailModal = useCallback((cliente) => {
        setSelectedCliente(cliente);
        setModals(prev => ({ ...prev, detail: true }));
    }, []);

    const handleOpenDeleteModal = useCallback((cliente) => {
        setSelectedCliente(cliente);
        setModals(prev => ({ ...prev, delete: true }));
    }, []);
    
    // --- FUNCIÓN PARA ENVÍO DEL FORMULARIO ---
    const handleSubmit = useCallback(async () => {
        if (!validateForm(!!selectedCliente)) return;
        
        try {
            const dataToSend = {
                ...formData,
                direccion: {
                    departamento: formData.departamento,
                    ciudad: formData.ciudad,
                    calle: formData.calle
                }
            };
            
            // Limpiar campos que no van en el body
            const { departamento, ciudad, calle, ...cleanData } = dataToSend;

            if (selectedCliente) {
                await axios.put(`${API_URL}/${selectedCliente._id}`, cleanData);
                showAlert('success', '¡Cliente actualizado exitosamente!');
            } else {
                await axios.post(API_URL, cleanData);
                showAlert('success', '¡Cliente agregado exitosamente!');
            }
            
            await fetchClientes();
            handleCloseModals();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Ocurrió un error inesperado.';
            showAlert('error', errorMessage);
        }
    }, [formData, selectedCliente, validateForm, showAlert, fetchClientes, handleCloseModals]);
    
    // --- FUNCIÓN PARA ELIMINAR ---
    const handleDelete = useCallback(async () => {
        if (!selectedCliente) return;
        
        try {
            await axios.delete(`${API_URL}/${selectedCliente._id}`);
            showAlert('success', '¡Cliente eliminado exitosamente!');
            await fetchClientes();
            handleCloseModals();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Ocurrió un error inesperado.';
            showAlert('error', errorMessage);
        }
    }, [selectedCliente, showAlert, fetchClientes, handleCloseModals]);

    // --- FUNCIÓN PARA RENDERIZAR FILAS ---
    const renderRow = useCallback((cliente) => {
        const direccion = cliente.direccion || {};
        const calle = direccion.calle || 'No especificado';
        const ciudad = direccion.ciudad || direccion.municipio || 'No especificado';
        const departamento = direccion.departamento || 'No especificado';

        return (
            <>
                <td className="px-4 py-4 w-48">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-cyan-600 font-semibold text-sm">
                                {cliente.nombre?.charAt(0) || 'N'}{cliente.apellido?.charAt(0) || 'A'}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">
                                {cliente.nombre} {cliente.apellido}
                            </div>
                            <div className="text-sm text-gray-500">{cliente.edad} años</div>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-4 text-gray-600 font-mono text-sm w-32">{cliente.dui}</td>
                <td className="px-4 py-4 text-gray-600 text-sm w-52">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{cliente.telefono}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate" title={cliente.correo}>{cliente.correo}</span>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-4 text-gray-600 text-sm w-48">
                    <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <div className="truncate" title={calle}>{calle}</div>
                            <div className="text-gray-500 truncate" title={`${ciudad}, ${departamento}`}>
                                {ciudad}, {departamento}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-4 w-24">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cliente.estado)}`}>
                        {cliente.estado}
                    </span>
                </td>
                <td className="px-4 py-4 text-gray-600 text-sm w-28">{cliente.fechaRegistro}</td>
                <td className="px-4 py-4 w-32">
                    <div className="flex space-x-1">
                        <button 
                            onClick={() => handleOpenDeleteModal(cliente)} 
                            className="p-1.5 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" 
                            title="Eliminar"
                            aria-label={`Eliminar cliente ${cliente.nombre} ${cliente.apellido}`}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleOpenDetailModal(cliente)} 
                            className="p-1.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" 
                            title="Ver detalles"
                            aria-label={`Ver detalles de ${cliente.nombre} ${cliente.apellido}`}
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleOpenEditModal(cliente)} 
                            className="p-1.5 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" 
                            title="Editar"
                            aria-label={`Editar cliente ${cliente.nombre} ${cliente.apellido}`}
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </>
        );
    }, [getEstadoColor, handleOpenDeleteModal, handleOpenDetailModal, handleOpenEditModal]);

    // --- CÁLCULO DE ESTADÍSTICAS ---
    const stats = useMemo(() => [
        { title: 'Total Clientes', value: clientes.length, Icon: Users, color: 'cyan' },
        { title: 'Clientes Activos', value: clientes.filter(c => c.estado === 'Activo').length, Icon: UserCheck, color: 'green' },
        { title: 'Clientes Inactivos', value: clientes.filter(c => c.estado === 'Inactivo').length, Icon: UserX, color: 'red' },
    ], [clientes]);

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
                    <StatsGrid stats={stats} />
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <PageHeader 
                    title="Gestión de Clientes" 
                    buttonLabel="Añadir Cliente" 
                    onButtonClick={handleOpenAddModal} 
                />
                
                {/* BARRA DE BÚSQUEDA Y CONTROLES */}
                <div className="px-6 py-4 border-b bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                        {/* Barra de búsqueda */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                aria-label="Buscar clientes"
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
                                            filters.estado !== 'todos' && 1,
                                            filters.edadMin && 1,
                                            filters.edadMax && 1,
                                            filters.departamento !== 'todos' && 1,
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
                            {filteredAndSortedClientes.length} cliente{filteredAndSortedClientes.length !== 1 ? 's' : ''} 
                            {hasActiveFilters() && ` (filtrado${filteredAndSortedClientes.length !== 1 ? 's' : ''} de ${clientes.length})`}
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
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>

                                {/* Filtro por Rango de Edad */}
                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Edad</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.edadMin}
                                            onChange={(e) => handleFilterChange('edadMin', e.target.value)}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                            min="18"
                                            max="100"
                                            aria-label="Edad mínima"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.edadMax}
                                            onChange={(e) => handleFilterChange('edadMax', e.target.value)}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                            min="18"
                                            max="100"
                                            aria-label="Edad máxima"
                                        />
                                    </div>
                                </div>

                                {/* Filtro por Departamento */}
                                <div>
                                    <label htmlFor="filter-departamento" className="block text-sm font-medium text-gray-700 mb-2">
                                        Departamento
                                    </label>
                                    <select
                                        id="filter-departamento"
                                        value={filters.departamento}
                                        onChange={(e) => handleFilterChange('departamento', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    >
                                        <option value="todos">Todos los departamentos</option>
                                        {uniqueDepartments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
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
                            data={currentClientes}
                            renderRow={renderRow}
                            isLoading={false}
                            noDataMessage="No se encontraron clientes"
                            noDataSubMessage={hasActiveFilters() ? 'Intenta ajustar los filtros de búsqueda' : 'Comienza registrando tu primer cliente'}
                        />
                    </div>
                </div>
                
                <Pagination {...paginationProps} />
            </div>
            
            {/* MODALES */}
            {modals.addEdit && (
                <ClientesFormModal
                    isOpen={modals.addEdit}
                    onClose={handleCloseModals}
                    onSubmit={handleSubmit}
                    title={selectedCliente ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    errors={errors}
                    submitLabel={selectedCliente ? 'Actualizar Cliente' : 'Guardar Cliente'}
                    setFormData={setFormData}
                    selectedCliente={selectedCliente}
                />
            )}

            {selectedCliente && modals.detail && (
                <DetailModal
                    isOpen={modals.detail}
                    onClose={handleCloseModals}
                    title="Detalles del Cliente"
                    item={selectedCliente}
                    data={[
                        { label: "Nombre Completo", value: `${selectedCliente.nombre} ${selectedCliente.apellido}` },
                        { label: "DUI", value: selectedCliente.dui },
                        { label: "Edad", value: `${selectedCliente.edad} años` },
                        { label: "Teléfono", value: selectedCliente.telefono },
                        { label: "Correo Electrónico", value: selectedCliente.correo },
                        { 
                            label: "Dirección", 
                            value: `${selectedCliente.direccion?.calle || 'No especificado'}, ${selectedCliente.direccion?.ciudad || selectedCliente.direccion?.municipio || 'No especificado'}, ${selectedCliente.direccion?.departamento || 'No especificado'}` 
                        },
                        { label: "Fecha de Registro", value: selectedCliente.fechaRegistro },
                        { label: "Estado", value: selectedCliente.estado, color: getEstadoColor(selectedCliente.estado) },
                    ]}
                />
            )}

            <ConfirmationModal
                isOpen={modals.delete}
                onClose={handleCloseModals}
                onConfirm={handleDelete}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que deseas eliminar al cliente ${selectedCliente?.nombre} ${selectedCliente?.apellido}?`}
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

export default Clientes;