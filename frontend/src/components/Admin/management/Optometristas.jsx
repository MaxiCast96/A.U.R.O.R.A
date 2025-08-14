import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useForm } from '../../../hooks/admin/useForm';
import { usePagination } from '../../../hooks/admin/usePagination';

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

// Iconos
import { Eye, Plus, Edit, Trash2, UserCheck, UserX, Search, Award, Clock, MapPin, Phone, Mail, Building2 } from 'lucide-react';

// URLs de la API
const OPTOMETRISTAS_URL = 'http://localhost:4000/api/optometrista';
const EMPLEADOS_URL = 'http://localhost:4000/api/empleados';
const SUCURSALES_URL = 'http://localhost:4000/api/sucursales';

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
    const [filterEspecialidad, setFilterEspecialidad] = useState('todos');
    const [filterDisponible, setFilterDisponible] = useState('todos');
    const [filterSucursal, setFilterSucursal] = useState('todos');

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
                axios.get(OPTOMETRISTAS_URL),
                axios.get(EMPLEADOS_URL),
                axios.get(SUCURSALES_URL)
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

    // --- FILTRADO Y PAGINACIÓN ---
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

            const matchesEspecialidad = filterEspecialidad === 'todos' ||
                optometrista.especialidad.toLowerCase() === filterEspecialidad.toLowerCase();

            const matchesDisponible = filterDisponible === 'todos' ||
                (filterDisponible === 'disponible' && optometrista.disponible) ||
                (filterDisponible === 'no disponible' && !optometrista.disponible);

            const matchesSucursal = filterSucursal === 'todos' ||
                optometrista.sucursalesAsignadas.some(sucursal => sucursal._id === filterSucursal);

            return matchesSearch && matchesEspecialidad && matchesDisponible && matchesSucursal;
        });
    }, [optometristas, searchTerm, filterEspecialidad, filterDisponible, filterSucursal]);

    const { paginatedData: currentOptometristas, ...paginationProps } = usePagination(filteredOptometristas, 5);

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
                await axios.put(`${OPTOMETRISTAS_URL}/${selectedOptometrista._id}`, dataToSend);
                showAlert('success', '¡Optometrista actualizado exitosamente!');
            } else {
                // CREATE
                await axios.post(OPTOMETRISTAS_URL, dataToSend);
                showAlert('success', '¡Optometrista creado exitosamente!');
            }
            
            fetchData(); // Recargar datos
            handleCloseModals();
        } catch (error) {
            showAlert('error', 'Error: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async () => {
        if (!selectedOptometrista) return;
        
        try {
            await axios.delete(`${OPTOMETRISTAS_URL}/${selectedOptometrista._id}`);
            showAlert('success', '¡Optometrista eliminado exitosamente!');
            fetchData(); // Recargar datos
            handleCloseModals();
        } catch (error) {
            showAlert('error', 'Error al eliminar: ' + (error.response?.data?.message || error.message));
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

    const formatDisponibilidad = (disponibilidad) => {
        if (!disponibilidad || disponibilidad.length === 0) return 'Sin horario definido';
        return disponibilidad.map(d => `${d.dia} (${d.horaInicio}-${d.horaFin})`).join(', ');
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
                <PageHeader 
                    title="Gestión de Optometristas" 
                    buttonLabel="Añadir Optometrista" 
                    onButtonClick={handleAdd} 
                />
                
                <FilterBar
                    searchTerm={searchTerm}
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, email, especialidad, licencia..."
                    filters={[
                        {
                            label: 'Especialidad',
                            options: [
                                { value: 'todos', label: 'Todas' },
                                { value: 'General', label: 'General' },
                                { value: 'Pediátrica', label: 'Pediátrica' },
                                { value: 'Contactología', label: 'Contactología' },
                                { value: 'Baja Visión', label: 'Baja Visión' },
                                { value: 'Ortóptica', label: 'Ortóptica' },
                            ],
                            selectedValue: filterEspecialidad,
                            onFilterChange: setFilterEspecialidad,
                        },
                        {
                            label: 'Disponibilidad',
                            options: [
                                { value: 'todos', label: 'Todos' },
                                { value: 'disponible', label: 'Disponible' },
                                { value: 'no disponible', label: 'No Disponible' },
                            ],
                            selectedValue: filterDisponible,
                            onFilterChange: setFilterDisponible,
                        },
                        {
                            label: 'Sucursal',
                            options: [
                                { value: 'todos', label: 'Todas' },
                                ...sucursales.map(s => ({ value: s._id, label: s.nombre }))
                            ],
                            selectedValue: filterSucursal,
                            onFilterChange: setFilterSucursal,
                        }
                    ]}
                    activeFilter={filterEspecialidad}
                    onFilterChange={setFilterEspecialidad}
                />

                <DataTable
                    columns={tableColumns}
                    data={currentOptometristas}
                    renderRow={renderRow}
                    loading={loading}
                    noDataMessage="No se encontraron optometristas"
                    noDataSubMessage={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no hay optometristas registrados'}
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
                        label: "Disponibilidad", 
                        value: formatDisponibilidad(selectedOptometrista.disponibilidad) 
                    },
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
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onConfirm={handleDelete}
                title="Confirmar Eliminación"
                message={
                    selectedOptometrista?.empleadoId ? 
                        `¿Estás seguro de que deseas eliminar al optometrista ${selectedOptometrista.empleadoId.nombre} ${selectedOptometrista.empleadoId.apellido}? Esta acción no se puede deshacer.` :
                        '¿Estás seguro de que deseas eliminar este optometrista?'
                }
            />
        </div>
    );
};

export default Optometristas;