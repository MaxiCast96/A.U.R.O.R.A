import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import API_CONFIG from '../../config/api';
import { useAuth } from '../../components/auth/AuthContext';
import WompiTokenPayment from '../../components/payments/WompiTokenPayment';

const Cart = () => {
  const { cart, itemCount, total, removeItem, updateQty, clearCart, loading } = useCart();
  const { user, token } = useAuth();

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [wompiTxId, setWompiTxId] = useState(null);
  const wompiRef = useRef(null);
  const qtyTimers = useRef(new Map());
  const [fieldErrors, setFieldErrors] = useState({});
  const [productInfoMap, setProductInfoMap] = useState({}); // productoId -> { nombre, imagenes, imagen }
  // Se removieron campos de configuración y datos adicionales del UI

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    sucursalId: '',
    empleadoId: '',
    metodoPago: 'efectivo',
    montoPagado: '',
    emailPago: '',
    telefonoCliente: '',
    nombreCliente: '',
    duiCliente: '',
    direccion: { calle: '', ciudad: '', departamento: '' },
    observaciones: '', // Observaciones removidas del UI
    fecha: today, // YYYY-MM-DD
    estado: 'pendiente'
  });

  const montoTotal = useMemo(() => Number(total || 0), [total]);

  const formatUSD = useMemo(() => new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }), []);

  const isElectronic = useMemo(
    () => form.metodoPago === 'tarjeta_credito' || form.metodoPago === 'tarjeta_debito' || form.metodoPago === 'transferencia',
    [form.metodoPago]
  );

  useEffect(() => {
    // No auto-prefill: solo invalidar transacción si cambia el total
    setWompiTxId(null);
    setSuccess(null);
  }, [montoTotal]);

  // No auto-prefill de datos de facturación desde BD por solicitud del usuario

  // No auto-asignar empleadoId

  useEffect(() => {
    // Fetch sucursales for selection (sin seleccionar por defecto)
    const fetchSucursales = async () => {
      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUCURSALES}`, { credentials: 'include' });
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setSucursales(list);
      } catch (e) {
        if (!import.meta.env.PROD) console.error('Error cargando sucursales', e);
      }
    };
    fetchSucursales();
  }, []);

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }), [token]);

  // Enriquecer items del carrito (solo para display) si faltan nombre/imagen
  useEffect(() => {
    const enrichMissing = async () => {
      const items = (cart?.productos || []).filter(p => {
        const hasName = Boolean(p?.nombre || p?.producto?.nombre || productInfoMap[p.productoId]?.nombre);
        const hasImg = Boolean(
          p?.imagen || (Array.isArray(p?.imagenes) && p.imagenes[0]) ||
          p?.producto?.imagen || (Array.isArray(p?.producto?.imagenes) && p.producto.imagenes[0]) ||
          productInfoMap[p.productoId]?.imagen || (Array.isArray(productInfoMap[p.productoId]?.imagenes) && productInfoMap[p.productoId].imagenes[0])
        );
        return !(hasName && hasImg);
      });
      for (const it of items) {
        const id = String(it.productoId || it._id || '');
        if (!id || productInfoMap[id]) continue;
        const tryFetch = async (endpoint) => {
          const res = await fetch(`${API_CONFIG.BASE_URL}${endpoint}/${id}`, { credentials: 'include' });
          if (!res.ok) return null;
          const data = await res.json();
          return data?.data || data || null;
        };
        let info = await tryFetch(API_CONFIG.ENDPOINTS.LENTES);
        if (!info) info = await tryFetch(API_CONFIG.ENDPOINTS.ACCESORIOS);
        if (!info) info = await tryFetch(API_CONFIG.ENDPOINTS.PRODUCTOS_PERSONALIZADOS);
        if (info && (info.nombre || info?.nombreProducto || info?.producto?.nombre)) {
          setProductInfoMap(prev => ({ ...prev, [id]: info }));
        }
      }
    };
    if (cart?.productos?.length) enrichMissing();
  }, [cart?.productos, API_CONFIG.BASE_URL]);

  // Detectar si un producto del carrito es un personalizado consultando al backend
  const isPersonalizedProduct = async (id) => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTOS_PERSONALIZADOS}/${id}`, { credentials: 'include' });
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data && (data._id || data?.data?._id));
    } catch (e) {
      return false;
    }
  };

  // Vincular pedidoId a personalizados si el backend devuelve un identificador de pedido en la venta
  const patchPedidoOnPersonalizados = async (pedidoId) => {
    if (!pedidoId) return;
    try {
      // Detectar qué items del carrito son personalizados
      const personalizedFlags = await Promise.all((cart?.productos || []).map(p => isPersonalizedProduct(p.productoId)));
      const personalizedIds = (cart?.productos || [])
        .filter((_, idx) => personalizedFlags[idx])
        .map(p => p.productoId);
      if (personalizedIds.length === 0) return;

      await Promise.all(personalizedIds.map(async (id) => {
        try {
          await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTOS_PERSONALIZADOS}/${id}/vinculos`, {
            method: 'PATCH',
            headers: authHeaders,
            credentials: 'include',
            body: JSON.stringify({ pedidoId }),
          });
        } catch (e) {
          if (!import.meta.env.PROD) console.warn('No se pudo vincular pedidoId al personalizado', id, e);
        }
      }));
    } catch (e) {
      if (!import.meta.env.PROD) console.warn('Fallo al procesar vinculación de pedidoId en personalizados', e);
    }
  };

  const handleQtyChange = (id, value) => {
    const qty = Math.max(1, Number(value) || 1);
    // Debounce updates per item to reduce API chatter
    const key = String(id);
    const prev = qtyTimers.current.get(key);
    if (prev) clearTimeout(prev);
    const t = setTimeout(() => {
      updateQty(id, qty);
      qtyTimers.current.delete(key);
    }, 300);
    qtyTimers.current.set(key, t);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('direccion.')) {
      const key = name.split('.')[1];
      setForm((f) => ({ ...f, direccion: { ...f.direccion, [key]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
      if (name === 'metodoPago') {
        // Al cambiar método de pago, limpiar estado de Wompi
        setWompiTxId(null);
        setSuccess(null);
      }
    }
  };

  // No auto-ajustar monto pagado; validar al confirmar

  const handleCreateVenta = async (opts = {}) => {
    const passedTxId = opts.txId || null;
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    if (!cart?._id) {
      setError('No hay carrito activo.');
      return;
    }
    if (!form.sucursalId) {
      setError('Selecciona una sucursal.');
      setFieldErrors((e) => ({ ...e, sucursalId: 'Selecciona una sucursal.' }));
      return;
    }
    if (!user?.id) {
      setError('Debes iniciar sesión.');
      return;
    }
    if (!form.metodoPago) {
      setError('Selecciona el método de pago.');
      setFieldErrors((e) => ({ ...e, metodoPago: 'Selecciona el método de pago.' }));
      return;
    }
    // Para métodos electrónicos, se requiere procesar con Wompi; el monto y número de transacción los derivamos
    const requiereWompi = (form.metodoPago === 'tarjeta_credito' || form.metodoPago === 'tarjeta_debito' || form.metodoPago === 'transferencia');
    const effectiveTxId = passedTxId || wompiTxId || null;
    if (requiereWompi && !effectiveTxId) {
      setError('Primero realiza el pago con tarjeta/transferencia (Wompi).');
      return;
    }
    const billingErrors = {};
    if (!form.nombreCliente) billingErrors.nombreCliente = 'Ingresa tu nombre completo.';
    if (!form.duiCliente) billingErrors.duiCliente = 'Ingresa tu DUI.';
    // telefonoCliente no es obligatorio para el backend
    if (!form.direccion.calle) billingErrors['direccion.calle'] = 'Ingresa la calle.';
    if (!form.direccion.ciudad) billingErrors['direccion.ciudad'] = 'Ingresa la ciudad.';
    if (!form.direccion.departamento) billingErrors['direccion.departamento'] = 'Ingresa el departamento.';
    if (Object.keys(billingErrors).length) {
      setFieldErrors(billingErrors);
      setError('Completa los datos de facturación.');
      return;
    }

    // Calcular montoPagado automáticamente si no se ingresó
    const montoPagadoNum = (form.montoPagado !== '' && !Number.isNaN(Number(form.montoPagado))) ? Number(form.montoPagado) : montoTotal;
    const cambio = Math.max(0, Number(montoPagadoNum) - montoTotal);
    const payload = {
      carritoId: cart._id,
      empleadoId: form.empleadoId || undefined,
      sucursalId: form.sucursalId,
      fecha: form.fecha ? new Date(form.fecha).toISOString() : new Date().toISOString(),
      estado: form.estado || 'pendiente',
      datosPago: {
        metodoPago: form.metodoPago,
        montoPagado: Number(montoPagadoNum),
        montoTotal: montoTotal,
        cambio,
        numeroTransaccion: form.metodoPago === 'efectivo' || form.metodoPago === 'cheque' ? undefined : (effectiveTxId || `TX-${Date.now()}`)
      },
      facturaDatos: {
        // El backend valida numeroFactura como obligatorio; generamos uno temporal
        numeroFactura: `FAC-${Date.now()}`,
        clienteId: user.id,
        nombreCliente: form.nombreCliente,
        duiCliente: form.duiCliente,
        direccionCliente: {
          calle: form.direccion.calle,
          ciudad: form.direccion.ciudad,
          departamento: form.direccion.departamento,
        },
        subtotal: montoTotal,
        total: montoTotal,
      },
      observaciones: form.observaciones || undefined,
    };

    setCreating(true);
    try {
      if (!import.meta.env.PROD) {
        console.groupCollapsed('[Ventas] Payload enviado a /ventas');
        console.log(JSON.stringify(payload, null, 2));
        console.groupEnd();
      }
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VENTAS}`, {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        // Extraer posible identificador de pedido de la respuesta
        const venta = data?.venta || data?.data || data;
        const possiblePedidoId = venta?.pedidoId || venta?.pedido?._id || data?.pedidoId || data?.pedido?._id;
        // Intentar vincular pedidoId a personalizados antes de limpiar el carrito
        if (possiblePedidoId) {
          await patchPedidoOnPersonalizados(possiblePedidoId);
        }

        setSuccess('Venta creada correctamente.');
        // Vaciar carrito tras venta exitosa
        await clearCart();
      } else {
        setError(data?.message || 'Error creando la venta.');
      }
    } catch (e) {
      if (!import.meta.env.PROD) console.error('Error creando venta', e);
      setError('Error de red creando la venta.');
    } finally {
      setCreating(false);
    }
  };


  const buildCotizacionPayload = async () => {
    const productos = [];
    for (const item of (cart?.productos || [])) {
      const personalizado = await isPersonalizedProduct(item.productoId);
      productos.push({
        productoId: personalizado ? undefined : item.productoId,
        tipo: personalizado ? 'personalizado' : 'otro',
        nombre: item.nombre,
        categoria: personalizado ? 'Personalizado' : (item.categoria || 'Otros'),
        cantidad: item.cantidad || 1,
        precioUnitario: item.precio || 0,
        customizaciones: [],
        subtotal: (item.precio || 0) * (item.cantidad || 1),
      });
    }
    const fecha = new Date();
    const validaHasta = new Date(fecha);
    validaHasta.setDate(validaHasta.getDate() + 30);
    return {
      clienteId: user.id,
      correoCliente: form.emailPago || undefined,
      telefonoCliente: form.telefonoCliente,
      fecha: fecha.toISOString(),
      productos,
      total: productos.reduce((s, p) => s + (p.subtotal || 0), 0),
      validaHasta: validaHasta.toISOString(),
      estado: 'pendiente',
      observaciones: form.observaciones || undefined,
    };
  };

  const createCotizacionAndPatchPersonalizados = async () => {
    // Verificar si hay al menos un personalizado
    const personalizedFlags = await Promise.all((cart?.productos || []).map(p => isPersonalizedProduct(p.productoId)));
    const hasPersonalized = personalizedFlags.some(Boolean);
    if (!hasPersonalized) return null;

    // Crear cotización
    const cotPayload = await buildCotizacionPayload();
    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COTIZACIONES}`, {
      method: 'POST',
      headers: authHeaders,
      credentials: 'include',
      body: JSON.stringify(cotPayload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || 'Error creando la cotización');
    }
    const cot = data?.cotizacion || data?.data || data; // compatibilidad

    // Vincular personalizados con la cotización y actualizar estado
    const personalizedIds = (cart?.productos || [])
      .filter((_, idx) => personalizedFlags[idx])
      .map(p => p.productoId);

    await Promise.all(personalizedIds.map(async (id) => {
      try {
        await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTOS_PERSONALIZADOS}/${id}/vinculos`, {
          method: 'PATCH',
          headers: authHeaders,
          credentials: 'include',
          body: JSON.stringify({ estado: 'en_proceso', cotizacionId: cot._id }),
        });
      } catch (e) {
        if (!import.meta.env.PROD) console.warn('No se pudo actualizar personalizado', id, e);
      }
    }));

    return cot;
  };

  // Botón unificado: si es electrónico, paga con Wompi y luego crea la venta; si no, solo crea la venta
  const handlePayAndCreate = async () => {
    setError(null);
    setSuccess(null);
    try {
      setCreating(true);
      let txIdToUse = null;
      if (isElectronic) {
        if (!wompiRef.current) {
          setError('Componente de pago no disponible.');
          setCreating(false);
          return;
        }
        const res = await wompiRef.current.pay();
        if (!res?.ok) {
          setError(res?.error || 'Pago Wompi fallido.');
          setCreating(false);
          return;
        }
        txIdToUse = res.transactionId || null;
        setWompiTxId(txIdToUse);
      }
      // Crear Cotización y vincular personalizados si aplica
      try {
        await createCotizacionAndPatchPersonalizados();
      } catch (e) {
        if (!import.meta.env.PROD) console.error('Fallo creando cotización', e);
      }
      // Luego crear la venta
      await handleCreateVenta({ txId: txIdToUse });
    } catch (e) {
      if (!import.meta.env.PROD) console.error('Error en flujo de pago y creación', e);
      setError('Ocurrió un error procesando el pago.');
    } finally {
      setCreating(false);
    }
  };

  // Obtener un nombre legible del producto con múltiples posibles campos
  const getDisplayName = (p) => {
    if (!p) return 'Producto';
    const candidates = [];
    // Direct fields on cart item
    if (typeof p.nombre === 'string') candidates.push(p.nombre);
    if (typeof p.titulo === 'string') candidates.push(p.titulo);
    if (typeof p.nombreProducto === 'string') candidates.push(p.nombreProducto);
    if (typeof p.descripcion === 'string') candidates.push(p.descripcion);
    // Nested producto
    const pr = p.producto || {};
    if (typeof pr.nombre === 'string') candidates.push(pr.nombre);
    if (typeof pr.titulo === 'string') candidates.push(pr.titulo);
    if (typeof pr.nombreProducto === 'string') candidates.push(pr.nombreProducto);
    if (typeof pr.descripcion === 'string') candidates.push(pr.descripcion);
    // Enriched info
    const enrichId = p?.productoId || p?._id || pr?._id;
    const enriched = enrichId ? productInfoMap[enrichId] : null;
    if (enriched) {
      if (typeof enriched.nombre === 'string') candidates.push(enriched.nombre);
      if (typeof enriched.nombreProducto === 'string') candidates.push(enriched.nombreProducto);
      if (typeof enriched.titulo === 'string') candidates.push(enriched.titulo);
      if (typeof enriched.descripcion === 'string') candidates.push(enriched.descripcion);
      if (typeof enriched?.producto?.nombre === 'string') candidates.push(enriched.producto.nombre);
    }
    const name = candidates.find(v => typeof v === 'string' && v.trim().length > 0);
    return name ? name.trim() : 'Producto';
  };

  // Resolver de imagen de producto con múltiples posibles campos, incluyendo arrays, y normalización de rutas
  const resolveImage = (p) => {
    const candidates = [];
    // Direct fields on cart item
    if (p?.imagen) candidates.push(p.imagen);
    if (p?.imagenUrl) candidates.push(p.imagenUrl);
    if (p?.imageUrl) candidates.push(p.imageUrl);
    if (p?.image) candidates.push(p.image);
    if (p?.foto) candidates.push(p.foto);
    if (Array.isArray(p?.imagenes) && p.imagenes[0]) candidates.push(p.imagenes[0]);
    // Nested producto
    if (p?.producto?.imagen) candidates.push(p.producto.imagen);
    if (p?.producto?.imagenUrl) candidates.push(p.producto.imagenUrl);
    if (p?.producto?.imageUrl) candidates.push(p.producto.imageUrl);
    if (p?.producto?.image) candidates.push(p.producto.image);
    if (p?.producto?.foto) candidates.push(p.producto.foto);
    if (Array.isArray(p?.producto?.imagenes) && p.producto.imagenes[0]) candidates.push(p.producto.imagenes[0]);
    // Enriched info
    const enrichId = p?.productoId || p?._id || p?.producto?._id;
    const enriched = enrichId ? productInfoMap[enrichId] : null;
    if (enriched) {
      if (enriched.imagen) candidates.push(enriched.imagen);
      if (Array.isArray(enriched.imagenes) && enriched.imagenes[0]) candidates.push(enriched.imagenes[0]);
      if (enriched.imagenUrl) candidates.push(enriched.imagenUrl);
      if (enriched.imageUrl) candidates.push(enriched.imageUrl);
    }

    const firstStr = candidates.find((v) => typeof v === 'string' && v.trim().length > 0);
    let src = firstStr;

    if (src) {
      src = src.trim();
      // Normalizar rutas legacy del repo (assets en src/) hacia public/
      if (src.startsWith('/src/pages/public/img/')) src = src.replace('/src/pages/public/img/', '/img/');
      // Mantener URLs absolutas o data URIs
      if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;

      // Normalizar BASE origin (sin /api)
      const apiBase = API_CONFIG.BASE_URL || '';
      const origin = apiBase.replace(/\/api$/, '');

      // Si empieza con '/', pegar al origin
      if (src.startsWith('/')) return `${origin}${src}`;

      // Si es relativo (no empieza con '/'), construir como origin + '/' + src
      return `${origin}/${src.replace(/^\//, '')}`;
    }

    // SVG placeholder minimalista (64x64) como data URI
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e5f3f8"/><stop offset="1" stop-color="#cfe9f1"/></linearGradient></defs>
        <rect width="64" height="64" fill="url(#g)"/>
        <circle cx="22" cy="26" r="8" fill="#9ac7d6"/>
        <path d="M8 50l14-14 9 8 10-12 15 18z" fill="#7fb6c9"/>
      </svg>`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 tracking-tight">Tu carrito</h1>

        {loading && <div>Cargando carrito...</div>}
        {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 p-3 rounded mb-4">{success}</div>}

        {!loading && (!cart || (cart.productos || []).length === 0) && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="mb-4">Tu carrito está vacío.</p>
            <Link to="/productos" className="bg-[#0097c2] text-white px-4 py-2 rounded-full">Seguir comprando</Link>
          </div>
        )}

        {!loading && cart && (cart.productos || []).length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow">
                <div className="max-h-96 overflow-y-auto divide-y pr-1">
                  {(cart.productos || []).map(p => (
                    <div key={String(p.productoId)} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={resolveImage(p)}
                          alt={getDisplayName(p)}
                          className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                          onError={(e) => {
                            try {
                              e.currentTarget.onerror = null;
                              // Fallback to inline SVG placeholder
                              e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
                                `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e5f3f8"/><stop offset="1" stop-color="#cfe9f1"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="22" cy="26" r="8" fill="#9ac7d6"/><path d="M8 50l14-14 9 8 10-12 15 18z" fill="#7fb6c9"/></svg>`
                              );
                            } catch (_) {}
                          }}
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{getDisplayName(p)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="sr-only" htmlFor={`qty-${String(p.productoId)}`}>Cantidad</label>
                        <input
                          type="number"
                          min={1}
                          className="w-20 border border-gray-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-sky-300"
                          value={p.cantidad}
                          onChange={(e) => handleQtyChange(p.productoId, e.target.value)}
                          id={`qty-${String(p.productoId)}`}
                        />
                        <div className="w-24 text-right font-semibold text-gray-800">{formatUSD.format((p.precio || 0) * (p.cantidad || 0))}</div>
                        <button onClick={() => removeItem(String(p.productoId))} className="text-red-600 hover:text-red-700 text-sm font-medium">Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between bg-white p-4 rounded-xl shadow">
                <button onClick={clearCart} className="text-gray-600 hover:text-gray-800">Vaciar carrito</button>
                <div className="text-xl font-bold">Total: {formatUSD.format(Number(total || 0))}</div>
              </div>
            </div>

            {/* Checkout */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow space-y-8 sticky top-4">
                {/* Sucursal */}
                <section>
                  <h2 className="text-xl font-semibold mb-3">Sucursal</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600" htmlFor="sucursalId">Selecciona una sucursal</label>
                      <select id="sucursalId" name="sucursalId" value={form.sucursalId} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.sucursalId ? 'border-red-400' : 'border-gray-200'}`}>
                        <option value="" disabled>— Selecciona —</option>
                        {sucursales.map(s => (
                          <option key={s._id} value={s._id}>{s.nombre || s.nombreSucursal || 'Sucursal'}</option>
                        ))}
                      </select>
                      {fieldErrors.sucursalId && <p className="text-xs text-red-600 mt-1">{fieldErrors.sucursalId}</p>}
                    </div>
                  </div>
                </section>

                {/* Datos de pago */}
                <section>
                  <h2 className="text-xl font-semibold mb-3">Datos de pago</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600" htmlFor="metodoPago">Método de pago</label>
                      <select id="metodoPago" name="metodoPago" value={form.metodoPago} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.metodoPago ? 'border-red-400' : 'border-gray-200'}`}>
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta_credito">Tarjeta crédito</option>
                        <option value="tarjeta_debito">Tarjeta débito</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="cheque">Cheque</option>
                      </select>
                      {fieldErrors.metodoPago && <p className="text-xs text-red-600 mt-1">{fieldErrors.metodoPago}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600" htmlFor="montoPagado">Monto pagado</label>
                      <input id="montoPagado" type="number" name="montoPagado" placeholder="0.00" value={form.montoPagado} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.montoPagado ? 'border-red-400' : 'border-gray-200'}`} />
                      {fieldErrors.montoPagado && <p className="text-xs text-red-600 mt-1">{fieldErrors.montoPagado}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600" htmlFor="emailPago">Email para recibo/pago</label>
                      <input id="emailPago" type="email" name="emailPago" placeholder="tu@correo.com" value={form.emailPago} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.emailPago ? 'border-red-400' : 'border-gray-200'}`} />
                      {fieldErrors.emailPago && <p className="text-xs text-red-600 mt-1">{fieldErrors.emailPago}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600" htmlFor="telefonoCliente">Teléfono de contacto</label>
                      <input id="telefonoCliente" type="tel" name="telefonoCliente" placeholder="0000-0000" value={form.telefonoCliente} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.telefonoCliente ? 'border-red-400' : 'border-gray-200'}`} />
                      {fieldErrors.telefonoCliente && <p className="text-xs text-red-600 mt-1">{fieldErrors.telefonoCliente}</p>}
                    </div>
                    <div className="md:col-span-2 text-right text-sm text-gray-700">Total a pagar: <span className="font-semibold">{formatUSD.format(montoTotal)}</span></div>
                  </div>
                </section>

                {/* Datos de facturación */}
                <section>
                  <h2 className="text-xl font-semibold mb-3">Datos de facturación</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600" htmlFor="nombreCliente">Nombre completo</label>
                      <input id="nombreCliente" name="nombreCliente" placeholder="Nombre y apellido" value={form.nombreCliente} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.nombreCliente ? 'border-red-400' : 'border-gray-200'}`} />
                      {fieldErrors.nombreCliente && <p className="text-xs text-red-600 mt-1">{fieldErrors.nombreCliente}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600" htmlFor="duiCliente">DUI</label>
                      <input id="duiCliente" name="duiCliente" placeholder="00000000-0" value={form.duiCliente} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 ${fieldErrors.duiCliente ? 'border-red-400' : 'border-gray-200'}`} />
                      {fieldErrors.duiCliente && <p className="text-xs text-red-600 mt-1">{fieldErrors.duiCliente}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600" htmlFor="direccion.calle">Calle</label>
                      <input id="direccion.calle" name="direccion.calle" placeholder="Calle y número" value={form.direccion.calle} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 ${fieldErrors['direccion.calle'] ? 'border-red-400' : 'border-gray-200'}`} />
                      {fieldErrors['direccion.calle'] && <p className="text-xs text-red-600 mt-1">{fieldErrors['direccion.calle']}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600" htmlFor="direccion.ciudad">Ciudad</label>
                      <input id="direccion.ciudad" name="direccion.ciudad" placeholder="Ciudad" value={form.direccion.ciudad} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 ${fieldErrors['direccion.ciudad'] ? 'border-red-400' : 'border-gray-200'}`} />
                      {fieldErrors['direccion.ciudad'] && <p className="text-xs text-red-600 mt-1">{fieldErrors['direccion.ciudad']}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600" htmlFor="direccion.departamento">Departamento</label>
                      <input id="direccion.departamento" name="direccion.departamento" placeholder="Departamento" value={form.direccion.departamento} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 ${fieldErrors['direccion.departamento'] ? 'border-red-400' : 'border-gray-200'}`} />
                      {fieldErrors['direccion.departamento'] && <p className="text-xs text-red-600 mt-1">{fieldErrors['direccion.departamento']}</p>}
                    </div>
                  </div>
                </section>

                {/* Se removieron secciones de Sucursal/Empleado, Observaciones y Configuración de notificaciones */}

                {/* Inyectar Wompi sin UI de token/tx; el flujo se maneja desde el botón unificado */}
                {(form.metodoPago === 'tarjeta_credito' || form.metodoPago === 'tarjeta_debito' || form.metodoPago === 'transferencia') && (
                  <div className="border-t pt-4">
                    <WompiTokenPayment
                      ref={wompiRef}
                      amount={montoTotal}
                      email={form.emailPago}
                      name={form.nombreCliente}
                      configuracion={{}}
                      datosAdicionales={{}}
                      headers={{}}
                      onResult={() => { /* manejado por handlePayAndCreate */ }}
                    />
                  </div>
                )}
                <div className="text-right">
                  <button
                    className="bg-[#0097c2] disabled:opacity-60 text-white px-6 py-3 rounded-full hover:bg-[#0077a2] w-full md:w-auto"
                    onClick={handlePayAndCreate}
                    disabled={creating}
                  >
                    {creating ? 'Procesando...' : (isElectronic ? 'Pagar y confirmar' : 'Confirmar compra')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
