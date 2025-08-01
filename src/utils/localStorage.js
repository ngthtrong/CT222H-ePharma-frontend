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
    // Xóa các localStorage keys cơ bản liên quan đến authentication
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    
    // Xóa các localStorage keys liên quan đến OAuth2
    localStorage.removeItem('oauth2_state');
    localStorage.removeItem('oauth2_provider');
    localStorage.removeItem('oauth2_redirect_url');
    
    // Xóa các localStorage keys liên quan đến admin session
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminSession');
    
    // Xóa các localStorage keys tạm thời khác
    localStorage.removeItem('tempLoginData');
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lastLoginTime');
    
    // Xóa các keys liên quan đến cache không cần thiết
    localStorage.removeItem('apiCache');
    localStorage.removeItem('userPreferences');
    
    console.log('🧹 Cleared authentication and unnecessary localStorage data');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

/**
 * Xóa toàn bộ localStorage khi đăng xuất hoàn toàn (nâng cao)
 * Chỉ giữ lại những keys cần thiết như theme, language preferences
 */
export const clearAllUnnecessaryData = () => {
  try {
    // Danh sách các keys cần GIỮ LẠI
    const keysToKeep = [
      'theme',
      'language', 
      'i18nextLng',
      'colorMode',
      'layoutPreferences',
      'cookieConsent',
      'tourCompleted',
      'welcomeShown'
    ];
    
    // Lấy tất cả keys hiện có
    const allKeys = Object.keys(localStorage);
    
    // Xóa các keys không cần thiết
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('🧽 Performed comprehensive localStorage cleanup, kept essential preferences');
  } catch (error) {
    console.error('Error clearing unnecessary data:', error);
  }
};

/**
 * Debug function: Hiển thị tất cả localStorage keys hiện có
 */
export const debugLocalStorage = () => {
  try {
    const allKeys = Object.keys(localStorage);
    console.group('🔍 Current localStorage keys:');
    
    if (allKeys.length === 0) {
      console.log('No localStorage keys found');
    } else {
      allKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`${key}:`, value?.length > 100 ? `${value.substring(0, 100)}...` : value);
      });
    }
    
    console.groupEnd();
    return allKeys;
  } catch (error) {
    console.error('Error debugging localStorage:', error);
    return [];
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
