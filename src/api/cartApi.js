import api from './config';

// Tạo sessionId cho guest cart
export const createGuestSession = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Xóa session sau khi merge
export const clearGuestSession = () => {
  localStorage.removeItem('sessionId');
};

export const cartAPI = {
  // Lấy giỏ hàng (tự động phân biệt guest/user)
  getCart: () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Guest cart - đảm bảo có sessionId
      createGuestSession();
    }
    return api.get('/cart');
  },
  
  // Thêm sản phẩm vào giỏ hàng
  addToCart: (productId, quantity = 1) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Guest cart - đảm bảo có sessionId
      createGuestSession();
    }
    return api.post('/cart/items', { productId, quantity });
  },
  
  // Cập nhật số lượng sản phẩm trong giỏ hàng
  updateCartItem: (productId, quantity) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Guest cart - đảm bảo có sessionId
      createGuestSession();
    }
    return api.put(`/cart/items/${productId}`, { quantity });
  },
  
  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: (productId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Guest cart - đảm bảo có sessionId
      createGuestSession();
    }
    return api.delete(`/cart/items/${productId}`);
  },
  
  // Xóa toàn bộ giỏ hàng
  clearCart: () => {
    return api.delete('/cart');
  },
  
  // Gộp giỏ hàng guest vào user cart khi đăng nhập
  mergeCart: () => {
    const token = localStorage.getItem('accessToken');
    const sessionId = localStorage.getItem('sessionId');
    
    if (!token || !sessionId) {
      return Promise.reject(new Error('Token hoặc sessionId không tồn tại'));
    }
    
    // Gọi API merge với cả hai header
    return api.post('/cart/merge', {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Cart-Session-ID': sessionId
      }
    }).then(response => {
      // Sau khi merge thành công, xóa sessionId
      clearGuestSession();
      return response;
    });
  },
  
  // Lấy số lượng item trong giỏ hàng
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
  
  // Tính tổng tiền giỏ hàng
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
