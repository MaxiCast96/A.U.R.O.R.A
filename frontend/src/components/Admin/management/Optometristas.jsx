// src/components/management/Optometristas.jsx
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
import OptometristasFormModal from './optometristas/OptometristasFormModal';

// Iconos
import { Eye, Plus, Edit, Trash2, UserCheck, UserX, Search, Award, Clock, MapPin } from 'lucide-react';

// Datos de ejemplo para optometristas (extraídos de OpticaDashboard.jsx y extendidos)
const initialOptometristas = [
    {
        _id: "3de939ed28a595d73ec46613",
        empleadoId: "abb46881fa25120ffd6d97f",
        nombre: "Dr. Javier Méndez",
        email: "javier.mendez@optica.com",
        telefono: "+50371234567",
        especialidad: "General",
        licencia: "L8489",
        experiencia: 8,
        fotoPerfil: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
        disponibilidad: [{ dia: "jueves", horaInicio: "08:00", horaFin: "17:00" }, { dia: "viernes", horaInicio: "08:00", horaFin: "17:00" }, { dia: "lunes", horaInicio: "08:00", horaFin: "17:00" }],
        sucursalesAsignadas: ["Principal", "Quezaltepeque"],
        disponible: true,
        fechaCreacion: "2024-01-15",
        pacientesAtendidos: 1250
    },
    {
        _id: "4ef040fe39b606e84fd57724",
        empleadoId: "bcc57992gb36231gge7e08g",
        nombre: "Dra. María Rodríguez",
        email: "maria.rodriguez@optica.com",
        telefono: "+50372345678",
        especialidad: "Pediátrica",
        licencia: "L9012",
        experiencia: 6,
        fotoPerfil: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
        disponibilidad: [{ dia: "lunes", horaInicio: "08:00", horaFin: "16:00" }, { dia: "martes", horaInicio: "08:00", horaFin: "16:00" }, { dia: "miércoles", horaInicio: "08:00", horaFin: "16:00" }],
        sucursalesAsignadas: ["Principal"],
        disponible: true,
        fechaCreacion: "2024-01-20",
        pacientesAtendidos: 890
    },
    {
        _id: "5fg151gf50c717f95ge68835",
        empleadoId: "cdd68003hc47342hh8f19h",
        nombre: "Dr. Carlos Hernández",
        email: "carlos.hernandez@optica.com",
        telefono: "+50373456789",
        especialidad: "Contactología",
        licencia: "L7856",
        experiencia: 10,
        fotoPerfil: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
        disponibilidad: [{ dia: "martes", horaInicio: "09:00", horaFin: "18:00" }, { dia: "jueves", horaInicio: "09:00", horaFin: "18:00" }, { dia: "sábado", horaInicio: "08:00", horaFin: "14:00" }],
        sucursalesAsignadas: ["Quezaltepeque"],
        disponible: true,
        fechaCreacion: "2024-02-01",
        pacientesAtendidos: 1420
    },
    {
        _id: "6gh262hg61d828g06hf79946",
        empleadoId: "dee79114id58453ii9g20i",
        nombre: "Dra. Ana López",
        email: "ana.lopez@optica.com",
        telefono: "+50374567890",
        especialidad: "General",
        licencia: "L6543",
        experiencia: 4,
        fotoPerfil: "https://images.unsplash.com/photo-1594824885093-45c3fce3238b?w=150&h=150&fit=crop&crop=face",
        disponibilidad: [{ dia: "lunes", horaInicio: "08:00", horaFin: "17:00" }, { dia: "miércoles", horaInicio: "08:00", horaFin: "17:00" }, { dia: "viernes", horaInicio: "08:00", horaFin: "17:00" }],
        sucursalesAsignadas: ["Quezaltepeque"],
        disponible: true,
        fechaCreacion: "2024-02-10",
        pacientesAtendidos: 980
    },
    {
        _id: "7hi373ih72e939h17ig80057",
        empleadoId: "eff80225je69564jj0h31j",
        nombre: "Dr. Luis García",
        email: "luis.garcia@optica.com",
        telefono: "+50375678901",
        especialidad: "Baja Visión",
        licencia: "L5432",
        experiencia: 12,
        fotoPerfil: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=150&h=150&fit=crop&crop=face",
        disponibilidad: [{ dia: "martes", horaInicio: "08:00", horaFin: "16:00" }, { dia: "jueves", horaInicio: "08:00", horaFin: "16:00" }],
        sucursalesAsignadas: ["Principal"],
        disponible: false,
        fechaCreacion: "2024-03-05",
        pacientesAtendidos: 650
    },
    {
        _id: "8ij484ji83f040i28jh91168",
        empleadoId: "fgg91336kg70675kk1i42k",
        nombre: "Dra. Patricia Vásquez",
        email: "patricia.vasquez@optica.com",
        telefono: "+50376789012",
        especialidad: "Ortóptica",
        licencia: "L4321",
        experiencia: 7,
        fotoPerfil: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face",
        disponibilidad: [{ dia: "lunes", horaInicio: "09:00", horaFin: "17:00" }, { dia: "miércoles", horaInicio: "09:00", horaFin: "17:00" }, { dia: "viernes", horaInicio: "09:00", horaFin: "17:00" }],
        sucursalesAsignadas: ["Principal", "Quezaltepeque"],
        disponible: true,
        fechaCreacion: "2024-03-10",
        pacientesAtendidos: 1100
    },
    {
        _id: "9jk595kj94g151j39ki02279",
        empleadoId: "ghh02447lh81786ll2j53l",
        nombre: "Dr. Roberto Martínez",
        email: "roberto.martinez@optica.com",
        telefono: "+50377890123",
        especialidad: "Contactología",
        licencia: "L3210",
        experiencia: 5,
        fotoPerfil: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
        disponibilidad: [{ dia: "martes", horaInicio: "08:00", horaFin: "18:00" }, { dia: "jueves", horaInicio: "08:00", horaFin: "18:00" }, { dia: "sábado", horaInicio: "08:00", horaFin: "14:00" }],
        sucursalesAsignadas: ["Quezaltepeque"],
        disponible: true,
        fechaCreacion: "2024-03-15",
        pacientesAtendidos: 780
    }
];

