import React, { useState, useEffect, useMemo } from 'react';
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
import AccesoriosFormModal from '../management/employees/AccesoriosFormModal';
import { Search, Plus, Trash2, Eye, Edit, ShoppingBag, Tags, Package, DollarSign, Clock, ImageIcon, Building2, Palette, Layers } from 'lucide-react';

const API_URL = 'https://a-u-r-o-r-a.onrender.com/api/accesorios';
const MARCAS_URL = 'https://a-u-r-o-r-a.onrender.com/api/marcas';
const CATEGORIAS_URL = 'https://a-u-r-o-r-a.onrender.com/api/categoria';
const SUCURSALES_URL = 'https://a-u-r-o-r-a.onrender.com/api/sucursales';
const PROMOCIONES_URL = 'https://a-u-r-o-r-a.onrender.com/api/promociones'; // Nueva URL para promociones

const AccesoriosContent = () => {
  // Estados principales
  const [accesorios, setAccesorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccesorio, setSelectedAccesorio] = useState(null);
  const [alert, setAlert] = useState(null);
  
  // Estados de modales
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estados para datos relacionados
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [promociones, setPromociones] = useState([]); // Nuevo estado para promociones

  // Estados de filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');

  // Hook de formulario con validación completa
  const { formData, setFormData, handleInputChange, resetForm, errors, validateForm } = useForm({
    nombre: '',
    descripcion: '',
    tipo: '',
    marcaId: '',
    linea: '',
    material: '',
    color: '',
    precioBase: 0,
    precioActual: 0,
    imagenes: [],
    enPromocion: false,
    promocionId: '',
    sucursales: []
  }, (data) => {
    const newErrors = {};
    
    // Validaciones básicas
    if (!data.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!data.descripcion?.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!data.tipo) newErrors.tipo = 'La categoría es requerida';
    if (!data.marcaId) newErrors.marcaId = 'La marca es requerida';
    if (!data.linea) newErrors.linea = 'La línea es requerida';
    if (!data.material) newErrors.material = 'El material es requerido';
    if (!data.color) newErrors.color = 'El color es requerido';
    
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
    
    // Validación de sucursales
    if (!data.sucursales || data.sucursales.length === 0) {
      newErrors.sucursales = 'Debe seleccionar al menos una sucursal';
    }
    
    // Validación de stock
    const hasInvalidStock = data.sucursales?.some(s => s.stock < 0);
    if (hasInvalidStock) {
      newErrors.sucursales = 'El stock no puede ser negativo';
    }
    
    // Validación de imágenes
    if (!data.imagenes || data.imagenes.length === 0) {
      newErrors.imagenes = 'Debe agregar al menos una imagen';
    }
    
    return newErrors;
  });

  // Hook de paginación
  const filteredAccesorios = useMemo(() => {
    return accesorios.filter(accesorio => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        accesorio.nombre?.toLowerCase().includes(search) ||
        accesorio.descripcion?.toLowerCase().includes(search) ||
        accesorio.marcaId?.nombre?.toLowerCase().includes(search) ||
        accesorio.tipo?.nombre?.toLowerCase().includes(search) ||
        accesorio.material?.toLowerCase().includes(search) ||
        accesorio.color?.toLowerCase().includes(search);

      let matchesFilter = true;
      if (selectedFilter === 'en_promocion') {
        matchesFilter = accesorio.enPromocion === true;
      } else if (selectedFilter === 'sin_promocion') {
        matchesFilter = accesorio.enPromocion === false;
      } else if (selectedFilter === 'sin_stock') {
        matchesFilter = accesorio.sucursales?.every(s => s.stock === 0);
      } else if (selectedFilter === 'con_stock') {
        matchesFilter = accesorio.sucursales?.some(s => s.stock > 0);
      }

      return matchesSearch && matchesFilter;
    });
  }, [accesorios, searchTerm, selectedFilter]);

  const { paginatedData: currentAccesorios, ...paginationProps } = usePagination(filteredAccesorios, 12);

  // Función para mostrar alertas
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Funciones de carga de datos
  const fetchAccesorios = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      console.log('Accesorios response:', response.data);
      // Manejar diferentes estructuras de respuesta
      const data = response.data.data || response.data;
      setAccesorios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching accesorios:", error);
      showAlert('error', 'Error al cargar los accesorios: ' + (error.response?.data?.message || error.message));
      setAccesorios([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [marcasRes, categoriasRes, sucursalesRes, promocionesRes] = await Promise.all([
        axios.get(MARCAS_URL),
        axios.get(CATEGORIAS_URL),
        axios.get(SUCURSALES_URL),
        axios.get(PROMOCIONES_URL) // Nueva llamada para promociones
      ]);
      
      console.log('Dependencies loaded:', {
        marcas: marcasRes.data,
        categorias: categoriasRes.data,
        sucursales: sucursalesRes.data,
        promociones: promocionesRes.data
      });
      
      setMarcas(Array.isArray(marcasRes.data) ? marcasRes.data : marcasRes.data.data || []);
      setCategorias(Array.isArray(categoriasRes.data) ? categoriasRes.data : categoriasRes.data.data || []);
      setSucursales(Array.isArray(sucursalesRes.data) ? sucursalesRes.data : sucursalesRes.data.data || []);
      setPromociones(Array.isArray(promocionesRes.data) ? promocionesRes.data : promocionesRes.data.data || []); // Nuevas promociones
      
    } catch (error) {
      console.error("Error fetching dependencies:", error);
      showAlert('error', 'Error al cargar marcas, categorías, sucursales o promociones: ' + (error.response?.data?.message || error.message));
      
      // Establecer arrays vacíos en caso de error
      setMarcas([]);
      setCategorias([]);
      setSucursales([]);
      setPromociones([]); // Nuevo estado por defecto
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchAccesorios();
    fetchDependencies();
    
    // Cargar script de Cloudinary
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

  // Funciones de manejo de modales
  const handleCloseModals = () => {
    setShowAddEditModal(false);
    setShowDetailModal(false);
    setShowDeleteModal(false);
    setSelectedAccesorio(null);
    resetForm();
  };

  const handleOpenAddModal = () => {
    resetForm();
    setSelectedAccesorio(null);
    
    // Establecer valores por defecto
    setFormData({
      nombre: '',
      descripcion: '',
      tipo: '',
      marcaId: '',
      linea: '',
      material: '',
      color: '',
      precioBase: 0,
      precioActual: 0,
      imagenes: [],
      enPromocion: false,
      promocionId: '',
      sucursales: []
    });
    
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (accesorio) => {
  setSelectedAccesorio(accesorio);
  
  // Función para normalizar las imágenes
  const normalizeImages = (images) => {
    if (!images || !Array.isArray(images)) return [];
    
    return images.map(img => {
      // Si es un string (URL directa)
      if (typeof img === 'string') {
        return img.startsWith('http') ? img : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${img}`;
      }
      
      // Si es un objeto con propiedades
      if (typeof img === 'object' && img !== null) {
        // Priorizar secure_url, luego url, luego public_id
        return img.secure_url || img.url || (img.public_id ? `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${img.public_id}` : '');
      }
      
      return '';
    }).filter(url => url && url.length > 0); // Filtrar URLs vacías
  };

  // Función para normalizar sucursales
  const normalizeSucursales = (sucursales) => {
    if (!sucursales || !Array.isArray(sucursales)) return [];
    
    return sucursales.map(s => ({
      sucursalId: s.sucursalId?._id || s.sucursalId || s._id || '',
      nombreSucursal: s.nombreSucursal || s.sucursalId?.nombre || s.nombre || '',
      stock: parseInt(s.stock) || 0
    }));
  };

  // Preparar datos para edición con normalización mejorada
  const editData = {
    nombre: accesorio.nombre || '',
    descripcion: accesorio.descripcion || '',
    tipo: accesorio.tipo?._id || accesorio.tipo || '',
    marcaId: accesorio.marcaId?._id || accesorio.marcaId || '',
    linea: accesorio.linea || '',
    material: accesorio.material || '',
    color: accesorio.color || '',
    precioBase: parseFloat(accesorio.precioBase) || 0,
    precioActual: parseFloat(accesorio.precioActual || accesorio.precioBase) || 0,
    imagenes: normalizeImages(accesorio.imagenes),
    enPromocion: Boolean(accesorio.enPromocion),
    promocionId: accesorio.promocionId?._id || accesorio.promocionId || '',
    sucursales: normalizeSucursales(accesorio.sucursales)
  };
  
  console.log('Datos originales del accesorio:', {
    imagenes_originales: accesorio.imagenes,
    sucursales_originales: accesorio.sucursales
  });
  
  console.log('Datos normalizados para edición:', editData);
  
  setFormData(editData);
  setShowAddEditModal(true);
};


  const debugImageUrls = (images) => {
  if (!Array.isArray(images)) {
    console.warn('Images is not an array:', images);
    return;
  }
  
  images.forEach((img, index) => {
    console.log(`Image ${index}:`, {
      type: typeof img,
      value: img,
      isString: typeof img === 'string',
      isObject: typeof img === 'object',
      hasSecureUrl: img?.secure_url,
      hasUrl: img?.url,
      hasPublicId: img?.public_id
    });
  });
};

// Función adicional para validar URLs de imágenes
const validateImageUrl = async (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout después de 5 segundos
    setTimeout(() => resolve(false), 5000);
  });
};

  const handleOpenDetailModal = (accesorio) => {
    setSelectedAccesorio(accesorio);
    setShowDetailModal(true);
  };

  const handleOpenDeleteModal = (accesorio) => {
    setSelectedAccesorio(accesorio);
    setShowDeleteModal(true);
  };

  // Función de envío del formulario
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form data before validation:', formData);
    
    if (!validateForm()) {
      showAlert('error', 'Por favor, corrige los errores del formulario.');
      return;
    }

    // Preparar FormData para el envío
    const dataToSend = new FormData();
    
    // Agregar campos básicos
    Object.keys(formData).forEach(key => {
      if (key === 'sucursales') {
        dataToSend.append('sucursales', JSON.stringify(formData.sucursales));
      } else if (key === 'imagenes') {
        // Las imágenes ya son URLs de Cloudinary, enviarlas como JSON
        dataToSend.append('imagenes', JSON.stringify(formData.imagenes));
      } else if (key === 'promocionId') {
        // Solo enviar promocionId si está en promoción
        if (formData.enPromocion && formData.promocionId) {
          dataToSend.append(key, formData[key]);
        }
      } else {
        dataToSend.append(key, formData[key]);
      }
    });

    // Debug: Ver qué se está enviando
    console.log('Sending data:', Object.fromEntries(dataToSend));

    try {
      let response;
      if (selectedAccesorio) {
        // Actualizar accesorio existente
        response = await axios.put(`${API_URL}/${selectedAccesorio._id}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showAlert('success', 'Accesorio actualizado exitosamente');
      } else {
        // Crear nuevo accesorio
        response = await axios.post(API_URL, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showAlert('success', 'Accesorio creado exitosamente');
      }
      
      console.log('Server response:', response.data);
      
      // Recargar datos y cerrar modal
      await fetchAccesorios();
      handleCloseModals();
      
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      showAlert('error', `Error al guardar el accesorio: ${errorMessage}`);
    }
  };

  // Función de eliminación
  const handleDelete = async () => {
    if (!selectedAccesorio) return;
    
    try {
      await axios.delete(`${API_URL}/${selectedAccesorio._id}`);
      showAlert('success', 'Accesorio eliminado exitosamente');
      await fetchAccesorios();
      handleCloseModals();
    } catch (error) {
      console.error("Error deleting accesorio:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      showAlert('error', `Error al eliminar el accesorio: ${errorMessage}`);
    }
  };

  // Calcular estadísticas
  const totalAccesorios = accesorios.length;
  const accesoriosEnPromocion = accesorios.filter(a => a.enPromocion).length;
  const precioPromedio = accesorios.length > 0 
    ? (accesorios.reduce((sum, a) => sum + (a.precioActual || a.precioBase || 0), 0) / accesorios.length)
    : 0;
  const stockTotal = accesorios.reduce((total, accesorio) => {
    return total + (accesorio.sucursales?.reduce((subtotal, sucursal) => subtotal + (sucursal.stock || 0), 0) || 0);
  }, 0);

  const stats = [
    { 
      title: "Total Accesorios", 
      value: totalAccesorios, 
      Icon: Package,
      color: "bg-blue-500" 
    },
    { 
      title: "En Promoción", 
      value: accesoriosEnPromocion, 
      Icon: Tags,
      color: "bg-green-500" 
    },
    { 
      title: "Precio Promedio", 
      value: `$${precioPromedio.toFixed(2)}`, 
      Icon: DollarSign,
      color: "bg-yellow-500" 
    },
    { 
      title: "Stock Total", 
      value: stockTotal, 
      Icon: ShoppingBag,
      color: "bg-purple-500" 
    }
  ];

  // Definir columnas de la tabla
  const tableColumns = [
    { header: 'Producto', key: 'producto' },
    { header: 'Marca/Categoría', key: 'marca_categoria' },
    { header: 'Características', key: 'caracteristicas' },
    { header: 'Precio', key: 'precio' },
    { header: 'Stock', key: 'stock' },
    { header: 'Estado', key: 'estado' },
    { header: 'Acciones', key: 'acciones' }
  ];

  // Función para renderizar filas de la tabla
  const renderRow = (accesorio) => {
    const stockTotal = accesorio.sucursales?.reduce((total, s) => total + (s.stock || 0), 0) || 0;
    const tieneStock = stockTotal > 0;
    
    return (
      <>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12">
              {accesorio.imagenes && accesorio.imagenes.length > 0 ? (
                <img 
                  src={accesorio.imagenes[0]} 
                  alt={accesorio.nombre}
                  className="w-12 h-12 rounded-lg object-cover border"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {accesorio.nombre}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {accesorio.descripcion}
              </p>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Tags className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">
                {accesorio.marcaId?.nombre || 'Sin marca'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {accesorio.tipo?.nombre || accesorio.tipo || 'Sin categoría'}
              </span>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-gray-400" />
              <span>{accesorio.color}</span>
            </div>
            <div className="text-gray-500">
              {accesorio.material}
            </div>
            {accesorio.linea && (
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">
                {accesorio.linea}
              </div>
            )}
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="space-y-1">
            {accesorio.enPromocion ? (
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-green-600">
                    ${(accesorio.precioActual || 0).toFixed(2)}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    OFERTA
                  </span>
                </div>
                <div className="text-sm text-gray-500 line-through">
                  ${(accesorio.precioBase || 0).toFixed(2)}
                </div>
                {accesorio.promocionId?.nombre && (
                  <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full inline-block">
                    {accesorio.promocionId.nombre}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-lg font-semibold text-gray-900">
                ${(accesorio.precioBase || 0).toFixed(2)}
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
              en {accesorio.sucursales?.length || 0} sucursal(es)
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="flex flex-col space-y-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              accesorio.enPromocion 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {accesorio.enPromocion ? '🏷️ Promoción' : 'Precio normal'}
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
              onClick={() => handleOpenDetailModal(accesorio)} 
              className="p-2 text-blue-600 bg-white hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110" 
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleOpenEditModal(accesorio)} 
              className="p-2 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110" 
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleOpenDeleteModal(accesorio)} 
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
          title="Gestión de Accesorios" 
          buttonLabel="Agregar Accesorio" 
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
            { label: 'Sin Stock', value: 'sin_stock' }
          ]}
          activeFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
        
        <DataTable
          columns={tableColumns}
          data={currentAccesorios}
          renderRow={renderRow}
          loading={loading}
          noDataMessage="No se encontraron accesorios"
          noDataSubMessage={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no hay accesorios registrados'}
        />
        
        <Pagination {...paginationProps} />
      </div>

      {/* Modal de formulario mejorado con soporte para promociones */}
      <AccesoriosFormModal
        isOpen={showAddEditModal}
        onClose={handleCloseModals}
        onSubmit={handleFormSubmit}
        title={selectedAccesorio ? "Editar Accesorio" : "Agregar Nuevo Accesorio"}
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        errors={errors}
        isEditing={!!selectedAccesorio}
        marcas={marcas}
        categorias={categorias}
        sucursales={sucursales}
        promociones={promociones} // Nueva prop para promociones
        selectedAccesorio={selectedAccesorio}
      />

      {/* Modal de detalles mejorado */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModals}
        title="Detalles del Accesorio"
        item={selectedAccesorio}
        data={selectedAccesorio ? [
          { label: "Nombre", value: selectedAccesorio.nombre },
          { label: "Descripción", value: selectedAccesorio.descripcion },
          { label: "Categoría", value: selectedAccesorio.tipo?.nombre || selectedAccesorio.tipo },
          { label: "Marca", value: selectedAccesorio.marcaId?.nombre },
          { label: "Línea", value: selectedAccesorio.linea },
          { label: "Material", value: selectedAccesorio.material },
          { label: "Color", value: selectedAccesorio.color },
          { label: "Precio Base", value: `${(selectedAccesorio.precioBase || 0).toFixed(2)}` },
          { 
            label: "Precio Actual", 
            value: `${(selectedAccesorio.precioActual || selectedAccesorio.precioBase || 0).toFixed(2)}`,
            color: selectedAccesorio.enPromocion ? 'text-green-600' : 'text-gray-900'
          },
          { 
            label: "Estado", 
            value: selectedAccesorio.enPromocion ? 'En Promoción' : 'Precio Normal',
            color: selectedAccesorio.enPromocion ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
          },
          ...(selectedAccesorio.enPromocion && selectedAccesorio.promocionId ? [{
            label: "Promoción Aplicada",
            value: selectedAccesorio.promocionId?.nombre || 'Promoción sin nombre',
            color: 'text-orange-600'
          }] : []),
          { 
            label: "Stock Total", 
            value: `${selectedAccesorio.sucursales?.reduce((total, s) => total + (s.stock || 0), 0) || 0} unidades`
          },
          { 
            label: "Disponibilidad por Sucursal", 
            value: selectedAccesorio.sucursales?.map(s => 
              `${s.nombreSucursal || s.sucursalId?.nombre}: ${s.stock || 0} unidades`
            ).join(' | ') || 'Sin stock'
          },
          { label: "Imágenes", value: `${selectedAccesorio.imagenes?.length || 0} imagen(es)` },
          { label: "Fecha de Creación", value: new Date(selectedAccesorio.createdAt).toLocaleDateString('es-ES') }
        ] : []}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseModals}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el accesorio "${selectedAccesorio?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default AccesoriosContent;