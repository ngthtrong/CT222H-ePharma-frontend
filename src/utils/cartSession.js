import { getSessionId, setSessionId, clearSessionId } from './localStorage';

/**
 * Utility functions để quản lý X-Cart-Session-ID
 */

/**
 * Tạo session ID mới cho guest cart
 * @returns {string} Session ID
 */
export const createCartSessionId = () => {
  const sessionId = crypto.randomUUID();
  setSessionId(sessionId);
  console.log('New cart session ID created:', sessionId);
  return sessionId;
};

/**
 * Lấy session ID hiện tại hoặc tạo mới nếu chưa có
 * @returns {string} Session ID
 */
export const getOrCreateCartSessionId = () => {
  let sessionId = getSessionId();
  if (!sessionId) {
    sessionId = createCartSessionId();
  }
  return sessionId;
};

/**
 * Kiểm tra xem có session ID nào đang được lưu không
 * @returns {boolean} True nếu có session ID
 */
export const hasCartSessionId = () => {
  const sessionId = getSessionId();
  return !!sessionId;
};

/**
 * Xóa session ID (thường sau khi merge cart thành công)
 */
export const removeCartSessionId = () => {
  clearSessionId();
  console.log('Cart session ID has been removed');
};

/**
 * Log thông tin debug về cart session
 */
export const debugCartSession = () => {
  const sessionId = getSessionId();
  const isAuthenticated = !!localStorage.getItem('accessToken');
  
  console.log('=== Cart Session Debug ===');
  console.log('Session ID:', sessionId || 'Not found');
  console.log('Is Authenticated:', isAuthenticated);
  console.log('Should merge cart:', !isAuthenticated && !!sessionId);
  console.log('========================');
};
