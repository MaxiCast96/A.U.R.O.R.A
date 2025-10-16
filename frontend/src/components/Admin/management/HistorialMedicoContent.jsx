import React, { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Users, UserCheck, Eye, FileText, Receipt, Search, Plus, Trash2, Edit, Clock,
    Phone, Mail, MapPin, Filter, X, ChevronDown, SortAsc, SortDesc, Calendar, CheckCircle
} from 'lucide-react';

// --- CONFIGURACIÓN ---
const API_URL = 'https://aurora-production-7e57.up.railway.app/api';

// Estados iniciales de filtros
const INITIAL_FILTERS = {
    tipoPadecimiento: 'todos',
    fechaDesde: '',
    fechaHasta: ''
};

// Opciones de ordenamiento
const SORT_OPTIONS = [
    { value: 'cliente-asc', label: 'Cliente A-Z', icon: Users },
    { value: 'cliente-desc', label: 'Cliente Z-A', icon: Users },
    { value: 'fechaDeteccion-desc', label: 'Detección Más Reciente', icon: Calendar },
    { value: 'fechaDeteccion-asc', label: 'Detección Más Antigua', icon: Calendar },
    { value: 'diagnostico-asc', label: 'Diagnóstico A-Z', icon: FileText },
    { value: 'diagnostico-desc', label: 'Diagnóstico Z-A', icon: FileText },
];

// Columnas de la tabla
const TABLE_COLUMNS = [
    { header: 'Cliente', key: 'cliente' },
    { header: 'Padecimiento', key: 'padecimiento' },
    { header: 'Diagnóstico Visual', key: 'diagnostico' },
    { header: 'Fecha Detección', key: 'fechaDeteccion' },
    { header: 'Acciones', key: 'acciones' },
];

// Helper para formatear fechas a YYYY-MM-DD para inputs type="date"
const toYMD = (val) => {
    if (!val) return '';
    try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return '';
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    } catch { return ''; }
};

const initialFormState = {
    clienteId: '',
    padecimientos: {
        tipo: '',
        descripcion: '',
        fechaDeteccion: ''
    },
    historialVisual: {
        fecha: '',
        diagnostico: '',
        receta: {
            ojoDerecho: { esfera: '', cilindro: '', eje: '', adicion: '' },
            ojoIzquierdo: { esfera: '', cilindro: '', eje: '', adicion: '' }
        }
    }
};

// --- COMPONENTE ALERT ---
const Alert = ({ type = 'success', message = '', onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!message) return;
        
        setIsVisible(true);
        
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                onClose && onClose();
            }, 300);
        }, 5000);
        
        return () => clearTimeout(timer);
    }, [message, onClose]);

    if (!message) return null;

    const configs = {
        success: {
            bg: 'bg-emerald-500',
            iconBg: 'bg-emerald-400',
            icon: <CheckCircle className="w-6 h-6 text-white" strokeWidth={2.5} />,
            shadow: 'rgba(16, 185, 129, 0.25)'
        },
        error: {
            bg: 'bg-rose-500',
            iconBg: 'bg-rose-400',
            icon: <CheckCircle className="w-6 h-6 text-white" strokeWidth={2.5} />,
            shadow: 'rgba(244, 63, 94, 0.25)'
        },
        info: {
            bg: 'bg-blue-500',
            iconBg: 'bg-blue-400',
            icon: <CheckCircle className="w-6 h-6 text-white" strokeWidth={2.5} />,
            shadow: 'rgba(59, 130, 246, 0.25)'
        },
        delete: {
            bg: 'bg-orange-500',
            iconBg: 'bg-orange-400',
            icon: <Trash2 className="w-6 h-6 text-white" strokeWidth={2.5} />,
            shadow: 'rgba(249, 115, 22, 0.25)'
        }
    };

    const config = configs[type] || configs.success;

    return (
        <div className="fixed top-0 left-0 right-0 flex justify-center px-4 pt-6 pointer-events-none" style={{ zIndex: 9999 }}>
            <div
                className={`pointer-events-auto relative flex items-center gap-4 px-6 py-4 rounded-2xl ${config.bg} text-white shadow-2xl transform transition-all duration-300 ease-out ${
                    isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
                }`}
                style={{
                    boxShadow: `0 20px 60px -12px ${config.shadow}, 0 8px 24px -8px rgba(0, 0, 0, 0.2)`,
                    maxWidth: '480px',
                    minWidth: '320px'
                }}
            >
                {/* Icono con fondo */}
                <div className={`flex-shrink-0 p-2 rounded-xl ${config.iconBg}`}>
                    {config.icon}
                </div>
                
                {/* Mensaje */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-relaxed tracking-wide">
                        {message}
                    </p>
                </div>
                
                {/* Botón cerrar */}
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(() => onClose && onClose(), 300);
                    }}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/20 active:bg-white/30 transition-all duration-200 transform hover:scale-110 active:scale-95"
                    aria-label="Cerrar notificación"
                >
                    <X className="w-5 h-5 text-white" strokeWidth={2.5} />
                </button>

                {/* Barra de progreso */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-2xl overflow-hidden">
                    <div 
                        className="h-full bg-white/30 animate-shrink origin-left"
                        style={{
                            animation: isVisible ? 'shrink 5s linear forwards' : 'none'
                        }}
                    ></div>
                </div>
            </div>

            <style>{`
                @keyframes shrink {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }
            `}</style>
        </div>
    );
};

