/**
 * Utility functions for JWT token handling
 */

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeJWT = (token) => {
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired, false if valid
 */
export const isTokenExpired = (token) => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return null;
  
  return new Date(payload.exp * 1000);
};

/**
 * Get time until token expires in seconds
 * @param {string} token - JWT token
 * @returns {number} - Seconds until expiration, negative if expired
 */
export const getTimeUntilExpiration = (token) => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return -1;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp - currentTime;
};

/**
 * Validate token format and basic structure
 * @param {string} token - JWT token
 * @returns {boolean} - True if valid format
 */
export const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  try {
    // Try to decode each part
    atob(parts[0]); // header
    atob(parts[1]); // payload
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check if error indicates token is invalidated/revoked
 * @param {object} error - Axios error object
 * @returns {boolean} - True if token is invalidated
 */
export const isTokenInvalidatedError = (error) => {
  if (!error.response) return false;
  
  const status = error.response.status;
  const message = error.response.data?.message || '';
  
  // Check for specific invalidation messages
  const invalidationKeywords = [
    'Token đã bị vô hiệu hóa',
    'token đã hết hạn',
    'token không hợp lệ',
    'token has been invalidated',
    'token expired',
    'invalid token'
  ];
  
  return (status === 401 || status === 500) && 
         invalidationKeywords.some(keyword => 
           message.toLowerCase().includes(keyword.toLowerCase())
         );
};
