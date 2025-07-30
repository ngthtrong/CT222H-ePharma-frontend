import { useState, useCallback } from 'react';

export const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success', 'error', 'warning', 'info'
    autoHideDuration: 6000,
  });

  const showSnackbar = useCallback((message, severity = 'info', autoHideDuration = 6000) => {
    setSnackbar({
      open: true,
      message,
      severity,
      autoHideDuration,
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  }, []);

  const showSuccess = useCallback((message, autoHideDuration = 4000) => {
    showSnackbar(message, 'success', autoHideDuration);
  }, [showSnackbar]);

  const showError = useCallback((message, autoHideDuration = 6000) => {
    showSnackbar(message, 'error', autoHideDuration);
  }, [showSnackbar]);

  const showWarning = useCallback((message, autoHideDuration = 5000) => {
    showSnackbar(message, 'warning', autoHideDuration);
  }, [showSnackbar]);

  const showInfo = useCallback((message, autoHideDuration = 4000) => {
    showSnackbar(message, 'info', autoHideDuration);
  }, [showSnackbar]);

  return {
    snackbar,
    showSnackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
