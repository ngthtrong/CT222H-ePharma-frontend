import api from './config';

// ====================
// USER NOTIFICATION APIs
// ====================

/**
 * Lấy danh sách thông báo của user hiện tại
 */
export const getUserNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

/**
 * Đánh dấu thông báo đã đọc
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Lấy số lượng thông báo chưa đọc
 */
export const getUnreadNotificationCount = async () => {
  try {
    const response = await api.get('/notifications/unread-count');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    throw error;
  }
};

// ====================
// ADMIN NOTIFICATION APIs
// ====================

/**
 * Admin: Gửi thông báo (cá nhân hoặc broadcast)
 */
export const sendNotification = async (notificationData) => {
  try {
    const response = await api.post('/admin/notifications', notificationData);
    return response.data.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Admin: Lấy tất cả thông báo trong hệ thống
 */
export const getAllNotifications = async () => {
  try {
    const response = await api.get('/admin/notifications');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    throw error;
  }
};

/**
 * Admin: Xóa thông báo
 */
export const deleteNotification = async (notificationId) => {
  try {
    await api.delete(`/admin/notifications/${notificationId}`);
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Admin: Gửi thông báo cho user cụ thể
 */
export const sendNotificationToUser = async (notificationData) => {
  return await sendNotification(notificationData);
};

/**
 * Admin: Gửi broadcast thông báo đến tất cả user
 */
export const broadcastNotification = async (notificationData) => {
  const broadcastData = { ...notificationData, userId: null };
  return await sendNotification(broadcastData);
};

// ====================
// NOTIFICATION TYPES
// ====================

export const NOTIFICATION_TYPES = {
  ORDER: 'ORDER',
  PRODUCT: 'PRODUCT', 
  PROMOTION: 'PROMOTION',
  SYSTEM: 'SYSTEM',
  REVIEW: 'REVIEW',
  GENERAL: 'GENERAL'
};

export const NOTIFICATION_TYPE_LABELS = {
  ORDER: 'Đơn hàng',
  PRODUCT: 'Sản phẩm',
  PROMOTION: 'Khuyến mãi', 
  SYSTEM: 'Hệ thống',
  REVIEW: 'Đánh giá',
  GENERAL: 'Chung'
};

/**
 * Lấy màu sắc theo loại thông báo
 */
export const getNotificationTypeColor = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.ORDER:
      return 'info';
    case NOTIFICATION_TYPES.PRODUCT:
      return 'primary';
    case NOTIFICATION_TYPES.PROMOTION:
      return 'success';
    case NOTIFICATION_TYPES.SYSTEM:
      return 'warning';
    case NOTIFICATION_TYPES.REVIEW:
      return 'secondary';
    case NOTIFICATION_TYPES.GENERAL:
    default:
      return 'default';
  }
};

/**
 * Lấy icon theo loại thông báo
 */
export const getNotificationTypeIcon = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.ORDER:
      return '📦';
    case NOTIFICATION_TYPES.PRODUCT:
      return '🛍️';
    case NOTIFICATION_TYPES.PROMOTION:
      return '🎉';
    case NOTIFICATION_TYPES.SYSTEM:
      return '⚙️';
    case NOTIFICATION_TYPES.REVIEW:
      return '⭐';
    case NOTIFICATION_TYPES.GENERAL:
    default:
      return '📢';
  }
};
