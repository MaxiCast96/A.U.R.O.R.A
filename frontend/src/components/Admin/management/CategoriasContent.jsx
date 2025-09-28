import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Alert from '../ui/Alert';
import ConfirmationModal from '../ui/ConfirmationModal';
import { 
  Search, Plus, Trash2, Eye, Edit, Tags, Package, UserCheck, Glasses, ShoppingBag, Save, AlertTriangle, CheckCircle,
  Heart, Star, Home, User, Settings, Bell, Calendar, Clock, Mail, Phone, Camera, Image, Music,
  Video, Download, Upload, Folder, File, Archive, Bookmark, Flag, Shield, Lock, Key, Zap,
  Wifi, Battery, Bluetooth, Headphones, Mic, Speaker, Monitor, Smartphone, Tablet, Laptop,
  Car, Plane, Train, Bus, Bike, MapPin, Navigation, Compass, Globe, Sun, Moon, Cloud,
  Umbrella, Snowflake, Thermometer, Wind, Coffee, Pizza, Gift, Gamepad2, Trophy, Award,
  Target, Briefcase, Building, Store, Factory, Hospital, School, Book, GraduationCap, Lightbulb,
  Palette, Brush, Scissors, Wrench, Hammer, PaintBucket, Ruler, Calculator,
  CreditCard, DollarSign, TrendingUp, TrendingDown, BarChart, PieChart, Activity,
  Droplet, Leaf, Flower, Bug, Fish, Dog, Cat, Bird, Rabbit,
  Filter, X, ChevronDown, SortAsc, SortDesc
} from 'lucide-react';
import { API_CONFIG, buildApiUrl } from '../../../config/api';

