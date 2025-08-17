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
const API_URL = 'http://localhost:4000/api/empleados';
const SUCURSALES_URL = 'http://localhost:4000/api/sucursales';
const OPTOMETRISTAS_URL = 'http://localhost:4000/api/optometrista'; // CORECCIÓN: URL correcta

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
    const [showCargoChangeWarning, setShowCargoChangeWarning] = useState(false); // NUEVO: Para advertencia de cambio de cargo

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

    // --- FORMULARIO EMPLEADO ---
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

    // --- ESTADÍSTICAS ---
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

    // CORRECCIÓN: Función para validar el formulario de optometrista
    const validateOptometristaForm = () => {
        const newErrors = {};
        
        console.log('🔍 Validando formulario de optometrista...');
        console.log('Datos a validar:', optometristaFormData);
        
        if (!optometristaFormData.especialidad) {
            newErrors.especialidad = 'La especialidad es requerida';
        }
        if (!optometristaFormData.licencia) {
            newErrors.licencia = 'La licencia es requerida';
        }
        if (!optometristaFormData.experiencia || optometristaFormData.experiencia < 0) {
            newErrors.experiencia = 'La experiencia debe ser un número positivo';
        }
        if (!optometristaFormData.sucursalesAsignadas || optometristaFormData.sucursalesAsignadas.length === 0) {
            newErrors.sucursalesAsignadas = 'Debe asignar al menos una sucursal';
        }
        if (!optometristaFormData.disponibilidad || optometristaFormData.disponibilidad.length === 0) {
            newErrors.disponibilidad = 'Debe configurar al menos una hora de disponibilidad';
        }
        
        setOptometristaErrors(newErrors);
        
        const isValid = Object.keys(newErrors).length === 0;
        console.log('✅ Validación resultado:', isValid ? 'VÁLIDO' : 'INVÁLIDO');
        if (!isValid) {
            console.log('❌ Errores encontrados:', newErrors);
        }
        
        return isValid;
    };

    // Step 1: Called from EmpleadosFormModal when "Siguiente" is clicked
    const handleProceedToOptometristaForm = () => {
        if (!validateForm()) {
            console.log('❌ Validación del formulario de empleado falló');
            return;
        }
        
        console.log('=== PROCEDIENDO AL FORMULARIO DE OPTOMETRISTA ===');
        console.log('Datos del formulario de empleado:', formData);
        
        // Preparar datos completos del empleado
        const completeEmployeeData = {
            ...formData,
            fotoPerfil: formData.fotoPerfil || '',
            // Aplanar la dirección para el backend
            departamento: formData.direccion?.departamento || '',
            municipio: formData.direccion?.municipio || '',
            direccionDetallada: formData.direccion?.direccionDetallada || '',
            // Formatear teléfono
            telefono: formData.telefono?.startsWith('+503') 
                ? formData.telefono 
                : '+503' + formData.telefono
        };
        
        // Remover el objeto direccion anidado ya que lo aplanamos
        delete completeEmployeeData.direccion;
        delete completeEmployeeData.fromOptometristaPage;
        
        console.log('📦 Datos completos del empleado preparados:', completeEmployeeData);
        
        setTempEmployeeData(completeEmployeeData);
        setShowAddEditModal(false);
        
        // Resetear el formulario de optometrista con valores iniciales
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
        
        setShowOptometristaModal(true);
        console.log('✅ Transición al modal de optometrista completada');
    };
    
    // CORRECCIÓN: Step 2: Finalizar creación de empleado + optometrista
    const handleFinalizeCreation = async () => {
        if (!validateOptometristaForm()) {
            console.log('❌ Validación del formulario de optometrista falló');
            return;
        }

        try {
            setLoading(true);
            
            console.log('=== INICIO DE CREACIÓN EMPLEADO + OPTOMETRISTA ===');
            console.log('Datos del empleado (tempEmployeeData):', tempEmployeeData);
            console.log('Datos del optometrista (optometristaFormData):', optometristaFormData);
            
            // 1. CREAR EL EMPLEADO PRIMERO
            const employeeResponse = await axios.post(API_URL, tempEmployeeData);
            const newEmployeeId = employeeResponse.data._id;

            console.log('✅ Empleado creado exitosamente:', employeeResponse.data);
            console.log('🆔 Nuevo empleadoId:', newEmployeeId);

            // 2. CREAR EL OPTOMETRISTA CON EL ID DEL EMPLEADO RECIÉN CREADO
            const finalOptometristaData = {
                ...optometristaFormData,
                empleadoId: newEmployeeId,
                // Asegurar que los arrays estén bien formateados
                disponibilidad: Array.isArray(optometristaFormData.disponibilidad) 
                    ? optometristaFormData.disponibilidad 
                    : [],
                sucursalesAsignadas: Array.isArray(optometristaFormData.sucursalesAsignadas) 
                    ? optometristaFormData.sucursalesAsignadas 
                    : []
            };
            
            console.log('📋 Datos finales para optometrista:', finalOptometristaData);
            
            const optometristaResponse = await axios.post(OPTOMETRISTAS_URL, finalOptometristaData);
            
            console.log('✅ Optometrista creado exitosamente:', optometristaResponse.data);

            showAlert('success', '¡Empleado y Optometrista creados exitosamente!');
            handleCloseModals();
            
            // Recargar datos antes de navegar
            await fetchData();
            
            // Navegar a la página de optometristas
            navigate('/optometristas');

        } catch (error) {
            console.error('❌ Error en la creación:', error);
            console.error('📄 Respuesta del servidor:', error.response?.data);
            
            let errorMessage = 'Error en la creación: ';
            if (error.response?.data?.message) {
                errorMessage += error.response.data.message;
            } else if (error.message) {
                errorMessage += error.message;
            } else {
                errorMessage += 'Error desconocido';
            }
            
            showAlert('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // NUEVO: Función para regresar del modal de optometrista al de empleado
    const handleBackToEmployeeForm = () => {
        console.log('🔙 Regresando al formulario de empleado');
        setShowOptometristaModal(false);
        setShowAddEditModal(true);
        
        // Restaurar los datos del empleado desde tempEmployeeData
        if (tempEmployeeData) {
            const restoredFormData = {
                ...tempEmployeeData,
                // Restaurar la estructura de dirección anidada
                direccion: {
                    departamento: tempEmployeeData.departamento || '',
                    municipio: tempEmployeeData.municipio || '',
                    direccionDetallada: tempEmployeeData.direccionDetallada || ''
                },
                // Restaurar teléfono sin el +503
                telefono: tempEmployeeData.telefono?.startsWith('+503') 
                    ? tempEmployeeData.telefono.substring(4) 
                    : tempEmployeeData.telefono || ''
            };
            
            // Remover campos aplanados
            delete restoredFormData.departamento;
            delete restoredFormData.municipio;
            delete restoredFormData.direccionDetallada;
            
            setFormData(restoredFormData);
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
        console.log(`🚨 Alert [${type.toUpperCase()}]: ${message}`);
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const handleCloseModals = () => {
        setShowAddEditModal(false);
        setShowDetailModal(false);
        setShowDeleteModal(false);
        setShowOptometristaModal(false);
        setShowCargoChangeWarning(false); // NUEVO
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
            fromOptometristaPage: fromOptometristaPage,
            originalCargo: empleado.cargo // NUEVO: Guardar el cargo original
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

    // NUEVO: Función para verificar si un empleado es optometrista
    const checkIfOptometrista = async (empleadoId) => {
        try {
            const response = await axios.get(`${OPTOMETRISTAS_URL}/empleado/${empleadoId}`);
            return response.data; // Retorna el optometrista si existe
        } catch (error) {
            return null; // No existe como optometrista
        }
    };

    // NUEVO: Función para eliminar optometrista
    const deleteOptometrista = async (empleadoId) => {
        try {
            const optometrista = await checkIfOptometrista(empleadoId);
            if (optometrista) {
                await axios.delete(`${OPTOMETRISTAS_URL}/${optometrista._id}`);
                console.log('✅ Optometrista eliminado exitosamente');
            }
        } catch (error) {
            console.error('❌ Error al eliminar optometrista:', error);
            throw error;
        }
    };

    // CORRECCIÓN: Función handleSubmit principal para empleados
    const handleSubmit = async () => {
        if (!validateForm()) return;

        // NUEVO: Verificar cambio de cargo para empleados existentes
        if (selectedEmpleado && selectedEmpleado.cargo === 'Optometrista' && formData.cargo !== 'Optometrista') {
            // El empleado era optometrista y ahora NO es optometrista
            setShowCargoChangeWarning(true);
            return;
        }

        // NUEVO: Verificar si cambió de NO optometrista a optometrista
        if (selectedEmpleado && selectedEmpleado.cargo !== 'Optometrista' && formData.cargo === 'Optometrista') {
            // El empleado NO era optometrista y ahora SÍ es optometrista
            // Proceder al flujo de optometrista
            handleProceedToOptometristaForm();
            return;
        }

        try {
            await performEmployeeUpdate();
        } catch (error) {
            console.error('Error en handleSubmit:', error);
            showAlert('error', 'Error: ' + (error.response?.data?.message || error.message));
        }
    };

    // NUEVO: Función separada para realizar la actualización del empleado
    const performEmployeeUpdate = async () => {
        const dataToSend = { ...formData };
        
        console.log('Datos a enviar:', dataToSend);
        
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
        delete dataToSend.originalCargo;

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
    };

    // NUEVO: Confirmar cambio de cargo con eliminación de optometrista
    const handleConfirmCargoChange = async () => {
        try {
            setLoading(true);
            
            // 1. Eliminar el optometrista primero
            await deleteOptometrista(selectedEmpleado._id);
            
            // 2. Actualizar el empleado
            await performEmployeeUpdate();
            
            showAlert('success', '¡Empleado actualizado y configuración de optometrista eliminada exitosamente!');
            setShowCargoChangeWarning(false);
            
        } catch (error) {
            console.error('Error al cambiar cargo:', error);
            showAlert('error', 'Error al cambiar cargo: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async () => {
        if (!selectedEmpleado) return;
        try {
            // NUEVO: Si es optometrista, eliminar también de la tabla de optometristas
            if (selectedEmpleado.cargo === 'Optometrista') {
                await deleteOptometrista(selectedEmpleado._id);
            }
            
            await axios.delete(`${API_URL}/${selectedEmpleado._id}`);
            showAlert('success', '¡Empleado eliminado exitosamente!');
            fetchData();
            handleCloseModals();
        } catch (error) {
            showAlert('error', 'Error al eliminar: ' + (error.response?.data?.message || error.message));
        }
    };

    // Función para determinar el botón de acción correcto
    const getSubmitHandler = () => {
        // Si estamos creando un optometrista, usar el flujo de 2 pasos
        if (!selectedEmpleado && formData.cargo === 'Optometrista') {
            return handleProceedToOptometristaForm;
        }
        // Si estamos editando o creando un empleado regular, usar el submit normal
        return handleSubmit;
    };

    // Función para determinar el texto del botón
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
            
            {/* Modal principal de empleados */}
            <EmpleadosFormModal
                isOpen={showAddEditModal}
                onClose={handleCloseModals}
                onSubmit={getSubmitHandler()}
                title={selectedEmpleado ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
                formData={formData}
                setFormData={setFormData}
                handleInputChange={handleInputChange}
                errors={errors}
                submitLabel={getSubmitLabel()}
                sucursales={sucursales}
                selectedEmpleado={selectedEmpleado}
                onReturnToOptometristaEdit={() => handleReturnToOptometristaEdit(selectedEmpleado._id)}
            />

            {/* Modal de optometrista (paso 2) */}
            {showOptometristaModal && (
                <OptometristasFormModal
                    isOpen={showOptometristaModal}
                    onClose={handleCloseModals}
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
                    onBackToEmployeeForm={handleBackToEmployeeForm} // NUEVO: Botón de regresar
                />
            )}

            {/* NUEVO: Modal de confirmación para cambio de cargo */}
            <ConfirmationModal
                isOpen={showCargoChangeWarning}
                onClose={() => setShowCargoChangeWarning(false)}
                onConfirm={handleConfirmCargoChange}
                title="⚠️ Advertencia: Cambio de Cargo"
                message={`Este empleado es actualmente un Optometrista. Al cambiar su cargo, se eliminará toda su configuración de optometrista (horarios, sucursales asignadas, especialidad, etc.). ¿Está seguro de continuar?`}
                confirmLabel="Sí, cambiar cargo"
                cancelLabel="Cancelar"
                type="warning"
            />
            
            {/* Modal de detalles */}
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

            {/* Modal de confirmación para eliminar */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleCloseModals}
                onConfirm={handleDelete}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que deseas eliminar al empleado ${selectedEmpleado?.nombre} ${selectedEmpleado?.apellido}? Esta acción no se puede deshacer.${selectedEmpleado?.cargo === 'Optometrista' ? '\n\n⚠️ Nota: También se eliminará su configuración de optometrista.' : ''}`}
            />
        </div>
    );
};

export default Empleados;