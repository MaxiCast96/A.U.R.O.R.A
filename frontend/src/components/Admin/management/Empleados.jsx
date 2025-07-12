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
import EmpleadosFormModal from '../management/employees/EmpleadosFormModal';

// Iconos (sin cambios)
import { Users, UserCheck, Building2, DollarSign, Trash2, Eye, Edit, Phone, Mail, Calendar } from 'lucide-react';

// URL base de tu API
const API_URL = 'http://localhost:4000/api'; 

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

    // --- FETCH DE DATOS ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [empleadosRes, sucursalesRes] = await Promise.all([
                axios.get(`${API_URL}/empleados`),
                axios.get(`${API_URL}/sucursales`)
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

    // --- HANDLERS ---
    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const handleCloseModals = () => {
        setShowAddEditModal(false);
        setShowDetailModal(false);
        setShowDeleteModal(false);
        setSelectedEmpleado(null);
        resetForm();
    };
    
    const handleOpenAddModal = () => {
        resetForm();
        setFormData({ // Valores por defecto
            nombre: '', apellido: '', dui: '', telefono: '', correo: '', cargo: '', sucursalId: '',
            fechaContratacion: new Date().toISOString().split('T')[0], // Fecha actual
            salario: '', estado: 'Activo', password: '', fotoPerfil: '',
            direccion: { departamento: '', municipio: '', direccionDetallada: '' }
        });
        setSelectedEmpleado(null);
        setShowAddEditModal(true);
    };

    const handleOpenEditModal = (empleado) => {
        setSelectedEmpleado(empleado);
        
        // Extraer los 8 dígitos si el teléfono ya incluye +503
        const telefonoSinPrefijo = empleado.telefono.startsWith('+503') 
            ? empleado.telefono.substring(4) 
            : empleado.telefono;

        setFormData({
            ...empleado,
            // FIX: Verificar que sucursalId existe antes de acceder a _id
            sucursalId: empleado.sucursalId?._id || '', 
            password: '', // No precargar la contraseña
            fechaContratacion: new Date(empleado.fechaContratacion).toISOString().split('T')[0],
            // FIX: Asegurar que la dirección tenga la estructura correcta
            direccion: empleado.direccion || { departamento: '', municipio: '', direccionDetallada: '' },
            // Usar el teléfono sin el prefijo +503 para el formulario de edición
            telefono: telefonoSinPrefijo
        });
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

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            // Crear una copia del formData para enviar
            const dataToSend = { ...formData };
            
            // Si hay una dirección anidada, aplanarla para el backend
            if (formData.direccion) {
                dataToSend.departamento = formData.direccion.departamento;
                dataToSend.municipio = formData.direccion.municipio;
                dataToSend.direccionDetallada = formData.direccion.direccionDetallada;
                delete dataToSend.direccion; // Eliminar el objeto anidado
            }

            // Asegurar que el teléfono siempre tenga el prefijo +503 antes de enviar
            if (dataToSend.telefono && !dataToSend.telefono.startsWith('+503')) {
                dataToSend.telefono = '+503' + dataToSend.telefono;
            }

            if (selectedEmpleado) {
                // UPDATE
                await axios.put(`${API_URL}/empleados/${selectedEmpleado._id}`, dataToSend);
                showAlert('success', '¡Empleado actualizado exitosamente!');
            } else {
                // CREATE
                await axios.post(`${API_URL}/empleados`, dataToSend);
                showAlert('success', '¡Empleado creado exitosamente!');
            }
            fetchData(); // Recargar datos
            handleCloseModals();
        } catch (error) {
            showAlert('error', 'Error: ' + (error.response?.data?.message || error.message));
        }
    };
    
    const handleDelete = async () => {
        if (!selectedEmpleado) return;
        try {
            await axios.delete(`${API_URL}/empleados/${selectedEmpleado._id}`);
            showAlert('success', '¡Empleado eliminado exitosamente!');
            fetchData(); // Recargar datos
            handleCloseModals();
        } catch (error) {
            showAlert('error', 'Error al eliminar: ' + (error.response?.data?.message || error.message));
        }
    };

    // --- RENDERIZADO DE TABLA ---
    const getEstadoColor = (estado) => (estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800');
    const getCargoColor = (cargo) => {
      const colors = { 'Administrador': 'bg-purple-100 text-purple-800', 'Gerente': 'bg-blue-100 text-blue-800', 'Vendedor': 'bg-orange-100 text-orange-800', 'Optometrista': 'bg-cyan-100 text-cyan-800', 'Técnico': 'bg-yellow-100 text-yellow-800', 'Recepcionista': 'bg-pink-100 text-pink-800' };
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
                onSubmit={handleSubmit}
                title={selectedEmpleado ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
                formData={formData}
                setFormData={setFormData}
                handleInputChange={handleInputChange}
                errors={errors}
                submitLabel={selectedEmpleado ? 'Actualizar Empleado' : 'Guardar Empleado'}
                sucursales={sucursales}
                selectedEmpleado={selectedEmpleado}
            />
            
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