import React, { useState, useMemo } from 'react';
import { useForm } from '../../../hooks/admin/useForm';
import { usePagination } from '../../../hooks/admin/usePagination';

// Importación de Componentes de UI
import PageHeader from '../ui/PageHeader';
import StatsGrid from '../ui/StatsGrid';
import FilterBar from '../ui/FilterBar';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import ConfirmationModal from '../ui/ConfirmationModal';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';

// Importación del componente de formulario específico para clientes
import ClientesFormModal from './employees/ClientesFormModal'; // Asegúrate que la ruta sea correcta

// Iconos
import { Users, UserCheck, UserX, Trash2, Eye, Edit, Phone, Mail, MapPin } from 'lucide-react';

// Datos de ejemplo
const initialClientes = [
    { _id: "60ed4a45524bcd4877bd8d4f", nombre: "Luis", apellido: "López", edad: 34, dui: "64565911-0", telefono: "+50366545426606", correo: "user1@mail.com", direccion: { calle: "Calle Principal 123", ciudad: "San Salvador", departamento: "San Salvador" }, password: "encrypted_password", estado: "Activo", fechaRegistro: "2024-01-15" },
    { _id: "60ed4a45524bcd4877bd8d50", nombre: "María", apellido: "González", edad: 28, dui: "12345678-9", telefono: "+50377889900", correo: "maria.gonzalez@mail.com", direccion: { calle: "Avenida Las Flores 456", ciudad: "Santa Tecla", departamento: "La Libertad" }, password: "encrypted_password", estado: "Activo", fechaRegistro: "2024-01-20" },
    { _id: "60ed4a45524bcd4877bd8d51", nombre: "Carlos", apellido: "Martínez", edad: 45, dui: "98765432-1", telefono: "+50366778899", correo: "carlos.martinez@mail.com", direccion: { calle: "Boulevard Los Héroes 789", ciudad: "San Salvador", departamento: "San Salvador" }, password: "encrypted_password", estado: "Inactivo", fechaRegistro: "2024-02-01" },
];

