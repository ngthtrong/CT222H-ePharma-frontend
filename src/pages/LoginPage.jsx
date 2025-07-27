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
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setLocalError('');
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
      navigate('/');
    } else {
      setLocalError(result.error);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google login
  };

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook login
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
            sx={{ py: 1.5 }}
          >
            Google
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<FacebookIcon />}
            onClick={handleFacebookLogin}
            sx={{ py: 1.5, color: '#1877F2', borderColor: '#1877F2' }}
          >
            Facebook
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
    </Box>
  );
};

export default LoginPage;
