import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageTransition from "../../components/transition/PageTransition.jsx";
import Navbar from "../../components/layout/Navbar";
import ProductNavigation from "../../components/ProductNavigation.jsx";
import ProductStats from "../../components/ProductStats.jsx";
import FeaturedProducts from "../../components/FeaturedProducts.jsx";
import ProductTypeInfo from "../../components/ProductTypeInfo.jsx";
import EmptyProducts from "../../components/EmptyProducts.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import ContactHelp from "../../components/ContactHelp.jsx";
import ErrorBoundary from "../../components/ErrorBoundary.jsx";
import useApiData from '../../hooks/useApiData';

const Producto = () => {
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedMarca, setSelectedMarca] = useState('todos');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nombre');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Hooks para traer datos reales usando el nuevo hook
  const { data: lentes, loading: loadingLentes, error: errorLentes, success: successLentes } = useApiData('lentes');
  const { data: accesorios, loading: loadingAccesorios, error: errorAccesorios, success: successAccesorios } = useApiData('accesorios');
  const { data: personalizables, loading: loadingPersonalizables, error: errorPersonalizables, success: successPersonalizables } = useApiData('productosPersonalizados');
  const { data: marcas, loading: loadingMarcas, error: errorMarcas, success: successMarcas } = useApiData('marcas');
  const { data: categorias, loading: loadingCategorias, error: errorCategorias, success: successCategorias } = useApiData('categoria');

  // Debug: Log de los datos recibidos
  useEffect(() => {
    console.log('Debug - Datos recibidos:', {
      lentes: { data: lentes, loading: loadingLentes, error: errorLentes, success: successLentes },
      accesorios: { data: accesorios, loading: loadingAccesorios, error: errorAccesorios, success: successAccesorios },
      personalizables: { data: personalizables, loading: loadingPersonalizables, error: errorPersonalizables, success: successPersonalizables },
      marcas: { data: marcas, loading: loadingMarcas, error: errorMarcas, success: successMarcas },
      categorias: { data: categorias, loading: loadingCategorias, error: errorCategorias, success: successCategorias }
    });
  }, [lentes, accesorios, personalizables, marcas, categorias, 
      loadingLentes, loadingAccesorios, loadingPersonalizables, loadingMarcas, loadingCategorias,
      errorLentes, errorAccesorios, errorPersonalizables, errorMarcas, errorCategorias,
      successLentes, successAccesorios, successPersonalizables, successMarcas, successCategorias]);

  // Función para filtrar productos
  const filterProducts = (products) => {
    // Validar que products sea un array válido
    if (!Array.isArray(products)) {
      console.warn('filterProducts: products no es un array válido:', products);
      return [];
    }
    
    return products.filter(product => {
      // Validar que el producto tenga las propiedades necesarias
      if (!product || typeof product !== 'object') {
        return false;
      }

      // Filtro por búsqueda
      const matchesSearch = !searchTerm || 
                           (product.nombre && product.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtro por categoría
      const matchesCategory = selectedCategory === 'todos' || 
                             (product.categoriaId && product.categoriaId.nombre === selectedCategory) ||
                             (product.categoria === selectedCategory);
      
      // Filtro por marca
      const matchesMarca = selectedMarca === 'todos' || 
                           (product.marcaId && product.marcaId.nombre === selectedMarca);
      
      // Filtro por precio
      const price = product.precioActual || product.precioBase || 0;
      const matchesPrice = price >= priceRange.min && price <= priceRange.max;
      
      return matchesSearch && matchesCategory && matchesMarca && matchesPrice;
    });
  };

  // Función para ordenar productos
  const sortProducts = (products) => {
    // Validar que products sea un array válido
    if (!Array.isArray(products)) {
      console.warn('sortProducts: products no es un array válido:', products);
      return [];
    }
    
    const sorted = [...products];
    switch (sortBy) {
      case 'precio-asc':
        return sorted.sort((a, b) => {
          const priceA = (a && a.precioActual) || (a && a.precioBase) || 0;
          const priceB = (b && b.precioActual) || (b && b.precioBase) || 0;
          return priceA - priceB;
        });
      case 'precio-desc':
        return sorted.sort((a, b) => {
          const priceA = (a && a.precioActual) || (a && a.precioBase) || 0;
          const priceB = (b && b.precioActual) || (b && b.precioBase) || 0;
          return priceB - priceA;
        });
      case 'nombre':
        return sorted.sort((a, b) => {
          const nameA = (a && a.nombre) || '';
          const nameB = (b && b.nombre) || '';
          return nameA.localeCompare(nameB);
        });
      case 'marca':
        return sorted.sort((a, b) => {
          const marcaA = (a && a.marcaId && a.marcaId.nombre) || '';
          const marcaB = (b && b.marcaId && b.marcaId.nombre) || '';
          return marcaA.localeCompare(marcaB);
        });
      default:
        return sorted;
    }
  };

  // Función para obtener productos según la ruta
  const getCurrentProducts = () => {
    switch (location.pathname) {
      case "/productos/lentes":
        return { data: lentes, loading: loadingLentes, error: errorLentes, type: 'lentes' };
      case "/productos/accesorios":
        return { data: accesorios, loading: loadingAccesorios, error: errorAccesorios, type: 'accesorios' };
      case "/productos/personalizables":
        return { data: personalizables, loading: loadingPersonalizables, error: errorPersonalizables, type: 'personalizables' };
      default:
        return { 
          data: [...lentes, ...accesorios, ...personalizables], 
          loading: loadingLentes || loadingAccesorios || loadingPersonalizables, 
          error: errorLentes || errorAccesorios || errorPersonalizables, 
          type: 'todos' 
        };
    }
  };

  // Función para mostrar modal de producto
  const showProductDetails = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // Función para cerrar modal
  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  // Función para formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Función para obtener imagen del producto
  const getProductImage = (product) => {
    if (product.imagenes && product.imagenes.length > 0) {
      return product.imagenes[0];
    }
    // Imágenes por defecto según el tipo
    switch (getCurrentProducts().type) {
      case 'lentes':
        return '/src/pages/public/img/Lente1.png';
      case 'accesorios':
        return '/src/pages/public/img/Accesorio.png';
      default:
        return '/src/pages/public/img/Lente1.png';
    }
  };

  // Componente de filtros
  const FilterSection = () => (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">Filtros</h3>
      
      {/* Búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097c2]"
        />
      </div>

      {/* Categoría */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097c2]"
        >
          <option value="todos">Todas las categorías</option>
          {categorias?.map(cat => (
            <option key={cat._id} value={cat.nombre}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      {/* Marca */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
        <select
          value={selectedMarca}
          onChange={(e) => setSelectedMarca(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097c2]"
        >
          <option value="todos">Todas las marcas</option>
          {marcas?.map(marca => (
            <option key={marca._id} value={marca.nombre}>{marca.nombre}</option>
          ))}
        </select>
      </div>

      {/* Rango de precio */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Rango de precio</label>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
            className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097c2]"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
            className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097c2]"
          />
                    </div>
                  </div>

      {/* Ordenar por */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097c2]"
        >
          <option value="nombre">Nombre</option>
          <option value="precio-asc">Precio: Menor a Mayor</option>
          <option value="precio-desc">Precio: Mayor a Menor</option>
          <option value="marca">Marca</option>
        </select>
      </div>

      {/* Vista */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Vista</label>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#0097c2] text-white' : 'bg-gray-200'}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#0097c2] text-white' : 'bg-gray-200'}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
            </div>
          </div>
        );

  // Componente de producto en vista grid
  const ProductGridItem = ({ product }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img 
          src={getProductImage(product)} 
          alt={product.nombre} 
          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
        />
        {product.enPromocion && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            ¡OFERTA!
          </div>
        )}
      </div>
                    <div className="p-4">
        <h3 className="text-lg font-bold mb-2 text-gray-800">{product.nombre}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.descripcion}</p>
        
        <div className="mb-3">
          {product.marcaId?.nombre && (
            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-2">
              {product.marcaId.nombre}
            </span>
          )}
          {product.categoriaId?.nombre && (
            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
              {product.categoriaId.nombre}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            {product.enPromocion && product.precioBase && (
              <span className="text-gray-500 line-through text-sm">
                {formatPrice(product.precioBase)}
              </span>
            )}
            <div className="text-lg font-bold text-[#0097c2]">
              {formatPrice(product.precioActual || product.precioBase || 0)}
            </div>
                    </div>
                  </div>

        <button 
          onClick={() => showProductDetails(product)}
          className="w-full bg-[#0097c2] text-white py-2 rounded-full hover:bg-[#0077a2] transition-colors duration-300"
        >
          Ver detalles
        </button>
            </div>
          </div>
        );

  // Componente de producto en vista lista
  const ProductListItem = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center space-x-4">
        <img 
          src={getProductImage(product)} 
          alt={product.nombre} 
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">{product.nombre}</h3>
          <p className="text-gray-600 text-sm mb-2">{product.descripcion}</p>
          
          <div className="flex items-center space-x-2 mb-2">
            {product.marcaId?.nombre && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {product.marcaId.nombre}
              </span>
            )}
            {product.categoriaId?.nombre && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                {product.categoriaId.nombre}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              {product.enPromocion && product.precioBase && (
                <span className="text-gray-500 line-through text-sm mr-2">
                  {formatPrice(product.precioBase)}
                </span>
              )}
              <span className="text-lg font-bold text-[#0097c2]">
                {formatPrice(product.precioActual || product.precioBase || 0)}
              </span>
            </div>
            <button 
              onClick={() => showProductDetails(product)}
              className="bg-[#0097c2] text-white px-4 py-2 rounded-full hover:bg-[#0077a2] transition-colors duration-300"
            >
              Ver detalles
            </button>
                    </div>
                  </div>
            </div>
          </div>
        );

  // Modal de detalles del producto
  const ProductDetailModal = () => {
    if (!selectedProduct) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{selectedProduct.nombre}</h2>
              <button 
                onClick={closeProductModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Imágenes */}
              <div>
                <img 
                  src={getProductImage(selectedProduct)} 
                  alt={selectedProduct.nombre} 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>

              {/* Información del producto */}
              <div>
                <p className="text-gray-600 mb-4">{selectedProduct.descripcion}</p>
                
                <div className="space-y-3 mb-6">
                  {selectedProduct.marcaId?.nombre && (
                    <div>
                      <span className="font-semibold text-gray-700">Marca:</span>
                      <span className="ml-2 text-gray-600">{selectedProduct.marcaId.nombre}</span>
                    </div>
                  )}
                  
                  {selectedProduct.categoriaId?.nombre && (
                    <div>
                      <span className="font-semibold text-gray-700">Categoría:</span>
                      <span className="ml-2 text-gray-600">{selectedProduct.categoriaId.nombre}</span>
                    </div>
                  )}

                  {selectedProduct.material && (
                    <div>
                      <span className="font-semibold text-gray-700">Material:</span>
                      <span className="ml-2 text-gray-600">{selectedProduct.material}</span>
                    </div>
                  )}

                  {selectedProduct.color && (
                    <div>
                      <span className="font-semibold text-gray-700">Color:</span>
                      <span className="ml-2 text-gray-600">{selectedProduct.color}</span>
                    </div>
                  )}

                  {selectedProduct.tipoLente && (
                    <div>
                      <span className="font-semibold text-gray-700">Tipo de lente:</span>
                      <span className="ml-2 text-gray-600">{selectedProduct.tipoLente}</span>
                    </div>
                  )}
                </div>

                {/* Precios */}
                <div className="mb-6">
                  {selectedProduct.enPromocion && selectedProduct.precioBase && (
                    <div className="mb-2">
                      <span className="text-gray-500 line-through">
                        Precio original: {formatPrice(selectedProduct.precioBase)}
                      </span>
                    </div>
                  )}
                  <div className="text-2xl font-bold text-[#0097c2]">
                    Precio: {formatPrice(selectedProduct.precioActual || selectedProduct.precioBase || 0)}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex space-x-3">
                  <button className="flex-1 bg-[#0097c2] text-white py-3 rounded-full hover:bg-[#0077a2] transition-colors duration-300">
                    Agregar al carrito
                  </button>
                  <button className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-full hover:bg-gray-300 transition-colors duration-300">
                    Cotizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const { data: products, loading, error, type } = getCurrentProducts();
    
    // Validar que products sea un array válido
    if (!Array.isArray(products)) {
      console.warn('renderContent: products no es un array válido:', products);
        return (
        <div className="text-center py-16 px-4">
          <div className="text-red-500 text-lg mb-2">Error en el formato de datos</div>
          <p className="text-gray-600">Los datos recibidos no tienen el formato esperado</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#0097c2] text-white px-6 py-2 rounded-full hover:bg-[#0077a2] transition"
          >
            Recargar página
          </button>
          </div>
        );
    }
    
    const filteredProducts = filterProducts(products);
    const sortedProducts = sortProducts(filteredProducts);

    const getTitle = () => {
      switch (type) {
        case 'lentes': return 'Lentes';
        case 'accesorios': return 'Accesorios';
        case 'personalizables': return 'Productos Personalizables';
        default: return 'Todos los Productos';
      }
    };

    return (
      <div className="container mx-auto py-10 px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filtros */}
          <div className="lg:w-1/4">
            <FilterSection />
          </div>

          {/* Productos */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                {getTitle()}
              </h2>
              <div className="text-gray-600">
                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Estadísticas de productos */}
            <ProductStats products={products} type={type} />

            {/* Productos destacados */}
            <FeaturedProducts products={products} type={type} />

            {/* Información del tipo de producto */}
            <ProductTypeInfo type={type} />

            {loading ? (
              <LoadingSpinner message={`Cargando ${getTitle().toLowerCase()}...`} />
            ) : error ? (
              <ErrorMessage 
                error={error} 
                onRetry={() => window.location.reload()}
              />
            ) : filteredProducts.length === 0 ? (
              <EmptyProducts 
                type={type} 
                searchTerm={searchTerm}
                filters={{
                  selectedCategory,
                  selectedMarca,
                  priceRange
                }}
              />
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {sortedProducts.map((product) => (
                  <div key={product._id}>
                    {viewMode === 'grid' ? (
                      <ProductGridItem product={product} />
                    ) : (
                      <ProductListItem product={product} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
    <PageTransition>
      <Navbar />
        <ProductNavigation />
        
        {/* Anuncio de producto destacado */}
        <div className="container mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg mx-4">
          <h1 className="text-3xl font-bold text-[#0097c2] mb-4">
            Producto Destacado
          </h1>
          <img
            src="/src/pages/public/img/Lente1.png"
            alt="Producto Destacado"
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          <p className="text-gray-700 mb-4">
            Descubre nuestra colección premium de lentes con la mejor tecnología y diseño. 
            Ofrecemos una amplia variedad de estilos, materiales y graduaciones para satisfacer 
            todas tus necesidades visuales.
          </p>
          <button className="bg-[#0097c2] text-white px-6 py-2 rounded-full hover:bg-[#0077a2] transition">
            Ver Colección Completa
          </button>
      </div>

      {renderContent()}

        {/* Información de contacto y ayuda */}
        <div className="container mx-auto px-4">
          <ContactHelp />
        </div>

        {/* Modal de detalles del producto */}
        {showProductModal && <ProductDetailModal />}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#0097c2] to-[#00b4e4] text-white mt-10 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          {/* Top Footer with main content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-8 px-0 sm:px-4 py-8 sm:py-12">
            {/* Logo and description column */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center space-x-3">
              <img 
              src="https://i.imgur.com/rYfBDzN.png" 
              alt="Óptica La Inteligente" 
              className="w-27 h-14 object-contain hover:scale-105 transition-transform duration-300 hover:drop-shadow-lg"
            />
                <h2 className="text-xl font-bold">Óptica La Inteligente</h2>
              </div>
              <p className="text-sm text-gray-100">
                Comprometidos con tu Salud Visual desde 2010. Ofrecemos
                Servicios Profesionales y Productos de Alta Calidad para el
                Cuidado de tus Ojos.
              </p>
              <div className="flex space-x-4 mt-4">
                <a
                  href="https://facebook.com"
                  className="hover:text-gray-200 transition-colors p-2 bg-white/10 rounded-full"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="https://instagram.com"
                  className="hover:text-gray-200 transition-colors p-2 bg-white/10 rounded-full"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="https://wa.me/1234567890"
                  className="hover:text-gray-200 transition-colors p-2 bg-white/10 rounded-full"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-whatsapp"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-2">
              <h3 className="font-semibold text-lg mb-4">Servicios</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/servicios"
                    className="hover:text-gray-200 transition-colors flex items-center"
                  >
                    <span className="mr-2">→</span>
                    Examen Visual
                  </a>
                </li>
                <li>
                  <a
                    href="/servicios"
                    className="hover:text-gray-200 transition-colors flex items-center"
                  >
                    <span className="mr-2">→</span>
                    Adaptación de Lentes
                  </a>
                </li>
                <li>
                  <a
                    href="/servicios"
                    className="hover:text-gray-200 transition-colors flex items-center"
                  >
                    <span className="mr-2">→</span>
                    Reparaciones
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="md:col-span-2">
              <h3 className="font-semibold text-lg mb-4">Compañía</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/nosotros"
                    className="hover:text-gray-200 transition-colors flex items-center"
                  >
                    <span className="mr-2">→</span>
                    Sobre Nosotros
                  </a>
                </li>
                <li>
                  <a
                    href="/nosotros"
                    className="hover:text-gray-200 transition-colors flex items-center"
                  >
                    <span className="mr-2">→</span>
                    Historia
                  </a>
                </li>
                <li>
                  <a
                    href="/nosotros"
                    className="hover:text-gray-200 transition-colors flex items-center"
                  >
                    <span className="mr-2">→</span>
                    Misión y Visión
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="md:col-span-4">
              <h3 className="font-semibold text-lg mb-4">Contacto</h3>
              <div className="space-y-4 text-sm">
                <p className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  123 Calle Principal, San Salvador
                </p>
                <p className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  +503 1234-5678
                </p>
                <p className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  info@opticalainteligente.com
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-white/10">
            <div className="px-4 py-6 text-sm text-center">
              <p>
                © {new Date().getFullYear()} Óptica La Inteligente. Todos los
                derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </PageTransition>
    </ErrorBoundary>
  );
};

export default Producto;
