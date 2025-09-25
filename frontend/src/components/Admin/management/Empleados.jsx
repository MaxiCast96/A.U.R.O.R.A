import React, { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useForm } from '../../../hooks/admin/useForm';
import { usePagination } from '../../../hooks/admin/usePagination';
import { API_CONFIG } from '../../../config/api';

// Componentes de UI
import PageHeader from '../ui/PageHeader';
import StatsGrid from '../ui/StatsGrid';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import ConfirmationModal from '../ui/ConfirmationModal';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';
import { useLocation, useNavigate } from 'react-router-dom';
import EmpleadosFormModal from '../management/employees/EmpleadosFormModal';
import OptometristasFormModal from '../management/optometristas/OptometristasFormModal';

// Iconos
import { 
    Users, UserCheck, Building2, DollarSign, Trash2, Eye, Edit, Phone, Mail, Calendar,
    Filter, X, ChevronDown, SortAsc, SortDesc, User, CreditCard, CheckCircle, Search
} from 'lucide-react';

// Endpoints
const EMPLEADOS_EP = API_CONFIG.ENDPOINTS.EMPLEADOS;
const SUCURSALES_EP = API_CONFIG.ENDPOINTS.SUCURSALES;
const OPTOMETRISTAS_EP = API_CONFIG.ENDPOINTS.OPTOMETRISTAS;

// Configuración
const ITEMS_PER_PAGE = 10;

// Estados iniciales para filtros
const INITIAL_FILTERS = {
    estado: 'todos',
    cargo: 'todos',
    sucursal: 'todas',
    salarioMin: '',
    salarioMax: '',
    fechaDesde: '',
    fechaHasta: ''
};

// Opciones de ordenamiento
const SORT_OPTIONS = [
    { value: 'fechaContratacion-desc', label: 'Más Recientes Primero', icon: Calendar },
    { value: 'fechaContratacion-asc', label: 'Más Antiguos Primero', icon: Calendar },
    { value: 'nombre-asc', label: 'Nombre A-Z', icon: User },
    { value: 'nombre-desc', label: 'Nombre Z-A', icon: User },
    { value: 'salario-desc', label: 'Salario: Mayor a Menor', icon: DollarSign },
    { value: 'salario-asc', label: 'Salario: Menor a Mayor', icon: DollarSign },
    { value: 'cargo-asc', label: 'Cargo A-Z', icon: User },
    { value: 'cargo-desc', label: 'Cargo Z-A', icon: User },
];

// Columnas de la tabla
const TABLE_COLUMNS = [
    { header: 'Empleado', key: 'empleado' },
    { header: 'Contacto', key: 'contacto' },
    { header: 'Cargo', key: 'cargo' },
    { header: 'Sucursal', key: 'sucursal' },
    { header: 'Salario', key: 'salario' },
    { header: 'Estado', key: 'estado' },
    { header: 'Acciones', key: 'acciones' }
];

