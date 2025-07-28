import api from './config';

// Address API functions
export const addressAPI = {
  // Lấy danh sách địa chỉ của user hiện tại
  getAddresses: async () => {
    try {
      const response = await api.get('/users/me/addresses');
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  },

  // Thêm địa chỉ mới
  addAddress: async (addressData) => {
    try {
      const response = await api.post('/users/me/addresses', addressData);
      return response.data;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  },

  // Cập nhật địa chỉ
  updateAddress: async (addressId, addressData) => {
    try {
      const response = await api.put(`/users/me/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  // Xóa địa chỉ
  deleteAddress: async (addressId) => {
    try {
      const response = await api.delete(`/users/me/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  // Đặt địa chỉ mặc định
  setDefaultAddress: async (addressId) => {
    try {
      // Lấy địa chỉ hiện tại trước
      const addressResponse = await api.get('/users/me/addresses');
      const addresses = addressResponse.data?.data || [];
      const targetAddress = addresses.find(addr => addr.id === addressId);
      
      if (!targetAddress) {
        throw new Error('Không tìm thấy địa chỉ');
      }

      // Cập nhật địa chỉ thành mặc định
      const response = await api.put(`/users/me/addresses/${addressId}`, {
        ...targetAddress,
        isDefault: true
      });
      return response.data;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  },
};

export default addressAPI;
