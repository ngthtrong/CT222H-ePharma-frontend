import api from './config';

export const productAPI = {
  // Lấy danh sách sản phẩm với filter
  getProducts: (params = {}) => {
    // Xây dựng object params cho filtering
    const queryParams = {};
    
    if (params.categoryId) queryParams.categoryId = params.categoryId;
    if (params.minPrice) queryParams.minPrice = params.minPrice;
    if (params.maxPrice) queryParams.maxPrice = params.maxPrice;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
    if (params.search) queryParams.search = params.search;
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.inStock) queryParams.inStock = params.inStock;
    if (params.brand) queryParams.brand = params.brand;
    
    return api.get('/products', { params: queryParams });
  },
  
  // Lấy chi tiết sản phẩm theo slug
  getProductBySlug: (slug) => api.get(`/products/${slug}`),
  
  // Lấy chi tiết sản phẩm theo ID
  getProductById: (id) => api.get(`/products/${id}`),
  
  // Tạo sản phẩm mới (Admin)
  createProduct: (productData) => api.post('/products', productData),
  
  // Cập nhật sản phẩm (Admin)
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  
  // Xóa sản phẩm (Admin)
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  // Lấy sản phẩm theo danh mục
  getProductsByCategory: (categorySlug, params = {}) => {
    return api.get(`/products/category/${categorySlug}`, { params });
  },
  
  // Tìm kiếm sản phẩm
  searchProducts: (query, params = {}) => {
    return api.get('/products/search', { 
      params: { ...params, q: query } 
    });
  },
  
  // Lấy sản phẩm liên quan
  getRelatedProducts: (productId) => api.get(`/products/${productId}/related`),
  
  // Lấy sản phẩm bán chạy
  getBestSellingProducts: (limit = 10) => api.get('/products/best-selling', { params: { limit } }),
  
  // Lấy sản phẩm mới
  getNewProducts: (limit = 10) => api.get('/products/new', { params: { limit } }),
  
  // Lấy sản phẩm khuyến mãi
  getDiscountedProducts: (limit = 10) => api.get('/products/discounted', { params: { limit } }),
};
