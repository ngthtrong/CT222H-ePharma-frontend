import api from './config';

export const authAPI = {
  // Đăng ký tài khoản
  register: (userData) => api.post('/auth/register', userData),
  
  // Đăng nhập
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Đăng xuất
  logout: () => api.post('/auth/logout'),
  
  // Lấy profile người dùng
  getProfile: () => api.get('/auth/profile'),
  
  // Refresh token
  refreshToken: () => api.post('/auth/refresh'),
  
  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};
