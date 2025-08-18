// src/pages/LentesContent.jsx
import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../config/api';
import { useForm } from '../../../hooks/admin/useForm'; // Ajusta la ruta si es necesario
import { usePagination } from '../../../hooks/admin/usePagination'; // Ajusta la ruta si es necesario

// Componentes de UI (asumiendo que estas rutas son correctas)
import PageHeader from '../ui/PageHeader';
import StatsGrid from '../ui/StatsGrid';
import FilterBar from '../ui/FilterBar';
import DataTable from '../ui/DataTable';
import Pagination from '../ui/Pagination';
import ConfirmationModal from '../ui/ConfirmationModal';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';
import LentesFormModal from '../management/lentes/LentesFormModal'; // Importa el nuevo modal

// Iconos
import { Search, Plus, Trash2, Eye, Edit, Glasses, TrendingUp, Package, DollarSign, Tag, Image as ImageIcon } from 'lucide-react';

// Helpers para usar BASE_URL dinámico + fallback per-request
const getBase = () => API_CONFIG.BASE_URL;
const PROD_FALLBACK = 'https://a-u-r-o-r-a.onrender.com/api';
const withBase = (path, base = getBase()) => `${base}${path}`;

const LentesContent = () => {
  // --- ESTADOS ---
  const [lentes, setLentes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [sucursales, setSucursales] = useState([]); // Para gestionar el stock por sucursal
  const [loading, setLoading] = useState(true);
  const [selectedLente, setSelectedLente] = useState(null);
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
      const baseNow = getBase();
      const doFetch = async (base) => Promise.all([
        axios.get(withBase('/lentes', base)),
        axios.get(withBase('/categoria', base)),
        axios.get(withBase('/marcas', base)),
        axios.get(withBase('/promociones', base)),
        axios.get(withBase('/sucursales', base)),
      ]);
      let lentesRes, categoriasRes, marcasRes, promocionesRes, sucursalesRes;
      try {
        [lentesRes, categoriasRes, marcasRes, promocionesRes, sucursalesRes] = await doFetch(baseNow);
      } catch (err) {
        const isConnRefused = err?.message?.includes('ERR_CONNECTION_REFUSED') || err?.code === 'ERR_NETWORK';
        const isLocal = baseNow.includes('localhost');
        if (isConnRefused && isLocal) {
          // Retry against PROD once
          [lentesRes, categoriasRes, marcasRes, promocionesRes, sucursalesRes] = await doFetch(PROD_FALLBACK);
          // Opcional: actualizar BASE_URL activa para el resto de la app
          API_CONFIG.BASE_URL = PROD_FALLBACK;
        } else {
          throw err;
        }
      }
      // Normaliza la respuesta a un arreglo para evitar errores en .filter/.reduce
      const lentesData = Array.isArray(lentesRes.data)
        ? lentesRes.data
        : (Array.isArray(lentesRes.data?.data) ? lentesRes.data.data : []);
      setLentes(lentesData);
      setCategorias(categoriasRes.data);
      setMarcas(marcasRes.data);
      setPromociones(promocionesRes.data);
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

  // --- MANEJO DE FORMULARIO ---
  // Datos iniciales del formulario basados en el esquema Lentes.js
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
    medidas: {
      anchoPuente: '',
      altura: '',
      ancho: ''
    },
    imagenes: [],
    enPromocion: false,
    promocionId: '',
    fechaCreacion: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
    sucursales: [],
  };

  const { formData, setFormData, handleInputChange, resetForm, validateForm, errors, setErrors } = useForm(
    initialFormData,
    (data) => {
      const newErrors = {};
      if (!data.nombre?.trim()) newErrors.nombre = 'El nombre es requerido.';
      if (!data.descripcion?.trim()) newErrors.descripcion = 'La descripción es requerida.';
      if (!data.categoriaId) newErrors.categoriaId = 'La categoría es requerida.';
      if (!data.marcaId) newErrors.marcaId = 'La marca es requerida.';
      if (!data.material?.trim()) newErrors.material = 'El material es requerido.';
      if (!data.color?.trim()) newErrors.color = 'El color es requerido.';
      if (!data.tipoLente?.trim()) newErrors.tipoLente = 'El tipo de lente es requerido.';
      if (data.precioBase <= 0 || isNaN(data.precioBase)) newErrors.precioBase = 'El precio base debe ser un número mayor a 0.';
      if (data.precioActual <= 0 || isNaN(data.precioActual)) newErrors.precioActual = 'El precio actual debe ser un número mayor a 0.';
      if (data.precioActual > data.precioBase) newErrors.precioActual = 'El precio actual no puede ser mayor que el precio base.';
      if (!data.linea?.trim()) newErrors.linea = 'La línea es requerida.';

      // Validación de Medidas
      if (data.medidas) {
        if (data.medidas.anchoPuente <= 0 || isNaN(data.medidas.anchoPuente)) newErrors['medidas.anchoPuente'] = 'Ancho de puente inválido.';
        if (data.medidas.altura <= 0 || isNaN(data.medidas.altura)) newErrors['medidas.altura'] = 'Altura inválida.';
        if (data.medidas.ancho <= 0 || isNaN(data.medidas.ancho)) newErrors['medidas.ancho'] = 'Ancho inválido.';
      } else {
         newErrors.medidas = 'Las medidas son requeridas.'; // Should not happen if initialFormData has it
      }


      // Validación de Imágenes (se requiere al menos una)
      if (!data.imagenes || data.imagenes.length === 0) newErrors.imagenes = 'Se requiere al menos una imagen.';

      // Validación de Promoción
      if (data.enPromocion && !data.promocionId) {
        newErrors.promocionId = 'Se debe seleccionar una promoción si está en promoción.';
      }

      // Validación de Stock por Sucursal
      // Permitimos 0 sucursales, pero si hay, el stock debe ser >= 0
      data.sucursales.forEach(s => {
        if (s.stock < 0 || s.stock === null || s.stock === undefined || isNaN(s.stock)) {
          newErrors[`sucursales[${s.sucursalId}].stock`] = 'El stock no puede ser negativo.';
        }
      });

      return newErrors;
    }
  );

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleCloseModals = () => {
    setShowAddEditModal(false);
    setShowDetailModal(false);
    setShowDeleteModal(false);
    setSelectedLente(null);
    resetForm();
    setErrors({}); // Limpiar errores al cerrar el modal
  };

  const handleOpenAddModal = () => {
    resetForm();
    setFormData(initialFormData); // Asegurar un estado fresco al agregar
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (lente) => {
    setSelectedLente(lente);
    // Pre-poblar los datos del formulario para editar
    setFormData({
      ...lente,
      categoriaId: lente.categoriaId?._id || '', // Acceder al ID si está poblado
      marcaId: lente.marcaId?._id || '',         // Acceder al ID si está poblado
      promocionId: lente.promocionId?._id || '', // Acceder al ID si está poblado
      fechaCreacion: lente.fechaCreacion ? new Date(lente.fechaCreacion).toISOString().split('T')[0] : '',
      sucursales: lente.sucursales || [], // Asegurar que sea un array
      medidas: {
        anchoPuente: lente.medidas?.anchoPuente || '',
        altura: lente.medidas?.altura || '',
        ancho: lente.medidas?.ancho || '',
      },
      imagenes: lente.imagenes || [],
    });
    setShowAddEditModal(true);
  };

  const handleOpenViewModal = (lente) => {
    setSelectedLente(lente);
    setShowDetailModal(true);
  };

  const handleOpenDeleteModal = (lente) => {
    setSelectedLente(lente);
    setShowDeleteModal(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showAlert('error', 'Por favor, corrige los errores en el formulario.');
      return;
    }

    try {
      // Normalizar payload para el backend
      const medidas = formData.medidas || {};
      let dataToSend = {
        nombre: formData.nombre?.trim(),
        descripcion: formData.descripcion?.trim(),
        categoriaId: formData.categoriaId,
        marcaId: formData.marcaId,
        material: formData.material?.trim(),
        color: formData.color?.trim(),
        tipoLente: formData.tipoLente?.trim(),
        precioBase: Number(formData.precioBase),
        precioActual: Number(formData.precioActual),
        linea: formData.linea?.trim(),
        medidas: {
          anchoPuente: Number(medidas.anchoPuente),
          altura: Number(medidas.altura),
          ancho: Number(medidas.ancho),
        },
        imagenes: Array.isArray(formData.imagenes) ? formData.imagenes : [],
        enPromocion: !!formData.enPromocion,
        promocionId: formData.enPromocion ? formData.promocionId : undefined,
        fechaCreacion: formData.fechaCreacion,
        sucursales: Array.isArray(formData.sucursales) ? formData.sucursales
          .map(s => ({
            sucursalId: typeof s.sucursalId === 'object' && s.sucursalId?._id ? s.sucursalId._id : s.sucursalId,
            nombreSucursal: s.nombreSucursal || (sucursales.find(x => x._id === (typeof s.sucursalId === 'object' ? s.sucursalId?._id : s.sucursalId))?.nombre) || '',
            stock: Number(s.stock ?? 0),
          }))
          .filter(s => typeof s.sucursalId === 'string' && /^[a-fA-F0-9]{24}$/.test(s.sucursalId))
          : [],
      };

      // Prune invalid fields for update
      const prune = (obj) => {
        Object.keys(obj).forEach((k) => {
          const v = obj[k];
          if (v === undefined || v === null) {
            delete obj[k];
            return;
          }
          if (typeof v === 'string' && v.trim() === '') {
            delete obj[k];
            return;
          }
          if (typeof v === 'object' && !Array.isArray(v)) {
            prune(v);
          }
        });
      };
      prune(dataToSend);

      const baseNow = getBase();
      const putUrl = withBase(`/lentes/${selectedLente?._id || ''}`, baseNow);
      const postUrl = withBase('/lentes', baseNow);

      const safeRequest = async (fn) => {
        try {
          return await fn(baseNow);
        } catch (err) {
          const isConnRefused = err?.message?.includes('ERR_CONNECTION_REFUSED') || err?.code === 'ERR_NETWORK';
          const isLocal = baseNow.includes('localhost');
          if (isConnRefused && isLocal) {
            API_CONFIG.BASE_URL = PROD_FALLBACK;
            return await fn(PROD_FALLBACK);
          }
          throw err;
        }
      };

      if (selectedLente) {
        // Actualizar
        await safeRequest((base) => axios.put(withBase(`/lentes/${selectedLente._id}`, base), dataToSend));
        showAlert('success', 'Lente actualizado exitosamente.');
      } else {
        // Crear
        await safeRequest((base) => axios.post(withBase('/lentes', base), dataToSend));
        showAlert('success', 'Lente creado exitosamente.');
      }
      fetchData(); // Recargar datos después de la operación exitosa
      handleCloseModals();
    } catch (error) {
      showAlert('error', 'Error al guardar el lente: ' + (error.response?.data?.message || error.message));
      console.error('Error saving lente:', error.response?.data || error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/lentes/${selectedLente._id}`);
      showAlert('success', 'Lente eliminado exitosamente.');
      fetchData(); // Recargar datos después de la eliminación
      handleCloseModals();
    } catch (error) {
      showAlert('error', 'Error al eliminar el lente: ' + (error.response?.data?.message || error.message));
    }
  };

  // --- FILTRADO Y PAGINACIÓN ---
  const filteredLentes = useMemo(() => {
    let currentLentes = Array.isArray(lentes) ? lentes : [];

    // Filtro por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      currentLentes = currentLentes.filter(
        (lente) =>
          lente.nombre?.toLowerCase().includes(searchLower) ||
          lente.descripcion?.toLowerCase().includes(searchLower) ||
          lente.material?.toLowerCase().includes(searchLower) ||
          lente.color?.toLowerCase().includes(searchLower) ||
          lente.tipoLente?.toLowerCase().includes(searchLower) ||
          lente.linea?.toLowerCase().includes(searchLower) ||
          lente.categoriaId?.nombre?.toLowerCase().includes(searchLower) ||
          lente.marcaId?.nombre?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por selección
    if (selectedFilter !== 'todos') {
      if (selectedFilter === 'enPromocion') {
        currentLentes = currentLentes.filter((lente) => lente.enPromocion);
      } else {
        // Filtrar por tipoLente
        currentLentes = currentLentes.filter((lente) =>
          lente.tipoLente?.toLowerCase() === selectedFilter
        );
      }
    }

    return currentLentes;
  }, [lentes, searchTerm, selectedFilter]);

  const { currentPage, pageSize, paginatedData, totalPages, goToNextPage, goToPreviousPage, goToFirstPage, goToLastPage, setPageSize } = usePagination(filteredLentes);

  // --- DATOS PARA ESTADÍSTICAS RÁPIDAS ---
  const getTotalStock = (lente) => {
    return lente.sucursales ? lente.sucursales.reduce((sum, s) => sum + s.stock, 0) : 0;
  };

  const lentesArr = Array.isArray(lentes) ? lentes : [];
  const stats = [
    { id: 1, name: 'Total de Lentes', value: lentesArr.length, Icon: Glasses, color: 'text-blue-500' },
    { id: 2, name: 'Lentes en Promoción', value: lentesArr.filter(l => l.enPromocion).length, Icon: TrendingUp, color: 'text-purple-500' },
    { id: 3, name: 'Stock Total', value: lentesArr.reduce((sum, l) => sum + getTotalStock(l), 0), Icon: Package, color: 'text-green-500' },
    { id: 4, name: 'Valor Inventario', value: lentesArr.reduce((sum, l) => sum + (l.precioActual * getTotalStock(l)), 0).toLocaleString('es-SV', { style: 'currency', currency: 'USD' }), Icon: DollarSign, color: 'text-yellow-500' },
  ];

  // --- COLUMNAS DE LA TABLA ---
  const columns = [
    { label: 'Nombre', key: 'nombre' },
    { label: 'Línea', key: 'linea' },
    { label: 'Tipo Lente', key: 'tipoLente' },
    // Mostrar nombre si viene poblado; de lo contrario, mostrar el ID o '-'
    { label: 'Marca', key: 'marcaId', render: (lente) => lente.marcaId?.nombre || lente.marcaId || '-' },
    { label: 'Categoría', key: 'categoriaId', render: (lente) => lente.categoriaId?.nombre || lente.categoriaId || '-' },
    { label: 'Precio Actual', key: 'precioActual', render: (lente) => lente.precioActual?.toLocaleString('es-SV', { style: 'currency', currency: 'USD' }) },
    { label: 'Stock Total', key: 'stockTotal', render: (lente) => getTotalStock(lente) },
    {
      label: 'Promoción',
      key: 'enPromocion',
      render: (lente) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${lente.enPromocion ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {lente.enPromocion ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      label: 'Acciones',
      key: 'actions',
      render: (lente) => (
        <div className="flex space-x-2">
          <button onClick={() => handleOpenViewModal(lente)} className="text-blue-600 hover:text-blue-800">
            <Eye className="w-5 h-5" />
          </button>
          <button onClick={() => handleOpenEditModal(lente)} className="text-yellow-600 hover:text-yellow-800">
            <Edit className="w-5 h-5" />
          </button>
          <button onClick={() => handleOpenDeleteModal(lente)} className="text-red-600 hover:text-red-800">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  // --- CAMPOS PARA EL MODAL DE DETALLES ---
  const detailFields = selectedLente ? [
    { label: 'ID', value: selectedLente._id },
    { label: 'Nombre', value: selectedLente.nombre },
    { label: 'Descripción', value: selectedLente.descripcion },
    { label: 'Categoría', value: selectedLente.categoriaId?.nombre || 'N/A' },
    { label: 'Marca', value: selectedLente.marcaId?.nombre || 'N/A' },
    { label: 'Material', value: selectedLente.material },
    { label: 'Color', value: selectedLente.color },
    { label: 'Tipo de Lente', value: selectedLente.tipoLente },
    { label: 'Precio Base', value: selectedLente.precioBase?.toLocaleString('es-SV', { style: 'currency', currency: 'USD' }) },
    { label: 'Precio Actual', value: selectedLente.precioActual?.toLocaleString('es-SV', { style: 'currency', currency: 'USD' }) },
    { label: 'Línea', value: selectedLente.linea },
    { label: 'Ancho Puente', value: `${selectedLente.medidas?.anchoPuente || 'N/A'} mm` },
    { label: 'Altura', value: `${selectedLente.medidas?.altura || 'N/A'} mm` },
    { label: 'Ancho', value: `${selectedLente.medidas?.ancho || 'N/A'} mm` },
    {
      label: 'Imágenes',
      value: selectedLente.imagenes && selectedLente.imagenes.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedLente.imagenes.map((img, index) => (
            <img key={index} src={img} alt={`Lente ${index + 1}`} className="w-24 h-24 object-cover rounded-md" />
          ))}
        </div>
      ) : 'No images',
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
      value: selectedLente.sucursales && selectedLente.sucursales.length > 0 ? (
        <ul className="list-disc list-inside">
          {selectedLente.sucursales.map((s, index) => (
            <li key={index}>{s.nombreSucursal}: {s.stock} unidades</li>
          ))}
        </ul>
      ) : 'No stock info',
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
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        activeFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        filters={[
          { label: 'Todos', value: 'todos' },
          { label: 'En Promoción', value: 'enPromocion' },
          { label: 'Monofocal', value: 'monofocal' },
          { label: 'Bifocal', value: 'bifocal' },
          { label: 'Progresivo', value: 'progresivo' },
          { label: 'Ocupacional', value: 'ocupacional' },
          // Agrega más filtros según sea necesario (por ejemplo, por material, color, etc.)
        ]}
        searchPlaceholder="Buscar lentes por nombre, descripción, material, etc."
      />

      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="text-center py-10">Cargando lentes...</div>
        ) : paginatedData.length > 0 ? (
          <>
            <DataTable columns={columns} data={paginatedData} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              goToNextPage={goToNextPage}
              goToPreviousPage={goToPreviousPage}
              goToFirstPage={goToFirstPage}
              goToLastPage={goToLastPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
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
        setFormData={setFormData} // Se pasa setFormData para permitir actualizaciones directas en arrays anidados
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
      />
    </div>
  );
};

export default LentesContent;