import api from './config';



// Auth API functions with proper response handling
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const logout = async () => {
  // Token sẽ được tự động thêm vào header bởi request interceptor trong config.js
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

// Legacy export for backward compatibility
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  getMyProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/users/me', profileData);
    return response.data;
  },
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};
