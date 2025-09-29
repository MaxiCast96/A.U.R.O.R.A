// src/components/Admin/management/LentesCristalesFormModal.jsx
import React, { useEffect, useState } from 'react';

const MATERIALS = ['Vidrio', 'Policarbonato', 'Cr39'];
const VISION = ['Sencilla', 'Multifocal', 'Bifocal'];
const PROTECCIONES = ['Antirreflejante', 'Filtro azul', 'Fotocromático', 'Fotogray', 'Transition'];

export default function LentesCristalesFormModal({ open, onClose, onSubmit, initialData, marcas = [], categorias = [] }) {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    categoriaId: '',
    marcaId: '',
    vision: 'Sencilla',
    material: 'Vidrio',
    protecciones: [],
    indice: '1.50',
    precioBase: '',
    precioActual: '',
    enPromocion: false,
    promocionId: '',
    imagenes: [],
  });
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...form,
        ...initialData,
        vision: initialData.vision || 'Sencilla',
        material: initialData.material || 'Vidrio',
        protecciones: initialData.protecciones || [],
        precioActual: initialData.enPromocion ? (initialData.precioActual || initialData.precioBase) : initialData.precioBase,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProteccionesChange = (value) => {
    setForm((prev) => {
      const exists = prev.protecciones.includes(value);
      return { ...prev, protecciones: exists ? prev.protecciones.filter(p => p !== value) : [...prev.protecciones, value] };
    });
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ form, files });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">{initialData ? 'Editar Lente (Cristal)' : 'Nuevo Lente (Cristal)'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">Nombre</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full border rounded-lg p-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Marca</label>
              <select name="marcaId" value={form.marcaId} onChange={handleChange} className="w-full border rounded-lg p-2" required>
                <option value="">Seleccione...</option>
                {marcas.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Categoría</label>
              <select name="categoriaId" value={form.categoriaId} onChange={handleChange} className="w-full border rounded-lg p-2">
                <option value="">(Opcional)</option>
                {categorias.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Visión</label>
              <select name="vision" value={form.vision} onChange={handleChange} className="w-full border rounded-lg p-2">
                {VISION.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Material</label>
              <select name="material" value={form.material} onChange={handleChange} className="w-full border rounded-lg p-2">
                {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Índice</label>
              <input name="indice" value={form.indice} onChange={handleChange} className="w-full border rounded-lg p-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600">Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Precio Base</label>
              <input type="number" step="0.01" name="precioBase" value={form.precioBase} onChange={handleChange} className="w-full border rounded-lg p-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600">En Promoción</label>
              <input type="checkbox" name="enPromocion" checked={form.enPromocion} onChange={handleChange} className="ml-2" />
            </div>
            {form.enPromocion && (
              <div>
                <label className="block text-sm text-gray-600">Precio Actual</label>
                <input type="number" step="0.01" name="precioActual" value={form.precioActual} onChange={handleChange} className="w-full border rounded-lg p-2" />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600">Protecciones</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {PROTECCIONES.map(p => (
                  <label key={p} className={`px-3 py-1 rounded-full border cursor-pointer ${form.protecciones.includes(p) ? 'bg-cyan-100 border-cyan-300' : 'bg-white'}`}>
                    <input type="checkbox" className="hidden" checked={form.protecciones.includes(p)} onChange={() => handleProteccionesChange(p)} />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600">Imágenes (máx 5)</label>
              <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-600 text-white">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
