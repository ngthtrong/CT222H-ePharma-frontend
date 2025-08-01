import { useState, useCallback } from 'react';

/**
 * Hook for managing notifications/snackbar messages
 * Can be used globally by setting window.showNotification
 */
export const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success', 'error', 'warning', 'info'
  });

  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      open: false,
    }));
  }, []);

  // Make showNotification available globally
  if (typeof window !== 'undefined') {
    window.showNotification = showNotification;
  }

  return {
    notification,
    showNotification,
    hideNotification,
  };
};

export default useNotification;
