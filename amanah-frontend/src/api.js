import axios from 'axios';

// This automatically picks up the URL from your environment settings
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Include cookies for session management
});
api.interceptors.request.use(config => {
  const key = localStorage.getItem('governanceKey'); // Store it after unlock
  if (key) config.headers['x-governance-key'] = key;
  return config;
});
export default api;