// Lista de iconos disponibles con sus nombres
const availableIcons = [
  { name: 'Tags', component: Tags, category: 'General' },
  { name: 'Glasses', component: Glasses, category: 'Óptica' },
  { name: 'Eye', component: Eye, category: 'Óptica' },
  { name: 'Package', component: Package, category: 'General' },
  { name: 'ShoppingBag', component: ShoppingBag, category: 'Comercio' },
  { name: 'Heart', component: Heart, category: 'General' },
  { name: 'Star', component: Star, category: 'General' },
  { name: 'Home', component: Home, category: 'General' },
  { name: 'User', component: User, category: 'Personas' },
  { name: 'Settings', component: Settings, category: 'Sistema' },
  { name: 'Bell', component: Bell, category: 'Sistema' },
  { name: 'Calendar', component: Calendar, category: 'Tiempo' },
  { name: 'Clock', component: Clock, category: 'Tiempo' },
  { name: 'Mail', component: Mail, category: 'Comunicación' },
  { name: 'Phone', component: Phone, category: 'Comunicación' },
  { name: 'Camera', component: Camera, category: 'Multimedia' },
  { name: 'Image', component: Image, category: 'Multimedia' },
  { name: 'Music', component: Music, category: 'Multimedia' },
  { name: 'Video', component: Video, category: 'Multimedia' },
  { name: 'Download', component: Download, category: 'Acciones' },
  { name: 'Upload', component: Upload, category: 'Acciones' },
  { name: 'Folder', component: Folder, category: 'Archivos' },
  { name: 'File', component: File, category: 'Archivos' },
  { name: 'Archive', component: Archive, category: 'Archivos' },
  { name: 'Bookmark', component: Bookmark, category: 'General' },
  { name: 'Flag', component: Flag, category: 'General' },
  { name: 'Shield', component: Shield, category: 'Seguridad' },
  { name: 'Lock', component: Lock, category: 'Seguridad' },
  { name: 'Key', component: Key, category: 'Seguridad' },
  { name: 'Zap', component: Zap, category: 'General' },
  { name: 'Wifi', component: Wifi, category: 'Tecnología' },
  { name: 'Battery', component: Battery, category: 'Tecnología' },
  { name: 'Bluetooth', component: Bluetooth, category: 'Tecnología' },
  { name: 'Headphones', component: Headphones, category: 'Multimedia' },
  { name: 'Mic', component: Mic, category: 'Multimedia' },
  { name: 'Speaker', component: Speaker, category: 'Multimedia' },
  { name: 'Monitor', component: Monitor, category: 'Tecnología' },
  { name: 'Smartphone', component: Smartphone, category: 'Tecnología' },
  { name: 'Tablet', component: Tablet, category: 'Tecnología' },
  { name: 'Laptop', component: Laptop, category: 'Tecnología' },
  { name: 'Car', component: Car, category: 'Transporte' },
  { name: 'Plane', component: Plane, category: 'Transporte' },
  { name: 'Train', component: Train, category: 'Transporte' },
  { name: 'Bus', component: Bus, category: 'Transporte' },
  { name: 'Bike', component: Bike, category: 'Transporte' },
  { name: 'MapPin', component: MapPin, category: 'Ubicación' },
  { name: 'Navigation', component: Navigation, category: 'Ubicación' },
  { name: 'Compass', component: Compass, category: 'Ubicación' },
  { name: 'Globe', component: Globe, category: 'Ubicación' },
  { name: 'Sun', component: Sun, category: 'Clima' },
  { name: 'Moon', component: Moon, category: 'Clima' },
  { name: 'Cloud', component: Cloud, category: 'Clima' },
  { name: 'Umbrella', component: Umbrella, category: 'Clima' },
  { name: 'Snowflake', component: Snowflake, category: 'Clima' },
  { name: 'Thermometer', component: Thermometer, category: 'Clima' },
  { name: 'Wind', component: Wind, category: 'Clima' },
  { name: 'Coffee', component: Coffee, category: 'Comida' },
  { name: 'Pizza', component: Pizza, category: 'Comida' },
  { name: 'Gift', component: Gift, category: 'General' },
  { name: 'Gamepad2', component: Gamepad2, category: 'Entretenimiento' },
  { name: 'Trophy', component: Trophy, category: 'Entretenimiento' },
  { name: 'Award', component: Award, category: 'Entretenimiento' },
  { name: 'Target', component: Target, category: 'General' },
  { name: 'Briefcase', component: Briefcase, category: 'Trabajo' },
  { name: 'Building', component: Building, category: 'Lugares' },
  { name: 'Store', component: Store, category: 'Comercio' },
  { name: 'Factory', component: Factory, category: 'Lugares' },
  { name: 'Hospital', component: Hospital, category: 'Lugares' },
  { name: 'School', component: School, category: 'Educación' },
  { name: 'Book', component: Book, category: 'Educación' },
  { name: 'GraduationCap', component: GraduationCap, category: 'Educación' },
  { name: 'Lightbulb', component: Lightbulb, category: 'General' },
  { name: 'Palette', component: Palette, category: 'Arte' },
  { name: 'Brush', component: Brush, category: 'Arte' },
  { name: 'Scissors', component: Scissors, category: 'Herramientas' },
  { name: 'Wrench', component: Wrench, category: 'Herramientas' },
  { name: 'Hammer', component: Hammer, category: 'Herramientas' },
  { name: 'PaintBucket', component: PaintBucket, category: 'Arte' },
  { name: 'Ruler', component: Ruler, category: 'Herramientas' },
  { name: 'Calculator', component: Calculator, category: 'Trabajo' },
  { name: 'CreditCard', component: CreditCard, category: 'Finanzas' },
  { name: 'DollarSign', component: DollarSign, category: 'Finanzas' },
  { name: 'TrendingUp', component: TrendingUp, category: 'Finanzas' },
  { name: 'TrendingDown', component: TrendingDown, category: 'Finanzas' },
  { name: 'BarChart', component: BarChart, category: 'Finanzas' },
  { name: 'PieChart', component: PieChart, category: 'Finanzas' },
  { name: 'Activity', component: Activity, category: 'Salud' },
  { name: 'Droplet', component: Droplet, category: 'Naturaleza' },
  { name: 'Leaf', component: Leaf, category: 'Naturaleza' },
  { name: 'Flower', component: Flower, category: 'Naturaleza' },
  { name: 'Bug', component: Bug, category: 'Naturaleza' },
  { name: 'Fish', component: Fish, category: 'Animales' },
  { name: 'Dog', component: Dog, category: 'Animales' },
  { name: 'Cat', component: Cat, category: 'Animales' },
  { name: 'Bird', component: Bird, category: 'Animales' },
  { name: 'Rabbit', component: Rabbit, category: 'Animales' }
];

