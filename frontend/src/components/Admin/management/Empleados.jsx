import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useForm } from '../../../hooks/admin/useForm';
import { usePagination } from '../../../hooks/admin/usePagination';

// Componentes de UI (sin cambios)
import PageHeader from '../ui/PageHeader';
import StatsGrid from '../ui/StatsGrid';
import FilterBar from '../ui/FilterBar';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import ConfirmationModal from '../ui/ConfirmationModal';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';
import { useLocation, useNavigate } from 'react-router-dom';
import EmpleadosFormModal from '../management/employees/EmpleadosFormModal';
import OptometristasFormModal from '../management/optometristas/OptometristasFormModal';

// Iconos (sin cambios)
import { Users, UserCheck, Building2, DollarSign, Trash2, Eye, Edit, Phone, Mail, Calendar } from 'lucide-react';

// URL base de tu API
const API_URL = 'https://a-u-r-o-r-a.onrender.com/api/empleados';
const SUCURSALES_URL = 'https://a-u-r-o-r-a.onrender.com/api/sucursales';

const Empleados = () => {
    // --- ESTADOS ---
    const [empleados, setEmpleados] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);
    const [alert, setAlert] = useState(null);
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('todos');
    const [isOptometristaFlow, setIsOptometristaFlow] = useState(false);
    const [tempEmployeeData, setTempEmployeeData] = useState(null);
    const [showOptometristaModal, setShowOptometristaModal] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // --- FETCH DE DATOS ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [empleadosRes, sucursalesRes] = await Promise.all([
                axios.get(`${API_URL}`),
                axios.get(`${SUCURSALES_URL}`)
            ]);
            setEmpleados(empleadosRes.data);
            setSucursales(sucursalesRes.data);
        } catch (error) {
            showAlert('error', 'Error al cargar los datos. ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Cargar el script de Cloudinary
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

    // --- FORMULARIO ---
    const { formData, setFormData, handleInputChange, resetForm, validateForm, errors, setErrors } = useForm({
        nombre: '', apellido: '', dui: '', telefono: '', correo: '', cargo: '', sucursalId: '',
        fechaContratacion: '', salario: '', estado: 'Activo', password: '', fotoPerfil: '',
        direccion: { departamento: '', municipio: '', direccionDetallada: '' }
    }, (data) => {
        const newErrors = {};
        if (!data.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
        if (!data.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
        if (!/^\d{8}-\d$/.test(data.dui)) newErrors.dui = 'DUI inválido (formato: 12345678-9)';
        
        // Validar solo los 8 dígitos del teléfono (el +503 se añade al enviar)
        if (!/^\d{8}$/.test(data.telefono)) newErrors.telefono = 'Teléfono inválido (8 dígitos requeridos)';
        
        if (!/\S+@\S+\.\S+/.test(data.correo)) newErrors.correo = 'Email inválido';
        if (!data.cargo) newErrors.cargo = 'El cargo es requerido';
        if (!data.sucursalId) newErrors.sucursalId = 'La sucursal es requerida';
        if (!data.salario || data.salario <= 0) newErrors.salario = 'Salario inválido';
        if (!selectedEmpleado && !data.password) newErrors.password = 'La contraseña es requerida para nuevos empleados';

        // Validar campos de dirección si están presentes
        if (data.direccion.departamento && !data.direccion.municipio) {
            newErrors['direccion.municipio'] = 'El municipio es requerido si el departamento está seleccionado';
        }
        if (data.direccion.municipio && !data.direccion.departamento) {
            newErrors['direccion.departamento'] = 'El departamento es requerido si el municipio está seleccionado';
        }

        return newErrors;
    });

    // --- FORMULARIO PARA OPTOMETRISTA (Paso 2) ---
    const { 
        formData: optometristaFormData, 
        setFormData: setOptometristaFormData, 
        handleInputChange: handleOptometristaInputChange, 
        resetForm: resetOptometristaForm, 
        validateForm: validateOptometristaForm, 
        errors: optometristaErrors,
        setErrors: setOptometristaErrors
    } = useForm({
        // Valores iniciales para un nuevo optometrista
        especialidad: '',
        licencia: '',
        experiencia: '',
        disponibilidad: [],
        sucursalesAsignadas: [],
        disponible: true,
        empleadoId: '' // Se llenará después
    }, (data) => {
        // Reglas de validación para el optometrista
        const newErrors = {};
        if (!data.especialidad) newErrors.especialidad = 'La especialidad es requerida';
        if (!data.licencia) newErrors.licencia = 'La licencia es requerida';
        if (!data.experiencia || data.experiencia < 0) newErrors.experiencia = 'La experiencia debe ser un número positivo';
        if (!data.sucursalesAsignadas || data.sucursalesAsignadas.length === 0) newErrors.sucursalesAsignadas = 'Debe asignar al menos una sucursal';
        return newErrors;
    });

    // --- FILTRADO Y PAGINACIÓN ---
    const filteredEmpleados = useMemo(() => empleados.filter(empleado => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = `${empleado.nombre} ${empleado.apellido}`.toLowerCase().includes(search) ||
            empleado.dui.includes(search) ||
            empleado.correo.toLowerCase().includes(search) ||
            empleado.cargo.toLowerCase().includes(search);

        let matchesFilter = true;
        const sucursalPrincipalId = sucursales.find(s => s.nombre === 'Principal')?._id;
        const sucursalQuezaltepequeId = sucursales.find(s => s.nombre === 'Quezaltepeque')?._id;

        if (selectedFilter === 'principal') matchesFilter = empleado.sucursalId?._id === sucursalPrincipalId;
        else if (selectedFilter === 'quezaltepeque') matchesFilter = empleado.sucursalId?._id === sucursalQuezaltepequeId;
        else if (selectedFilter === 'activos') matchesFilter = empleado.estado === 'Activo';
        else if (selectedFilter === 'inactivos') matchesFilter = empleado.estado === 'Inactivo';

        return matchesSearch && matchesFilter;
    }), [empleados, searchTerm, selectedFilter, sucursales]);

    const { paginatedData: currentEmpleados, ...paginationProps } = usePagination(filteredEmpleados, 5);

    // --- ESTADÍSTICAS (ajustado para usar sucursalId) ---
    const totalEmpleados = empleados.length;
    const empleadosActivos = empleados.filter(e => e.estado === 'Activo').length;
    const sucursalPrincipalId = sucursales.find(s => s.nombre === 'Principal')?._id;
    const empleadosPrincipal = empleados.filter(e => e.sucursalId?._id === sucursalPrincipalId).length;
    const nominaTotal = empleados.filter(e => e.estado === 'Activo').reduce((sum, e) => sum + parseFloat(e.salario || 0), 0);
    const formatSalario = (salario) => `$${Number(salario).toFixed(2)}`;
    
    const employeeStats = [
        { title: 'Total Empleados', value: totalEmpleados, Icon: Users },
        { title: 'Empleados Activos', value: empleadosActivos, Icon: UserCheck },
        { title: 'Sucursal Principal', value: empleadosPrincipal, Icon: Building2 },
        { title: 'Nómina Total (Activos)', value: formatSalario(nominaTotal), Icon: DollarSign }
    ];

    // --- EFFECT TO HANDLE REDIRECT FOR EDITING ---
    useEffect(() => {
        if (location.state?.editEmployeeId) {
            const employeeToEdit = empleados.find(e => e._id === location.state.editEmployeeId);
            if (employeeToEdit) {
                handleOpenEditModal(employeeToEdit, true); 
            }
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, empleados, navigate]);

    // --- HANDLERS FOR THE NEW FLOW ---

    // Step 1: Called from EmpleadosFormModal when "Siguiente" is clicked
    const handleProceedToOptometristaForm = () => {
        if (!validateForm()) return;
        
        // IMPORTANTE: Asegurar que la foto se preserve en tempEmployeeData
        const completeEmployeeData = {
            ...formData,
            fotoPerfil: formData.fotoPerfil || '',
            departamento: formData.direccion?.departamento || '',
            municipio: formData.direccion?.municipio || '',
            direccionDetallada: formData.direccion?.direccionDetallada || '',
            telefono: formData.telefono?.startsWith('+503') ? formData.telefono : '+503' + formData.telefono
        };
        
        delete completeEmployeeData.direccion;
        delete completeEmployeeData.fromOptometristaPage;
        
        console.log('Datos del empleado para optometrista:', completeEmployeeData);
        
        setTempEmployeeData(completeEmployeeData);
        setShowAddEditModal(false);
        setShowOptometristaModal(true);
    };
    
    // Step 2: Called from OptometristasFormModal to finalize creation
    const handleFinalizeCreation = async () => {
        if (!validateOptometristaForm()) return;

        try {
            setLoading(true);
            
            console.log('Creando empleado con datos:', tempEmployeeData);
            console.log('Foto en tempEmployeeData:', tempEmployeeData.fotoPerfil);
            
            // 1. Create the Employee
            const employeeResponse = await axios.post(API_URL, tempEmployeeData);
            const newEmployeeId = employeeResponse.data._id;

            console.log('Empleado creado exitosamente:', employeeResponse.data);

            // 2. Create the Optometrista with the new employee's ID
            const finalOptometristaData = {
                ...optometristaFormData,
                empleadoId: newEmployeeId,
            };
            
            console.log('Creando optometrista con datos:', finalOptometristaData);
            
            await axios.post('https://a-u-r-o-r-a.onrender.com/api/optometrista', finalOptometristaData);

            showAlert('success', '¡Empleado y Optometrista creados exitosamente!');
            handleCloseModals();
            navigate('/optometristas');

        } catch (error) {
            console.error('Error en la creación:', error);
            console.error('Respuesta del servidor:', error.response?.data);
            showAlert('error', 'Error en la creación: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };
    
    // Handler to navigate back to optometrista editing
    const handleReturnToOptometristaEdit = (empleadoId) => {
        const optometrista = optometristas?.find(o => o.empleadoId._id === empleadoId);
        if (optometrista) {
            handleCloseModals();
            navigate('/optometristas', { state: { editOptometristaId: optometrista._id } });
        }
    };

    // --- HANDLERS ---
    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const handleCloseModals = () => {
        setShowAddEditModal(false);
        setShowDetailModal(false);
        setShowDeleteModal(false);
        setShowOptometristaModal(false);
        setSelectedEmpleado(null);
        setTempEmployeeData(null);
        resetForm();
        resetOptometristaForm();
    };
    
    const handleOpenAddModal = () => {
        resetForm();
        resetOptometristaForm();
        
        const initialFormData = {
            nombre: '', 
            apellido: '', 
            dui: '', 
            telefono: '', 
            correo: '', 
            cargo: '', 
            sucursalId: '',
            fechaContratacion: new Date().toISOString().split('T')[0],
            salario: '', 
            estado: 'Activo', 
            password: '', 
            fotoPerfil: '',
            direccion: { 
                departamento: '', 
                municipio: '', 
                direccionDetallada: '' 
            }
        };
        
        setFormData(initialFormData);
        setSelectedEmpleado(null);
        setShowAddEditModal(true);
    };

    const handleOpenEditModal = (empleado, fromOptometristaPage = false) => {
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
            fromOptometristaPage: fromOptometristaPage
        };

        console.log('Datos para edición:', formDataToSet);
        setFormData(formDataToSet);
        setErrors({});
        setShowAddEditModal(true);
    };
    
    const handleOpenDetailModal = (empleado) => {
        setSelectedEmpleado(empleado);
        setShowDetailModal(true);
    };

    const handleOpenDeleteModal = (empleado) => {
        setSelectedEmpleado(empleado);
        setShowDeleteModal(true);
    };

    // CORRECCIÓN 1: Función handleSubmit principal para empleados regulares
    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const dataToSend = { ...formData };
            
            console.log('Datos a enviar:', dataToSend);
            console.log('Foto de perfil:', dataToSend.fotoPerfil);
            
            // Aplanar dirección para el backend
            if (formData.direccion) {
                dataToSend.departamento = formData.direccion.departamento;
                dataToSend.municipio = formData.direccion.municipio;
                dataToSend.direccionDetallada = formData.direccion.direccionDetallada;
                delete dataToSend.direccion;
            }

            // Formatear teléfono
            if (dataToSend.telefono && !dataToSend.telefono.startsWith('+503')) {
                dataToSend.telefono = '+503' + dataToSend.telefono;
            }

            // Remover campos innecesarios
            delete dataToSend.fromOptometristaPage;

            if (selectedEmpleado) {
                // UPDATE
                await axios.put(`${API_URL}/${selectedEmpleado._id}`, dataToSend);
                showAlert('success', '¡Empleado actualizado exitosamente!');
            } else {
                // CREATE
                await axios.post(`${API_URL}`, dataToSend);
                showAlert('success', '¡Empleado creado exitosamente!');
            }
            fetchData();
            handleCloseModals();
        } catch (error) {
            console.error('Error en handleSubmit:', error);
            console.error('Respuesta del servidor:', error.response?.data);
            showAlert('error', 'Error: ' + (error.response?.data?.message || error.message));
        }
    };
    
    const handleDelete = async () => {
        if (!selectedEmpleado) return;
        try {
            await axios.delete(`${API_URL}/${selectedEmpleado._id}`);
            showAlert('success', '¡Empleado eliminado exitosamente!');
            fetchData();
            handleCloseModals();
        } catch (error) {
            showAlert('error', 'Error al eliminar: ' + (error.response?.data?.message || error.message));
        }
    };

    // CORRECCIÓN 2: Función para determinar el botón de acción correcto
    const getSubmitHandler = () => {
        // Si estamos creando un optometrista, usar el flujo de 2 pasos
        if (!selectedEmpleado && formData.cargo === 'Optometrista') {
            return handleProceedToOptometristaForm;
        }
        // Si estamos editando o creando un empleado regular, usar el submit normal
        return handleSubmit;
    };

    // CORRECCIÓN 3: Función para determinar el texto del botón
    const getSubmitLabel = () => {
        if (selectedEmpleado) {
            return 'Actualizar Empleado';
        }
        if (formData.cargo === 'Optometrista') {
            return 'Continuar';
        }
        return 'Guardar Empleado';
    };

    // --- RENDERIZADO DE TABLA ---
    const getEstadoColor = (estado) => (estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800');
    const getCargoColor = (cargo) => {
        const colors = { 
            'Administrador': 'bg-purple-100 text-purple-800', 
            'Gerente': 'bg-blue-100 text-blue-800', 
            'Vendedor': 'bg-orange-100 text-orange-800', 
            'Optometrista': 'bg-cyan-100 text-cyan-800', 
            'Técnico': 'bg-yellow-100 text-yellow-800', 
            'Recepcionista': 'bg-pink-100 text-pink-800' 
        };
        return colors[cargo] || 'bg-gray-100 text-gray-800';
    };
    const formatFecha = (fecha) => new Date(fecha).toLocaleDateString('es-ES');

    const tableColumns = [
        { header: 'Empleado', key: 'empleado' }, { header: 'Contacto', key: 'contacto' },
        { header: 'Cargo', key: 'cargo' }, { header: 'Sucursal', key: 'sucursal' },
        { header: 'Salario', key: 'salario' }, { header: 'Estado', key: 'estado' },
        { header: 'Acciones', key: 'acciones' }
    ];

    const renderRow = (empleado) => (
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
                        <div className="text-sm text-gray-500">{empleado.dui}</div>
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
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCargoColor(empleado.cargo)}`}>
                    {empleado.cargo}
                </span>
            </td>
            <td className="px-6 py-4 text-gray-600">
                <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>{empleado.sucursalId?.nombre || 'N/A'}</span>
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
                <div className="flex space-x-2">
                    <button 
                        onClick={() => handleOpenDeleteModal(empleado)} 
                        className="p-2 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" 
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleOpenDetailModal(empleado)} 
                        className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" 
                        title="Ver detalles"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleOpenEditModal(empleado)} 
                        className="p-2 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" 
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <Alert alert={alert} />
            <StatsGrid stats={employeeStats} />
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <PageHeader title="Gestión de Empleados" buttonLabel="Añadir Empleado" onButtonClick={handleOpenAddModal} />
                <FilterBar
                    searchTerm={searchTerm}
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, DUI, email o cargo..."
                    filters={[
                        { label: 'Todos', value: 'todos' }, { label: 'Activos', value: 'activos' }, 
                        { label: 'Inactivos', value: 'inactivos' }, { label: 'Principal', value: 'principal' },
                        { label: 'Quezaltepeque', value: 'quezaltepeque' }
                    ]}
                    activeFilter={selectedFilter}
                    onFilterChange={setSelectedFilter}
                />
                <DataTable
                    columns={tableColumns}
                    data={currentEmpleados}
                    renderRow={renderRow}
                    loading={loading}
                    noDataMessage="No se encontraron empleados"
                    noDataSubMessage={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no hay empleados registrados'}
                />
                <Pagination {...paginationProps} />
            </div>
            
            <EmpleadosFormModal
                isOpen={showAddEditModal}
                onClose={handleCloseModals}
                onSubmit={getSubmitHandler()} // CORRECCIÓN: Usar la función correcta
                title={selectedEmpleado ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
                formData={formData}
                setFormData={setFormData}
                handleInputChange={handleInputChange}
                errors={errors}
                submitLabel={getSubmitLabel()} // CORRECCIÓN: Usar el texto correcto
                sucursales={sucursales}
                selectedEmpleado={selectedEmpleado}
                onReturnToOptometristaEdit={() => handleReturnToOptometristaEdit(selectedEmpleado._id)}
            />

            {showOptometristaModal && (
                <OptometristasFormModal
                    isOpen={showOptometristaModal}
                    onClose={() => setShowOptometristaModal(false)}
                    onSubmit={handleFinalizeCreation}
                    title="Añadir Detalles del Optometrista (Paso 2 de 2)"
                    submitLabel="Finalizar y Guardar"
                    isCreationFlow={true}
                    preloadedEmployeeData={tempEmployeeData}
                    sucursales={sucursales}
                    formData={optometristaFormData}
                    setFormData={setOptometristaFormData}
                    handleInputChange={handleOptometristaInputChange}
                    errors={optometristaErrors}
                    empleados={[]}
                    selectedOptometrista={null}
                />
            )}
            
            <DetailModal
                isOpen={showDetailModal}
                onClose={handleCloseModals}
                title="Detalles del Empleado"
                item={selectedEmpleado}
                data={selectedEmpleado ? [
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
                ] : []}
            />

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleCloseModals}
                onConfirm={handleDelete}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que deseas eliminar al empleado ${selectedEmpleado?.nombre} ${selectedEmpleado?.apellido}? Esta acción no se puede deshacer.`}
            />
        </div>
    );
};

export default Empleados;