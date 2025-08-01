import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Snackbar,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Person as PersonIcon, 
  LocationOn as LocationIcon,
  Lock as LockIcon 
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';
import api from '../api/config';
import AddressManager from '../components/AddressManager';
import ChangePasswordForm from '../components/ChangePasswordForm';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  // Hàm tiện ích để hiển thị snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Lấy thông tin user từ localStorage thay vì gọi API
      const storedUser = localStorage.getItem('user');
      console.log('=== ProfilePage fetchProfile ===');
      console.log('Stored user data:', storedUser);
      
      if (!storedUser) {
        throw new Error('Không tìm thấy thông tin người dùng trong localStorage');
      }
      
      const userData = JSON.parse(storedUser);
      console.log('Parsed user data:', userData);
      
      setProfile(userData);
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Không thể tải thông tin profile từ dữ liệu đã lưu');
      
      // Fallback: thử lấy từ AuthContext nếu localStorage không có
      if (user) {
        console.log('Using user from AuthContext:', user);
        setProfile(user);
        setFormData({
          fullName: user.fullName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
        });
        setError('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(formData);
      
      // Cập nhật state
      const updatedProfile = { ...profile, ...formData };
      setProfile(updatedProfile);
      setIsEditing(false);
      setError('');
      
      // Cập nhật localStorage với thông tin mới
      localStorage.setItem('user', JSON.stringify(updatedProfile));
      
      // Hiển thị thông báo thành công
      showSnackbar('Cập nhật thông tin cá nhân thành công', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar('Cập nhật thông tin thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        {/* Profile Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}
          >
            {profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              {profile?.fullName || 'Người dùng'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vai trò: {profile?.role || 'USER'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              icon={<PersonIcon />} 
              label="Thông tin cá nhân" 
              iconPosition="start"
            />
            <Tab 
              icon={<LocationIcon />} 
              label="Địa chỉ" 
              iconPosition="start"
            />
            <Tab 
              icon={<LockIcon />} 
              label="Đổi mật khẩu" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            {/* Personal Information Tab */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  variant={isEditing ? 'outlined' : 'standard'}
                  InputProps={{
                    readOnly: !isEditing,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  variant={isEditing ? 'outlined' : 'standard'}
                  InputProps={{
                    readOnly: !isEditing,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  variant={isEditing ? 'outlined' : 'standard'}
                  InputProps={{
                    readOnly: !isEditing,
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              {isEditing ? (
                <>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Lưu thay đổi'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        fullName: profile?.fullName || '',
                        email: profile?.email || '',
                        phoneNumber: profile?.phoneNumber || '',
                      });
                    }}
                  >
                    Hủy
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa
                </Button>
              )}
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {/* Address Management Tab */}
            <AddressManager />
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            {/* Change Password Tab */}
            <ChangePasswordForm 
              onSuccess={(message) => showSnackbar(message, 'success')}
              onError={(message) => showSnackbar(message, 'error')}
            />
          </Box>
        )}
      </Paper>

      {/* Snackbar cho thông báo thông tin cá nhân */}
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

export default ProfilePage;
