// src/components/management/lentes/LentesFormModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FormModal from '../../ui/FormModal';
import { Plus, X, Image as ImageIcon, Package, Save, Trash2 } from 'lucide-react';

const API_URL = 'https://a-u-r-o-r-a.onrender.com/api'; // Ajusta según tu API

const LentesFormModal = ({
  isOpen,
  onClose,
  title,
  submitLabel = 'Guardar',
  lenteId, // Para edición
  categorias,
  marcas,
  promociones,
  sucursales,
  refreshLentes, // Función para actualizar la lista después de operaciones
}) => {
  // Estado inicial del formulario
  const initialFormState = {
    nombre: '',
    descripcion: '',
    categoriaId: '',
    marcaId: '',
    material: '',
    color: '',
    tipoLente: 'Monofocal',
    precioBase: 0,
    precioActual: 0,
    linea: '',
    medidas: {
      anchoPuente: '',
      altura: '',
      ancho: '',
    },
    enPromocion: false,
    promocionId: '',
    imagenes: [],
    sucursales: [],
    fechaCreacion: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [alert, setAlert] = useState(null);

  // Cargar datos del lente si estamos editando
  useEffect(() => {
    if (isOpen && lenteId) {
      const fetchLente = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${API_URL}/lentes/${lenteId}`);
          setFormData(response.data);
        } catch (err) {
          setAlert({ type: 'error', message: 'Error al cargar el lente' });
        } finally {
          setLoading(false);
        }
      };
      fetchLente();
    } else if (isOpen && !lenteId) {
      // Resetear formulario para nuevo lente
      setFormData(initialFormState);
    }
  }, [isOpen, lenteId]);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('medidas.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        medidas: {
          ...prev.medidas,
          [field]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                type === 'number' ? parseFloat(value) || 0 : 
                value
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      // Validación básica
      const newErrors = {};
      if (!formData.nombre) newErrors.nombre = 'Nombre es requerido';
      if (!formData.categoriaId) newErrors.categoriaId = 'Categoría es requerida';
      if (!formData.marcaId) newErrors.marcaId = 'Marca es requerida';
      if (formData.precioBase <= 0) newErrors.precioBase = 'Precio debe ser mayor a 0';
      if (formData.enPromocion && !formData.promocionId) newErrors.promocionId = 'Selecciona una promoción';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      if (lenteId) {
        // Actualizar lente existente
        await axios.put(`${API_URL}/lentes/${lenteId}`, formData);
        setAlert({ type: 'success', message: 'Lente actualizado exitosamente' });
      } else {
        // Crear nuevo lente
        await axios.post(`${API_URL}/lentes`, formData);
        setAlert({ type: 'success', message: 'Lente creado exitosamente' });
      }

      // Cerrar modal después de 1.5 segundos y refrescar lista
      setTimeout(() => {
        onClose();
        if (refreshLentes) refreshLentes();
      }, 1500);
    } catch (err) {
      console.error('Error al guardar lente:', err);
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al guardar lente' });
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación del lente
  const handleDelete = async () => {
    if (!lenteId) return;
    
    if (!window.confirm('¿Estás seguro de eliminar este lente?')) return;
    
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/lentes/${lenteId}`);
      setAlert({ type: 'success', message: 'Lente eliminado exitosamente' });
      setTimeout(() => {
        onClose();
        if (refreshLentes) refreshLentes();
      }, 1500);
    } catch (err) {
      console.error('Error al eliminar lente:', err);
      setAlert({ type: 'error', message: err.response?.data?.message || 'Error al eliminar lente' });
    } finally {
      setLoading(false);
    }
  };

  // Manejar la adición de una nueva URL de imagen
  const handleAddImageUrl = () => {
    if (newImageUrl.trim() && !formData.imagenes.includes(newImageUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        imagenes: [...prev.imagenes, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  // Manejar la eliminación de una URL de imagen
  const handleRemoveImageUrl = (urlToRemove) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter(url => url !== urlToRemove)
    }));
  };

  // Manejar el cambio de stock para una sucursal específica
  const handleStockChange = (sucursalId, value) => {
    const stockValue = Number(value) || 0;
    const updatedSucursales = [...formData.sucursales];
    const existingIndex = updatedSucursales.findIndex(s => String(s.sucursalId) === String(sucursalId));

    if (existingIndex >= 0) {
      updatedSucursales[existingIndex].stock = stockValue;
    } else {
      const sucursal = sucursales.find(s => String(s._id) === String(sucursalId));
      if (sucursal) {
        updatedSucursales.push({
          sucursalId: sucursal._id,
          nombreSucursal: sucursal.nombre,
          stock: stockValue
        });
      }
    }

    setFormData(prev => ({
      ...prev,
      sucursales: updatedSucursales
    }));
  };

  // Campos del formulario
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
    { name: 'medidas.anchoPuente', label: 'Ancho Puente (mm)', type: 'number', required: false, colSpan: 1, nested: true, step: '0.01' },
    { name: 'medidas.altura', label: 'Altura (mm)', type: 'number', required: false, colSpan: 1, nested: true, step: '0.01' },
    { name: 'medidas.ancho', label: 'Ancho (mm)', type: 'number', required: false, colSpan: 1, nested: true, step: '0.01' },
    { name: 'enPromocion', label: '¿En Promoción?', type: 'checkbox', required: false, colSpan: 2 },
    {
      name: 'promocionId',
      label: 'Seleccionar Promoción',
      type: 'select',
      options: promociones.map(p => ({ value: p._id, label: p.nombre })),
      required: formData.enPromocion,
      colSpan: 2,
      hidden: !formData.enPromocion,
    },
    { name: 'fechaCreacion', label: 'Fecha de Creación', type: 'date', required: true, colSpan: 2 },
  ];

  // Secciones personalizadas para imágenes y stock de sucursales
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
            onKeyPress={(e) => e.key === 'Enter' && handleAddImageUrl()}
          />
          <button
            type="button"
            onClick={handleAddImageUrl}
            className="p-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors flex items-center"
            disabled={!newImageUrl.trim()}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.imagenes.map((url, index) => (
            <div key={index} className="relative group">
              <img 
                src={url} 
                alt={`Imagen ${index + 1}`} 
                className="w-20 h-20 object-cover rounded-md border border-gray-200"
                onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=Imagen+no+disponible'}
              />
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
              const stockEntry = formData.sucursales.find(s => String(s.sucursalId) === String(sucursal._id));
              const currentStock = stockEntry ? stockEntry.stock : 0;
              
              return (
                <div key={sucursal._id} className="flex items-center gap-3">
                  <label className="block text-gray-700 font-medium w-40 truncate" title={sucursal.nombre}>
                    {sucursal.nombre}:
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={currentStock}
                    onChange={(e) => handleStockChange(sucursal._id, e.target.value)}
                  />
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
      onSubmit={handleSubmit}
      title={title}
      formData={formData}
      handleInputChange={handleInputChange}
      errors={errors}
      submitLabel={submitLabel}
      fields={fields}
      gridCols={2}
      loading={loading}
    >
      {alert && (
        <div className={`col-span-2 p-3 rounded-md mb-4 ${
          alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {alert.message}
        </div>
      )}
      
      {customSections}
      
      {lenteId && (
        <div className="col-span-2 flex justify-end mt-4">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            disabled={loading}
          >
            <Trash2 className="w-5 h-5" />
            Eliminar Lente
          </button>
        </div>
      )}
    </FormModal>
  );
};

export default LentesFormModal;