import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { usePagination } from '../../../hooks/admin/usePagination';
import PageHeader from '../ui/PageHeader';
import StatsGrid from '../ui/StatsGrid';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import DetailModal from '../ui/DetailModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import RecetasFormModal from '../management/employees/RecetasFormModal';
import Alert from '../ui/Alert';

import { 
    Eye, Edit, Trash2, FileText, CheckCircle, Clock, Search, Filter, X, 
    ChevronDown, SortAsc, SortDesc, Calendar, User, UserCheck
} from 'lucide-react';


// --- CONFIGURACIÓN ---
const API_URL = 'https://aurora-production-7e57.up.railway.app/api';
const ITEMS_PER_PAGE = 10;

// Estados iniciales de filtros
const INITIAL_FILTERS = {
    estadoReceta: 'todos',
    optometristaId: 'todos',
    fechaDesde: '',
    fechaHasta: ''
};

// Opciones de ordenamiento
const SORT_OPTIONS = [
    { value: 'fecha-desc', label: 'Más Recientes Primero', icon: Calendar },
    { value: 'fecha-asc', label: 'Más Antiguas Primero', icon: Calendar },
    { value: 'cliente-asc', label: 'Cliente A-Z', icon: User },
    { value: 'cliente-desc', label: 'Cliente Z-A', icon: User },
    { value: 'diagnostico-asc', label: 'Diagnóstico A-Z', icon: FileText },
    { value: 'diagnostico-desc', label: 'Diagnóstico Z-A', icon: FileText },
    { value: 'optometrista-asc', label: 'Optometrista A-Z', icon: UserCheck },
    { value: 'optometrista-desc', label: 'Optometrista Z-A', icon: UserCheck },
];

