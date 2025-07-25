import api from './config';

export const categoryAPI = {
  // Lấy danh sách danh mục
  getCategories: () => api.get('/categories'),
  
  // Lấy chi tiết danh mục theo slug
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`),
  

  
  // Tạo danh mục mới (Admin)
  createCategory: (categoryData) => api.post('/categories', categoryData),
  
  // Cập nhật danh mục (Admin)
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  
  // Xóa danh mục (Admin)
  deleteCategory: (id) => api.delete(`/categories/${id}`),

};

// Direct export functions for easier use
export const getCategories = async () => {
  const response = await categoryAPI.getCategories();
  return response.data.data; // Truy cập vào data.data vì API trả về {success, message, data}
};

export const getCategoryBySlug = async (slug) => {
  const response = await categoryAPI.getCategoryBySlug(slug);
  return response.data.data; // Tương tự cho consistency
};

export const getParentCategories = async () => {
  try {
    const response = await categoryAPI.getCategories();
    const allCategories = response.data.data; // Truy cập vào data.data
    
    console.log('All categories from API:', allCategories);
    
    // Kiểm tra nếu dữ liệu là array
    if (!Array.isArray(allCategories)) {
      console.error('Categories data is not an array:', allCategories);
      return [];
    }
    
    // Lọc ra chỉ các danh mục gốc (parentCategoryId === null)
    const parentCategories = allCategories.filter(category => {
      return category.parentCategoryId === null;
    });
    
    console.log('Filtered parent categories:', parentCategories);
    return parentCategories;
    
  } catch (error) {
    console.error('Error in getParentCategories:', error.toJSON());
    return [];
  }
};
