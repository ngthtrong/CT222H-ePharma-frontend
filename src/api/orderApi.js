import api from './config';

export const orderAPI = {
  // USER ENDPOINTS
  
  // Lấy danh sách đơn hàng của user
  getUserOrders: () => api.get('/orders'),
  
  // Lấy chi tiết đơn hàng theo mã đơn hàng
  getUserOrderByCode: (orderCode) => api.get(`/orders/${orderCode}`),
  
  // Tạo đơn hàng mới
  createOrder: (orderData) => api.post('/orders', orderData),
  
  // Hủy đơn hàng
  cancelOrder: (orderCode, reason) => {
    return api.patch(`/orders/${orderCode}/cancel`, { reason });
  },

  // ADMIN ENDPOINTS
  
  // Lấy tất cả đơn hàng (có bộ lọc)
  getAllOrders: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/admin/orders?${params}`);
  },
  
  // Lấy chi tiết đơn hàng theo ID (Admin)
  getOrderById: (orderId) => api.get(`/admin/orders/${orderId}`),
  
  // Lấy chi tiết đơn hàng theo mã (Admin)
  getOrderByCode: (orderCode) => api.get(`/admin/orders/code/${orderCode}`),
  
  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: (orderId, status, notes = null) => {
    const data = { status };
    if (notes) {
      data.notes = notes;
    }
    
    // Sử dụng PATCH method - backend đã fix lỗi CORS
    return api.patch(`/admin/orders/${orderId}/status`, data);
  },
  
  // Cập nhật trạng thái thanh toán
  updatePaymentStatus: (orderId, paymentStatus) => {
    return api.put(`/admin/orders/${orderId}/payment-status?paymentStatus=${paymentStatus}`);
  },
  
  // Xóa đơn hàng
  deleteOrder: (orderId) => api.delete(`/admin/orders/${orderId}`),

  // LEGACY ENDPOINTS (để tương thích)
  
  // Lấy thống kê đơn hàng (Admin)
  getOrderStats: (params = {}) => {
    return api.get('/admin/orders/stats', { params });
  },
  
  // Theo dõi đơn hàng
  trackOrder: (orderId) => api.get(`/orders/${orderId}/tracking`),
  
  // Xác nhận đã nhận hàng
  confirmReceived: (orderId) => api.put(`/orders/${orderId}/confirm-received`),
  
  // Yêu cầu trả hàng/hoàn tiền
  requestReturn: (orderId, returnData) => {
    return api.post(`/orders/${orderId}/return`, returnData);
  },
  
  // Đánh giá đơn hàng
  rateOrder: (orderId, rating, review) => {
    return api.post(`/orders/${orderId}/rate`, { rating, review });
  },
};

// Direct export functions for easier use
export const createOrder = async (orderData) => {
  const response = await orderAPI.createOrder(orderData);
  return response.data;
};

export const getMyOrders = async (params = {}) => {
  const response = await orderAPI.getUserOrders(params);
  return response.data;
};

export const getOrderByCode = async (orderCode) => {
  const response = await orderAPI.getOrderById(orderCode);
  return response.data;
};

export const cancelOrder = async (orderCode, reason) => {
  const response = await orderAPI.cancelOrder(orderCode, reason);
  return response.data;
};

export const getAllOrders = async (params = {}) => {
  const response = await orderAPI.getAllOrders(params);
  return response.data;
};

export const updateOrderStatus = async (orderCode, status) => {
  const response = await orderAPI.updateOrderStatus(orderCode, status);
  return response.data;
};
