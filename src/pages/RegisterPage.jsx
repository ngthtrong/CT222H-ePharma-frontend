import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Divider,
  IconButton,
  FormControlLabel,
  Checkbox,
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
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    
    if (!formData.fullName || !formData.email || !formData.password || !formData.phoneNumber) {
      setLocalError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp!');
      return;
    }
    
    if (!formData.agreeTerms) {
      setLocalError('Vui lòng đồng ý với điều khoản sử dụng!');
      return;
    }
    
    const { confirmPassword, agreeTerms, ...registerData } = formData;
    const result = await register(registerData);
    
    if (result.success) {
      setSuccessMessage('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
      // Delay 2 seconds before navigating to login page
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setLocalError(result.error);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleGoogleRegister = () => {
    // TODO: Implement Google register
  };

  const handleFacebookRegister = () => {
    // TODO: Implement Facebook register
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
          Đăng ký
        </Typography>
        
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          Tạo tài khoản mới để trải nghiệm WellVerse
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {(localError || error) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError || error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Họ và tên"
            name="fullName"
            variant="outlined"
            margin="normal"
            value={formData.fullName}
            onChange={handleChange}
            required
            disabled={loading}
          />

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
            label="Số điện thoại"
            name="phoneNumber"
            variant="outlined"
            margin="normal"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Ví dụ: 0123456789"
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

          <TextField
            fullWidth
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
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

          <FormControlLabel
            control={
              <Checkbox
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                color="primary"
                disabled={loading}
              />
            }
            label={
              <Typography variant="body2">
                Tôi đồng ý với{' '}
                <Link href="#" color="primary">
                  điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link href="#" color="primary">
                  chính sách bảo mật
                </Link>
              </Typography>
            }
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mb: 3, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Đăng ký'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Hoặc
          </Typography>
        </Divider>

        {/* Social Register Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleRegister}
            sx={{ py: 1.5 }}
          >
            Google
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<FacebookIcon />}
            onClick={handleFacebookRegister}
            sx={{ py: 1.5, color: '#1877F2', borderColor: '#1877F2' }}
          >
            Facebook
          </Button>
        </Box>

        <Typography variant="body2" textAlign="center" color="text.secondary">
          Đã có tài khoản?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={handleLoginClick}
            sx={{ textDecoration: 'none', fontWeight: 'medium' }}
          >
            Đăng nhập ngay
          </Link>
        </Typography>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterPage;