// Axios helper con fallback
const axiosWithFallback = async (method, path, data, config = {}) => {
    const makeUrl = (base) => `${base}${path}`;

    const tryOnce = async (base) => {
        const url = makeUrl(base);
        try {
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
        } catch (err) {
            throw err;
        }
    };

    const primaryBase = API_CONFIG.BASE_URL;
    const secondaryBase = primaryBase.includes('localhost')
        ? 'https://aurora-production-7e57.up.railway.app/api'
        : 'http://localhost:4000/api';

    try {
        return await tryOnce(primaryBase);
    } catch (e1) {
        const msg = e1?.message || '';
        if (e1.code === 'ECONNABORTED' || msg.includes('Network Error') || msg.includes('ECONNREFUSED')) {
            return await tryOnce(secondaryBase);
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

const Empleados = () => {
    // --- ESTADOS PRINCIPALES ---
    const [empleados, setEmpleados] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);
    const [alert, setAlert] = useState(null);
    
    // --- ESTADOS DE MODALES ---
    const [modals, setModals] = useState({
        addEdit: false,
        detail: false,
        delete: false,
        optometrista: false,
        cargoChangeWarning: false
    });
    
    // --- ESTADOS DE FILTROS Y ORDENAMIENTO ---
    const [searchTerm, setSearchTerm] = useState('');
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [sortBy, setSortBy] = useState('fechaContratacion');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    
    // --- ESTADOS PARA OPTOMETRISTA ---
    const [isOptometristaFlow, setIsOptometristaFlow] = useState(false);
    const [tempEmployeeData, setTempEmployeeData] = useState(null);
    const [creationStep, setCreationStep] = useState('');
    const [creationProgress, setCreationProgress] = useState(0);

    const location = useLocation();
    const navigate = useNavigate();

    // --- FETCH DE DATOS ---
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [empleadosRes, sucursalesRes] = await Promise.all([
                axiosWithFallback('get', EMPLEADOS_EP),
                axiosWithFallback('get', SUCURSALES_EP)
            ]);
            
            const formattedEmpleados = empleadosRes.data.map(empleado => ({
                ...empleado,
                fechaContratacion: empleado.fechaContratacion || new Date().toISOString(),
                fechaContratacionRaw: new Date(empleado.fechaContratacion || new Date()),
            }));
            
            setEmpleados(formattedEmpleados);
            setSucursales(sucursalesRes.data);
        } catch (error) {
            showAlert('error', 'Error al cargar los datos. ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
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
    }, [fetchData]);

    // --- HOOKS DE FORMULARIOS ---
    const { 
        formData, 
        setFormData, 
        handleInputChange, 
        handleNestedChange,
        resetForm, 
        validateForm, 
        errors, 
        setErrors 
    } = useForm({
        nombre: '', 
        apellido: '', 
        dui: '', 
        telefono: '', 
        correo: '', 
        cargo: '', 
        sucursalId: '',
        fechaContratacion: '', 
        salario: '', 
        estado: 'Activo', 
        password: '', 
        fotoPerfil: '',
        direccion: { 
          departamento: '', 
          municipio: '', 
          direccionDetallada: '' 
        }
    }, (data) => {
        const newErrors = {};
        if (!data.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
        if (!data.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
        if (!/^\d{8}-\d$/.test(data.dui)) newErrors.dui = 'DUI inválido (formato: 12345678-9)';
        
        const telefonoSinPrefijo = data.telefono.replace('+503', '');
        if (!/^\d{8}$/.test(telefonoSinPrefijo)) newErrors.telefono = 'Teléfono inválido (8 dígitos requeridos)';
        
        if (!/\S+@\S+\.\S+/.test(data.correo)) newErrors.correo = 'Email inválido';
        if (!data.cargo) newErrors.cargo = 'El cargo es requerido';
        if (!data.sucursalId) newErrors.sucursalId = 'La sucursal es requerida';
        if (!data.salario || data.salario <= 0) newErrors.salario = 'Salario inválido';
        if (!selectedEmpleado && !data.password) newErrors.password = 'La contraseña es requerida para nuevos empleados';

        if (data.direccion.departamento && !data.direccion.municipio) {
            newErrors['direccion.municipio'] = 'El municipio es requerido si el departamento está seleccionado';
        }
        if (data.direccion.municipio && !data.direccion.departamento) {
            newErrors['direccion.departamento'] = 'El departamento es requerido si el municipio está seleccionado';
        }

        return newErrors;
    });

    const { 
        formData: optometristaFormData, 
        setFormData: setOptometristaFormData, 
        handleInputChange: handleOptometristaInputChange, 
        resetForm: resetOptometristaForm, 
        errors: optometristaErrors,
        setErrors: setOptometristaErrors
    } = useForm({
        especialidad: '',
        licencia: '',
        experiencia: '',
        disponibilidad: [],
        sucursalesAsignadas: [],
        disponible: true,
        empleadoId: ''
    }, (data) => {
        const newErrors = {};
        if (!data.especialidad) newErrors.especialidad = 'La especialidad es requerida';
        if (!data.licencia) newErrors.licencia = 'La licencia es requerida';
        if (!data.experiencia || data.experiencia < 0) newErrors.experiencia = 'La experiencia debe ser un número positivo';
        if (!data.sucursalesAsignadas || data.sucursalesAsignadas.length === 0) newErrors.sucursalesAsignadas = 'Debe asignar al menos una sucursal';
        if (!data.disponibilidad || data.disponibilidad.length === 0) newErrors.disponibilidad = 'Debe configurar al menos una hora de disponibilidad';
        return newErrors;
    });

    // --- FUNCIONES UTILITARIAS ---
    const showAlert = useCallback((type, message) => {
        setAlert({ type, message });
        const timer = setTimeout(() => setAlert(null), 5000);
        return () => clearTimeout(timer);
    }, []);

    const getEstadoColor = useCallback((estado) => (
        estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    ), []);

    const getCargoColor = useCallback((cargo) => {
        const colors = { 
            'Administrador': 'bg-purple-100 text-purple-800', 
            'Gerente': 'bg-blue-100 text-blue-800', 
            'Vendedor': 'bg-orange-100 text-orange-800', 
            'Optometrista': 'bg-cyan-100 text-cyan-800', 
            'Técnico': 'bg-yellow-100 text-yellow-800', 
            'Recepcionista': 'bg-pink-100 text-pink-800' 
        };
        return colors[cargo] || 'bg-gray-100 text-gray-800';
    }, []);

    const formatSalario = useCallback((salario) => `$${Number(salario).toFixed(2)}`, []);
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
                    valueA = `${a.nombre} ${a.apellido}`.toLowerCase();
                    valueB = `${b.nombre} ${b.apellido}`.toLowerCase();
                    break;
                case 'salario':
                    valueA = parseFloat(a.salario) || 0;
                    valueB = parseFloat(b.salario) || 0;
                    break;
                case 'cargo':
                    valueA = a.cargo?.toLowerCase() || '';
                    valueB = b.cargo?.toLowerCase() || '';
                    break;
                case 'fechaContratacion':
                    valueA = a.fechaContratacionRaw || new Date(0);
                    valueB = b.fechaContratacionRaw || new Date(0);
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
    const applyAdvancedFilters = useCallback((empleado) => {
        // Filtro por estado
        if (filters.estado !== 'todos' && empleado.estado.toLowerCase() !== filters.estado) {
            return false;
        }

        // Filtro por cargo
        if (filters.cargo !== 'todos' && empleado.cargo.toLowerCase() !== filters.cargo.toLowerCase()) {
            return false;
        }

        // Filtro por sucursal
        if (filters.sucursal !== 'todas' && empleado.sucursalId?._id !== filters.sucursal) {
            return false;
        }

        // Filtro por salario
        if (filters.salarioMin && parseFloat(empleado.salario) < parseFloat(filters.salarioMin)) {
            return false;
        }
        if (filters.salarioMax && parseFloat(empleado.salario) > parseFloat(filters.salarioMax)) {
            return false;
        }

        // Filtro por fecha de contratación
        if (filters.fechaDesde) {
            const fechaDesde = new Date(filters.fechaDesde);
            if (empleado.fechaContratacionRaw < fechaDesde) {
                return false;
            }
        }
        if (filters.fechaHasta) {
            const fechaHasta = new Date(filters.fechaHasta);
            fechaHasta.setHours(23, 59, 59);
            if (empleado.fechaContratacionRaw > fechaHasta) {
                return false;
            }
        }

        return true;
    }, [filters]);

    // --- LÓGICA DE FILTRADO, ORDENAMIENTO Y PAGINACIÓN ---
    const filteredAndSortedEmpleados = useMemo(() => {
        const filtered = empleados.filter(empleado => {
            // Búsqueda por texto
            const search = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                `${empleado.nombre} ${empleado.apellido}`.toLowerCase().includes(search) ||
                empleado.dui?.includes(search) ||
                empleado.correo?.toLowerCase().includes(search) ||
                empleado.cargo?.toLowerCase().includes(search) ||
                empleado.telefono?.includes(searchTerm);
            
            // Filtros avanzados
            const matchesAdvancedFilters = applyAdvancedFilters(empleado);
            
            return matchesSearch && matchesAdvancedFilters;
        });
        
        return sortData(filtered);
    }, [empleados, searchTerm, applyAdvancedFilters, sortData]);

    const { paginatedData: currentEmpleados, ...paginationProps } = usePagination(filteredAndSortedEmpleados, ITEMS_PER_PAGE);

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
               filters.cargo !== 'todos' || 
               filters.sucursal !== 'todas' || 
               filters.salarioMin || 
               filters.salarioMax || 
               filters.fechaDesde || 
               filters.fechaHasta;
    }, [searchTerm, filters]);

    // --- OBTENER OPCIONES ÚNICAS ---
    const uniqueCargos = useMemo(() => {
        const cargos = empleados
            .map(e => e.cargo)
            .filter(Boolean)
            .filter((cargo, index, arr) => arr.indexOf(cargo) === index);
        return cargos.sort();
    }, [empleados]);

    // --- FUNCIONES PARA MANEJAR MODALES ---
    const handleCloseModals = useCallback(() => {
        setModals({ 
            addEdit: false, 
            detail: false, 
            delete: false, 
            optometrista: false, 
            cargoChangeWarning: false 
        });
        setSelectedEmpleado(null);
        setTempEmployeeData(null);
        setCreationStep('');
        setCreationProgress(0);
        resetForm();
        resetOptometristaForm();
    }, [resetForm, resetOptometristaForm]);

    const handleOpenAddModal = useCallback(() => {
        resetForm();
        resetOptometristaForm();
        setErrors({});
        setSelectedEmpleado(null);
        setModals(prev => ({ ...prev, addEdit: true }));
    }, [resetForm, resetOptometristaForm, setErrors]);

    const handleOpenEditModal = useCallback((empleado, fromOptometristaPage = false) => {
        setSelectedEmpleado(empleado);
        
        const telefonoSinPrefijo = empleado.telefono?.startsWith('+503') 
            ? empleado.telefono.substring(4) 
            : empleado.telefono || '';

        const direccionCompleta = {
            departamento: empleado.departamento || '',
            municipio: empleado.municipio || '',
            direccionDetallada: empleado.direccionDetallada || ''
        };

        const formDataToSet = {
            ...empleado,
            sucursalId: empleado.sucursalId?._id || '', 
            password: '',
            fechaContratacion: empleado.fechaContratacion ? new Date(empleado.fechaContratacion).toISOString().split('T')[0] : '',
            direccion: direccionCompleta,
            telefono: telefonoSinPrefijo,
            fotoPerfil: empleado.fotoPerfil || '',
            fromOptometristaPage: fromOptometristaPage,
            originalCargo: empleado.cargo
        };

        setFormData(formDataToSet);
        setErrors({});
        setModals(prev => ({ ...prev, addEdit: true }));
    }, [setFormData, setErrors]);

    const handleOpenDetailModal = useCallback((empleado) => {
        setSelectedEmpleado(empleado);
        setModals(prev => ({ ...prev, detail: true }));
    }, []);

    const handleOpenDeleteModal = useCallback((empleado) => {
        setSelectedEmpleado(empleado);
        setModals(prev => ({ ...prev, delete: true }));
    }, []);

    // --- ESTADÍSTICAS ---
    const totalEmpleados = empleados.length;
    const empleadosActivos = empleados.filter(e => e.estado === 'Activo').length;
    const sucursalPrincipalStats = sucursales.length > 0 ? empleados.filter(e => e.sucursalId?._id === sucursales[0]._id).length : 0;
    const nominaTotal = empleados.filter(e => e.estado === 'Activo').reduce((sum, e) => sum + parseFloat(e.salario || 0), 0);

    const employeeStats = [
        { title: 'Total Empleados', value: totalEmpleados, Icon: Users, color: 'cyan' },
        { title: 'Empleados Activos', value: empleadosActivos, Icon: UserCheck, color: 'cyan' },
        { title: sucursales.length > 0 ? sucursales[0].nombre : 'Sucursal Principal', value: sucursalPrincipalStats, Icon: Building2, color: 'cyan'},
        { title: 'Nómina Total (Activos)', value: formatSalario(nominaTotal), Icon: DollarSign, color: 'cyan' }
    ];

    // --- FUNCIONES DEL FLUJO DE OPTOMETRISTA ---
    const checkIfOptometrista = async (empleadoId) => {
        try {
            const response = await axiosWithFallback('get', `${OPTOMETRISTAS_EP}/empleado/${empleadoId}`);
            return response.data;
        } catch (error) {
            return null;
        }
    };

    const deleteOptometrista = async (empleadoId) => {
        try {
            const optometrista = await checkIfOptometrista(empleadoId);
            if (optometrista) {
                await axiosWithFallback('delete', `${OPTOMETRISTAS_EP}/${optometrista._id}`);
            }
        } catch (error) {
            throw error;
        }
    };

    const handleProceedToOptometristaForm = () => {
        if (!validateForm()) return;
        
        const completeEmployeeData = {
            ...formData,
            fotoPerfil: formData.fotoPerfil || '',
            departamento: formData.direccion?.departamento || '',
            municipio: formData.direccion?.municipio || '',
            direccionDetallada: formData.direccion?.direccionDetallada || '',
            telefono: formData.telefono?.startsWith('+503') 
                ? formData.telefono 
                : '+503' + formData.telefono
        };
        
        delete completeEmployeeData.direccion;
        delete completeEmployeeData.fromOptometristaPage;
        
        setTempEmployeeData(completeEmployeeData);
        setModals(prev => ({ ...prev, addEdit: false, optometrista: true }));
        
        resetOptometristaForm();
        setOptometristaFormData({
            especialidad: '',
            licencia: '',
            experiencia: '',
            disponibilidad: [],
            sucursalesAsignadas: [],
            disponible: true,
            empleadoId: ''
        });
    };

    const handleFinalizeCreation = async (finalOptometristaData = null) => {
        try {
            const dataToUse = finalOptometristaData || optometristaFormData;
            
            if (!tempEmployeeData) {
                showAlert('error', 'Error: No se encontraron los datos del empleado');
                return;
            }
            
            if (!dataToUse.especialidad || !dataToUse.licencia) {
                showAlert('error', 'Faltan campos requeridos: especialidad y licencia son obligatorios');
                return;
            }
            
            if (!dataToUse.sucursalesAsignadas || dataToUse.sucursalesAsignadas.length === 0) {
                showAlert('error', 'Debe asignar al menos una sucursal');
                return;
            }
            
            if (!dataToUse.disponibilidad || dataToUse.disponibilidad.length === 0) {
                showAlert('error', 'Debe configurar al menos una hora de disponibilidad');
                return;
            }

            setLoading(true);
            setCreationStep('employee');
            setCreationProgress(25);

            let newEmployeeId = null;
            if (selectedEmpleado && selectedEmpleado._id) {
                newEmployeeId = selectedEmpleado._id;
            } else {
                const employeeResponse = await axiosWithFallback('post', EMPLEADOS_EP, tempEmployeeData);
                const newEmployee = employeeResponse.data.empleado || employeeResponse.data;
                newEmployeeId = newEmployee._id;
                
                if (!newEmployeeId) {
                    throw new Error('No se pudo obtener el ID del empleado creado. Verifique la respuesta del servidor.');
                }
            }

            const mustSetCargo = (selectedEmpleado && selectedEmpleado.cargo !== 'Optometrista') || (!selectedEmpleado && tempEmployeeData?.cargo !== 'Optometrista');
            if (mustSetCargo) {
                await axiosWithFallback('put', `${EMPLEADOS_EP}/${newEmployeeId}`, { cargo: 'Optometrista' });
            }

            setCreationProgress(60);
            setCreationStep('optometrista');

            const finalOptometristaPayload = {
                empleadoId: newEmployeeId,
                especialidad: dataToUse.especialidad?.trim(),
                licencia: dataToUse.licencia?.trim(),
                experiencia: parseInt(dataToUse.experiencia) || 0,
                disponibilidad: Array.isArray(dataToUse.disponibilidad) 
                    ? dataToUse.disponibilidad.map(item => ({
                        dia: item.dia,
                        hora: item.hora,
                        horaInicio: item.horaInicio || item.hora,
                        horaFin: item.horaFin || getNextHour(item.hora)
                    }))
                    : [],
                sucursalesAsignadas: Array.isArray(dataToUse.sucursalesAsignadas) 
                    ? dataToUse.sucursalesAsignadas 
                    : [],
                disponible: dataToUse.disponible !== false && dataToUse.disponible !== 'false'
            };
            
            let optometristaResponse;
            const existingOpt = await checkIfOptometrista(newEmployeeId);
            if (existingOpt && existingOpt._id) {
                optometristaResponse = await axiosWithFallback('put', `${OPTOMETRISTAS_EP}/${existingOpt._id}`, finalOptometristaPayload);
            } else {
                optometristaResponse = await axiosWithFallback('post', OPTOMETRISTAS_EP, finalOptometristaPayload);
            }

            setCreationProgress(100);
            showAlert('success', '¡Empleado y Optometrista creados exitosamente!');
            
            setTimeout(() => {
                handleCloseModals();
                fetchData().then(() => {
                    navigate('/dashboard');
                });
            }, 1000);

        } catch (error) {
            let errorMessage = 'Error en la creación: ';
            
            if (error.response?.data?.message) {
                errorMessage += error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage += error.response.data.error;
            } else if (error.message) {
                errorMessage += error.message;
            } else {
                errorMessage += 'Error desconocido';
            }
            
            if (error.response?.data?.missing) {
                errorMessage += `. Campos faltantes: ${error.response.data.missing.join(', ')}`;
            }
            
            showAlert('error', errorMessage);
            
        } finally {
            setLoading(false);
            setCreationStep('');
            setCreationProgress(0);
        }
    };

    const getNextHour = (hora) => {
        const horasDisponibles = [
            '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
        ];
        
        const currentIndex = horasDisponibles.indexOf(hora);
        if (currentIndex >= 0 && currentIndex < horasDisponibles.length - 1) {
            return horasDisponibles[currentIndex + 1];
        }
        const [hourPart] = hora.split(':');
        return `${hourPart}:59`;
    };

    const handleBackToEmployeeForm = () => {
        setModals(prev => ({ ...prev, optometrista: false, addEdit: true }));
        
        if (tempEmployeeData) {
            const restoredFormData = {
                ...tempEmployeeData,
                direccion: {
                    departamento: tempEmployeeData.departamento || '',
                    municipio: tempEmployeeData.municipio || '',
                    direccionDetallada: tempEmployeeData.direccionDetallada || ''
                },
                telefono: tempEmployeeData.telefono?.startsWith('+503') 
                    ? tempEmployeeData.telefono.substring(4) 
                    : tempEmployeeData.telefono || ''
            };
            
            delete restoredFormData.departamento;
            delete restoredFormData.municipio;
            delete restoredFormData.direccionDetallada;
            
            setFormData(restoredFormData);
        }
    };

    const handleReturnToOptometristaEdit = (empleadoId) => {
        const optometrista = optometristas?.find(o => o.empleadoId._id === empleadoId);
        if (optometrista) {
            handleCloseModals();
            navigate('/dashboard', { state: { editOptometristaId: optometrista._id } });
        }
    };

    const performEmployeeUpdate = async () => {
        const dataToSend = { ...formData };
        
        if (formData.direccion) {
            dataToSend.departamento = formData.direccion.departamento;
            dataToSend.municipio = formData.direccion.municipio;
            dataToSend.direccionDetallada = formData.direccion.direccionDetallada;
            delete dataToSend.direccion;
        }

        if (dataToSend.telefono && !dataToSend.telefono.startsWith('+503')) {
            dataToSend.telefono = '+503' + dataToSend.telefono;
        }

        delete dataToSend.fromOptometristaPage;
        delete dataToSend.originalCargo;

        if (selectedEmpleado) {
            await axiosWithFallback('put', `${EMPLEADOS_EP}/${selectedEmpleado._id}`, dataToSend);
            showAlert('success', '¡Empleado actualizado exitosamente!');
        } else {
            await axiosWithFallback('post', `${EMPLEADOS_EP}`, dataToSend);
            showAlert('success', '¡Empleado creado exitosamente!');
        }
        
        fetchData();
        handleCloseModals();
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        if (selectedEmpleado && selectedEmpleado.cargo === 'Optometrista' && formData.cargo !== 'Optometrista') {
            setModals(prev => ({ ...prev, cargoChangeWarning: true }));
            return;
        }

        if (selectedEmpleado && selectedEmpleado.cargo !== 'Optometrista' && formData.cargo === 'Optometrista') {
            handleProceedToOptometristaForm();
            return;
        }

        try {
            await performEmployeeUpdate();
        } catch (error) {
            showAlert('error', 'Error: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleConfirmCargoChange = async () => {
        try {
            setLoading(true);
            
            await deleteOptometrista(selectedEmpleado._id);
            await performEmployeeUpdate();
            
            showAlert('success', '¡Empleado actualizado y configuración de optometrista eliminada exitosamente!');
            setModals(prev => ({ ...prev, cargoChangeWarning: false }));
            
        } catch (error) {
            showAlert('error', 'Error al cambiar cargo: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async () => {
        if (!selectedEmpleado) return;
        try {
            if (selectedEmpleado.cargo === 'Optometrista') {
                await deleteOptometrista(selectedEmpleado._id);
            }
            
            await axiosWithFallback('delete', `${EMPLEADOS_EP}/${selectedEmpleado._id}`);
            showAlert('success', '¡Empleado eliminado exitosamente!');
            fetchData();
            handleCloseModals();
        } catch (error) {
            showAlert('error', 'Error al eliminar: ' + (error.response?.data?.message || error.message));
        }
    };

    const getSubmitHandler = () => {
        const isChangingToOptometrista = selectedEmpleado && 
            selectedEmpleado.cargo !== 'Optometrista' && 
            formData.cargo === 'Optometrista';
        
        const isCreatingOptometrista = !selectedEmpleado && formData.cargo === 'Optometrista';
        
        if (isCreatingOptometrista || isChangingToOptometrista) {
            return handleProceedToOptometristaForm;
        }
        
        return handleSubmit;
    };

    const getSubmitLabel = () => {
        if (selectedEmpleado) {
            if (selectedEmpleado.cargo !== 'Optometrista' && formData.cargo === 'Optometrista') {
                return 'Continuar';
            }
            return 'Actualizar Empleado';
        }
        if (formData.cargo === 'Optometrista') {
            return 'Continuar';
        }
        return 'Guardar Empleado';
    };

    // --- RENDERIZADO DE TABLA ---
    const renderRow = useCallback((empleado) => (
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
                        <div className="text-sm text-gray-500">{empleado.dui}</div>
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
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCargoColor(empleado.cargo)}`}>
                    {empleado.cargo}
                </span>
            </td>
            <td className="px-6 py-4 text-gray-600">
                <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{empleado.sucursalId?.nombre || 'N/A'}</span>
                </div>
            </td>
            <td className="px-6 py-4 font-mono font-semibold text-cyan-700">
                {formatSalario(empleado.salario)}
            </td>
            <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(empleado.estado)}`}>
                    {empleado.estado}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex space-x-1">
                    <button 
                        onClick={() => handleOpenDeleteModal(empleado)} 
                        className="p-1.5 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" 
                        title="Eliminar"
                        aria-label={`Eliminar empleado ${empleado.nombre} ${empleado.apellido}`}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleOpenDetailModal(empleado)} 
                        className="p-1.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" 
                        title="Ver detalles"
                        aria-label={`Ver detalles de ${empleado.nombre} ${empleado.apellido}`}
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleOpenEditModal(empleado)} 
                        className="p-1.5 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" 
                        title="Editar"
                        aria-label={`Editar empleado ${empleado.nombre} ${empleado.apellido}`}
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </>
    ), [getCargoColor, getEstadoColor, formatSalario, handleOpenDeleteModal, handleOpenDetailModal, handleOpenEditModal]);

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
                    <StatsGrid stats={employeeStats} />
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <PageHeader 
                    title="Gestión de Empleados" 
                    buttonLabel="Añadir Empleado" 
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
                                placeholder="Buscar empleado..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                aria-label="Buscar empleados"
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
                                            filters.cargo !== 'todos' && 1,
                                            filters.sucursal !== 'todas' && 1,
                                            filters.salarioMin && 1,
                                            filters.salarioMax && 1,
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
                            {filteredAndSortedEmpleados.length} empleado{filteredAndSortedEmpleados.length !== 1 ? 's' : ''} 
                            {hasActiveFilters() && ` (filtrado${filteredAndSortedEmpleados.length !== 1 ? 's' : ''} de ${empleados.length})`}
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

                                {/* Filtro por Cargo */}
                                <div>
                                    <label htmlFor="filter-cargo" className="block text-sm font-medium text-gray-700 mb-2">
                                        Cargo
                                    </label>
                                    <select
                                        id="filter-cargo"
                                        value={filters.cargo}
                                        onChange={(e) => handleFilterChange('cargo', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    >
                                        <option value="todos">Todos los cargos</option>
                                        {uniqueCargos.map(cargo => (
                                            <option key={cargo} value={cargo}>{cargo}</option>
                                        ))}
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

                                {/* Filtro por Rango de Salario */}
                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Salario</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.salarioMin}
                                            onChange={(e) => handleFilterChange('salarioMin', e.target.value)}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                            min="0"
                                            step="0.01"
                                            aria-label="Salario mínimo"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.salarioMax}
                                            onChange={(e) => handleFilterChange('salarioMax', e.target.value)}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                            min="0"
                                            step="0.01"
                                            aria-label="Salario máximo"
                                        />
                                    </div>
                                </div>

                                {/* Filtro por Fecha de Contratación */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Contratación</label>
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
                            data={currentEmpleados}
                            renderRow={renderRow}
                            isLoading={false}
                            noDataMessage="No se encontraron empleados"
                            noDataSubMessage={hasActiveFilters() ? 'Intenta ajustar los filtros de búsqueda' : 'Comienza registrando tu primer empleado'}
                        />
                    </div>
                </div>
                
                <Pagination {...paginationProps} />
            </div>
            
            {/* MODALES */}
            {modals.addEdit && (
                <EmpleadosFormModal
                    isOpen={modals.addEdit}
                    onClose={handleCloseModals}
                    onSubmit={getSubmitHandler()}
                    title={selectedEmpleado ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
                    formData={formData}
                    setFormData={setFormData}
                    handleInputChange={handleInputChange}
                    handleNestedChange={handleNestedChange}
                    errors={errors}
                    submitLabel={getSubmitLabel()}
                    sucursales={sucursales}
                    selectedEmpleado={selectedEmpleado}
                    onReturnToOptometristaEdit={() => selectedEmpleado && handleReturnToOptometristaEdit(selectedEmpleado._id)}
                />
            )}

            {/* Modal de optometrista (paso 2) */}
            {modals.optometrista && (
                <OptometristasFormModal
                    isOpen={modals.optometrista}
                    onClose={handleCloseModals}
                    onSubmit={handleFinalizeCreation}
                    title="Añadir Detalles del Optometrista (Paso 2 de 2)"
                    submitLabel={creationStep ? 'Creando...' : 'Finalizar y Guardar'}
                    isCreationFlow={true}
                    preloadedEmployeeData={tempEmployeeData}
                    sucursales={sucursales}
                    formData={optometristaFormData}
                    setFormData={setOptometristaFormData}
                    handleInputChange={handleOptometristaInputChange}
                    errors={optometristaErrors}
                    empleados={[]}
                    selectedOptometrista={null}
                    onBackToEmployeeForm={handleBackToEmployeeForm}
                    isCreating={!!creationStep}
                    creationStep={creationStep}
                    creationProgress={creationProgress}
                />
            )}

            {/* Modal de confirmación para cambio de cargo */}
            <ConfirmationModal
                isOpen={modals.cargoChangeWarning}
                onClose={() => setModals(prev => ({ ...prev, cargoChangeWarning: false }))}
                onConfirm={handleConfirmCargoChange}
                title="⚠️ Advertencia: Cambio de Cargo"
                message={`Este empleado es actualmente un Optometrista. Al cambiar su cargo, se eliminará toda su configuración de optometrista (horarios, sucursales asignadas, especialidad, etc.). ¿Está seguro de continuar?`}
                confirmLabel="Sí, cambiar cargo"
                cancelLabel="Cancelar"
                type="warning"
            />
            
            {/* Modal de detalles */}
            {selectedEmpleado && modals.detail && (
                <DetailModal
                    isOpen={modals.detail}
                    onClose={handleCloseModals}
                    title="Detalles del Empleado"
                    item={selectedEmpleado}
                    data={[
                        { label: "Nombre", value: `${selectedEmpleado.nombre} ${selectedEmpleado.apellido}` },
                        { label: "DUI", value: selectedEmpleado.dui },
                        { label: "Contacto", value: `${selectedEmpleado.telefono} / ${selectedEmpleado.correo}` },
                        { 
                            label: "Dirección", 
                            value: selectedEmpleado.direccion ? 
                                `${selectedEmpleado.direccion.direccionDetallada}, ${selectedEmpleado.direccion.municipio}, ${selectedEmpleado.direccion.departamento}` : 
                                'No especificada'
                        },
                        { label: "Cargo", value: selectedEmpleado.cargo, color: getCargoColor(selectedEmpleado.cargo) },
                        { label: "Sucursal", value: selectedEmpleado.sucursalId?.nombre || 'N/A' },
                        { label: "Fecha Contratación", value: formatFecha(selectedEmpleado.fechaContratacion) },
                        { label: "Salario", value: formatSalario(selectedEmpleado.salario) },
                        { label: "Estado", value: selectedEmpleado.estado, color: getEstadoColor(selectedEmpleado.estado) },
                    ]}
                />
            )}

            {/* Modal de confirmación para eliminar */}
            <ConfirmationModal
                isOpen={modals.delete}
                onClose={handleCloseModals}
                onConfirm={handleDelete}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que deseas eliminar al empleado ${selectedEmpleado?.nombre} ${selectedEmpleado?.apellido}? Esta acción no se puede deshacer.${selectedEmpleado?.cargo === 'Optometrista' ? '\n\n⚠️ Nota: También se eliminará su configuración de optometrista.' : ''}`}
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

export default Empleados;