import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../components/auth/AuthContext';
import PageTransition from "../../components/transition/PageTransition.jsx";
import Navbar from "../../components/layout/Navbar";
import EmptyProducts from "../../components/EmptyProducts.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import ErrorBoundary from "../../components/ErrorBoundary.jsx";
import useApiData from '../../hooks/useApiData';
import Pagination from '../../components/Admin/ui/Pagination.jsx';
import { API_CONFIG, buildApiUrl } from '../../config/api';
import Alert, { ToastContainer, useAlert } from '../../components/ui/Alert';

const Producto = () => {
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedMarca, setSelectedMarca] = useState('todos');
  const [selectedMaterial, setSelectedMaterial] = useState('todos');
  const [selectedColor, setSelectedColor] = useState('todos');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('nombre');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const { alertState, showSuccess, showError, hideAlert } = useAlert();
  const [showSolicitudModal, setShowSolicitudModal] = useState(false);
  const [solicitudForm, setSolicitudForm] = useState({
    nombre: '',
    descripcion: '',
    material: '',
    color: '',
    tipoLente: '',
    instruccionesAdicionales: '',
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { addItem } = useCart() || {};
  const { user } = useAuth();

  // Paginación server-side
  const [pageSize, setPageSize] = useState(12);
  const [pageLentes, setPageLentes] = useState(1);
  const [pageAccesorios, setPageAccesorios] = useState(1);

  // Datos del backend usando useApiData con paginación
  const { data: lentes, loading: loadingLentes, error: errorLentes, success: successLentes, pagination: paginationLentes } = useApiData('lentes', { page: pageLentes, limit: pageSize });
  const { data: accesorios, loading: loadingAccesorios, error: errorAccesorios, success: successAccesorios, pagination: paginationAccesorios } = useApiData('accesorios', { page: pageAccesorios, limit: pageSize });
  const { data: personalizables, loading: loadingPersonalizables, error: errorPersonalizables, success: successPersonalizables } = useApiData('productosPersonalizados');
  const { data: marcas, loading: loadingMarcas, error: errorMarcas, success: successMarcas } = useApiData('marcas');
  const { data: categorias, loading: loadingCategorias, error: errorCategorias, success: successCategorias } = useApiData('categoria');

  // Abrir modal de solicitud personalizada tomando el producto base seleccionado
  const openSolicitudModal = (product) => {
    setSelectedProduct(product);
    setSolicitudForm((f) => ({
      ...f,
      nombre: product?.nombre || '',
      descripcion: product?.descripcion || '',
      material: product?.material || '',
      color: product?.color || '',
      tipoLente: product?.tipoLente || '',
    }));
    setShowSolicitudModal(true);
  };

  const handleSolicitudChange = (e) => {
    const { name, value } = e.target;
    setSolicitudForm((f) => ({ ...f, [name]: value }));
  };

  // Crear producto personalizado (pendiente) y agregar al carrito
  const handleCrearSolicitudPersonalizada = async () => {
    try {
      if (!user?.id) {
        showError('Inicia sesión para solicitar un producto personalizado.');
        return;
      }
      if (!selectedProduct?._id) {
        showError('Producto base no seleccionado');
        return;
      }
      const precioCalculado = Number(selectedProduct?.precioActual ?? selectedProduct?.precioBase ?? 0);
      const fechaEntregaEstimada = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const validaHasta = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const payload = {
        clienteId: user.id,
        productoBaseId: selectedProduct._id,
        nombre: solicitudForm.nombre || selectedProduct.nombre,
        descripcion: solicitudForm.descripcion || selectedProduct.descripcion || 'Solicitud de personalización',
        categoria: selectedProduct?.categoriaId?.nombre || selectedProduct?.categoria || 'Personalizado',
        marcaId: selectedProduct?.marcaId?._id || selectedProduct?.marcaId || null,
        material: solicitudForm.material || selectedProduct?.material || '',
        color: solicitudForm.color || selectedProduct?.color || '',
        tipoLente: solicitudForm.tipoLente || selectedProduct?.tipoLente || '',
        precioCalculado,
        detallesPersonalizacion: {
          instruccionesAdicionales: solicitudForm.instruccionesAdicionales || '',
        },
        estado: 'pendiente',
        fechaSolicitud: new Date().toISOString(),
        fechaEntregaEstimada,
        cotizacion: {
          total: precioCalculado,
          validaHasta,
          estado: 'vigente',
        },
      };

      const url = buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTOS_PERSONALIZADOS);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: API_CONFIG.FETCH_CONFIG.credentials,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'No se pudo crear la solicitud');
      }

      const created = data?.data || data; // compatibilidad
      // Agregar al carrito como ítem
      await addItem?.({ _id: created._id, nombre: `Personalizado: ${created.nombre}`, precioActual: created.precioCalculado }, 1);

      setShowSolicitudModal(false);
      showSuccess('Solicitud creada y agregada al carrito');
      navigate('/carrito');
    } catch (e) {
      console.error('Error creando solicitud personalizada', e);
      showError(e.message || 'Error creando solicitud');
    }
  };

  // Handler: agregar al carrito
  const handleAddToCart = async (product, qty = 1) => {
    if (!user) {
      // Evitar navegar fuera; mostrar aviso y permanecer en la página
      showError('Inicia sesión para agregar productos al carrito.');
      return;
    }
    try {
      await addItem?.(product, qty);
    } catch (e) {
      console.error('handleAddToCart', e);
    }
  };

  // Debounce updates from searchInput -> searchTerm to prevent input losing focus
  useEffect(() => {
    const id = setTimeout(() => setSearchTerm(searchInput), 250);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Datos mock para el sistema
  const mockData = {
    marcas: [
      { _id: '1', nombre: 'Ray-Ban', descripcion: 'Marca premium de lentes de sol' },
      { _id: '2', nombre: 'Oakley', descripcion: 'Lentes deportivos de alta calidad' },
      { _id: '3', nombre: 'Gucci', descripcion: 'Lentes de lujo y moda' },
      { _id: '4', nombre: 'Prada', descripcion: 'Diseño italiano elegante' },
      { _id: '5', nombre: 'Tom Ford', descripcion: 'Lentes sofisticados' },
      { _id: '6', nombre: 'Persol', descripcion: 'Lentes italianos de alta calidad' },
      { _id: '7', nombre: 'Maui Jim', descripcion: 'Lentes de sol polarizados' },
      { _id: '8', nombre: 'Costa', descripcion: 'Lentes para pesca y deportes acuáticos' }
    ],
    categorias: [
      { _id: '1', nombre: 'Lentes de Sol' },
      { _id: '2', nombre: 'Lentes Graduados' },
      { _id: '3', nombre: 'Lentes de Contacto' },
      { _id: '4', nombre: 'Accesorios' },
      { _id: '5', nombre: 'Armazones' },
      { _id: '6', nombre: 'Lentes Deportivos' },
      { _id: '7', nombre: 'Lentes de Lujo' },
      { _id: '8', nombre: 'Lentes Infantiles' },
      { _id: '9', nombre: 'Lentes para Computadora' },
      { _id: '10', nombre: 'Lentes Bifocales' }
    ],
    lentes: [
      {
        _id: '1',
        nombre: 'Ray-Ban Aviator',
        descripcion: 'Lentes de sol clásicos con protección UV',
        precioBase: 150,
        precioActual: 120,
        categoriaId: { nombre: 'Lentes de Sol' },
        marcaId: { nombre: 'Ray-Ban' },
        material: 'Metal',
        color: 'Dorado',
        tipoLente: 'Graduado',
        imagenes: ['/src/pages/public/img/Lente1.png']
      },
      {
        _id: '2',
        nombre: 'Oakley Sport',
        descripcion: 'Lentes deportivos resistentes',
        precioBase: 200,
        precioActual: 180,
        categoriaId: { nombre: 'Lentes Deportivos' },
        marcaId: { nombre: 'Oakley' },
        material: 'Plástico',
        color: 'Negro',
        tipoLente: 'Polarizado',
        imagenes: ['/src/pages/public/img/Lente2.png']
      },
      {
        _id: '3',
        nombre: 'Gucci Elegance',
        descripcion: 'Lentes de lujo para ocasiones especiales',
        precioBase: 300,
        precioActual: 250,
        categoriaId: { nombre: 'Lentes de Lujo' },
        marcaId: { nombre: 'Gucci' },
        material: 'Metal',
        color: 'Plateado',
        tipoLente: 'Graduado',
        imagenes: ['/src/pages/public/img/Lente3.png']
      },
      {
        _id: '4',
        nombre: 'Prada Linea Rossa',
        descripcion: 'Lentes deportivos de alta gama',
        precioBase: 280,
        precioActual: 240,
        categoriaId: { nombre: 'Lentes Deportivos' },
        marcaId: { nombre: 'Prada' },
        material: 'Plástico',
        color: 'Rojo',
        tipoLente: 'Polarizado',
        imagenes: ['/src/pages/public/img/Lente5.png']
      },
      {
        _id: '5',
        nombre: 'Tom Ford Signature',
        descripcion: 'Lentes elegantes para ejecutivos',
        precioBase: 350,
        precioActual: 320,
        categoriaId: { nombre: 'Lentes de Lujo' },
        marcaId: { nombre: 'Tom Ford' },
        material: 'Metal',
        color: 'Negro',
        tipoLente: 'Graduado',
        imagenes: ['/src/pages/public/img/Lente6.png']
      },
      {
        _id: '6',
        nombre: 'Persol PO3040',
        descripcion: 'Lentes italianos clásicos',
        precioBase: 320,
        precioActual: 290,
        categoriaId: { nombre: 'Lentes de Sol' },
        marcaId: { nombre: 'Persol' },
        material: 'Plástico',
        color: 'Verde',
        tipoLente: 'Polarizado',
        imagenes: ['/src/pages/public/img/Lente1.png']
      },
      {
        _id: '7',
        nombre: 'Maui Jim Red Sands',
        descripcion: 'Lentes polarizados para playa',
        precioBase: 280,
        precioActual: 250,
        categoriaId: { nombre: 'Lentes de Sol' },
        marcaId: { nombre: 'Maui Jim' },
        material: 'Plástico',
        color: 'Marrón',
        tipoLente: 'Polarizado',
        imagenes: ['/src/pages/public/img/Lente2.png']
      },
      {
        _id: '8',
        nombre: 'Costa Del Mar',
        descripcion: 'Lentes para pesca profesional',
        precioBase: 220,
        precioActual: 200,
        categoriaId: { nombre: 'Lentes Deportivos' },
        marcaId: { nombre: 'Costa' },
        material: 'Plástico',
        color: 'Azul',
        tipoLente: 'Polarizado',
        imagenes: ['/src/pages/public/img/Lente3.png']
      }
    ],
    accesorios: [
      {
        _id: '1',
        nombre: 'Estuche Protector',
        descripcion: 'Estuche rígido para proteger tus lentes',
        precioBase: 25,
        precioActual: 20,
        categoriaId: { nombre: 'Accesorios' },
        marcaId: { nombre: 'Genérico' },
        imagenes: ['/src/pages/public/img/Accesorio.png']
      },
      {
        _id: '2',
        nombre: 'Paño de Limpieza',
        descripcion: 'Paño suave para limpiar lentes',
        precioBase: 15,
        precioActual: 12,
        categoriaId: { nombre: 'Accesorios' },
        marcaId: { nombre: 'Genérico' },
        imagenes: ['/src/pages/public/img/Accesorio.png']
      },
      {
        _id: '3',
        nombre: 'Cordón para Lentes',
        descripcion: 'Cordón deportivo para mantener lentes seguros',
        precioBase: 18,
        precioActual: 15,
        categoriaId: { nombre: 'Accesorios' },
        marcaId: { nombre: 'Genérico' },
        imagenes: ['/src/pages/public/img/Accesorio.png']
      },
      {
        _id: '4',
        nombre: 'Spray Limpiador',
        descripcion: 'Líquido limpiador profesional para lentes',
        precioBase: 22,
        precioActual: 18,
        categoriaId: { nombre: 'Accesorios' },
        marcaId: { nombre: 'Genérico' },
        imagenes: ['/src/pages/public/img/Accesorio.png']
      },
      {
        _id: '5',
        nombre: 'Reposador de Lentes',
        descripcion: 'Soporte elegante para tu escritorio',
        precioBase: 35,
        precioActual: 30,
        categoriaId: { nombre: 'Accesorios' },
        marcaId: { nombre: 'Genérico' },
        imagenes: ['/src/pages/public/img/Accesorio.png']
      },
      {
        _id: '6',
        nombre: 'Kit de Reparación',
        descripcion: 'Kit completo para ajustes menores',
        precioBase: 45,
        precioActual: 40,
        categoriaId: { nombre: 'Accesorios' },
        marcaId: { nombre: 'Genérico' },
        imagenes: ['/src/pages/public/img/Accesorio.png']
      }
    ],
    personalizables: [
      {
        _id: '1',
        nombre: 'Lente Personalizado Premium',
        descripcion: 'Lente hecho a medida con tus especificaciones',
        precioCalculado: 400,
        categoria: 'Personalizado',
        clienteId: { nombre: 'Cliente', apellido: 'Ejemplo' },
        productoBaseId: { nombre: 'Base Premium', descripcion: 'Producto base de alta calidad' },
        marcaId: { nombre: 'Personalizado' },
        estado: 'pendiente',
        imagenes: ['/src/pages/public/img/Lente4.png']
      },
      {
        _id: '2',
        nombre: 'Lente Deportivo Personalizado',
        descripcion: 'Lente deportivo adaptado a tu actividad',
        precioCalculado: 350,
        categoria: 'Personalizado',
        clienteId: { nombre: 'Cliente', apellido: 'Deportivo' },
        productoBaseId: { nombre: 'Base Deportivo', descripcion: 'Base para actividades deportivas' },
        marcaId: { nombre: 'Personalizado' },
        estado: 'en_proceso',
        imagenes: ['/src/pages/public/img/Lente5.png']
      },
      {
        _id: '3',
        nombre: 'Lente de Lujo Personalizado',
        descripcion: 'Lente de alta gama con materiales premium',
        precioCalculado: 600,
        categoria: 'Personalizado',
        clienteId: { nombre: 'Cliente', apellido: 'Premium' },
        productoBaseId: { nombre: 'Base Lujo', descripcion: 'Base de materiales premium' },
        marcaId: { nombre: 'Personalizado' },
        estado: 'completado',
        imagenes: ['/src/pages/public/img/Lente6.png']
      },
      {
        _id: '4',
        nombre: 'Lente Infantil Personalizado',
        descripcion: 'Lente adaptado para niños con materiales seguros',
        precioCalculado: 280,
        categoria: 'Personalizado',
        clienteId: { nombre: 'Cliente', apellido: 'Infantil' },
        productoBaseId: { nombre: 'Base Infantil', descripcion: 'Base segura para niños' },
        marcaId: { nombre: 'Personalizado' },
        estado: 'pendiente',
        imagenes: ['/src/pages/public/img/Lente1.png']
      },
      {
        _id: '5',
        nombre: 'Lente para Computadora',
        descripcion: 'Lente con filtro azul para uso prolongado en pantallas',
        precioCalculado: 320,
        categoria: 'Personalizado',
        clienteId: { nombre: 'Cliente', apellido: 'Tecnología' },
        productoBaseId: { nombre: 'Base Digital', descripcion: 'Base con filtro azul' },
        marcaId: { nombre: 'Personalizado' },
        estado: 'en_proceso',
        imagenes: ['/src/pages/public/img/Lente2.png']
      }
    ]
  };

  // Filtrar productos según búsqueda y filtros activos
  const filterProducts = (products) => {
    if (!Array.isArray(products)) {
      console.warn('filterProducts: products no es un array válido:', products);
      return [];
    }
    
    return products.filter(product => {
      // Validar que el producto tenga las propiedades necesarias
      if (!product || typeof product !== 'object') {
        return false;
      }

      // Filtro por búsqueda (más inteligente)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
                           (product.nombre && product.nombre.toLowerCase().includes(searchLower)) ||
                           (product.descripcion && product.descripcion.toLowerCase().includes(searchLower)) ||
                           (product.material && product.material.toLowerCase().includes(searchLower)) ||
                           (product.color && product.color.toLowerCase().includes(searchLower)) ||
                           (product.tipoLente && product.tipoLente.toLowerCase().includes(searchLower));
      
      // Filtro por categoría
      const matchesCategory = selectedCategory === 'todos' || 
                             (product.categoriaId && product.categoriaId.nombre === selectedCategory) ||
                             (product.categoria === selectedCategory);
      
      // Filtro por marca
      const matchesMarca = selectedMarca === 'todos' || 
                           (product.marcaId && product.marcaId.nombre === selectedMarca);
      
      // Filtro por material
      const matchesMaterial = selectedMaterial === 'todos' || 
                              (product.material && product.material === selectedMaterial);
      
      // Filtro por color
      const matchesColor = selectedColor === 'todos' || 
                           (product.color && product.color === selectedColor);
      
      // Filtro por precio
      const price = product.precioActual || product.precioBase || product.precioCalculado || 0;
      const matchesPrice = price >= priceRange.min && price <= priceRange.max;
      
      return matchesSearch && matchesCategory && matchesMarca && matchesMaterial && matchesColor && matchesPrice;
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
        return { data: lentes, loading: loadingLentes, error: errorLentes, type: 'lentes', pagination: paginationLentes };
      case "/productos/accesorios":
        return { data: accesorios, loading: loadingAccesorios, error: errorAccesorios, type: 'accesorios', pagination: paginationAccesorios };
      default:
        return { 
          data: [...lentes, ...accesorios], 
          loading: loadingLentes || loadingAccesorios, 
          error: errorLentes || errorAccesorios, 
          type: 'todos' 
        };
    }
  };



  // Función para manejar el estado de carga y errores
  const getLoadingState = () => {
    const currentProducts = getCurrentProducts();
    const filteredProducts = filterProducts(currentProducts.data);
    return {
      isLoading: currentProducts.loading,
      hasError: currentProducts.error,
      isEmpty: currentProducts.data.length === 0,
      isFiltered: filteredProducts.length < currentProducts.data.length
    };
  };

  // Función para obtener mensajes de estado
  const getStatusMessage = () => {
    const currentProducts = getCurrentProducts();
    const filteredProducts = filterProducts(currentProducts.data);
    const loadingState = getLoadingState();
    
    if (loadingState.isLoading) {
      return 'Cargando productos...';
    }
    
    if (loadingState.hasError) {
      return 'Error al cargar productos. Por favor, intenta nuevamente.';
    }
    
    if (loadingState.isEmpty) {
      return 'No se encontraron productos.';
    }
    
    if (loadingState.isFiltered) {
      return `Mostrando ${filteredProducts.length} de ${currentProducts.data.length} productos`;
    }
    
    return `Mostrando ${currentProducts.data.length} productos`;
  };

  // Estado para paginación client-side (mantener para listas combinadas y fallback)
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  // Función para obtener productos paginados
  const getPaginatedProducts = () => {
    const currentProducts = getCurrentProducts();
    const filteredProducts = filterProducts(currentProducts.data);
    const sortedProducts = sortProducts(filteredProducts);
    
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProductsPage = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    
    return {
      products: currentProductsPage,
      totalPages: Math.ceil(sortedProducts.length / productsPerPage),
      currentPage,
      totalProducts: sortedProducts.length
    };
  };

  // Reset páginas server-side al cambiar de ruta
  useEffect(() => {
    setPageLentes(1);
    setPageAccesorios(1);
  }, [location.pathname]);

  // Abrir automáticamente el modal de detalle si venimos desde el chat con un ID preseleccionado
  useEffect(() => {
    try {
      const preId = localStorage.getItem('aurora_preselect_product_id');
      const addFlag = localStorage.getItem('aurora_preselect_add_to_cart');
      if (!preId) return;
      const all = [...(lentes || []), ...(accesorios || [])];
      const found = all.find(p => String(p?._id || p?.id) === String(preId));
      if (found) {
        setSelectedProduct(found);
        setShowProductModal(true);
        if (addFlag === '1') {
          // Intentar agregar al carrito; si no hay sesión, mostrará aviso y no navegará
          Promise.resolve(handleAddToCart(found, 1)).then(() => {
            // Si el usuario está autenticado, llevar al carrito
            if (user) navigate('/carrito');
          });
        }
      }
      localStorage.removeItem('aurora_preselect_product_id');
      localStorage.removeItem('aurora_preselect_add_to_cart');
    } catch (_) {
      // ignorar errores de localStorage
    }
  }, [lentes, accesorios]);

  // Abrir modal si viene el parámetro ?productId= en la URL (por ejemplo, desde el chat con "Ver detalles")
  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const pid = params.get('productId');
    if (!pid) return;
    const all = [...(lentes || []), ...(accesorios || [])];
    const found = all.find(p => String(p?._id || p?.id) === String(pid));
    if (found) {
      setSelectedProduct(found);
      setShowProductModal(true);
      // Scroll al inicio para garantizar visibilidad de la modal
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Limpiar el query param para evitar reabrir al navegar atrás/adelante
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, lentes, accesorios]);

  // Función para cambiar de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll al inicio de la lista de productos
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedMarca, selectedMaterial, selectedColor, priceRange, sortBy]);

  // Función para exportar datos de productos
  const exportProducts = () => {
    const currentProducts = getCurrentProducts();
    const filteredProducts = filterProducts(currentProducts.data);
    const sortedProducts = sortProducts(filteredProducts);
    
    const exportData = sortedProducts.map(product => ({
      ID: product._id,
      Nombre: product.nombre,
      Descripción: product.descripcion,
      Categoría: product.categoriaId?.nombre || product.categoria || 'N/A',
      Marca: product.marcaId?.nombre || 'N/A',
      Material: product.material || 'N/A',
      Color: product.color || 'N/A',
      Tipo: product.tipoLente || 'N/A',
      Precio_Base: product.precioBase || 'N/A',
      Precio_Actual: product.precioActual || 'N/A',
      Precio_Calculado: product.precioCalculado || 'N/A',
      Estado: product.estado || 'N/A'
    }));
    
    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `productos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para exportar solo los productos filtrados
  const exportFilteredProducts = () => {
    const currentProducts = getCurrentProducts();
    const filteredProducts = filterProducts(currentProducts.data);
    
    if (filteredProducts.length === 0) {
      showError('No hay productos para exportar con los filtros actuales');
      return;
    }
    
    const exportData = filteredProducts.map(product => ({
      ID: product._id,
      Nombre: product.nombre,
      Descripción: product.descripcion,
      Categoría: product.categoriaId?.nombre || product.categoria || 'N/A',
      Marca: product.marcaId?.nombre || 'N/A',
      Material: product.material || 'N/A',
      Color: product.color || 'N/A',
      Tipo: product.tipoLente || 'N/A',
      Precio_Base: product.precioBase || 'N/A',
      Precio_Actual: product.precioActual || 'N/A',
      Precio_Calculado: product.precioCalculado || 'N/A',
      Estado: product.estado || 'N/A'
    }));
    
    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `productos_filtrados_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSearchInput('');
    setSelectedCategory('todos');
    setSelectedMarca('todos');
    setSelectedMaterial('todos');
    setSelectedColor('todos');
    setPriceRange({ min: 0, max: 10000 });
    setSortBy('nombre');
    setCurrentPage(1);
  };

  // Función para obtener filtros activos
  const getActiveFilters = () => {
    const filters = [];
    
    if (searchTerm) filters.push(`Búsqueda: "${searchTerm}"`);
    if (selectedCategory !== 'todos') filters.push(`Categoría: ${selectedCategory}`);
    if (selectedMarca !== 'todos') filters.push(`Marca: ${selectedMarca}`);
    if (selectedMaterial !== 'todos') filters.push(`Material: ${selectedMaterial}`);
    if (selectedColor !== 'todos') filters.push(`Color: ${selectedColor}`);
    if (priceRange.min > 0 || priceRange.max < 10000) filters.push(`Precio: $${priceRange.min} - $${priceRange.max}`);
    if (sortBy !== 'nombre') filters.push(`Orden: ${sortBy}`);
    
    return filters;
  };

  // Función para aplicar filtros predefinidos
  const applyPresetFilter = (preset) => {
    switch (preset) {
      case 'ofertas':
        setPriceRange({ min: 0, max: 200 });
        setSortBy('precio-asc');
        break;
      case 'premium':
        setPriceRange({ min: 300, max: 10000 });
        setSortBy('precio-desc');
        break;
      case 'deportivos':
        setSelectedCategory('Lentes Deportivos');
        break;
      case 'lujo':
        setSelectedCategory('Lentes de Lujo');
        break;
      case 'economico':
        setPriceRange({ min: 0, max: 100 });
        setSortBy('precio-asc');
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  // Estado para historial de búsquedas
  const [searchHistory, setSearchHistory] = useState([]);

  // Función para agregar búsqueda al historial
  const addToSearchHistory = (search) => {
    if (search && !searchHistory.includes(search)) {
      const newHistory = [search, ...searchHistory.filter(item => item !== search)].slice(0, 10);
      setSearchHistory(newHistory);
    }
  };

  // Función para guardar historial en localStorage
  const saveSearchHistory = () => {
    try {
      localStorage.setItem('aurora-search-history', JSON.stringify(searchHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  // Función para cargar historial desde localStorage
  const loadSearchHistory = () => {
    try {
      const savedHistory = localStorage.getItem('aurora-search-history');
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  // Función para usar búsqueda del historial
  const useSearchFromHistory = (search) => {
    setSearchTerm(search);
    setSearchInput(search);
    setCurrentPage(1);
  };

  // Función para limpiar historial
  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  // Agregar búsqueda al historial cuando se realice
  useEffect(() => {
    if (searchTerm && searchTerm.length > 2) {
      addToSearchHistory(searchTerm);
    }
  }, [searchTerm]);

  // Estado para favoritos
  const [favorites, setFavorites] = useState([]);

  // Función para agregar/quitar de favoritos
  const toggleFavorite = (productId) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Función para verificar si un producto es favorito
  const isFavorite = (productId) => favorites.includes(productId);

  // Función para obtener solo favoritos
  const getFavoritesOnly = () => {
    const currentProducts = getCurrentProducts();
    return currentProducts.data.filter(product => favorites.includes(product._id));
  };

  // Función para limpiar favoritos
  const clearFavorites = () => {
    setFavorites([]);
  };

  // Estado para comparación de productos
  const [compareList, setCompareList] = useState([]);
  const maxCompareItems = 4;

  // Función para agregar/quitar producto de comparación
  const toggleCompare = (productId) => {
    setCompareList(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else if (prev.length < maxCompareItems) {
        return [...prev, productId];
      } else {
        // Reemplazar el último elemento si ya hay máximo
        return [...prev.slice(1), productId];
      }
    });
  };

  // Función para verificar si un producto está en comparación
  const isInCompare = (productId) => compareList.includes(productId);

  // Función para obtener productos para comparar
  const getCompareProducts = () => {
    const currentProducts = getCurrentProducts();
    return currentProducts.data.filter(product => compareList.includes(product._id));
  };

  // Función para limpiar comparación
  const clearCompare = () => {
    setCompareList([]);
  };

  // Función para comparar productos
  const compareProducts = () => {
    const productsToCompare = getCompareProducts();
    if (productsToCompare.length < 2) {
      showError('Necesitas al menos 2 productos para comparar');
      return;
    }
    
    // Aquí podrías abrir un modal de comparación o navegar a una página de comparación
  };

  // Función para cambiar modo de vista
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  // Función para obtener productos ordenados y filtrados
  const getDisplayProducts = () => {
    const currentProducts = getCurrentProducts();
    const filteredProducts = filterProducts(currentProducts.data);
    const sortedProducts = sortProducts(filteredProducts);
    
    return {
      all: sortedProducts,
      paginated: getPaginatedProducts().products,
      loading: currentProducts.loading,
      error: currentProducts.error
    };
  };

  // Función para obtener sugerencias de búsqueda
  const getSearchSuggestions = () => {
    const currentProducts = getCurrentProducts();
    const allNames = currentProducts.data.map(p => p.nombre).filter(Boolean);
    const allCategories = currentProducts.data.map(p => p.categoriaId?.nombre || p.categoria).filter(Boolean);
    const allBrands = currentProducts.data.map(p => p.marcaId?.nombre).filter(Boolean);
    
    const suggestions = [...allNames, ...allCategories, ...allBrands];
    return [...new Set(suggestions)].filter(s => 
      s.toLowerCase().includes(searchInput.toLowerCase())
    ).slice(0, 5);
  };

  // Función para obtener filtros disponibles basados en productos actuales
  const getAvailableFilters = () => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    const availableCategories = [...new Set(products.map(p => p.categoriaId?.nombre || p.categoria).filter(Boolean))];
    const availableBrands = [...new Set(products.map(p => p.marcaId?.nombre).filter(Boolean))];
    const availableMaterials = [...new Set(products.map(p => p.material).filter(Boolean))];
    const availableColors = [...new Set(products.map(p => p.color).filter(Boolean))];
    const availableTypes = [...new Set(products.map(p => p.tipoLente).filter(Boolean))];
    
    const priceRange = {
      min: Math.min(...products.map(p => p.precioActual || p.precioBase || p.precioCalculado || 0)),
      max: Math.max(...products.map(p => p.precioActual || p.precioBase || p.precioCalculado || 0))
    };
    
    return {
      categories: availableCategories,
      brands: availableBrands,
      materials: availableMaterials,
      colors: availableColors,
      types: availableTypes,
      priceRange
    };
  };

  // Función para obtener filtros disponibles desde el backend
  const getBackendAvailableFilters = () => {
    // Usar directamente los datos del backend para categorías y marcas
    const availableCategories = categorias?.map(cat => cat.nombre) || [];
    const availableBrands = marcas?.map(marca => marca.nombre) || [];
    
    // Para materiales, colores y tipos, extraer de los productos
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    const availableMaterials = [...new Set(products.map(p => p.material).filter(Boolean))];
    const availableColors = [...new Set(products.map(p => p.color).filter(Boolean))];
    const availableTypes = [...new Set(products.map(p => p.tipoLente).filter(Boolean))];
    
    const priceRange = {
      min: Math.min(...products.map(p => p.precioActual || p.precioBase || p.precioCalculado || 0)),
      max: Math.max(...products.map(p => p.precioActual || p.precioBase || p.precioCalculado || 0))
    };
    
    return {
      categories: availableCategories,
      brands: availableBrands,
      materials: availableMaterials,
      colors: availableColors,
      types: availableTypes,
      priceRange
    };
  };

  // Función para obtener opciones de filtros dinámicas
  const getFilterOptions = () => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    // Obtener opciones únicas de cada filtro
    const categories = [...new Set(products.map(p => p.categoriaId?.nombre || p.categoria).filter(Boolean))];
    const brands = [...new Set(products.map(p => p.marcaId?.nombre).filter(Boolean))];
    const materials = [...new Set(products.map(p => p.material).filter(Boolean))];
    const colors = [...new Set(products.map(p => p.color).filter(Boolean))];
    
    return { categories, brands, materials, colors };
  };

  // Función para obtener opciones de filtros desde el backend
  const getBackendFilterOptions = () => {
    // Usar directamente los datos del backend
    const categories = categorias?.map(cat => cat.nombre) || [];
    const brands = marcas?.map(marca => marca.nombre) || [];
    
    // Para materiales y colores, extraer de los productos
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    const materials = [...new Set(products.map(p => p.material).filter(Boolean))];
    const colors = [...new Set(products.map(p => p.color).filter(Boolean))];
    
    return { categories, brands, materials, colors };
  };

  // Función para obtener el conteo de productos por opción de filtro
  const getFilterOptionCount = (filterType, optionValue) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (filterType) {
      case 'category':
        return products.filter(p => (p.categoriaId?.nombre || p.categoria) === optionValue).length;
      case 'brand':
        return products.filter(p => p.marcaId?.nombre === optionValue).length;
      case 'material':
        return products.filter(p => p.material === optionValue).length;
      case 'color':
        return products.filter(p => p.color === optionValue).length;
      default:
        return 0;
    }
  };

  // Función para obtener el conteo de productos por opción de filtro del backend
  const getBackendFilterOptionCount = (filterType, optionValue) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (filterType) {
      case 'category':
        return products.filter(p => (p.categoriaId?.nombre || p.categoria) === optionValue).length;
      case 'brand':
        return products.filter(p => p.marcaId?.nombre === optionValue).length;
      case 'material':
        return products.filter(p => p.material === optionValue).length;
      case 'color':
        return products.filter(p => p.color === optionValue).length;
      default:
        return 0;
    }
  };

  // Función para aplicar filtros múltiples
  const applyMultipleFilters = (filters) => {
    if (filters.categories) setSelectedCategory(filters.categories);
    if (filters.brands) setSelectedMarca(filters.brands);
    if (filters.priceRange) setPriceRange(filters.priceRange);
    if (filters.sortBy) setSortBy(filters.sortBy);
    setCurrentPage(1);
  };

  // Función para guardar filtros en localStorage
  const saveFiltersToStorage = () => {
    const filters = {
      searchTerm,
      searchInput,
      selectedCategory,
      selectedMarca,
      selectedMaterial,
      selectedColor,
      priceRange,
      sortBy,
      viewMode
    };
    localStorage.setItem('aurora-product-filters', JSON.stringify(filters));
  };

  // Función para cargar filtros desde localStorage
  const loadFiltersFromStorage = () => {
    try {
      const savedFilters = localStorage.getItem('aurora-product-filters');
      if (savedFilters) {
        const filters = JSON.parse(savedFilters);
        const initialSearch = filters.searchTerm || '';
        setSearchTerm(initialSearch);
        setSearchInput(initialSearch);
        setSelectedCategory(filters.selectedCategory || 'todos');
        setSelectedMarca(filters.selectedMarca || 'todos');
        setSelectedMaterial(filters.selectedMaterial || 'todos');
        setSelectedColor(filters.selectedColor || 'todos');
        setPriceRange(filters.priceRange || { min: 0, max: 10000 });
        setSortBy(filters.sortBy || 'nombre');
        setViewMode(filters.viewMode || 'grid');
      }
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  // Cargar filtros guardados al montar el componente
  useEffect(() => {
    loadFiltersFromStorage();
    loadSearchHistory();
  }, []);

  // Guardar filtros cuando cambien
  useEffect(() => {
    saveFiltersToStorage();
  }, [searchTerm, selectedCategory, selectedMarca, selectedMaterial, selectedColor, priceRange, sortBy, viewMode]);

  // Guardar historial de búsqueda cuando cambie
  useEffect(() => {
    saveSearchHistory();
  }, [searchHistory]);

  // Función para obtener estadísticas de filtros
  const getFilterStats = () => {
    const currentProducts = getCurrentProducts();
    const totalProducts = currentProducts.data.length;
    const filteredProducts = filterProducts(currentProducts.data);
    const filteredCount = filteredProducts.length;
    
    return {
      total: totalProducts,
      filtered: filteredCount,
      percentage: totalProducts > 0 ? Math.round((filteredCount / totalProducts) * 100) : 0,
      hasFilters: searchTerm || selectedCategory !== 'todos' || selectedMarca !== 'todos' || 
                 selectedMaterial !== 'todos' || selectedColor !== 'todos' ||
                 priceRange.min > 0 || priceRange.max < 10000
    };
  };

  // Función para obtener estadísticas detalladas de filtros
  const getDetailedFilterStats = () => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    const stats = {
      categories: {},
      brands: {},
      materials: {},
      colors: {},
      priceRanges: {
        '0-100': 0,
        '101-300': 0,
        '301-500': 0,
        '500+': 0
      }
    };
    
    products.forEach(product => {
      const category = product.categoriaId?.nombre || product.categoria;
      const brand = product.marcaId?.nombre;
      const material = product.material;
      const color = product.color;
      const price = product.precioActual || product.precioBase || product.precioCalculado || 0;
      
      if (category) stats.categories[category] = (stats.categories[category] || 0) + 1;
      if (brand) stats.brands[brand] = (stats.brands[brand] || 0) + 1;
      if (material) stats.materials[material] = (stats.materials[material] || 0) + 1;
      if (color) stats.colors[color] = (stats.colors[color] || 0) + 1;
      
      if (price <= 100) stats.priceRanges['0-100']++;
      else if (price <= 300) stats.priceRanges['101-300']++;
      else if (price <= 500) stats.priceRanges['301-500']++;
      else stats.priceRanges['500+']++;
    });
    
    return stats;
  };

  // Función para obtener estadísticas detalladas de filtros desde el backend
  const getBackendDetailedFilterStats = () => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    const stats = {
      categories: {},
      brands: {},
      materials: {},
      colors: {},
      priceRanges: {
        '0-100': 0,
        '101-300': 0,
        '301-500': 0,
        '500+': 0
      }
    };
    
    // Usar datos del backend para categorías y marcas
    categorias?.forEach(cat => {
      stats.categories[cat.nombre] = 0;
    });
    
    marcas?.forEach(marca => {
      stats.brands[marca.nombre] = 0;
    });
    
    // Contar productos en cada categoría y marca
    products.forEach(product => {
      const category = product.categoriaId?.nombre || product.categoria;
      const brand = product.marcaId?.nombre;
      const material = product.material;
      const color = product.color;
      const price = product.precioActual || product.precioBase || product.precioCalculado || 0;
      
      if (category && stats.categories[category] !== undefined) {
        stats.categories[category]++;
      }
      if (brand && stats.brands[brand] !== undefined) {
        stats.brands[brand]++;
      }
      if (material) stats.materials[material] = (stats.materials[material] || 0) + 1;
      if (color) stats.colors[color] = (stats.colors[color] || 0) + 1;
      
      if (price <= 100) stats.priceRanges['0-100']++;
      else if (price <= 300) stats.priceRanges['101-300']++;
      else if (price <= 500) stats.priceRanges['301-500']++;
      else stats.priceRanges['500+']++;
    });
    
    return stats;
  };

  // Función para obtener filtros avanzados
  const getAdvancedFilters = () => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    const advancedFilters = {
      priceRanges: [
        { label: 'Económico ($0 - $100)', min: 0, max: 100, count: 0 },
        { label: 'Medio ($101 - $300)', min: 101, max: 300, count: 0 },
        { label: 'Premium ($301 - $500)', min: 301, max: 500, count: 0 },
        { label: 'Lujo ($500+)', min: 501, max: 10000, count: 0 }
      ],
      discountRanges: [
        { label: 'Sin descuento', min: 0, max: 0, count: 0 },
        { label: 'Descuento bajo (1-20%)', min: 1, max: 20, count: 0 },
        { label: 'Descuento medio (21-40%)', min: 21, max: 40, count: 0 },
        { label: 'Descuento alto (40%+)', min: 41, max: 100, count: 0 }
      ]
    };
    
    // Calcular conteos para rangos de precio
    advancedFilters.priceRanges.forEach(range => {
      range.count = products.filter(p => {
        const price = p.precioActual || p.precioBase || p.precioCalculado || 0;
        return price >= range.min && price <= range.max;
      }).length;
    });
    
    // Calcular conteos para rangos de descuento
    advancedFilters.discountRanges.forEach(range => {
      range.count = products.filter(p => {
        if (!p.precioActual || !p.precioBase) return range.min === 0;
        const discount = ((p.precioBase - p.precioActual) / p.precioBase) * 100;
        return discount >= range.min && discount <= range.max;
      }).length;
    });
    
    return advancedFilters;
  };

  // Función para obtener filtros avanzados desde el backend
  const getBackendAdvancedFilters = () => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    const advancedFilters = {
      priceRanges: [
        { label: 'Económico ($0 - $100)', min: 0, max: 100, count: 0 },
        { label: 'Medio ($101 - $300)', min: 101, max: 300, count: 0 },
        { label: 'Premium ($301 - $500)', min: 301, max: 500, count: 0 },
        { label: 'Lujo ($500+)', min: 501, max: 10000, count: 0 }
      ],
      discountRanges: [
        { label: 'Sin descuento', min: 0, max: 0, count: 0 },
        { label: 'Descuento bajo (1-20%)', min: 1, max: 20, count: 0 },
        { label: 'Descuento medio (21-40%)', min: 21, max: 40, count: 0 },
        { label: 'Descuento alto (40%+)', min: 41, max: 100, count: 0 }
      ]
    };
    
    // Calcular conteos para rangos de precio
    advancedFilters.priceRanges.forEach(range => {
      range.count = products.filter(p => {
        const price = p.precioActual || p.precioBase || p.precioCalculado || 0;
        return price >= range.min && price <= range.max;
      }).length;
    });
    
    // Calcular conteos para rangos de descuento
    advancedFilters.discountRanges.forEach(range => {
      range.count = products.filter(p => {
        if (!p.precioActual || !p.precioBase) return range.min === 0;
        const discount = ((p.precioBase - p.precioActual) / p.precioBase) * 100;
        return discount >= range.min && discount <= range.max;
      }).length;
    });
    
    return advancedFilters;
  };

  // Función para aplicar filtros avanzados
  const applyAdvancedFilter = (filterType, filterValue) => {
    switch (filterType) {
      case 'priceRange':
        setPriceRange({ min: filterValue.min, max: filterValue.max });
        break;
      case 'discountRange':
        // Aplicar filtro de descuento
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  // Función para obtener consejos de filtrado
  const getFilterTips = () => {
    const tips = [
      '💡 Usa múltiples filtros para encontrar exactamente lo que buscas',
      '🔍 La búsqueda funciona con nombre, descripción y características',
      '💰 Los filtros de precio te ayudan a encontrar opciones en tu presupuesto',
      '🎨 Combina colores y materiales para un look personalizado',
      '⭐ Los filtros rápidos te dan acceso a categorías populares',
      '📱 Los filtros se guardan automáticamente para tu próxima visita'
    ];
    
    return tips[Math.floor(Math.random() * tips.length)];
  };



  // Función para obtener recomendaciones personalizadas
  const getPersonalizedRecommendations = () => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    // Basado en favoritos
    const favoriteBrands = favorites.length > 0 ? 
      [...new Set(favorites.map(id => 
        products.find(p => p._id === id)?.marcaId?.nombre
      ).filter(Boolean))] : [];
    
    const favoriteCategories = favorites.length > 0 ? 
      [...new Set(favorites.map(id => 
        products.find(p => p._id === id)?.categoriaId?.nombre || 
        products.find(p => p._id === id)?.categoria
      ).filter(Boolean))] : [];
    
    // Productos similares a favoritos
    const similarProducts = products.filter(p => 
      !favorites.includes(p._id) && (
        favoriteBrands.includes(p.marcaId?.nombre) ||
        favoriteCategories.includes(p.categoriaId?.nombre) ||
        favoriteCategories.includes(p.categoria)
      )
    ).slice(0, 6);
    
    return similarProducts;
  };

  // Función para obtener productos recientemente vistos
  const getRecentlyViewed = () => {
    const recentlyViewedIds = JSON.parse(localStorage.getItem('aurora-recently-viewed') || '[]');
    const currentProducts = getCurrentProducts();
    return currentProducts.data.filter(p => recentlyViewedIds.includes(p._id)).slice(0, 4);
  };

  // Función para agregar producto a recientemente vistos
  const addToRecentlyViewed = (productId) => {
    try {
      const recentlyViewed = JSON.parse(localStorage.getItem('aurora-recently-viewed') || '[]');
      const updated = [productId, ...recentlyViewed.filter(id => id !== productId)].slice(0, 10);
      localStorage.setItem('aurora-recently-viewed', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recently viewed:', error);
    }
  };

  // Función para limpiar recientemente vistos
  const clearRecentlyViewed = () => {
    localStorage.removeItem('aurora-recently-viewed');
  };

  // Función para obtener productos más populares
  const getPopularProducts = () => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    // Simular popularidad basada en precio y descuentos
    const popularProducts = products.map(p => {
      const price = p.precioActual || p.precioBase || p.precioCalculado || 0;
      const discount = p.precioActual && p.precioBase ? 
        ((p.precioBase - p.precioActual) / p.precioBase) * 100 : 0;
      
      return {
        ...p,
        popularityScore: (discount * 2) + (price > 200 ? 1 : 0) + (p.marcaId?.nombre === 'Ray-Ban' ? 2 : 0)
      };
    }).sort((a, b) => b.popularityScore - a.popularityScore).slice(0, 6);
    
    return popularProducts.map(p => {
      const { popularityScore, ...product } = p;
      return product;
    });
  };

  // Función para obtener productos relacionados
  const getRelatedProducts = (currentProduct) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    if (!currentProduct) return [];
    
    const related = products.filter(p => 
      p._id !== currentProduct._id && (
        p.marcaId?.nombre === currentProduct.marcaId?.nombre ||
        p.categoriaId?.nombre === currentProduct.categoriaId?.nombre ||
        p.categoria === currentProduct.categoria ||
        p.material === currentProduct.material ||
        p.color === currentProduct.color
      )
    ).slice(0, 4);
    
    return related;
  };

  // Función para obtener productos por temporada
  const getSeasonalProducts = () => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    const currentMonth = new Date().getMonth();
    const isSummer = currentMonth >= 5 && currentMonth <= 8; // Junio a Septiembre
    const isWinter = currentMonth === 11 || currentMonth <= 2; // Diciembre a Febrero
    
    if (isSummer) {
      return products.filter(p => 
        p.categoriaId?.nombre === 'Lentes de Sol' ||
        p.categoria === 'Lentes de Sol' ||
        p.tipoLente === 'Polarizado'
      ).slice(0, 4);
    } else if (isWinter) {
      return products.filter(p => 
        p.categoriaId?.nombre === 'Lentes Graduados' ||
        p.categoria === 'Lentes Graduados' ||
        p.material === 'Metal'
      ).slice(0, 4);
    }
    
    return products.slice(0, 4); // Productos generales para otras temporadas
  };

  // Función para obtener productos por ocasión
  const getProductsByOccasion = (occasion) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (occasion) {
      case 'deportes':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Deportivos' ||
          p.categoria === 'Lentes Deportivos' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.marcaId?.nombre === 'Costa'
        ).slice(0, 4);
      case 'formal':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Lujo' ||
          p.categoria === 'Lentes de Lujo' ||
          p.marcaId?.nombre === 'Gucci' ||
          p.marcaId?.nombre === 'Tom Ford'
        ).slice(0, 4);
      case 'casual':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.marcaId?.nombre === 'Ray-Ban' ||
          p.marcaId?.nombre === 'Persol'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por presupuesto
  const getProductsByBudget = (budget) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (budget) {
      case 'economico':
        return products.filter(p => 
          (p.precioActual || p.precioBase || p.precioCalculado) <= 100
        ).slice(0, 6);
      case 'medio':
        return products.filter(p => 
          (p.precioActual || p.precioBase || p.precioCalculado) > 100 && 
          (p.precioActual || p.precioBase || p.precioCalculado) <= 300
        ).slice(0, 6);
      case 'premium':
        return products.filter(p => 
          (p.precioActual || p.precioBase || p.precioCalculado) > 300
        ).slice(0, 6);
      default:
        return products.slice(0, 6);
    }
  };

  // Función para obtener productos por edad
  const getProductsByAge = (ageGroup) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (ageGroup) {
      case 'ninos':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Infantiles' ||
          p.categoria === 'Lentes Infantiles' ||
          p.material === 'Plástico' ||
          p.color === 'Azul' ||
          p.color === 'Rosa'
        ).slice(0, 4);
      case 'jovenes':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Deportivos' ||
          p.categoria === 'Lentes Deportivos' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.marcaId?.nombre === 'Ray-Ban'
        ).slice(0, 4);
      case 'adultos':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Lujo' ||
          p.categoria === 'Lentes de Lujo' ||
          p.marcaId?.nombre === 'Gucci' ||
          p.marcaId?.nombre === 'Tom Ford'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por estilo
  const getProductsByStyle = (style) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (style) {
      case 'clasico':
        return products.filter(p => 
          p.marcaId?.nombre === 'Ray-Ban' ||
          p.marcaId?.nombre === 'Persol' ||
          p.material === 'Metal' ||
          p.color === 'Dorado' ||
          p.color === 'Plateado'
        ).slice(0, 4);
      case 'moderno':
        return products.filter(p => 
          p.marcaId?.nombre === 'Oakley' ||
          p.marcaId?.nombre === 'Tom Ford' ||
          p.material === 'Plástico' ||
          p.color === 'Negro' ||
          p.color === 'Azul'
        ).slice(0, 4);
      case 'elegante':
        return products.filter(p => 
          p.marcaId?.nombre === 'Gucci' ||
          p.marcaId?.nombre === 'Prada' ||
          p.categoriaId?.nombre === 'Lentes de Lujo' ||
          p.categoria === 'Lentes de Lujo'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por actividad
  const getProductsByActivity = (activity) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (activity) {
      case 'conduccion':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.tipoLente === 'Polarizado' ||
          p.color === 'Marrón' ||
          p.color === 'Verde'
        ).slice(0, 4);
      case 'deportes':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Deportivos' ||
          p.categoria === 'Lentes Deportivos' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.marcaId?.nombre === 'Costa'
        ).slice(0, 4);
      case 'trabajo':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes para Computadora' ||
          p.categoria === 'Lentes para Computadora' ||
          p.categoriaId?.nombre === 'Lentes Graduados' ||
          p.categoria === 'Lentes Graduados'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por clima
  const getProductsByWeather = (weather) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (weather) {
      case 'soleado':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.tipoLente === 'Polarizado' ||
          p.color === 'Marrón' ||
          p.color === 'Verde'
        ).slice(0, 4);
      case 'nublado':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Graduados' ||
          p.categoria === 'Lentes Graduados' ||
          p.categoriaId?.nombre === 'Lentes para Computadora' ||
          p.categoria === 'Lentes para Computadora'
        ).slice(0, 4);
      case 'lluvioso':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Graduados' ||
          p.categoria === 'Lentes Graduados' ||
          p.material === 'Plástico'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por ocasión especial
  const getProductsBySpecialOccasion = (occasion) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (occasion) {
      case 'boda':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Lujo' ||
          p.categoria === 'Lentes de Lujo' ||
          p.marcaId?.nombre === 'Gucci' ||
          p.marcaId?.nombre === 'Tom Ford' ||
          p.material === 'Metal' ||
          p.color === 'Dorado' ||
          p.color === 'Plateado'
        ).slice(0, 4);
      case 'graduacion':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Lujo' ||
          p.categoria === 'Lentes de Lujo' ||
          p.marcaId?.nombre === 'Prada' ||
          p.marcaId?.nombre === 'Persol'
        ).slice(0, 4);
      case 'cumpleanos':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.marcaId?.nombre === 'Ray-Ban' ||
          p.marcaId?.nombre === 'Oakley'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por temporada
  const getProductsBySeason = (season) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (season) {
      case 'primavera':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.color === 'Verde' ||
          p.color === 'Azul' ||
          p.marcaId?.nombre === 'Ray-Ban'
        ).slice(0, 4);
      case 'verano':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.tipoLente === 'Polarizado' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.marcaId?.nombre === 'Maui Jim'
        ).slice(0, 4);
      case 'otoño':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Graduados' ||
          p.categoria === 'Lentes Graduados' ||
          p.color === 'Marrón' ||
          p.color === 'Negro' ||
          p.marcaId?.nombre === 'Persol'
        ).slice(0, 4);
      case 'invierno':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Graduados' ||
          p.categoria === 'Lentes Graduados' ||
          p.material === 'Metal' ||
          p.marcaId?.nombre === 'Gucci' ||
          p.marcaId?.nombre === 'Tom Ford'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por tendencia
  const getProductsByTrend = (trend) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (trend) {
      case 'retro':
        return products.filter(p => 
          p.marcaId?.nombre === 'Ray-Ban' ||
          p.marcaId?.nombre === 'Persol' ||
          p.material === 'Metal' ||
          p.color === 'Dorado' ||
          p.color === 'Plateado'
        ).slice(0, 4);
      case 'futurista':
        return products.filter(p => 
          p.marcaId?.nombre === 'Oakley' ||
          p.marcaId?.nombre === 'Tom Ford' ||
          p.material === 'Plástico' ||
          p.color === 'Negro' ||
          p.color === 'Azul'
        ).slice(0, 4);
      case 'minimalista':
        return products.filter(p => 
          p.marcaId?.nombre === 'Prada' ||
          p.marcaId?.nombre === 'Persol' ||
          p.material === 'Metal' ||
          p.color === 'Negro' ||
          p.color === 'Plateado'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por color
  const getProductsByColor = (color) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    return products.filter(p => 
      p.color && p.color.toLowerCase() === color.toLowerCase()
    ).slice(0, 6);
  };

  // Función para obtener productos por material
  const getProductsByMaterial = (material) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    return products.filter(p => 
      p.material && p.material.toLowerCase() === material.toLowerCase()
    ).slice(0, 6);
  };

  // Función para obtener productos por tipo de lente
  const getProductsByLensType = (lensType) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    return products.filter(p => 
      p.tipoLente && p.tipoLente.toLowerCase() === lensType.toLowerCase()
    ).slice(0, 6);
  };

  // Función para obtener productos por rango de precio
  const getProductsByPriceRange = (minPrice, maxPrice) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    return products.filter(p => {
      const price = p.precioActual || p.precioBase || p.precioCalculado || 0;
      return price >= minPrice && price <= maxPrice;
    }).slice(0, 6);
  };

  // Función para obtener productos por marca específica
  const getProductsByBrand = (brand) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    return products.filter(p => 
      p.marcaId?.nombre && p.marcaId.nombre.toLowerCase() === brand.toLowerCase()
    ).slice(0, 6);
  };

  // Función para obtener productos por categoría específica
  const getProductsByCategory = (category) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    return products.filter(p => 
      (p.categoriaId?.nombre && p.categoriaId.nombre.toLowerCase() === category.toLowerCase()) ||
      (p.categoria && p.categoria.toLowerCase() === category.toLowerCase())
    ).slice(0, 6);
  };

  // Función para obtener productos con descuento
  const getDiscountedProducts = () => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    return products.filter(p => 
      p.precioActual && p.precioBase && p.precioActual < p.precioBase
    ).sort((a, b) => {
      const discountA = ((a.precioBase - a.precioActual) / a.precioBase) * 100;
      const discountB = ((b.precioBase - b.precioActual) / b.precioBase) * 100;
      return discountB - discountA;
    }).slice(0, 6);
  };

  // Función para obtener productos nuevos
  const getNewProducts = () => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    // Simular productos nuevos (los primeros 6)
    return products.slice(0, 6);
  };

  // Función para obtener productos más vendidos
  const getBestSellers = () => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    // Simular productos más vendidos basado en popularidad
    const bestSellers = products.map(p => {
      const price = p.precioActual || p.precioBase || p.precioCalculado || 0;
      const discount = p.precioActual && p.precioBase ? 
        ((p.precioBase - p.precioActual) / p.precioBase) * 100 : 0;
      
      return {
        ...p,
        salesScore: (discount * 3) + (price > 150 ? 2 : 0) + 
                   (p.marcaId?.nombre === 'Ray-Ban' ? 3 : 0) +
                   (p.marcaId?.nombre === 'Oakley' ? 2 : 0)
      };
    }).sort((a, b) => b.salesScore - a.salesScore).slice(0, 6);
    
    return bestSellers.map(p => {
      const { salesScore, ...product } = p;
      return product;
    });
  };

  // Función para obtener productos recomendados
  const getRecommendedProducts = () => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    // Simular recomendaciones basadas en múltiples factores
    const recommended = products.map(p => {
      const price = p.precioActual || p.precioBase || p.precioCalculado || 0;
      const discount = p.precioActual && p.precioBase ? 
        ((p.precioBase - p.precioActual) / p.precioBase) * 100 : 0;
      
      return {
        ...p,
        recommendationScore: (discount * 2) + (price > 200 ? 1 : 0) + 
                           (p.marcaId?.nombre === 'Gucci' ? 2 : 0) +
                           (p.marcaId?.nombre === 'Tom Ford' ? 2 : 0) +
                           (p.categoriaId?.nombre === 'Lentes de Lujo' ? 1 : 0)
      };
    }).sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 6);
    
    return recommended.map(p => {
      const { recommendationScore, ...product } = p;
      return product;
    });
  };

  // Función para obtener productos por ubicación
  const getProductsByLocation = (location) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (location) {
      case 'playa':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.tipoLente === 'Polarizado' ||
          p.marcaId?.nombre === 'Maui Jim' ||
          p.marcaId?.nombre === 'Costa'
        ).slice(0, 4);
      case 'montaña':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.tipoLente === 'Polarizado' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.marcaId?.nombre === 'Ray-Ban'
        ).slice(0, 4);
      case 'ciudad':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Graduados' ||
          p.categoria === 'Lentes Graduados' ||
          p.categoriaId?.nombre === 'Lentes de Lujo' ||
          p.categoria === 'Lentes de Lujo'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por profesión
  const getProductsByProfession = (profession) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (profession) {
      case 'medico':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Graduados' ||
          p.categoria === 'Lentes Graduados' ||
          p.material === 'Metal' ||
          p.marcaId?.nombre === 'Gucci' ||
          p.marcaId?.nombre === 'Tom Ford'
        ).slice(0, 4);
      case 'abogado':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Lujo' ||
          p.categoria === 'Lentes de Lujo' ||
          p.material === 'Metal' ||
          p.marcaId?.nombre === 'Prada' ||
          p.marcaId?.nombre === 'Persol'
        ).slice(0, 4);
      case 'ingeniero':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes para Computadora' ||
          p.categoria === 'Lentes para Computadora' ||
          p.categoriaId?.nombre === 'Lentes Graduados' ||
          p.categoria === 'Lentes Graduados'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por hobby
  const getProductsByHobby = (hobby) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (hobby) {
      case 'pesca':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Deportivos' ||
          p.categoria === 'Lentes Deportivos' ||
          p.tipoLente === 'Polarizado' ||
          p.marcaId?.nombre === 'Costa' ||
          p.marcaId?.nombre === 'Maui Jim'
        ).slice(0, 4);
      case 'golf':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Deportivos' ||
          p.categoria === 'Lentes Deportivos' ||
          p.tipoLente === 'Polarizado' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.marcaId?.nombre === 'Ray-Ban'
        ).slice(0, 4);
      case 'ciclismo':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Deportivos' ||
          p.categoria === 'Lentes Deportivos' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.material === 'Plástico'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por estilo de vida
  const getProductsByLifestyle = (lifestyle) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (lifestyle) {
      case 'activo':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Deportivos' ||
          p.categoria === 'Lentes Deportivos' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.marcaId?.nombre === 'Costa' ||
          p.material === 'Plástico'
        ).slice(0, 4);
      case 'elegante':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Lujo' ||
          p.categoria === 'Lentes de Lujo' ||
          p.marcaId?.nombre === 'Gucci' ||
          p.marcaId?.nombre === 'Tom Ford' ||
          p.material === 'Metal'
        ).slice(0, 4);
      case 'casual':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.marcaId?.nombre === 'Ray-Ban' ||
          p.marcaId?.nombre === 'Persol'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por ocasión de regalo
  const getProductsByGiftOccasion = (giftOccasion) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (giftOccasion) {
      case 'san_valentin':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Lujo' ||
          p.categoria === 'Lentes de Lujo' ||
          p.marcaId?.nombre === 'Gucci' ||
          p.marcaId?.nombre === 'Tom Ford' ||
          p.color === 'Rojo' ||
          p.color === 'Rosa'
        ).slice(0, 4);
      case 'dia_padre':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.marcaId?.nombre === 'Ray-Ban' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.color === 'Negro' ||
          p.color === 'Azul'
        ).slice(0, 4);
      case 'dia_madre':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Lujo' ||
          p.categoria === 'Lentes de Lujo' ||
          p.marcaId?.nombre === 'Prada' ||
          p.marcaId?.nombre === 'Persol' ||
          p.color === 'Dorado' ||
          p.color === 'Plateado'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por temporada de moda
  const getProductsByFashionSeason = (fashionSeason) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (fashionSeason) {
      case 'primavera_verano':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.tipoLente === 'Polarizado' ||
          p.color === 'Verde' ||
          p.color === 'Azul' ||
          p.color === 'Amarillo'
        ).slice(0, 4);
      case 'otoño_invierno':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Graduados' ||
          p.categoria === 'Lentes Graduados' ||
          p.categoriaId?.nombre === 'Lentes de Lujo' ||
          p.categoria === 'Lentes de Lujo' ||
          p.color === 'Marrón' ||
          p.color === 'Negro' ||
          p.color === 'Gris'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por tipo de rostro
  const getProductsByFaceShape = (faceShape) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (faceShape) {
      case 'redondo':
        return products.filter(p => 
          p.marcaId?.nombre === 'Ray-Ban' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.material === 'Plástico' ||
          p.color === 'Negro' ||
          p.color === 'Azul'
        ).slice(0, 4);
      case 'cuadrado':
        return products.filter(p => 
          p.marcaId?.nombre === 'Persol' ||
          p.marcaId?.nombre === 'Gucci' ||
          p.material === 'Metal' ||
          p.color === 'Dorado' ||
          p.color === 'Plateado'
        ).slice(0, 4);
      case 'ovalado':
        return products.filter(p => 
          p.marcaId?.nombre === 'Tom Ford' ||
          p.marcaId?.nombre === 'Prada' ||
          p.categoriaId?.nombre === 'Lentes de Lujo' ||
          p.categoria === 'Lentes de Lujo'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por tipo de piel
  const getProductsBySkinTone = (skinTone) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (skinTone) {
      case 'clara':
        return products.filter(p => 
          p.marcaId?.nombre === 'Persol' ||
          p.marcaId?.nombre === 'Prada' ||
          p.color === 'Dorado' ||
          p.color === 'Plateado' ||
          p.material === 'Metal'
        ).slice(0, 4);
      case 'media':
        return products.filter(p => 
          p.marcaId?.nombre === 'Ray-Ban' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.color === 'Marrón' ||
          p.color === 'Verde' ||
          p.material === 'Plástico'
        ).slice(0, 4);
      case 'oscura':
        return products.filter(p => 
          p.marcaId?.nombre === 'Gucci' ||
          p.marcaId?.nombre === 'Tom Ford' ||
          p.color === 'Negro' ||
          p.color === 'Azul' ||
          p.material === 'Metal'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por tipo de cabello
  const getProductsByHairColor = (hairColor) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (hairColor) {
      case 'rubio':
        return products.filter(p => 
          p.marcaId?.nombre === 'Persol' ||
          p.marcaId?.nombre === 'Prada' ||
          p.color === 'Dorado' ||
          p.color === 'Plateado' ||
          p.material === 'Metal'
        ).slice(0, 4);
      case 'castaño':
        return products.filter(p => 
          p.marcaId?.nombre === 'Ray-Ban' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.color === 'Marrón' ||
          p.color === 'Verde' ||
          p.material === 'Plástico'
        ).slice(0, 4);
      case 'negro':
        return products.filter(p => 
          p.marcaId?.nombre === 'Gucci' ||
          p.marcaId?.nombre === 'Tom Ford' ||
          p.color === 'Negro' ||
          p.color === 'Azul' ||
          p.material === 'Metal'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por tipo de vestimenta
  const getProductsByClothingStyle = (clothingStyle) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (clothingStyle) {
      case 'formal':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Lujo' ||
          p.categoria === 'Lentes de Lujo' ||
          p.marcaId?.nombre === 'Gucci' ||
          p.marcaId?.nombre === 'Tom Ford' ||
          p.material === 'Metal' ||
          p.color === 'Negro' ||
          p.color === 'Plateado'
        ).slice(0, 4);
      case 'casual':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.marcaId?.nombre === 'Ray-Ban' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.material === 'Plástico' ||
          p.color === 'Azul' ||
          p.color === 'Verde'
        ).slice(0, 4);
      case 'deportivo':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Deportivos' ||
          p.categoria === 'Lentes Deportivos' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.marcaId?.nombre === 'Costa' ||
          p.material === 'Plástico' ||
          p.color === 'Negro' ||
          p.color === 'Rojo'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por tipo de evento
  const getProductsByEventType = (eventType) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (eventType) {
      case 'boda':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Lujo' ||
          p.categoria === 'Lentes de Lujo' ||
          p.marcaId?.nombre === 'Gucci' ||
          p.marcaId?.nombre === 'Tom Ford' ||
          p.material === 'Metal' ||
          p.color === 'Dorado' ||
          p.color === 'Plateado'
        ).slice(0, 4);
      case 'graduacion':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Lujo' ||
          p.categoria === 'Lentes de Lujo' ||
          p.marcaId?.nombre === 'Prada' ||
          p.marcaId?.nombre === 'Persol' ||
          p.material === 'Metal' ||
          p.color === 'Negro' ||
          p.color === 'Plateado'
        ).slice(0, 4);
      case 'cumpleanos':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.marcaId?.nombre === 'Ray-Ban' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.material === 'Plástico' ||
          p.color === 'Azul' ||
          p.color === 'Verde'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por tipo de viaje
  const getProductsByTravelType = (travelType) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (travelType) {
      case 'playa':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.tipoLente === 'Polarizado' ||
          p.marcaId?.nombre === 'Maui Jim' ||
          p.marcaId?.nombre === 'Costa' ||
          p.color === 'Azul' ||
          p.color === 'Verde'
        ).slice(0, 4);
      case 'montaña':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.tipoLente === 'Polarizado' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.marcaId?.nombre === 'Ray-Ban' ||
          p.color === 'Marrón' ||
          p.color === 'Negro'
        ).slice(0, 4);
      case 'ciudad':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Graduados' ||
          p.categoria === 'Lentes Graduados' ||
          p.categoriaId?.nombre === 'Lentes de Lujo' ||
          p.categoria === 'Lentes de Lujo' ||
          p.marcaId?.nombre === 'Gucci' ||
          p.marcaId?.nombre === 'Tom Ford'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por tipo de clima
  const getProductsByClimateType = (climateType) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (climateType) {
      case 'tropical':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.tipoLente === 'Polarizado' ||
          p.marcaId?.nombre === 'Maui Jim' ||
          p.marcaId?.nombre === 'Costa' ||
          p.color === 'Azul' ||
          p.color === 'Verde'
        ).slice(0, 4);
      case 'frio':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Graduados' ||
          p.categoria === 'Lentes Graduados' ||
          p.material === 'Metal' ||
          p.marcaId?.nombre === 'Gucci' ||
          p.marcaId?.nombre === 'Tom Ford' ||
          p.color === 'Negro' ||
          p.color === 'Plateado'
        ).slice(0, 4);
      case 'templado':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes de Sol' ||
          p.categoria === 'Lentes de Sol' ||
          p.marcaId?.nombre === 'Ray-Ban' ||
          p.marcaId?.nombre === 'Persol' ||
          p.color === 'Marrón' ||
          p.color === 'Verde'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para obtener productos por tipo de deporte
  const getProductsBySportType = (sportType) => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    switch (sportType) {
      case 'acuatico':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Deportivos' ||
          p.categoria === 'Lentes Deportivos' ||
          p.tipoLente === 'Polarizado' ||
          p.marcaId?.nombre === 'Costa' ||
          p.marcaId?.nombre === 'Maui Jim' ||
          p.material === 'Plástico' ||
          p.color === 'Azul'
        ).slice(0, 4);
      case 'terrestre':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Deportivos' ||
          p.categoria === 'Lentes Deportivos' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.marcaId?.nombre === 'Ray-Ban' ||
          p.material === 'Plástico' ||
          p.color === 'Negro' ||
          p.color === 'Rojo'
        ).slice(0, 4);
      case 'aereo':
        return products.filter(p => 
          p.categoriaId?.nombre === 'Lentes Deportivos' ||
          p.categoria === 'Lentes Deportivos' ||
          p.marcaId?.nombre === 'Oakley' ||
          p.material === 'Plástico' ||
          p.color === 'Negro' ||
          p.color === 'Azul'
        ).slice(0, 4);
      default:
        return products.slice(0, 4);
    }
  };

  // Función para mostrar modal de producto
  const showProductDetails = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
    // Agregar a recientemente vistos
    addToRecentlyViewed(product._id);
  };

  // Función para cerrar modal de producto
  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  // Función para obtener productos similares al seleccionado
  const getSimilarProducts = (product) => {
    if (!product) return [];
    
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    const similar = products.filter(p => 
      p._id !== product._id && (
        p.marcaId?.nombre === product.marcaId?.nombre ||
        p.categoriaId?.nombre === product.categoriaId?.nombre ||
        p.categoria === product.categoria ||
        p.material === product.material ||
        p.color === product.color ||
        p.tipoLente === product.tipoLente
      )
    ).slice(0, 4);
    
    return similar;
  };

  // Función para obtener productos complementarios
  const getComplementaryProducts = (product) => {
    if (!product) return [];
    
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    // Si es un lente, mostrar accesorios complementarios
    if (product.categoriaId?.nombre === 'Lentes de Sol' || product.categoria === 'Lentes de Sol') {
      return products.filter(p => 
        p.categoriaId?.nombre === 'Accesorios' || p.categoria === 'Accesorios'
      ).slice(0, 3);
    }
    
    // Si es un accesorio, mostrar lentes complementarios
    if (product.categoriaId?.nombre === 'Accesorios' || product.categoria === 'Accesorios') {
      return products.filter(p => 
        p.categoriaId?.nombre === 'Lentes de Sol' || p.categoria === 'Lentes de Sol'
      ).slice(0, 3);
    }
    
    return [];
  };

  // Función para obtener productos por popularidad
  const getProductsByPopularity = () => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    // Simular popularidad basada en múltiples factores
    const popularProducts = products.map(p => {
      const price = p.precioActual || p.precioBase || p.precioCalculado || 0;
      const discount = p.precioActual && p.precioBase ? 
        ((p.precioBase - p.precioActual) / p.precioBase) * 100 : 0;
      
      return {
        ...p,
        popularityScore: (discount * 3) + (price > 150 ? 2 : 0) + 
                       (p.marcaId?.nombre === 'Ray-Ban' ? 3 : 0) +
                       (p.marcaId?.nombre === 'Oakley' ? 2 : 0) +
                       (p.marcaId?.nombre === 'Gucci' ? 2 : 0)
      };
    }).sort((a, b) => b.popularityScore - a.popularityScore).slice(0, 8);
    
    return popularProducts.map(p => {
      const { popularityScore, ...product } = p;
      return product;
    });
  };

  // Función para obtener productos por novedad
  const getProductsByNewness = () => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    // Simular productos nuevos (los primeros 8)
    return products.slice(0, 8);
  };

  // Función para obtener productos por tendencia
  const getProductsByTrending = () => {
    const currentProducts = getCurrentProducts();
    const products = currentProducts.data;
    
    // Simular tendencias basadas en popularidad y descuentos
    const trendingProducts = products.map(p => {
      const price = p.precioActual || p.precioBase || p.precioCalculado || 0;
      const discount = p.precioActual && p.precioBase ? 
        ((p.precioBase - p.precioActual) / p.precioBase) * 100 : 0;
      
      return {
        ...p,
        trendingScore: (discount * 2) + (price > 200 ? 1 : 0) + 
                      (p.marcaId?.nombre === 'Tom Ford' ? 3 : 0) +
                      (p.marcaId?.nombre === 'Prada' ? 2 : 0) +
                      (p.categoriaId?.nombre === 'Lentes de Lujo' ? 2 : 0)
      };
    }).sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 6);
    
    return trendingProducts.map(p => {
      const { trendingScore, ...product } = p;
      return product;
    });
  };

  // Función para cerrar modal (ya definida arriba)

  // Función para formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Función para obtener imagen del producto
  const getProductImage = (product) => {
    if (product && product.imagenes && product.imagenes.length > 0) {
      const first = product.imagenes[0];
      // Evitar retornar cadena vacía que causa warning en <img src>
      if (first && typeof first === 'string' && first.trim() !== '') {
        return first;
      }
      return null;
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

  // Sección de filtros (JSX constante para evitar remount y pérdida de foco)
  const filterSection = (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filtros</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-[#0097c2] hover:text-[#0077a2] font-medium"
        >
          Limpiar filtros
        </button>
      </div>
      
      {/* Búsqueda con sugerencias */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar productos</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, descripción, material..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097c2]"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
        {/* Sugerencias de búsqueda */}
        {searchInput && searchInput.length > 1 && (
          <div className="mt-2 text-xs text-gray-500">
            Sugerencias: {getSearchSuggestions().slice(0, 3).join(', ')}
          </div>
        )}

        {/* Historial de búsquedas */}
        {searchHistory.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">Búsquedas recientes:</div>
            <div className="flex flex-wrap gap-1">
              {searchHistory.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => useSearchFromHistory(search)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  {search}
                </button>
              ))}
              {searchHistory.length > 5 && (
                <button
                  onClick={clearSearchHistory}
                  className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        )}
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
          {getBackendFilterOptions().brands.map(brand => (
            <option key={brand} value={brand}>
              {brand} ({getBackendFilterOptionCount('brand', brand)})
            </option>
          ))}
        </select>
      </div>

      {/* Material */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
        <select
          value={selectedMaterial || 'todos'}
          onChange={(e) => setSelectedMaterial(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097c2]"
        >
          <option value="todos">Todos los materiales</option>
          {getBackendFilterOptions().materials.map(material => (
            <option key={material} value={material}>
              {material} ({getBackendFilterOptionCount('material', material)})
            </option>
          ))}
        </select>
      </div>

      {/* Color */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <select
          value={selectedColor || 'todos'}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097c2]"
        >
          <option value="todos">Todos los colores</option>
          {getBackendFilterOptions().colors.map(color => (
            <option key={color} value={color}>
              {color} ({getFilterOptionCount('color', color)})
            </option>
          ))}
        </select>
      </div>

      {/* Filtros avanzados */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Rangos de precio</label>
        <div className="space-y-2">
          {getBackendAdvancedFilters().priceRanges.map((range, index) => (
            <button
              key={index}
              onClick={() => applyAdvancedFilter('priceRange', range)}
              className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
            >
              <div className="flex justify-between items-center">
                <span>{range.label}</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                  {range.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Rango de precio con slider visual */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rango de precio: ${priceRange.min} - ${priceRange.max}
        </label>
        <div className="flex space-x-2 mb-2">
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
        {/* Slider visual del rango de precio */}
        <div className="relative">
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-[#0097c2] rounded-full"
              style={{
                width: `${((priceRange.max - priceRange.min) / 10000) * 100}%`,
                marginLeft: `${(priceRange.min / 10000) * 100}%`
              }}
            ></div>
          </div>
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
          <option value="nombre">Nombre A-Z</option>
          <option value="precio-asc">Precio: Menor a Mayor</option>
          <option value="precio-desc">Precio: Mayor a Menor</option>
          <option value="marca">Marca A-Z</option>
        </select>
      </div>

      {/* Vista */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Vista</label>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-[#0097c2] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            title="Vista de cuadrícula"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-[#0097c2] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            title="Vista de lista"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filtros activos */}
      {getActiveFilters().length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Filtros activos:</h4>
          <div className="flex flex-wrap gap-2">
            {getActiveFilters().map((filter, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {filter}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );

  // Componente de producto en vista grid
  const ProductGridItem = ({ product, currentType }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        {(() => { const src = getProductImage(product); return src ? (
          <img 
            src={src} 
            alt={product.nombre} 
            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            Sin imagen
          </div>
        ); })()}
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

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => {
              if (currentType === 'personalizables' || product.categoria === 'Personalizado') {
                openSolicitudModal(product);
              } else {
                handleAddToCart(product, 1);
              }
            }}
            className="w-full bg-emerald-600 text-white py-2 rounded-full hover:bg-emerald-700 transition-colors duration-300"
          >
            {currentType === 'personalizables' || product.categoria === 'Personalizado' ? 'Personalizar' : 'Agregar'}
          </button>
          <button 
            onClick={() => showProductDetails(product)}
            className="w-full bg-[#0097c2] text-white py-2 rounded-full hover:bg-[#0077a2] transition-colors duration-300"
          >
            Ver detalles
          </button>
        </div>
      </div>

      {showSolicitudModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm md:backdrop-blur"> 
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Solicitud de producto personalizado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Nombre</label>
                <input name="nombre" value={solicitudForm.nombre} onChange={handleSolicitudChange} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Tipo de lente</label>
                <input name="tipoLente" value={solicitudForm.tipoLente} onChange={handleSolicitudChange} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Material</label>
                <input name="material" value={solicitudForm.material} onChange={handleSolicitudChange} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Color</label>
                <input name="color" value={solicitudForm.color} onChange={handleSolicitudChange} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600">Descripción</label>
                <textarea name="descripcion" value={solicitudForm.descripcion} onChange={handleSolicitudChange} className="w-full border rounded-lg px-3 py-2" rows={3} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600">Instrucciones adicionales</label>
                <textarea name="instruccionesAdicionales" value={solicitudForm.instruccionesAdicionales} onChange={handleSolicitudChange} className="w-full border rounded-lg px-3 py-2" rows={2} />
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setShowSolicitudModal(false)} className="px-4 py-2 rounded-lg border">Cancelar</button>
              <button onClick={handleCrearSolicitudPersonalizada} className="px-4 py-2 rounded-lg bg-[#0097c2] text-white">Crear solicitud</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Componente de producto en vista lista
  const ProductListItem = ({ product, currentType }) => (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center space-x-4">
        {(() => { const src = getProductImage(product); return src ? (
          <img 
            src={src} 
            alt={product.nombre} 
            className="w-24 h-24 object-cover rounded-lg"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">Sin imagen</div>
        ); })()}
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
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if (currentType === 'personalizables' || product.categoria === 'Personalizado') {
                    openSolicitudModal(product);
                  } else {
                    handleAddToCart(product, 1);
                  }
                }}
                className="bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition-colors duration-300"
              >
                {currentType === 'personalizables' || product.categoria === 'Personalizado' ? 'Personalizar' : 'Agregar'}
              </button>
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
    </div>
  );

  // Modal de detalles del producto
  const ProductDetailModal = () => {
    if (!selectedProduct) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-white/10 backdrop-blur-sm md:backdrop-blur">
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
                {(() => { const src = getProductImage(selectedProduct); return src ? (
                  <img 
                    src={src} 
                    alt={selectedProduct.nombre} 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">Sin imagen</div>
                ); })()}
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
                  <button 
                    className="bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition-colors duration-300"
                    onClick={() => {
                      if (location.pathname === '/productos/personalizables') {
                        setShowProductModal(false);
                        navigate('/cotizaciones/crear', { state: { openPersonalizado: true } });
                      } else {
                        handleAddToCart(selectedProduct, 1);
                        setShowProductModal(false);
                      }
                    }}
                  >
                    {location.pathname === '/productos/personalizables' ? 'Personalizar' : 'Agregar al carrito'}
                  </button>
                  <button 
                    className="bg-white border border-[#0097c2] text-[#0097c2] px-4 py-2 rounded-full hover:bg-[#e6f7fb] transition-colors duration-300"
                    onClick={() => openSolicitudModal(selectedProduct)}
                  >
                    Solicitar a óptica
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
    
    const renderContent = () => {
    const currentProducts = getCurrentProducts();
    const loading = currentProducts.loading;
    const error = currentProducts.error;
    const filteredProducts = filterProducts(currentProducts.data);
    const sortedProducts = sortProducts(filteredProducts);
    const pagination = currentProducts.pagination;
    const type = currentProducts.type;

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
            {filterSection}
          </div>

          {/* Productos */}
          <div className="lg:w-1/2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                {getTitle()}
              </h2>
              <div className="text-gray-600">
                {(pagination?.total ?? sortedProducts.length)} producto{(pagination?.total ?? sortedProducts.length) !== 1 ? 's' : ''} encontrado{(pagination?.total ?? sortedProducts.length) !== 1 ? 's' : ''}
              </div>
            </div>







            {loading ? (
              <LoadingSpinner message={`Cargando ${getTitle().toLowerCase()}...`} />
            ) : error ? (
              <ErrorMessage 
                error={error} 
                onRetry={() => window.location.reload()}
              />
            ) : (type !== 'personalizables' && filteredProducts.length === 0) ? (
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
              <>
                {type === 'personalizables' ? (
                  <div className="bg-white rounded-xl shadow-md p-6 border border-dashed border-[#0097c2]">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-[#0097c2] text-white flex items-center justify-center text-2xl">✨</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">Crea tu Producto Personalizado</h3>
                        <p className="text-gray-600 text-sm">Elige base, materiales, color, tipo de lente y modificaciones del catálogo.</p>
                      </div>
                      <button
                        onClick={() => navigate('/cotizaciones/crear', { state: { openPersonalizado: true } })}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-full hover:bg-emerald-700 transition-colors"
                      >
                        Personalizar ahora
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                    : "space-y-4"
                  }>
                    {sortedProducts.map((product) => (
                      <div key={product._id}>
                        {viewMode === 'grid' ? (
                          <ProductGridItem product={product} currentType={type} />
                        ) : (
                          <ProductListItem product={product} currentType={type} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Server-side Pagination Controls */}
                {(type === 'lentes' || type === 'accesorios') && pagination?.totalPages > 1 && (
                  <Pagination
                    currentPage={(type === 'lentes' ? pageLentes : pageAccesorios) - 1}
                    totalPages={pagination.totalPages}
                    goToFirstPage={() => (type === 'lentes' ? setPageLentes(1) : setPageAccesorios(1))}
                    goToPreviousPage={() => (type === 'lentes'
                      ? setPageLentes(prev => Math.max(1, prev - 1))
                      : setPageAccesorios(prev => Math.max(1, prev - 1)))}
                    goToNextPage={() => (type === 'lentes'
                      ? setPageLentes(prev => Math.min(pagination.totalPages, prev + 1))
                      : setPageAccesorios(prev => Math.min(pagination.totalPages, prev + 1)))}
                    goToLastPage={() => (type === 'lentes' ? setPageLentes(pagination.totalPages) : setPageAccesorios(pagination.totalPages))}
                    pageSize={pageSize}
                    setPageSize={(size) => {
                      setPageSize(size);
                      if (type === 'lentes') setPageLentes(1); else setPageAccesorios(1);
                    }}
                  />
                )}
              </>
            )}
          </div>

          {/* Sidebar derecha: anuncio de personalizados */}
          <div className="lg:w-1/4">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-md p-6 border border-[#0097c2]/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#0097c2] text-white flex items-center justify-center text-xl">✨</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">¿Buscas algo único?</h3>
                    <p className="text-gray-600 text-sm mb-4">Crea tu producto personalizado eligiendo base, materiales, color y más.</p>
                    <button
                      onClick={() => navigate('/cotizaciones/crear', { state: { openPersonalizado: true } })}
                      className="w-full bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition-colors"
                    >
                      Personalizar ahora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
    <PageTransition>
      <Navbar />
      {/* Toasts */}
      <ToastContainer>
        <Alert 
          type={alertState.type}
          message={alertState.message}
          show={alertState.show}
          onClose={hideAlert}
          duration={alertState.duration}
        />
      </ToastContainer>

      {renderContent()}

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
