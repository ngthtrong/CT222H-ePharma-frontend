import api from './config';
import { setSessionId, getSessionId, clearSessionId } from '../utils/localStorage';

// Tạo sessionId cho guest cart
export const createGuestSession = () => {
  let sessionId = getSessionId();
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    setSessionId(sessionId);
  }
  return sessionId;
};

// Xóa session sau khi merge
export const clearGuestSession = () => {
  clearSessionId();
};

// Kiểm tra authentication status
const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

// =================================================================================
// Cart API theo đúng CART-API-GUIDE.md
// ==================================================================================

/**
 * Lấy giỏ hàng hiện tại - tự động xử lý cho cả user và guest
 * Authentication và session handling được xử lý bởi axios interceptor
 */
export const getCart = async () => {
  try {
    // Đảm bảo có session ID cho guest
    if (!isAuthenticated()) {
      createGuestSession();
    }
    
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    console.error('❌ Get cart error:', error);
    throw error;
  }
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * Tự động tạo session ID cho guest nếu chưa có
 * @param {string} productId - ID sản phẩm
 * @param {number} quantity - Số lượng
 */
export const addItemToCart = async (productId, quantity = 1) => {
  try {
    // Validation input
    if (!productId) {
      const error = new Error('ProductId is required');
      console.error('❌ Add to cart validation failed:', { productId, quantity });
      throw error;
    }

    if (!quantity || quantity < 1) {
      const error = new Error('Quantity must be greater than 0');
      console.error('❌ Add to cart validation failed:', { productId, quantity });
      throw error;
    }

    // Đảm bảo có session ID cho guest
    if (!isAuthenticated()) {
      createGuestSession();
    }
    
    const requestBody = { productId, quantity };
    const response = await api.post('/cart/items', requestBody);
    return response.data;
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    throw error;
  }
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * @param {string} productId - ID sản phẩm
 * @param {number} quantity - Số lượng mới
 */
export const updateCartItem = async (productId, quantity) => {
  try {
    const requestBody = { quantity };
    const response = await api.put(`/cart/items/${productId}`, requestBody);
    return response.data;
  } catch (error) {
    console.error('❌ Update cart item error:', error);
    throw error;
  }
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @param {string} productId - ID sản phẩm cần xóa
 */
export const removeCartItem = async (productId) => {
  try {
    const response = await api.delete(`/cart/items/${productId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Remove cart item error:', error);
    throw error;
  }
};

/**
 * Xóa toàn bộ giỏ hàng
 */
export const clearCart = async () => {
  try {
    const response = await api.delete('/cart');
    return response.data;
  } catch (error) {
    console.error('❌ Clear cart error:', error);
    throw error;
  }
};

/**
 * Gộp giỏ hàng guest vào tài khoản user khi đăng nhập
 * Phải có cả Authorization token và X-Cart-Session-ID
 */
export const mergeCart = async () => {
  try {
    const sessionId = getSessionId();
    
    if (!sessionId) {
      return null;
    }
    
    const response = await api.post('/cart/merge');
    
    // Xóa session ID sau khi merge thành công
    clearGuestSession();
    
    return response.data;
  } catch (error) {
    console.error('❌ Merge cart error:', error);
    throw error;
  }
};

// Export cartAPI object với tên method nhất quán theo CART-API-GUIDE.md
export const cartAPI = {
  // Core cart operations
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeCart,
  
  // Utility functions
  createGuestSession,
  clearGuestSession,
  isAuthenticated: () => isAuthenticated(),
  
  // Aliases cho backward compatibility
  addToCart: addItemToCart,
  removeFromCart: removeCartItem,
};

// Default export
export default cartAPI;
