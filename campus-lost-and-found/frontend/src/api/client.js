import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const isAdminRoute = config.url && config.url.includes('/api/admin');
    
    if (isAdminRoute) {
      const adminToken = localStorage.getItem('campus_admin_token');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      const userToken = localStorage.getItem('campus_user_token');
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors and auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config ? error.config.url : '';
      if (url && url.includes('/api/admin')) {
        localStorage.removeItem('campus_admin_token');
        localStorage.removeItem('campus_admin_info');
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login?expired=true';
        }
      } else if (url && url.includes('/api/user')) {
        localStorage.removeItem('campus_user_token');
        localStorage.removeItem('campus_user_info');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
