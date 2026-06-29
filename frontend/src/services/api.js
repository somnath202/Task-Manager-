import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
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

// Response Interceptor: Handle Token Expiration
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Check if error response is 401 (Unauthorized) and not a retry
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Prevent infinite loops and redirect
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login?expired=true';
      }
    }

    // Format error message to throw clean errors
    const message = error.response?.data?.message || 'Something went wrong';
    const formattedError = new Error(message);
    formattedError.status = error.response?.status;
    formattedError.errors = error.response?.data?.errors || null;
    
    return Promise.reject(formattedError);
  }
);

export default api;
export { API_URL };