// --- COMPONENTE SKELETON LOADER MEMOIZADO ---
const SkeletonLoader = React.memo(() => (
    <div className="animate-pulse">
        {/* Skeleton para la tabla */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-cyan-500 to-cyan-600">
                <div className="flex justify-between items-center">
                    <div className="h-6 bg-cyan-400 rounded w-48"></div>
                    <div className="h-10 bg-cyan-400 rounded w-36"></div>
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
                    <thead className="bg-gray-100">
                        <tr>
                            {TABLE_COLUMNS.map((_, index) => (
                                <th key={index} className="px-6 py-3">
                                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from({ length: 5 }, (_, rowIndex) => (
                            <tr key={rowIndex}>
                                <td className="px-6 py-4 w-56">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 w-48">
                                    <div className="h-4 bg-gray-200 rounded w-36 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-40"></div>
                                </td>
                                <td className="px-6 py-4 w-48">
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                </td>
                                <td className="px-6 py-4 w-40">
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                </td>
                                <td className="px-6 py-4 w-32">
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


const HistorialMedicoContent = () => {
    // --- ESTADOS PRINCIPALES ---
    const [historiales, setHistoriales] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [formData, setFormData] = useState(initialFormState);

    // --- ESTADOS DE MODALES ---
    const [showAddModal, setShowAddModal] = useState(false);
    const [showClienteModal, setShowClienteModal] = useState(false);
    const [clienteDetalle, setClienteDetalle] = useState(null);
    const [recetasCliente, setRecetasCliente] = useState([]);
    const [historialesCliente, setHistorialesCliente] = useState([]);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [editHistorial, setEditHistorial] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
    const [overwriteTarget, setOverwriteTarget] = useState(null);
    
    // --- ESTADOS DE FILTROS Y ORDENAMIENTO ---
    const [searchTerm, setSearchTerm] = useState('');
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [sortBy, setSortBy] = useState('fechaDeteccion');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    // --- FUNCIÓN PARA OBTENER DATOS ---
    const fetchHistoriales = useCallback(async () => {
        setLoading(true);
        try {
            const [historialesRes, clientesRes] = await Promise.all([
                axios.get(`${API_URL}/historialMedico`),
                axios.get(`${API_URL}/clientes`)
            ]);
            
            const formattedData = historialesRes.data.map(h => ({
                ...h,
                fechaDeteccionRaw: new Date(h.padecimientos?.fechaDeteccion),
                fechaDiagnosticoRaw: new Date(h.historialVisual?.fecha),
            }));

            setHistoriales(formattedData || []);
            setClientes(clientesRes.data || []);
        } catch (err) {
            showAlert('error', 'Error al cargar los datos desde el servidor.');
        } finally {
            setLoading(false);
        }
    }, []);

    // --- EFECTO PARA CARGA INICIAL ---
    useEffect(() => {
        fetchHistoriales();
    }, [fetchHistoriales]);

    // Set de clientes que ya tienen historial
    const clientesConHistorial = useMemo(() => 
        new Set(historiales.map(h => (h.clienteId?._id || h.clienteId)).filter(Boolean)),
    [historiales]);

    // --- FUNCIONES UTILITARIAS ---
    const showAlert = useCallback((type, message) => {
        setAlert({ type, message });
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
                case 'cliente':
                    valueA = `${a.clienteId?.nombre || ''} ${a.clienteId?.apellido || ''}`.toLowerCase();
                    valueB = `${b.clienteId?.nombre || ''} ${b.clienteId?.apellido || ''}`.toLowerCase();
                    break;
                case 'fechaDeteccion':
                    valueA = a.fechaDeteccionRaw || new Date(0);
                    valueB = b.fechaDeteccionRaw || new Date(0);
                    break;
                case 'diagnostico':
                    valueA = a.historialVisual?.diagnostico?.toLowerCase() || '';
                    valueB = b.historialVisual?.diagnostico?.toLowerCase() || '';
                    break;
                default:
                    return 0;
            }

            if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [sortBy, sortOrder]);

    const applyAdvancedFilters = useCallback((historial) => {
        if (filters.tipoPadecimiento !== 'todos' && (historial.padecimientos?.tipo?.toLowerCase() || '') !== filters.tipoPadecimiento) {
            return false;
        }
        if (filters.fechaDesde) {
            const fechaDesde = new Date(filters.fechaDesde);
            if (historial.fechaDeteccionRaw < fechaDesde) return false;
        }
        if (filters.fechaHasta) {
            const fechaHasta = new Date(filters.fechaHasta);
            fechaHasta.setHours(23, 59, 59);
            if (historial.fechaDeteccionRaw > fechaHasta) return false;
        }
        return true;
    }, [filters]);

    const filteredAndSortedHistoriales = useMemo(() => {
        const filtered = historiales.filter(historial => {
            const search = searchTerm.toLowerCase();
            const cliente = historial.clienteId;
            const matchesSearch = !searchTerm ||
                (cliente && `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(search)) ||
                historial.padecimientos?.tipo?.toLowerCase().includes(search) ||
                historial.historialVisual?.diagnostico?.toLowerCase().includes(search);
            
            const matchesAdvancedFilters = applyAdvancedFilters(historial);
            return matchesSearch && matchesAdvancedFilters;
        });
        return sortData(filtered);
    }, [historiales, searchTerm, applyAdvancedFilters, sortData]);
    
    // --- FUNCIONES PARA MANEJAR FILTROS ---
    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearAllFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
        setSearchTerm('');
    }, []);

    const hasActiveFilters = useCallback(() => {
        return searchTerm || 
               filters.tipoPadecimiento !== 'todos' || 
               filters.fechaDesde || 
               filters.fechaHasta;
    }, [searchTerm, filters]);

    const uniquePadecimientos = useMemo(() => {
        const padecimientos = historiales
            .map(h => h.padecimientos?.tipo)
            .filter(Boolean)
            .map(p => p.toLowerCase())
            .filter((p, index, arr) => arr.indexOf(p) === index);
        return padecimientos.sort();
    }, [historiales]);

    // Handlers para formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('padecimientos.')) {
            const key = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                padecimientos: { ...prev.padecimientos, [key]: value }
            }));
        } else if (name.startsWith('historialVisual.receta.ojoDerecho.')) {
            const key = name.split('.')[3];
            setFormData(prev => ({
                ...prev,
                historialVisual: {
                    ...prev.historialVisual,
                    receta: {
                        ...prev.historialVisual.receta,
                        ojoDerecho: {
                            ...prev.historialVisual.receta.ojoDerecho,
                            [key]: value
                        }
                    }
                }
            }));
        } else if (name.startsWith('historialVisual.receta.ojoIzquierdo.')) {
            const key = name.split('.')[3];
            setFormData(prev => ({
                ...prev,
                historialVisual: {
                    ...prev.historialVisual,
                    receta: {
                        ...prev.historialVisual.receta,
                        ojoIzquierdo: {
                            ...prev.historialVisual.receta.ojoIzquierdo,
                            [key]: value
                        }
                    }
                }
            }));
        } else if (name.startsWith('historialVisual.')) {
            const key = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                historialVisual: { ...prev.historialVisual, [key]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveHistorial = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editHistorial && editHistorial._id) {
                await axios.put(`${API_URL}/historialMedico/${editHistorial._id}`, formData);
                showAlert('success', 'Historial médico actualizado exitosamente.');
            } else {
                const existing = historiales.find(h => (h.clienteId?._id || h.clienteId) === formData.clienteId);
                if (existing) {
                    setOverwriteTarget(existing);
                    setShowOverwriteConfirm(true);
                    setLoading(false);
                    return;
                }
                await axios.post(`${API_URL}/historialMedico`, formData);
                showAlert('success', 'Historial médico creado exitosamente.');
            }
            setShowAddModal(false);
            setEditHistorial(null);
            setFormData(initialFormState);
            await fetchHistoriales();
        } catch (err) {
            showAlert('error', 'Error al guardar historial médico.');
        } finally {
            setLoading(false);
        }
    };
    
    const confirmOverwrite = async () => {
        if (!overwriteTarget?._id) {
            setShowOverwriteConfirm(false);
            return;
        }
        setLoading(true);
        try {
            await axios.put(`${API_URL}/historialMedico/${overwriteTarget._id}`, formData);
            showAlert('success', 'Se sobrescribió el expediente existente del cliente.');
            setShowOverwriteConfirm(false);
            setShowAddModal(false);
            setEditHistorial(null);
            setFormData(initialFormState);
            await fetchHistoriales();
        } catch (err) {
            showAlert('error', 'Error al sobrescribir el expediente.');
        } finally {
            setLoading(false);
        }
    };

    const handleShowCliente = async (cliente) => {
        setClienteDetalle(cliente);
        const historialesDeCliente = historiales.filter(h => h.clienteId && h.clienteId._id === cliente._id);
        setHistorialesCliente(historialesDeCliente);
        
        let recetas = [];
        for (const historial of historialesDeCliente) {
            try {
                const res = await axios.get(`${API_URL}/recetas/historial/${historial._id}`);
                if (Array.isArray(res.data)) {
                    recetas = recetas.concat(res.data.map(r => ({...r, historialId: historial._id})));
                }
            } catch {}
        }
        setRecetasCliente(recetas);
        setShowClienteModal(true);
    };

    const handleView = (data, tipo) => {
        setDetailData({ ...data, tipo });
        setShowDetailModal(true);
    };

    const handleEditHistorial = (historial) => {
        setShowClienteModal(false);
        setEditHistorial(historial);
        setShowAddModal(true);
        setFormData({
            clienteId: historial.clienteId?._id || '',
            padecimientos: {
                tipo: historial.padecimientos?.tipo || '',
                descripcion: historial.padecimientos?.descripcion || '',
                fechaDeteccion: toYMD(historial.padecimientos?.fechaDeteccion)
            },
            historialVisual: {
                fecha: toYMD(historial.historialVisual?.fecha),
                diagnostico: historial.historialVisual?.diagnostico || '',
                receta: {
                    ojoDerecho: {
                        esfera: historial.historialVisual?.receta?.ojoDerecho?.esfera || '',
                        cilindro: historial.historialVisual?.receta?.ojoDerecho?.cilindro || '',
                        eje: historial.historialVisual?.receta?.ojoDerecho?.eje || '',
                        adicion: historial.historialVisual?.receta?.ojoDerecho?.adicion || ''
                    },
                    ojoIzquierdo: {
                        esfera: historial.historialVisual?.receta?.ojoIzquierdo?.esfera || '',
                        cilindro: historial.historialVisual?.receta?.ojoIzquierdo?.cilindro || '',
                        eje: historial.historialVisual?.receta?.ojoIzquierdo?.eje || '',
                        adicion: historial.historialVisual?.receta?.ojoIzquierdo?.adicion || ''
                    }
                }
            }
        });
    };

    const handleEditReceta = (receta) => {
        setShowClienteModal(false);
        window.localStorage.setItem('editRecetaId', receta._id);
        const evt = new CustomEvent('goToRecetasAndEdit');
        window.dispatchEvent(evt);
    };

    const handleDelete = (target, tipo) => {
        setDeleteTarget({ ...target, tipo });
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            if (deleteTarget.tipo === 'historial') {
                await axios.delete(`${API_URL}/historialMedico/${deleteTarget._id}`);
                await fetchHistoriales(); // Refetch all data
                setHistorialesCliente(prev => prev.filter(h => h._id !== deleteTarget._id));
                showAlert('success', 'Historial eliminado exitosamente.');
            } else if (deleteTarget.tipo === 'receta') {
                await axios.delete(`${API_URL}/recetas/${deleteTarget._id}`);
                setRecetasCliente(prev => prev.filter(r => r._id !== deleteTarget._id));
                showAlert('success', 'Receta eliminada exitosamente.');
            }
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
        } catch (err) {
            showAlert('error', 'Error al eliminar.');
        }
    };


    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Alert 
                    type={alert?.type} 
                    message={alert?.message} 
                    onClose={() => setAlert(null)} 
                />
                <SkeletonLoader />
            </div>
        );
    }
    
    return (
        <div className="space-y-6 animate-fade-in">
            <Alert 
                type={alert?.type} 
                message={alert?.message} 
                onClose={() => setAlert(null)} 
            />

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Historial Médico</h2>
                    <button
                        onClick={() => { setEditHistorial(null); setFormData(initialFormState); setShowAddModal(true); }}
                        className="bg-white text-cyan-600 px-4 py-2 rounded-lg hover:bg-cyan-50 transition-colors flex items-center space-x-2 shadow-sm font-semibold"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Añadir Historial</span>
                    </button>
                </div>

                {/* BARRA DE BÚSQUEDA Y CONTROLES */}
                <div className="px-6 py-4 border-b bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por cliente, padecimiento..."
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
                                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all duration-200 ${
                                    hasActiveFilters() 
                                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg' 
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <Filter className="w-4 h-4" />
                                <span className="text-sm font-medium">Filtros</span>
                            </button>
                        </div>
                    </div>
                     <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                        <span>
                            {filteredAndSortedHistoriales.length} resultado{filteredAndSortedHistoriales.length !== 1 ? 's' : ''}
                            {hasActiveFilters() && ` (de ${historiales.length} historiales)`}
                        </span>
                        {hasActiveFilters() && (
                            <button
                                onClick={clearAllFilters}
                                className="text-cyan-600 hover:text-cyan-800 font-medium flex items-center space-x-1"
                            >
                                <X className="w-4 h-4" />
                                <span>Limpiar filtros</span>
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
                                <button
                                    onClick={() => setShowFiltersPanel(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Padecimiento
                                    </label>
                                    <select
                                        value={filters.tipoPadecimiento}
                                        onChange={(e) => handleFilterChange('tipoPadecimiento', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="todos">Todos</option>
                                        {uniquePadecimientos.map(p => (
                                            <option key={p} value={p} className="capitalize">{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Detección</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="date"
                                            value={filters.fechaDesde}
                                            onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                        <input
                                            type="date"
                                            value={filters.fechaHasta}
                                            onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                {TABLE_COLUMNS.map(col => (
                                    <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedHistoriales.length === 0 ? (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length} className="px-6 py-8 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <FileText className="w-12 h-12 text-gray-300" />
                                            <div className="text-gray-500 font-medium">
                                                {hasActiveFilters() ? 'No se encontraron historiales con los filtros aplicados' : 'No hay historiales médicos registrados'}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAndSortedHistoriales.map(historial => (
                                    <tr key={historial._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-cyan-600 font-semibold text-sm">
                                                        {historial.clienteId?.nombre?.charAt(0) || 'N'}{historial.clienteId?.apellido?.charAt(0) || 'A'}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    {historial.clienteId ? (
                                                        <>
                                                        <div className="font-semibold text-gray-900 truncate">
                                                             {historial.clienteId.nombre} {historial.clienteId.apellido}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {historial.clienteId?.edad} años
                                                        </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-500">Cliente no disponible</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 font-medium">{historial.padecimientos?.tipo || '-'}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs" title={historial.padecimientos?.descripcion}>
                                                {historial.padecimientos?.descripcion || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900">{historial.historialVisual?.diagnostico || '-'}</div>
                                            <div className="text-sm text-gray-500">
                                                {historial.historialVisual?.fecha ? new Date(historial.historialVisual.fecha).toLocaleDateString() : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {historial.padecimientos?.fechaDeteccion ? new Date(historial.padecimientos.fechaDeteccion).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                             <div className="flex space-x-1">
                                                <button 
                                                    onClick={() => handleShowCliente(historial.clienteId)} 
                                                    className="p-1.5 text-blue-600 bg-white hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" 
                                                    title="Ver Expediente Completo"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleEditHistorial(historial)} 
                                                    className="p-1.5 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" 
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(historial, 'historial')} 
                                                    className="p-1.5 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" 
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal para añadir historial */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <form onSubmit={handleSaveHistorial} className="bg-white rounded-xl shadow-2xl w-full max-w-lg md:max-w-2xl p-4 md:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">{editHistorial ? 'Editar Historial Médico' : 'Nuevo Historial Médico'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Cliente *</label>
                                <select
                                    name="clienteId"
                                    value={formData.clienteId}
                                    onChange={handleInputChange}
                                    required
                                    disabled={!!editHistorial}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">Seleccione un cliente</option>
                                    {clientes.map(cliente => (
                                        <option key={cliente._id} value={cliente._id}>
                                            {cliente.nombre} {cliente.apellido}
                                            {!editHistorial && clientesConHistorial.has(cliente._id) ? ' (ya tiene expediente)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tipo de Padecimiento *</label>
                                <input
                                    type="text"
                                    name="padecimientos.tipo"
                                    value={formData.padecimientos.tipo}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Descripción *</label>
                                <input
                                    type="text"
                                    name="padecimientos.descripcion"
                                    value={formData.padecimientos.descripcion}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Fecha de Detección *</label>
                                <input
                                    type="date"
                                    name="padecimientos.fechaDeteccion"
                                    value={formData.padecimientos.fechaDeteccion}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Fecha de Diagnóstico *</label>
                                <input
                                    type="date"
                                    name="historialVisual.fecha"
                                    value={formData.historialVisual.fecha}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Diagnóstico *</label>
                                <input
                                    type="text"
                                    name="historialVisual.diagnostico"
                                    value={formData.historialVisual.diagnostico}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            {/* Sección de graduación OD/OI */}
                            <div className="md:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Graduación Ojo Derecho (OD)</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="number" step="0.01" name="historialVisual.receta.ojoDerecho.esfera" placeholder="Esfera" value={formData.historialVisual.receta.ojoDerecho.esfera} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-lg" />
                                            <input type="number" step="0.01" name="historialVisual.receta.ojoDerecho.cilindro" placeholder="Cilindro" value={formData.historialVisual.receta.ojoDerecho.cilindro} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-lg" />
                                            <input type="number" step="1" name="historialVisual.receta.ojoDerecho.eje" placeholder="Eje" value={formData.historialVisual.receta.ojoDerecho.eje} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-lg" />
                                            <input type="number" step="0.01" name="historialVisual.receta.ojoDerecho.adicion" placeholder="Adición" value={formData.historialVisual.receta.ojoDerecho.adicion} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-lg" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Graduación Ojo Izquierdo (OI)</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="number" step="0.01" name="historialVisual.receta.ojoIzquierdo.esfera" placeholder="Esfera" value={formData.historialVisual.receta.ojoIzquierdo.esfera} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-lg" />
                                            <input type="number" step="0.01" name="historialVisual.receta.ojoIzquierdo.cilindro" placeholder="Cilindro" value={formData.historialVisual.receta.ojoIzquierdo.cilindro} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-lg" />
                                            <input type="number" step="1" name="historialVisual.receta.ojoIzquierdo.eje" placeholder="Eje" value={formData.historialVisual.receta.ojoIzquierdo.eje} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-lg" />
                                            <input type="number" step="0.01" name="historialVisual.receta.ojoIzquierdo.adicion" placeholder="Adición" value={formData.historialVisual.receta.ojoIzquierdo.adicion} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => { setShowAddModal(false); setFormData(initialFormState); setEditHistorial(null); }} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancelar</button>
                            <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600">{editHistorial ? 'Actualizar' : 'Guardar'}</button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Modal para detalle de cliente */}
            {showClienteModal && clienteDetalle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-xl font-bold">{clienteDetalle.nombre} {clienteDetalle.apellido}</h3>
                                <div className="text-sm text-gray-500 mt-1 space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <Phone className="w-4 h-4" />
                                        <span>{clienteDetalle.telefono}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Mail className="w-4 h-4" />
                                        <span>{clienteDetalle.correo}</span>
                                    </div>
                                    {clienteDetalle.direccion && (
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{clienteDetalle.direccion.calle}, {clienteDetalle.direccion.ciudad}, {clienteDetalle.direccion.departamento}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setShowClienteModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                        </div>
                        
                        <div className="mb-6">
                            <h4 className="font-semibold text-cyan-700 mb-3 text-lg">Historiales Médicos</h4>
                            {historialesCliente.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>Sin historiales médicos.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {historialesCliente.map(h => (
                                        <div key={h._id} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">
                                                        Diagnóstico: <span className="text-cyan-600">{h.historialVisual?.diagnostico || '-'}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        Padecimiento: {h.padecimientos?.tipo || '-'}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        Detección: {h.padecimientos?.fechaDeteccion ? new Date(h.padecimientos.fechaDeteccion).toLocaleDateString() : '-'} | 
                                                        Diagnóstico: {h.historialVisual?.fecha ? new Date(h.historialVisual.fecha).toLocaleDateString() : '-'}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <button 
                                                        title="Ver detalles" 
                                                        onClick={() => handleView(h, 'historial')} 
                                                        className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button 
                                                        title="Editar" 
                                                        onClick={() => handleEditHistorial(h)} 
                                                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        title="Eliminar" 
                                                        onClick={() => handleDelete(h, 'historial')} 
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-cyan-700 mb-3 text-lg">Recetas</h4>
                            {recetasCliente.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>Sin recetas asociadas.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recetasCliente.map(r => (
                                        <div key={r._id} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">
                                                        Diagnóstico: <span className="text-cyan-600">{r.diagnostico}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        Vigencia: {r.vigencia} meses
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        Fecha: {r.fecha ? new Date(r.fecha).toLocaleDateString() : '-'}
                                                    </div>
                                                    {r.observaciones && (
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            Observaciones: {r.observaciones}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <button 
                                                        title="Ver detalles" 
                                                        onClick={() => handleView(r, 'receta')} 
                                                        className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button 
                                                        title="Editar" 
                                                        onClick={() => handleEditReceta(r)} 
                                                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        title="Eliminar" 
                                                        onClick={() => handleDelete(r, 'receta')} 
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de detalle */}
            {showDetailModal && detailData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Detalle de {detailData.tipo === 'historial' ? 'Historial Médico' : 'Receta'}</h3>
                            <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                        </div>
                        {detailData.tipo === 'historial' ? (
                            <div className="space-y-3">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <span className="font-semibold text-gray-700">Cliente:</span>
                                    <div className="text-gray-900">{detailData.clienteId ? `${detailData.clienteId.nombre} ${detailData.clienteId.apellido}` : '-'}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <span className="font-semibold text-gray-700">Tipo de Padecimiento:</span>
                                    <div className="text-gray-900">{detailData.padecimientos?.tipo || '-'}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <span className="font-semibold text-gray-700">Descripción:</span>
                                    <div className="text-gray-900">{detailData.padecimientos?.descripcion || '-'}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="font-semibold text-gray-700">Fecha de Detección:</span>
                                        <div className="text-gray-900">{detailData.padecimientos?.fechaDeteccion ? new Date(detailData.padecimientos.fechaDeteccion).toLocaleDateString() : '-'}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="font-semibold text-gray-700">Fecha de Diagnóstico:</span>
                                        <div className="text-gray-900">{detailData.historialVisual?.fecha ? new Date(detailData.historialVisual.fecha).toLocaleDateString() : '-'}</div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <span className="font-semibold text-gray-700">Diagnóstico:</span>
                                    <div className="text-gray-900">{detailData.historialVisual?.diagnostico || '-'}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <span className="font-semibold text-gray-700 mb-2 block">Receta:</span>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="border border-cyan-200 rounded-lg p-3">
                                            <div className="font-semibold text-cyan-700 mb-2">Ojo Derecho (OD)</div>
                                            <div className="space-y-1 text-sm">
                                                <div><span className="font-medium">Esfera:</span> {detailData.historialVisual?.receta?.ojoDerecho?.esfera ?? '-'}</div>
                                                <div><span className="font-medium">Cilindro:</span> {detailData.historialVisual?.receta?.ojoDerecho?.cilindro ?? '-'}</div>
                                                <div><span className="font-medium">Eje:</span> {detailData.historialVisual?.receta?.ojoDerecho?.eje ?? '-'}</div>
                                                <div><span className="font-medium">Adición:</span> {detailData.historialVisual?.receta?.ojoDerecho?.adicion ?? '-'}</div>
                                            </div>
                                        </div>
                                        <div className="border border-cyan-200 rounded-lg p-3">
                                            <div className="font-semibold text-cyan-700 mb-2">Ojo Izquierdo (OI)</div>
                                            <div className="space-y-1 text-sm">
                                                <div><span className="font-medium">Esfera:</span> {detailData.historialVisual?.receta?.ojoIzquierdo?.esfera ?? '-'}</div>
                                                <div><span className="font-medium">Cilindro:</span> {detailData.historialVisual?.receta?.ojoIzquierdo?.cilindro ?? '-'}</div>
                                                <div><span className="font-medium">Eje:</span> {detailData.historialVisual?.receta?.ojoIzquierdo?.eje ?? '-'}</div>
                                                <div><span className="font-medium">Adición:</span> {detailData.historialVisual?.receta?.ojoIzquierdo?.adicion ?? '-'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <span className="font-semibold text-gray-700">Diagnóstico:</span>
                                    <div className="text-gray-900">{detailData.diagnostico}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="font-semibold text-gray-700">Fecha:</span>
                                        <div className="text-gray-900">{detailData.fecha ? new Date(detailData.fecha).toLocaleDateString() : '-'}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="font-semibold text-gray-700">Vigencia:</span>
                                        <div className="text-gray-900">{detailData.vigencia} meses</div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <span className="font-semibold text-gray-700">Optometrista:</span>
                                    <div className="text-gray-900">{detailData.optometristaId?.empleadoId ? `${detailData.optometristaId.empleadoId.nombre} ${detailData.optometristaId.empleadoId.apellido}` : '-'}</div>
                                </div>
                                {detailData.observaciones && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="font-semibold text-gray-700">Observaciones:</span>
                                        <div className="text-gray-900">{detailData.observaciones}</div>
                                    </div>
                                )}
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <span className="font-semibold text-gray-700 mb-2 block">Graduación:</span>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="border border-cyan-200 rounded-lg p-3">
                                            <div className="font-semibold text-cyan-700 mb-2">Ojo Derecho (OD)</div>
                                            <div className="space-y-1 text-sm">
                                                <div><span className="font-medium">Esfera:</span> {detailData.ojoDerecho?.esfera ?? '-'}</div>
                                                <div><span className="font-medium">Cilindro:</span> {detailData.ojoDerecho?.cilindro ?? '-'}</div>
                                                <div><span className="font-medium">Eje:</span> {detailData.ojoDerecho?.eje ?? '-'}</div>
                                                <div><span className="font-medium">Adición:</span> {detailData.ojoDerecho?.adicion ?? '-'}</div>
                                            </div>
                                        </div>
                                        <div className="border border-cyan-200 rounded-lg p-3">
                                            <div className="font-semibold text-cyan-700 mb-2">Ojo Izquierdo (OI)</div>
                                            <div className="space-y-1 text-sm">
                                                <div><span className="font-medium">Esfera:</span> {detailData.ojoIzquierdo?.esfera ?? '-'}</div>
                                                <div><span className="font-medium">Cilindro:</span> {detailData.ojoIzquierdo?.cilindro ?? '-'}</div>
                                                <div><span className="font-medium">Eje:</span> {detailData.ojoIzquierdo?.eje ?? '-'}</div>
                                                <div><span className="font-medium">Adición:</span> {detailData.ojoIzquierdo?.adicion ?? '-'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Modal de confirmación de sobrescritura de expediente */}
            {showOverwriteConfirm && overwriteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold mb-2">No se puede agregar otro expediente</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            El cliente seleccionado ya tiene un expediente existente. ¿Deseas sobrescribir los datos del expediente ya creado con la información actual del formulario?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => setShowOverwriteConfirm(false)} 
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmOverwrite} 
                                className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
                            >
                                Sobrescribir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de borrado */}
            {showDeleteConfirm && deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold mb-4">
                            ¿Seguro que deseas eliminar este {deleteTarget.tipo === 'historial' ? 'historial médico' : 'receta'}?
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => setShowDeleteConfirm(false)} 
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
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

export default HistorialMedicoContent;