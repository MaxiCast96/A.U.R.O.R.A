import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useForm } from '../../../hooks/admin/useForm';
import { usePagination } from '../../../hooks/admin/usePagination';
import PageHeader from '../ui/PageHeader';
import StatsGrid from '../ui/StatsGrid';
import FilterBar from '../ui/FilterBar';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import ConfirmationModal from '../ui/ConfirmationModal';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';
import LentesFormModal from '../management/lentes/LentesFormModal';
import { Search, Plus, Trash2, Eye, Edit, Glasses, TrendingUp, Package, DollarSign } from 'lucide-react';

const API_URL = 'https://a-u-r-o-r-a.onrender.com/api';

const LentesContent = () => {
  // Estados
  const [lentes, setLentes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLente, setSelectedLente] = useState(null);
  const [alert, setAlert] = useState(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [imagePreviews, setImagePreviews] = useState([]);

  // Fetch de datos inicial
  const fetchData = async () => {
    setLoading(true);
    try {
      const [lentesRes, categoriasRes, marcasRes, promocionesRes, sucursalesRes] = await Promise.all([
        axios.get(`${API_URL}/lentes`),
        axios.get(`${API_URL}/categoria`),
        axios.get(`${API_URL}/marcas`),
        axios.get(`${API_URL}/promociones`),
        axios.get(`${API_URL}/sucursales`),
      ]);
      
      setLentes(lentesRes.data || []);
      setCategorias(categoriasRes.data || []);
      setMarcas(marcasRes.data || []);
      setPromociones(promocionesRes.data || []);
      setSucursales(sucursalesRes.data || []);
    } catch (error) {
      showAlert('error', 'Error al cargar los datos: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Formulario
  const initialFormData = {
    nombre: '',
    descripcion: '',
    categoriaId: '',
    marcaId: '',
    material: '',
    color: '',
    tipoLente: '',
    precioBase: '',
    precioActual: '',
    linea: '',
    medidas: { anchoPuente: '', altura: '', ancho: '' },
    imagenes: [],
    enPromocion: false,
    promocionId: '',
    fechaCreacion: new Date().toISOString().split('T')[0],
    sucursales: [],
  };

  const { formData, setFormData, handleInputChange, resetForm, validateForm, errors, setErrors } = useForm(
    initialFormData,
    (data) => {
      const newErrors = {};
      if (!data.nombre) newErrors.nombre = 'El nombre es requerido';
      if (!data.categoriaId) newErrors.categoriaId = 'La categoría es requerida';
      if (!data.marcaId) newErrors.marcaId = 'La marca es requerida';
      if (!data.tipoLente) newErrors.tipoLente = 'El tipo de lente es requerido';
      if (!data.precioActual || isNaN(data.precioActual)) newErrors.precioActual = 'Precio inválido';
      
      if (data.enPromocion && !data.promocionId) {
        newErrors.promocionId = 'Debe seleccionar una promoción cuando el lente está en promoción';
      }
      
      return newErrors;
    }
  );

  // Manejo de alertas
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Funciones para modales
  const handleCloseModals = () => {
    setShowAddEditModal(false);
    setShowDetailModal(false);
    setShowDeleteModal(false);
    setSelectedLente(null);
    resetForm();
    setErrors({});
    setImagePreviews([]);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setFormData(initialFormData);
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = async (lente) => {
    try {
      const response = await axios.get(`${API_URL}/lentes/${lente._id}`);
      const lenteCompleto = response.data;

      setSelectedLente(lenteCompleto);
      const formattedData = {
        ...lenteCompleto,
        categoriaId: lenteCompleto.categoriaId?._id || '',
        marcaId: lenteCompleto.marcaId?._id || '',
        promocionId: lenteCompleto.promocionId?._id || '',
        fechaCreacion: lenteCompleto.fechaCreacion ? new Date(lenteCompleto.fechaCreacion).toISOString().split('T')[0] : '',
        sucursales: lenteCompleto.sucursales?.map(s => ({
          sucursalId: s.sucursalId?._id || s.sucursalId || '',
          nombreSucursal: s.nombreSucursal || '',
          stock: s.stock || 0
        })) || [],
        medidas: {
          anchoPuente: lenteCompleto.medidas?.anchoPuente || '',
          altura: lenteCompleto.medidas?.altura || '',
          ancho: lenteCompleto.medidas?.ancho || '',
        },
        imagenes: lenteCompleto.imagenes || [],
      };
      
      setFormData(formattedData);
      setImagePreviews(lenteCompleto.imagenes || []);
      setShowAddEditModal(true);
    } catch (error) {
      console.error('Error al cargar datos del lente:', error);
      showAlert('error', 'Error al cargar los datos del lente para edición');
    }
  };

  const handleOpenViewModal = (lente) => {
    setSelectedLente(lente);
    setShowDetailModal(true);
  };

  const handleOpenDeleteModal = (lente) => {
    setSelectedLente(lente);
    setShowDeleteModal(true);
  };

  // Operaciones CRUD
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('error', 'Por favor, corrige los errores en el formulario.');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoriaId: formData.categoriaId,
        marcaId: formData.marcaId,
        material: formData.material,
        color: formData.color,
        tipoLente: formData.tipoLente,
        precioBase: parseFloat(formData.precioBase),
        precioActual: parseFloat(formData.precioActual),
        linea: formData.linea,
        medidas: {
          anchoPuente: parseFloat(formData.medidas.anchoPuente),
          altura: parseFloat(formData.medidas.altura),
          ancho: parseFloat(formData.medidas.ancho),
        },
        imagenes: formData.imagenes,
        enPromocion: formData.enPromocion,
        promocionId: formData.enPromocion ? formData.promocionId : null,
        fechaCreacion: formData.fechaCreacion,
        sucursales: formData.sucursales.map(s => ({
          sucursalId: s.sucursalId,
          nombreSucursal: s.nombreSucursal,
          stock: parseInt(s.stock) || 0
        }))
      };

      if (selectedLente) {
        await axios.put(`${API_URL}/lentes/${selectedLente._id}`, dataToSend);
        showAlert('success', 'Lente actualizado exitosamente.');
      } else {
        await axios.post(`${API_URL}/lentes`, dataToSend);
        showAlert('success', 'Lente creado exitosamente.');
      }
      
      fetchData();
      handleCloseModals();
    } catch (error) {
      console.error('Error al guardar:', error);
      const errorMessage = error.response?.data?.message || error.message;
      showAlert('error', `Error al ${selectedLente ? 'actualizar' : 'crear'} el lente: ${errorMessage}`);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLente) return;
    
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/lentes/${selectedLente._id}`);
      showAlert('success', 'Lente eliminado exitosamente.');
      fetchData();
      handleCloseModals();
    } catch (error) {
      showAlert('error', 'Error al eliminar el lente: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Manejo de imágenes
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImagePreviews = [...imagePreviews];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newImagePreviews.push(event.target.result);
        setImagePreviews([...newImagePreviews]);
        setFormData(prev => ({
          ...prev,
          imagenes: [...prev.imagenes, event.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = [...formData.imagenes];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, imagenes: newImages }));
    
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  // Filtrado y paginación
  const filteredLentes = useMemo(() => {
    let currentLentes = lentes;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      currentLentes = currentLentes.filter(
        (lente) =>
          (lente.nombre?.toLowerCase().includes(searchLower)) ||
          (lente.descripcion?.toLowerCase().includes(searchLower)) ||
          (lente.material?.toLowerCase().includes(searchLower)) ||
          (lente.color?.toLowerCase().includes(searchLower)) ||
          (lente.tipoLente?.toLowerCase().includes(searchLower)) ||
          (lente.linea?.toLowerCase().includes(searchLower)) ||
          (lente.categoriaId?.nombre && lente.categoriaId.nombre.toLowerCase().includes(searchLower)) ||
          (lente.marcaId?.nombre && lente.marcaId.nombre.toLowerCase().includes(searchLower))
      );
    }

    if (selectedFilter !== 'todos') {
      if (selectedFilter === 'enPromocion') {
        currentLentes = currentLentes.filter((lente) => lente.enPromocion);
      } else {
        currentLentes = currentLentes.filter((lente) =>
          lente.tipoLente?.toLowerCase() === selectedFilter.toLowerCase()
        );
      }
    }

    return currentLentes;
  }, [lentes, searchTerm, selectedFilter]);

  const { currentPage, pageSize, paginatedData, totalPages, goToNextPage, goToPreviousPage, goToFirstPage, goToLastPage, setPageSize } = usePagination(filteredLentes, 10);

  // Funciones auxiliares
  const getTotalStock = (lente) => {
    if (!lente.sucursales) return 0;
    return lente.sucursales.reduce((sum, s) => sum + (s.stock || 0), 0);
  };

  // Estadísticas
  const stats = [
    { id: 1, name: 'Total de Lentes', value: lentes.length, Icon: Glasses, color: 'text-blue-500' },
    { id: 2, name: 'Lentes en Promoción', value: lentes.filter(l => l.enPromocion).length, Icon: TrendingUp, color: 'text-purple-500' },
    { id: 3, name: 'Stock Total', value: lentes.reduce((sum, l) => sum + getTotalStock(l), 0), Icon: Package, color: 'text-green-500' },
    { id: 4, name: 'Valor Inventario', value: lentes.reduce((sum, l) => sum + (l.precioActual * getTotalStock(l)), 0).toLocaleString('es-SV', { style: 'currency', currency: 'USD' }), Icon: DollarSign, color: 'text-yellow-500' },
  ];

  // Columnas de la tabla
  const columns = [
    { 
      header: 'Nombre', 
      accessor: 'nombre',
      render: (lente) => lente.nombre || '-' 
    },
    { 
      header: 'Línea', 
      accessor: 'linea',
      render: (lente) => lente.linea || '-' 
    },
    { 
      header: 'Tipo Lente', 
      accessor: 'tipoLente',
      render: (lente) => lente.tipoLente || '-' 
    },
    { 
      header: 'Marca', 
      accessor: 'marcaId',
      render: (lente) => {
        if (!lente.marcaId) return '-';
        if (typeof lente.marcaId === 'object') return lente.marcaId.nombre || '-';
        const marca = marcas.find(m => m._id === lente.marcaId);
        return marca?.nombre || '-';
      }
    },
    { 
      header: 'Categoría', 
      accessor: 'categoriaId',
      render: (lente) => {
        if (!lente.categoriaId) return '-';
        if (typeof lente.categoriaId === 'object') return lente.categoriaId.nombre || '-';
        const categoria = categorias.find(c => c._id === lente.categoriaId);
        return categoria?.nombre || '-';
      }
    },
    { 
      header: 'Precio Actual', 
      accessor: 'precioActual', 
      render: (lente) => lente.precioActual?.toLocaleString('es-SV', { style: 'currency', currency: 'USD' }) || '-' 
    },
    { 
      header: 'Stock Total', 
      accessor: 'stockTotal', 
      render: (lente) => getTotalStock(lente) 
    },
    {
      header: 'Promoción',
      accessor: 'enPromocion',
      render: (lente) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${lente.enPromocion ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {lente.enPromocion ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      render: (lente) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleOpenViewModal(lente)} 
            className="text-blue-600 hover:text-blue-800"
            title="Ver detalles"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleOpenEditModal(lente)} 
            className="text-yellow-600 hover:text-yellow-800"
            title="Editar"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleOpenDeleteModal(lente)} 
            className="text-red-600 hover:text-red-800"
            title="Eliminar"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  // Campos para el modal de detalles
  const detailFields = selectedLente ? [
    { label: 'ID', value: selectedLente._id },
    { label: 'Nombre', value: selectedLente.nombre || 'N/A' },
    { label: 'Descripción', value: selectedLente.descripcion || 'N/A' },
    { label: 'Categoría', value: selectedLente.categoriaId?.nombre || 'N/A' },
    { label: 'Marca', value: selectedLente.marcaId?.nombre || 'N/A' },
    { label: 'Material', value: selectedLente.material || 'N/A' },
    { label: 'Color', value: selectedLente.color || 'N/A' },
    { label: 'Tipo de Lente', value: selectedLente.tipoLente || 'N/A' },
    { label: 'Precio Base', value: selectedLente.precioBase?.toLocaleString('es-SV', { style: 'currency', currency: 'USD' }) || 'N/A' },
    { label: 'Precio Actual', value: selectedLente.precioActual?.toLocaleString('es-SV', { style: 'currency', currency: 'USD' }) || 'N/A' },
    { label: 'Línea', value: selectedLente.linea || 'N/A' },
    { label: 'Ancho Puente', value: `${selectedLente.medidas?.anchoPuente || 'N/A'} mm` },
    { label: 'Altura', value: `${selectedLente.medidas?.altura || 'N/A'} mm` },
    { label: 'Ancho', value: `${selectedLente.medidas?.ancho || 'N/A'} mm` },
    {
      label: 'Imágenes',
      value: selectedLente.imagenes?.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedLente.imagenes.map((img, index) => (
            <img 
              key={index} 
              src={img} 
              alt={`Lente ${index + 1}`} 
              className="w-24 h-24 object-cover rounded-md border border-gray-200"
            />
          ))}
        </div>
      ) : 'No hay imágenes',
    },
    {
      label: 'En Promoción',
      value: selectedLente.enPromocion ? 'Sí' : 'No',
      color: selectedLente.enPromocion ? 'text-green-600' : 'text-red-600',
    },
    { label: 'Promoción', value: selectedLente.promocionId?.nombre || 'N/A' },
    { label: 'Fecha de Creación', value: selectedLente.fechaCreacion ? new Date(selectedLente.fechaCreacion).toLocaleDateString() : 'N/A' },
    {
      label: 'Stock por Sucursal',
      value: selectedLente.sucursales?.length > 0 ? (
        <ul className="list-disc list-inside">
          {selectedLente.sucursales.map((s, index) => (
            <li key={index}>
              {s.nombreSucursal || s.sucursalId?.nombre || 'Sucursal'}: {s.stock || 0} unidades
            </li>
          ))}
        </ul>
      ) : 'No hay información de stock',
    },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Gestión de Lentes"
        subtitle="Administra la información de todos los lentes disponibles en el inventario."
        icon={Glasses}
        buttonText="Nuevo Lente"
        onButtonClick={handleOpenAddModal}
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <StatsGrid stats={stats} />

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        filters={[
          { label: 'Todos', value: 'todos' },
          { label: 'En Promoción', value: 'enPromocion' },
          { label: 'Monofocal', value: 'monofocal' },
          { label: 'Bifocal', value: 'bifocal' },
          { label: 'Progresivo', value: 'progresivo' },
          { label: 'Ocupacional', value: 'ocupacional' },
        ]}
        placeholder="Buscar lentes por nombre, descripción, material, etc."
      />

      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="text-center py-10">Cargando lentes...</div>
        ) : paginatedData.length > 0 ? (
          <>
            <DataTable 
              columns={columns} 
              data={paginatedData} 
              emptyMessage="No se encontraron lentes"
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              goToNextPage={goToNextPage}
              goToPreviousPage={goToPreviousPage}
              goToFirstPage={goToFirstPage}
              goToLastPage={goToLastPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              totalItems={filteredLentes.length}
            />
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No se encontraron lentes que coincidan con la búsqueda.</p>
          </div>
        )}
      </div>

      <LentesFormModal
        isOpen={showAddEditModal}
        onClose={handleCloseModals}
        onSubmit={handleSubmit}
        title={selectedLente ? 'Editar Lente' : 'Agregar Nuevo Lente'}
        formData={formData}
        handleInputChange={handleInputChange}
        errors={errors}
        submitLabel={selectedLente ? 'Guardar Cambios' : 'Agregar Lente'}
        categorias={categorias}
        marcas={marcas}
        promociones={promociones}
        sucursales={sucursales}
        setFormData={setFormData}
        loading={loading}
        imagePreviews={imagePreviews}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
      />

      <DetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModals}
        title="Detalles del Lente"
        fields={detailFields}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseModals}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el lente "${selectedLente?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={loading}
      />
    </div>
  );
};

export default LentesContent;