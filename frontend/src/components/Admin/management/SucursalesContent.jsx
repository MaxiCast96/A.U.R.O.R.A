import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { usePagination } from '../../../hooks/admin/usePagination';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import PageHeader from '../ui/PageHeader';
import StatsGrid from '../ui/StatsGrid';
import SucursalesFormModal from './employees/SucursalesFormModal';

import { 
    Users, Building2, CheckCircle, Search, Plus, Trash2, Eye, Edit, MapPin, 
    ChevronDown, SortAsc, SortDesc, Filter, X, Calendar, DollarSign, Phone, Mail
} from 'lucide-react';

// --- CONFIGURACIÓN ---
const API_URL = 'https://aurora-production-7e57.up.railway.app/api/sucursales';
const ITEMS_PER_PAGE = 10;

// Estados iniciales
const INITIAL_FILTERS = {
    estado: 'todos',
    departamento: 'todos',
    fechaDesde: '',
    fechaHasta: ''
};

const SORT_OPTIONS = [
    { value: 'nombre-asc', label: 'Nombre A-Z', icon: Building2 },
    { value: 'nombre-desc', label: 'Nombre Z-A', icon: Building2 },
    { value: 'fechaRegistro-desc', label: 'Más Recientes Primero', icon: Calendar },
    { value: 'fechaRegistro-asc', label: 'Más Antiguos Primero', icon: Calendar },
    { value: 'activo-asc', label: 'Estado: Activa Primero', icon: CheckCircle },
    { value: 'activo-desc', label: 'Estado: Inactiva Primero', icon: CheckCircle },
];

const TABLE_COLUMNS = [
    { header: 'Nombre', key: 'nombre' },
    { header: 'Dirección', key: 'direccion' },
    { header: 'Contacto', key: 'contacto' },
    { header: 'Estado', key: 'estado' },
    { header: 'Acciones', key: 'acciones' },
];