const Clientes = () => {
    // --- ESTADOS ---
    const [clientes, setClientes] = useState(initialClientes);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [alert, setAlert] = useState(null);
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('todos');

    // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
    const filteredClientes = useMemo(() => clientes.filter(cliente => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(search) ||
            cliente.dui.includes(search) ||
            cliente.correo.toLowerCase().includes(search) ||
            cliente.telefono.includes(searchTerm);
        const matchesFilter = selectedFilter === 'todos' || cliente.estado.toLowerCase() === selectedFilter;
        return matchesSearch && matchesFilter;
    }), [clientes, searchTerm, selectedFilter]);

    const { paginatedData: currentClientes, ...paginationProps } = usePagination(filteredClientes, 5);

    // --- MANEJO DEL FORMULARIO Y VALIDACIÓN ---
    const { formData, setFormData, handleInputChange, resetForm, validateForm, errors, setErrors } = useForm({
        nombre: '', apellido: '', edad: '', dui: '', telefono: '', correo: '', calle: '', ciudad: '', departamento: '', estado: 'Activo'
    }, (data) => {
        const newErrors = {};
        if (!data.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
        if (!data.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
        if (!data.edad || data.edad < 1 || data.edad > 120) newErrors.edad = 'Edad inválida';
        if (!/^\d{8}-\d$/.test(data.dui)) newErrors.dui = 'DUI inválido (formato: 12345678-9)';
        if (!/^\+503\d{8}$/.test(data.telefono)) newErrors.telefono = 'Teléfono inválido (+503XXXXXXXX)';
        if (!/\S+@\S+\.\S+/.test(data.correo)) newErrors.correo = 'Email inválido';
        if (!data.calle.trim()) newErrors.calle = 'La dirección es requerida';
        if (!data.ciudad.trim()) newErrors.ciudad = 'La ciudad es requerida';
        if (!data.departamento.trim()) newErrors.departamento = 'El departamento es requerido';
        return newErrors;
    });

    // --- HANDLERS PARA MODALES Y ACCIONES CRUD ---
    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 4000);
    };

    const handleCloseModals = () => {
        setShowAddEditModal(false);
        setShowDetailModal(false);
        setShowDeleteModal(false);
        setSelectedCliente(null);
        resetForm();
    };

    const handleOpenAddModal = () => {
        resetForm();
        setSelectedCliente(null);
        setShowAddEditModal(true);
    };
    
    const handleOpenEditModal = (cliente) => {
        setSelectedCliente(cliente);
        setFormData({
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            edad: cliente.edad.toString(),
            dui: cliente.dui,
            telefono: cliente.telefono,
            correo: cliente.correo,
            calle: cliente.direccion.calle,
            ciudad: cliente.direccion.ciudad,
            departamento: cliente.direccion.departamento,
            estado: cliente.estado,
        });
        setErrors({});
        setShowAddEditModal(true);
    };

    const handleOpenDetailModal = (cliente) => {
        setSelectedCliente(cliente);
        setShowDetailModal(true);
    };

    const handleOpenDeleteModal = (cliente) => {
        setSelectedCliente(cliente);
        setShowDeleteModal(true);
    };
    
    const handleSubmit = () => {
        if (!validateForm()) return;
        if (selectedCliente) {
            setClientes(clientes.map(c => c._id === selectedCliente._id ? {
                ...c,
                nombre: formData.nombre,
                apellido: formData.apellido,
                edad: parseInt(formData.edad),
                dui: formData.dui,
                telefono: formData.telefono,
                correo: formData.correo,
                direccion: { calle: formData.calle, ciudad: formData.ciudad, departamento: formData.departamento },
                estado: formData.estado
            } : c));
            showAlert('success', '¡Cliente actualizado exitosamente!');
        } else {
            const newCliente = {
                _id: Date.now().toString(),
                nombre: formData.nombre,
                apellido: formData.apellido,
                edad: parseInt(formData.edad),
                dui: formData.dui,
                telefono: formData.telefono,
                correo: formData.correo,
                direccion: { calle: formData.calle, ciudad: formData.ciudad, departamento: formData.departamento },
                estado: formData.estado,
                fechaRegistro: new Date().toISOString().split('T')[0],
                password: "encrypted_password",
            };
            setClientes([...clientes, newCliente]);
            showAlert('success', '¡Cliente agregado exitosamente!');
        }
        handleCloseModals();
    };

    const handleDelete = () => {
        setClientes(clientes.filter(c => c._id !== selectedCliente._id));
        showAlert('success', '¡Cliente eliminado exitosamente!');
        handleCloseModals();
    };

    // --- DEFINICIONES PARA LA TABLA ---
    const getEstadoColor = (estado) => (
        estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    );
    const tableColumns = [
        { header: 'Cliente', key: 'cliente' },
        { header: 'DUI', key: 'dui' },
        { header: 'Contacto', key: 'contacto' },
        { header: 'Dirección', key: 'direccion' },
        { header: 'Estado', key: 'estado' },
        { header: 'Fecha Registro', key: 'fechaRegistro' },
        { header: 'Acciones', key: 'acciones' },
    ];
    const renderRow = (cliente) => (
        <>
            <td className="px-6 py-4"><div className="flex items-center space-x-3"><div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center"><span className="text-cyan-600 font-semibold">{cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}</span></div><div><div className="font-medium text-gray-900">{cliente.nombre} {cliente.apellido}</div><div className="text-sm text-gray-500">{cliente.edad} años</div></div></div></td>
            <td className="px-6 py-4 text-gray-600 font-mono">{cliente.dui}</td>
            <td className="px-6 py-4 text-gray-600 text-sm"><div className="space-y-1"><div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-gray-400" /><span>{cliente.telefono}</span></div><div className="flex items-center space-x-2"><Mail className="w-4 h-4 text-gray-400" /><span>{cliente.correo}</span></div></div></td>
            <td className="px-6 py-4 text-gray-600 text-sm"><div className="flex items-start space-x-2"><MapPin className="w-4 h-4 text-gray-400 mt-0.5" /><div><div>{cliente.direccion.calle}</div><div className="text-gray-500">{cliente.direccion.ciudad}, {cliente.direccion.departamento}</div></div></div></td>
            <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(cliente.estado)}`}>{cliente.estado}</span></td>
            <td className="px-6 py-4 text-gray-600">{cliente.fechaRegistro}</td>
            <td className="px-6 py-4"><div className="flex space-x-2"><button onClick={() => handleOpenDeleteModal(cliente)} className="p-2 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" title="Eliminar"><Trash2 className="w-4 h-4" /></button><button onClick={() => handleOpenDetailModal(cliente)} className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" title="Ver detalles"><Eye className="w-4 h-4" /></button><button onClick={() => handleOpenEditModal(cliente)} className="p-2 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" title="Editar"><Edit className="w-4 h-4" /></button></div></td>
        </>
    );

    // --- RENDERIZADO DEL COMPONENTE ---
    return (
        <div className="space-y-6 animate-fade-in">
            <Alert alert={alert} />
            <StatsGrid stats={[
                { title: 'Total Clientes', value: clientes.length, Icon: Users, color: 'cyan' },
                { title: 'Clientes Activos', value: clientes.filter(c => c.estado === 'Activo').length, Icon: UserCheck, color: 'green' },
                { title: 'Clientes Inactivos', value: clientes.filter(c => c.estado === 'Inactivo').length, Icon: UserX, color: 'red' },
            ]} />
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <PageHeader title="Gestión de Clientes" buttonLabel="Añadir Cliente" onButtonClick={handleOpenAddModal} />
                <FilterBar
                    searchTerm={searchTerm}
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    searchPlaceholder="Buscar cliente por nombre, DUI, email o teléfono..."
                    filters={[
                        { label: 'Todos', value: 'todos' },
                        { label: 'Activos', value: 'activo' },
                        { label: 'Inactivos', value: 'inactivo' },
                    ]}
                    activeFilter={selectedFilter}
                    onFilterChange={setSelectedFilter}
                />
                <DataTable
                    columns={tableColumns}
                    data={currentClientes}
                    renderRow={renderRow}
                    noDataMessage="No se encontraron clientes"
                    noDataSubMessage={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza registrando tu primer cliente'}
                />
                <Pagination {...paginationProps} />
            </div>
            
            {/* MODAL DE FORMULARIO REFACORIZADO */}
            <ClientesFormModal
                isOpen={showAddEditModal}
                onClose={handleCloseModals}
                onSubmit={handleSubmit}
                title={selectedCliente ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
                formData={formData}
                handleInputChange={handleInputChange}
                errors={errors}
                submitLabel={selectedCliente ? 'Actualizar Cliente' : 'Guardar Cliente'}
            />

            <DetailModal
    isOpen={showDetailModal}
    onClose={handleCloseModals}
    title="Detalles del Cliente"
    item={selectedCliente}
    data={selectedCliente ? [
        { label: "Nombre Completo", value: `${selectedCliente.nombre} ${selectedCliente.apellido}` },
        { label: "DUI", value: selectedCliente.dui },
        { label: "Edad", value: `${selectedCliente.edad} años` },
        { label: "Teléfono", value: selectedCliente.telefono },
        { label: "Correo Electrónico", value: selectedCliente.correo },
        { 
            label: "Dirección", 
            value: `${selectedCliente.direccion.calle}, ${selectedCliente.direccion.ciudad}, ${selectedCliente.direccion.departamento}` 
        },
        { label: "Fecha de Registro", value: selectedCliente.fechaRegistro },
        { 
            label: "Estado", 
            value: selectedCliente.estado, 
            color: getEstadoColor(selectedCliente.estado) 
        },
    ] : []}
/>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleCloseModals}
                onConfirm={handleDelete}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que deseas eliminar al cliente ${selectedCliente?.nombre} ${selectedCliente?.apellido}?`}
            />
        </div>
    );
};

export default Clientes;