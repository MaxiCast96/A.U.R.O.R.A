// src/pages/LentesContent.jsx
import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../config/api';
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
import LentesFormModal from '../management/lentes/LentesFormModal';

// Iconos
import { Search, Plus, Trash2, Eye, Edit, Glasses, TrendingUp, Package, DollarSign, Tag, Image as ImageIcon, Building2, Palette, Layers } from 'lucide-react';

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
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLente, setSelectedLente] = useState(null);
  const [alert, setAlert] = useState(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');

  // --- DATOS INICIALES DEL FORMULARIO ---
  const initialFormData = {
    nombre: '',
    descripcion: '',
    categoriaId: '',
    marcaId: '',
    material: '',
    color: '',
    tipoLente: '',
    precioBase: 0,
    precioActual: 0,
    linea: '',
    medidas: {
      anchoPuente: '',
      altura: '',
      ancho: ''
    },
    imagenes: [],
    enPromocion: false,
    promocionId: '',
    fechaCreacion: new Date().toISOString().split('T')[0],
    sucursales: [],
  };

  // --- HOOK DE FORMULARIO CON VALIDACIÓN ---
  const { formData, setFormData, handleInputChange, resetForm, validateForm, errors, setErrors } = useForm(
    initialFormData,
    (data) => {
      const newErrors = {};
      
      // Validaciones básicas
      if (!data.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
      if (!data.descripcion?.trim()) newErrors.descripcion = 'La descripción es requerida';
      if (!data.categoriaId) newErrors.categoriaId = 'La categoría es requerida';
      if (!data.marcaId) newErrors.marcaId = 'La marca es requerida';
      if (!data.material?.trim()) newErrors.material = 'El material es requerido';
      if (!data.color?.trim()) newErrors.color = 'El color es requerido';
      if (!data.tipoLente?.trim()) newErrors.tipoLente = 'El tipo de lente es requerido';
      if (!data.linea?.trim()) newErrors.linea = 'La línea es requerida';

      // Validaciones de precios
      if (!data.precioBase || data.precioBase <= 0) {
        newErrors.precioBase = 'El precio base debe ser mayor a 0';
      }

      if (data.enPromocion) {
        if (!data.promocionId) {
          newErrors.promocionId = 'Debe seleccionar una promoción';
        }
        
        if (!data.precioActual || data.precioActual <= 0) {
          newErrors.precioActual = 'El precio promocional debe ser mayor a 0';
        } else if (data.precioActual >= data.precioBase) {
          newErrors.precioActual = 'El precio promocional debe ser menor al precio base';
        }
      }

      // Validación de Medidas
      if (data.medidas) {
        if (!data.medidas.anchoPuente || data.medidas.anchoPuente <= 0) 
          newErrors['medidas.anchoPuente'] = 'Ancho de puente inválido';
        if (!data.medidas.altura || data.medidas.altura <= 0) 
          newErrors['medidas.altura'] = 'Altura inválida';
        if (!data.medidas.ancho || data.medidas.ancho <= 0) 
          newErrors['medidas.ancho'] = 'Ancho inválido';
      }

      // Validación de Imágenes
      if (!data.imagenes || data.imagenes.length === 0) {
        newErrors.imagenes = 'Se requiere al menos una imagen';
      }

      // Validación de Stock por Sucursal
      if (!data.sucursales || data.sucursales.length === 0) {
        newErrors.sucursales = 'Debe seleccionar al menos una sucursal';
      }

      const hasInvalidStock = data.sucursales?.some(s => s.stock < 0);
      if (hasInvalidStock) {
        newErrors.sucursales = 'El stock no puede ser negativo';
      }

      return newErrors;
    }
  );

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

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
          [lentesRes, categoriasRes, marcasRes, promocionesRes, sucursalesRes] = await doFetch(PROD_FALLBACK);
          API_CONFIG.BASE_URL = PROD_FALLBACK;
        } else {
          throw err;
        }
      }
      
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

  // --- FUNCIONES DE MODAL ---
  const handleCloseModals = () => {
    setShowAddEditModal(false);
    setShowDetailModal(false);
    setShowDeleteModal(false);
    setSelectedLente(null);
    resetForm();
    setErrors({});
  };

  const handleOpenAddModal = () => {
    resetForm();
    setSelectedLente(null);
    setFormData(initialFormData);
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (lente) => {
    setSelectedLente(lente);
    
    // Normalizar imágenes
    const normalizeImages = (images) => {
      if (!images || !Array.isArray(images)) return [];
      return images.map(img => {
        if (typeof img === 'string') {
          return img.startsWith('http') ? img : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${img}`;
        }
        if (typeof img === 'object' && img !== null) {
          return img.secure_url || img.url || (img.public_id ? `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${img.public_id}` : '');
        }
        return '';
      }).filter(url => url && url.length > 0);
    };

    // Normalizar sucursales
    const normalizeSucursales = (sucursales) => {
      if (!sucursales || !Array.isArray(sucursales)) return [];
      return sucursales.map(s => ({
        sucursalId: s.sucursalId?._id || s.sucursalId || s._id || '',
        nombreSucursal: s.nombreSucursal || s.sucursalId?.nombre || s.nombre || '',
        stock: parseInt(s.stock) || 0
      }));
    };

    const editData = {
      nombre: lente.nombre || '',
      descripcion: lente.descripcion || '',
      categoriaId: lente.categoriaId?._id || lente.categoriaId || '',
      marcaId: lente.marcaId?._id || lente.marcaId || '',
      material: lente.material || '',
      color: lente.color || '',
      tipoLente: lente.tipoLente || '',
      precioBase: parseFloat(lente.precioBase) || 0,
      precioActual: parseFloat(lente.precioActual || lente.precioBase) || 0,
      linea: lente.linea || '',
      medidas: {
        anchoPuente: lente.medidas?.anchoPuente || '',
        altura: lente.medidas?.altura || '',
        ancho: lente.medidas?.ancho || '',
      },
      imagenes: normalizeImages(lente.imagenes),
      enPromocion: Boolean(lente.enPromocion),
      promocionId: lente.promocionId?._id || lente.promocionId || '',
      fechaCreacion: lente.fechaCreacion ? new Date(lente.fechaCreacion).toISOString().split('T')[0] : '',
      sucursales: normalizeSucursales(lente.sucursales)
    };

    setFormData(editData);
    setShowAddEditModal(true);
  };

  const handleOpenDetailModal = (lente) => {
    setSelectedLente(lente);
    setShowDetailModal(true);
  };

  const handleOpenDeleteModal = (lente) => {
    setSelectedLente(lente);
    setShowDeleteModal(true);
  };

  // --- FUNCIÓN DE ENVÍO DEL FORMULARIO ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('error', 'Por favor, corrige los errores del formulario.');
      return;
    }

    try {
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
        precioActual: formData.enPromocion ? Number(formData.precioActual) : Number(formData.precioBase),
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

      const baseNow = getBase();
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
        await safeRequest((base) => axios.put(withBase(`/lentes/${selectedLente._id}`, base), dataToSend));
        showAlert('success', 'Lente actualizado exitosamente');
      } else {
        await safeRequest((base) => axios.post(withBase('/lentes', base), dataToSend));
        showAlert('success', 'Lente creado exitosamente');
      }
      
      fetchData();
      handleCloseModals();
    } catch (error) {
      showAlert('error', 'Error al guardar el lente: ' + (error.response?.data?.message || error.message));
      console.error('Error saving lente:', error.response?.data || error.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedLente) return;
    
    try {
      const baseNow = getBase();
      const safeRequest = async (base) => {
        try {
          return await axios.delete(withBase(`/lentes/${selectedLente._id}`, base));
        } catch (err) {
          const isConnRefused = err?.message?.includes('ERR_CONNECTION_REFUSED') || err?.code === 'ERR_NETWORK';
          const isLocal = baseNow.includes('localhost');
          if (isConnRefused && isLocal) {
            API_CONFIG.BASE_URL = PROD_FALLBACK;
            return await axios.delete(withBase(`/lentes/${selectedLente._id}`, PROD_FALLBACK));
          }
          throw err;
        }
      };

      await safeRequest(baseNow);
      showAlert('success', 'Lente eliminado exitosamente');
      fetchData();
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
      if (selectedFilter === 'en_promocion') {
        currentLentes = currentLentes.filter((lente) => lente.enPromocion);
      } else if (selectedFilter === 'sin_promocion') {
        currentLentes = currentLentes.filter((lente) => !lente.enPromocion);
      } else if (selectedFilter === 'sin_stock') {
        currentLentes = currentLentes.filter((lente) => 
          lente.sucursales?.every(s => s.stock === 0) || !lente.sucursales?.length
        );
      } else if (selectedFilter === 'con_stock') {
        currentLentes = currentLentes.filter((lente) =>
          lente.sucursales?.some(s => s.stock > 0)
        );
      } else {
        // Filtrar por tipoLente
        currentLentes = currentLentes.filter((lente) =>
          lente.tipoLente?.toLowerCase() === selectedFilter
        );
      }
    }

    return currentLentes;
  }, [lentes, searchTerm, selectedFilter]);

  const { paginatedData: currentLentes, ...paginationProps } = usePagination(filteredLentes, 12);

  // --- FUNCIÓN PARA OBTENER STOCK TOTAL ---
  const getTotalStock = (lente) => {
    return lente.sucursales ? lente.sucursales.reduce((sum, s) => sum + (s.stock || 0), 0) : 0;
  };

  // --- ESTADÍSTICAS ---
  const lentesArr = Array.isArray(lentes) ? lentes : [];
  const totalLentes = lentesArr.length;
  const lentesEnPromocion = lentesArr.filter(l => l.enPromocion).length;
  const stockTotal = lentesArr.reduce((sum, l) => sum + getTotalStock(l), 0);
  const valorInventario = lentesArr.reduce((sum, l) => sum + ((l.precioActual || l.precioBase || 0) * getTotalStock(l)), 0);

  const stats = [
    { 
      title: "Total de Lentes", 
      value: totalLentes, 
      Icon: Glasses,
      color: "bg-blue-500" 
    },
    { 
      title: "En Promoción", 
      value: lentesEnPromocion, 
      Icon: TrendingUp,
      color: "bg-green-500" 
    },
    { 
      title: "Stock Total", 
      value: stockTotal, 
      Icon: Package,
      color: "bg-purple-500" 
    },
    { 
      title: "Valor Inventario", 
      value: valorInventario.toLocaleString('es-SV', { style: 'currency', currency: 'USD' }), 
      Icon: DollarSign,
      color: "bg-yellow-500" 
    },
  ];

  // --- COLUMNAS DE TABLA ---
  const tableColumns = [
    { header: 'Producto', key: 'producto' },
    { header: 'Marca/Categoría', key: 'marca_categoria' },
    { header: 'Características', key: 'caracteristicas' },
    { header: 'Precio', key: 'precio' },
    { header: 'Stock', key: 'stock' },
    { header: 'Estado', key: 'estado' },
    { header: 'Acciones', key: 'acciones' }
  ];

  // --- FUNCIÓN PARA RENDERIZAR FILAS ---
  const renderRow = (lente) => {
    const stockTotal = getTotalStock(lente);
    const tieneStock = stockTotal > 0;
    
    return (
      <>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12">
              {lente.imagenes && lente.imagenes.length > 0 ? (
                <img 
                  src={lente.imagenes[0]} 
                  alt={lente.nombre}
                  className="w-12 h-12 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Glasses className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {lente.nombre}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {lente.descripcion}
              </p>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">
                {lente.marcaId?.nombre || 'Sin marca'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {lente.categoriaId?.nombre || 'Sin categoría'}
              </span>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-gray-400" />
              <span>{lente.color}</span>
            </div>
            <div className="text-gray-500">
              {lente.material} • {lente.tipoLente}
            </div>
            {lente.linea && (
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">
                {lente.linea}
              </div>
            )}
            {lente.medidas && (
              <div className="text-xs text-gray-400">
                {lente.medidas.ancho}×{lente.medidas.altura}×{lente.medidas.anchoPuente}mm
              </div>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            {lente.enPromocion ? (
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-green-600">
                    ${(lente.precioActual || 0).toFixed(2)}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    OFERTA
                  </span>
                </div>
                <div className="text-sm text-gray-500 line-through">
                  ${(lente.precioBase || 0).toFixed(2)}
                </div>
                {lente.promocionId?.nombre && (
                  <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full inline-block">
                    {lente.promocionId.nombre}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-lg font-semibold text-gray-900">
                ${(lente.precioBase || 0).toFixed(2)}
              </span>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className={`text-sm font-medium ${tieneStock ? 'text-green-600' : 'text-red-600'}`}>
              {stockTotal} unidades
            </div>
            <div className="text-xs text-gray-500">
              en {lente.sucursales?.length || 0} sucursal(es)
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="flex flex-col space-y-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              lente.enPromocion 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {lente.enPromocion ? '🏷️ Promoción' : 'Precio normal'}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              tieneStock 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {tieneStock ? '✅ Disponible' : '❌ Sin stock'}
            </span>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="flex space-x-2">
            <button 
              onClick={() => handleOpenDetailModal(lente)} 
              className="p-2 text-blue-600 bg-white hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" 
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleOpenEditModal(lente)} 
              className="p-2 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" 
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleOpenDeleteModal(lente)} 
              className="p-2 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110" 
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Alerta */}
      <Alert alert={alert} />
      
      {/* Estadísticas */}
      <StatsGrid stats={stats} />
      
      {/* Tabla principal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <PageHeader 
          title="Gestión de Lentes" 
          buttonLabel="Agregar Lente" 
          onButtonClick={handleOpenAddModal} 
        />
        
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre, marca, material o color..."
          filters={[
            { label: 'Todos', value: 'todos' },
            { label: 'En Promoción', value: 'en_promocion' },
            { label: 'Sin Promoción', value: 'sin_promocion' },
            { label: 'Con Stock', value: 'con_stock' },
            { label: 'Sin Stock', value: 'sin_stock' },
            { label: 'Monofocal', value: 'monofocal' },
            { label: 'Bifocal', value: 'bifocal' },
            { label: 'Progresivo', value: 'progresivo' },
            { label: 'Ocupacional', value: 'ocupacional' }
          ]}
          activeFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
        
        <DataTable
          columns={tableColumns}
          data={currentLentes}
          renderRow={renderRow}
          loading={loading}
          noDataMessage="No se encontraron lentes"
          noDataSubMessage={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no hay lentes registrados'}
        />
        
        <Pagination {...paginationProps} />
      </div>

      {/* Modal de formulario */}
      <LentesFormModal
        isOpen={showAddEditModal}
        onClose={handleCloseModals}
        onSubmit={handleFormSubmit}
        title={selectedLente ? "Editar Lente" : "Agregar Nuevo Lente"}
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        errors={errors}
        isEditing={!!selectedLente}
        categorias={categorias}
        marcas={marcas}
        promociones={promociones}
        sucursales={sucursales}
        selectedLente={selectedLente}
      />

      {/* Modal de detalles mejorado */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModals}
        title="Detalles del Lente"
        item={selectedLente}
        data={selectedLente ? [
          { label: "Nombre", value: selectedLente.nombre },
          { label: "Descripción", value: selectedLente.descripcion },
          { label: "Categoría", value: selectedLente.categoriaId?.nombre || selectedLente.categoriaId },
          { label: "Marca", value: selectedLente.marcaId?.nombre || selectedLente.marcaId },
          { label: "Línea", value: selectedLente.linea },
          { label: "Material", value: selectedLente.material },
          { label: "Color", value: selectedLente.color },
          { label: "Tipo de Lente", value: selectedLente.tipoLente },
          { label: "Precio Base", value: `${(selectedLente.precioBase || 0).toFixed(2)}` },
          { 
            label: "Precio Actual", 
            value: `${(selectedLente.precioActual || selectedLente.precioBase || 0).toFixed(2)}`,
            color: selectedLente.enPromocion ? 'text-green-600' : 'text-gray-900'
          },
          { 
            label: "Estado", 
            value: selectedLente.enPromocion ? 'En Promoción' : 'Precio Normal',
            color: selectedLente.enPromocion ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
          },
          ...(selectedLente.enPromocion && selectedLente.promocionId ? [{
            label: "Promoción Aplicada",
            value: selectedLente.promocionId?.nombre || 'Promoción sin nombre',
            color: 'text-orange-600'
          }] : []),
          { label: "Ancho Puente", value: `${selectedLente.medidas?.anchoPuente || 'N/A'} mm` },
          { label: "Altura", value: `${selectedLente.medidas?.altura || 'N/A'} mm` },
          { label: "Ancho", value: `${selectedLente.medidas?.ancho || 'N/A'} mm` },
          { 
            label: "Stock Total", 
            value: `${getTotalStock(selectedLente)} unidades`
          },
          { 
            label: "Disponibilidad por Sucursal", 
            value: selectedLente.sucursales?.map(s => 
              `${s.nombreSucursal || s.sucursalId?.nombre}: ${s.stock || 0} unidades`
            ).join(' | ') || 'Sin stock'
          },
          { label: "Imágenes", value: `${selectedLente.imagenes?.length || 0} imagen(es)` },
          { label: "Fecha de Creación", value: selectedLente.fechaCreacion ? new Date(selectedLente.fechaCreacion).toLocaleDateString('es-ES') : 'N/A' }
        ] : []}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseModals}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el lente "${selectedLente?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default LentesContent;