import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Email as EmailIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Hàm tiện ích để hiển thị snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Địa chỉ email không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.forgotPassword(email);

      if (response.success) {
        setSuccess('Yêu cầu đặt lại mật khẩu đã được xử lý. Vui lòng kiểm tra email của bạn.');
        showSnackbar('Đã gửi mã đặt lại mật khẩu!', 'success');
        
        // Extract token from response message for demo (in production, token should be sent via email)
        // API trả về: "Mã đặt lại mật khẩu đã được tạo. Token: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (Có hiệu lực trong 1 giờ)"
        const tokenMatch = response.data?.message?.match(/Token: ([a-f0-9-]{36})/);
        if (tokenMatch) {
          const token = tokenMatch[1];
          // For demo purposes, redirect to reset password page with token
          setTimeout(() => {
            navigate(`/reset-password?token=${token}&email=${encodeURIComponent(email)}`);
          }, 2000);
        } else {
          // If no token found in message, show manual instructions
          setTimeout(() => {
            navigate('/reset-password');
          }, 3000);
        }
      } else {
        setError(response.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        showSnackbar(response.message || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
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
          <EmailIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Quên mật khẩu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nhập địa chỉ email của bạn để nhận mã đặt lại mật khẩu
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
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder="Nhập địa chỉ email của bạn"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Gửi mã đặt lại'}
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

export default ForgotPasswordPage;
