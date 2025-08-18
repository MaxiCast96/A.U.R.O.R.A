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
  // Se removieron campos de configuración y datos adicionales del UI

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    sucursalId: '',
    empleadoId: '',
    metodoPago: 'efectivo',
    montoPagado: 0,
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

  const isElectronic = useMemo(
    () => form.metodoPago === 'tarjeta_credito' || form.metodoPago === 'tarjeta_debito' || form.metodoPago === 'transferencia',
    [form.metodoPago]
  );

  useEffect(() => {
    // Prefill defaults
    setForm((f) => ({
      ...f,
      montoPagado: montoTotal,
      nombreCliente: f.nombreCliente || user?.nombre || '',
      emailPago: f.emailPago || user?.correo || '',
    }));
    // Si cambia el total, invalidar transacción previa
    setWompiTxId(null);
    setSuccess(null);
  }, [montoTotal, user?.nombre, user?.correo]);

  // Prefill datos de facturación desde la BD cuando el usuario es Cliente
  useEffect(() => {
    const cargarCliente = async () => {
      try {
        if (!user?.id || user?.rol !== 'Cliente') return;
        const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTES}/${user.id}`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) return;
        // data es el objeto cliente según backend
        const nombreCompleto = [data?.nombre, data?.apellido].filter(Boolean).join(' ').trim();
        setForm((f) => ({
          ...f,
          nombreCliente: f.nombreCliente || nombreCompleto || f.nombreCliente,
          emailPago: f.emailPago || data?.correo || f.emailPago,
          telefonoCliente: f.telefonoCliente || data?.telefono || data?.telefono1 || data?.telefonoPrincipal || f.telefonoCliente || '',
          duiCliente: f.duiCliente || data?.dui || f.duiCliente,
          direccion: {
            calle: f.direccion.calle || data?.direccion?.calle || '',
            ciudad: f.direccion.ciudad || data?.direccion?.ciudad || '',
            departamento: f.direccion.departamento || data?.direccion?.departamento || '',
          },
        }));
      } catch (e) {
        if (!import.meta.env.PROD) console.error('Error precargando datos de cliente', e);
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
    cargarCliente();
  }, [user?.id, user?.rol]);

  // Prefill empleadoId si el usuario autenticado es Empleado
  useEffect(() => {
    if (user?.id && user?.rol && user.rol !== 'Cliente') {
      setForm((f) => ({ ...f, empleadoId: f.empleadoId || user.id }));
    }
  }, [user?.id, user?.rol]);

  useEffect(() => {
    // Fetch sucursales for selection
    const fetchSucursales = async () => {
      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUCURSALES}`, { credentials: 'include' });
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setSucursales(list);
        if (!form.sucursalId && list[0]?._id) {
          setForm((f) => ({ ...f, sucursalId: list[0]._id }));
        }
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

  const handleQtyChange = (id, value) => {
    const qty = Math.max(1, Number(value) || 1);
    updateQty(id, qty);
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
        // Si es electrónico, alinear monto pagado al total automáticamente
        if (value === 'tarjeta_credito' || value === 'tarjeta_debito' || value === 'transferencia') {
          setForm((f) => ({ ...f, montoPagado: montoTotal }));
        }
      }
    }
  };

  // Asegurar que para métodos electrónicos, el monto pagado coincida con el total
  useEffect(() => {
    if (isElectronic && Number(form.montoPagado) !== montoTotal) {
      setForm((f) => ({ ...f, montoPagado: montoTotal }));
    }
  }, [isElectronic, montoTotal]);

  const handleCreateVenta = async () => {
    setError(null);
    setSuccess(null);
    if (!cart?._id) {
      setError('No hay carrito activo.');
      return;
    }
    if (!form.sucursalId) {
      setError('Selecciona una sucursal.');
      return;
    }
    if (!user?.id) {
      setError('Debes iniciar sesión.');
      return;
    }
    if (!form.metodoPago || !form.montoPagado) {
      setError('Completa los datos de pago.');
      return;
    }
    const requiereWompi = (form.metodoPago === 'tarjeta_credito' || form.metodoPago === 'tarjeta_debito' || form.metodoPago === 'transferencia');
    if (requiereWompi && !wompiTxId) {
      setError('Primero realiza el pago con tarjeta/transferencia (Wompi).');
      return;
    }
    if (!form.nombreCliente || !form.duiCliente || !form.direccion.calle || !form.direccion.ciudad || !form.direccion.departamento || !form.telefonoCliente) {
      setError('Completa los datos de facturación.');
      return;
    }

    const cambio = Math.max(0, Number(form.montoPagado) - montoTotal);
    const payload = {
      carritoId: cart._id,
      empleadoId: form.empleadoId || undefined,
      sucursalId: form.sucursalId,
      fecha: form.fecha ? new Date(form.fecha).toISOString() : new Date().toISOString(),
      estado: form.estado || 'pendiente',
      datosPago: {
        metodoPago: form.metodoPago,
        montoPagado: Number(form.montoPagado),
        montoTotal: montoTotal,
        cambio,
        numeroTransaccion: form.metodoPago === 'efectivo' ? undefined : (wompiTxId || `TX-${Date.now()}`)
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
        setWompiTxId(res.transactionId || null);
      }
      // Crear Cotización y vincular personalizados si aplica
      try {
        await createCotizacionAndPatchPersonalizados();
      } catch (e) {
        if (!import.meta.env.PROD) console.error('Fallo creando cotización', e);
      }
      // Luego crear la venta
      await handleCreateVenta();
    } catch (e) {
      if (!import.meta.env.PROD) console.error('Error en flujo de pago y creación', e);
      setError('Ocurrió un error procesando el pago.');
    } finally {
      setCreating(false);
    }
  };

  // Resolver de imagen de producto con múltiples posibles campos y normalización de rutas
  const resolveImage = (p) => {
    const candidates = [
      p?.imagen, p?.imagenUrl, p?.imageUrl, p?.image, p?.foto, p?.thumbnail, p?.thumb,
      p?.producto?.imagen, p?.producto?.imagenUrl, p?.producto?.imageUrl, p?.producto?.image, p?.producto?.foto
    ].filter(Boolean);
    let src = candidates.find((v) => typeof v === 'string' && v.trim().length > 0);

    if (src) {
      src = src.trim();
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
                        <img src={resolveImage(p)} alt={p.nombre} className="w-14 h-14 rounded-md object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{p.nombre}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={1}
                          className="w-20 border border-gray-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-sky-300"
                          value={p.cantidad}
                          onChange={(e) => handleQtyChange(p.productoId, e.target.value)}
                        />
                        <div className="w-24 text-right font-semibold text-gray-800">${(p.precio * p.cantidad).toFixed(2)}</div>
                        <button onClick={() => removeItem(String(p.productoId))} className="text-red-600 hover:text-red-700 text-sm font-medium">Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between bg-white p-4 rounded-xl shadow">
                <button onClick={clearCart} className="text-gray-600 hover:text-gray-800">Vaciar carrito</button>
                <div className="text-xl font-bold">Total: ${Number(total || 0).toFixed(2)}</div>
              </div>
            </div>

            {/* Checkout */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow space-y-6 sticky top-4">
                <h2 className="text-xl font-semibold">Datos de pago</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">Método de pago</label>
                    <select name="metodoPago" value={form.metodoPago} onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta_credito">Tarjeta crédito</option>
                      <option value="tarjeta_debito">Tarjeta débito</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Monto pagado</label>
                    <input type="number" name="montoPagado" value={form.montoPagado} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Email para recibo/pago</label>
                    <input type="email" name="emailPago" value={form.emailPago} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Teléfono de contacto</label>
                    <input type="tel" name="telefonoCliente" value={form.telefonoCliente} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div className="md:col-span-2 text-right text-sm text-gray-700">Total a pagar: <span className="font-semibold">${montoTotal.toFixed(2)}</span></div>
                </div>

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
