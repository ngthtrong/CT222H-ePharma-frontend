import api from './config';

export const adminAPI = {
  // Dashboard - Thống kê tổng quan
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // Đơn hàng gần đây
  getRecentOrders: (limit = 10) => api.get(`/admin/dashboard/recent-orders?limit=${limit}`),
  
  // Sản phẩm bán chạy
  getTopProducts: (limit = 10) => api.get(`/admin/dashboard/top-products?limit=${limit}`),
  
  // Quản lý sản phẩm
  getAdminProducts: (params = {}) => {
    return api.get('/admin/products', { params });
  },
  
  createProduct: (productData) => api.post('/admin/products', productData),
  
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  
  getProductById: (id) => api.get(`/admin/products/${id}`),
  
  // Quản lý đơn hàng
  getAllOrders: (params = {}) => {
    return api.get('/admin/orders', { params });
  },
  
  getOrderById: (id) => api.get(`/admin/orders/${id}`),
  
  getOrderByCode: (orderCode) => api.get(`/admin/orders/code/${orderCode}`),
  
  updateOrderStatus: (orderId, statusData) => {
    return api.patch(`/admin/orders/${orderId}/status`, statusData);
  },
  
  updatePaymentStatus: (orderId, paymentStatusData) => {
    return api.put(`/admin/orders/${orderId}/payment-status`, paymentStatusData);
  },
  
  deleteOrder: (id) => api.delete(`/admin/orders/${id}`),
  
  getOrderStats: (params = {}) => {
    return api.get('/admin/orders/stats', { params });
  },
  
  // Quản lý danh mục
  getAdminCategories: () => api.get('/admin/categories'),
  
  getCategoryById: (id) => api.get(`/admin/categories/${id}`),
  
  createCategory: (categoryData) => api.post('/admin/categories', categoryData),
  
  updateCategory: (id, categoryData) => api.put(`/admin/categories/${id}`, categoryData),
  
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  
  // Quản lý người dùng
  getAllUsers: (params = {}) => {
    return api.get('/admin/users', { params });
  },
  
  getUserById: (id) => api.get(`/admin/users/${id}`),
  
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Quản lý khuyến mãi
  getPromotions: (params = {}) => {
    return api.get('/admin/promotions', { params });
  },
  
  getPromotionById: (id) => api.get(`/admin/promotions/${id}`),
  
  createPromotion: (promotionData) => api.post('/admin/promotions', promotionData),
  
  updatePromotion: (id, promotionData) => api.put(`/admin/promotions/${id}`, promotionData),
  
  deletePromotion: (id) => api.delete(`/admin/promotions/${id}`),
  
  // Quản lý đánh giá
  getAllReviews: (params = {}) => {
    return api.get('/admin/reviews', { params });
  },
  
  getReviewById: (id) => api.get(`/admin/reviews/${id}`),
  
  replyToReview: (id, responseData) => {
    return api.put(`/admin/reviews/${id}/reply`, responseData);
  },
  
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
  
  // Báo cáo và thống kê
  getRevenueReport: (params = {}) => {
    return api.get('/admin/reports/revenue', { params });
  },
  
  getSalesReport: (params = {}) => {
    return api.get('/admin/reports/sales', { params });
  },
  
  getCustomerReport: (params = {}) => {
    return api.get('/admin/reports/customers', { params });
  },
  
  getInventoryReport: (params = {}) => {
    return api.get('/admin/reports/inventory', { params });
  },
  
  // Quản lý thông báo
  getNotifications: (params = {}) => {
    return api.get('/admin/notifications', { params });
  },
  
  createNotification: (notificationData) => api.post('/admin/notifications', notificationData),
  
  updateNotification: (id, notificationData) => api.put(`/admin/notifications/${id}`, notificationData),
  
  deleteNotification: (id) => api.delete(`/admin/notifications/${id}`),
  
  sendNotification: (id) => api.post(`/admin/notifications/${id}/send`),
  
  markNotificationAsRead: (id) => api.put(`/admin/notifications/${id}/read`),
};

// Helper functions for easier use
export const getDashboardStats = async () => {
  try {
    const response = await adminAPI.getDashboardStats();
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getRecentOrders = async (limit = 10) => {
  try {
    const response = await adminAPI.getRecentOrders(limit);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

export const getTopProducts = async (limit = 10) => {
  try {
    const response = await adminAPI.getTopProducts(limit);
    return response.data;
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
};

export const getAllOrdersAdmin = async (params = {}) => {
  try {
    const response = await adminAPI.getAllOrders(params);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    throw error;
  }
};

export const updateOrderStatusAdmin = async (orderId, status) => {
  try {
    const response = await adminAPI.updateOrderStatus(orderId, status);
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const getAllUsersAdmin = async (params = {}) => {
  try {
    const response = await adminAPI.getAllUsers(params);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
};
