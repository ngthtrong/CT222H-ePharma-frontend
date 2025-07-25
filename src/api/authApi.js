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
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/users/me'),
  getMyProfile: () => api.get('/users/me'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};