// Columnas de la tabla
const TABLE_COLUMNS = [
    { header: 'Diagnóstico', key: 'diagnostico' },
    { header: 'Cliente', key: 'cliente' },
    { header: 'Optometrista', key: 'optometrista' },
    { header: 'Fecha', key: 'fecha' },
    { header: 'Estado', key: 'estado' },
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
                                <td className="px-6 py-4 w-48"><div className="h-4 bg-gray-200 rounded w-36"></div></td>
                                <td className="px-6 py-4 w-48"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                                <td className="px-6 py-4 w-48"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                                <td className="px-6 py-4 w-32"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                <td className="px-6 py-4 w-32"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                                <td className="px-6 py-4 w-36">
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


const Recetas = () => {
    // --- ESTADOS PRINCIPALES ---
    const [recetas, setRecetas] = useState([]);
    const [historialesMedicos, setHistorialesMedicos] = useState([]);
    const [optometristas, setOptometristas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReceta, setSelectedReceta] = useState(null);
    const [alert, setAlert] = useState(null);

    // --- ESTADOS DE MODALES ---
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // --- ESTADOS DE FILTROS Y ORDENAMIENTO ---
    const [searchTerm, setSearchTerm] = useState('');
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [sortBy, setSortBy] = useState('fecha');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    
    // --- ESTADO DE FORMULARIO ---
    const initialFormState = {
        historialMedicoId: '',
        optometristaId: '',
        diagnostico: '',
        ojoDerecho: { esfera: null, cilindro: null, eje: null, adicion: null },
        ojoIzquierdo: { esfera: null, cilindro: null, eje: null, adicion: null },
        observaciones: '',
        vigencia: 12,
    };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    // --- FETCH DE DATOS ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [recetasRes, historialesRes, optometristasRes] = await Promise.all([
                axios.get(`${API_URL}/recetas`),
                axios.get(`${API_URL}/historialMedico`),
                axios.get(`${API_URL}/optometrista`),
            ]);
            
            const formattedRecetas = (Array.isArray(recetasRes.data) ? recetasRes.data : []).map(r => ({
                ...r,
                fechaRaw: new Date(r.fecha),
                isVigente: new Date(new Date(r.fecha).setMonth(new Date(r.fecha).getMonth() + r.vigencia)) > new Date()
            }));

            setRecetas(formattedRecetas);
            setHistorialesMedicos(historialesRes.data || []);
            setOptometristas(optometristasRes.data || []);
        } catch (error) {
            showAlert('error', 'Error al cargar los datos desde el servidor.');
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- MANEJO DE ALERTA ---
    const showAlert = useCallback((type, message) => {
        setAlert({ type, message });
        const timer = setTimeout(() => setAlert(null), 5000);
        return () => clearTimeout(timer);
    }, []);

    // --- LÓGICA DE FILTRADO, ORDENAMIENTO ---
    const handleSortChange = useCallback((sortValue) => {
        const [field, order] = sortValue.split('-');
        setSortBy(field);
        setSortOrder(order);
        setShowSortDropdown(false);
    }, []);

    const sortData = useCallback((data) => {
        return [...data].sort((a, b) => {
            let valueA, valueB;
            switch (sortBy) {
                case 'fecha':
                    valueA = a.fechaRaw || new Date(0);
                    valueB = b.fechaRaw || new Date(0);
                    break;
                case 'cliente':
                    valueA = `${a.historialMedicoId?.clienteId?.nombre || ''} ${a.historialMedicoId?.clienteId?.apellido || ''}`.toLowerCase();
                    valueB = `${b.historialMedicoId?.clienteId?.nombre || ''} ${b.historialMedicoId?.clienteId?.apellido || ''}`.toLowerCase();
                    break;
                case 'diagnostico':
                    valueA = a.diagnostico?.toLowerCase() || '';
                    valueB = b.diagnostico?.toLowerCase() || '';
                    break;
                case 'optometrista':
                    valueA = `${a.optometristaId?.empleadoId?.nombre || ''} ${a.optometristaId?.empleadoId?.apellido || ''}`.toLowerCase();
                    valueB = `${b.optometristaId?.empleadoId?.nombre || ''} ${b.optometristaId?.empleadoId?.apellido || ''}`.toLowerCase();
                    break;
                default: return 0;
            }
            if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [sortBy, sortOrder]);

    const applyAdvancedFilters = useCallback((receta) => {
        if (filters.estadoReceta !== 'todos') {
            const estado = filters.estadoReceta === 'vigente';
            if (receta.isVigente !== estado) return false;
        }
        if (filters.optometristaId !== 'todos' && receta.optometristaId?._id !== filters.optometristaId) {
            return false;
        }
        if (filters.fechaDesde) {
            const fechaDesde = new Date(filters.fechaDesde);
            if (receta.fechaRaw < fechaDesde) return false;
        }
        if (filters.fechaHasta) {
            const fechaHasta = new Date(filters.fechaHasta);
            fechaHasta.setHours(23, 59, 59);
            if (receta.fechaRaw > fechaHasta) return false;
        }
        return true;
    }, [filters]);
    
    const filteredAndSortedRecetas = useMemo(() => {
        const filtered = recetas.filter(receta => {
            const search = searchTerm.toLowerCase();
            const clienteNombre = receta.historialMedicoId?.clienteId?.nombre?.toLowerCase() || '';
            const clienteApellido = receta.historialMedicoId?.clienteId?.apellido?.toLowerCase() || '';
            const optometristaNombre = receta.optometristaId?.empleadoId?.nombre?.toLowerCase() || '';
            const optometristaApellido = receta.optometristaId?.empleadoId?.apellido?.toLowerCase() || '';

            const matchesSearch = !searchTerm ||
                receta.diagnostico.toLowerCase().includes(search) ||
                `${clienteNombre} ${clienteApellido}`.includes(search) ||
                `${optometristaNombre} ${optometristaApellido}`.includes(search);
            
            const matchesAdvancedFilters = applyAdvancedFilters(receta);
            return matchesSearch && matchesAdvancedFilters;
        });
        return sortData(filtered);
    }, [recetas, searchTerm, applyAdvancedFilters, sortData]);
    
    const { paginatedData: currentRecetas, ...paginationProps } = usePagination(filteredAndSortedRecetas, ITEMS_PER_PAGE);

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearAllFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
        setSearchTerm('');
    }, []);

    const hasActiveFilters = useCallback(() => {
        return searchTerm || 
               filters.estadoReceta !== 'todos' || 
               filters.optometristaId !== 'todos' || 
               filters.fechaDesde || 
               filters.fechaHasta;
    }, [searchTerm, filters]);


    // --- MANEJO DE FORMULARIO ---
    const handleInputChange = useCallback((e) => {
        const { name, value, type } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev, [parent]: { ...prev[parent], [child]: type === 'number' ? (value === '' ? null : Number(value)) : value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? null : Number(value)) : value }));
        }
    }, []);

    const resetForm = () => setFormData(initialFormState);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.historialMedicoId) newErrors.historialMedicoId = 'Debe seleccionar un cliente.';
        if (!formData.optometristaId) newErrors.optometristaId = 'Debe seleccionar un optometrista.';
        if (!formData.diagnostico.trim()) newErrors.diagnostico = 'El diagnóstico es requerido.';
        if (!formData.vigencia || formData.vigencia <= 0) newErrors.vigencia = 'La vigencia debe ser un número positivo.';
        
        const requiredEyeFields = ['esfera', 'cilindro', 'eje'];
        requiredEyeFields.forEach(field => {
            if (formData.ojoDerecho[field] === null || formData.ojoDerecho[field] === '') newErrors[`ojoDerecho.${field}`] = 'Requerido';
            if (formData.ojoIzquierdo[field] === null || formData.ojoIzquierdo[field] === '') newErrors[`ojoIzquierdo.${field}`] = 'Requerido';
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // --- MANEJO DE MODALES ---
    const handleCloseModals = () => {
        setShowAddEditModal(false);
        setShowDetailModal(false);
        setShowDeleteModal(false);
        setSelectedReceta(null);
        resetForm();
    };

    const handleOpenAddModal = () => {
        resetForm();
        setErrors({});
        setSelectedReceta(null);
        setShowAddEditModal(true);
    };

    const handleOpenEditModal = (receta) => {
        setSelectedReceta(receta);
        const formValues = {
            ...initialFormState, ...receta,
            historialMedicoId: receta.historialMedicoId?._id || receta.historialMedicoId,
            optometristaId: receta.optometristaId?._id || receta.optometristaId,
            ojoDerecho: { ...initialFormState.ojoDerecho, ...receta.ojoDerecho },
            ojoIzquierdo: { ...initialFormState.ojoIzquierdo, ...receta.ojoIzquierdo },
        };
        setFormData(formValues);
        setErrors({});
        setShowAddEditModal(true);
    };
    
    const handleOpenDetailModal = (receta) => {
        setSelectedReceta(receta);
        setShowDetailModal(true);
    };

    const handleOpenDeleteModal = (receta) => {
        setSelectedReceta(receta);
        setShowDeleteModal(true);
    };

    // --- ACCIONES CRUD ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showAlert('error', 'Por favor, completa todos los campos requeridos.');
            return;
        }

        const endpoint = selectedReceta ? `${API_URL}/recetas/${selectedReceta._id}` : `${API_URL}/recetas`;
        const method = selectedReceta ? 'put' : 'post';
        
        try {
            await axios[method](endpoint, formData);
            showAlert('success', `¡Receta ${selectedReceta ? 'actualizada' : 'creada'} exitosamente!`);
            fetchData();
            handleCloseModals();
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Ocurrió un error inesperado.');
        }
    };

    const handleDelete = async () => {
        if (!selectedReceta) return;
        try {
            await axios.delete(`${API_URL}/recetas/${selectedReceta._id}`);
            showAlert('success', '¡Receta eliminada exitosamente!');
            fetchData();
            handleCloseModals();
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Ocurrió un error inesperado.');
        }
    };
    
    const renderRow = (receta) => {
        const cliente = receta.historialMedicoId?.clienteId;
        const optometrista = receta.optometristaId?.empleadoId;
        return (
            <>
                <td className="px-6 py-4 font-medium text-gray-900">{receta.diagnostico}</td>
                <td className="px-6 py-4 text-gray-600">{cliente ? `${cliente.nombre} ${cliente.apellido}` : 'N/A'}</td>
                <td className="px-6 py-4 text-gray-600">{optometrista ? `${optometrista.nombre} ${optometrista.apellido}` : 'N/A'}</td>
                <td className="px-6 py-4 text-gray-600">{new Date(receta.fecha).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${receta.isVigente ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {receta.isVigente ? 'Vigente' : 'Vencida'}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex space-x-1">
                        <button onClick={() => handleOpenDeleteModal(receta)} className="p-1.5 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                        <button onClick={() => handleOpenDetailModal(receta)} className="p-1.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" title="Ver detalles"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleOpenEditModal(receta)} className="p-1.5 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" title="Editar"><Edit className="w-4 h-4" /></button>
                    </div>
                </td>
            </>
        );
    }
    
    const stats = useMemo(() => {
        const vigentes = recetas.filter(r => r.isVigente).length;
        return [
            { title: 'Total Recetas', value: recetas.length, Icon: FileText, color: 'blue' },
            { title: 'Recetas Vigentes', value: vigentes, Icon: CheckCircle, color: 'green' },
            { title: 'Recetas Vencidas', value: recetas.length - vigentes, Icon: Clock, color: 'red' },
        ];
    }, [recetas]);

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
            <StatsGrid stats={stats} />

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <PageHeader title="Gestión de Recetas" buttonLabel="Añadir Receta" onButtonClick={handleOpenAddModal} />

                {/* BARRA DE BÚSQUEDA Y CONTROLES */}
                <div className="px-6 py-4 border-b bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por diagnóstico, cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <button
                                    onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFiltersPanel(false); }}
                                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                                                        className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${isActive ? 'bg-cyan-50 text-cyan-600 font-medium' : 'text-gray-700'}`}
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
                            <button
                                onClick={() => { setShowFiltersPanel(!showFiltersPanel); setShowSortDropdown(false); }}
                                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all duration-200 ${hasActiveFilters() ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                            >
                                <Filter className="w-4 h-4" />
                                <span className="text-sm font-medium">Filtros</span>
                            </button>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                        <span>{filteredAndSortedRecetas.length} resultado{filteredAndSortedRecetas.length !== 1 ? 's' : ''}</span>
                        {hasActiveFilters() && (
                            <button onClick={clearAllFilters} className="text-cyan-600 hover:text-cyan-800 font-medium flex items-center space-x-1">
                                <X className="w-4 h-4" /><span>Limpiar filtros</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* PANEL DE FILTROS */}
                {showFiltersPanel && (
                    <div className="border-b bg-white">
                        <div className="px-6 py-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
                                <button onClick={() => setShowFiltersPanel(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado Receta</label>
                                    <select value={filters.estadoReceta} onChange={(e) => handleFilterChange('estadoReceta', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option value="todos">Todas</option>
                                        <option value="vigente">Vigente</option>
                                        <option value="vencida">Vencida</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Optometrista</label>
                                    <select value={filters.optometristaId} onChange={(e) => handleFilterChange('optometristaId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option value="todos">Todos</option>
                                        {optometristas.map(op => (
                                            <option key={op._id} value={op._id}>{op.empleadoId?.nombre} {op.empleadoId?.apellido}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Receta</label>
                                    <div className="flex space-x-2">
                                        <input type="date" value={filters.fechaDesde} onChange={(e) => handleFilterChange('fechaDesde', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                        <input type="date" value={filters.fechaHasta} onChange={(e) => handleFilterChange('fechaHasta', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <DataTable
                    columns={TABLE_COLUMNS}
                    data={currentRecetas}
                    renderRow={renderRow}
                    isLoading={loading}
                    noDataMessage={hasActiveFilters() ? "No se encontraron recetas con los filtros aplicados" : "No hay recetas registradas"}
                />
                <Pagination {...paginationProps} />
            </div>

            {showAddEditModal && (
                <RecetasFormModal
                    isOpen={showAddEditModal}
                    onClose={handleCloseModals}
                    onSubmit={handleSubmit}
                    title={selectedReceta ? 'Editar Receta' : 'Nueva Receta'}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    errors={errors}
                    submitLabel={selectedReceta ? 'Actualizar Receta' : 'Guardar Receta'}
                    historialesMedicos={historialesMedicos}
                    optometristas={optometristas}
                />
            )}

            {selectedReceta && showDetailModal && (
                 <DetailModal
                    isOpen={showDetailModal}
                    onClose={handleCloseModals}
                    title="Detalles de la Receta"
                    item={selectedReceta}
                    data={[
                        { label: 'Diagnóstico', value: selectedReceta.diagnostico },
                        { label: 'Cliente', value: `${selectedReceta.historialMedicoId?.clienteId?.nombre || ''} ${selectedReceta.historialMedicoId?.clienteId?.apellido || ''}`.trim() || 'N/A' },
                        { label: 'Optometrista', value: `${selectedReceta.optometristaId?.empleadoId?.nombre || ''} ${selectedReceta.optometristaId?.empleadoId?.apellido || ''}`.trim() || 'N/A' },
                        { label: 'Fecha', value: new Date(selectedReceta.fecha).toLocaleDateString() },
                        { label: 'Vigencia', value: `${selectedReceta.vigencia} meses` },
                        { label: 'Estado', value: selectedReceta.isVigente ? 'Vigente' : 'Vencida', color: selectedReceta.isVigente ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' },
                        { label: 'Ojo Derecho', value: `Esf: ${selectedReceta.ojoDerecho.esfera}, Cil: ${selectedReceta.ojoDerecho.cilindro}, Eje: ${selectedReceta.ojoDerecho.eje}, Ad: ${selectedReceta.ojoDerecho.adicion}` },
                        { label: 'Ojo Izquierdo', value: `Esf: ${selectedReceta.ojoIzquierdo.esfera}, Cil: ${selectedReceta.ojoIzquierdo.cilindro}, Eje: ${selectedReceta.ojoIzquierdo.eje}, Ad: ${selectedReceta.ojoIzquierdo.adicion}` },
                        { label: 'Observaciones', value: selectedReceta.observaciones || 'Sin observaciones' },
                    ]}
                />
            )}

            {showDeleteModal && (
                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={handleCloseModals}
                    onConfirm={handleDelete}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que deseas eliminar la receta con diagnóstico "${selectedReceta?.diagnostico}"?`}
                />
            )}

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

export default Recetas;