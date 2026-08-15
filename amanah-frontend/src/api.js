import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  }
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl || envUrl.includes('localhost')) {
    return '';
  }
  return envUrl;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const key = localStorage.getItem('governanceKey');
  if (key) config.headers['x-governance-key'] = key;
  return config;
});

export default api;