import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, CheckCircle, DollarSign, Search, Plus, Trash2, Eye, Edit, MapPin, Clock, Mail, Phone
} from 'lucide-react';
import FormModal from '../ui/FormModal';
import DetailModal from '../ui/DetailModal';
import Alert from '../ui/Alert';

const SucursalesContent = () => {
  const [sucursales, setSucursales] = useState([]);
  const [filteredSucursales, setFilteredSucursales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todas');
  const [loading, setLoading] = useState(true);
  
  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState(null);
  
  // Estado para alertas
  const [alert, setAlert] = useState({ type: '', message: '' });
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: {
      calle: '',
      ciudad: '',
      departamento: ''
    },
    telefono: '',
    correo: '',
    horariosAtencion: [],
    activo: true
  });
  const [errors, setErrors] = useState({});

  // Cargar sucursales al montar el componente
  useEffect(() => {
    fetchSucursales();
  }, []);

  // Filtrar sucursales cuando cambie el término de búsqueda o el filtro
  useEffect(() => {
    filterSucursales();
  }, [sucursales, searchTerm, selectedFilter]);

  // API Functions
  const fetchSucursales = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sucursales');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setSucursales(data);
      } else if (data.message) {
        showAlert('error', data.message);
      }
    } catch (error) {
      console.error('Error fetching sucursales:', error);
      showAlert('error', 'Error al cargar las sucursales');
    } finally {
      setLoading(false);
    }
  };

  const createSucursal = async (sucursalData) => {
    try {
      const response = await fetch('/api/sucursales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sucursalData)
      });
      
      const data = await response.json();
      
      if (data.message === 'Sucursal guardada') {
        showAlert('success', 'Sucursal creada exitosamente');
        fetchSucursales();
        return true;
      } else {
        showAlert('error', data.message || 'Error al crear la sucursal');
        return false;
      }
    } catch (error) {
      console.error('Error creating sucursal:', error);
      showAlert('error', 'Error al crear la sucursal');
      return false;
    }
  };

  const updateSucursal = async (id, sucursalData) => {
    try {
      const response = await fetch(`/api/sucursales/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sucursalData)
      });
      
      const data = await response.json();
      
      if (data.message === 'Sucursal actualizada') {
        showAlert('success', 'Sucursal actualizada exitosamente');
        fetchSucursales();
        return true;
      } else {
        showAlert('error', data.message || 'Error al actualizar la sucursal');
        return false;
      }
    } catch (error) {
      console.error('Error updating sucursal:', error);
      showAlert('error', 'Error al actualizar la sucursal');
      return false;
    }
  };

  const deleteSucursal = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta sucursal?')) {
      return;
    }

    try {
      const response = await fetch(`/api/sucursales/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.message === 'Sucursal eliminada') {
        showAlert('delete', 'Sucursal eliminada exitosamente');
        fetchSucursales();
      } else {
        showAlert('error', data.message || 'Error al eliminar la sucursal');
      }
    } catch (error) {
      console.error('Error deleting sucursal:', error);
      showAlert('error', 'Error al eliminar la sucursal');
    }
  };

  // Utility functions
  const showAlert = (type, message) => {
    setAlert({ type, message });
  };

  const clearAlert = () => {
    setAlert({ type: '', message: '' });
  };

  const filterSucursales = () => {
    let filtered = sucursales.filter(sucursal => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        sucursal.nombre.toLowerCase().includes(searchLower) ||
        sucursal.correo.toLowerCase().includes(searchLower) ||
        sucursal.telefono.includes(searchTerm) ||
        (sucursal.direccion?.calle && sucursal.direccion.calle.toLowerCase().includes(searchLower)) ||
        (sucursal.direccion?.ciudad && sucursal.direccion.ciudad.toLowerCase().includes(searchLower)) ||
        (sucursal.direccion?.departamento && sucursal.direccion.departamento.toLowerCase().includes(searchLower));

      const matchesFilter = 
        selectedFilter === 'todas' || 
        (selectedFilter === 'activa' && sucursal.activo) ||
        (selectedFilter === 'inactiva' && !sucursal.activo) ||
        (selectedFilter === 'reciente' && new Date(sucursal.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

      return matchesSearch && matchesFilter;
    });

    setFilteredSucursales(filtered);
    setCurrentPage(0);
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    if (!formData.direccion.calle.trim()) {
      newErrors['direccion.calle'] = 'La calle es obligatoria';
    }
    if (!formData.direccion.ciudad.trim()) {
      newErrors['direccion.ciudad'] = 'La ciudad es obligatoria';
    }
    if (!formData.direccion.departamento.trim()) {
      newErrors['direccion.departamento'] = 'El departamento es obligatorio';
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    }
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'El formato del correo no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: {
        calle: '',
        ciudad: '',
        departamento: ''
      },
      telefono: '',
      correo: '',
      horariosAtencion: [],
      activo: true
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    let success = false;
    if (selectedSucursal) {
      success = await updateSucursal(selectedSucursal._id, formData);
    } else {
      success = await createSucursal(formData);
    }

    if (success) {
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      setSelectedSucursal(null);
    }
  };

  // Modal handlers
  const handleAdd = () => {
    resetForm();
    setSelectedSucursal(null);
    setShowAddModal(true);
  };

  const handleEdit = (sucursal) => {
    setSelectedSucursal(sucursal);
    setFormData({
      nombre: sucursal.nombre || '',
      direccion: {
        calle: sucursal.direccion?.calle || '',
        ciudad: sucursal.direccion?.ciudad || '',
        departamento: sucursal.direccion?.departamento || ''
      },
      telefono: sucursal.telefono || '',
      correo: sucursal.correo || '',
      horariosAtencion: sucursal.horariosAtencion || [],
      activo: sucursal.activo !== undefined ? sucursal.activo : true
    });
    setShowEditModal(true);
  };

  const handleDetail = (sucursal) => {
    setSelectedSucursal(sucursal);
    setShowDetailModal(true);
  };

  // Pagination
  const totalPages = Math.ceil(filteredSucursales.length / pageSize);
  const currentSucursales = filteredSucursales.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () => setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  const goToNextPage = () => setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  // Utility functions for display
  const getEstadoColor = (activo) => {
    return activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getEstadoText = (activo) => {
    return activo ? 'Activa' : 'Inactiva';
  };

  const formatDireccion = (direccion) => {
    if (!direccion) return 'No especificada';
    const { calle, ciudad, departamento } = direccion;
    return `${calle || ''}, ${ciudad || ''}, ${departamento || ''}`.replace(/(^,\s|,\s$)/g, '');
  };

  // Statistics
  const totalSucursales = sucursales.length;
  const sucursalesActivas = sucursales.filter(s => s.activo).length;

  // Form fields configuration
  const formFields = [
    {
      name: 'nombre',
      label: 'Nombre de la Sucursal',
      type: 'text',
      required: true,
      placeholder: 'Ej: Sucursal Centro'
    },
    {
      name: 'direccion.calle',
      label: 'Calle',
      type: 'text',
      required: true,
      nested: true,
      placeholder: 'Ej: Avenida Principal #123'
    },
    {
      name: 'direccion.ciudad',
      label: 'Ciudad',
      type: 'text',
      required: true,
      nested: true,
      placeholder: 'Ej: San Salvador'
    },
    {
      name: 'direccion.departamento',
      label: 'Departamento',
      type: 'text',
      required: true,
      nested: true,
      placeholder: 'Ej: San Salvador'
    },
    {
      name: 'telefono',
      label: 'Teléfono',
      type: 'text',
      required: true,
      placeholder: 'Ej: 2234-5678'
    },
    {
      name: 'correo',
      label: 'Correo Electrónico',
      type: 'email',
      required: true,
      placeholder: 'Ej: sucursal@optica.com'
    },
    {
      name: 'activo',
      label: 'Estado',
      type: 'boolean',
      required: true
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Alert */}
      {alert.message && (
        <div className="fixed top-4 right-4 z-50">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={clearAlert}
          />
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Sucursales</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalSucursales}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Sucursales Activas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{sucursalesActivas}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Sucursales Inactivas</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{totalSucursales - sucursalesActivas}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Resultados</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{filteredSucursales.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestión de Sucursales</h2>
            <button
              onClick={handleAdd}
              className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Sucursal</span>
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, dirección, teléfono o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedFilter('todas')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'todas' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setSelectedFilter('activa')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'activa' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Activas
              </button>
              <button
                onClick={() => setSelectedFilter('inactiva')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'inactiva' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Inactivas
              </button>
              <button
                onClick={() => setSelectedFilter('reciente')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'reciente' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Recientes
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                <th className="px-6 py-4 text-left font-semibold">Dirección</th>
                <th className="px-6 py-4 text-left font-semibold">Contacto</th>
                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                <th className="px-6 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentSucursales.map((sucursal) => (
                <tr key={sucursal._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{sucursal.nombre}</div>
                      <div className="text-sm text-gray-500">
                        Creada: {new Date(sucursal.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{formatDireccion(sucursal.direccion)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 space-y-1">
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{sucursal.telefono}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="truncate">{sucursal.correo}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(sucursal.activo)}`}>
                      {getEstadoText(sucursal.activo)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleDetail(sucursal)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(sucursal)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteSucursal(sucursal._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredSucursales.length === 0 && (
          <div className="p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron sucursales
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedFilter !== 'todas' 
                ? 'Intenta con otros términos de búsqueda o filtros' 
                : 'Comienza agregando tu primera sucursal'}
            </p>
          </div>
        )}

        {/* Controles de paginación */}
        {filteredSucursales.length > 0 && (
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Mostrar</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="border border-cyan-500 rounded py-1 px-2"
              >
                {[5, 10, 15, 20].map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-gray-700">por página</span>
            </div>
            <div className="flex items-center gap-2 m-[25px]">
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
              >
                {"<<"}
              </button>
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
              >
                {"<"}
              </button>
              <span className="text-gray-700 font-medium">
                Página {currentPage + 1} de {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
              >
                {">"}
              </button>
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors"
              >
                {">>"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para agregar sucursal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        title="Agregar Nueva Sucursal"
        formData={formData}
        handleInputChange={handleInputChange}
        errors={errors}
        fields={formFields}
        submitLabel="Crear Sucursal"
        gridCols={2}
      />

      {/* Modal para editar sucursal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
          setSelectedSucursal(null);
        }}
        onSubmit={handleSubmit}
        title="Editar Sucursal"
        formData={formData}
        handleInputChange={handleInputChange}
        errors={errors}
        fields={formFields}
        submitLabel="Actualizar Sucursal"
        gridCols={2}
      />

      {/* Modal de detalles */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedSucursal(null);
        }}
        title="Detalles de la Sucursal"
        item={selectedSucursal}
        data={selectedSucursal ? [
          { label: 'Nombre', value: selectedSucursal.nombre },
          { label: 'Dirección', value: formatDireccion(selectedSucursal.direccion) },
          { label: 'Teléfono', value: selectedSucursal.telefono },
          { label: 'Correo', value: selectedSucursal.correo },
          { 
            label: 'Estado', 
            value: getEstadoText(selectedSucursal.activo), 
            color: getEstadoColor(selectedSucursal.activo) 
          },
          { 
            label: 'Fecha de Creación', 
            value: new Date(selectedSucursal.createdAt).toLocaleString() 
          },
          { 
            label: 'Última Actualización', 
            value: new Date(selectedSucursal.updatedAt).toLocaleString() 
          }
        ] : []}
      />
    </div>
  );
};

export default SucursalesContent;