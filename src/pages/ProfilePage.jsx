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
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Debug: Check if token exists before making request
      const token = localStorage.getItem('accessToken');
      console.log('=== ProfilePage fetchProfile ===');
      console.log('Token exists:', !!token);
      if (token) {
        console.log('Token preview:', token.substring(0, 20) + '...');
      } else {
        console.log('NO TOKEN FOUND - this will cause 403 error');
      }
      
      const response = await authAPI.getProfile();
      console.log('Profile response:', response);
      
      // authAPI.getProfile() trả về response.data, có thể có cấu trúc:
      // { success, message, data: { user info } } hoặc trực tiếp user data
      let userData;
      if (response.success && response.data) {
        // Nested response structure
        userData = response.data;
      } else if (response.id || response.email) {
        // Direct user data
        userData = response;
      } else {
        throw new Error('Invalid profile response');
      }
      
      setProfile(userData);
      setFormData({
        name: userData.fullName || userData.name || '',
        email: userData.email || '',
        phone: userData.phoneNumber || userData.phone || '',
        address: userData.addresses || userData.address || '',
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      console.error('Error response:', error.response);
      setError('Không thể tải thông tin profile');
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
      await authAPI.updateProfile(formData);
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      setError('');
    } catch (error) {
      setError('Cập nhật thông tin thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}
          >
            {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              {profile?.name || 'Người dùng'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile?.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Họ và tên"
              name="name"
              value={formData.name}
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
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              variant={isEditing ? 'outlined' : 'standard'}
              InputProps={{
                readOnly: !isEditing,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Địa chỉ"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              variant={isEditing ? 'outlined' : 'standard'}
              multiline
              rows={isEditing ? 3 : 1}
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
                    name: profile?.name || '',
                    email: profile?.email || '',
                    phone: profile?.phone || '',
                    address: profile?.address || '',
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
      </Paper>
    </Box>
  );
};

export default ProfilePage;
