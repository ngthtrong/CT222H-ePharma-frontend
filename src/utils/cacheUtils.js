import { getLocalStorage, setLocalStorage, removeLocalStorage } from './localStorage';

/**
 * Cache utility for managing cached data with expiration
 */
export class CacheManager {
  constructor(prefix = 'cache') {
    this.prefix = prefix;
  }

  /**
   * Generate cache key with prefix
   */
  _getKey(key) {
    return `${this.prefix}_${key}`;
  }

  /**
   * Get cache key for timestamp
   */
  _getTimestampKey(key) {
    return `${this.prefix}_${key}_timestamp`;
  }

  /**
   * Set data to cache with expiration
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set(key, data, ttl = 5 * 60 * 1000) {
    try {
      const timestamp = Date.now();
      const expiresAt = timestamp + ttl;
      
      setLocalStorage(this._getKey(key), {
        data,
        expiresAt,
        timestamp
      });
      
      return true;
    } catch (error) {
      console.error('Error setting cache:', error);
      return false;
    }
  }

  /**
   * Get data from cache
   * @param {string} key - Cache key
   * @param {*} defaultValue - Default value if cache miss or expired
   * @returns {Object} - { data, isExpired, timestamp }
   */
  get(key, defaultValue = null) {
    try {
      const cached = getLocalStorage(this._getKey(key));
      
      if (!cached || !cached.expiresAt || !cached.timestamp) {
        return {
          data: defaultValue,
          isExpired: true,
          timestamp: null
        };
      }

      const now = Date.now();
      const isExpired = now > cached.expiresAt;
      
      return {
        data: isExpired ? defaultValue : cached.data,
        isExpired,
        timestamp: cached.timestamp
      };
    } catch (error) {
      console.error('Error getting cache:', error);
      return {
        data: defaultValue,
        isExpired: true,
        timestamp: null
      };
    }
  }

  /**
   * Check if cache is valid (not expired)
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  isValid(key) {
    const result = this.get(key);
    return !result.isExpired && result.data !== null;
  }

  /**
   * Remove data from cache
   * @param {string} key - Cache key
   */
  remove(key) {
    try {
      removeLocalStorage(this._getKey(key));
      return true;
    } catch (error) {
      console.error('Error removing cache:', error);
      return false;
    }
  }

  /**
   * Clear all cache with this prefix
   */
  clear() {
    try {
      const keysToRemove = [];
      
      // Get all localStorage keys and find matches
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all matching keys
      keysToRemove.forEach(key => {
        removeLocalStorage(key);
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Get formatted time since last update
   * @param {string} key - Cache key
   * @returns {string}
   */
  getTimeSinceUpdate(key) {
    const result = this.get(key);
    
    if (!result.timestamp) {
      return '';
    }
    
    const now = Date.now();
    const timeDiff = now - result.timestamp;
    const minutes = Math.floor(timeDiff / (60 * 1000));
    
    if (minutes < 1) return 'vừa cập nhật';
    if (minutes < 60) return `${minutes} phút trước`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  }
}

// Create default cache managers for common use cases
export const adminCache = new CacheManager('admin');
export const productCache = new CacheManager('product');
export const categoryCache = new CacheManager('category');

// Cache keys constants
export const CACHE_KEYS = {
  CATEGORY_PRODUCT_COUNTS: 'category_product_counts',
  ADMIN_CATEGORIES: 'admin_categories',
  ADMIN_PRODUCTS: 'admin_products',
  DASHBOARD_STATS: 'dashboard_stats',
};

// Cache durations constants (in milliseconds)
export const CACHE_DURATIONS = {
  SHORT: 2 * 60 * 1000,      // 2 minutes
  MEDIUM: 5 * 60 * 1000,     // 5 minutes  
  LONG: 15 * 60 * 1000,      // 15 minutes
  HOUR: 60 * 60 * 1000,      // 1 hour
};

export default CacheManager;
