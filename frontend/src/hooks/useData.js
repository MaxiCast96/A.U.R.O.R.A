import useFetch from './useFetch';

// resource: string, params: objeto de query opcional
const API_BASE = 'http://localhost:4000/api'; // Ahora incluye /api

const buildUrl = (resource, params) => {
  let url = `${API_BASE}/${resource}`;
  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
  }
  return url;
};

const useData = (resource, params, options) => {
  const url = buildUrl(resource, params);
  return useFetch(url, options);
};

export default useData; 