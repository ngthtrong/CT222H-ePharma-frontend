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
