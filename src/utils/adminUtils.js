import { jwtDecode } from 'jwt-decode';
import { getLocalStorage } from './localStorage';

/**
 * Kiểm tra xem người dùng có quyền admin không
 * @returns {boolean} true nếu là admin, false nếu không
 */
export const isAdmin = () => {
  try {
    const token = getLocalStorage('accessToken');
    const user = getLocalStorage('user');
    
    if (!token || !user) {
      return false;
    }
    
    // Kiểm tra từ user data trong localStorage
    if (user.role && user.role.toUpperCase() === 'ADMIN') {
      return true;
    }
    
    // Fallback: decode token để kiểm tra role
    try {
      const decoded = jwtDecode(token);
      return decoded.role && decoded.role.toUpperCase() === 'ADMIN';
    } catch (decodeError) {
      console.warn('Failed to decode token:', decodeError);
      return false;
    }
    
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Kiểm tra token có hợp lệ và chưa hết hạn không
 * @returns {boolean} true nếu token hợp lệ, false nếu không
 */
export const isTokenValid = () => {
  try {
    const token = getLocalStorage('accessToken');
    
    if (!token) {
      return false;
    }
    
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

/**
 * Lấy thông tin người dùng từ token
 * @returns {object|null} thông tin người dùng hoặc null
 */
export const getUserFromToken = () => {
  try {
    const token = getLocalStorage('accessToken');
    
    if (!token) {
      return null;
    }
    
    const decoded = jwtDecode(token);
    return {
      id: decoded.sub || decoded.id,
      email: decoded.email,
      role: decoded.role,
      fullName: decoded.fullName || decoded.name,
    };
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

/**
 * Kiểm tra quyền truy cập admin và redirect nếu cần
 * @param {function} navigate - React Router navigate function
 * @param {string} redirectPath - đường dẫn redirect nếu không có quyền
 * @returns {boolean} true nếu có quyền admin
 */
export const requireAdminAuth = (navigate, redirectPath = '/login') => {
  if (!isTokenValid()) {
    navigate(redirectPath);
    return false;
  }
  
  if (!isAdmin()) {
    navigate('/'); // Redirect về trang chủ nếu không phải admin
    return false;
  }
  
  return true;
};

/**
 * Format trạng thái đơn hàng để hiển thị
 * @param {string} status - Trạng thái đơn hàng
 * @returns {object} Thông tin hiển thị status
 */
export const getOrderStatusInfo = (status) => {
  const statusMap = {
    'PENDING': { 
      text: 'Chờ xử lý', 
      color: 'warning',
      bgColor: '#fff3cd',
      textColor: '#856404'
    },
    'PROCESSING': { 
      text: 'Đang xử lý', 
      color: 'info',
      bgColor: '#d1ecf1',
      textColor: '#0c5460'
    },
    'SHIPPED': { 
      text: 'Đã giao', 
      color: 'primary',
      bgColor: '#cce5ff',
      textColor: '#004085'
    },
    'COMPLETED': { 
      text: 'Hoàn thành', 
      color: 'success',
      bgColor: '#d4edda',
      textColor: '#155724'
    },
    'CANCELLED': { 
      text: 'Đã hủy', 
      color: 'error',
      bgColor: '#f8d7da',
      textColor: '#721c24'
    }
  };

  return statusMap[status] || { 
    text: status, 
    color: 'default',
    bgColor: '#e9ecef',
    textColor: '#495057'
  };
};

/**
 * Format trạng thái thanh toán
 * @param {string} paymentStatus - Trạng thái thanh toán
 * @returns {object} Thông tin hiển thị payment status
 */
export const getPaymentStatusInfo = (paymentStatus) => {
  const statusMap = {
    'PENDING': { 
      text: 'Chờ thanh toán', 
      color: 'warning' 
    },
    'PAID': { 
      text: 'Đã thanh toán', 
      color: 'success' 
    },
    'FAILED': { 
      text: 'Thanh toán thất bại', 
      color: 'error' 
    },
    'REFUNDED': { 
      text: 'Đã hoàn tiền', 
      color: 'info' 
    }
  };

  return statusMap[paymentStatus] || { 
    text: paymentStatus, 
    color: 'default' 
  };
};

/**
 * Validate form tạo/sửa sản phẩm
 * @param {object} productData - Dữ liệu sản phẩm
 * @returns {array} Danh sách lỗi
 */
export const validateProductForm = (productData) => {
  const errors = [];

  if (!productData.name?.trim()) {
    errors.push('Tên sản phẩm không được trống');
  }

  if (!productData.slug?.trim()) {
    errors.push('Slug không được trống');
  } else if (!/^[a-z0-9-]+$/.test(productData.slug)) {
    errors.push('Slug chỉ chứa chữ thường, số và dấu gạch ngang');
  }

  if (!productData.categoryId) {
    errors.push('Phải chọn danh mục');
  }

  if (!productData.price || productData.price <= 0) {
    errors.push('Giá phải lớn hơn 0');
  }

  if (productData.salePrice && productData.salePrice >= productData.price) {
    errors.push('Giá khuyến mãi phải nhỏ hơn giá gốc');
  }

  if (!productData.stockQuantity || productData.stockQuantity < 0) {
    errors.push('Số lượng tồn kho không được âm');
  }

  // Validate images
  if (!productData.images || !Array.isArray(productData.images) || productData.images.length === 0) {
    errors.push('Phải có ít nhất một hình ảnh sản phẩm');
  } else {
    // Kiểm tra từng URL hình ảnh
    productData.images.forEach((imageUrl, index) => {
      if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
        errors.push(`Hình ảnh thứ ${index + 1} không hợp lệ`);
      } else {
        try {
          new URL(imageUrl);
        } catch {
          errors.push(`URL hình ảnh thứ ${index + 1} không hợp lệ`);
        }
      }
    });
  }

  return errors;
};

/**
 * Validate form tạo/sửa danh mục
 * @param {object} categoryData - Dữ liệu danh mục
 * @returns {array} Danh sách lỗi
 */
export const validateCategoryForm = (categoryData) => {
  const errors = [];

  if (!categoryData.name?.trim()) {
    errors.push('Tên danh mục không được trống');
  }

  if (!categoryData.slug?.trim()) {
    errors.push('Slug không được trống');
  } else if (!/^[a-z0-9-]+$/.test(categoryData.slug)) {
    errors.push('Slug chỉ chứa chữ thường, số và dấu gạch ngang');
  }

  return errors;
};

/**
 * Validate form tạo/sửa khuyến mãi
 * @param {object} promotionData - Dữ liệu khuyến mãi
 * @returns {array} Danh sách lỗi
 */
export const validatePromotionForm = (promotionData) => {
  const errors = [];

  if (!promotionData.title?.trim()) {
    errors.push('Tiêu đề khuyến mãi không được trống');
  }

  if (!promotionData.code?.trim()) {
    errors.push('Mã khuyến mãi không được trống');
  } else if (!/^[A-Z0-9]{4,10}$/.test(promotionData.code)) {
    errors.push('Mã khuyến mãi phải từ 4-10 ký tự, chỉ chứa chữ in hoa và số');
  }

  if (!promotionData.type) {
    errors.push('Phải chọn loại khuyến mãi');
  }

  if (!promotionData.value || promotionData.value <= 0) {
    errors.push('Giá trị khuyến mãi phải lớn hơn 0');
  }

  if (promotionData.type === 'PERCENTAGE' && promotionData.value > 100) {
    errors.push('Giá trị phần trăm không được vượt quá 100%');
  }

  if (!promotionData.startDate) {
    errors.push('Phải chọn ngày bắt đầu');
  }

  if (!promotionData.endDate) {
    errors.push('Phải chọn ngày kết thúc');
  }

  if (promotionData.startDate && promotionData.endDate && 
      new Date(promotionData.startDate) >= new Date(promotionData.endDate)) {
    errors.push('Ngày kết thúc phải sau ngày bắt đầu');
  }

  return errors;
};

/**
 * Format số tiền theo định dạng VND
 * @param {number} amount - Số tiền
 * @returns {string} Chuỗi đã format
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format ngày tháng
 * @param {string|Date} date - Ngày
 * @param {object} options - Tùy chọn format
 * @returns {string} Chuỗi ngày đã format
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };

  return new Intl.DateTimeFormat('vi-VN', defaultOptions).format(new Date(date));
};

/**
 * Tạo slug từ string
 * @param {string} str - Chuỗi cần tạo slug
 * @returns {string} Slug
 */
export const createSlug = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .trim()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Debounce function để tối ưu tìm kiếm
 * @param {function} func - Function cần debounce
 * @param {number} wait - Thời gian chờ (ms)
 * @returns {function} Function đã debounce
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
