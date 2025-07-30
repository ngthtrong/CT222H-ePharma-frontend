import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import { isAdmin, isTokenValid } from '../utils/adminUtils';

/**
 * AdminRoute Component - Bảo vệ các route admin
 * Chỉ cho phép user có role admin truy cập
 */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdminAuth = () => {
      if (!loading) {
        console.log('AdminRoute - Checking admin auth:', {
          isAuthenticated,
          user,
          userRole: user?.role,
          isUserAdmin: isAdmin(),
          hasToken: !!localStorage.getItem('accessToken'),
          tokenValid: isTokenValid()
        });
        setIsCheckingToken(false);
      }
    };

    checkAdminAuth();
  }, [loading, isAuthenticated, user]);

  // Hiển thị loading trong khi đang kiểm tra
  if (loading || isCheckingToken) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Đang kiểm tra quyền truy cập...
        </Typography>
      </Box>
    );
  }

  // Chưa đăng nhập -> redirect về login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          error: 'admin_auth_required',
          message: 'Vui lòng đăng nhập với tài khoản admin để tiếp tục'
        }} 
        replace 
      />
    );
  }

  // Đã đăng nhập nhưng không phải admin
  if (!isAdmin()) {
    console.log('User is not admin:', { role: user?.role, isAdminResult: isAdmin() });
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          error: 'admin_access_denied',
          message: 'Bạn không có quyền truy cập vào khu vực quản trị'
        }} 
        replace 
      />
    );
  }

  // User là admin -> cho phép truy cập
  return children;
};

export default AdminRoute;
