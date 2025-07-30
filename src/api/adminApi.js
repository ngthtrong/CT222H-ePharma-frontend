import api from './config';

// Utility function để kiểm tra token admin
const checkAdminToken = () => {
  const token = localStorage.getItem('accessToken');
  console.log('Checking admin token:', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenStart: token ? token.substring(0, 20) + '...' : 'null'
  });
  
  if (!token) {
    console.error('Admin API called without token');
    throw new Error('Admin access requires authentication token');
  }
  return token;
};

// Wrapper function để đảm bảo token cho admin calls  
const adminApiCall = (apiCall) => {
  return (...args) => {
    try {
      checkAdminToken(); // Kiểm tra token trước khi gọi API
      return apiCall(...args);
    } catch (error) {
      console.error('Admin API call failed:', error.message);
      throw error;
    }
  };
};

export const adminAPI = {
  // Dashboard - Thống kê tổng quan
  getDashboardStats: adminApiCall(() => api.get('/admin/dashboard/stats')),
  
  // Đơn hàng gần đây
  getRecentOrders: adminApiCall((limit = 10) => api.get(`/admin/dashboard/recent-orders?limit=${limit}`)),
  
  // Sản phẩm bán chạy
  getTopProducts: adminApiCall((limit = 10) => api.get(`/admin/dashboard/top-products?limit=${limit}`)),
  
  // Quản lý sản phẩm
  getAdminProducts: adminApiCall((params = {}) => {
    return api.get('/admin/products', { params });
  }),
  
  createProduct: adminApiCall((productData) => api.post('/admin/products', productData)),
  
  updateProduct: adminApiCall((id, productData) => api.put(`/admin/products/${id}`, productData)),
  
  deleteProduct: adminApiCall((id) => api.delete(`/admin/products/${id}`)),
  
  getProductById: adminApiCall((id) => api.get(`/admin/products/${id}`)),
  
  // Quản lý đơn hàng
  getAllOrders: adminApiCall((params = {}) => {
    return api.get('/admin/orders', { params });
  }),
  
  getOrderById: adminApiCall((id) => api.get(`/admin/orders/${id}`)),
  
  getOrderByCode: adminApiCall((orderCode) => api.get(`/admin/orders/code/${orderCode}`)),
  
  updateOrderStatus: adminApiCall((orderId, statusData) => {
    return api.patch(`/admin/orders/${orderId}/status`, statusData);
  }),
  
  updatePaymentStatus: adminApiCall((orderId, paymentStatusData) => {
    return api.put(`/admin/orders/${orderId}/payment-status`, paymentStatusData);
  }),
  
  deleteOrder: adminApiCall((id) => api.delete(`/admin/orders/${id}`)),
  
  getOrderStats: adminApiCall((params = {}) => {
    return api.get('/admin/orders/stats', { params });
  }),
  
  // Quản lý danh mục
  getAdminCategories: adminApiCall(() => api.get('/admin/categories')),
  
  getCategoryById: adminApiCall((id) => api.get(`/admin/categories/${id}`)),
  
  createCategory: adminApiCall((categoryData) => api.post('/admin/categories', categoryData)),
  
  updateCategory: adminApiCall((id, categoryData) => api.put(`/admin/categories/${id}`, categoryData)),
  
  deleteCategory: adminApiCall((id) => api.delete(`/admin/categories/${id}`)),
  
  // Quản lý người dùng
  getAllUsers: adminApiCall((params = {}) => {
    return api.get('/admin/users', { params });
  }),
  
  getUserById: adminApiCall((id) => api.get(`/admin/users/${id}`)),
  
  updateUser: adminApiCall((id, userData) => api.put(`/admin/users/${id}`, userData)),
  
  deleteUser: adminApiCall((id) => api.delete(`/admin/users/${id}`)),
  
  // Quản lý khuyến mãi
  getPromotions: adminApiCall((params = {}) => {
    return api.get('/admin/promotions', { params });
  }),
  
  getPromotionById: adminApiCall((id) => api.get(`/admin/promotions/${id}`)),
  
  createPromotion: adminApiCall((promotionData) => api.post('/admin/promotions', promotionData)),
  
  updatePromotion: adminApiCall((id, promotionData) => api.put(`/admin/promotions/${id}`, promotionData)),
  
  deletePromotion: adminApiCall((id) => api.delete(`/admin/promotions/${id}`)),
  
  // Quản lý đánh giá
  getAllReviews: adminApiCall((params = {}) => {
    return api.get('/admin/reviews', { params });
  }),
  
  getReviewById: adminApiCall((id) => api.get(`/admin/reviews/${id}`)),
  
  replyToReview: adminApiCall((id, responseData) => {
    return api.put(`/admin/reviews/${id}/reply`, responseData);
  }),
  
  deleteReview: adminApiCall((id) => api.delete(`/admin/reviews/${id}`)),
  
  // Báo cáo và thống kê
  getRevenueReport: adminApiCall((params = {}) => {
    return api.get('/admin/reports/revenue', { params });
  }),
  
  getSalesReport: adminApiCall((params = {}) => {
    return api.get('/admin/reports/sales', { params });
  }),
  
  getCustomerReport: adminApiCall((params = {}) => {
    return api.get('/admin/reports/customers', { params });
  }),
  
  getInventoryReport: adminApiCall((params = {}) => {
    return api.get('/admin/reports/inventory', { params });
  }),
  
  // Quản lý thông báo
  getNotifications: adminApiCall((params = {}) => {
    return api.get('/admin/notifications', { params });
  }),
  
  createNotification: adminApiCall((notificationData) => api.post('/admin/notifications', notificationData)),
  
  updateNotification: adminApiCall((id, notificationData) => api.put(`/admin/notifications/${id}`, notificationData)),
  
  deleteNotification: adminApiCall((id) => api.delete(`/admin/notifications/${id}`)),
  
  sendNotification: adminApiCall((id) => api.post(`/admin/notifications/${id}/send`)),
  
  markNotificationAsRead: adminApiCall((id) => api.put(`/admin/notifications/${id}/read`)),
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
