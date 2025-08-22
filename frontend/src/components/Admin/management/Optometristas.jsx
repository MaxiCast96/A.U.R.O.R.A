import React, { useState, useMemo, useEffect } from 'react';
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
import { Eye, Plus, Edit, Trash2, UserCheck, UserX, Search, Award, Clock, MapPin, Phone, Mail, Building2 } from 'lucide-react';

// Endpoints de la API
const OPTOMETRISTAS_EP = API_CONFIG.ENDPOINTS.OPTOMETRISTAS; // '/optometrista'
const EMPLEADOS_EP = API_CONFIG.ENDPOINTS.EMPLEADOS; // '/empleados'
const SUCURSALES_EP = API_CONFIG.ENDPOINTS.SUCURSALES; // '/sucursales'

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

const Optometristas = () => {
    // --- ESTADOS ---
    const [optometristas, setOptometristas] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOptometrista, setSelectedOptometrista] = useState(null);
    const [alert, setAlert] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // NUEVOS ESTADOS PARA FILTROS DINÁMICOS
    const [selectedEspecialidad, setSelectedEspecialidad] = useState('todas');
    const [selectedDisponibilidad, setSelectedDisponibilidad] = useState('todos');
    const [selectedSucursal, setSelectedSucursal] = useState('todas');
    
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
    const fetchData = async () => {
        setLoading(true);
        try {
            const [optometristasRes, empleadosRes, sucursalesRes] = await Promise.all([
                axiosWithFallback('get', OPTOMETRISTAS_EP),
                axiosWithFallback('get', EMPLEADOS_EP),
                axiosWithFallback('get', SUCURSALES_EP)
            ]);
            
            setOptometristas(optometristasRes.data);
            // Filtrar solo empleados que son optometristas
            const empleadosOptometristas = empleadosRes.data.filter(emp => emp.cargo === 'Optometrista');
            setEmpleados(empleadosOptometristas);
            setSucursales(sucursalesRes.data);
        } catch (error) {
            showAlert('error', 'Error al cargar los datos: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- FILTRADO Y PAGINACIÓN MEJORADO ---
    const filteredOptometristas = useMemo(() => {
        return optometristas.filter(optometrista => {
            const empleado = optometrista.empleadoId;
            if (!empleado) return false;

            const search = searchTerm.toLowerCase();
            const matchesSearch = 
                `${empleado.nombre} ${empleado.apellido}`.toLowerCase().includes(search) ||
                empleado.correo.toLowerCase().includes(search) ||
                optometrista.especialidad.toLowerCase().includes(search) ||
                optometrista.licencia.toLowerCase().includes(search);

            // FILTRO DINÁMICO POR ESPECIALIDAD
            const matchesEspecialidad = selectedEspecialidad === 'todas' ||
                optometrista.especialidad === selectedEspecialidad;

            // FILTRO DINÁMICO POR DISPONIBILIDAD
            let matchesDisponibilidad = true;
            if (selectedDisponibilidad === 'disponible') {
                matchesDisponibilidad = optometrista.disponible === true;
            } else if (selectedDisponibilidad === 'no_disponible') {
                matchesDisponibilidad = optometrista.disponible === false;
            }

            // FILTRO DINÁMICO POR SUCURSAL
            const matchesSucursal = selectedSucursal === 'todas' ||
                (optometrista.sucursalesAsignadas && optometrista.sucursalesAsignadas.some(sucursal => sucursal._id === selectedSucursal));

            return matchesSearch && matchesEspecialidad && matchesDisponibilidad && matchesSucursal;
        });
    }, [optometristas, searchTerm, selectedEspecialidad, selectedDisponibilidad, selectedSucursal]);

    const { paginatedData: currentOptometristas, ...paginationProps } = usePagination(filteredOptometristas, 5);

    // --- GENERAR OPCIONES DINÁMICAS PARA FILTROS ---
    
    // Opciones dinámicas de especialidad
    const especialidadOptions = useMemo(() => {
        const especialidadesUnicas = [...new Set(optometristas.map(opt => opt.especialidad))];
        return [
            { label: 'Todas las especialidades', value: 'todas' },
            ...especialidadesUnicas.map(esp => ({ label: esp, value: esp }))
        ];
    }, [optometristas]);

    // Opciones de disponibilidad
    const disponibilidadOptions = [
        { label: 'Todos los estados', value: 'todos' },
        { label: 'Disponibles', value: 'disponible' },
        { label: 'No disponibles', value: 'no_disponible' }
    ];

    // Opciones dinámicas de sucursal
    const sucursalFilterOptions = useMemo(() => {
        const baseSucursales = [{ label: 'Todas las sucursales', value: 'todas' }];
        const sucursalesOptions = sucursales.map(sucursal => ({
            label: sucursal.nombre,
            value: sucursal._id
        }));
        return [...baseSucursales, ...sucursalesOptions];
    }, [sucursales]);

    // --- HANDLERS ---
    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const handleCloseModals = () => {
        setIsFormModalOpen(false);
        setIsDetailModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedOptometrista(null);
        resetForm();
        setErrors({});
    };

    const handleAdd = () => {
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
    };

    const handleEdit = (optometrista) => {
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
    };

    const handleViewDetails = (optometrista) => {
        setSelectedOptometrista(optometrista);
        setIsDetailModalOpen(true);
    };

    const handleDeleteAttempt = (optometrista) => {
        setSelectedOptometrista(optometrista);
        setIsDeleteModalOpen(true);
    };

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

    // --- UTILIDADES ---
    const getEspecialidadColor = (especialidad) => {
        const colors = {
            'General': 'bg-blue-100 text-blue-800',
            'Pediátrica': 'bg-pink-100 text-pink-800',
            'Contactología': 'bg-green-100 text-green-800',
            'Baja Visión': 'bg-purple-100 text-purple-800',
            'Ortóptica': 'bg-yellow-100 text-yellow-800'
        };
        return colors[especialidad] || 'bg-gray-100 text-gray-800';
    };

    const getDisponibilidadColor = (isDisponible) => {
        return isDisponible ? 
            { text: 'Disponible', color: 'bg-green-100 text-green-800' } : 
            { text: 'No Disponible', color: 'bg-red-100 text-red-800' };
    };

    const formatSucursales = (sucursales) => {
        if (!sucursales || sucursales.length === 0) return 'Sin sucursales asignadas';
        return sucursales.map(s => s.nombre).join(', ');
    };

    // --- ESTADÍSTICAS ---
    const totalOptometristas = optometristas.length;
    const optometristasDisponibles = optometristas.filter(o => o.disponible).length;
    const optometristasNoDisponibles = totalOptometristas - optometristasDisponibles;
    const promedioExperiencia = totalOptometristas > 0 ? 
        (optometristas.reduce((sum, o) => sum + (o.experiencia || 0), 0) / totalOptometristas).toFixed(1) : '0';

    // --- RENDERIZADO DE TABLA ---
    const tableColumns = [
        { header: 'Optometrista', key: 'optometrista' },
        { header: 'Contacto', key: 'contacto' },
        { header: 'Especialidad', key: 'especialidad' },
        { header: 'Licencia', key: 'licencia' },
        { header: 'Experiencia', key: 'experiencia' },
        { header: 'Sucursales', key: 'sucursales' },
        { header: 'Estado', key: 'estado' },
        { header: 'Acciones', key: 'acciones' }
    ];

    const renderRow = (optometrista) => {
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
                        <div>
                            <div className="font-medium text-gray-900">{empleado.nombre} {empleado.apellido}</div>
                            <div className="text-sm text-gray-500">ID: {optometrista.licencia}</div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{empleado.telefono}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{empleado.correo}</span>
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
                        <Award className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{optometrista.experiencia || 0} años</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{formatSucursales(optometrista.sucursalesAsignadas)}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDisponibilidadColor(optometrista.disponible).color}`}>
                        {getDisponibilidadColor(optometrista.disponible).text}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => handleDeleteAttempt(optometrista)} 
                            className="p-2 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" 
                            title="Eliminar"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleViewDetails(optometrista)} 
                            className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" 
                            title="Ver detalles"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleEdit(optometrista)} 
                            className="p-2 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" 
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <Alert alert={alert} />
            
            <StatsGrid stats={[
                { title: 'Total Optometristas', value: totalOptometristas, Icon: Eye, color: 'cyan' },
                { title: 'Disponibles', value: optometristasDisponibles, Icon: UserCheck, color: 'green' },
                { title: 'No Disponibles', value: optometristasNoDisponibles, Icon: UserX, color: 'red' },
                { title: 'Experiencia Promedio', value: `${promedioExperiencia} años`, Icon: Award, color: 'purple' },
            ]} />

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* HEADER SIN BOTÓN DE AGREGAR */}
                <PageHeader 
                    title="Gestión de Optometristas"
                    subtitle="Los optometristas se crean desde la sección de empleados"
                />
                
                {/* FILTROS MEJORADOS CON DROPDOWNS DINÁMICOS */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        {/* Barra de búsqueda */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                                    placeholder="Buscar por nombre, email, especialidad, licencia..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filtros dinámicos */}
                        <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                            {/* Filtro por especialidad */}
                            <div className="min-w-[200px]">
                                <select
                                    value={selectedEspecialidad}
                                    onChange={(e) => setSelectedEspecialidad(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    {especialidadOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filtro por disponibilidad */}
                            <div className="min-w-[180px]">
                                <select
                                    value={selectedDisponibilidad}
                                    onChange={(e) => setSelectedDisponibilidad(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    {disponibilidadOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filtro por sucursal */}
                            <div className="min-w-[200px]">
                                <select
                                    value={selectedSucursal}
                                    onChange={(e) => setSelectedSucursal(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    {sucursalFilterOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Indicadores de filtros activos */}
                    {(searchTerm || selectedEspecialidad !== 'todas' || selectedDisponibilidad !== 'todos' || selectedSucursal !== 'todas') && (
                        <div className="mt-3 flex flex-wrap gap-2 text-sm">
                            <span className="text-gray-500">Filtros activos:</span>
                            {searchTerm && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                                    Búsqueda: "{searchTerm}"
                                </span>
                            )}
                            {selectedEspecialidad !== 'todas' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Especialidad: {especialidadOptions.find(e => e.value === selectedEspecialidad)?.label}
                                </span>
                            )}
                            {selectedDisponibilidad !== 'todos' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Estado: {disponibilidadOptions.find(d => d.value === selectedDisponibilidad)?.label}
                                </span>
                            )}
                            {selectedSucursal !== 'todas' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Sucursal: {sucursalFilterOptions.find(s => s.value === selectedSucursal)?.label}
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedEspecialidad('todas');
                                    setSelectedDisponibilidad('todos');
                                    setSelectedSucursal('todas');
                                }}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>

                <DataTable
                    columns={tableColumns}
                    data={currentOptometristas}
                    renderRow={renderRow}
                    loading={loading}
                    noDataMessage="No se encontraron optometristas"
                    noDataSubMessage={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los optometristas se crean desde la sección de empleados'}
                />
                
                <Pagination {...paginationProps} />
            </div>

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
                            new Date(selectedOptometrista.createdAt).toLocaleDateString('es-ES') : 
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
        </div>
    );
};

export default Optometristas;