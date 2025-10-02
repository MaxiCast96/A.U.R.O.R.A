import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Share2, Heart, ShoppingCart, Package, Truck, Shield, CheckCircle, Star, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

const ProductPage = ({ productId = '64f7b2c8a1b2c3d4e5f6g7h8' }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://aurora-production-7e57.up.railway.app/api/lentes/${productId}`);
        if (!response.ok) throw new Error('Producto no encontrado');
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handlePrevImage = () => {
    if (product?.imagenes?.length > 1) {
      setSelectedImage(prev => prev === 0 ? product.imagenes.length - 1 : prev - 1);
    }
  };

  const handleNextImage = () => {
    if (product?.imagenes?.length > 1) {
      setSelectedImage(prev => prev === product.imagenes.length - 1 ? 0 : prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-gray-200 rounded-2xl"></div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                <div className="h-12 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Producto no encontrado</h3>
          <p className="text-gray-500 mb-6">El producto que buscas no existe o ha sido removido</p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  const discount = product.enPromocion && product.precioBase > product.precioActual 
    ? Math.round(100 - (product.precioActual / product.precioBase * 100))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a productos
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              {discount > 0 && (
                <div className="absolute top-6 left-6 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  -{discount}% OFF
                </div>
              )}
              
              {product.imagenes && product.imagenes.length > 0 ? (
                <>
                  <img
                    src={product.imagenes[selectedImage]}
                    alt={product.nombre}
                    className="w-full h-full object-contain p-8"
                  />
                  
                  {/* Navigation arrows */}
                  {product.imagenes.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-600" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <Eye className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.imagenes && product.imagenes.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.imagenes.map((imagen, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all ${
                      selectedImage === index
                        ? 'border-cyan-500 ring-2 ring-cyan-200'
                        : 'border-gray-200 hover:border-cyan-300'
                    }`}
                  >
                    <img
                      src={imagen}
                      alt={`${product.nombre} ${index + 1}`}
                      className="w-full h-full object-contain p-2 bg-white"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Title & Brand */}
            <div>
              {product.marca && (
                <span className="inline-block bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                  {product.marca}
                </span>
              )}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {product.nombre}
              </h1>
              {product.descripcion && (
                <p className="text-lg text-gray-600 leading-relaxed">
                  {product.descripcion}
                </p>
              )}
            </div>

            {/* Categories */}
            {product.categorias && product.categorias.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.categorias.map((categoria, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {categoria}
                  </span>
                ))}
              </div>
            )}

            {/* Price */}
            <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-2xl p-6 border border-cyan-200">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                    ${product.precioActual?.toFixed(2)}
                  </span>
                  {product.precioBase && product.precioBase > product.precioActual && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg text-gray-400 line-through">
                        ${product.precioBase.toFixed(2)}
                      </span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-semibold">
                        Ahorras ${(product.precioBase - product.precioActual).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                {discount > 0 && (
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-sm font-bold">-{discount}%</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <label className="text-lg font-semibold text-gray-900">Cantidad</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-l-xl transition-colors"
                  >
                    -
                  </button>
                  <span className="w-16 h-12 flex items-center justify-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-r-xl transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg">
                <ShoppingCart className="w-5 h-5" />
                Agregar al Carrito
              </button>
              
              <div className="flex gap-3">
                <button className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl border border-gray-300 hover:border-cyan-300 transition-all flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5" />
                  Favoritos
                </button>
                <button className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl border border-gray-300 hover:border-cyan-300 transition-all flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Compartir
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">¿Por qué elegir este producto?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Envío Gratis</div>
                    <div className="text-sm text-gray-600">En pedidos +$500</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Garantía</div>
                    <div className="text-sm text-gray-600">12 meses</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Calidad</div>
                    <div className="text-sm text-gray-600">Certificada</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Entrega</div>
                    <div className="text-sm text-gray-600">24-48 horas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Especificaciones del Producto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Información General</h3>
              <div className="space-y-3">
                {product.marca && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Marca:</span>
                    <span className="font-medium text-gray-900">{product.marca}</span>
                  </div>
                )}
                {product.modelo && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Modelo:</span>
                    <span className="font-medium text-gray-900">{product.modelo}</span>
                  </div>
                )}
                {product.material && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Material:</span>
                    <span className="font-medium text-gray-900">{product.material}</span>
                  </div>
                )}
                {product.genero && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Género:</span>
                    <span className="font-medium text-gray-900">{product.genero}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Detalles Técnicos</h3>
              <div className="space-y-3">
                {product.color && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium text-gray-900">{product.color}</span>
                  </div>
                )}
                {product.tipoLente && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Tipo de Lente:</span>
                    <span className="font-medium text-gray-900">{product.tipoLente}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Stock:</span>
                  <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;