// --- COMPONENTE SKELETON LOADER MEMOIZADO ---
const SkeletonLoader = React.memo(() => (
    <div className="animate-pulse">
        {/* Skeleton para las estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
                                    <td className="px-4 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="space-y-1">
                                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                                            <div className="h-3 bg-gray-200 rounded w-40"></div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                    </td>
                                    <td className="px-4 py-4">
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

const SucursalesContent = () => {
    // --- ESTADOS PRINCIPALES ---
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSucursal, setSelectedSucursal] = useState(null);
    const [alert, setAlert] = useState(null);
    
    // --- ESTADOS DE MODALES ---
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
  
    // --- ESTADOS DE FILTROS Y ORDENAMIENTO ---
    const [searchTerm, setSearchTerm] = useState('');
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [sortBy, setSortBy] = useState('fechaRegistro');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    // Estados para el formulario - CORREGIDO PARA COINCIDIR CON SucursalesFormModal
    const [formData, setFormData] = useState({
        // Información General
        nombre: '',
        codigo: '',
        correo: '',
        telefono: '+503',
        
        // Ubicación
        departamento: '',
        municipio: '',
        direccion: '',
        
        // Información Operacional
        horarioApertura: '',
        horarioCierre: '',
        gerente: '',
        estado: 'Activa'
    });
    const [errors, setErrors] = useState({});

    // --- FUNCIÓN PARA OBTENER DATOS ---
    const fetchSucursales = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(API_URL);
            const data = await response.json();
      
            if (Array.isArray(data)) {
                const formattedData = data.map(s => ({
                    ...s,
                    fechaRegistro: new Date(s.createdAt).toLocaleDateString(),
                    fechaRegistroRaw: new Date(s.createdAt),
                }));
                setSucursales(formattedData);
            } else if (data.message) {
                showAlert('error', data.message);
            }
        } catch (error) {
            console.error('Error fetching sucursales:', error);
            showAlert('error', 'Error al cargar las sucursales');
        } finally {
            setLoading(false);
        }
    }, []);

    // --- EFECTO PARA CARGA INICIAL ---
    useEffect(() => {
        fetchSucursales();
    }, [fetchSucursales]);

    // --- FUNCIONES UTILITARIAS ---
    const showAlert = useCallback((type, message) => {
        setAlert({ type, message });
        const timer = setTimeout(() => setAlert(null), 5000);
        return () => clearTimeout(timer);
    }, []);

    const getEstadoColor = useCallback((activo) => (
        activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    ), []);

    const getEstadoText = useCallback((activo) => (
        activo ? 'Activa' : 'Inactiva'
    ), []);

    const formatDireccion = useCallback((direccion) => {
        if (!direccion) return 'No especificada';
        const { calle, ciudad, departamento } = direccion;
        return `${calle || ''}, ${ciudad || ''}, ${departamento || ''}`.replace(/(^,\s|,\s$)/g, '');
    }, []);

    // --- FUNCIÓN PARA VALIDAR EL FORMULARIO ---
    const validateForm = () => {
        const newErrors = {};

        // Información General
        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre de la sucursal es obligatorio';
        }
        
        if (!formData.codigo.trim()) {
            newErrors.codigo = 'El código de la sucursal es obligatorio';
        }
        
        if (!formData.correo.trim()) {
            newErrors.correo = 'El correo electrónico es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
            newErrors.correo = 'El formato del correo no es válido';
        }
        
        if (!formData.telefono || formData.telefono === '+503') {
            newErrors.telefono = 'El teléfono es obligatorio';
        } else if (!/^\+503[6-7]\d{7}$/.test(formData.telefono)) {
            newErrors.telefono = 'El formato del teléfono no es válido';
        }

        // Ubicación
        if (!formData.departamento.trim()) {
            newErrors.departamento = 'El departamento es obligatorio';
        }
        
        if (!formData.municipio.trim()) {
            newErrors.municipio = 'El municipio es obligatorio';
        }
        
        if (!formData.direccion.trim()) {
            newErrors.direccion = 'La dirección es obligatoria';
        }

        // Información Operacional
        if (!formData.horarioApertura) {
            newErrors.horarioApertura = 'El horario de apertura es obligatorio';
        }
        
        if (!formData.horarioCierre) {
            newErrors.horarioCierre = 'El horario de cierre es obligatorio';
        }
        
        if (!formData.gerente.trim()) {
            newErrors.gerente = 'El nombre del gerente es obligatorio';
        }
        
        if (!formData.estado) {
            newErrors.estado = 'El estado de la sucursal es obligatorio';
        }

        // Validación de horarios
        if (formData.horarioApertura && formData.horarioCierre) {
            const apertura = new Date(`1970-01-01T${formData.horarioApertura}:00`);
            const cierre = new Date(`1970-01-01T${formData.horarioCierre}:00`);
            
            if (apertura >= cierre) {
                newErrors.horarioCierre = 'El horario de cierre debe ser posterior al de apertura';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- FUNCIÓN PARA RESETEAR EL FORMULARIO ---
    const resetForm = () => {
        setFormData({
            nombre: '',
            codigo: '',
            correo: '',
            telefono: '+503',
            departamento: '',
            municipio: '',
            direccion: '',
            horarioApertura: '',
            horarioCierre: '',
            gerente: '',
            estado: 'Activa'
        });
        setErrors({});
    };

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
                    valueA = a.nombre.toLowerCase();
                    valueB = b.nombre.toLowerCase();
                    break;
                case 'activo':
                    valueA = a.activo;
                    valueB = b.activo;
                    if (valueA === valueB) return 0;
                    return sortOrder === 'asc' ? (valueA ? 1 : -1) : (valueA ? -1 : 1);
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
    }, [sortBy, sortOrder]);

    // --- FUNCIÓN PARA APLICAR FILTROS AVANZADOS ---
    const applyAdvancedFilters = useCallback((sucursal) => {
        const estadoFilter = filters.estado;
        if (estadoFilter !== 'todos') {
            const isActive = estadoFilter === 'activa';
            if (sucursal.activo !== isActive) {
                return false;
            }
        }

        if (filters.departamento !== 'todos') {
            const sucursalDepartamento = sucursal.direccion?.departamento?.toLowerCase() || '';
            if (sucursalDepartamento !== filters.departamento.toLowerCase()) {
                return false;
            }
        }

        if (filters.fechaDesde) {
            const fechaDesde = new Date(filters.fechaDesde);
            if (sucursal.fechaRegistroRaw < fechaDesde) {
                return false;
            }
        }
        if (filters.fechaHasta) {
            const fechaHasta = new Date(filters.fechaHasta);
            fechaHasta.setHours(23, 59, 59);
            if (sucursal.fechaRegistroRaw > fechaHasta) {
                return false;
            }
        }

        return true;
    }, [filters]);

    // --- LÓGICA DE FILTRADO, ORDENAMIENTO Y PAGINACIÓN ---
    const filteredAndSortedSucursales = useMemo(() => {
        const filtered = sucursales.filter(sucursal => {
            const search = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                sucursal.nombre.toLowerCase().includes(search) ||
                sucursal.correo.toLowerCase().includes(search) ||
                sucursal.telefono?.includes(searchTerm) ||
                sucursal.direccion?.calle?.toLowerCase().includes(search) ||
                sucursal.direccion?.ciudad?.toLowerCase().includes(search) ||
                sucursal.direccion?.departamento?.toLowerCase().includes(search);
            
            const matchesAdvancedFilters = applyAdvancedFilters(sucursal);
            
            return matchesSearch && matchesAdvancedFilters;
        });
        
        return sortData(filtered);
    }, [sucursales, searchTerm, applyAdvancedFilters, sortData]);

    const { paginatedData: currentSucursales, ...paginationProps } = usePagination(filteredAndSortedSucursales, ITEMS_PER_PAGE);

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
               filters.departamento !== 'todos' || 
               filters.fechaDesde || 
               filters.fechaHasta;
    }, [searchTerm, filters]);

    // --- OBTENER DEPARTAMENTOS ÚNICOS ---
    const uniqueDepartments = useMemo(() => {
        const departments = sucursales
            .map(s => s.direccion?.departamento)
            .filter(Boolean)
            .filter((dept, index, arr) => arr.indexOf(dept) === index);
        return departments.sort();
    }, [sucursales]);

    // --- FUNCIÓN PARA MANEJAR CAMBIOS EN EL FORMULARIO ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // API Functions
    const createSucursal = async (sucursalData) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sucursalData)
            });
      
            const data = await response.json();
      
            if (data.message === 'Sucursal guardada') {
                showAlert('success', 'Sucursal creada exitosamente');
                fetchSucursales();
                return true;
            } else {
                showAlert('error', data.message || 'Error al crear la sucursal');
                return false;
            }
        } catch (error) {
            console.error('Error creating sucursal:', error);
            showAlert('error', 'Error al crear la sucursal');
            return false;
        }
    };

    const updateSucursal = async (id, sucursalData) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sucursalData)
            });
      
            const data = await response.json();
      
            if (data.message === 'Sucursal actualizada') {
                showAlert('success', 'Sucursal actualizada exitosamente');
                fetchSucursales();
                return true;
            } else {
                showAlert('error', data.message || 'Error al actualizar la sucursal');
                return false;
            }
        } catch (error) {
            console.error('Error updating sucursal:', error);
            showAlert('error', 'Error al actualizar la sucursal');
            return false;
        }
    };

    const deleteSucursal = async (id) => {
        if (!window.confirm('¿Está seguro de que desea eliminar esta sucursal?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
      
            const data = await response.json();
      
            if (data.message === 'Sucursal eliminada') {
                showAlert('success', 'Sucursal eliminada exitosamente');
                fetchSucursales();
            } else {
                showAlert('error', data.message || 'Error al eliminar la sucursal');
            }
        } catch (error) {
            console.error('Error deleting sucursal:', error);
            showAlert('error', 'Error al eliminar la sucursal');
        }
    };

    // --- FUNCIÓN PARA ENVÍO DEL FORMULARIO ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Transformar los datos para que coincidan con la estructura del backend
        const dataToSend = {
            nombre: formData.nombre,
            codigo: formData.codigo,
            correo: formData.correo,
            telefono: formData.telefono,
            direccion: {
                calle: formData.direccion,
                ciudad: formData.municipio,
                departamento: formData.departamento
            },
            horarioApertura: formData.horarioApertura,
            horarioCierre: formData.horarioCierre,
            gerente: formData.gerente,
            activo: formData.estado === 'Activa'
        };

        let success = false;
        if (selectedSucursal) {
            success = await updateSucursal(selectedSucursal._id, dataToSend);
        } else {
            success = await createSucursal(dataToSend);
        }

        if (success) {
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
            setSelectedSucursal(null);
        }
    };

    // Modal handlers
    const handleAdd = () => {
        resetForm();
        setSelectedSucursal(null);
        setShowAddModal(true);
    };

    const handleEdit = (sucursal) => {
        setSelectedSucursal(sucursal);
        const direccion = sucursal.direccion || {};
        setFormData({
            // Información General
            nombre: sucursal.nombre || '',
            codigo: sucursal.codigo || '',
            correo: sucursal.correo || '',
            telefono: sucursal.telefono || '+503',
            
            // Ubicación
            departamento: direccion.departamento || '',
            municipio: direccion.ciudad || '', // Nota: backend usa 'ciudad', frontend usa 'municipio'
            direccion: direccion.calle || '',
            
            // Información Operacional
            horarioApertura: sucursal.horarioApertura || '',
            horarioCierre: sucursal.horarioCierre || '',
            gerente: sucursal.gerente || '',
            estado: sucursal.activo ? 'Activa' : 'Inactiva'
        });
        setShowEditModal(true);
    };

    const handleDetail = (sucursal) => {
        setSelectedSucursal(sucursal);
        setShowDetailModal(true);
    };

    // --- CÁLCULO DE ESTADÍSTICAS ---
    const stats = useMemo(() => [
        { title: 'Total Sucursales', value: sucursales.length, Icon: Building2, color: 'cyan' },
        { title: 'Sucursales Activas', value: sucursales.filter(s => s.activo).length, Icon: CheckCircle, color: 'cyan' },
        { title: 'Sucursales Inactivas', value: sucursales.filter(s => !s.activo).length, Icon: Building2, color: 'cyan' },
        { title: 'Resultados', value: filteredAndSortedSucursales.length, Icon: Search, color: 'cyan' },
    ], [sucursales, filteredAndSortedSucursales]);

    // --- FUNCIÓN PARA RENDERIZAR FILAS ---
    const renderRow = useCallback((sucursal) => (
        <>
            <td className="px-6 py-4">
                <div>
                    <div className="font-medium text-gray-900">{sucursal.nombre}</div>
                    <div className="text-sm text-gray-500">
                        Creada: {sucursal.fechaRegistro}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm text-gray-900 max-w-xs">
                    <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{formatDireccion(sucursal.direccion)}</span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm text-gray-900 space-y-1">
                    <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{sucursal.telefono}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="truncate">{sucursal.correo}</span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(sucursal.activo)}`}>
                    {getEstadoText(sucursal.activo)}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex space-x-2">
                    <button 
                        onClick={() => handleDetail(sucursal)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="Ver detalles"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleEdit(sucursal)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => deleteSucursal(sucursal._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </>
    ), [formatDireccion, getEstadoColor, getEstadoText, handleDetail, handleEdit, deleteSucursal]);

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
                    title="Gestión de Sucursales" 
                    buttonLabel="Añadir Sucursal" 
                    onButtonClick={handleAdd} 
                />
                
                {/* BARRA DE BÚSQUEDA Y CONTROLES */}
                <div className="px-6 py-4 border-b bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                        {/* Barra de búsqueda */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar sucursal..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                aria-label="Buscar sucursales"
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
                            {filteredAndSortedSucursales.length} sucursal{filteredAndSortedSucursales.length !== 1 ? 'es' : ''} 
                            {hasActiveFilters() && ` (filtrada${filteredAndSortedSucursales.length !== 1 ? 's' : ''} de ${sucursales.length})`}
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
                                        <option value="activa">Activa</option>
                                        <option value="inactiva">Inactiva</option>
                                    </select>
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
                                <div className="md:col-span-2 lg:col-span-1">
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
                            data={currentSucursales}
                            renderRow={renderRow}
                            isLoading={false}
                            noDataMessage="No se encontraron sucursales"
                            noDataSubMessage={hasActiveFilters() ? 'Intenta ajustar los filtros de búsqueda' : 'Comienza registrando tu primera sucursal'}
                        />
                    </div>
                </div>
                
                <Pagination {...paginationProps} />
            </div>

            {/* MODALES */}
            <SucursalesFormModal
                isOpen={showAddModal || showEditModal}
                onClose={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                    setSelectedSucursal(null);
                }}
                onSubmit={handleSubmit}
                title={selectedSucursal ? 'Editar Sucursal' : 'Agregar Nueva Sucursal'}
                formData={formData}
                handleInputChange={handleInputChange}
                errors={errors}
                submitLabel={selectedSucursal ? 'Actualizar Sucursal' : 'Crear Sucursal'}
                selectedSucursal={selectedSucursal}
            />

            <DetailModal
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedSucursal(null);
                }}
                title="Detalles de la Sucursal"
                item={selectedSucursal}
                data={selectedSucursal ? [
                    { label: 'Nombre', value: selectedSucursal.nombre },
                    { label: 'Código', value: selectedSucursal.codigo },
                    { label: 'Dirección', value: formatDireccion(selectedSucursal.direccion) },
                    { label: 'Teléfono', value: selectedSucursal.telefono },
                    { label: 'Correo', value: selectedSucursal.correo },
                    { label: 'Gerente', value: selectedSucursal.gerente },
                    { label: 'Horario', value: `${selectedSucursal.horarioApertura} - ${selectedSucursal.horarioCierre}` },
                    { 
                        label: 'Estado', 
                        value: getEstadoText(selectedSucursal.activo), 
                        color: getEstadoColor(selectedSucursal.activo) 
                    },
                    { 
                        label: 'Fecha de Creación', 
                        value: new Date(selectedSucursal.createdAt).toLocaleString() 
                    },
                    { 
                        label: 'Última Actualización', 
                        value: new Date(selectedSucursal.updatedAt).toLocaleString() 
                    }
                ] : []}
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

export default SucursalesContent;