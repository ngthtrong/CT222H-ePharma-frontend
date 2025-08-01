import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, oauth2Login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [oauth2Loading, setOauth2Loading] = useState(false);

  // Kiểm tra thông báo lỗi từ admin routes và OAuth2
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const errorType = urlParams.get('error');
    const state = location.state;

    if (errorType === 'admin_auth_required') {
      setLocalError('Vui lòng đăng nhập với tài khoản admin để truy cập khu vực quản trị');
    } else if (errorType === 'admin_access_denied') {
      setLocalError('Bạn không có quyền truy cập vào khu vực quản trị');
    } else if (state?.error === 'admin_auth_required' || state?.error === 'admin_access_denied') {
      setLocalError(state.message || 'Vui lòng đăng nhập để tiếp tục');
    } else if (state?.oauth2Error) {
      // Handle OAuth2 error from callback
      setLocalError(state.oauth2Error);
      showSnackbar(state.oauth2Error, 'error');
      
      // Clear the error from location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setLocalError('');
  };

  // Hàm tiện ích để hiển thị snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email || !formData.password) {
      setLocalError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const result = await login(formData);
    if (result.success) {
      showSnackbar('Đăng nhập thành công! Đang chuyển hướng...', 'success');
      
      // Delay nhỏ để người dùng thấy thông báo trước khi chuyển trang
      setTimeout(() => {
        // Kiểm tra nếu đang cố truy cập admin area thì redirect về đó
        const from = location.state?.from?.pathname;
        if (from && from.startsWith('/admin')) {
          navigate(from, { replace: true });
        } else {
          navigate('/');
        }
      }, 1000);
    } else {
      setLocalError(result.error);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleGoogleLogin = async () => {
    try {
      setOauth2Loading(true);
      setLocalError('');
      
      // Save intended destination for post-login redirect
      const from = location.state?.from?.pathname;
      if (from) {
        sessionStorage.setItem('oauth2_redirect_after', from);
      }
      
      // Initiate Google OAuth2 login
      await oauth2Login('google');
      
    } catch (error) {
      console.error('Google login error:', error);
      setLocalError(error.message || 'Đăng nhập với Google thất bại');
      setOauth2Loading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setOauth2Loading(true);
      setLocalError('');
      
      // Save intended destination for post-login redirect
      const from = location.state?.from?.pathname;
      if (from) {
        sessionStorage.setItem('oauth2_redirect_after', from);
      }
      
      // Initiate Facebook OAuth2 login
      await oauth2Login('facebook');
      
    } catch (error) {
      console.error('Facebook login error:', error);
      setLocalError(error.message || 'Đăng nhập với Facebook thất bại');
      setOauth2Loading(false);
    }
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
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
          Đăng nhập
        </Typography>

        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          Chào mừng bạn quay trở lại WellVerse
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {(localError || error) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError || error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Mật khẩu"
            name="password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
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

          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Link href="#" variant="body2" color="primary">
              Quên mật khẩu?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
          </Button>

          {/* Debug test buttons */}
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Hoặc đăng nhập với
          </Typography>
        </Divider>

        {/* Social Login Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={loading || oauth2Loading}
            sx={{ 
              py: 1.5,
              borderColor: '#4285f4',
              color: '#4285f4',
              '&:hover': {
                borderColor: '#3367d6',
                backgroundColor: 'rgba(66, 133, 244, 0.04)'
              }
            }}
          >
            {oauth2Loading ? <CircularProgress size={20} color="inherit" /> : 'Google'}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<FacebookIcon />}
            onClick={handleFacebookLogin}
            disabled={loading || oauth2Loading}
            sx={{ 
              py: 1.5, 
              color: '#1877F2', 
              borderColor: '#1877F2',
              '&:hover': {
                borderColor: '#166fe5',
                backgroundColor: 'rgba(24, 119, 242, 0.04)'
              }
            }}
          >
            {oauth2Loading ? <CircularProgress size={20} color="inherit" /> : 'Facebook'}
          </Button>
        </Box>

        <Typography variant="body2" textAlign="center" color="text.secondary">
          Chưa có tài khoản?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={handleRegisterClick}
            sx={{ textDecoration: 'none', fontWeight: 'medium' }}
          >
            Đăng ký ngay
          </Link>
        </Typography>
      </Paper>

      {/* Snackbar cho thông báo đăng nhập */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
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

export default LoginPage;
