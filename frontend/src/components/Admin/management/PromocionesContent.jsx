import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../config/api';
import { Search, Plus, Trash2, Eye, Edit, Tag, Calendar, Percent, CheckCircle } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import Alert from '../ui/Alert';
import FormModal from '../ui/FormModal';
import DetailModal from '../ui/DetailModal';
import ConfirmationModal from '../ui/ConfirmationModal';

// Helpers
const withBase = (path, base = API_CONFIG.BASE_URL) => `${base}${path}`;

// Ensure cookies (HTTP-only JWT) are sent with requests
axios.defaults.withCredentials = true;

const PromocionesContent = () => {
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todas'); // todas | activa | expirada | programada

  // Data state
  const [promociones, setPromociones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [lentes, setLentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Form state
  const initialForm = {
    nombre: '',
    descripcion: '',
    tipoDescuento: 'porcentaje', // porcentaje | monto | 2x1
    valorDescuento: 0,
    aplicaA: 'todos', // todos | categoria | lente
    categoriasAplicables: [],
    lentesAplicables: [],
    fechaInicio: '',
    fechaFin: '',
    codigoPromo: '',
    activo: true,
  };
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4500);
  };

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [promosRes, catRes, lentesRes] = await Promise.all([
        axios.get(withBase(API_CONFIG.ENDPOINTS.PROMOCIONES)),
        axios.get(withBase(API_CONFIG.ENDPOINTS.CATEGORIAS)),
        axios.get(withBase(API_CONFIG.ENDPOINTS.LENTES)),
      ]);
      setPromociones(Array.isArray(promosRes.data) ? promosRes.data : []);
      setCategorias(Array.isArray(catRes.data) ? catRes.data : []);
      setLentes(Array.isArray(lentesRes.data) ? lentesRes.data : []);
    } catch (err) {
      showAlert('error', 'Error cargando datos de promociones: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filters helpers
  const getEstadoPromo = (promo) => {
    const now = new Date();
    const ini = promo.fechaInicio ? new Date(promo.fechaInicio) : null;
    const fin = promo.fechaFin ? new Date(promo.fechaFin) : null;
    if (promo.activo === false) return 'Inactiva';
    if (ini && now < ini) return 'Programada';
    if (fin && now > fin) return 'Expirada';
    return 'Activa';
  };

  const filteredPromociones = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = Array.isArray(promociones) ? promociones : [];
    if (term) {
      list = list.filter(p =>
        p.nombre?.toLowerCase().includes(term) ||
        p.descripcion?.toLowerCase().includes(term) ||
        p.codigoPromo?.toLowerCase().includes(term)
      );
    }
    if (selectedFilter !== 'todas') {
      list = list.filter(p => getEstadoPromo(p).toLowerCase() === selectedFilter);
    }
    return list;
  }, [promociones, searchTerm, selectedFilter]);

  const totalPages = Math.ceil((filteredPromociones.length || 0) / pageSize) || 1;
  const currentPromociones = filteredPromociones.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () => setCurrentPage(p => (p > 0 ? p - 1 : p));
  const goToNextPage = () => setCurrentPage(p => (p < totalPages - 1 ? p + 1 : p));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Activa': return 'bg-green-100 text-green-800';
      case 'Expirada': return 'bg-red-100 text-red-800';
      case 'Programada': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcono = (tipo) => {
    const t = (tipo || '').toString().toLowerCase();
    switch (t) {
      case 'porcentaje': return <Percent className="w-5 h-5 text-cyan-600" />;
      case 'monto': return <Tag className="w-5 h-5 text-purple-600" />;
      case '2x1': return <Tag className="w-5 h-5 text-orange-600" />;
      default: return null;
    }
  };

  const totalPromos = promociones.length;
  const promosActivas = promociones.filter(p => getEstadoPromo(p) === 'Activa').length;
  const promosProgramadas = promociones.filter(p => getEstadoPromo(p) === 'Programada').length;

  // Handlers
  const openAdd = () => { setSelectedPromo(null); setFormData(initialForm); setErrors({}); setShowAddEditModal(true); };
  const openEdit = (promo) => {
    setSelectedPromo(promo);
    setFormData({
      nombre: promo.nombre || '',
      descripcion: promo.descripcion || '',
      tipoDescuento: (promo.tipoDescuento || 'porcentaje').toString().toLowerCase(),
      valorDescuento: Number(promo.valorDescuento || 0),
      aplicaA: (promo.aplicaA || 'todos').toString().toLowerCase(),
      categoriasAplicables: Array.isArray(promo.categoriasAplicables) ? promo.categoriasAplicables.map(c => (c?._id || c)) : [],
      lentesAplicables: Array.isArray(promo.lentesAplicables) ? promo.lentesAplicables.map(l => (l?._id || l)) : [],
      fechaInicio: promo.fechaInicio ? new Date(promo.fechaInicio).toISOString().slice(0,10) : '',
      fechaFin: promo.fechaFin ? new Date(promo.fechaFin).toISOString().slice(0,10) : '',
      codigoPromo: promo.codigoPromo || '',
      activo: promo.activo !== false,
    });
    setErrors({});
    setShowAddEditModal(true);
  };
  const openView = (promo) => { setSelectedPromo(promo); setShowDetailModal(true); };
  const openDelete = (promo) => { setSelectedPromo(promo); setShowDeleteModal(true); };
  const closeModals = () => { setShowAddEditModal(false); setShowDetailModal(false); setShowDeleteModal(false); setSelectedPromo(null); setErrors({}); };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = (data) => {
    const errs = {};
    if (!data.nombre?.trim()) errs.nombre = 'El nombre es obligatorio';
    if (!data.descripcion?.trim()) errs.descripcion = 'La descripción es obligatoria';
    if (!data.tipoDescuento) errs.tipoDescuento = 'Tipo de descuento requerido';
    if (!data.valorDescuento || Number(data.valorDescuento) <= 0) errs.valorDescuento = 'Debe ser > 0';
    if (!data.aplicaA) errs.aplicaA = 'Campo requerido';
    if (!data.fechaInicio) errs.fechaInicio = 'Fecha inicio requerida';
    if (!data.fechaFin) errs.fechaFin = 'Fecha fin requerida';
    if (!data.codigoPromo?.trim()) errs.codigoPromo = 'Código requerido';
    if (data.tipoDescuento === 'porcentaje' && Number(data.valorDescuento) > 100) errs.valorDescuento = 'No puede ser > 100%';
    if (data.aplicaA === 'categoria' && (!data.categoriasAplicables || data.categoriasAplicables.length === 0)) errs.categoriasAplicables = 'Seleccione al menos una categoría';
    if (data.aplicaA === 'lente' && (!data.lentesAplicables || data.lentesAplicables.length === 0)) errs.lentesAplicables = 'Seleccione al menos un lente';
    // fechas
    if (data.fechaInicio && data.fechaFin) {
      const ini = new Date(data.fechaInicio);
      const fin = new Date(data.fechaFin);
      if (fin <= ini) errs.fechaFin = 'Debe ser posterior a inicio';
    }
    return errs;
  };

  const onSubmitForm = async () => {
    const data = { ...formData };
    const errs = validate(data);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Normalizar payload
    const payload = {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim(),
      tipoDescuento: data.tipoDescuento,
      valorDescuento: Number(data.valorDescuento),
      aplicaA: data.aplicaA,
      categoriasAplicables: data.aplicaA === 'categoria' ? data.categoriasAplicables : [],
      lentesAplicables: data.aplicaA === 'lente' ? data.lentesAplicables : [],
      fechaInicio: new Date(data.fechaInicio).toISOString(),
      fechaFin: new Date(data.fechaFin).toISOString(),
      codigoPromo: data.codigoPromo.trim(),
      activo: data.activo !== false,
    };

    try {
      if (selectedPromo?._id) {
        await axios.put(withBase(`${API_CONFIG.ENDPOINTS.PROMOCIONES}/${selectedPromo._id}`), payload);
        showAlert('success', 'Promoción actualizada exitosamente');
      } else {
        await axios.post(withBase(API_CONFIG.ENDPOINTS.PROMOCIONES), payload);
        showAlert('success', 'Promoción creada exitosamente');
      }
      closeModals();
      fetchData();
    } catch (err) {
      showAlert('error', 'Error guardando promoción: ' + (err.response?.data?.message || err.message));
    }
  };

  const onConfirmDelete = async () => {
    try {
      await axios.delete(withBase(`${API_CONFIG.ENDPOINTS.PROMOCIONES}/${selectedPromo._id}`));
      showAlert('success', 'Promoción eliminada');
      closeModals();
      fetchData();
    } catch (err) {
      showAlert('error', 'Error eliminando promoción: ' + (err.response?.data?.message || err.message));
    }
  };

  // Options for selects
  const categoriaOptions = categorias.map(c => ({ value: c._id, label: c.nombre }));
  const lentesOptions = lentes.map(l => ({ value: l._id, label: l.nombre }));

  // Detail fields
  const detailFields = selectedPromo ? [
    { label: 'ID', value: selectedPromo._id },
    { label: 'Nombre', value: selectedPromo.nombre },
    { label: 'Descripción', value: selectedPromo.descripcion },
    { label: 'Tipo Descuento', value: selectedPromo.tipoDescuento },
    { label: 'Valor', value: selectedPromo.tipoDescuento === 'porcentaje' ? `${selectedPromo.valorDescuento}%` : `$${selectedPromo.valorDescuento}` },
    { label: 'Aplica A', value: selectedPromo.aplicaA },
    { label: 'Categorías', value: Array.isArray(selectedPromo.categoriasAplicables) ? selectedPromo.categoriasAplicables.map(c => c?.nombre || c).join(', ') : '-' },
    { label: 'Lentes', value: Array.isArray(selectedPromo.lentesAplicables) ? selectedPromo.lentesAplicables.map(l => l?.nombre || l).join(', ') : '-' },
    { label: 'Inicio', value: selectedPromo.fechaInicio ? new Date(selectedPromo.fechaInicio).toLocaleDateString() : '-' },
    { label: 'Fin', value: selectedPromo.fechaFin ? new Date(selectedPromo.fechaFin).toLocaleDateString() : '-' },
    { label: 'Código', value: selectedPromo.codigoPromo },
    { label: 'Estado', value: getEstadoPromo(selectedPromo) },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Gestión de Promociones"
        subtitle="Crea, edita y administra las promociones de la óptica"
        icon={Tag}
        buttonText="Añadir Promoción"
        onButtonClick={openAdd}
      />

      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Promociones</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalPromos}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <Tag className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Promociones Activas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{promosActivas}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Promociones Programadas</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{promosProgramadas}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Listado de Promociones</h2>
            <button onClick={openAdd} className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nueva Promoción</span>
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
                placeholder="Buscar promoción..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {['todas', 'activa', 'expirada', 'programada'].map(filter => (
                <button
                  key={filter}
                  onClick={() => { setSelectedFilter(filter); setCurrentPage(0); }}
                  className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                    selectedFilter === filter 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                <th className="px-6 py-4 text-left font-semibold">Descripción</th>
                <th className="px-6 py-4 text-left font-semibold">Tipo</th>
                <th className="px-6 py-4 text-left font-semibold">Valor</th>
                <th className="px-6 py-4 text-left font-semibold">Vigencia</th>
                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                <th className="px-6 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td className="px-6 py-6" colSpan={7}>Cargando promociones...</td></tr>
              ) : currentPromociones.length > 0 ? (
                currentPromociones.map((promo) => {
                  const estado = getEstadoPromo(promo);
                  return (
                    <tr key={promo._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{promo.nombre}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-sm truncate">{promo.descripcion}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getTipoIcono(promo.tipoDescuento)}
                          <span className="text-gray-800 font-medium">{(promo.tipoDescuento || '').toString().toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-cyan-600">
                          {promo.tipoDescuento === 'porcentaje' ? `${promo.valorDescuento}%` : 
                           promo.tipoDescuento === 'monto' ? `$${promo.valorDescuento}` : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-800"><span className="font-semibold">Inicio:</span> {promo.fechaInicio ? new Date(promo.fechaInicio).toLocaleDateString() : '—'}</span>
                          <span className="text-sm text-gray-500"><span className="font-semibold">Fin:</span> {promo.fechaFin ? new Date(promo.fechaFin).toLocaleDateString() : '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(estado)}`}>{estado}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button onClick={() => openDelete(promo)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => openView(promo)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(promo)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron promociones</h3>
                    <p className="text-gray-500">{searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primera promoción'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="mt-4 flex flex-col items-center gap-4 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Mostrar</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
              className="border border-cyan-500 rounded py-1 px-2"
            >
              {[5,10,15,20].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-gray-700">por página</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToFirstPage} disabled={currentPage === 0} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors">{'<<'}</button>
            <button onClick={goToPreviousPage} disabled={currentPage === 0} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors">{'<'}</button>
            <span className="text-gray-700 font-medium">Página {currentPage + 1} de {totalPages}</span>
            <button onClick={goToNextPage} disabled={currentPage === totalPages - 1} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors">{'>'}</button>
            <button onClick={goToLastPage} disabled={currentPage === totalPages - 1} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors">{'>>'}</button>
          </div>
        </div>
      </div>

      {/* Modales */}
      <FormModal
        isOpen={showAddEditModal}
        onClose={closeModals}
        onSubmit={onSubmitForm}
        title={selectedPromo ? 'Editar Promoción' : 'Nueva Promoción'}
        formData={formData}
        handleInputChange={handleInputChange}
        errors={errors}
        submitLabel={selectedPromo ? 'Guardar cambios' : 'Crear promoción'}
        gridCols={2}
        fields={[
          { name: 'nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true, colSpan: 2 },
          { name: 'tipoDescuento', label: 'Tipo de Descuento', type: 'select', options: [
            { value: 'porcentaje', label: 'Porcentaje (%)' },
            { value: 'monto', label: 'Monto fijo ($)' },
            { value: '2x1', label: '2x1' },
          ], required: true },
          { name: 'valorDescuento', label: 'Valor Descuento', type: 'number', required: true },
          { name: 'aplicaA', label: 'Aplica A', type: 'select', options: [
            { value: 'todos', label: 'Todos los productos' },
            { value: 'categoria', label: 'Categorías específicas' },
            { value: 'lente', label: 'Lentes específicos' },
          ], required: true },
          { name: 'categoriasAplicables', label: 'Categorías', type: 'multi-select', options: categoriaOptions, hidden: formData.aplicaA !== 'categoria', colSpan: 2 },
          { name: 'lentesAplicables', label: 'Lentes', type: 'multi-select', options: lentesOptions, hidden: formData.aplicaA !== 'lente', colSpan: 2 },
          { name: 'fechaInicio', label: 'Fecha Inicio', type: 'date', required: true },
          { name: 'fechaFin', label: 'Fecha Fin', type: 'date', required: true },
          { name: 'codigoPromo', label: 'Código Promoción', type: 'text', required: true },
          { name: 'activo', label: 'Activo', type: 'boolean' },
        ]}
      />

      <DetailModal
        isOpen={showDetailModal}
        onClose={closeModals}
        title="Detalles de la Promoción"
        item={selectedPromo}
        data={detailFields}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeModals}
        onConfirm={onConfirmDelete}
        title="Confirmar Eliminación"
        message={`¿Eliminar la promoción "${selectedPromo?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default PromocionesContent;