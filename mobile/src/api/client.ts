import axios from 'axios';
const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL });
api.interceptors.request.use(async (config) => {
  const token = (globalThis as any).__token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
