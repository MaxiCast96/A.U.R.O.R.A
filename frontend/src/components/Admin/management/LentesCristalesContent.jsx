// src/components/Admin/management/LentesCristalesContent.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../config/api';
import { Glasses, Plus, RefreshCcw, Edit, Trash2 } from 'lucide-react';
import LentesCristalesFormModal from './LentesCristalesFormModal';

const LentesCristalesContent = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const base = API_CONFIG.BASE_URL;
      const [res, marcasRes, catRes] = await Promise.all([
        axios.get(`${base}/lentes-cristales`),
        axios.get(`${base}/marcas`),
        axios.get(`${base}/categoria`),
      ]);
      const data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setItems(data);
      setMarcas(Array.isArray(marcasRes.data?.data) ? marcasRes.data.data : (marcasRes.data || []));
      setCategorias(Array.isArray(catRes.data?.data) ? catRes.data.data : (catRes.data || []));
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditingItem(null); setShowModal(true); };
  const openEdit = (it) => { setEditingItem(it); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingItem(null); };

  const submitForm = async ({ form, files }) => {
    try {
      setLoading(true);
      const base = API_CONFIG.BASE_URL;
      const fd = new FormData();
      // Solo enviar campos soportados por el backend actual
      fd.append('nombre', form.nombre || '');
      fd.append('descripcion', form.descripcion || '');
      if (form.categoriaId) fd.append('categoriaId', form.categoriaId);
      if (form.marcaId) fd.append('marcaId', form.marcaId);
      if (form.material) fd.append('material', form.material);
      if (form.indice) fd.append('indice', form.indice);
      // precios / promo
      if (form.precioBase !== undefined) fd.append('precioBase', String(form.precioBase));
      const enPromo = !!form.enPromocion;
      fd.append('enPromocion', String(enPromo));
      if (enPromo && form.precioActual !== undefined) fd.append('precioActual', String(form.precioActual));
      if (enPromo && form.promocionId) fd.append('promocionId', form.promocionId);
      // imágenes
      (files || []).slice(0, 5).forEach(f => fd.append('imagenes', f));

      if (editingItem && editingItem._id) {
        await axios.put(`${base}/lentes-cristales/${editingItem._id}`, fd);
      } else {
        await axios.post(`${base}/lentes-cristales`, fd);
      }
      await fetchData();
      closeModal();
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!confirm('¿Eliminar este lente (cristal) permanentemente?')) return;
    try {
      setLoading(true);
      const base = API_CONFIG.BASE_URL;
      await axios.delete(`${base}/lentes-cristales/${id}`);
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-700">Lentes (Cristales)</h2>
          <p className="text-gray-500">Gestión básica de catálogo de cristales</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
            <RefreshCcw size={16}/> Refrescar
          </button>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white">
            <Plus size={16}/> Agregar
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow p-6 text-gray-500">Cargando...</div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4">{error}</div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material / Índice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((it) => (
                <tr key={it._id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border">
                        <Glasses className="w-6 h-6 text-gray-400"/>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{it.nombre}</div>
                        <div className="text-sm text-gray-500">{it.descripcion}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{it.marcaId?.nombre || '—'}</td>
                  <td className="px-6 py-4">{it.material} / {it.indice}</td>
                  <td className="px-6 py-4">${(it.enPromocion ? it.precioActual : it.precioBase)?.toFixed?.(2) || '0.00'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => openEdit(it)} className="p-2 rounded-lg border hover:bg-gray-50" title="Editar">
                        <Edit className="w-4 h-4"/>
                      </button>
                      <button onClick={() => handleDelete(it._id)} className="p-2 rounded-lg border hover:bg-red-50 text-red-600" title="Eliminar">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>Sin datos</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <LentesCristalesFormModal
        open={showModal}
        onClose={closeModal}
        onSubmit={submitForm}
        initialData={editingItem}
        marcas={marcas}
        categorias={categorias}
      />
    </div>
  );
};

export default LentesCristalesContent;
