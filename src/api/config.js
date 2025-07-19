import axios from 'axios';
import { getSessionId, setSessionId } from '../utils/localStorage';

// Base URL từ environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';

// Tạo axios instance với base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm auth token và session ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // For guest cart management, we need a session ID.
    // This logic should be applied to cart-related endpoints for non-authenticated users.
    const isCartRequest = config.url.includes('/cart');
    if (isCartRequest && !token) {
        let sessionId = getSessionId();
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            setSessionId(sessionId);
        }
        config.headers['X-Cart-Session-ID'] = sessionId;
    }
    
    // Special case for merging cart: requires both auth token and session ID
    if (config.url.includes('/cart/merge')) {
        const sessionId = getSessionId();
        if (sessionId) {
            config.headers['X-Cart-Session-ID'] = sessionId;
        }
    }


    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi chung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
