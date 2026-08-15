import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (import.meta.env.DEV) return 'http://localhost:5000';
  return '';
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