const Optometristas = () => {
    const [optometristas, setOptometristas] = useState(initialOptometristas);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedOptometrista, setSelectedOptometrista] = useState(null);
    const [alert, setAlert] = useState(null);

    const {
        formData,
        setFormData,
        handleInputChange,
        errors,
        setErrors,
        resetForm
    } = useForm({
        nombre: '',
        email: '',
        telefono: '',
        especialidad: '',
        licencia: '',
        experiencia: '',
        fotoPerfil: '',
        disponibilidad: [],
        sucursalesAsignadas: [],
        disponible: true,
        pacientesAtendidos: 0,
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterEspecialidad, setFilterEspecialidad] = useState('todos');
    const [filterDisponible, setFilterDisponible] = useState('todos');

    const filteredOptometristas = useMemo(() => {
        return optometristas.filter(optometrista => {
            const matchesSearch = searchTerm === '' ||
                optometrista.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                optometrista.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                optometrista.telefono.toLowerCase().includes(searchTerm.toLowerCase()) ||
                optometrista.licencia.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesEspecialidad = filterEspecialidad === 'todos' ||
                optometrista.especialidad.toLowerCase() === filterEspecialidad.toLowerCase();

            const matchesDisponible = filterDisponible === 'todos' ||
                (filterDisponible === 'disponible' && optometrista.disponible) ||
                (filterDisponible === 'no disponible' && !optometrista.disponible);

            return matchesSearch && matchesEspecialidad && matchesDisponible;
        });
    }, [optometristas, searchTerm, filterEspecialidad, filterDisponible]);

    const {
        currentPage,
        pageSize,
        currentData,
        totalPages,
        goToNextPage,
        goToPreviousPage,
        goToPage,
        setPageSize,
    } = usePagination(filteredOptometristas, 5); 

    const handleAdd = () => {
        setSelectedOptometrista(null);
        resetForm();
        setIsFormModalOpen(true);
    };

    const handleEdit = (optometrista) => {
        setSelectedOptometrista(optometrista);
        setFormData(optometrista);
        setIsFormModalOpen(true);
    };

    const handleDeleteAttempt = (optometrista) => {
        setSelectedOptometrista(optometrista);
        setIsDeleteModalOpen(true);
    };

    const handleViewDetails = (optometrista) => {
        setSelectedOptometrista(optometrista);
        setIsDetailModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsFormModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsDetailModalOpen(false);
        setSelectedOptometrista(null);
        resetForm();
        setErrors({});
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation example
        const newErrors = {};
        if (!formData.nombre) newErrors.nombre = 'El nombre es requerido.';
        if (!formData.email) newErrors.email = 'El correo electrónico es requerido.';
        if (!formData.telefono) newErrors.telefono = 'El teléfono es requerido.';
        if (!formData.especialidad) newErrors.especialidad = 'La especialidad es requerida.';
        if (!formData.licencia) newErrors.licencia = 'La licencia es requerida.';
        if (formData.experiencia === '' || formData.experiencia < 0) newErrors.experiencia = 'La experiencia es requerida y debe ser un número positivo.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setAlert({ type: 'error', message: 'Por favor, corrija los errores en el formulario.' });
            return;
        }

        if (selectedOptometrista) {
            // Update existing optometrista
            setOptometristas(optometristas.map(o => o._id === selectedOptometrista._id ? { ...formData, _id: selectedOptometrista._id } : o));
            setAlert({ type: 'success', message: 'Optometrista actualizado con éxito!' });
        } else {
            // Add new optometrista
            setOptometristas([...optometristas, { ...formData, _id: Date.now().toString(), fechaCreacion: new Date().toISOString().split('T')[0], pacientesAtendidos: 0 }]);
            setAlert({ type: 'success', message: 'Optometrista añadido con éxito!' });
        }
        handleCloseModals();
    };

    const handleDelete = () => {
        setOptometristas(optometristas.filter(o => o._id !== selectedOptometrista._id));
        setAlert({ type: 'success', message: 'Optometrista eliminado con éxito!' });
        handleCloseModals();
    };

    const getEspecialidadColor = (especialidad) => {
        switch (especialidad) {
            case 'General': return 'bg-blue-100 text-blue-800';
            case 'Pediátrica': return 'bg-pink-100 text-pink-800';
            case 'Contactología': return 'bg-green-100 text-green-800';
            case 'Baja Visión': return 'bg-purple-100 text-purple-800';
            case 'Ortóptica': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getDisponibilidadStatus = (isDisponible) => {
        return isDisponible ? { text: 'Disponible', color: 'bg-green-100 text-green-800' } : { text: 'No Disponible', color: 'bg-red-100 text-red-800' };
    };

    // Estadísticas
    const totalOptometristas = optometristas.length;
    const optometristasDisponibles = optometristas.filter(o => o.disponible).length;
    const optometristasNoDisponibles = totalOptometristas - optometristasDisponibles;
    const promedioExperiencia = (optometristas.reduce((sum, o) => sum + o.experiencia, 0) / totalOptometristas).toFixed(1);

    const columns = [
        { header: 'Nombre', accessor: 'nombre' },
        { header: 'Especialidad', accessor: 'especialidad', render: (row) => (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEspecialidadColor(row.especialidad)}`}>
                {row.especialidad}
            </span>
        )},
        { header: 'Licencia', accessor: 'licencia' },
        { header: 'Teléfono', accessor: 'telefono' },
        { header: 'Experiencia (años)', accessor: 'experiencia' },
        { header: 'Estado', accessor: 'disponible', render: (row) => {
            const status = getDisponibilidadStatus(row.disponible);
            return (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                    {status.text}
                </span>
            );
        }},
        {
            header: 'Acciones',
            accessor: 'actions',
            render: (row) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleViewDetails(row)} className="btn-icon text-blue-600 hover:text-blue-800">
                        <Eye className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleEdit(row)} className="btn-icon text-yellow-600 hover:text-yellow-800">
                        <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteAttempt(row)} className="btn-icon text-red-600 hover:text-red-800">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            ),
            isActionColumn: true
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestión de Optometristas"
                subtitle="Administra la información de los optometristas registrados."
                buttonText="Añadir Optometrista"
                onButtonClick={handleAdd}
                icon={Eye}
            />

            <StatsGrid stats={[
                { title: 'Total Optometristas', value: totalOptometristas, Icon: Eye, color: 'cyan' },
                { title: 'Optometristas Disponibles', value: optometristasDisponibles, Icon: UserCheck, color: 'green' },
                { title: 'Optometristas No Disponibles', value: optometristasNoDisponibles, Icon: UserX, color: 'red' },
                { title: 'Experiencia Promedio (años)', value: promedioExperiencia, Icon: Award, color: 'purple' },
            ]} />

            <FilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Buscar optometrista por nombre, email, licencia..."
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
                ]}
            />

<DataTable 
    columns={columns} 
    data={currentData || []} // Aseguramos que siempre sea un array
/>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                goToPreviousPage={goToPreviousPage}
                goToNextPage={goToNextPage}
                goToPage={goToPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
            />

            <OptometristasFormModal
                isOpen={isFormModalOpen}
                onClose={handleCloseModals}
                onSubmit={handleSubmit}
                title={selectedOptometrista ? 'Editar Optometrista' : 'Añadir Nuevo Optometrista'}
                formData={formData}
                handleInputChange={handleInputChange}
                errors={errors}
                submitLabel={selectedOptometrista ? 'Actualizar Optometrista' : 'Guardar Optometrista'}
            />

            <DetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseModals}
                title="Detalles del Optometrista"
                item={selectedOptometrista}
                data={selectedOptometrista ? [
                    { label: "Nombre Completo", value: selectedOptometrista.nombre },
                    { label: "Email", value: selectedOptometrista.email },
                    { label: "Teléfono", value: selectedOptometrista.telefono },
                    { label: "Especialidad", value: selectedOptometrista.especialidad, color: getEspecialidadColor(selectedOptometrista.especialidad) },
                    { label: "Licencia", value: selectedOptometrista.licencia },
                    { label: "Experiencia", value: `${selectedOptometrista.experiencia} años` },
                    { label: "Disponibilidad", value: selectedOptometrista.disponibilidad.map(d => `${d.dia} (${d.horaInicio}-${d.horaFin})`).join(', ') || 'N/A' },
                    { label: "Sucursales Asignadas", value: selectedOptometrista.sucursalesAsignadas.join(', ') || 'N/A' },
                    { label: "Estado", value: getDisponibilidadStatus(selectedOptometrista.disponible).text, color: getDisponibilidadStatus(selectedOptometrista.disponible).color },
                    { label: "Pacientes Atendidos", value: selectedOptometrista.pacientesAtendidos },
                    { label: "Fecha de Registro", value: selectedOptometrista.fechaCreacion },
                ] : []}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onConfirm={handleDelete}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que deseas eliminar al optometrista ${selectedOptometrista?.nombre}?`}
            />

            <Alert
                alert={alert}
                onClose={() => setAlert(null)}
            />
        </div>
    );
};

export default Optometristas;