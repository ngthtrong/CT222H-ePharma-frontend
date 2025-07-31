import axios from 'axios';
import { getSessionId, setSessionId } from '../utils/localStorage';

// Base URL từ environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://project-back-end-1-iv0w.onrender.com/api/v1';

// Tạo axios instance với base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Timeout bình thường 15s
  withCredentials: false, // Đảm bảo không gửi credentials để tránh CORS issues
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor để thêm auth token và session ID
api.interceptors.request.use(
  (config) => {
    // Helper function để thêm header an toàn, tương tự headers.append()
    const appendHeader = (headers, key, value) => {
      if (!headers) headers = {};
      headers[key] = value;
      return headers;
    };

    // Các endpoint công khai không cần token
    const publicEndpoints = ['/categories', '/products'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url.includes(endpoint));

    // Các endpoint admin luôn cần token
    const adminEndpoints = ['/admin/'];
    const isAdminEndpoint = adminEndpoints.some(endpoint => config.url.includes(endpoint));

    // Các endpoint auth không nên có X-Cart-Session-ID
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/logout', '/auth/refresh'];
    const isAuthEndpoint = authEndpoints.some(endpoint => config.url.includes(endpoint));

    // Các endpoint auth cần token (trừ login và register)
    const authEndpointsNeedToken = ['/auth/logout', '/auth/refresh'];
    const isAuthEndpointNeedToken = authEndpointsNeedToken.some(endpoint => config.url.includes(endpoint));

    const token = localStorage.getItem('accessToken');

    // Debug logging
    if (isAdminEndpoint) {
      console.log('Admin endpoint request:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? token.substring(0, 20) + '...' : null,
        headers: config.headers
      });
    }

    // Đảm bảo config.headers tồn tại
    if (!config.headers) {
      config.headers = {};
    }

    // Kiểm tra đặc biệt: Admin endpoints PHẢI có token (kiểm tra trước khi thêm header)
    if (isAdminEndpoint && !token) {
      console.error('Admin endpoint called without token:', config.url);
      throw new Error('Admin endpoint requires authentication token');
    }

    // Thêm Authorization token nếu:
    // 1. Là admin endpoint và có token, HOẶC
    // 2. Không phải public endpoint và có token, HOẶC
    // 3. Là auth endpoint cần token (logout, refresh)
    if (token && (isAdminEndpoint || !isPublicEndpoint || isAuthEndpointNeedToken)) {
      // Clean token - loại bỏ dấu ngoặc kép thừa nếu có
      const cleanToken = token.replace(/^["']|["']$/g, '');
      config.headers = appendHeader(config.headers, 'Authorization', `Bearer ${cleanToken}`);
      
      // Debug logging cho admin endpoints
      if (isAdminEndpoint) {
        console.log('Adding Authorization header:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          originalToken: token.substring(0, 30) + '...',
          cleanedToken: cleanToken.substring(0, 30) + '...',
          authHeader: `Bearer ${cleanToken.substring(0, 30)}...`,
          finalHeaders: config.headers
        });
      }
    }

    // Xử lý X-Cart-Session-ID cho các request liên quan đến cart (KHÔNG bao gồm auth endpoints)
    const isCartRequest = config.url.includes('/cart');

    if (isCartRequest && !isAuthEndpoint) {
      const sessionId = getSessionId();

      // Nếu là guest (không có token) và có sessionId, thêm vào header
      if (!token && sessionId) {
        config.headers = appendHeader(config.headers, 'X-Cart-Session-ID', sessionId);
      }

      // Trường hợp đặc biệt: merge cart cần cả token và sessionId
      if (config.url.includes('/cart/merge') && token && sessionId) {
        config.headers = appendHeader(config.headers, 'X-Cart-Session-ID', sessionId);
      }
    }

    // Xử lý đặc biệt cho logout API - loại bỏ Content-Type nếu không có data
    if (config.url.includes('/auth/logout') && (config.data === null || config.data === undefined)) {
      delete config.headers['Content-Type'];
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
        message: error.response?.data?.message || error.message,
        isLogoutCall: error.config?.url?.includes('/auth/logout')
      });
    }

    // Xử lý đặc biệt cho logout API
    if (error.config?.url?.includes('/auth/logout')) {
      // Đối với logout API, không redirect ngay cả khi lỗi 401 hoặc 500
      // Vì có thể token đã hết hạn hoặc server có vấn đề
      // Frontend sẽ tự cleanup và AuthContext sẽ xử lý
      console.log('Logout API error - this is handled by AuthContext, not redirecting');
      return Promise.reject(error);
    }

    // Chỉ redirect khi gặp 401 và KHÔNG phải logout API
    if (error.response?.status === 401) {
      // Kiểm tra nếu là admin endpoint
      const isAdminEndpoint = error.config?.url?.includes('/admin/');
      
      console.warn('401 Unauthorized error:', {
        url: error.config?.url,
        isAdminEndpoint,
        hasToken: !!localStorage.getItem('accessToken')
      });
      
      if (isAdminEndpoint) {
        console.error('Admin endpoint authentication failed:', error.config?.url);
        // Không redirect tự động cho admin endpoints để tránh loop
        return Promise.reject(error);
      } else {
        // Token hết hạn hoặc không hợp lệ cho endpoint thường
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 100);
      }
    }

    // Xử lý lỗi 403 (Forbidden) cho admin endpoints
    if (error.response?.status === 403 && error.config?.url?.includes('/admin/')) {
      console.error('Admin endpoint access denied:', error.config?.url);
      // Người dùng không có quyền admin
      window.location.href = '/login?error=admin_access_denied';
    }
    
    return Promise.reject(error);
  }
);

export default api;
