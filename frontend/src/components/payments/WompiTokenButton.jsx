import React, { useCallback, useEffect, useState } from 'react';

/**
 * WompiTokenButton
 * - Carga el script del SDK de Wompi desde una URL configurable vía env (VITE_WOMPI_SDK_URL)
 * - Muestra un botón que abre el widget/SDK para tokenizar tarjeta y devolver un token seguro
 * - No captura ni almacena PAN/exp/CVV; sólo recibe el token del SDK
 *
 * Props:
 * - amount: number (centavos o unidades según tu configuración de Wompi)
 * - email: string (email del titular)
 * - name: string (nombre del titular)
 * - onToken: function(tokenString) => void
 * - disabled: boolean
 */
const WompiTokenButton = ({ amount, email, name, onToken, disabled }) => {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const sdkUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WOMPI_SDK_URL) || '';

  // Cargar script de Wompi una sola vez
  useEffect(() => {
    if (!sdkUrl) return; // sin URL no se intenta cargar
    // si ya está cargado
    if (document.querySelector(`script[src="${sdkUrl}"]`)) {
      setReady(true);
      return;
    }
    const s = document.createElement('script');
    s.src = sdkUrl;
    s.async = true;
    s.onload = () => setReady(true);
    s.onerror = () => setReady(false);
    document.body.appendChild(s);
    return () => {
      // no removemos el script para reutilizarlo entre vistas
    };
  }, [sdkUrl]);

  const handleClick = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    try {
      // NOTA IMPORTANTE:
      // La siguiente llamada es un placeholder que asume que el SDK inyecta un objeto global
      // como window.Wompi y expone un método para abrir un formulario y devolver un token.
      // Debes reemplazar window.Wompi.openCardForm(...) por el método real del SDK de Wompi SV.
      if (typeof window !== 'undefined' && window.Wompi && typeof window.Wompi.openCardForm === 'function') {
        window.Wompi.openCardForm({ amount, email, name }, (result) => {
          // Se espera que result incluya un token (e.g. result.token)
          const token = result?.token || result?.data?.token || '';
          if (token) onToken?.(token);
          setLoading(false);
        });
      } else {
        // Fallback: informar que el SDK no está disponible (mantener botón para permitir pegar token manual)
        alert('SDK de Wompi no disponible. Verifica VITE_WOMPI_SDK_URL o integra el método del SDK.');
        setLoading(false);
      }
    } catch (e) {
      console.error('Error al invocar SDK Wompi', e);
      setLoading(false);
    }
  }, [ready, amount, email, name, onToken]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || !ready || loading}
      className="bg-emerald-600 disabled:opacity-60 text-white px-4 py-2 rounded-full hover:bg-emerald-700"
      title={!sdkUrl ? 'Configura VITE_WOMPI_SDK_URL' : ''}
    >
      {loading ? 'Abriendo Wompi...' : (!ready ? 'Cargando Wompi...' : 'Agregar tarjeta con Wompi')}
    </button>
  );
};

export default WompiTokenButton;
