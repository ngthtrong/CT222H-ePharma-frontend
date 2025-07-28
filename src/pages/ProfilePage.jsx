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
import api from '../api/config';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, []);

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

  const fetchAddresses = async () => {
    try {
      // Chỉ gọi API địa chỉ khi có token (user đã đăng nhập)
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('No token found, skipping address fetch');
        return;
      }

      const response = await api.get('/users/me/addresses');
      if (response.data && response.data.success && response.data.data) {
        setAddresses(response.data.data);
        console.log('Addresses loaded:', response.data.data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      // Không hiển thị lỗi cho địa chỉ vì đây không phải là thông tin bắt buộc
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
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
          <Grid size={{ xs: 12, md: 6 }}>
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
          <Grid size={{ xs: 12, md: 6 }}>
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
          
          {/* Hiển thị danh sách địa chỉ */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Địa chỉ của tôi
            </Typography>
            {addresses.length > 0 ? (
              addresses.map((address, index) => (
                <Paper key={address.id} sx={{ p: 2, mb: 2, backgroundColor: address.isDefault ? '#f0f8ff' : 'white' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {address.recipientName}
                        {address.isDefault && (
                          <Typography component="span" variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                            [Mặc định]
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        SĐT: {address.phoneNumber}
                      </Typography>
                      <Typography variant="body2">
                        {address.street}, {address.ward}, {address.city}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa có địa chỉ nào được thêm
              </Typography>
            )}
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
