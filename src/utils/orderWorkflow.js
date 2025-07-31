/**
 * Order Workflow Management Utilities
 * Quản lý workflow chuyển trạng thái đơn hàng theo business logic
 */

// Order status definitions with detailed information
export const ORDER_STATUSES = {
  PENDING: { 
    label: 'Chờ xử lý', 
    color: 'warning',
    description: 'Đơn hàng mới được tạo, đang chờ xác nhận',
    canEdit: true,
    canCancel: true,
    requiresAction: true,
    priority: 1
  },
  PROCESSING: { 
    label: 'Đang xử lý', 
    color: 'info',
    description: 'Đơn hàng đã được xác nhận, đang chuẩn bị hàng',
    canEdit: false,
    canCancel: true,
    requiresAction: true,
    priority: 2
  },
  SHIPPED: { 
    label: 'Đã giao vận', 
    color: 'primary',
    description: 'Đơn hàng đã được giao cho đơn vị vận chuyển',
    canEdit: false,
    canCancel: false,
    requiresAction: false,
    priority: 3
  },
  COMPLETED: { 
    label: 'Hoàn thành', 
    color: 'success',
    description: 'Đơn hàng đã được giao thành công cho khách hàng',
    canEdit: false,
    canCancel: false,
    requiresAction: false,
    priority: 4
  },
  CANCELLED: { 
    label: 'Đã hủy', 
    color: 'error',
    description: 'Đơn hàng đã bị hủy',
    canEdit: false,
    canCancel: false,
    requiresAction: false,
    priority: 5
  },
};

// Payment status definitions
export const PAYMENT_STATUSES = {
  UNPAID: { 
    label: 'Chưa thanh toán', 
    color: 'error',
    description: 'Khách hàng chưa thanh toán đơn hàng',
    canUpdate: true
  },
  PAID: { 
    label: 'Đã thanh toán', 
    color: 'success',
    description: 'Đã nhận được thanh toán từ khách hàng',
    canUpdate: false
  },
};

// Payment method definitions
export const PAYMENT_METHODS = {
  COD: {
    label: 'Thanh toán khi nhận hàng',
    description: 'Khách hàng thanh toán bằng tiền mặt khi nhận hàng',
    requiresPrePayment: false
  },
  MOMO: {
    label: 'Ví điện tử MoMo',
    description: 'Thanh toán qua ví điện tử MoMo',
    requiresPrePayment: true
  },
  BANK_TRANSFER: {
    label: 'Chuyển khoản ngân hàng',
    description: 'Chuyển khoản trực tiếp qua ngân hàng',
    requiresPrePayment: true
  },
};

// Status transition workflow with business rules
export const STATUS_WORKFLOW = {
  'PENDING': {
    next: ['PROCESSING', 'CANCELLED'],
    actions: {
      'PROCESSING': {
        label: 'Xác nhận đơn hàng',
        description: 'Xác nhận và bắt đầu xử lý đơn hàng',
        requiresConfirmation: true,
        requiredFields: [],
        businessRules: [
          'Kiểm tra tồn kho sản phẩm',
          'Xác nhận thông tin khách hàng',
          'Kiểm tra địa chỉ giao hàng'
        ]
      },
      'CANCELLED': {
        label: 'Hủy đơn hàng',
        description: 'Hủy đơn hàng (lý do: hết hàng, khách hàng hủy, etc.)',
        requiresConfirmation: true,
        requiredFields: ['cancelReason'],
        businessRules: [
          'Hoàn tiền nếu đã thanh toán trước',
          'Cập nhật lại tồn kho'
        ]
      }
    }
  },
  'PROCESSING': {
    next: ['SHIPPED', 'CANCELLED'],
    actions: {
      'SHIPPED': {
        label: 'Giao cho vận chuyển',
        description: 'Đóng gói xong, chuyển cho đơn vị vận chuyển',
        requiresConfirmation: false,
        requiredFields: ['trackingNumber'],
        businessRules: [
          'Đóng gói hàng hóa',
          'Tạo mã vận đơn',
          'Chuyển cho đơn vị vận chuyển'
        ]
      },
      'CANCELLED': {
        label: 'Hủy đơn hàng',
        description: 'Hủy đơn hàng (lý do: không liên lạc được khách, etc.)',
        requiresConfirmation: true,
        requiredFields: ['cancelReason'],
        businessRules: [
          'Hoàn tiền nếu đã thanh toán',
          'Cập nhật lại tồn kho',
          'Thông báo cho khách hàng'
        ]
      }
    }
  },
  'SHIPPED': {
    next: ['COMPLETED'],
    actions: {
      'COMPLETED': {
        label: 'Hoàn thành giao hàng',
        description: 'Xác nhận đã giao hàng thành công cho khách hàng',
        requiresConfirmation: false,
        requiredFields: [],
        businessRules: [
          'Xác nhận khách hàng đã nhận hàng',
          'Cập nhật trạng thái thanh toán nếu COD',
          'Gửi email/SMS xác nhận'
        ]
      }
    }
  },
  'COMPLETED': {
    next: [],
    actions: {}
  },
  'CANCELLED': {
    next: [],
    actions: {}
  }
};

/**
 * Get available next statuses for current status
 * @param {string} currentStatus - Current order status
 * @returns {string[]} Array of available next statuses
 */
export const getAvailableStatuses = (currentStatus) => {
  return STATUS_WORKFLOW[currentStatus]?.next || [];
};

/**
 * Check if status transition is allowed
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Target status
 * @returns {boolean} True if transition is allowed
 */
export const canTransitionToStatus = (currentStatus, newStatus) => {
  const availableStatuses = getAvailableStatuses(currentStatus);
  return availableStatuses.includes(newStatus);
};

