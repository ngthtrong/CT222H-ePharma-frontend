import api from './config';

export const categoryAPI = {
  // Lấy danh sách danh mục
  getCategories: () => api.get('/categories'),
  
  // Lấy chi tiết danh mục theo slug
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`),
  
  // Lấy chi tiết danh mục theo ID
  getCategoryById: (id) => api.get(`/categories/${id}`),
  
  // Tạo danh mục mới (Admin)
  createCategory: (categoryData) => api.post('/categories', categoryData),
  
  // Cập nhật danh mục (Admin)
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  
  // Xóa danh mục (Admin)
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  
  // Lấy danh mục cha
  getParentCategories: () => api.get('/categories/parents'),
  
  // Lấy danh mục con
  getChildCategories: (parentId) => api.get(`/categories/${parentId}/children`),
};

// Direct export functions for easier use
export const getCategories = async () => {
  const response = await categoryAPI.getCategories();
  return response.data;
};

export const getCategoryBySlug = async (slug) => {
  const response = await categoryAPI.getCategoryBySlug(slug);
  return response.data;
};

export const getParentCategories = async () => {
  const response = await categoryAPI.getParentCategories();
  return response.data;
};

export const getChildCategories = async (parentId) => {
  const response = await categoryAPI.getChildCategories(parentId);
  return response.data;
};
