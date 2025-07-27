import axios from 'axios';
import { getSessionId, setSessionId } from '../utils/localStorage';

// Base URL từ environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://project-back-end-1-iv0w.onrender.com/api/v1';

// Tạo axios instance với base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor để thêm auth token và session ID
api.interceptors.request.use(
  (config) => {
    // Các endpoint công khai không cần token
    const publicEndpoints = ['/categories', '/products'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url.includes(endpoint));
    
    // Các endpoint auth không nên có X-Cart-Session-ID
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/logout', '/auth/refresh'];
    const isAuthEndpoint = authEndpoints.some(endpoint => config.url.includes(endpoint));
    
    // Các endpoint auth cần token (trừ login và register)
    const authEndpointsNeedToken = ['/auth/logout', '/auth/refresh'];
    const isAuthEndpointNeedToken = authEndpointsNeedToken.some(endpoint => config.url.includes(endpoint));
    
    const token = localStorage.getItem('accessToken');
    
    // Thêm token nếu:
    // 1. Không phải public endpoint và có token, HOẶC
    // 2. Là auth endpoint cần token (logout, refresh)
    if (token && (!isPublicEndpoint || isAuthEndpointNeedToken)) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Xử lý X-Cart-Session-ID cho các request liên quan đến cart (KHÔNG bao gồm auth endpoints)
    const isCartRequest = config.url.includes('/cart');
    
    if (isCartRequest && !isAuthEndpoint) {
      const sessionId = getSessionId();
      
      // Nếu là guest (không có token) và có sessionId, thêm vào header
      if (!token && sessionId) {
        config.headers['X-Cart-Session-ID'] = sessionId;
      }
      
      // Trường hợp đặc biệt: merge cart cần cả token và sessionId
      if (config.url.includes('/cart/merge') && token && sessionId) {
        config.headers['X-Cart-Session-ID'] = sessionId;
      }
    }

    // Debug logging (chỉ cho development)
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        isAuthEndpoint,
        isAuthEndpointNeedToken,
        hasAuthHeader: !!config.headers['Authorization'],
        hasCartSessionHeader: !!config.headers['X-Cart-Session-ID']
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi chung và bắt X-Cart-Session-ID
api.interceptors.response.use(
  (response) => {
    // Bắt X-Cart-Session-ID từ response header và lưu vào localStorage
    const cartSessionId = response.headers['x-cart-session-id'];
    if (cartSessionId) {
      setSessionId(cartSessionId);
      console.log('Cart session ID received and saved:', cartSessionId);
    }
    
    return response;
  },
  (error) => {
    // Debug logging for development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }
    
    // Không tự động xóa token và redirect nếu đang gọi logout API
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/logout')) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
