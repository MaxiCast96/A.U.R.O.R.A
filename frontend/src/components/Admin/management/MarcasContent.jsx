import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../config/api';

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

const PageHeader = ({ title, buttonLabel, onButtonClick }) => (
    <div className="bg-cyan-500 text-white p-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{title}</h2>
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

const FilterBar = ({ searchTerm, onSearchChange, placeholder, filters, activeFilter, onFilterChange }) => (
    <div className="p-6 bg-gray-50 border-b">
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={onSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
            </div>
            <div className="flex gap-2 flex-wrap">
                {filters.map((filter, index) => (
                    <button
                        key={index}
                        onClick={() => onFilterChange(filter.value)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            activeFilter === filter.value 
                                ? 'bg-cyan-500 text-white' 
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const DataTable = ({ columns, data, renderRow, loading, noDataMessage, noDataSubMessage }) => {
    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando...</p>
            </div>
        );
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
            <table className="w-full">
                <thead className="bg-cyan-500 text-white">
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index} className="px-6 py-4 text-left font-semibold">
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
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

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => (
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

const Alert = ({ alert }) => {
    if (!alert) return null;
    
    const getAlertColors = (type) => {
        switch(type) {
            case 'success': return 'bg-green-100 border-green-400 text-green-700';
            case 'error': return 'bg-red-100 border-red-400 text-red-700';
            case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-700';
            default: return 'bg-blue-100 border-blue-400 text-blue-700';
        }
    };

    return (
        <div className={`border px-4 py-3 rounded ${getAlertColors(alert.type)} animate-slideInDown`}>
            <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>{alert.message}</span>
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

const FormModal = ({ isOpen, onClose, onSubmit, title, formData, handleInputChange, errors, submitLabel, submitIcon, fields = [], children, gridCols = 2 }) => {
    if (!isOpen) return null;

    const handleSubmitForm = (e) => {
        e.preventDefault();
        onSubmit();
    };

    const renderField = (field, index) => {
        const { name, label, type, options, required, colSpan = 1, placeholder, ...fieldProps } = field;
        const displayLabel = required ? `${label} *` : label;
        const error = errors[name];

        const commonProps = {
            name,
            value: Array.isArray(formData[name]) ? formData[name] : (formData[name] || ''),
            onChange: handleInputChange,
            className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-sm ${
                error ? 'border-red-500' : 'border-gray-300 hover:border-cyan-300'
            }`,
            placeholder,
            ...fieldProps
        };

        let fieldElement;

        switch (type) {
            case 'select':
                fieldElement = (
                    <select {...commonProps}>
                        <option value="">Seleccione una opción</option>
                        {options.map(option => (
                            <option key={typeof option === 'object' ? option.value : option} 
                                    value={typeof option === 'object' ? option.value : option}>
                                {typeof option === 'object' ? option.label : option}
                            </option>
                        ))}
                    </select>
                );
                break;
            case 'multi-select':
                fieldElement = (
                    <div>
                        <select 
                            {...commonProps}
                            multiple
                            size="4"
                            onChange={(e) => {
                                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                                handleInputChange({
                                    target: {
                                        name,
                                        value: selectedOptions
                                    }
                                });
                            }}
                        >
                            {options.map(option => (
                                <option key={typeof option === 'object' ? option.value : option} 
                                        value={typeof option === 'object' ? option.value : option}>
                                    {typeof option === 'object' ? option.label : option}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples opciones
                        </p>
                    </div>
                );
                break;
            case 'textarea':
                fieldElement = (
                    <textarea
                        {...commonProps}
                        rows="3"
                        className={`${commonProps.className} resize-none`}
                    />
                );
                break;
            default:
                fieldElement = <input {...commonProps} type={type || 'text'} />;
        }

        return (
            <div key={name || index} className={`col-span-${colSpan}`}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{displayLabel}</label>
                {fieldElement}
                {error && (
                    <div className="mt-1 text-red-500 text-sm flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
            <form 
                onSubmit={handleSubmitForm}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideInScale"
            >
                <div className="bg-cyan-500 text-white p-4 sm:p-6 rounded-t-xl sticky top-0 z-10">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg sm:text-xl font-bold">{title}</h3>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg p-1.5 sm:p-2 transition-all duration-200 hover:scale-110"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
                
                <div className="p-4 sm:p-6">
                    <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-3 sm:gap-4`}>
                        {children}
                        {fields.map((field, index) => renderField(field, index))}
                    </div>
                </div>

                <div className="p-4 sm:p-6 bg-gray-50 rounded-b-xl flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 sticky bottom-0 z-10">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200 hover:scale-105 text-sm sm:text-base"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="w-full sm:w-auto px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                        {submitIcon || <Save className="w-4 h-4" />}
                        <span>{submitLabel}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

// ============================================================================
// ICONS
// ============================================================================

import { 
    Search, Plus, Trash2, Eye, Edit, Bookmark, Package, Tags,
    Upload, Camera, X, Save, AlertCircle, Building2, MapPin
} from 'lucide-react';

// ============================================================================
// API ENDPOINTS + FALLBACK AXIOS HELPER
// ============================================================================

const MARCAS_EP = API_CONFIG.ENDPOINTS.MARCAS; // '/marcas'

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
    API_CONFIG.BASE_URL = base; // recordar último base exitoso
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MarcasContent = () => {
    // Estados principales
    const [marcas, setMarcas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMarca, setSelectedMarca] = useState(null);
    const [alert, setAlert] = useState(null);
    
    // Estados de modales
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // Estados de filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('todas');
    
    // Estado para carga de imágenes
    const [uploadingImage, setUploadingImage] = useState(false);

    // Inicialización del formulario
    const initialFormData = {
        nombre: '',
        descripcion: '',
        logo: '',
        paisOrigen: '',
        lineas: []
    };

    // Validador del formulario
    const formValidator = (data) => {
        const errors = {};
        if (!data.nombre?.trim()) errors.nombre = 'El nombre es requerido';
        if (!data.descripcion?.trim()) errors.descripcion = 'La descripción es requerida';
        if (!data.paisOrigen?.trim()) errors.paisOrigen = 'El país de origen es requerido';
        if (!data.lineas || data.lineas.length === 0) errors.lineas = 'Debe seleccionar al menos una línea';
        return errors;
    };

    // Hook del formulario
    const { formData, setFormData, handleInputChange, resetForm, validateForm, errors, setErrors } = useForm(
        initialFormData,
        formValidator
    );

    // ============================================================================
    // API FUNCTIONS
    // ============================================================================

    const fetchMarcas = async () => {
        setLoading(true);
        try {
            const response = await axiosWithFallback('get', MARCAS_EP);
            setMarcas(response.data);
        } catch (error) {
            console.error('Error al cargar marcas:', error);
            showAlert('error', 'Error al cargar las marcas: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const createMarca = async (marcaData) => {
        try {
            const response = await axiosWithFallback('post', MARCAS_EP, {
                ...marcaData,
                fechaCreacion: new Date().toISOString()
            });
            
            // Actualizar la lista local inmediatamente
            setMarcas(prev => [...prev, response.data]);
            
            showAlert('success', '¡Marca creada exitosamente!');
            handleCloseModals();
        } catch (error) {
            console.error('Error al crear marca:', error);
            showAlert('error', 'Error al crear la marca: ' + (error.response?.data?.message || error.message));
        }
    };

    const updateMarca = async (id, marcaData) => {
        try {
            const response = await axiosWithFallback('put', `${MARCAS_EP}/${id}`, {
                ...marcaData,
                fechaActualizacion: new Date().toISOString()
            });
            
            // Actualizar la lista local inmediatamente
            setMarcas(prev => prev.map(marca => 
                marca._id === id ? { ...marca, ...response.data } : marca
            ));
            
            showAlert('success', '¡Marca actualizada exitosamente!');
            handleCloseModals();
        } catch (error) {
            console.error('Error al actualizar marca:', error);
            showAlert('error', 'Error al actualizar la marca: ' + (error.response?.data?.message || error.message));
        }
    };

    const deleteMarca = async (id) => {
        try {
            await axiosWithFallback('delete', `${MARCAS_EP}/${id}`);
            
            // Actualizar la lista local inmediatamente
            setMarcas(prev => prev.filter(marca => marca._id !== id));
            
            showAlert('success', '¡Marca eliminada exitosamente!');
            handleCloseModals();
        } catch (error) {
            console.error('Error al eliminar marca:', error);
            showAlert('error', 'Error al eliminar la marca: ' + (error.response?.data?.message || error.message));
        }
    };

    // ============================================================================
    // EFFECTS
    // ============================================================================

    useEffect(() => {
        fetchMarcas();
        
        // Cargar script de Cloudinary
        const script = document.createElement('script');
        script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // ========================================================================
    // COMPUTED VALUES
    // ========================================================================

    // Marcas filtradas
    const filteredMarcas = useMemo(() => {
        return marcas.filter(marca => {
            const matchesSearch = marca.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                marca.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                marca.paisOrigen?.toLowerCase().includes(searchTerm.toLowerCase());
            
            let matchesFilter = true;
            if (selectedFilter === 'premium') {
                matchesFilter = marca.lineas?.includes('Premium');
            } else if (selectedFilter === 'economica') {
                matchesFilter = marca.lineas?.includes('Económica');
            }
            
            return matchesSearch && matchesFilter;
        });
    }, [marcas, searchTerm, selectedFilter]);

    // Paginación
    const { paginatedData: currentMarcas, ...paginationProps } = usePagination(filteredMarcas, 5);

    // Estadísticas
    const stats = useMemo(() => {
        const totalMarcas = marcas.length;
        const marcasPremium = marcas.filter(m => m.lineas?.includes('Premium')).length;
        const marcasEconomicas = marcas.filter(m => m.lineas?.includes('Económica')).length;
        const paisesUnicos = [...new Set(marcas.map(m => m.paisOrigen).filter(Boolean))].length;

        return [
            { title: 'Total Marcas', value: totalMarcas, Icon: Bookmark },
            { title: 'Líneas Premium', value: marcasPremium, Icon: Tags },
            { title: 'Líneas Económicas', value: marcasEconomicas, Icon: Package },
            { title: 'Países', value: paisesUnicos, Icon: MapPin }
        ];
    }, [marcas]);

    // ========================================================================
    // EVENT HANDLERS
    // ========================================================================

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const handleCloseModals = () => {
        setShowAddEditModal(false);
        setShowDetailModal(false);
        setShowDeleteModal(false);
        setSelectedMarca(null);
        resetForm();
    };

    const handleOpenAddModal = () => {
        resetForm();
        setSelectedMarca(null);
        setShowAddEditModal(true);
    };

    const handleOpenEditModal = (marca) => {
        setSelectedMarca(marca);
        setFormData({
            nombre: marca.nombre || '',
            descripcion: marca.descripcion || '',
            logo: marca.logo || '',
            paisOrigen: marca.paisOrigen || '',
            lineas: marca.lineas || []
        });
        setErrors({});
        setShowAddEditModal(true);
    };

    const handleOpenDetailModal = (marca) => {
        setSelectedMarca(marca);
        setShowDetailModal(true);
    };

    const handleOpenDeleteModal = (marca) => {
        setSelectedMarca(marca);
        setShowDeleteModal(true);
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const dataToSend = {
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim(),
            paisOrigen: formData.paisOrigen.trim(),
            lineas: formData.lineas,
            logo: formData.logo || ''
        };

        if (selectedMarca) {
            await updateMarca(selectedMarca._id, dataToSend);
        } else {
            await createMarca(dataToSend);
        }
    };

    const handleDelete = async () => {
        if (!selectedMarca) return;
        await deleteMarca(selectedMarca._id);
    };

    // ========================================================================
    // CLOUDINARY HANDLERS
    // ========================================================================

    const openCloudinaryWidget = () => {
        if (!window.cloudinary) {
            showAlert('error', 'Error: Cloudinary no está disponible. Verifica la configuración.');
            return;
        }

        setUploadingImage(true);
        
        const widget = window.cloudinary.createUploadWidget({
             cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
            folder: 'marcas',
            sources: ['local', 'url', 'camera'],
            multiple: false,
            maxFileSize: 5000000,
            clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
            cropping: true,
            croppingAspectRatio: 1.5,
            showSkipCropButton: false,
            croppingDefaultSelectionRatio: 1,
            gravity: 'center',
            theme: 'minimal',
        }, (error, result) => {
            setUploadingImage(false);
            
            if (error) {
                showAlert('error', 'Error al subir imagen: ' + error.message);
                return;
            }

            if (result.event === 'success') {
                const imageUrl = result.info.secure_url;
                setFormData(prev => ({
                    ...prev,
                    logo: imageUrl
                }));
                showAlert('success', 'Imagen subida exitosamente');
            }
        });

        widget.open();
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            logo: ''
        }));
    };

    // ========================================================================
    // UTILITY FUNCTIONS
    // ========================================================================

    const getLineaColor = (linea) => {
        switch(linea) {
            case 'Premium': return 'bg-purple-100 text-purple-800';
            case 'Económica': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'No disponible';
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

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

    const renderRow = (marca) => (
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
                {formatFecha(marca.createdAt || marca.fechaCreacion)}
            </td>
            <td className="px-6 py-4">
                <div className="flex space-x-2">
                    <button 
                        onClick={() => handleOpenDeleteModal(marca)} 
                        className="p-2 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" 
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleOpenDetailModal(marca)} 
                        className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" 
                        title="Ver detalles"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleOpenEditModal(marca)} 
                        className="p-2 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" 
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </>
    );

    // ========================================================================
    // FORM CONFIGURATION
    // ========================================================================

    const formFields = [
        {
            name: 'nombre',
            label: 'Nombre de la Marca',
            type: 'text',
            required: true,
            placeholder: 'Ej: Ray-Ban, Nike, Adidas...',
            colSpan: 1
        },
        {
            name: 'paisOrigen',
            label: 'País de Origen',
            type: 'text',
            required: true,
            placeholder: 'Ej: Estados Unidos, Alemania...',
            colSpan: 1
        },
        {
            name: 'lineas',
            label: 'Líneas de Productos',
            type: 'multi-select',
            required: true,
            options: [
                { value: 'Premium', label: 'Premium' },
                { value: 'Económica', label: 'Económica' }
            ],
            colSpan: 2
        },
        {
            name: 'descripcion',
            label: 'Descripción',
            type: 'textarea',
            required: true,
            placeholder: 'Describe la marca, su enfoque, características principales...',
            colSpan: 2
        }
    ];

    const filterOptions = [
        { label: 'Todas', value: 'todas' },
        { label: 'Premium', value: 'premium' },
        { label: 'Económica', value: 'economica' }
    ];

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="space-y-6 animate-fade-in">
            <Alert alert={alert} />
            <StatsGrid stats={stats} />
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <PageHeader 
                    title="Gestión de Marcas" 
                    buttonLabel="Añadir Marca" 
                    onButtonClick={handleOpenAddModal} 
                />
                
                <FilterBar
                    searchTerm={searchTerm}
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, descripción o país..."
                    filters={filterOptions}
                    activeFilter={selectedFilter}
                    onFilterChange={setSelectedFilter}
                />
                
                <DataTable
                    columns={tableColumns}
                    data={currentMarcas}
                    renderRow={renderRow}
                    loading={loading}
                    noDataMessage="No se encontraron marcas"
                    noDataSubMessage={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no hay marcas registradas'}
                />
                
                {filteredMarcas.length > 0 && <Pagination {...paginationProps} />}
            </div>

            {/* Modal de formulario */}
            <FormModal
                isOpen={showAddEditModal}
                onClose={handleCloseModals}
                onSubmit={handleSubmit}
                title={selectedMarca ? 'Editar Marca' : 'Agregar Nueva Marca'}
                formData={formData}
                handleInputChange={handleInputChange}
                errors={errors}
                submitLabel={selectedMarca ? 'Actualizar Marca' : 'Guardar Marca'}
                submitIcon={<Save className="w-4 h-4" />}
                fields={formFields}
                gridCols={2}
            >
                {/* Campo personalizado para el logo */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo de la Marca
                    </label>
                    
                    {formData.logo ? (
                        <div className="space-y-3">
                            <div className="flex justify-center">
                                <div className="relative">
                                    <img
                                        src={formData.logo}
                                        alt="Logo preview"
                                        className="w-32 h-20 object-contain border border-gray-300 rounded-lg bg-white p-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={openCloudinaryWidget}
                                    disabled={uploadingImage}
                                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-all duration-200 flex items-center space-x-2"
                                >
                                    <Camera className="w-4 h-4" />
                                    <span>Cambiar Logo</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-cyan-400 transition-colors">
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <Upload className="w-12 h-12 text-gray-400" />
                                </div>
                                
                                <div>
                                    <p className="text-gray-600 mb-2">Subir logo de la marca</p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        PNG, JPG, JPEG o WEBP (máx. 5MB)
                                    </p>
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={openCloudinaryWidget}
                                    disabled={uploadingImage}
                                    className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-all duration-200 flex items-center space-x-2 mx-auto"
                                >
                                    {uploadingImage ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Subiendo...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            <span>Seleccionar Archivo</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {errors.logo && (
                        <div className="mt-2 text-red-500 text-sm flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.logo}</span>
                        </div>
                    )}
                </div>
            </FormModal>

            {/* Modal de detalles */}
            <DetailModal
                isOpen={showDetailModal}
                onClose={handleCloseModals}
                title="Detalles de la Marca"
                item={selectedMarca}
                data={selectedMarca ? [
                    { label: "Nombre", value: selectedMarca.nombre },
                    { label: "Descripción", value: selectedMarca.descripcion },
                    { label: "País de Origen", value: selectedMarca.paisOrigen },
                    { 
                        label: "Líneas", 
                        value: selectedMarca.lineas?.join(', ') || 'No especificadas'
                    },
                    { label: "Fecha de Creación", value: formatFecha(selectedMarca.createdAt || selectedMarca.fechaCreacion) },
                    { label: "Última Actualización", value: formatFecha(selectedMarca.updatedAt || selectedMarca.fechaActualizacion) },
                ] : []}
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

            {/* Modal de confirmación para eliminar */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleCloseModals}
                onConfirm={handleDelete}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que deseas eliminar la marca "${selectedMarca?.nombre}"?\n\nEsta acción no se puede deshacer.`}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
            />
        </div>
    );
};

export default MarcasContent;