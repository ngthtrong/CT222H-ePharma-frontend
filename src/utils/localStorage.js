/**
 * Lưu data vào localStorage
 * @param {string} key - Key để lưu
 * @param {*} value - Value cần lưu
 */
export const setLocalStorage = (key, value) => {
  try {
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
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error getting from localStorage:', error);
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
 * Lưu data vào sessionStorage
 * @param {string} key - Key để lưu
 * @param {*} value - Value cần lưu
 */
export const setSessionStorage = (key, value) => {
  try {
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
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error getting from sessionStorage:', error);
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
