/**
 * Lưu data vào localStorage
 * @param {string} key - Key để lưu
 * @param {*} value - Value cần lưu
 */
export const setLocalStorage = (key, value) => {
  try {
    // Không lưu nếu value là undefined hoặc null
    if (value === undefined || value === null) {
      localStorage.removeItem(key);
      return;
    }
    
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Error saving to localStorage
  }
};

/**
 * Lấy data từ localStorage
 * @param {string} key - Key cần lấy
 * @param {*} defaultValue - Default value nếu không tìm thấy
 * @returns {*} - Value đã lưu hoặc default value
 */
export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    
    // Kiểm tra nếu item là null, undefined, hoặc chuỗi "undefined"
    if (item === null || item === undefined || item === 'undefined') {
      return defaultValue;
    }
    
    return JSON.parse(item);
  } catch (error) {
    // Error getting from localStorage, clean up and return default
    localStorage.removeItem(key);
    return defaultValue;
  }
};

/**
 * Xóa key khỏi localStorage
 * @param {string} key - Key cần xóa
 */
export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // Error removing from localStorage
  }
};

/**
 * Xóa tất cả data khỏi localStorage
 */
export const clearLocalStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    // Error clearing localStorage
  }
};

/**
 * Clean up invalid localStorage data
 */
export const cleanupLocalStorage = () => {
  try {
    const keysToCheck = ['accessToken', 'user', 'cartSessionId'];
    keysToCheck.forEach(key => {
      const item = localStorage.getItem(key);
      if (item === 'undefined' || item === 'null') {
        localStorage.removeItem(key);
      }
    });
    
  } catch (error) {
    // Error cleaning localStorage
  }
};

/**
 * Clean up authentication data khi logout
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  } catch (error) {
    // Error clearing auth data
  }
};

/**
 * Lưu data vào sessionStorage
 * @param {string} key - Key để lưu
 * @param {*} value - Value cần lưu
 */
export const setSessionStorage = (key, value) => {
  try {
    // Không lưu nếu value là undefined hoặc null
    if (value === undefined || value === null) {
      sessionStorage.removeItem(key);
      return;
    }
    
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Error saving to sessionStorage
  }
};

/**
 * Lấy data từ sessionStorage
 * @param {string} key - Key cần lấy
 * @param {*} defaultValue - Default value nếu không tìm thấy
 * @returns {*} - Value đã lưu hoặc default value
 */
export const getSessionStorage = (key, defaultValue = null) => {
  try {
    const item = sessionStorage.getItem(key);
    
    // Kiểm tra nếu item là null, undefined, hoặc chuỗi "undefined"
    if (item === null || item === undefined || item === 'undefined') {
      return defaultValue;
    }
    
    return JSON.parse(item);
  } catch (error) {
    // Error getting from sessionStorage, clean up and return default
    sessionStorage.removeItem(key);
    return defaultValue;
  }
};

/**
 * Xóa key khỏi sessionStorage
 * @param {string} key - Key cần xóa
 */
export const removeSessionStorage = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    // Error removing from sessionStorage
  }
};

/**
 * Xóa tất cả data khỏi sessionStorage
 */
export const clearSessionStorage = () => {
  try {
    sessionStorage.clear();
  } catch (error) {
    // Error clearing sessionStorage
  }
};

const SESSION_ID_KEY = 'cartSessionId';

export const getSessionId = () => {
  return localStorage.getItem(SESSION_ID_KEY);
};

export const setSessionId = (sessionId) => {
  if (sessionId) {
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
};

export const clearSessionId = () => {
  localStorage.removeItem(SESSION_ID_KEY);
};

const ACCESS_TOKEN_KEY = 'accessToken';

export const getAccessToken = () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export const setAccessToken = (token) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export const clearAccessToken = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
}
