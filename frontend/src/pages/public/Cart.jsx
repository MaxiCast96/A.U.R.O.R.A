import React, { useEffect, useMemo, useState } from 'react';
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

  const [form, setForm] = useState({
    sucursalId: '',
    empleadoId: '',
    metodoPago: 'efectivo',
    montoPagado: 0,
    nombreCliente: '',
    duiCliente: '',
    direccion: { calle: '', ciudad: '', departamento: '' },
    observaciones: ''
  });

  const montoTotal = useMemo(() => Number(total || 0), [total]);

  useEffect(() => {
    // Prefill defaults
    setForm((f) => ({
      ...f,
      montoPagado: montoTotal,
      nombreCliente: f.nombreCliente || user?.nombre || '',
    }));
  }, [montoTotal, user?.nombre]);

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
        console.error('Error cargando sucursales', e);
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
    }
  };

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
    if (!form.empleadoId) {
      setError('Ingresa el empleado que procesa la venta.');
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
    if (!form.nombreCliente || !form.duiCliente || !form.direccion.calle || !form.direccion.ciudad || !form.direccion.departamento) {
      setError('Completa los datos de facturación.');
      return;
    }

    const cambio = Math.max(0, Number(form.montoPagado) - montoTotal);
    const payload = {
      carritoId: cart._id,
      empleadoId: form.empleadoId,
      sucursalId: form.sucursalId,
      datosPago: {
        metodoPago: form.metodoPago,
        montoPagado: Number(form.montoPagado),
        montoTotal: montoTotal,
        cambio,
        numeroTransaccion: form.metodoPago === 'efectivo' ? undefined : `TX-${Date.now()}`
      },
      facturaDatos: {
        // numeroFactura omitido: lo genera el backend (ventasSchema.pre('save'))
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
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VENTAS}`, {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Venta creada correctamente.');
      } else {
        setError(data?.message || 'Error creando la venta.');
      }
    } catch (e) {
      console.error('Error creando venta', e);
      setError('Error de red creando la venta.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Tu carrito</h1>

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
          <div className="grid grid-cols-1 gap-4">
            {(cart.productos || []).map(p => (
              <div key={String(p.productoId)} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                <div>
                  <div className="font-semibold">{p.nombre}</div>
                  <div className="text-sm text-gray-600">${p.precio?.toFixed(2)} x</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    className="w-20 border rounded px-2 py-1"
                    value={p.cantidad}
                    onChange={(e) => handleQtyChange(p.productoId, e.target.value)}
                  />
                  <div className="w-24 text-right font-semibold">${(p.precio * p.cantidad).toFixed(2)}</div>
                  <button onClick={() => removeItem(String(p.productoId))} className="text-red-600 hover:underline ml-2">Eliminar</button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
              <button onClick={clearCart} className="text-gray-600 hover:underline">Vaciar carrito</button>
              <div className="text-lg font-bold">Total: ${Number(total || 0).toFixed(2)}</div>
            </div>

            {/* Checkout form */}
            <div className="bg-white p-4 rounded-lg shadow space-y-4">
              <h2 className="text-lg font-semibold">Datos de pago</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-600">Método de pago</label>
                  <select name="metodoPago" value={form.metodoPago} onChange={handleChange} className="w-full border rounded px-3 py-2">
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta_credito">Tarjeta crédito</option>
                    <option value="tarjeta_debito">Tarjeta débito</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Monto pagado</label>
                  <input type="number" name="montoPagado" value={form.montoPagado} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="self-end text-right text-sm text-gray-700">Total a pagar: <span className="font-semibold">${montoTotal.toFixed(2)}</span></div>
              </div>

              <h2 className="text-lg font-semibold">Datos de facturación</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600">Nombre del cliente</label>
                  <input type="text" name="nombreCliente" value={form.nombreCliente} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">DUI</label>
                  <input type="text" name="duiCliente" value={form.duiCliente} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Calle</label>
                  <input type="text" name="direccion.calle" value={form.direccion.calle} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Ciudad</label>
                  <input type="text" name="direccion.ciudad" value={form.direccion.ciudad} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Departamento</label>
                  <input type="text" name="direccion.departamento" value={form.direccion.departamento} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                </div>
              </div>

              <h2 className="text-lg font-semibold">Sucursal y empleado</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600">Sucursal</label>
                  <select name="sucursalId" value={form.sucursalId} onChange={handleChange} className="w-full border rounded px-3 py-2">
                    {sucursales.map(s => (
                      <option key={s._id} value={s._id}>{s.nombre || s._id}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Empleado (requerido)</label>
                  <input type="text" name="empleadoId" value={form.empleadoId} onChange={handleChange} placeholder="ID del empleado que procesa la venta" className="w-full border rounded px-3 py-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600">Observaciones</label>
                <textarea name="observaciones" value={form.observaciones} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} />
              </div>

              {/* If paying with card/transfer, show Wompi client-only payment */}
              {(form.metodoPago === 'tarjeta_credito' || form.metodoPago === 'tarjeta_debito' || form.metodoPago === 'transferencia') ? (
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Pago con Wompi</h3>
                    <WompiTokenPayment
                      amount={montoTotal}
                      email={user?.email}
                      name={form.nombreCliente}
                      headers={{}}
                      onResult={(res) => {
                        if (res.ok) {
                          setSuccess('Pago Wompi aprobado. Puedes confirmar la venta.');
                        } else {
                          setError('Pago Wompi fallido.');
                        }
                      }}
                    />
                  </div>
                  <div className="text-right">
                    <button
                      className="bg-[#0097c2] disabled:opacity-60 text-white px-6 py-3 rounded-full hover:bg-[#0077a2]"
                      onClick={handleCreateVenta}
                      disabled={creating}
                    >
                      {creating ? 'Procesando...' : 'Confirmar venta'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-right">
                  <button
                    className="bg-[#0097c2] disabled:opacity-60 text-white px-6 py-3 rounded-full hover:bg-[#0077a2]"
                    onClick={handleCreateVenta}
                    disabled={creating}
                  >
                    {creating ? 'Procesando...' : 'Proceder al pago'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