/**
 * Get status transition action details
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Target status
 * @returns {object|null} Action details or null if transition not allowed
 */
export const getStatusTransitionAction = (currentStatus, newStatus) => {
  if (!canTransitionToStatus(currentStatus, newStatus)) {
    return null;
  }
  return STATUS_WORKFLOW[currentStatus]?.actions[newStatus] || null;
};

/**
 * Get required fields for status transition
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Target status
 * @returns {string[]} Array of required field names
 */
export const getRequiredFields = (currentStatus, newStatus) => {
  const action = getStatusTransitionAction(currentStatus, newStatus);
  return action?.requiredFields || [];
};

/**
 * Validate status transition with business rules
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Target status
 * @param {object} order - Order object
 * @param {object} updateData - Update data
 * @returns {object} Validation result { valid: boolean, errors: string[] }
 */
export const validateStatusTransition = (currentStatus, newStatus, order, updateData = {}) => {
  const errors = [];

  // Check if transition is allowed
  if (!canTransitionToStatus(currentStatus, newStatus)) {
    errors.push(`Không thể chuyển từ "${ORDER_STATUSES[currentStatus]?.label}" sang "${ORDER_STATUSES[newStatus]?.label}"`);
    return { valid: false, errors };
  }

  // Check required fields
  const requiredFields = getRequiredFields(currentStatus, newStatus);
  requiredFields.forEach(field => {
    if (!updateData[field] && !order[field]) {
      switch (field) {
        case 'trackingNumber':
          errors.push('Vui lòng nhập mã vận đơn');
          break;
        case 'cancelReason':
          errors.push('Vui lòng nhập lý do hủy đơn hàng');
          break;
        default:
          errors.push(`Thiếu thông tin bắt buộc: ${field}`);
      }
    }
  });

  // Business rule validations
  const action = getStatusTransitionAction(currentStatus, newStatus);
  if (action) {
    // Check payment status for certain transitions
    if (newStatus === 'SHIPPED' && order.paymentMethod !== 'COD' && order.paymentStatus === 'UNPAID') {
      errors.push('Đơn hàng phải được thanh toán trước khi giao hàng');
    }

    // Check inventory for processing
    if (newStatus === 'PROCESSING') {
      // This would typically check with inventory API
      // For now, just a placeholder
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Get order priority based on status and timing
 * @param {object} order - Order object
 * @returns {string} Priority level: 'high', 'medium', 'normal'
 */
export const getOrderPriority = (order) => {
  const now = new Date();
  const createdAt = new Date(order.createdAt);
  const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

  // High priority conditions
  if (order.status === 'PENDING' && hoursDiff > 24) return 'high';
  if (order.status === 'PROCESSING' && hoursDiff > 48) return 'high';
  if (order.status === 'SHIPPED' && hoursDiff > 72) return 'high';

  // Medium priority conditions
  if (order.status === 'PENDING' && hoursDiff > 12) return 'medium';
  if (order.status === 'PROCESSING' && hoursDiff > 24) return 'medium';

  return 'normal';
};

/**
 * Get status workflow summary for display
 * @returns {object} Workflow summary for UI
 */
export const getWorkflowSummary = () => {
  return {
    statuses: ORDER_STATUSES,
    paymentStatuses: PAYMENT_STATUSES,
    paymentMethods: PAYMENT_METHODS,
    workflow: STATUS_WORKFLOW
  };
};

/**
 * Get status statistics from orders array
 * @param {object[]} orders - Array of orders
 * @returns {object} Status statistics
 */
export const getStatusStatistics = (orders) => {
  const stats = {};
  
  Object.keys(ORDER_STATUSES).forEach(status => {
    stats[status] = {
      count: orders.filter(order => order.status === status).length,
      percentage: orders.length > 0 ? 
        (orders.filter(order => order.status === status).length / orders.length * 100).toFixed(1) : 
        0
    };
  });

  // Add priority statistics
  stats.priority = {
    high: orders.filter(order => getOrderPriority(order) === 'high').length,
    medium: orders.filter(order => getOrderPriority(order) === 'medium').length,
    normal: orders.filter(order => getOrderPriority(order) === 'normal').length
  };

  return stats;
};

/**
 * Format order status for display
 * @param {string} status - Order status
 * @returns {object} Formatted status info
 */
export const formatOrderStatus = (status) => {
  const statusInfo = ORDER_STATUSES[status];
  if (!statusInfo) {
    return {
      label: status,
      color: 'default',
      description: 'Trạng thái không xác định'
    };
  }
  return statusInfo;
};

/**
 * Get next recommended action for order
 * @param {object} order - Order object
 * @returns {string|null} Recommended action or null
 */
export const getRecommendedAction = (order) => {
  const priority = getOrderPriority(order);
  const availableStatuses = getAvailableStatuses(order.status);

  if (priority === 'high' && availableStatuses.length > 0) {
    return `Ưu tiên xử lý: ${availableStatuses[0]}`;
  }

  if (order.status === 'PENDING') {
    return 'Cần xác nhận đơn hàng';
  }

  if (order.status === 'PROCESSING') {
    return 'Cần chuẩn bị hàng và giao vận';
  }

  if (order.status === 'SHIPPED') {
    return 'Theo dõi quá trình giao hàng';
  }

  return null;
};

export default {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  STATUS_WORKFLOW,
  getAvailableStatuses,
  canTransitionToStatus,
  getStatusTransitionAction,
  getRequiredFields,
  validateStatusTransition,
  getOrderPriority,
  getWorkflowSummary,
  getStatusStatistics,
  formatOrderStatus,
  getRecommendedAction
};
