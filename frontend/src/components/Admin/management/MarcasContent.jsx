import React, { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../config/api';
import MarcasFormModal from './employees/MarcasFormModal';
import Alert from '../ui/Alert';

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useForm = (initialData, validator) => {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const keys = name.split('.');
            setFormData(prev => ({
                ...prev,
                [keys[0]]: {
                    ...prev[keys[0]],
                    [keys[1]]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = validator ? validator(formData) : {};
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData(initialData);
        setErrors({});
    };

    return { formData, setFormData, handleInputChange, validateForm, resetForm, errors, setErrors };
};

const usePagination = (data, pageSize) => {
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = Math.ceil(data.length / pageSize);
    const paginatedData = data.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
    
    useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(0);
        }
    }, [currentPage, totalPages]);
    
    return {
        paginatedData,
        currentPage,
        totalPages,
        setCurrentPage,
        pageSize
    };
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

const SkeletonLoader = React.memo(() => (
    <div className="animate-pulse">
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
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {Array.from({ length: 7 }, (_, index) => (
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
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="w-16 h-12 bg-gray-200 rounded-lg"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-1">
                                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
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
    </div>
));

const PageHeader = ({ title, buttonLabel, onButtonClick }) => (
    <div className="px-6 py-4 border-b bg-gradient-to-r from-cyan-500 to-cyan-600">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <button
                onClick={onButtonClick}
                className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
                <Plus className="w-4 h-4" />
                <span>{buttonLabel}</span>
            </button>
        </div>
    </div>
);

const StatsGrid = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                    </div>
                    <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                        <stat.Icon className="w-6 h-6 text-cyan-600" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const DataTable = ({ columns, data, renderRow, loading, noDataMessage, noDataSubMessage }) => {
    if (loading) {
        return <SkeletonLoader />;
    }

    if (data.length === 0) {
        return (
            <div className="p-8 text-center">
                <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{noDataMessage}</h3>
                <p className="text-gray-500">{noDataSubMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-cyan-500 text-white">
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index} className="px-6 py-4 text-left font-semibold">
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) => (
                        <tr key={item._id || index} className="hover:bg-gray-50 transition-colors">
                            {renderRow(item)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
    if (totalPages <= 1) return null;
    
    return (
        <div className="p-6 flex justify-center">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage === 0}
                    className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                >
                    {"<<"}
                </button>
                <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                >
                    {"<"}
                </button>
                <span className="text-gray-700 font-medium px-4">
                    Página {currentPage + 1} de {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                >
                    {">"}
                </button>
                <button
                    onClick={() => setCurrentPage(totalPages - 1)}
                    disabled={currentPage === totalPages - 1}
                    className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                >
                    {">>"}
                </button>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 animate-slideInScale">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
                    <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailModal = ({ isOpen, onClose, title, item, data = [], children }) => {
    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 animate-slideInScale">
                
                <div className="bg-cyan-500 text-white p-5 rounded-t-xl flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} className="text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg p-2 transition-all duration-200 hover:scale-110">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {item.logo ? (
                                <img src={item.logo} alt={item.nombre} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="text-cyan-600 font-bold text-2xl">{item.nombre?.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-gray-800">{item.nombre}</h4>
                            <p className="text-gray-500">{item.paisOrigen}</p>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                        {data.map((field, index) => (
                            <div key={index} className="flex flex-col sm:flex-row justify-between py-2 border-b last:border-b-0">
                                <p className="font-semibold text-gray-600">{field.label}</p>
                                {field.color ? (
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${field.color} mt-1 sm:mt-0`}>
                                        {field.value}
                                    </span>
                                ) : (
                                    <p className="text-gray-800 text-left sm:text-right break-words">{field.value}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {children && (
                        <div className="space-y-4">
                            {children}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 rounded-b-xl flex justify-end flex-shrink-0">
                    <button onClick={onClose} className="px-5 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all duration-200 hover:scale-105">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// ICONS
// ============================================================================

import { 
    Search, Plus, Trash2, Eye, Edit, Bookmark, Package, Tags,
    X, MapPin, Filter, ChevronDown, SortAsc, SortDesc, Calendar,
    CheckCircle
} from 'lucide-react';

// ============================================================================
// API ENDPOINTS + CONFIGURATION
// ============================================================================

const MARCAS_EP = API_CONFIG.ENDPOINTS.MARCAS;
const ITEMS_PER_PAGE = 5;

const INITIAL_FILTERS = {
    linea: 'todas',
    paisOrigen: 'todos',
    fechaDesde: '',
    fechaHasta: ''
};

const SORT_OPTIONS = [
    { value: 'fechaCreacion-desc', label: 'Más Recientes Primero', icon: Calendar },
    { value: 'fechaCreacion-asc', label: 'Más Antiguos Primero', icon: Calendar },
    { value: 'nombre-asc', label: 'Nombre A-Z', icon: Tags },
    { value: 'nombre-desc', label: 'Nombre Z-A', icon: Tags },
    { value: 'paisOrigen-asc', label: 'País A-Z', icon: MapPin },
    { value: 'paisOrigen-desc', label: 'País Z-A', icon: MapPin },
];

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
    ? 'https://aurora-production-7e57.up.railway.app/api'
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MarcasContent = () => {
    const [marcas, setMarcas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMarca, setSelectedMarca] = useState(null);
    const [alert, setAlert] = useState(null);
    
    const [modals, setModals] = useState({
        addEdit: false,
        detail: false,
        delete: false
    });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [sortBy, setSortBy] = useState('fechaCreacion');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    
    const [uploadingImage, setUploadingImage] = useState(false);

    const initialFormData = {
        nombre: '',
        descripcion: '',
        logo: '',
        paisOrigen: '',
        lineas: [],
        estado: ''
    };

    const formValidator = (data) => {
        const errors = {};
        if (!data.nombre?.trim()) errors.nombre = 'El nombre es requerido';
        if (!data.descripcion?.trim()) errors.descripcion = 'La descripción es requerida';
        if (!data.paisOrigen?.trim()) errors.paisOrigen = 'El país de origen es requerido';
        if (!data.lineas || data.lineas.length === 0) errors.lineas = 'Debe seleccionar al menos una línea';
        if (!data.estado?.trim()) errors.estado = 'El estado es requerido';
        return errors;
    };

    const { formData, setFormData, handleInputChange, resetForm, validateForm, errors, setErrors } = useForm(
        initialFormData,
        formValidator
    );

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    // Muestra una alerta temporal en el panel
    const showAlert = useCallback((type, message) => {
        setAlert({ type, message });
        const timer = setTimeout(() => setAlert(null), 5000);
        return () => clearTimeout(timer);
    }, [setAlert]);

    // Color de chip por línea de producto
    const getLineaColor = useCallback((linea) => {
        switch (linea) {
            case 'Premium':
                return 'bg-purple-100 text-purple-800';
            case 'Económica':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }, []);

    // ============================================================================
    // API FUNCTIONS
    // ============================================================================

    const fetchMarcas = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosWithFallback('get', MARCAS_EP, null, { timeout: 10000 });
            let payload = response?.data;
            // Normalizar posibles formatos de respuesta
            if (payload && typeof payload === 'object' && !Array.isArray(payload) && Array.isArray(payload.data)) {
                payload = payload.data;
            }
            if (!Array.isArray(payload)) {
                console.warn('Respuesta inesperada de /marcas:', payload);
                showAlert('error', 'Formato de respuesta inesperado al cargar marcas.');
                setMarcas([]);
                return;
            }
            const formattedData = payload.map(m => ({
                ...m,
                fechaCreacionFormatted: new Date(m.createdAt || m.fechaCreacion).toLocaleDateString(),
                fechaCreacionRaw: new Date(m.createdAt || m.fechaCreacion),
            }));
            setMarcas(formattedData);
        } catch (error) {
            console.error('Error al cargar marcas:', error);
            showAlert('error', 'Error al cargar las marcas desde el servidor.');
            setMarcas([]);
        } finally {
            setLoading(false);
        }
    }, [showAlert]);

    const createMarca = async (marcaData) => {
        try {
            await axiosWithFallback('post', MARCAS_EP, {
                ...marcaData,
                fechaCreacion: new Date().toISOString()
            });

            await fetchMarcas();
            showAlert('success', '¡Marca creada exitosamente!');
            handleCloseModals();
        } catch (error) {
            console.error('Error al crear marca:', error);
            showAlert('error', error.response?.data?.message || 'Error al crear la marca');
        }
    };

    const updateMarca = async (id, marcaData) => {
        try {
            await axiosWithFallback('put', `${MARCAS_EP}/${id}`, {
                ...marcaData,
                fechaActualizacion: new Date().toISOString()
            });

            await fetchMarcas();
            showAlert('success', '¡Marca actualizada exitosamente!');
            handleCloseModals();
        } catch (error) {
            console.error('Error al actualizar marca:', error);
            showAlert('error', error.response?.data?.message || 'Error al actualizar la marca');
        }
    };

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    const handleCloseModals = useCallback(() => {
        setModals({ addEdit: false, detail: false, delete: false });
        setSelectedMarca(null);
        resetForm();
    }, [resetForm]);

    const handleOpenAddModal = useCallback(() => {
        resetForm();
        setErrors({});
        setSelectedMarca(null);
        setModals(prev => ({ ...prev, addEdit: true }));
    }, [resetForm, setErrors]);

    const handleOpenEditModal = useCallback((marca) => {
        setSelectedMarca(marca);
        setFormData({
            nombre: marca.nombre || '',
            descripcion: marca.descripcion || '',
            logo: marca.logo || '',
            paisOrigen: marca.paisOrigen || '',
            lineas: marca.lineas || [],
            estado: marca.estado || ''
        });
        setErrors({});
        setModals(prev => ({ ...prev, addEdit: true }));
    }, [setFormData, setErrors]);

    const handleOpenDetailModal = useCallback((marca) => {
        setSelectedMarca(marca);
        setModals(prev => ({ ...prev, detail: true }));
    }, []);

    const handleOpenDeleteModal = useCallback((marca) => {
        setSelectedMarca(marca);
        setModals(prev => ({ ...prev, delete: true }));
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) {
            showAlert('error', 'Por favor complete todos los campos requeridos correctamente.');
            return;
        }

        const dataToSend = {
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim(),
            paisOrigen: formData.paisOrigen.trim(),
            lineas: formData.lineas,
            logo: formData.logo || '',
            estado: formData.estado
        };

        if (selectedMarca) {
            await updateMarca(selectedMarca._id, dataToSend);
        } else {
            await createMarca(dataToSend);
        }
    }, [formData, selectedMarca, validateForm, showAlert]);

    const handleDelete = useCallback(async () => {
        if (!selectedMarca) return;
        await deleteMarca(selectedMarca._id);
    }, [selectedMarca]);

    // ========================================================================
    // TABLE CONFIGURATION
    // ========================================================================

    const tableColumns = [
        { header: 'Marca', key: 'marca' },
        { header: 'Descripción', key: 'descripcion' },
        { header: 'Logo', key: 'logo' },
        { header: 'Líneas', key: 'lineas' },
        { header: 'País Origen', key: 'paisOrigen' },
        { header: 'Fecha Creación', key: 'fechaCreacion' },
        { header: 'Acciones', key: 'acciones' }
    ];

    const renderRow = useCallback((marca) => (
        <>
            <td className="px-6 py-4">
                <div>
                    <div className="font-medium text-gray-900">{marca.nombre}</div>
                    <div className="text-sm text-gray-500">ID: {marca._id?.slice(-6) || 'N/A'}</div>
                </div>
            </td>
            <td className="px-6 py-4 text-gray-600 max-w-xs">
                <p className="truncate" title={marca.descripcion}>
                    {marca.descripcion}
                </p>
            </td>
            <td className="px-6 py-4">
                <div className="w-16 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                    {marca.logo ? (
                        <img 
                            src={marca.logo} 
                            alt={`Logo de ${marca.nombre}`}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={`${marca.logo ? 'hidden' : 'flex'} w-full h-full bg-gray-100 items-center justify-center text-gray-400 text-xs`}>
                        Sin logo
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                    {marca.lineas?.map((linea, index) => (
                        <span 
                            key={index}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getLineaColor(linea)}`}
                        >
                            {linea}
                        </span>
                    )) || <span className="text-gray-400 text-sm">Sin líneas</span>}
                </div>
            </td>
            <td className="px-6 py-4 text-gray-600">
                <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{marca.paisOrigen}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-gray-500 text-sm">
                {marca.fechaCreacionFormatted}
            </td>
            <td className="px-6 py-4">
                <div className="flex space-x-2">
                    <button 
                        onClick={() => handleOpenDeleteModal(marca)} 
                        className="p-2 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" 
                        title="Eliminar"
                        aria-label={`Eliminar marca ${marca.nombre}`}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleOpenDetailModal(marca)} 
                        className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" 
                        title="Ver detalles"
                        aria-label={`Ver detalles de ${marca.nombre}`}
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleOpenEditModal(marca)} 
                        className="p-2 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" 
                        title="Editar"
                        aria-label={`Editar marca ${marca.nombre}`}
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </>
    ), [getLineaColor, handleOpenDeleteModal, handleOpenDetailModal, handleOpenEditModal]);

    // ========================================================================
    // RENDER
    // ========================================================================

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                {alert && (
                    <Alert 
                        type={alert.type} 
                        message={alert.message} 
                        onClose={() => setAlert(null)} 
                    />
                )}
                <SkeletonLoader />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {alert && (
                <Alert 
                    type={alert.type} 
                    message={alert.message} 
                    onClose={() => setAlert(null)} 
                />
            )}
            
            <div className="w-full flex justify-center">
                <div className="w-full max-w-none">
                    <StatsGrid stats={stats} />
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <PageHeader 
                    title="Gestión de Marcas" 
                    buttonLabel="Añadir Marca" 
                    onButtonClick={handleOpenAddModal} 
                />
                
                {/* BARRA DE BÚSQUEDA Y CONTROLES */}
                <div className="px-6 py-4 border-b bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar marca..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                aria-label="Buscar marcas"
                            />
                        </div>

                        <div className="flex items-center space-x-3">
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
                                            filters.linea !== 'todas' && 1,
                                            filters.paisOrigen !== 'todos' && 1,
                                            filters.fechaDesde && 1,
                                            filters.fechaHasta && 1
                                        ].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                        <span>
                            {filteredAndSortedMarcas.length} marca{filteredAndSortedMarcas.length !== 1 ? 's' : ''} 
                            {hasActiveFilters() && ` (filtrada${filteredAndSortedMarcas.length !== 1 ? 's' : ''} de ${marcas.length})`}
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
                                <div>
                                    <label htmlFor="filter-linea" className="block text-sm font-medium text-gray-700 mb-2">
                                        Línea de Productos
                                    </label>
                                    <select
                                        id="filter-linea"
                                        value={filters.linea}
                                        onChange={(e) => handleFilterChange('linea', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    >
                                        <option value="todas">Todas las líneas</option>
                                        <option value="Premium">Premium</option>
                                        <option value="Económica">Económica</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="filter-pais" className="block text-sm font-medium text-gray-700 mb-2">
                                        País de Origen
                                    </label>
                                    <select
                                        id="filter-pais"
                                        value={filters.paisOrigen}
                                        onChange={(e) => handleFilterChange('paisOrigen', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    >
                                        <option value="todos">Todos los países</option>
                                        {uniqueCountries.map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Creación</label>
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
                
                <DataTable
                    columns={tableColumns}
                    data={currentMarcas}
                    renderRow={renderRow}
                    loading={false}
                    noDataMessage="No se encontraron marcas"
                    noDataSubMessage={hasActiveFilters() ? 'Intenta ajustar los filtros de búsqueda' : 'Comienza registrando tu primera marca'}
                />
                
                {filteredAndSortedMarcas.length > 0 && <Pagination {...paginationProps} />}
            </div>

            {/* MODALES */}
            {modals.addEdit && (
                <MarcasFormModal
                    isOpen={modals.addEdit}
                    onClose={handleCloseModals}
                    onSubmit={handleSubmit}
                    title={selectedMarca ? 'Editar Marca' : 'Agregar Nueva Marca'}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    errors={errors}
                    submitLabel={selectedMarca ? 'Actualizar Marca' : 'Guardar Marca'}
                    selectedMarca={selectedMarca}
                />
            )}

            {selectedMarca && modals.detail && (
                <DetailModal
                    isOpen={modals.detail}
                    onClose={handleCloseModals}
                    title="Detalles de la Marca"
                    item={selectedMarca}
                    data={[
                        { label: "Nombre", value: selectedMarca.nombre },
                        { label: "Descripción", value: selectedMarca.descripcion },
                        { label: "País de Origen", value: selectedMarca.paisOrigen },
                        { 
                            label: "Líneas", 
                            value: selectedMarca.lineas?.join(', ') || 'No especificadas'
                        },
                        { label: "Fecha de Creación", value: formatFecha(selectedMarca.createdAt || selectedMarca.fechaCreacion) },
                        { label: "Última Actualización", value: formatFecha(selectedMarca.updatedAt || selectedMarca.fechaActualizacion) },
                    ]}
                >
                    {selectedMarca?.logo && (
                        <div className="mt-4">
                            <h5 className="font-medium text-gray-700 mb-2">Logo:</h5>
                            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                                <img
                                    src={selectedMarca.logo}
                                    alt={`Logo de ${selectedMarca.nombre}`}
                                    className="max-w-48 max-h-24 object-contain"
                                />
                            </div>
                        </div>
                    )}
                </DetailModal>
            )}

            <ConfirmationModal
                isOpen={modals.delete}
                onClose={handleCloseModals}
                onConfirm={handleDelete}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que deseas eliminar la marca "${selectedMarca?.nombre}"?\n\nEsta acción no se puede deshacer.`}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
            />

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

export default MarcasContent;