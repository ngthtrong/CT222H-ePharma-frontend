import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box, Alert } from '@mui/material';
import { isAdmin, isTokenValid } from '../utils/adminUtils';

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Kiểm tra xác thực cơ bản
  if (!isAuthenticated || !isTokenValid()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra quyền admin nếu được yêu cầu
  if (requiredRole === 'admin') {
    if (!user || user.role?.toLowerCase() !== 'admin') {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            Bạn không có quyền truy cập trang này. Cần quyền quản trị viên.
          </Alert>
        </Box>
      );
    }
  }

  // Kiểm tra các roles khác nếu cần
  if (requiredRole && requiredRole !== 'admin') {
    if (!user || user.role?.toLowerCase() !== requiredRole.toLowerCase()) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            Bạn không có quyền truy cập trang này.
          </Alert>
        </Box>
      );
    }
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string,
};

export default PrivateRoute;
