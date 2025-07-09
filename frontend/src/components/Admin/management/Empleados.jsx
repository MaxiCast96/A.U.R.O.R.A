import React, { useState, useMemo } from 'react';
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

// Modal de Formulario Específico
import EmpleadosFormModal from '../management/employees/EmpleadosFormModal';

// Iconos
import { Users, UserCheck, Building2, DollarSign, Trash2, Eye, Edit, Phone, Mail, Calendar } from 'lucide-react';

// Datos de ejemplo para empleados
const initialEmpleados = [
    { _id: "fc74ad6ca603ba1e993ccbc5", nombre: "Carlos", apellido: "Rodríguez", dui: "034279044-1", telefono: "+50378901234", correo: "carlos.rodriguez@optica.com", direccion: { departamento: "San Salvador", municipio: "San Salvador", direccion: "Colonia Escalón, Calle Principal #123" }, cargo: "Administrador", sucursal: "Principal", fechaContratacion: "2021-03-14", salario: 850.00, estado: "Activo", fotoPerfil: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
    { _id: "ac84bd7db704cb2f004ddcd6", nombre: "María", apellido: "González", dui: "045380155-2", telefono: "+50379012345", correo: "maria.gonzalez@optica.com", direccion: { departamento: "La Libertad", municipio: "Quezaltepeque", direccion: "Barrio El Centro, 2da Avenida Norte #45" }, cargo: "Gerente", sucursal: "Quezaltepeque", fechaContratacion: "2022-01-09", salario: 750.00, estado: "Activo", fotoPerfil: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" },
    { _id: "bc94ce8ec815dc3g115eede7", nombre: "Juan", apellido: "Pérez", dui: "056491266-3", telefono: "+50380123456", correo: "juan.perez@optica.com", direccion: { departamento: "San Salvador", municipio: "San Salvador", direccion: "Colonia Miramonte, Pasaje Los Robles #67" }, cargo: "Empleado", sucursal: "Principal", fechaContratacion: "2020-05-19", salario: 1200.00, estado: "Activo", fotoPerfil: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
    { _id: "de14e0a0ea37fe5i337g0fg9", nombre: "Luis", apellido: "Hernández", dui: "078613488-5", telefono: "+50382345678", correo: "luis.hernandez@optica.com", direccion: { departamento: "San Salvador", municipio: "San Salvador", direccion: "Colonia Centroamérica, Avenida España #234" }, cargo: "Vendedor", sucursal: "Principal", fechaContratacion: "2023-08-23", salario: 650.00, estado: "Activo", fotoPerfil: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
    { _id: "ef25f1b1fb48gf6j448h1g0a", nombre: "Carmen", apellido: "López", dui: "089724599-6", telefono: "+50383456789", correo: "carmen.lopez@optica.com", direccion: { departamento: "La Libertad", municipio: "Quezaltepeque", direccion: "Barrio San Antonio, 1ra Avenida Sur #12" }, cargo: "Optometrista", sucursal: "Quezaltepeque", fechaContratacion: "2021-09-09", salario: 950.00, estado: "Inactivo", fotoPerfil: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face" },
];

const Empleados = () => {
    // --- ESTADOS ---
    const [empleados, setEmpleados] = useState(initialEmpleados);
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);
    const [alert, setAlert] = useState(null);
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('todos');

    // --- FILTRADO Y PAGINACIÓN ---
    const filteredEmpleados = useMemo(() => empleados.filter(empleado => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = `${empleado.nombre} ${empleado.apellido}`.toLowerCase().includes(search) ||
            empleado.dui.includes(search) ||
            empleado.correo.toLowerCase().includes(search) ||
            empleado.cargo.toLowerCase().includes(search);
        
        let matchesFilter = true;
        if (selectedFilter === 'principal') matchesFilter = empleado.sucursal === 'Principal';
        else if (selectedFilter === 'quezaltepeque') matchesFilter = empleado.sucursal === 'Quezaltepeque';
        else if (selectedFilter === 'activos') matchesFilter = empleado.estado === 'Activo';
        else if (selectedFilter === 'inactivos') matchesFilter = empleado.estado === 'Inactivo';
        
        return matchesSearch && matchesFilter;
    }), [empleados, searchTerm, selectedFilter]);

    const { paginatedData: currentEmpleados, ...paginationProps } = usePagination(filteredEmpleados, 5);

    // --- FORMULARIO ---
    const { formData, setFormData, handleInputChange, resetForm, validateForm, errors, setErrors } = useForm({
        nombre: '', apellido: '', dui: '', telefono: '', correo: '', cargo: '', sucursal: '',
        fechaContratacion: '', salario: '', estado: 'Activo', fotoPerfil: '',
        'direccion.departamento': '', 'direccion.municipio': '', 'direccion.direccion': ''
    }, (data) => {
        const newErrors = {};
        if (!data.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
        if (!data.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
        if (!/^\d{8}-\d$/.test(data.dui)) newErrors.dui = 'DUI inválido (formato: 12345678-9)';
        if (!/^\+503\d{8}$/.test(data.telefono)) newErrors.telefono = 'Teléfono inválido (+503XXXXXXXX)';
        if (!/\S+@\S+\.\S+/.test(data.correo)) newErrors.correo = 'Email inválido';
        if (!data.cargo) newErrors.cargo = 'El cargo es requerido';
        if (!data.sucursal) newErrors.sucursal = 'La sucursal es requerida';
        if (!data.salario || data.salario <= 0) newErrors.salario = 'Salario inválido';
        return newErrors;
    });
    
    // --- ESTADÍSTICAS ---
    const totalEmpleados = empleados.length;
    const empleadosActivos = empleados.filter(e => e.estado === 'Activo').length;
    const empleadosPrincipal = empleados.filter(e => e.sucursal === 'Principal').length;
    const nominaTotal = empleados.filter(e => e.estado === 'Activo').reduce((sum, e) => sum + e.salario, 0);
    const formatSalario = (salario) => `$${salario.toFixed(2)}`;

    const employeeStats = [
        { title: 'Total Empleados', value: totalEmpleados, Icon: Users, color: 'cyan' },
        { title: 'Empleados Activos', value: empleadosActivos, Icon: UserCheck, color: 'green' },
        { title: 'Sucursal Principal', value: empleadosPrincipal, Icon: Building2, color: 'blue' },
        { title: 'Nómina Total (Activos)', value: formatSalario(nominaTotal), Icon: DollarSign, color: 'purple' }
    ];

    // --- HANDLERS Y LÓGICA DE MODALES ---
    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 4000);
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
        setSelectedEmpleado(null);
        setShowAddEditModal(true);
    };

    const handleOpenEditModal = (empleado) => {
        setSelectedEmpleado(empleado);
        setFormData({
            ...empleado,
            'direccion.departamento': empleado.direccion.departamento,
            'direccion.municipio': empleado.direccion.municipio,
            'direccion.direccion': empleado.direccion.direccion,
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

    const handleSubmit = () => {
        if (!validateForm()) return;

        const updatedData = {
            ...formData,
            salario: parseFloat(formData.salario),
            direccion: {
                departamento: formData['direccion.departamento'],
                municipio: formData['direccion.municipio'],
                direccion: formData['direccion.direccion'],
            }
        };

        if (selectedEmpleado) {
            setEmpleados(empleados.map(e => e._id === selectedEmpleado._id ? { ...selectedEmpleado, ...updatedData } : e));
            showAlert('success', '¡Empleado actualizado exitosamente!');
        } else {
            setEmpleados([...empleados, { ...updatedData, _id: Date.now().toString() }]);
            showAlert('success', '¡Empleado agregado exitosamente!');
        }
        handleCloseModals();
    };

    const handleDelete = () => {
        setEmpleados(empleados.filter(c => c._id !== selectedEmpleado._id));
        showAlert('success', '¡Empleado eliminado exitosamente!');
        handleCloseModals();
    };

    // --- DEFINICIONES Y RENDERIZADO DE TABLA ---
    const getEstadoColor = (estado) => (estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800');
    const getCargoColor = (cargo) => {
        const colors = { 'Administrador': 'bg-purple-100 text-purple-800', 'Gerente': 'bg-blue-100 text-blue-800', 'Empleado': 'bg-green-100 text-green-800', 'Vendedor': 'bg-orange-100 text-orange-800', 'Optometrista': 'bg-cyan-100 text-cyan-800', 'Técnico': 'bg-yellow-100 text-yellow-800', 'Recepcionista': 'bg-pink-100 text-pink-800' };
        return colors[cargo] || 'bg-gray-100 text-gray-800';
    };
    const formatFecha = (fecha) => new Date(fecha).toLocaleDateString('es-ES');

    const tableColumns = [{ header: 'Empleado', key: 'empleado' }, { header: 'Contacto', key: 'contacto' }, { header: 'Cargo', key: 'cargo' }, { header: 'Sucursal', key: 'sucursal' }, { header: 'Salario', key: 'salario' }, { header: 'Estado', key: 'estado' }, { header: 'Acciones', key: 'acciones' }];
    const renderRow = (empleado) => (
        <>
            <td className="px-6 py-4"><div className="flex items-center space-x-3"><img src={empleado.fotoPerfil} alt={`${empleado.nombre}`} className="w-10 h-10 rounded-full object-cover" /><div><div className="font-medium text-gray-900">{empleado.nombre} {empleado.apellido}</div><div className="text-sm text-gray-500">{empleado.dui}</div></div></div></td>
            <td className="px-6 py-4 text-gray-600 text-sm"><div className="space-y-1"><div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-gray-400" /><span>{empleado.telefono}</span></div><div className="flex items-center space-x-2"><Mail className="w-4 h-4 text-gray-400" /><span>{empleado.correo}</span></div></div></td>
            <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-sm font-medium ${getCargoColor(empleado.cargo)}`}>{empleado.cargo}</span></td>
            <td className="px-6 py-4 text-gray-600"><div className="flex items-center space-x-2"><Building2 className="w-4 h-4 text-gray-400" /><span>{empleado.sucursal}</span></div></td>
            <td className="px-6 py-4 font-mono font-semibold text-cyan-700">{formatSalario(empleado.salario)}</td>
            <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(empleado.estado)}`}>{empleado.estado}</span></td>
            <td className="px-6 py-4"><div className="flex space-x-2"><button onClick={() => handleOpenDeleteModal(empleado)} className="p-2 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" title="Eliminar"><Trash2 className="w-4 h-4" /></button><button onClick={() => handleOpenDetailModal(empleado)} className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" title="Ver detalles"><Eye className="w-4 h-4" /></button><button onClick={() => handleOpenEditModal(empleado)} className="p-2 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" title="Editar"><Edit className="w-4 h-4" /></button></div></td>
        </>
    );

    // --- RENDERIZADO DEL COMPONENTE ---
    return (
        <div className="space-y-6 animate-fade-in">
            <Alert alert={alert} />
            <StatsGrid stats={employeeStats} />
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <PageHeader title="Gestión de Empleados" buttonLabel="Añadir Empleado" onButtonClick={handleOpenAddModal} />
                <FilterBar
                    searchTerm={searchTerm}
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    searchPlaceholder="Buscar por nombre, DUI, email o cargo..."
                    filters={[
                        { label: 'Todos', value: 'todos' }, { label: 'Activos', value: 'activos' }, { label: 'Inactivos', value: 'inactivos' }, { label: 'Principal', value: 'principal' }, { label: 'Quezaltepeque', value: 'quezaltepeque' }
                    ]}
                    activeFilter={selectedFilter}
                    onFilterChange={setSelectedFilter}
                />
                <DataTable
                    columns={tableColumns}
                    data={currentEmpleados}
                    renderRow={renderRow}
                    noDataMessage="No se encontraron empleados"
                    noDataSubMessage={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza registrando tu primer empleado'}
                />
                <Pagination {...paginationProps} />
            </div>
            
            <EmpleadosFormModal
                isOpen={showAddEditModal}
                onClose={handleCloseModals}
                onSubmit={handleSubmit}
                title={selectedEmpleado ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
                formData={formData}
                handleInputChange={handleInputChange}
                errors={errors}
                submitLabel={selectedEmpleado ? 'Actualizar Empleado' : 'Guardar Empleado'}
            />

            
<DetailModal
    isOpen={showDetailModal}
    onClose={handleCloseModals}
    title="Detalles del Empleado"
    item={selectedEmpleado} // <-- Añade esta línea
    data={selectedEmpleado ? [
        { label: "Nombre", value: `${selectedEmpleado.nombre} ${selectedEmpleado.apellido}` },
        { label: "DUI", value: selectedEmpleado.dui },
        { label: "Contacto", value: `${selectedEmpleado.telefono} / ${selectedEmpleado.correo}` },
        { label: "Dirección", value: `${selectedEmpleado.direccion.direccion}, ${selectedEmpleado.direccion.municipio}, ${selectedEmpleado.direccion.departamento}`},
        { label: "Cargo", value: selectedEmpleado.cargo, color: getCargoColor(selectedEmpleado.cargo) },
        { label: "Sucursal", value: selectedEmpleado.sucursal },
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
                message={`¿Estás seguro de que deseas eliminar al empleado ${selectedEmpleado?.nombre} ${selectedEmpleado?.apellido}?`}
            />
        </div>
    );
};

export default Empleados;