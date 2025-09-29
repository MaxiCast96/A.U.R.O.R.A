// src/components/Admin/management/ArosContent.jsx
import React, { useEffect } from 'react';
import axios from 'axios';
import LentesContent from './LentesContent.jsx';

// Por rapidez y para mantener la UX, reutilizamos LentesContent pero
// sobreescribimos dinámicamente los textos y el endpoint base a "/aros".
// Si más adelante los campos difieren, haremos un componente dedicado.

// Hack: interceptor Axios para redirigir '/lentes' -> '/aros' mientras esté montado
const ArosContent = () => {
  useEffect(() => {
    const interceptorId = axios.interceptors.request.use((config) => {
      try {
        if (typeof config.url === 'string') {
          // Reescribir solo paths del API, no URLs absolutas externas
          // cubre '/lentes' y '/lentes/:id'
          config.url = config.url.replace(/\/lentes(\b|\/)/, '/aros$1');
        }
      } catch {}
      return config;
    });

    return () => {
      axios.interceptors.request.eject(interceptorId);
    };
  }, []);

  return <LentesContent />;
};

export default ArosContent;
