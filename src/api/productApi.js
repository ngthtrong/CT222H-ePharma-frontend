import api from './config';

export const productAPI = {
  // Lấy danh sách sản phẩm với filter
  getProducts: (params = {}) => {
    // Public API không hỗ trợ filter, chỉ lấy tất cả sản phẩm
    return api.get('/products');
  },

  // Lấy sản phẩm với filter (sử dụng admin API cho filtering)
  getProductsWithFilters: (params = {}) => {
    // Xây dựng object params cho admin API filtering
    const queryParams = {};
    
    if (params.category) queryParams.category = params.category;
    if (params.brand) queryParams.brand = params.brand;
    if (params.minPrice) queryParams.minPrice = params.minPrice;
    if (params.maxPrice) queryParams.maxPrice = params.maxPrice;
    if (params.inStock !== undefined) queryParams.inStock = params.inStock;
    if (params.search) queryParams.search = params.search;
    
    return api.get('/admin/products', { params: queryParams });
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

// Direct export functions for easier use
export const getProducts = async (params = {}) => {
  // Nếu có filter params, sử dụng admin API, nếu không dùng public API
  const hasFilters = params.category || params.minPrice || params.maxPrice || params.search;
  
  if (hasFilters) {
    const response = await productAPI.getProductsWithFilters(params);
    return response.data;
  } else {
    const response = await productAPI.getProducts();
    return response.data;
  }
};

export const getProductsWithFilters = async (params = {}) => {
  const response = await productAPI.getProductsWithFilters(params);
  return response.data;
};

export const getProductBySlug = async (slug) => {
  const response = await productAPI.getProductBySlug(slug);
  return response.data;
};

export const getRelatedProducts = async (productId) => {
  const response = await productAPI.getRelatedProducts(productId);
  return response.data;
};

export const searchProducts = async (query, params = {}) => {
  const response = await productAPI.searchProducts(query, params);
  return response.data;
};
