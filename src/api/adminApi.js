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
      const token = checkAdminToken(); // Kiểm tra token trước khi gọi API
      
      // Log để debug
      console.log('Admin API call with token:', {
        hasToken: !!token,
        tokenLength: token?.length,
        endpoint: args[0] || 'unknown'
      });
      
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

  // Advanced Analytics APIs (Based on Backend Guides)
  getAdvancedDashboard: adminApiCall((startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/admin/analytics/dashboard?${params.toString()}`);
  }),

  getRealTimeMetrics: adminApiCall(() => api.get('/admin/analytics/realtime')),

  // Alternative API endpoints from DASHBOARD-GUIDE.md
  getAdvancedDashboardAlternative: adminApiCall((startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/api/reports/advanced-dashboard?${params.toString()}`);
  }),

  getRealTimeMetricsAlternative: adminApiCall(() => api.get('/api/reports/real-time-metrics')),

  // Export APIs (Based on Backend Guides)
  exportRevenueExcel: adminApiCall((startDate, endDate, reportType) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (reportType) params.append('reportType', reportType);
    return api.get(`/admin/reports/revenue/export/excel?${params.toString()}`, {
      responseType: 'blob'
    });
  }),

  exportRevenuePdf: adminApiCall((startDate, endDate, reportType) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (reportType) params.append('reportType', reportType);
    return api.get(`/admin/reports/revenue/export/pdf?${params.toString()}`, {
      responseType: 'blob'
    });
  }),

  exportProductsExcel: adminApiCall((startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/admin/reports/products/export/excel?${params.toString()}`, {
      responseType: 'blob'
    });
  }),

  exportProductsPdf: adminApiCall((startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/admin/reports/products/export/pdf?${params.toString()}`, {
      responseType: 'blob'
    });
  }),

  exportOrdersExcel: adminApiCall((startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/admin/reports/orders/export/excel?${params.toString()}`, {
      responseType: 'blob'
    });
  }),

  exportOrdersPdf: adminApiCall((startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/admin/reports/orders/export/pdf?${params.toString()}`, {
      responseType: 'blob'
    });
  }),

  exportUsersExcel: adminApiCall((startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/admin/reports/users/export/excel?${params.toString()}`, {
      responseType: 'blob'
    });
  }),

  exportUsersPdf: adminApiCall((startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/admin/reports/users/export/pdf?${params.toString()}`, {
      responseType: 'blob'
    });
  }),

  // Alternative Export APIs from DASHBOARD-GUIDE.md
  exportRevenueExcelAlternative: adminApiCall((startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/api/reports/export/revenue-excel?${params.toString()}`, {
      responseType: 'blob'
    });
  }),

  exportProductPerformanceExcelAlternative: adminApiCall((startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/api/reports/export/product-performance-excel?${params.toString()}`, {
      responseType: 'blob'
    });
  }),
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

// Advanced Analytics Helper Functions
export const getAdvancedDashboardData = async (startDate, endDate) => {
  try {
    console.log('Calling getAdvancedDashboard with params:', { startDate, endDate });
    const response = await adminAPI.getAdvancedDashboard(startDate, endDate);
    console.log('getAdvancedDashboard response:', response);
    return response.data;
  } catch (primaryError) {
    console.warn('Primary getAdvancedDashboard failed, trying alternative:', primaryError.message);
    try {
      const response = await adminAPI.getAdvancedDashboardAlternative(startDate, endDate);
      console.log('getAdvancedDashboardAlternative response:', response);
      return response.data;
    } catch (fallbackError) {
      console.error('Both dashboard APIs failed:', {
        primary: primaryError.message,
        fallback: fallbackError.message
      });
      throw fallbackError;
    }
  }
};

export const getRealTimeMetricsData = async () => {
  try {
    console.log('Calling getRealTimeMetrics...');
    const response = await adminAPI.getRealTimeMetrics();
    console.log('getRealTimeMetrics response:', response);
    return response.data;
  } catch (primaryError) {
    console.warn('Primary getRealTimeMetrics failed, trying alternative:', primaryError.message);
    try {
      const response = await adminAPI.getRealTimeMetricsAlternative();
      console.log('getRealTimeMetricsAlternative response:', response);
      return response.data;
    } catch (fallbackError) {
      console.error('Both real-time metrics APIs failed:', {
        primary: primaryError.message,
        fallback: fallbackError.message
      });
      throw fallbackError;
    }
  }
};

// Export Helper Functions
export const exportReport = async (type, format, startDate, endDate, reportType = null) => {
  try {
    let response;
    
    switch (type) {
      case 'revenue':
        response = format === 'excel' 
          ? await adminAPI.exportRevenueExcel(startDate, endDate, reportType)
          : await adminAPI.exportRevenuePdf(startDate, endDate, reportType);
        break;
      case 'products':
        response = format === 'excel' 
          ? await adminAPI.exportProductsExcel(startDate, endDate)
          : await adminAPI.exportProductsPdf(startDate, endDate);
        break;
      case 'orders':
        response = format === 'excel' 
          ? await adminAPI.exportOrdersExcel(startDate, endDate)
          : await adminAPI.exportOrdersPdf(startDate, endDate);
        break;
      case 'users':
        response = format === 'excel' 
          ? await adminAPI.exportUsersExcel(startDate, endDate)
          : await adminAPI.exportUsersPdf(startDate, endDate);
        break;
      default:
        throw new Error('Invalid export type');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error exporting ${type} report as ${format}:`, error);
    throw error;
  }
};
