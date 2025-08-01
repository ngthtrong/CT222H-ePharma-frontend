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
    // Interceptor trong config.js sẽ tự động thêm token từ localStorage
    // Theo tài liệu API, logout không cần body
    const response = await api.post('/auth/logout');
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
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },
};

// OAuth2 API functions
export const oauth2API = {
  // Get authorization URL for OAuth2 provider
  getAuthUrl: async (provider) => {
    const response = await api.get(`/auth/oauth2/login/${provider}`);
    return response.data;
  },
  
  // Process OAuth2 callback with authorization code
  processCallback: async (provider, code, state) => {
    const response = await api.post(`/auth/oauth2/callback/${provider}`, {
      code,
      state
    });
    return response.data;
  },
  
  // Check OAuth2 status
  getStatus: async () => {
    const response = await api.get('/auth/oauth2/status');
    return response.data;
  }
};
