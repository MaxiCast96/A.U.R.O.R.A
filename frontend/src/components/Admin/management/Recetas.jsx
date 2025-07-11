import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import PageHeader from '../ui/PageHeader';
import StatsGrid from '../ui/StatsGrid';
import FilterBar from '../ui/FilterBar';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import DetailModal from '../ui/DetailModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import RecetasFormModal from '../management/employees/RecetasFormModal'; // Asegúrate que la ruta sea correcta
import Alert from '../ui/Alert';
import { usePagination } from '../../../hooks/admin/usePagination';
import { Eye, Edit, Trash2, FileText, CheckCircle, Clock } from 'lucide-react';

const API_URL = 'http://localhost:4000/api'; // URL Base

const Recetas = () => {
    const [recetas, setRecetas] = useState([]);
    const [historialesMedicos, setHistorialesMedicos] = useState([]); // Cambiado de clientes a historialesMedicos
    const [optometristas, setOptometristas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReceta, setSelectedReceta] = useState(null);
    const [alert, setAlert] = useState(null);
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('todos');

    // --- HOOK DE FORMULARIO MEJORADO ---
    const initialFormState = {
        historialMedicoId: '',
        optometristaId: '',
        diagnostico: '',
        ojoDerecho: { esfera: null, cilindro: null, eje: null, adicion: null },
        ojoIzquierdo: { esfera: null, cilindro: null, eje: null, adicion: null },
        observaciones: '',
        vigencia: 12,
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    const handleInputChange = useCallback((e) => {
        const { name, value, type } = e.target;
        // Lógica para manejar campos anidados (ej. ojoDerecho.esfera)
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'number' ? (value === '' ? null : Number(value)) : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? (value === '' ? null : Number(value)) : value
            }));
        }
    }, []);

    const resetForm = () => setFormData(initialFormState);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.historialMedicoId) newErrors.historialMedicoId = 'Debe seleccionar un cliente.';
        if (!formData.optometristaId) newErrors.optometristaId = 'Debe seleccionar un optometrista.';
        if (!formData.diagnostico.trim()) newErrors.diagnostico = 'El diagnóstico es requerido.';
        if (!formData.vigencia || formData.vigencia <= 0) newErrors.vigencia = 'La vigencia debe ser un número positivo.';
        
        // --- Validación de campos de ojos ---
        if (formData.ojoDerecho.esfera === '') newErrors['ojoDerecho.esfera'] = 'Requerido';
        if (formData.ojoDerecho.cilindro === '') newErrors['ojoDerecho.cilindro'] = 'Requerido';
        if (formData.ojoDerecho.eje === '') newErrors['ojoDerecho.eje'] = 'Requerido';
        if (formData.ojoIzquierdo.esfera === '') newErrors['ojoIzquierdo.esfera'] = 'Requerido';
        if (formData.ojoIzquierdo.cilindro === '') newErrors['ojoIzquierdo.cilindro'] = 'Requerido';
        if (formData.ojoIzquierdo.eje === '') newErrors['ojoIzquierdo.eje'] = 'Requerido';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    // --- FETCH DE DATOS MEJORADO ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Se obtienen los historiales médicos y optometristas una sola vez
            const [historialesRes, optometristasRes] = await Promise.all([
                axios.get(`${API_URL}/historialMedico`), // Corregido: obtener historiales
                axios.get(`${API_URL}/optometrista`),
            ]);
            // El backend debe popular clienteId en historialMedico
            setHistorialesMedicos(historialesRes.data || []); 
            setOptometristas(optometristasRes.data || []);
        } catch (error) {
            showAlert('error', 'Error al cargar datos maestros (historiales, optometristas).');
            console.error('Error fetching master data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

   const fetchRecetas = async () => {
    setLoading(true);
    let url = `${API_URL}/recetas`;
    if (selectedFilter === 'vigentes') {
        url = `${API_URL}/recetas/vigentes/activas`;
    }

    try {
        const recetasRes = await axios.get(url);
        // Si la respuesta no es un array, guarda un array vacío
        setRecetas(Array.isArray(recetasRes.data) ? recetasRes.data : []);
    } catch (error) {
        showAlert('error', 'Error al cargar las recetas.');
        console.error('Error fetching recetas:', error);
    } finally {
        setLoading(false);
    }
}

    useEffect(() => {
        fetchData(); // Carga datos maestros al montar
    }, [fetchData]);

    useEffect(() => {
        fetchRecetas(); // Carga recetas cuando cambia el filtro
    }, [selectedFilter]);

    // --- Abrir modal de edición si viene de otra sección ---
    useEffect(() => {
        const editId = window.localStorage.getItem('editRecetaId');
        if (editId && recetas.length > 0) {
            const receta = recetas.find(r => r._id === editId);
            if (receta) {
                handleOpenEditModal(receta);
                window.localStorage.removeItem('editRecetaId');
            }
        }
    }, [recetas]);

    // --- FILTRADO Y PAGINACIÓN ---
    const filteredRecetas = useMemo(() => {
    if (!Array.isArray(recetas)) return [];
    return recetas.filter(receta => {
            const search = searchTerm.toLowerCase();
            const clienteNombre = receta.historialMedicoId?.clienteId?.nombre?.toLowerCase() || '';
            const clienteApellido = receta.historialMedicoId?.clienteId?.apellido?.toLowerCase() || '';
            const optometristaNombre = receta.optometristaId?.empleadoId?.nombre?.toLowerCase() || '';
            const optometristaApellido = receta.optometristaId?.empleadoId?.apellido?.toLowerCase() || '';

            return (receta.diagnostico.toLowerCase().includes(search) ||
                `${clienteNombre} ${clienteApellido}`.includes(search) ||
                `${optometristaNombre} ${optometristaApellido}`.includes(search));
        });
    }, [recetas, searchTerm]);
    
    const { paginatedData: currentRecetas, ...paginationProps } = usePagination(filteredRecetas, 5);

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const handleCloseModals = () => {
        setShowAddEditModal(false);
        setShowDetailModal(false);
        setShowDeleteModal(false);
        setSelectedReceta(null);
        resetForm();
    };

    const handleOpenAddModal = () => {
        resetForm();
        setErrors({});
        setSelectedReceta(null);
        setShowAddEditModal(true);
    };

    const handleOpenEditModal = (receta) => {
        setSelectedReceta(receta);
        // Asegurarse de que el estado del formulario sea compatible con los campos anidados
        const formValues = {
            ...initialFormState,
            ...receta,
            historialMedicoId: receta.historialMedicoId?._id || receta.historialMedicoId,
            optometristaId: receta.optometristaId?._id || receta.optometristaId,
            ojoDerecho: { ...initialFormState.ojoDerecho, ...receta.ojoDerecho },
            ojoIzquierdo: { ...initialFormState.ojoIzquierdo, ...receta.ojoIzquierdo },
        };
        setFormData(formValues);
        setErrors({});
        setShowAddEditModal(true);
    };
    
    const handleOpenDetailModal = (receta) => {
        setSelectedReceta(receta);
        setShowDetailModal(true);
    };

    const handleOpenDeleteModal = (receta) => {
        setSelectedReceta(receta);
        setShowDeleteModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showAlert('error', 'Por favor, completa todos los campos requeridos.');
            return;
        }

        const endpoint = selectedReceta ? `${API_URL}/recetas/${selectedReceta._id}` : `${API_URL}/recetas`;
        const method = selectedReceta ? 'put' : 'post';
        
        try {
            await axios[method](endpoint, formData);
            showAlert('success', `¡Receta ${selectedReceta ? 'actualizada' : 'creada'} exitosamente!`);
            fetchRecetas(); // Recargar recetas
            handleCloseModals();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Ocurrió un error inesperado.';
            showAlert('error', errorMessage);
            console.error('Error submitting receta:', error);
        }
    };

    const handleDelete = async () => {
        if (!selectedReceta) return;
        try {
            await axios.delete(`${API_URL}/recetas/${selectedReceta._id}`);
            showAlert('success', '¡Receta eliminada exitosamente!');
            fetchRecetas(); // Recargar recetas
            handleCloseModals();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Ocurrió un error inesperado.';
            showAlert('error', errorMessage);
            console.error('Error deleting receta:', error);
        }
    };
    
    const tableColumns = [
        { header: 'Diagnóstico', key: 'diagnostico' },
        { header: 'Cliente', key: 'cliente' },
        { header: 'Optometrista', key: 'optometrista' },
        { header: 'Fecha', key: 'fecha' },
        { header: 'Vigencia', key: 'vigencia' },
        { header: 'Acciones', key: 'acciones' },
    ];

    const renderRow = (receta) => {
        const cliente = receta.historialMedicoId?.clienteId;
        const optometrista = receta.optometristaId?.empleadoId;
        const isVigente = new Date(new Date(receta.fecha).setMonth(new Date(receta.fecha).getMonth() + receta.vigencia)) > new Date();

        return (
            <>
                <td className="px-6 py-4 font-medium text-gray-900">{receta.diagnostico}</td>
                <td className="px-6 py-4 text-gray-600">{cliente ? `${cliente.nombre} ${cliente.apellido}` : 'N/A'}</td>
                <td className="px-6 py-4 text-gray-600">{optometrista ? `${optometrista.nombre} ${optometrista.apellido}` : 'N/A'}</td>
                <td className="px-6 py-4 text-gray-600">{new Date(receta.fecha).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isVigente ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isVigente ? 'Vigente' : 'Vencida'}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex space-x-2">
                        <button onClick={() => handleOpenDeleteModal(receta)} className="p-2 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                        <button onClick={() => handleOpenDetailModal(receta)} className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" title="Ver detalles"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleOpenEditModal(receta)} className="p-2 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" title="Editar"><Edit className="w-4 h-4" /></button>
                    </div>
                </td>
            </>
        );
    }
    
    const stats = useMemo(() => {
        const vigentes = recetas.filter(r => new Date(new Date(r.fecha).setMonth(new Date(r.fecha).getMonth() + r.vigencia)) > new Date()).length;
        const vencidas = recetas.length - vigentes;
        return [
            { title: 'Total Recetas', value: recetas.length, Icon: FileText, color: 'blue' },
            { title: 'Recetas Vigentes', value: vigentes, Icon: CheckCircle, color: 'green' },
            { title: 'Recetas Vencidas', value: vencidas, Icon: Clock, color: 'red' },
        ];
    }, [recetas]);

    return (
        <div className="space-y-6 animate-fade-in">
            <Alert alert={alert} />
            <StatsGrid stats={stats} />

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <PageHeader title="Gestión de Recetas" buttonLabel="Añadir Receta" onButtonClick={handleOpenAddModal} />
                <FilterBar
                    searchTerm={searchTerm}
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    searchPlaceholder="Buscar por diagnóstico, cliente u optometrista..."
                    filters={[
                        { label: 'Todas', value: 'todos' },
                        { label: 'Vigentes', value: 'vigentes' },
                    ]}
                    activeFilter={selectedFilter}
                    onFilterChange={(filter) => {
                        setSelectedFilter(filter);
                        // Limpiar búsqueda al cambiar de filtro para evitar confusiones
                        setSearchTerm(''); 
                    }}
                />
                <DataTable
                    columns={tableColumns}
                    data={currentRecetas}
                    renderRow={renderRow}
                    isLoading={loading}
                    noDataMessage="No se encontraron recetas"
                />
                <Pagination {...paginationProps} />
            </div>

            {showAddEditModal && (
                <RecetasFormModal
                    isOpen={showAddEditModal}
                    onClose={handleCloseModals}
                    onSubmit={handleSubmit}
                    title={selectedReceta ? 'Editar Receta' : 'Nueva Receta'}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    errors={errors}
                    submitLabel={selectedReceta ? 'Actualizar Receta' : 'Guardar Receta'}
                    historialesMedicos={historialesMedicos} // Prop corregida
                    optometristas={optometristas}
                />
            )}

            {selectedReceta && showDetailModal && (
                 <DetailModal
                    isOpen={showDetailModal}
                    onClose={handleCloseModals}
                    title="Detalles de la Receta"
                    item={selectedReceta}
                    data={[
                        { label: 'Diagnóstico', value: selectedReceta.diagnostico },
                        { label: 'Cliente', value: `${selectedReceta.historialMedicoId?.clienteId?.nombre || ''} ${selectedReceta.historialMedicoId?.clienteId?.apellido || ''}`.trim() || 'N/A' },
                        { label: 'Optometrista', value: `${selectedReceta.optometristaId?.empleadoId?.nombre || ''} ${selectedReceta.optometristaId?.empleadoId?.apellido || ''}`.trim() || 'N/A' },
                        { label: 'Fecha', value: new Date(selectedReceta.fecha).toLocaleDateString() },
                        { label: 'Vigencia', value: `${selectedReceta.vigencia} meses` },
                        { label: 'Ojo Derecho', value: `Esf: ${selectedReceta.ojoDerecho.esfera}, Cil: ${selectedReceta.ojoDerecho.cilindro}, Eje: ${selectedReceta.ojoDerecho.eje}, Ad: ${selectedReceta.ojoDerecho.adicion}` },
                        { label: 'Ojo Izquierdo', value: `Esf: ${selectedReceta.ojoIzquierdo.esfera}, Cil: ${selectedReceta.ojoIzquierdo.cilindro}, Eje: ${selectedReceta.ojoIzquierdo.eje}, Ad: ${selectedReceta.ojoIzquierdo.adicion}` },
                        { label: 'Observaciones', value: selectedReceta.observaciones || 'Sin observaciones' },
                    ]}
                />
            )}

            {showDeleteModal && (
                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={handleCloseModals}
                    onConfirm={handleDelete}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que deseas eliminar la receta con diagnóstico "${selectedReceta?.diagnostico}"?`}
                />
            )}
        </div>
    );
};

export default Recetas;