// Estados iniciales de filtros
const INITIAL_FILTERS = {
  iconCategory: 'todos',
  fechaDesde: '',
  fechaHasta: ''
};

// Opciones de ordenamiento
const SORT_OPTIONS = [
  { value: 'fechaRegistro-desc', label: 'Más Recientes Primero', icon: Calendar },
  { value: 'fechaRegistro-asc', label: 'Más Antiguos Primero', icon: Calendar },
  { value: 'nombre-asc', label: 'Nombre A-Z', icon: User },
  { value: 'nombre-desc', label: 'Nombre Z-A', icon: User },
];

// Helper global para obtener el componente de icono por nombre
const getIconComponent = (iconName) => {
  if (!iconName) return <Tags className="w-6 h-6" />;
  const iconData = availableIcons.find(icon => icon.name === iconName);
  if (iconData) {
    const IconComponent = iconData.component;
    return <IconComponent className="w-6 h-6" />;
  }
  return <Tags className="w-6 h-6" />;
};

// Componente Skeleton Loader
const SkeletonLoader = React.memo(() => (
  <div className="animate-pulse">
    {/* Skeleton para las estadísticas */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Skeleton para la tabla */}
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-cyan-500 to-cyan-600">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-cyan-400 rounded w-48"></div>
          <div className="h-10 bg-cyan-400 rounded w-32"></div>
        </div>
      </div>

      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="h-10 bg-gray-200 rounded-lg w-full max-w-md"></div>
          <div className="flex space-x-3">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: 5 }, (_, index) => (
                <th key={index} className="px-6 py-4">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 5 }, (_, rowIndex) => (
              <tr key={rowIndex}>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-1">
                    {Array.from({ length: 3 }, (_, btnIndex) => (
                      <div key={btnIndex} className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
));

// Componente para el selector de iconos
const IconSelector = ({ selectedIcon, onIconSelect, onClose }) => {
  const [searchIcon, setSearchIcon] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', ...new Set(availableIcons.map(icon => icon.category))];

  const filteredIcons = availableIcons.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(searchIcon.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="bg-cyan-500 text-white p-4 rounded-t-xl flex justify-between items-center">
          <h3 className="text-lg font-bold">Seleccionar Icono</h3>
          <button onClick={onClose} className="text-white hover:bg-cyan-600 rounded-lg p-2 transition-colors">
            ×
          </button>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar icono..."
                value={searchIcon}
                onChange={(e) => setSearchIcon(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {filteredIcons.map((iconData) => {
              const IconComponent = iconData.component;
              const isSelected = selectedIcon === iconData.name;
              
              return (
                <button
                  key={iconData.name}
                  onClick={() => onIconSelect(iconData.name)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center min-h-[60px] ${
                    isSelected 
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-600' 
                      : 'border-gray-200 hover:border-cyan-300 hover:bg-gray-50'
                  }`}
                  title={iconData.name}
                >
                  <IconComponent className="w-6 h-6 mb-1" />
                  <span className="text-xs text-center leading-tight">{iconData.name}</span>
                </button>
              );
            })}
          </div>
          
          {filteredIcons.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Tags className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No se encontraron iconos</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => {
              onClose();
            }}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Seleccionar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente FormModal
const FormModal = ({ isOpen, onClose, onSubmit, title, formData, handleInputChange, errors, submitLabel = 'Guardar', isEditing = false }) => {
  const [showIconSelector, setShowIconSelector] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  const handleIconSelect = (iconName) => {
    handleInputChange({
      target: {
        name: 'icono',
        value: iconName
      }
    });
    setShowIconSelector(false);
  };

  const getSelectedIconComponent = () => {
    if (!formData.icono) return <Tags className="w-6 h-6" />;
    
    const iconData = availableIcons.find(icon => icon.name === formData.icono);
    if (iconData) {
      const IconComponent = iconData.component;
      return <IconComponent className="w-6 h-6" />;
    }
    return <Tags className="w-6 h-6" />;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideInScale">
          <div className="bg-cyan-500 text-white p-6 rounded-t-xl sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">{title}</h3>
              <button 
                type="button" 
                onClick={onClose} 
                className="text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg p-2 transition-all duration-200 hover:scale-110"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                name="nombre"
                value={formData.nombre || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300 hover:border-cyan-300'
                }`}
                placeholder="Ingrese el nombre de la categoría"
              />
              {errors.nombre && (
                <div className="mt-1 text-red-500 text-sm flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errors.nombre}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <textarea
                name="descripcion"
                value={formData.descripcion || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-none ${
                  errors.descripcion ? 'border-red-500' : 'border-gray-300 hover:border-cyan-300'
                }`}
                rows="3"
                placeholder="Ingrese la descripción de la categoría"
              />
              {errors.descripcion && (
                <div className="mt-1 text-red-500 text-sm flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errors.descripcion}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => setShowIconSelector(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:border-cyan-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center space-x-2">
                      {getSelectedIconComponent()}
                      <span className="text-gray-700">
                        {formData.icono ? `${formData.icono}` : 'Seleccionar icono'}
                      </span>
                    </div>
                    <Search className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                {formData.icono && (
                  <button
                    type="button"
                    onClick={() => handleInputChange({ target: { name: 'icono', value: '' } })}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Limpiar icono"
                  >
                    ×
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Haz clic para seleccionar un icono de la librería
              </p>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end space-x-3 sticky bottom-0 z-10">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200 hover:scale-105"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              onClick={handleSubmit}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all duration-200 hover:scale-105 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitLabel}</span>
            </button>
          </div>
        </div>
      </div>

      {showIconSelector && (
        <IconSelector
          selectedIcon={formData.icono}
          onIconSelect={handleIconSelect}
          onClose={() => setShowIconSelector(false)}
        />
      )}
    </>
  );
};

// Componente DetailModal
const DetailModal = ({ isOpen, onClose, categoria }) => {
  if (!isOpen || !categoria) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col transform transition-all duration-300 animate-slideInScale">
        
        <div className="bg-cyan-500 text-white p-5 rounded-t-xl flex justify-between items-center flex-shrink-0">
          <h3 className="text-xl font-bold">Detalles de Categoría</h3>
          <button onClick={onClose} className="text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg p-2 transition-all duration-200 hover:scale-110">
            ×
          </button>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
              {getIconComponent(categoria.icono)}
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-800">{categoria.nombre}</h4>
              <p className="text-gray-500">Categoría</p>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between py-2 border-b">
              <p className="font-semibold text-gray-600">ID</p>
              <p className="text-gray-800 text-right break-all">{categoria._id}</p>
            </div>
            <div className="flex justify-between py-2 border-b">
              <p className="font-semibold text-gray-600">Nombre</p>
              <p className="text-gray-800 text-right">{categoria.nombre}</p>
            </div>
            <div className="flex justify-between py-2 border-b">
              <p className="font-semibold text-gray-600">Descripción</p>
              <p className="text-gray-800 text-right">{categoria.descripcion}</p>
            </div>
            <div className="flex justify-between py-2 border-b">
              <p className="font-semibold text-gray-600">Fecha de Creación</p>
              <p className="text-gray-800 text-right">
                {categoria.createdAt ? new Date(categoria.createdAt).toLocaleDateString('es-ES') : 'N/A'}
              </p>
            </div>
            <div className="flex justify-between py-2">
              <p className="font-semibold text-gray-600">Última Actualización</p>
              <p className="text-gray-800 text-right">
                {categoria.updatedAt ? new Date(categoria.updatedAt).toLocaleDateString('es-ES') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-b-xl flex justify-end flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all duration-200 hover:scale-105">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoriasContent = () => {
  // Estados principales
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  
  // Estados de filtros y ordenamiento
  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('fechaRegistro');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  
  // Estados para UI
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  
  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);
  
  // Estados para formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Endpoint
  const ENDPOINT = API_CONFIG.ENDPOINTS.CATEGORIAS; // '/categoria'

  // Helper: realizar fetch con fallback localhost <-> producción y actualizar BASE_URL activa
  const requestWithFallback = async (path = '', options = {}) => {
    const makeUrl = (base) => `${base}${ENDPOINT}${path}`;

    const tryOnce = async (base) => {
      const url = makeUrl(base);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUTS.REQUEST);
      try {
        const res = await fetch(url, { ...API_CONFIG.FETCH_CONFIG, ...options, signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
        }
        // Si llega aquí, éxito: fijar BASE_URL
        API_CONFIG.BASE_URL = base;
        return await res.json();
      } catch (err) {
        clearTimeout(timeout);
        throw err;
      }
    };

    // Intentar primero con la BASE_URL activa
    const primaryBase = API_CONFIG.BASE_URL;
    const secondaryBase = primaryBase.includes('localhost')
      ? 'https://aurora-production-7e57.up.railway.app/api'
      : 'https://aurora-production-7e57.up.railway.app/api/api';

    try {
      return await tryOnce(primaryBase);
    } catch (e1) {
      // Fallback solo para errores de red/timeout/TypeError o abort
      if (
        e1.name === 'AbortError' ||
        (e1 instanceof TypeError) ||
        (e1.message && (e1.message.includes('Failed to fetch') || e1.message.includes('NetworkError')))
      ) {
        try {
          return await tryOnce(secondaryBase);
        } catch (e2) {
          throw e2;
        }
      }
      throw e1;
    }
  };

  // Función para obtener todas las categorías
  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      const data = await requestWithFallback('', { method: 'GET' });
      
      if (Array.isArray(data)) {
        const formattedData = data.map(c => ({
          ...c,
          fechaRegistro: new Date(c.createdAt).toLocaleDateString(),
          fechaRegistroRaw: new Date(c.createdAt),
        }));
        setCategorias(formattedData);
      } else if (data.message) {
        showAlert('error', data.message);
        setCategorias([]);
      }
    } catch (err) {
      showAlert('error', 'Error al conectar con el servidor');
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  // Funciones utilitarias
  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
    const timer = setTimeout(() => setAlert(null), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Función para manejar ordenamiento
  const handleSortChange = useCallback((sortValue) => {
    const [field, order] = sortValue.split('-');
    setSortBy(field);
    setSortOrder(order);
    setShowSortDropdown(false);
  }, []);

  // Función para ordenar datos
  const sortData = useCallback((data) => {
    return [...data].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'nombre':
          valueA = a.nombre?.toLowerCase() || '';
          valueB = b.nombre?.toLowerCase() || '';
          break;
        case 'fechaRegistro':
          valueA = a.fechaRegistroRaw || new Date(0);
          valueB = b.fechaRegistroRaw || new Date(0);
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortBy, sortOrder]);

  // Función para aplicar filtros avanzados
  const applyAdvancedFilters = useCallback((categoria) => {
    // Filtro por categoría de icono
    if (filters.iconCategory !== 'todos') {
      const iconData = availableIcons.find(icon => icon.name === categoria.icono);
      const iconCategory = iconData?.category || '';
      if (iconCategory.toLowerCase() !== filters.iconCategory.toLowerCase()) {
        return false;
      }
    }

    // Filtro por fecha de registro
    if (filters.fechaDesde) {
      const fechaDesde = new Date(filters.fechaDesde);
      if (categoria.fechaRegistroRaw < fechaDesde) {
        return false;
      }
    }
    if (filters.fechaHasta) {
      const fechaHasta = new Date(filters.fechaHasta);
      fechaHasta.setHours(23, 59, 59);
      if (categoria.fechaRegistroRaw > fechaHasta) {
        return false;
      }
    }

    return true;
  }, [filters]);

  // Lógica de filtrado y ordenamiento
  const filteredAndSortedCategorias = useMemo(() => {
    const filtered = categorias.filter(categoria => {
      // Búsqueda por texto
      const search = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        categoria.nombre?.toLowerCase().includes(search) ||
        categoria.descripcion?.toLowerCase().includes(search);
      
      // Filtros avanzados
      const matchesAdvancedFilters = applyAdvancedFilters(categoria);
      
      return matchesSearch && matchesAdvancedFilters;
    });
    
    return sortData(filtered);
  }, [categorias, searchTerm, applyAdvancedFilters, sortData]);

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedCategorias.length / pageSize);
  const currentCategorias = filteredAndSortedCategorias.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  // Funciones para manejar filtros
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setSearchTerm('');
  }, []);

  const hasActiveFilters = useCallback(() => {
    return searchTerm || 
           filters.iconCategory !== 'todos' || 
           filters.fechaDesde || 
           filters.fechaHasta;
  }, [searchTerm, filters]);

  // Obtener categorías de iconos únicas
  const uniqueIconCategories = useMemo(() => {
    const categories = [...new Set(availableIcons.map(icon => icon.category))];
    return categories.sort();
  }, []);

  // Función para validar el formulario
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre?.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.descripcion?.trim()) {
      errors.descripcion = 'La descripción es obligatoria';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Función para crear nueva categoría
  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await requestWithFallback('', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      if (result.message === 'categoria guardada') {
        await fetchCategorias();
        setShowAddModal(false);
        resetForm();
        showAlert('success', 'Categoría creada exitosamente');
      } else {
        showAlert('error', result.message || 'Error al crear la categoría');
      }
    } catch (err) {
      showAlert('error', 'Error al conectar con el servidor');
    }
  };

  // Función para actualizar categoría
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await requestWithFallback(`/${selectedCategoria._id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      
      if (result.message === 'Categoria actualizada') {
        await fetchCategorias();
        setShowEditModal(false);
        resetForm();
        setSelectedCategoria(null);
        showAlert('success', 'Categoría actualizada exitosamente');
      } else {
        showAlert('error', result.message || 'Error al actualizar la categoría');
      }
    } catch (err) {
      showAlert('error', 'Error al conectar con el servidor');
    }
  };

  // Abrir modal de confirmación para eliminar
  const requestDeleteCategoria = (id) => {
    setCategoriaToDelete(id);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación
  const confirmDeleteCategoria = async () => {
    if (!categoriaToDelete) return;
    try {
      const result = await requestWithFallback(`/${categoriaToDelete}`, {
        method: 'DELETE',
      });
      if (result.message === 'Categoria eliminada') {
        await fetchCategorias();
        showAlert('success', 'Categoría eliminada exitosamente');
      } else {
        showAlert('error', result.message || 'Error al eliminar la categoría');
      }
    } catch (err) {
      showAlert('error', 'Error al conectar con el servidor');
    } finally {
      setShowDeleteModal(false);
      setCategoriaToDelete(null);
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      icono: ''
    });
    setFormErrors({});
    clearAlert();
  };

  // Función para abrir modal de edición
  const openEditModal = (categoria) => {
    setSelectedCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      icono: categoria.icono || ''
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  // Función para abrir modal de detalles
  const openDetailModal = (categoria) => {
    setSelectedCategoria(categoria);
    setShowDetailModal(true);
  };

  // Función para cerrar modales
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setShowDeleteModal(false);
    setSelectedCategoria(null);
    resetForm();
    clearAlert();
  };

  // Función para limpiar alertas
  const clearAlert = () => {
    setAlert(null);
  };

  // Funciones de paginación
  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(0, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  const goToLastPage = () => setCurrentPage(totalPages - 1);

  // Estadísticas
  const stats = useMemo(() => [
    { title: 'Total Categorías', value: categorias.length, Icon: Tags, color: 'cyan' },
    { title: 'Categorías Activas', value: categorias.length, Icon: UserCheck, color: 'cyan' },
    { title: 'En Esta Página', value: currentCategorias.length, Icon: Package, color: 'cyan' },
  ], [categorias.length, currentCategorias.length]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {alert && <Alert alert={alert} />}
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Alert alert={alert} />
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <p className={`text-3xl font-bold mt-2 ${stat.color === 'cyan' ? 'text-cyan-600' : stat.color === 'green' ? 'text-green-600' : 'text-gray-800'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color === 'cyan' ? 'bg-cyan-100' : stat.color === 'green' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <stat.Icon className={`w-6 h-6 ${stat.color === 'cyan' ? 'text-cyan-600' : stat.color === 'green' ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla principal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestión de Categorías</h2>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Categoría</span>
            </button>
          </div>
        </div>
        
        {/* BARRA DE BÚSQUEDA Y CONTROLES */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Barra de búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                aria-label="Buscar categorías"
              />
            </div>

            {/* Controles de filtro y ordenamiento */}
            <div className="flex items-center space-x-3">
              {/* Dropdown de ordenamiento */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown);
                    setShowFiltersPanel(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-expanded={showSortDropdown}
                  aria-haspopup="true"
                  aria-label="Opciones de ordenamiento"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  <span className="text-sm font-medium">Ordenar</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <div className="py-2">
                      {SORT_OPTIONS.map((option) => {
                        const IconComponent = option.icon;
                        const isActive = `${sortBy}-${sortOrder}` === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                              isActive ? 'bg-cyan-50 text-cyan-600 font-medium' : 'text-gray-700'
                            }`}
                            aria-pressed={isActive}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span>{option.label}</span>
                            {isActive && <CheckCircle className="w-4 h-4 ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de filtros */}
              <button
                onClick={() => {
                  setShowFiltersPanel(!showFiltersPanel);
                  setShowSortDropdown(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all duration-200 ${
                  hasActiveFilters() 
                    ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                aria-expanded={showFiltersPanel}
                aria-label="Filtros avanzados"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filtros</span>
                {hasActiveFilters() && (
                  <span className="bg-white text-cyan-600 text-xs px-2 py-0.5 rounded-full font-bold">
                    {[
                      searchTerm && 1,
                      filters.iconCategory !== 'todos' && 1,
                      filters.fechaDesde && 1,
                      filters.fechaHasta && 1
                    ].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Información de resultados */}
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredAndSortedCategorias.length} categoría{filteredAndSortedCategorias.length !== 1 ? 's' : ''} 
              {hasActiveFilters() && ` (filtrado${filteredAndSortedCategorias.length !== 1 ? 's' : ''} de ${categorias.length})`}
            </span>
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="text-cyan-600 hover:text-cyan-800 font-medium flex items-center space-x-1"
                aria-label="Limpiar todos los filtros"
              >
                <X className="w-4 h-4" />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* PANEL DE FILTROS */}
        {showFiltersPanel && (
          <div className="border-b bg-white" role="region" aria-labelledby="filtros-titulo">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 id="filtros-titulo" className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
                <button
                  onClick={() => setShowFiltersPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Cerrar panel de filtros"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Filtro por Categoría de Icono */}
                <div>
                  <label htmlFor="filter-icon-category" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría de Icono
                  </label>
                  <select
                    id="filter-icon-category"
                    value={filters.iconCategory}
                    onChange={(e) => handleFilterChange('iconCategory', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="todos">Todas las categorías</option>
                    {uniqueIconCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Fecha de Registro */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Registro</label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        type="date"
                        value={filters.fechaDesde}
                        onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        aria-label="Fecha desde"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="date"
                        value={filters.fechaHasta}
                        onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        aria-label="Fecha hasta"
                      />
                    </div>
                  </div>
                  <div className="flex text-xs text-gray-500 mt-1 space-x-4">
                    <span>Desde</span>
                    <span>Hasta</span>
                  </div>
                </div>
              </div>

              {/* Botones de acción del panel de filtros */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Limpiar Todo
                </button>
                <button
                  onClick={() => setShowFiltersPanel(false)}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Nombre</th>
                <th className="px-6 py-4 text-left font-semibold">Descripción</th>
                <th className="px-6 py-4 text-left font-semibold">Icono</th>
                <th className="px-6 py-4 text-left font-semibold">Fecha Creación</th>
                <th className="px-6 py-4 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentCategorias.map((categoria) => (
                <tr key={categoria._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{categoria.nombre}</td>
                  <td className="px-6 py-4 text-gray-600">{categoria.descripcion}</td>
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600">
                      {getIconComponent(categoria.icono)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {categoria.fechaRegistro}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => requestDeleteCategoria(categoria._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openDetailModal(categoria)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openEditModal(categoria)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredAndSortedCategorias.length === 0 && !loading && (
          <div className="p-8 text-center">
            <Tags className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron categorías
            </h3>
            <p className="text-gray-500">
              {hasActiveFilters() ? 'Intenta ajustar los filtros de búsqueda' : 'Comienza creando tu primera categoría'}
            </p>
          </div>
        )}

        {/* Controles de paginación */}
        {filteredAndSortedCategorias.length > 0 && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Mostrar</span>
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                  className="border border-gray-300 rounded py-1 px-2 focus:ring-2 focus:ring-cyan-500"
                >
                  {[5, 10, 15, 20].map(size => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span className="text-gray-700">por página</span>
              </div>
              <div className="flex items-center gap-2">
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
          </div>
        )}
      </div>

      {/* Vista de cards alternativa */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-cyan-500 text-white p-6">
          <h3 className="text-xl font-bold">Vista Rápida de Categorías</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedCategorias.slice(0, 6).map((categoria) => (
              <div key={`card-${categoria._id}`} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => openDetailModal(categoria)}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600">
                    {getIconComponent(categoria.icono)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{categoria.nombre}</h4>
                    <p className="text-sm text-gray-500 truncate">{categoria.descripcion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modales */}
      <FormModal
        isOpen={showAddModal}
        onClose={closeModals}
        onSubmit={handleCreate}
        title="Agregar Nueva Categoría"
        formData={formData}
        handleInputChange={handleInputChange}
        errors={formErrors}
        submitLabel="Crear Categoría"
      />

      <FormModal
        isOpen={showEditModal}
        onClose={closeModals}
        onSubmit={handleUpdate}
        title="Editar Categoría"
        formData={formData}
        handleInputChange={handleInputChange}
        errors={formErrors}
        submitLabel="Actualizar Categoría"
        isEditing={true}
      />

      <DetailModal
        isOpen={showDetailModal}
        onClose={closeModals}
        categoria={selectedCategoria}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => { 
          setShowDeleteModal(false); 
          setCategoriaToDelete(null); 
        }}
        onConfirm={confirmDeleteCategoria}
        title="Confirmar eliminación"
        message="¿Está seguro de que desea eliminar esta categoría? Esta acción no se puede deshacer."
      />

      {/* OVERLAY PARA DROPDOWN */}
      {showSortDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowSortDropdown(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default CategoriasContent;