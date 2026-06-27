import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — auto-refresh access token on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isLoginPage = window.location.pathname === '/login';
    const isRegisterPage = window.location.pathname === '/register';
    const isAuthCheck = originalRequest?.url === '/auth/me';
    const isRefreshCall = originalRequest?.url === '/auth/refresh';

    // If 401 on the refresh call itself → session fully expired, go to login
    if (error.response?.status === 401 && isRefreshCall) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // If 401 on any other call and not already retried → try to refresh
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginPage && !isRegisterPage && !isAuthCheck) {

      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Ask server for a new access token using the refresh cookie
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('token', data.data.token);
        originalRequest.headers.Authorization = `Bearer ${data.data.token}`;
        processQueue(null);
        return api(originalRequest); // Retry the original request
      } catch (refreshError) {
        processQueue(refreshError);
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;