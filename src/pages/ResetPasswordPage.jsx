import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Lock as LockIcon,
  Visibility,
  VisibilityOff 
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Get token and email from URL params
  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (token) {
      setFormData(prev => ({ ...prev, token }));
    } else {
      setError('Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }
  }, [searchParams]);

  // Hàm tiện ích để hiển thị snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.token) {
      setError('Mã đặt lại mật khẩu không hợp lệ');
      return;
    }

    if (!formData.newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.resetPassword(formData.token, formData.newPassword);

      if (response.success) {
        setSuccess('Đặt lại mật khẩu thành công! Đang chuyển hướng đến trang đăng nhập...');
        showSnackbar('Đặt lại mật khẩu thành công!', 'success');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới.' 
            }
          });
        }, 3000);
      } else {
        setError(response.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        showSnackbar(response.message || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 3,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Đặt lại mật khẩu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nhập mật khẩu mới cho tài khoản của bạn
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Mã đặt lại mật khẩu"
            name="token"
            variant="outlined"
            margin="normal"
            value={formData.token}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Nhập mã đặt lại mật khẩu"
            InputProps={{
              readOnly: !!searchParams.get('token'), // Read-only if token from URL
            }}
          />

          <TextField
            fullWidth
            label="Mật khẩu mới"
            name="newPassword"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            value={formData.newPassword}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  disabled={loading}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Nhập lại mật khẩu mới"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  disabled={loading}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading || !formData.token}
          >
            {loading ? <CircularProgress size={24} /> : 'Đặt lại mật khẩu'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToLogin}
              disabled={loading}
            >
              Quay lại đăng nhập
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Snackbar cho thông báo */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResetPasswordPage;
