import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, UserCheck, Eye, FileText, Receipt, Search, Plus, Trash2, Edit, Clock
} from 'lucide-react';
import DetailModal from '../ui/DetailModal';

const API_URL = 'https://a-u-r-o-r-a.onrender.com/api';

const initialFormState = {
  clienteId: '',
  padecimientos: {
    tipo: '',
    descripcion: '',
    fechaDeteccion: ''
  },
  historialVisual: {
    fecha: '',
    diagnostico: '',
    receta: {
      ojoDerecho: { esfera: '', cilindro: '', eje: '', adicion: '' },
      ojoIzquierdo: { esfera: '', cilindro: '', eje: '', adicion: '' }
    }
  }
};

const HistorialMedicoContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [historiales, setHistoriales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [clienteDetalle, setClienteDetalle] = useState(null);
  const [recetasCliente, setRecetasCliente] = useState([]);
  const [historialesCliente, setHistorialesCliente] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [editHistorial, setEditHistorial] = useState(null);
  const [editReceta, setEditReceta] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch historiales y clientes reales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [historialesRes, clientesRes] = await Promise.all([
          axios.get(`${API_URL}/historialMedico`),
          axios.get(`${API_URL}/clientes`)
        ]);
        setHistoriales(historialesRes.data || []);
        setClientes(clientesRes.data || []);
      } catch (err) {
        setError('Error al cargar datos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handlers para formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('padecimientos.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        padecimientos: { ...prev.padecimientos, [key]: value }
      }));
    } else if (name.startsWith('historialVisual.receta.ojoDerecho.')) {
      const key = name.split('.')[3];
      setFormData(prev => ({
        ...prev,
        historialVisual: {
          ...prev.historialVisual,
          receta: {
            ...prev.historialVisual.receta,
            ojoDerecho: {
              ...prev.historialVisual.receta.ojoDerecho,
              [key]: value
            },
            ojoIzquierdo: { ...prev.historialVisual.receta.ojoIzquierdo }
          }
        }
      }));
    } else if (name.startsWith('historialVisual.receta.ojoIzquierdo.')) {
      const key = name.split('.')[3];
      setFormData(prev => ({
        ...prev,
        historialVisual: {
          ...prev.historialVisual,
          receta: {
            ...prev.historialVisual.receta,
            ojoDerecho: { ...prev.historialVisual.receta.ojoDerecho },
            ojoIzquierdo: {
              ...prev.historialVisual.receta.ojoIzquierdo,
              [key]: value
            }
          }
        }
      }));
    } else if (name.startsWith('historialVisual.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        historialVisual: { ...prev.historialVisual, [key]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddHistorial = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_URL}/historialMedico`, formData);
      setAlert({ type: 'success', message: 'Historial médico creado exitosamente.' });
      setShowAddModal(false);
      setFormData(initialFormState);
      // Refrescar lista
      const historialesRes = await axios.get(`${API_URL}/historialMedico`);
      setHistoriales(historialesRes.data || []);
    } catch (err) {
      setError('Error al crear historial médico.');
    } finally {
      setLoading(false);
    }
  };

  // Handler para mostrar modal de cliente
  const handleShowCliente = async (cliente) => {
    setClienteDetalle(cliente);
    // Buscar historiales de este cliente
    const historialesDeCliente = historiales.filter(h => h.clienteId && h.clienteId._id === cliente._id);
    setHistorialesCliente(historialesDeCliente);
    // Buscar recetas de todos los historiales de este cliente
    let recetas = [];
    for (const historial of historialesDeCliente) {
      try {
        const res = await axios.get(`${API_URL}/recetas/historial/${historial._id}`);
        if (Array.isArray(res.data)) {
          recetas = recetas.concat(res.data.map(r => ({...r, historialId: historial._id})));
        }
      } catch {}
    }
    setRecetasCliente(recetas);
    setShowClienteModal(true);
  };

  // Acciones rápidas
  const handleView = (data, tipo) => {
    setDetailData({ ...data, tipo });
    setShowDetailModal(true);
  };
  const handleEditHistorial = (historial) => {
    setShowClienteModal(false); // Cierra el modal de cliente
    setEditHistorial(historial);
    setShowAddModal(true);
    // Cargar datos al form
    setFormData({
      clienteId: historial.clienteId?._id || '',
      padecimientos: { ...historial.padecimientos },
      historialVisual: { ...historial.historialVisual }
    });
  };
  const handleEditReceta = (receta) => {
    setShowClienteModal(false); // Cierra el modal de cliente
    // Guardar el id de la receta a editar en localStorage
    window.localStorage.setItem('editRecetaId', receta._id);
    // Redirigir al apartado de recetas
    const dashboardRoot = document.querySelector('#root');
    // Si usas react-router, puedes usar navigate, pero aquí simulamos el cambio de sección:
    const evt = new CustomEvent('goToRecetasAndEdit');
    window.dispatchEvent(evt);
  };
  const handleDelete = (target, tipo) => {
    setDeleteTarget({ ...target, tipo });
    setShowDeleteConfirm(true);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.tipo === 'historial') {
        await axios.delete(`${API_URL}/historialMedico/${deleteTarget._id}`);
        setHistoriales(historiales.filter(h => h._id !== deleteTarget._id));
        setHistorialesCliente(historialesCliente.filter(h => h._id !== deleteTarget._id));
      } else if (deleteTarget.tipo === 'receta') {
        await axios.delete(`${API_URL}/recetas/${deleteTarget._id}`);
        setRecetasCliente(recetasCliente.filter(r => r._id !== deleteTarget._id));
      }
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (err) {
      alert('Error al eliminar.');
    }
  };

  // Filtros y paginación (simplificado)
  const filteredHistoriales = historiales.filter(historial => {
    const cliente = historial.clienteId;
    const matchesSearch = cliente && (`${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch || searchTerm === '';
  });

  // Render
  return (
    <div className="space-y-6 animate-fade-in">
      {alert && (
        <div className={`p-4 rounded-lg ${alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{alert.message}</div>
      )}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Historial Médico</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Historial</span>
            </button>
          </div>
        <div className="p-6 bg-gray-50 border-b flex gap-4">
              <input
                type="text"
            placeholder="Buscar por nombre de cliente..."
                value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Padecimiento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnóstico</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Detección</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistoriales.map(historial => (
                <tr key={historial._id}>
                  <td className="px-6 py-4">
                    {historial.clienteId ? (
                      <button
                        className="text-cyan-600 underline hover:text-cyan-800 font-semibold"
                        onClick={() => handleShowCliente(historial.clienteId)}
                      >
                        {historial.clienteId.nombre} {historial.clienteId.apellido}
                      </button>
                    ) : 'N/A'}
                  </td>
                  <td className="px-6 py-4">{historial.padecimientos?.tipo || '-'}</td>
                  <td className="px-6 py-4">{historial.historialVisual?.diagnostico || '-'}</td>
                  <td className="px-6 py-4">{historial.padecimientos?.fechaDeteccion ? new Date(historial.padecimientos.fechaDeteccion).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          </div>
      {/* Modal para añadir historial */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <form onSubmit={handleAddHistorial} className="bg-white rounded-xl shadow-2xl w-full max-w-lg md:max-w-2xl p-4 md:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Nuevo Historial Médico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cliente *</label>
            <select
                  name="clienteId"
                  value={formData.clienteId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Seleccione un cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente._id} value={cliente._id}>{cliente.nombre} {cliente.apellido}</option>
              ))}
            </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Padecimiento *</label>
                <input
                  type="text"
                  name="padecimientos.tipo"
                  value={formData.padecimientos.tipo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
          </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Descripción *</label>
                <input
                  type="text"
                  name="padecimientos.descripcion"
                  value={formData.padecimientos.descripcion}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
          </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Detección *</label>
                <input
                  type="date"
                  name="padecimientos.fechaDeteccion"
                  value={formData.padecimientos.fechaDeteccion}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
        </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Diagnóstico *</label>
                <input
                  type="date"
                  name="historialVisual.fecha"
                  value={formData.historialVisual.fecha}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
      </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Diagnóstico *</label>
                <input
                  type="text"
                  name="historialVisual.diagnostico"
                  value={formData.historialVisual.diagnostico}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
        </div>
              {/* Sección de graduación OD/OI en grid */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium mb-1">Graduación Ojo Derecho (OD)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" step="0.01" name="historialVisual.receta.ojoDerecho.esfera" placeholder="Esfera" value={formData.historialVisual.receta.ojoDerecho.esfera} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-lg" />
                      <input type="number" step="0.01" name="historialVisual.receta.ojoDerecho.cilindro" placeholder="Cilindro" value={formData.historialVisual.receta.ojoDerecho.cilindro} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-lg" />
                      <input type="number" step="1" name="historialVisual.receta.ojoDerecho.eje" placeholder="Eje" value={formData.historialVisual.receta.ojoDerecho.eje} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-lg" />
                      <input type="number" step="0.01" name="historialVisual.receta.ojoDerecho.adicion" placeholder="Adición" value={formData.historialVisual.receta.ojoDerecho.adicion} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Graduación Ojo Izquierdo (OI)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" step="0.01" name="historialVisual.receta.ojoIzquierdo.esfera" placeholder="Esfera" value={formData.historialVisual.receta.ojoIzquierdo.esfera} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-lg" />
                      <input type="number" step="0.01" name="historialVisual.receta.ojoIzquierdo.cilindro" placeholder="Cilindro" value={formData.historialVisual.receta.ojoIzquierdo.cilindro} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-lg" />
                      <input type="number" step="1" name="historialVisual.receta.ojoIzquierdo.eje" placeholder="Eje" value={formData.historialVisual.receta.ojoIzquierdo.eje} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-lg" />
                      <input type="number" step="0.01" name="historialVisual.receta.ojoIzquierdo.adicion" placeholder="Adición" value={formData.historialVisual.receta.ojoIzquierdo.adicion} onChange={handleInputChange} className="w-full px-2 py-1 border rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600">Guardar</button>
          </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </form>
        </div>
      )}
      {/* Modal para detalle de cliente */}
      {showClienteModal && clienteDetalle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{clienteDetalle.nombre} {clienteDetalle.apellido}</h3>
              <button onClick={() => setShowClienteModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold text-cyan-700 mb-2">Historiales Médicos</h4>
              <ul className="space-y-2">
                {historialesCliente.length === 0 && <li className="text-gray-500">Sin historiales médicos.</li>}
                {historialesCliente.map(h => (
                  <li key={h._id} className="border rounded-lg p-2 bg-gray-50 flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-700">Diagnóstico: <span className="font-semibold">{h.historialVisual?.diagnostico || '-'}</span></div>
                      <div className="text-xs text-gray-500">Fecha: {h.historialVisual?.fecha ? new Date(h.historialVisual.fecha).toLocaleDateString() : '-'}</div>
                    </div>
                    <div className="flex gap-2">
                      <button title="Ver" onClick={() => handleView(h, 'historial')} className="text-cyan-600 hover:text-cyan-800"><Eye size={18} /></button>
                      <button title="Editar" onClick={() => handleEditHistorial(h)} className="text-yellow-500 hover:text-yellow-700"><Edit size={18} /></button>
                      <button title="Eliminar" onClick={() => handleDelete(h, 'historial')} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-700 mb-2">Recetas</h4>
              <ul className="space-y-2">
                {recetasCliente.length === 0 && <li className="text-gray-500">Sin recetas asociadas.</li>}
                {recetasCliente.map(r => (
                  <li key={r._id} className="border rounded-lg p-2 bg-gray-50 flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-700">Diagnóstico: <span className="font-semibold">{r.diagnostico}</span></div>
                      <div className="text-xs text-gray-500">Fecha: {r.fecha ? new Date(r.fecha).toLocaleDateString() : '-'}</div>
                      <div className="text-xs text-gray-500">Vigencia: {r.vigencia} meses</div>
                    </div>
                    <div className="flex gap-2">
                      <button title="Ver" onClick={() => handleView(r, 'receta')} className="text-cyan-600 hover:text-cyan-800"><Eye size={18} /></button>
                      <button title="Editar" onClick={() => handleEditReceta(r)} className="text-yellow-500 hover:text-yellow-700"><Edit size={18} /></button>
                      <button title="Eliminar" onClick={() => handleDelete(r, 'receta')} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {/* Modal de detalle */}
      {showDetailModal && detailData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Detalle de {detailData.tipo === 'historial' ? 'Historial Médico' : 'Receta'}</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            {detailData.tipo === 'historial' ? (
              <div className="space-y-2">
                <div><span className="font-semibold">Cliente:</span> {detailData.clienteId ? `${detailData.clienteId.nombre} ${detailData.clienteId.apellido}` : '-'}</div>
                <div><span className="font-semibold">Tipo de Padecimiento:</span> {detailData.padecimientos?.tipo || '-'}</div>
                <div><span className="font-semibold">Descripción:</span> {detailData.padecimientos?.descripcion || '-'}</div>
                <div><span className="font-semibold">Fecha de Detección:</span> {detailData.padecimientos?.fechaDeteccion ? new Date(detailData.padecimientos.fechaDeteccion).toLocaleDateString() : '-'}</div>
                <div><span className="font-semibold">Fecha de Diagnóstico:</span> {detailData.historialVisual?.fecha ? new Date(detailData.historialVisual.fecha).toLocaleDateString() : '-'}</div>
                <div><span className="font-semibold">Diagnóstico:</span> {detailData.historialVisual?.diagnostico || '-'}</div>
                <div>
                  <span className="font-semibold">Receta:</span>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <div className="font-semibold text-cyan-700">Ojo Derecho (OD)</div>
                      <div className="text-xs">Esfera: {detailData.historialVisual?.receta?.ojoDerecho?.esfera ?? '-'}</div>
                      <div className="text-xs">Cilindro: {detailData.historialVisual?.receta?.ojoDerecho?.cilindro ?? '-'}</div>
                      <div className="text-xs">Eje: {detailData.historialVisual?.receta?.ojoDerecho?.eje ?? '-'}</div>
                      <div className="text-xs">Adición: {detailData.historialVisual?.receta?.ojoDerecho?.adicion ?? '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-cyan-700">Ojo Izquierdo (OI)</div>
                      <div className="text-xs">Esfera: {detailData.historialVisual?.receta?.ojoIzquierdo?.esfera ?? '-'}</div>
                      <div className="text-xs">Cilindro: {detailData.historialVisual?.receta?.ojoIzquierdo?.cilindro ?? '-'}</div>
                      <div className="text-xs">Eje: {detailData.historialVisual?.receta?.ojoIzquierdo?.eje ?? '-'}</div>
                      <div className="text-xs">Adición: {detailData.historialVisual?.receta?.ojoIzquierdo?.adicion ?? '-'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div><span className="font-semibold">Diagnóstico:</span> {detailData.diagnostico}</div>
                <div><span className="font-semibold">Fecha:</span> {detailData.fecha ? new Date(detailData.fecha).toLocaleDateString() : '-'}</div>
                <div><span className="font-semibold">Vigencia:</span> {detailData.vigencia} meses</div>
                <div><span className="font-semibold">Optometrista:</span> {detailData.optometristaId?.empleadoId ? `${detailData.optometristaId.empleadoId.nombre} ${detailData.optometristaId.empleadoId.apellido}` : '-'}</div>
                <div><span className="font-semibold">Observaciones:</span> {detailData.observaciones || '-'}</div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <div className="font-semibold text-cyan-700">Ojo Derecho (OD)</div>
                    <div className="text-xs">Esfera: {detailData.ojoDerecho?.esfera ?? '-'}</div>
                    <div className="text-xs">Cilindro: {detailData.ojoDerecho?.cilindro ?? '-'}</div>
                    <div className="text-xs">Eje: {detailData.ojoDerecho?.eje ?? '-'}</div>
                    <div className="text-xs">Adición: {detailData.ojoDerecho?.adicion ?? '-'}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-cyan-700">Ojo Izquierdo (OI)</div>
                    <div className="text-xs">Esfera: {detailData.ojoIzquierdo?.esfera ?? '-'}</div>
                    <div className="text-xs">Cilindro: {detailData.ojoIzquierdo?.cilindro ?? '-'}</div>
                    <div className="text-xs">Eje: {detailData.ojoIzquierdo?.eje ?? '-'}</div>
                    <div className="text-xs">Adición: {detailData.ojoIzquierdo?.adicion ?? '-'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Modal de confirmación de borrado */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4">¿Seguro que deseas eliminar este {deleteTarget.tipo === 'historial' ? 'historial médico' : 'receta'}?</h3>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancelar</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">Eliminar</button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default HistorialMedicoContent;