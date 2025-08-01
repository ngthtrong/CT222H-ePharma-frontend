import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { 
  Send as SendIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';

const ChangePasswordForm = ({ onSuccess, onError }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: verify current password, 2: enter new password
  const [currentPassword, setCurrentPassword] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-fill email from user context
  useEffect(() => {
    if (!user?.email) {
      setError('Không tìm thấy thông tin email người dùng');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'currentPassword') {
      setCurrentPassword(value);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setError('');
  };

  // Step 1: Verify current password and get reset token
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (!user?.email) {
      setError('Không tìm thấy thông tin email người dùng');
      return;
    }

    try {
      setLoading(true);
      
      // Step 1: Verify current password by calling login API
      const loginResponse = await authAPI.login({
        email: user.email,
        password: currentPassword
      });

      if (!loginResponse.success) {
        setError('Mật khẩu hiện tại không đúng');
        return;
      }

      setSuccess('Xác thực mật khẩu thành công. Đang chuẩn bị thay đổi mật khẩu...');

      // Step 2: Auto request reset token (silent)
      const forgotResponse = await authAPI.forgotPassword(user.email);

      if (forgotResponse.success) {
        // Extract and store token silently
        const tokenMatch = forgotResponse.data?.message?.match(/Token: ([a-f0-9-]{36})/);
        if (tokenMatch) {
          const token = tokenMatch[1];
          // Store token in localStorage for later use
          localStorage.setItem('changePasswordToken', token);
          localStorage.setItem('changePasswordTokenExpiry', Date.now() + (60 * 60 * 1000)); // 1 hour
          
          setSuccess('Mật khẩu được xác thực thành công. Bạn có thể nhập mật khẩu mới.');
          setStep(2);
        } else {
          setError('Không thể lấy mã xác thực. Vui lòng thử lại.');
        }
      } else {
        setError('Có lỗi xảy ra khi chuẩn bị thay đổi mật khẩu.');
      }
    } catch (error) {
      console.error('Verify password error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Mật khẩu hiện tại không đúng';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with stored token
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    // Get stored token
    const token = localStorage.getItem('changePasswordToken');
    const tokenExpiry = localStorage.getItem('changePasswordTokenExpiry');

    if (!token || !tokenExpiry) {
      setError('Phiên làm việc đã hết hạn. Vui lòng thử lại từ đầu.');
      setStep(1);
      return;
    }

    // Check if token is expired
    if (Date.now() > parseInt(tokenExpiry)) {
      setError('Mã xác thực đã hết hạn. Vui lòng thử lại từ đầu.');
      localStorage.removeItem('changePasswordToken');
      localStorage.removeItem('changePasswordTokenExpiry');
      setStep(1);
      return;
    }

    // Validation
    if (!formData.newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (currentPassword === formData.newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.resetPassword(token, formData.newPassword);

      if (response.success) {
        // Clean up stored token
        localStorage.removeItem('changePasswordToken');
        localStorage.removeItem('changePasswordTokenExpiry');
        
        // Reset form
        setStep(1);
        setCurrentPassword('');
        setFormData({
          newPassword: '',
          confirmPassword: ''
        });
        setSuccess('');
        
        if (onSuccess) {
          onSuccess('Đổi mật khẩu thành công!');
        }
      } else {
        setError(response.message || 'Có lỗi xảy ra khi đổi mật khẩu');
        if (onError) {
          onError(response.message || 'Có lỗi xảy ra khi đổi mật khẩu');
        }
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setCurrentPassword('');
    setFormData({
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
    // Clean up stored token
    localStorage.removeItem('changePasswordToken');
    localStorage.removeItem('changePasswordTokenExpiry');
  };

  const handleReset = () => {
    if (step === 1) {
      setCurrentPassword('');
    } else {
      setFormData({
        newPassword: '',
        confirmPassword: ''
      });
    }
    setError('');
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <LockIcon sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight="bold">
          Đổi mật khẩu
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={step - 1} sx={{ mb: 3 }}>
        <Step>
          <StepLabel>Xác thực mật khẩu hiện tại</StepLabel>
        </Step>
        <Step>
          <StepLabel>Đặt mật khẩu mới</StepLabel>
        </Step>
      </Stepper>

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

      {step === 1 && (
        <Box component="form" onSubmit={handleVerifyPassword}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Để đảm bảo bảo mật, vui lòng nhập mật khẩu hiện tại để xác thực.
          </Typography>

          <TextField
            fullWidth
            label="Mật khẩu hiện tại"
            name="currentPassword"
            type={showCurrentPassword ? 'text' : 'password'}
            variant="outlined"
            value={currentPassword}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Nhập mật khẩu hiện tại của bạn"
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: (
                <IconButton
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  edge="end"
                  disabled={loading}
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SendIcon />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Xác thực mật khẩu'}
            </Button>
            
            <Button
              type="button"
              variant="outlined"
              onClick={handleReset}
              disabled={loading}
            >
              Đặt lại
            </Button>
          </Box>
        </Box>
      )}

      {step === 2 && (
        <Box component="form" onSubmit={handleResetPassword}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mật khẩu đã được xác thực thành công. Vui lòng nhập mật khẩu mới.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mật khẩu mới"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                variant="outlined"
                value={formData.newPassword}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                variant="outlined"
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
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Đổi mật khẩu'}
            </Button>
            
            <Button
              type="button"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              disabled={loading}
            >
              Quay lại
            </Button>
            
            <Button
              type="button"
              variant="outlined"
              onClick={handleReset}
              disabled={loading}
            >
              Đặt lại
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ChangePasswordForm;
