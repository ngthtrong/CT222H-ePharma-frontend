// Export tất cả API modules
export { authAPI } from './authApi';
export { productAPI } from './productApi';
export { categoryAPI } from './categoryApi';
export { cartAPI, createGuestSession, clearGuestSession } from './cartApi';
export { userAPI } from './userApi';
export { orderAPI } from './orderApi';
export { addressAPI } from './addressApi';
export { default as api } from './config';

// Export các hàm tiện ích
export const createAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
});

export const createGuestHeaders = (sessionId) => ({
  'X-Cart-Session-ID': sessionId,
});

export const createMergeHeaders = (token, sessionId) => ({
  'Authorization': `Bearer ${token}`,
  'X-Cart-Session-ID': sessionId,
});
