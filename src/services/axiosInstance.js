import axios from 'axios';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const axiosInstance = axios.create({ baseURL: `${API_ENDPOINT}` });

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('tv_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isTv = !!localStorage.getItem('tv_auth_token');
      const sessionExpired = error.response.data?.session_expired;
      if (isTv) {
        localStorage.removeItem('tv_auth_token');
        window.location.href = '/adulto';
      } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_permissions');
        localStorage.removeItem('user');
        if (sessionExpired) {
          window.location.href = '/?expired=1';
        } else {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
