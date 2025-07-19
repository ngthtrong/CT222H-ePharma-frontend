import api from './config';

// User profile functions
export const getMyProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateMyProfile = async (profileData) => {
  const response = await api.put('/users/me', profileData);
  return response.data;
};

export const getMyAddresses = async () => {
  const response = await api.get('/users/me/addresses');
  return response.data;
};

export const addAddress = async (addressData) => {
  const response = await api.post('/users/me/addresses', addressData);
  return response.data;
};

export const updateAddress = async (addressId, addressData) => {
  const response = await api.put(`/users/me/addresses/${addressId}`, addressData);
  return response.data;
};

export const deleteAddress = async (addressId) => {
  const response = await api.delete(`/users/me/addresses/${addressId}`);
  return response.data;
};

// Legacy export
export const userAPI = {
  // Lấy danh sách users (Admin)
  getUsers: (params = {}) => {
    return api.get('/admin/users', { params });
  },
  
  // Lấy thông tin user theo ID
  getUserById: (id) => api.get(`/admin/users/${id}`),
  
  // Cập nhật thông tin user
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  
  // Xóa user (Admin)
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Cập nhật profile của user hiện tại
  updateProfile: (profileData) => api.put('/users/me', profileData),
  
  // Thay đổi mật khẩu
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
  
  // Cập nhật avatar
  updateAvatar: (avatarData) => api.put('/users/avatar', avatarData),
  
  // Lấy lịch sử đơn hàng của user
  getUserOrders: (params = {}) => {
    return api.get('/users/orders', { params });
  },
  
  // Lấy địa chỉ của user
  getUserAddresses: () => api.get('/users/me/addresses'),
  
  // Thêm địa chỉ mới
  addAddress: (addressData) => api.post('/users/me/addresses', addressData),
  
  // Cập nhật địa chỉ
  updateAddress: (addressId, addressData) => api.put(`/users/me/addresses/${addressId}`, addressData),
  
  // Xóa địa chỉ
  deleteAddress: (addressId) => api.delete(`/users/me/addresses/${addressId}`),
  
  // Đặt địa chỉ mặc định
  setDefaultAddress: (addressId) => api.put(`/users/me/addresses/${addressId}/default`),
};
