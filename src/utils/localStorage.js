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
    console.error('Error saving to localStorage:', error);
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
    console.error('Error getting from localStorage:', error);
    // Nếu có lỗi parse, xóa key bị lỗi và trả về default value
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
    console.error('Error removing from localStorage:', error);
  }
};

/**
 * Xóa tất cả data khỏi localStorage
 */
export const clearLocalStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
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
        console.log(`Removed invalid localStorage item: ${key}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning localStorage:', error);
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
    console.error('Error saving to sessionStorage:', error);
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
    console.error('Error getting from sessionStorage:', error);
    // Nếu có lỗi parse, xóa key bị lỗi và trả về default value
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
    console.error('Error removing from sessionStorage:', error);
  }
};

/**
 * Xóa tất cả data khỏi sessionStorage
 */
export const clearSessionStorage = () => {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
  }
};

const SESSION_ID_KEY = 'cartSessionId';

export const getSessionId = () => {
  return localStorage.getItem(SESSION_ID_KEY);
};

export const setSessionId = (sessionId) => {
  localStorage.setItem(SESSION_ID_KEY, sessionId);
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
