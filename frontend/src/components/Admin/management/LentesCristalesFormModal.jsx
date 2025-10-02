// src/components/Admin/management/LentesCristalesFormModal.jsx
import React, { useEffect, useMemo, useState } from 'react';

const MATERIALS = ['Vidrio', 'Policarbonato', 'Cr39'];
const VISION = ['Sencilla', 'Multifocal', 'Bifocal'];
const PROTECCIONES = ['Antirreflejante', 'Filtro azul', 'Fotocromático', 'Fotogray', 'Transition'];

export default function LentesCristalesFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  marcas = [],
  categorias = [],
}) {
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
  const maxImages = 5;

  // Previews for newly selected files
  const filePreviews = useMemo(() => {
    return (files || []).map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
  }, [files]);

  useEffect(() => {
    return () => {
      // Revoke object URLs on unmount
      try {
        filePreviews.forEach((p) => URL.revokeObjectURL(p.url));
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        ...initialData,
        categoriaId: initialData.categoriaId?._id || initialData.categoriaId || '',
        marcaId: initialData.marcaId?._id || initialData.marcaId || '',
        vision: initialData.vision || 'Sencilla',
        material: initialData.material || 'Vidrio',
        protecciones: initialData.protecciones || [],
        precioActual: initialData.enPromocion
          ? initialData.precioActual || initialData.precioBase
          : initialData.precioBase,
      }));
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
      return {
        ...prev,
        protecciones: exists
          ? prev.protecciones.filter((p) => p !== value)
          : [...prev.protecciones, value],
      };
    });
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ form, files });
  };

  const remainingSlots = Math.max(
    0,
    maxImages - ((form.imagenes?.length || 0) + (files?.length || 0)),
  );
  const canAddMore = remainingSlots > 0;

  const handleAddFiles = (incoming) => {
    const currentCount = (form.imagenes?.length || 0) + (files?.length || 0);
    const allowed = Math.max(0, maxImages - currentCount);
    if (allowed <= 0) return;
    const toAdd = Array.from(incoming).slice(0, allowed);
    setFiles((prev) => [...prev, ...toAdd]);
  };

  const handleRemoveExisting = (idx) => {
    setForm((prev) => ({
      ...prev,
      imagenes: (prev.imagenes || []).filter((_, i) => i !== idx),
    }));
  };

  const handleRemoveNewFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {initialData ? 'Editar Lente (Cristal)' : 'Nuevo Lente (Cristal)'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <form onSubmit={submit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 space-y-4 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Nombre</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Marca</label>
                <select
                  name="marcaId"
                  value={form.marcaId}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                  required
                >
                  <option value="">Seleccione...</option>
                  {marcas.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Categoría</label>
                <select
                  name="categoriaId"
                  value={form.categoriaId}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">(Opcional)</option>
                  {categorias.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Visión</label>
                <select
                  name="vision"
                  value={form.vision}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                >
                  {VISION.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Material</label>
                <select
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                >
                  {MATERIALS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Índice</label>
                <input
                  name="indice"
                  value={form.indice}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600">Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Precio Base</label>
                <input
                  type="number"
                  step="0.01"
                  name="precioBase"
                  value={form.precioBase}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">En Promoción</label>
                <input
                  type="checkbox"
                  name="enPromocion"
                  checked={form.enPromocion}
                  onChange={handleChange}
                  className="ml-2"
                />
              </div>
              {form.enPromocion && (
                <div>
                  <label className="block text-sm text-gray-600">Precio Actual</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precioActual"
                    value={form.precioActual}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600">Protecciones</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {PROTECCIONES.map((p) => (
                    <label
                      key={p}
                      className={`px-3 py-1 rounded-full border cursor-pointer ${
                        form.protecciones.includes(p)
                          ? 'bg-cyan-100 border-cyan-300'
                          : 'bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={form.protecciones.includes(p)}
                        onChange={() => handleProteccionesChange(p)}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600">Imágenes (máx 5)</label>
                <div className="mt-2 space-y-3">
                  {/* Upload controls */}
                  <div className="flex items-center gap-3">
                    <input
                      id="imagenesInput"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      disabled={!canAddMore}
                      onChange={(e) => handleAddFiles(e.target.files || [])}
                    />
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg border ${
                        canAddMore
                          ? 'bg-white hover:bg-gray-50 text-gray-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      onClick={() => {
                        if (canAddMore) document.getElementById('imagenesInput')?.click();
                      }}
                    >
                      Agregar imágenes ({remainingSlots} disponibles)
                    </button>
                    <div
                      className={`flex-1 border-2 border-dashed rounded-lg p-3 text-sm ${
                        canAddMore
                          ? 'border-gray-300 text-gray-500'
                          : 'border-gray-200 text-gray-400'
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!canAddMore) return;
                        handleAddFiles(e.dataTransfer.files || []);
                      }}
                    >
                      {canAddMore
                        ? 'Arrastra y suelta imágenes aquí o usa el botón Agregar'
                        : 'Has alcanzado el máximo de 5 imágenes'}
                    </div>
                  </div>

                  {/* Existing images */}
                  {Array.isArray(form.imagenes) && form.imagenes.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Imágenes actuales</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {form.imagenes.map((img, idx) => {
                          const src = (() => {
                            if (typeof img === 'string') {
                              const val = img.trim();
                              if (val.startsWith('http')) return val;
                              const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                              return cloud
                                ? `https://res.cloudinary.com/${cloud}/image/upload/${val}`
                                : '';
                            }
                            if (img && typeof img === 'object') {
                              return (
                                img.secure_url ||
                                img.url ||
                                (img.public_id
                                  ? (() => {
                                      const cloud =
                                        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                                      return cloud
                                        ? `https://res.cloudinary.com/${cloud}/image/upload/${img.public_id}`
                                        : '';
                                    })()
                                  : '')
                              );
                            }
                            return '';
                          })();
                          return (
                            <div key={`old-${idx}`} className="relative group">
                              {src ? (
                                <img
                                  src={src}
                                  alt={`imagen-${idx + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border"
                                />
                              ) : (
                                <div className="w-full h-24 rounded-lg border bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                                  Imagen inválida
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveExisting(idx)}
                                className="absolute top-1 right-1 bg-white/90 hover:bg-white text-red-600 border rounded px-2 py-0.5 text-xs shadow"
                                title="Eliminar"
                              >
                                Eliminar
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* New files */}
                  {Array.isArray(filePreviews) && filePreviews.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Nuevas imágenes</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {filePreviews.map((p, idx) => (
                          <div key={`new-${idx}`} className="relative group">
                            <img
                              src={p.url}
                              alt={p.name}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveNewFile(idx)}
                              className="absolute top-1 right-1 bg-white/90 hover:bg-white text-red-600 border rounded px-2 py-0.5 text-xs shadow"
                              title="Quitar"
                            >
                              Quitar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-600 text-white">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
