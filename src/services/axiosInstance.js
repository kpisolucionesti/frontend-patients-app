import axios from 'axios';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const baseURL = API_ENDPOINT || `http://${hostname}:3100`;
const axiosInstance = axios.create({ baseURL });

let tvConsecutiveFailures = 0;
const TV_FAILURE_THRESHOLD = 3;

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('tv_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    if (localStorage.getItem('tv_auth_token')) {
      tvConsecutiveFailures = 0;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const isTv = !!localStorage.getItem('tv_auth_token');
      const sessionExpired = error.response.data?.session_expired;
      if (isTv) {
        localStorage.removeItem('tv_auth_token');
        window.location.href = `/${window.location.pathname.slice(1) || 'adulto'}`;
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
    } else if (!error.response) {
      const isTv = !!localStorage.getItem('tv_auth_token');
      if (isTv) {
        tvConsecutiveFailures++;
        if (tvConsecutiveFailures >= TV_FAILURE_THRESHOLD) {
          localStorage.removeItem('tv_auth_token');
          window.location.href = `/${window.location.pathname.slice(1) || 'adulto'}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
