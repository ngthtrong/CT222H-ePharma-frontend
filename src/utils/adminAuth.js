/**
 * Utility functions để xử lý admin authentication và token
 */

/**
 * Kiểm tra xem user hiện tại có phải admin không
 * @returns {boolean} true nếu là admin
 */
export const isAdmin = () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    const payload = JSON.parse(atob(token.split('.')[1]));
    // Case-insensitive role checking để handle cả 'admin' và 'ADMIN'
    return (payload.role && payload.role.toUpperCase() === 'ADMIN') || payload.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Kiểm tra xem token có hợp lệ và chưa hết hạn không
 * @returns {boolean} true nếu token hợp lệ
 */
export const isTokenValid = () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

/**
 * Kiểm tra xem user có quyền admin và token hợp lệ không
 * @returns {boolean} true nếu có quyền admin và token hợp lệ
 */
export const canAccessAdmin = () => {
  return isTokenValid() && isAdmin();
};

/**
 * Lấy thông tin chi tiết từ token
 * @returns {object|null} Thông tin user từ token hoặc null nếu không hợp lệ
 */
export const getTokenInfo = () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return {
      userId: payload.userId || payload.id,
      email: payload.email,
      role: payload.role,
      isAdmin: (payload.role && payload.role.toUpperCase() === 'ADMIN') || payload.isAdmin === true,
      isExpired: payload.exp < currentTime,
      expiresAt: new Date(payload.exp * 1000),
      iat: new Date(payload.iat * 1000),
    };
  } catch (error) {
    console.error('Error getting token info:', error);
    return null;
  }
};

/**
 * Làm sạch token và user data khỏi localStorage
 */
export const clearAuthData = () => {
  console.log('Auth data cleared from localStorage');
  console.trace('clearAuthData called from:');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken'); // nếu có
};

/**
 * Redirect đến trang login với thông báo lỗi phù hợp
 * @param {string} errorType - Loại lỗi ('admin_auth_required' hoặc 'admin_access_denied')
 */
export const redirectToLogin = (errorType = 'admin_auth_required') => {
  console.log('redirectToLogin called with errorType:', errorType);
  console.trace('redirectToLogin called from:');
  clearAuthData();
  
  const errorMessages = {
    admin_auth_required: 'Vui lòng đăng nhập với tài khoản admin để tiếp tục',
    admin_access_denied: 'Bạn không có quyền truy cập vào khu vực quản trị',
    token_expired: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
  };

  const message = errorMessages[errorType] || 'Vui lòng đăng nhập để tiếp tục';
  window.location.href = `/login?error=${errorType}&message=${encodeURIComponent(message)}`;
};

/**
 * Hook để kiểm tra quyền admin trong component
 * @returns {object} Trạng thái admin và các function helper
 */
export const useAdminAuth = () => {
  const [adminStatus, setAdminStatus] = React.useState({
    isAdmin: false,
    isTokenValid: false,
    canAccessAdmin: false,
    tokenInfo: null,
    loading: true,
  });

  React.useEffect(() => {
    const checkAdminStatus = () => {
      const tokenInfo = getTokenInfo();
      const adminAuth = {
        isAdmin: isAdmin(),
        isTokenValid: isTokenValid(),
        canAccessAdmin: canAccessAdmin(),
        tokenInfo,
        loading: false,
      };
      
      setAdminStatus(adminAuth);
    };

    checkAdminStatus();

    // Kiểm tra lại mỗi 30 giây để catch token expiration
    const interval = setInterval(checkAdminStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    ...adminStatus,
    clearAuthData,
    redirectToLogin,
  };
};

/**
 * Wrapper function để đảm bảo admin auth cho các async operations
 * @param {Function} asyncFn - Function async cần được bảo vệ
 * @returns {Function} Wrapped function với admin auth check
 */
export const withAdminAuth = (asyncFn) => {
  return async (...args) => {
    if (!canAccessAdmin()) {
      const errorType = isTokenValid() ? 'admin_access_denied' : 'admin_auth_required';
      redirectToLogin(errorType);
      throw new Error('Admin authentication required');
    }
    
    return await asyncFn(...args);
  };
};

/**
 * Interceptor để tự động redirect khi token hết hạn
 */
export const setupAdminAuthInterceptor = () => {
  // Kiểm tra token expiration mỗi 60 giây
  setInterval(() => {
    if (window.location.pathname.startsWith('/admin') && !isTokenValid()) {
      console.log('Auto-redirecting due to invalid token');
      redirectToLogin('token_expired');
    }
  }, 60000);
};

// Auto setup interceptor khi module được import  
if (typeof window !== 'undefined') {
  console.log('Auto-setting up admin auth interceptor');
  setupAdminAuthInterceptor();
}
