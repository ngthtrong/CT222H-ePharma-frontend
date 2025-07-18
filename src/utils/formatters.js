/**
 * Định dạng tiền tệ VND
 * @param {number} amount - Số tiền cần định dạng
 * @returns {string} - Chuỗi tiền tệ đã định dạng
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 ₫';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Định dạng số với dấu phẩy
 * @param {number} number - Số cần định dạng
 * @returns {string} - Chuỗi số đã định dạng
 */
export const formatNumber = (number) => {
  if (!number && number !== 0) return '0';
  
  return new Intl.NumberFormat('vi-VN').format(number);
};

/**
 * Tính phần trăm giảm giá
 * @param {number} originalPrice - Giá gốc
 * @param {number} discountedPrice - Giá sau giảm
 * @returns {number} - Phần trăm giảm giá
 */
export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
  if (!originalPrice || !discountedPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * Tạo URL slug từ string
 * @param {string} str - Chuỗi cần chuyển đổi
 * @returns {string} - Slug URL
 */
export const createSlug = (str) => {
  return str
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
    .replace(/[đĐ]/g, 'd') // Thay thế đ
    .replace(/([^0-9a-z-\s])/g, '') // Xóa ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng -
    .replace(/-+/g, '-') // Xóa dấu - liên tiếp
    .replace(/^-|-$/g, ''); // Xóa dấu - ở đầu và cuối
};

/**
 * Truncate text với số ký tự giới hạn
 * @param {string} text - Text cần cắt
 * @param {number} limit - Giới hạn ký tự
 * @returns {string} - Text đã cắt
 */
export const truncateText = (text, limit = 100) => {
  if (!text) return '';
  if (text.length <= limit) return text;
  return text.substring(0, limit) + '...';
};

/**
 * Debounce function
 * @param {Function} func - Function cần debounce
 * @param {number} delay - Delay time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Validate email
 * @param {string} email - Email cần validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Vietnam format)
 * @param {string} phone - Phone number cần validate
 * @returns {boolean} - True if valid
 */
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^(\+84|0)[0-9]{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string} - Random string
 */
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
