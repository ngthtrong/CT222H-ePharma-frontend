import api from './config';

export const orderAPI = {
  // Tạo đơn hàng mới
  createOrder: (orderData) => api.post('/orders', orderData),
  
  // Lấy danh sách đơn hàng của user
  getUserOrders: (params = {}) => {
    return api.get('/orders', { params });
  },
  
  // Lấy chi tiết đơn hàng
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  
  // Cập nhật trạng thái đơn hàng (Admin)
  updateOrderStatus: (orderId, status) => {
    return api.put(`/orders/${orderId}/status`, { status });
  },
  
  // Hủy đơn hàng
  cancelOrder: (orderId, reason) => {
    return api.put(`/orders/${orderId}/cancel`, { reason });
  },
  
  // Lấy tất cả đơn hàng (Admin)
  getAllOrders: (params = {}) => {
    return api.get('/admin/orders', { params });
  },
  
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
