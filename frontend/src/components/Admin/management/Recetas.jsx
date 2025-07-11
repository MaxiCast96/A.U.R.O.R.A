import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import PageHeader from '../ui/PageHeader';
import FilterBar from '../ui/FilterBar';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import DetailModal from '../ui/DetailModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import RecetasFormModal from '../../Admin/management/employees/RecetasFormModal';
import Alert from '../ui/Alert';
import { usePagination } from '../../../hooks/admin/usePagination';
import { Eye, Edit, Trash2, UserCheck, UserX, Users } from 'lucide-react';

const API_URL = 'http://localhost:4000/api/recetas';

const Recetas = () => {
    const [recetas, setRecetas] = useState([]); // Asegúrate de que el estado inicial sea un array
    const [loading, setLoading] = useState(true);
    const [selectedReceta, setSelectedReceta] = useState(null);
    const [alert, setAlert] = useState(null);
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('todos');

    // --- FETCH DE DATOS ---
    const fetchRecetas = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            console.log('API Response:', response.data); // Verifica la estructura de los datos
            setRecetas(response.data || []); // Asegúrate de que siempre sea un array
        } catch (error) {
            console.error('Error fetching recetas:', error);
            setRecetas([]); // En caso de error, asegúrate de que recetas sea un array vacío
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecetas();
    }, []);

    // --- FILTRADO Y PAGINACIÓN ---
    const filteredRecetas = useMemo(() => {
        if (!Array.isArray(recetas)) return []; // Valida que recetas sea un array
        return recetas.filter(receta => {
            const search = searchTerm.toLowerCase();
            const matchesSearch = receta.diagnostico.toLowerCase().includes(search) ||
                receta.historialMedicoId?.clienteId?.nombre.toLowerCase().includes(search);
            const matchesFilter = selectedFilter === 'todos' || receta.vigencia === parseInt(selectedFilter);
            return matchesSearch && matchesFilter;
        });
    }, [recetas, searchTerm, selectedFilter]);

    const { paginatedData: currentRecetas, ...paginationProps } = usePagination(filteredRecetas, 5);

    // --- HANDLERS PARA MODALES Y ACCIONES CRUD ---
    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const handleCloseModals = () => {
        setShowAddEditModal(false);
        setShowDetailModal(false);
        setShowDeleteModal(false);
        setSelectedReceta(null);
    };

    const handleOpenAddModal = () => {
        setSelectedReceta(null);
        setShowAddEditModal(true);
    };

    const handleOpenEditModal = (receta) => {
        setSelectedReceta(receta);
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

    const handleSubmit = async (formData) => {
        try {
            if (selectedReceta) {
                // Actualizar receta
                await axios.put(`${API_URL}/${selectedReceta._id}`, formData);
                showAlert('success', 'Receta actualizada exitosamente');
            } else {
                // Crear nueva receta
                await axios.post(API_URL, formData);
                showAlert('success', 'Receta creada exitosamente');
            }
            fetchRecetas();
            handleCloseModals();
        } catch (error) {
            console.error('Error submitting receta:', error);
            showAlert('error', 'Error al guardar la receta');
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${API_URL}/${selectedReceta._id}`);
            showAlert('success', 'Receta eliminada exitosamente');
            fetchRecetas();
            handleCloseModals();
        } catch (error) {
            console.error('Error deleting receta:', error);
            showAlert('error', 'Error al eliminar la receta');
        }
    };

    // --- DEFINICIONES PARA LA TABLA ---
    const tableColumns = [
        { header: 'Diagnóstico', key: 'diagnostico' },
        { header: 'Cliente', key: 'cliente' },
        { header: 'Optometrista', key: 'optometrista' },
        { header: 'Fecha', key: 'fecha' },
        { header: 'Vigencia', key: 'vigencia' },
        { header: 'Acciones', key: 'acciones' },
    ];

    const renderRow = (receta) => (
        <>
            <td className="px-6 py-4">{receta.diagnostico}</td>
            <td className="px-6 py-4">{receta.historialMedicoId?.clienteId?.nombre || 'N/A'}</td>
            <td className="px-6 py-4">{receta.optometristaId?.empleadoId?.nombre || 'N/A'}</td>
            <td className="px-6 py-4">{new Date(receta.fecha).toLocaleDateString()}</td>
            <td className="px-6 py-4">{receta.vigencia} meses</td>
            <td className="px-6 py-4">
                <div className="flex space-x-2">
                    <button onClick={() => handleOpenDetailModal(receta)} className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" title="Ver detalles">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleOpenEditModal(receta)} className="p-2 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" title="Editar">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleOpenDeleteModal(receta)} className="p-2 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </>
    );

    // --- RENDERIZADO DEL COMPONENTE ---
    return (
        <div className="space-y-6 animate-fade-in">
            <Alert alert={alert} />
            <PageHeader title="Gestión de Recetas" buttonLabel="Añadir Receta" onButtonClick={handleOpenAddModal} />
            <FilterBar
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                searchPlaceholder="Buscar por diagnóstico o cliente..."
                filters={[
                    { label: 'Todos', value: 'todos' },
                    { label: 'Vigentes', value: '12' },
                ]}
                activeFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
            />
            <DataTable
                columns={tableColumns}
                data={currentRecetas}
                renderRow={renderRow}
                isLoading={loading}
                noDataMessage="No se encontraron recetas"
                noDataSubMessage={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no hay recetas registradas'}
            />
            <Pagination {...paginationProps} />

            {showAddEditModal && (
                <RecetasFormModal
                    isOpen={showAddEditModal}
                    onClose={handleCloseModals}
                    onSubmit={handleSubmit}
                    receta={selectedReceta}
                />
            )}

            {showDetailModal && selectedReceta && (
                <DetailModal
                    isOpen={showDetailModal}
                    onClose={handleCloseModals}
                    title="Detalles de la Receta"
                    item={selectedReceta}
                    data={[
                        { label: 'Diagnóstico', value: selectedReceta.diagnostico },
                        { label: 'Cliente', value: selectedReceta.historialMedicoId?.clienteId?.nombre || 'N/A' },
                        { label: 'Optometrista', value: selectedReceta.optometristaId?.empleadoId?.nombre || 'N/A' },
                        { label: 'Fecha', value: new Date(selectedReceta.fecha).toLocaleDateString() },
                        { label: 'Vigencia', value: `${selectedReceta.vigencia} meses` },
                        { label: 'Observaciones', value: selectedReceta.observaciones || 'N/A' },
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