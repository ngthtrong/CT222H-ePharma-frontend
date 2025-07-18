import api from './config';

export const userAPI = {
  // Lấy danh sách users (Admin)
  getUsers: (params = {}) => {
    return api.get('/users', { params });
  },
  
  // Lấy thông tin user theo ID
  getUserById: (id) => api.get(`/users/${id}`),
  
  // Cập nhật thông tin user
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  
  // Xóa user (Admin)
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  // Cập nhật profile của user hiện tại
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  
  // Thay đổi mật khẩu
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
  
  // Cập nhật avatar
  updateAvatar: (avatarData) => api.put('/users/avatar', avatarData),
  
  // Lấy lịch sử đơn hàng của user
  getUserOrders: (params = {}) => {
    return api.get('/users/orders', { params });
  },
  
  // Lấy địa chỉ của user
  getUserAddresses: () => api.get('/users/addresses'),
  
  // Thêm địa chỉ mới
  addAddress: (addressData) => api.post('/users/addresses', addressData),
  
  // Cập nhật địa chỉ
  updateAddress: (addressId, addressData) => api.put(`/users/addresses/${addressId}`, addressData),
  
  // Xóa địa chỉ
  deleteAddress: (addressId) => api.delete(`/users/addresses/${addressId}`),
  
  // Đặt địa chỉ mặc định
  setDefaultAddress: (addressId) => api.put(`/users/addresses/${addressId}/default`),
};
