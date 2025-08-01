import { useState, useEffect, useCallback } from 'react';
import {
  getUserNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  getAllNotifications,
  deleteNotification,
  sendNotification
} from '../api/notificationApi';

/**
 * Hook cho quản lý thông báo của user
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch thông báo của user
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserNotifications();
      setNotifications(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải thông báo');
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch số lượng thông báo chưa đọc
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // Đánh dấu thông báo đã đọc
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      
      // Giảm unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      setError(err.message || 'Không thể cập nhật trạng thái thông báo');
      console.error('Failed to mark notification as read:', err);
      return false;
    }
  }, []);

  // Refresh toàn bộ dữ liệu
  const refresh = useCallback(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Load data lần đầu
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    refresh,
    setError
  };
};

/**
 * Hook cho quản lý thông báo admin
 */
export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  // Fetch tất cả thông báo (admin)
  const fetchAllNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllNotifications();
      setNotifications(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải thông báo');
      console.error('Failed to fetch all notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gửi thông báo
  const sendNewNotification = useCallback(async (notificationData) => {
    setSending(true);
    try {
      const result = await sendNotification(notificationData);
      
      // Refresh danh sách
      await fetchAllNotifications();
      
      return result;
    } catch (err) {
      setError(err.message || 'Không thể gửi thông báo');
      console.error('Failed to send notification:', err);
      throw err;
    } finally {
      setSending(false);
    }
  }, [fetchAllNotifications]);

  // Xóa thông báo
  const removeNotification = useCallback(async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
      
      return true;
    } catch (err) {
      setError(err.message || 'Không thể xóa thông báo');
      console.error('Failed to delete notification:', err);
      return false;
    }
  }, []);

  // Load data lần đầu
  useEffect(() => {
    fetchAllNotifications();
  }, [fetchAllNotifications]);

  return {
    notifications,
    loading,
    error,
    sending,
    fetchAllNotifications,
    sendNewNotification,
    removeNotification,
    refresh: fetchAllNotifications,
    setError
  };
};
