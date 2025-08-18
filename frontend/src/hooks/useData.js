import useFetch from './useFetch';
import { API_CONFIG, buildApiUrl } from '../config/api';

// resource: string, params: objeto de query opcional

const buildUrl = (resource, params) => {
  // Asegura que el resource comience con '/'
  const endpoint = resource.startsWith('/') ? resource : `/${resource}`;
  return buildApiUrl(endpoint, params);
};

const useData = (resource, params, options) => {
  const url = buildUrl(resource, params);
  return useFetch(url, options);
};

export default useData;