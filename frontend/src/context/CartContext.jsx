import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import API_CONFIG from '../config/api';
import { useAuth } from '../components/auth/AuthContext';

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = API_CONFIG.BASE_URL;
  const CARRITO = API_CONFIG.ENDPOINTS.CARRITO;

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }), [token]);

  const getActiveCartFromList = (list) => {
    if (!Array.isArray(list)) return null;
    return list.find(c => c.estado === 'activo') || list[0] || null;
  };

  const fetchOrCreateCart = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      // Get carts by client
      const res = await fetch(`${baseUrl}${CARRITO}/cliente/${user.id}`, { credentials: 'include', headers: authHeaders });
      const data = await res.json();
      let active = getActiveCartFromList(data);

      if (!active) {
        // Create a new cart
        const createRes = await fetch(`${baseUrl}${CARRITO}`, {
          method: 'POST',
          headers: authHeaders,
          credentials: 'include',
          body: JSON.stringify({ clienteId: user.id, productos: [] })
        });
        const createData = await createRes.json();
        active = createData.carrito || null;
      }
      setCart(active);
      return active;
    } catch (e) {
      console.error('Cart fetch/create error', e);
      setError('No se pudo cargar el carrito');
    } finally {
      setLoading(false);
    }
  }, [user?.id, baseUrl, CARRITO, authHeaders]);

  useEffect(() => {
    if (user?.id) fetchOrCreateCart();
    else setCart(null);
  }, [user?.id, fetchOrCreateCart]);

  const addItem = useCallback(async (product, qty = 1) => {
    let targetCartId = cart?._id;
    if (!targetCartId) {
      const active = await fetchOrCreateCart();
      targetCartId = active?._id;
    }
    if (!targetCartId) return;

    try {
      const precio = product.precioActual ?? product.precioBase ?? 0;
      // Try to carry an image to the backend so it returns it in cart items
      let imagen = '';
      try {
        const imgCandidates = [];
        // Arrays (could be string or object with secure_url/url/public_id)
        if (Array.isArray(product?.imagenes) && product.imagenes.length > 0) {
          imgCandidates.push(product.imagenes[0]);
        }
        // Common direct fields
        if (product?.imagen) imgCandidates.push(product.imagen);
        if (product?.imagenUrl) imgCandidates.push(product.imagenUrl);
        if (product?.imageUrl) imgCandidates.push(product.imageUrl);
        if (product?.image) imgCandidates.push(product.image);
        if (product?.foto) imgCandidates.push(product.foto);

        // Resolve first usable src from candidates (strings or objects)
        let src = '';
        for (const cand of imgCandidates) {
          if (typeof cand === 'string' && cand.trim().length > 0) {
            src = cand.trim();
            break;
          }
          if (cand && typeof cand === 'object') {
            const possible = cand.secure_url || cand.url || (cand.public_id || '').trim();
            if (possible && typeof possible === 'string') {
              src = possible.trim();
              break;
            }
          }
        }

        // Normalize legacy src and Cloudinary public_id
        if (src) {
          // Replace legacy dev path under src with public path
          if (src.startsWith('/src/pages/public/img/')) src = src.replace('/src/pages/public/img/', '/img/');
          // If it's a bare Cloudinary public_id, build a URL when cloud name is available
          if (!/^https?:\/\//i.test(src) && !src.startsWith('/') && !src.startsWith('data:')) {
            const cloud = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) ? import.meta.env.VITE_CLOUDINARY_CLOUD_NAME : '';
            if (cloud) src = `https://res.cloudinary.com/${cloud}/image/upload/${src}`;
          }
          imagen = src;
        }
      } catch (_) {}
      const payload = {
        productoId: product._id,
        nombre: product.nombre,
        precio,
        cantidad: qty,
        imagen
      };
      const res = await fetch(`${baseUrl}${CARRITO}/${targetCartId}/productos`, {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data?.carrito) setCart(data.carrito);
      return data;
    } catch (e) {
      console.error('addItem error', e);
      setError('No se pudo agregar el producto');
    }
  }, [cart?._id, baseUrl, CARRITO, authHeaders, fetchOrCreateCart]);

  const removeItem = useCallback(async (productoId) => {
    if (!cart?._id) return;
    try {
      const res = await fetch(`${baseUrl}${CARRITO}/${cart._id}/productos`, {
        method: 'DELETE',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify({ productoId })
      });
      const data = await res.json();
      if (data?.carrito) setCart(data.carrito);
      return data;
    } catch (e) {
      console.error('removeItem error', e);
      setError('No se pudo remover el producto');
    }
  }, [cart?._id, baseUrl, CARRITO, authHeaders]);

  const updateQty = useCallback(async (productoId, qty) => {
    // Build updated products array client-side and PUT
    if (!cart?._id || !Array.isArray(cart?.productos)) return;
    const precioMap = new Map(cart.productos.map(p => [String(p.productoId), p.precio]));
    const nameMap = new Map(cart.productos.map(p => [String(p.productoId), p.nombre]));
    const productos = Array.from(new Set([
      ...cart.productos.map(p => String(p.productoId)),
    ])).map(id => ({
      productoId: id,
      nombre: nameMap.get(String(id)) ?? '',
      precio: precioMap.get(String(id)) ?? 0,
      cantidad: String(id) === String(productoId) ? qty : (cart.productos.find(p => String(p.productoId) === String(id))?.cantidad ?? 1)
    }));

    try {
      const res = await fetch(`${baseUrl}${CARRITO}/${cart._id}`, {
        method: 'PUT',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify({ productos })
      });
      const data = await res.json();
      if (data?.carrito) setCart(data.carrito);
      return data;
    } catch (e) {
      console.error('updateQty error', e);
      setError('No se pudo actualizar la cantidad');
    }
  }, [cart, baseUrl, CARRITO, authHeaders]);

  const clearCart = useCallback(async () => {
    if (!cart?._id) return;
    try {
      const res = await fetch(`${baseUrl}${CARRITO}/${cart._id}`, {
        method: 'PUT',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify({ productos: [] })
      });
      const data = await res.json();
      if (data?.carrito) setCart(data.carrito);
    } catch (e) {
      console.error('clearCart error', e);
      setError('No se pudo vaciar el carrito');
    }
  }, [cart?._id, baseUrl, CARRITO, authHeaders]);

  const itemCount = useMemo(() => (cart?.productos || []).reduce((sum, p) => sum + (p.cantidad || 0), 0), [cart]);
  const total = useMemo(() => cart?.total ?? (cart?.productos || []).reduce((sum, p) => sum + (p.precio * p.cantidad), 0), [cart]);

  const value = useMemo(() => ({
    cart, loading, error, itemCount, total,
    fetchOrCreateCart, addItem, removeItem, updateQty, clearCart
  }), [cart, loading, error, itemCount, total, fetchOrCreateCart, addItem, removeItem, updateQty, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
