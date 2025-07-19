import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add session ID for guest cart
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId && !token) {
      config.headers['X-Cart-Session-ID'] = sessionId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// User Management APIs
export const userAPI = {
  getUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Category APIs
export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Product APIs
export const productAPI = {
  getProducts: (params = {}) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Cart APIs
export const cartAPI = {
  // Create guest session
  createGuestSession: () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  },

  // Clear guest session
  clearGuestSession: () => {
    localStorage.removeItem('sessionId');
  },

  // Get cart (auto-detect guest/user)
  getCart: () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Guest cart - ensure sessionId exists
      cartAPI.createGuestSession();
    }
    return api.get('/cart');
  },

  // Add to cart
  addToCart: (productId, quantity = 1) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Guest cart - ensure sessionId exists
      cartAPI.createGuestSession();
    }
    return api.post('/cart/items', { productId, quantity });
  },

  // Update cart item
  updateCartItem: (productId, quantity) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Guest cart - ensure sessionId exists
      cartAPI.createGuestSession();
    }
    return api.put(`/cart/items/${productId}`, { quantity });
  },

  // Remove from cart
  removeFromCart: (productId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Guest cart - ensure sessionId exists
      cartAPI.createGuestSession();
    }
    return api.delete(`/cart/items/${productId}`);
  },

  // Clear cart
  clearCart: () => {
    return api.delete('/cart');
  },

  // Merge cart after login
  mergeCart: () => {
    const token = localStorage.getItem('accessToken');
    const sessionId = localStorage.getItem('sessionId');
    
    if (!token || !sessionId) {
      return Promise.reject(new Error('Token hoặc sessionId không tồn tại'));
    }
    
    return api.post('/cart/merge', {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Cart-Session-ID': sessionId
      }
    }).then(response => {
      // After successful merge, clear sessionId
      cartAPI.clearGuestSession();
      return response;
    });
  },

  // Get cart item count
  getCartItemCount: async () => {
    try {
      const response = await cartAPI.getCart();
      const cart = response.data;
      if (cart && cart.items) {
        return cart.items.reduce((total, item) => total + item.quantity, 0);
      }
      return 0;
    } catch (error) {
      console.error('Error getting cart item count:', error);
      return 0;
    }
  },

  // Get cart total
  getCartTotal: async () => {
    try {
      const response = await cartAPI.getCart();
      const cart = response.data;
      if (cart && cart.items) {
        return cart.items.reduce((total, item) => {
          const price = item.productId.price || 0;
          return total + (price * item.quantity);
        }, 0);
      }
      return 0;
    } catch (error) {
      console.error('Error getting cart total:', error);
      return 0;
    }
  },
};

export default api;
