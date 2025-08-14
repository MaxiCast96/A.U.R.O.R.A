// src/components/management/lentes/LentesFormModal.jsx
import React, { useState, useEffect } from 'react';
import FormModal from '../../ui/FormModal'; // Asegúrate que la ruta sea correcta
import { Plus, X, Image as ImageIcon, Package } from 'lucide-react';

const LentesFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  formData,
  handleInputChange,
  errors,
  submitLabel,
  categorias, // Se pasan como props desde LentesContent
  marcas,     // Se pasan como props desde LentesContent
  promociones, // Se pasan como props desde LentesContent
  sucursales, // Se pasan como props desde LentesContent
  setFormData, // Necesario para actualizar arrays anidados como 'imagenes' y 'sucursales'
}) => {
  const [newImageUrl, setNewImageUrl] = useState('');

  // Sincronizar el estado local de newImageUrl cuando el formulario se resetea o se abre con datos existentes
  useEffect(() => {
    if (!isOpen) { // Reset when modal closes
      setNewImageUrl('');
    }
  }, [isOpen]);

  // Manejar la adición de una nueva URL de imagen
  const handleAddImageUrl = () => {
    if (newImageUrl.trim() && !formData.imagenes.includes(newImageUrl.trim())) {
      handleInputChange({
        target: {
          name: 'imagenes',
          value: [...formData.imagenes, newImageUrl.trim()],
        },
      });
      setNewImageUrl('');
    }
  };

  // Manejar la eliminación de una URL de imagen
  const handleRemoveImageUrl = (urlToRemove) => {
    handleInputChange({
      target: {
        name: 'imagenes',
        value: formData.imagenes.filter((url) => url !== urlToRemove),
      },
    });
  };

  // Manejar el cambio de stock para una sucursal específica
  const handleStockChange = (sucursalId, value) => {
    const stockValue = Number(value);
    const updatedSucursales = formData.sucursales.map(s =>
      s.sucursalId === sucursalId ? { ...s, stock: stockValue } : s
    );

    // Si la sucursal no está en la lista de formData, añadirla (útil para lentes nuevos)
    if (!updatedSucursales.some(s => s.sucursalId === sucursalId)) {
        const sucursalName = sucursales.find(s => s._id === sucursalId)?.nombre;
        updatedSucursales.push({
            sucursalId,
            nombreSucursal: sucursalName,
            stock: stockValue
        });
    }

    handleInputChange({
      target: {
        name: 'sucursales',
        value: updatedSucursales,
      },
    });
  };

  const fields = [
    { name: 'nombre', label: 'Nombre del Lente', type: 'text', required: true, colSpan: 1 },
    { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true, colSpan: 2 },
    { name: 'categoriaId', label: 'Categoría', type: 'select', options: categorias.map(c => ({ value: c._id, label: c.nombre })), required: true, colSpan: 1 },
    { name: 'marcaId', label: 'Marca', type: 'select', options: marcas.map(m => ({ value: m._id, label: m.nombre })), required: true, colSpan: 1 },
    { name: 'material', label: 'Material', type: 'text', required: true, colSpan: 1 },
    { name: 'color', label: 'Color', type: 'text', required: true, colSpan: 1 },
    { name: 'tipoLente', label: 'Tipo de Lente', type: 'select', options: ['Monofocal', 'Bifocal', 'Progresivo', 'Ocupacional'], required: true, colSpan: 1 },
    { name: 'precioBase', label: 'Precio Base', type: 'number', required: true, colSpan: 1, step: '0.01' },
    { name: 'precioActual', label: 'Precio Actual', type: 'number', required: true, colSpan: 1, step: '0.01' },
    { name: 'linea', label: 'Línea', type: 'text', required: true, colSpan: 1 },

    // Medidas (campos anidados)
    { name: 'medidas.anchoPuente', label: 'Ancho Puente (mm)', type: 'text', required: false, colSpan: 1, nested: true, step: '0.01' },
    { name: 'medidas.altura', label: 'Altura (mm)', type: 'text', required: false, colSpan: 1, nested: true, step: '0.01' },
    { name: 'medidas.ancho', label: 'Ancho (mm)', type: 'text', required: false, colSpan: 1, nested: true, step: '0.01' },

    // Promoción
    { name: 'enPromocion', label: '¿En Promoción?', type: 'checkbox', required: false, colSpan: 2 },
    {
      name: 'promocionId',
      label: 'Seleccionar Promoción',
      type: 'select',
      options: promociones.map(p => ({ value: p._id, label: p.nombre })),
      required: formData.enPromocion,
      colSpan: 2,
      hidden: !formData.enPromocion, // Se oculta si no está en promoción
    },
    { name: 'fechaCreacion', label: 'Fecha de Creación', type: 'date', required: true, colSpan: 2 },
  ];

  // Secciones personalizadas para imágenes y stock de sucursales dentro del modal
  const customSections = (
    <>
      {/* Sección de Imágenes */}
      <div className="col-span-2 border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <ImageIcon className="w-5 h-5 mr-2 text-cyan-600" /> Imágenes del Lente
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Añadir URL de imagen..."
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // Evita el envío del formulario al presionar Enter
                handleAddImageUrl();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddImageUrl}
            className="p-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.imagenes.map((url, index) => (
            <div key={index} className="relative group">
              <img src={url} alt={`Imagen ${index + 1}`} className="w-20 h-20 object-cover rounded-md border border-gray-200" />
              <button
                type="button"
                onClick={() => handleRemoveImageUrl(url)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        {errors.imagenes && <p className="text-red-500 text-sm mt-1">{errors.imagenes}</p>}
      </div>

      {/* Sección de Sucursales y Stock */}
      <div className="col-span-2 border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <Package className="w-5 h-5 mr-2 text-cyan-600" /> Stock por Sucursal
        </h3>
        {sucursales.length > 0 ? (
          <div className="space-y-3">
            {sucursales.map((sucursal) => {
              // Encuentra el stock actual para esta sucursal o 0 si no existe
              const currentStockEntry = formData.sucursales.find(s => String(s.sucursalId) === String(sucursal._id));
              const currentStock = currentStockEntry ? currentStockEntry.stock : 0;
              return (
                <div key={sucursal._id} className="flex items-center gap-3">
                  <label className="block text-gray-700 font-medium w-40 truncate" title={sucursal.nombre}>{sucursal.nombre}:</label>
                  <input
                    type="number"
                    min="0"
                    className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={currentStock}
                    onChange={(e) => handleStockChange(sucursal._id, e.target.value)}
                  />
                  {errors[`sucursales[${sucursal._id}].stock`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`sucursales[${sucursal._id}].stock`]}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No hay sucursales disponibles para asignar stock.</p>
        )}
      </div>
    </>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      formData={formData}
      handleInputChange={handleInputChange}
      errors={errors}
      submitLabel={submitLabel}
      fields={fields}
      gridCols={2}
    >
      {customSections}
    </FormModal>
  );
};

export default LentesFormModal;