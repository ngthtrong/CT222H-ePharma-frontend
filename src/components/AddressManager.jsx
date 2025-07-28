import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  CardActions,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { addressAPI } from '../api';

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    recipientName: '',
    phoneNumber: '',
    city: '',
    ward: '',
    street: '',
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Hàm tiện ích để hiển thị snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Vui lòng đăng nhập để xem địa chỉ');
        return;
      }

            const response = await addressAPI.getAddresses();
      if (response && response.success && response.data) {
        setAddresses(response.data);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setError('Không thể tải danh sách địa chỉ');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        recipientName: address.recipientName || '',
        phoneNumber: address.phoneNumber || '',
        city: address.city || '',
        ward: address.ward || '',
        street: address.street || '',
        isDefault: address.isDefault || false,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        recipientName: '',
        phoneNumber: '',
        city: '',
        ward: '',
        street: '',
        isDefault: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAddress(null);
    setFormData({
      recipientName: '',
      phoneNumber: '',
      city: '',
      ward: '',
      street: '',
      isDefault: false,
    });
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async () => {
    try {
      setDialogLoading(true);
      setError('');

      // Validation
      if (!formData.recipientName || !formData.phoneNumber || !formData.city || 
          !formData.ward || !formData.street) {
        setError('Vui lòng nhập đầy đủ thông tin địa chỉ');
        return;
      }

      let response;
      if (editingAddress) {
        // Update existing address
        response = await addressAPI.updateAddress(editingAddress.id, formData);
        showSnackbar('Cập nhật địa chỉ thành công', 'success');
      } else {
        // Add new address
        response = await addressAPI.addAddress(formData);
        showSnackbar('Thêm địa chỉ mới thành công', 'success');
      }

      // Refresh addresses list
      await fetchAddresses();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving address:', error);
      showSnackbar(
        editingAddress ? 'Không thể cập nhật địa chỉ' : 'Không thể thêm địa chỉ mới', 
        'error'
      );
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return;
    }

    try {
      await addressAPI.deleteAddress(addressId);
      showSnackbar('Xóa địa chỉ thành công', 'success');
      await fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      showSnackbar('Không thể xóa địa chỉ', 'error');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      // Find the address and update it to be default
      const addressToUpdate = addresses.find(addr => addr.id === addressId);
      if (addressToUpdate) {
        await addressAPI.updateAddress(addressId, {
          ...addressToUpdate,
          isDefault: true
        });
        
        // Hiển thị snackbar
        showSnackbar('Đã đặt làm địa chỉ mặc định', 'success');
        
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      showSnackbar('Không thể đặt địa chỉ mặc định', 'error');
    }
  };

  const formatFullAddress = (address) => {
    return `${address.street}, ${address.ward}, ${address.city}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Địa chỉ của tôi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm địa chỉ mới
        </Button>
      </Box>

      {/* Messages - Chỉ hiển thị error validation */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Address List */}
      {addresses.length > 0 ? (
        <Grid container spacing={2}>
          {addresses.map((address) => (
            <Grid item xs={12} key={address.id}>
              <Card variant="outlined" sx={{ 
                backgroundColor: address.isDefault ? '#f0f8ff' : 'white',
                border: address.isDefault ? '2px solid #1976d2' : undefined
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {address.recipientName}
                        </Typography>
                        {address.isDefault && (
                          <Chip
                            label="Mặc định"
                            size="small"
                            color="primary"
                            icon={<HomeIcon />}
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        SĐT: {address.phoneNumber}
                      </Typography>
                      <Typography variant="body2">
                        {formatFullAddress(address)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(address)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(address.id)}
                        color="error"
                        disabled={address.isDefault && addresses.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
                {!address.isDefault && (
                  <CardActions sx={{ pt: 0 }}>
                    <Button
                      size="small"
                      onClick={() => handleSetDefault(address.id)}
                      variant="outlined"
                    >
                      Đặt làm mặc định
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Chưa có địa chỉ nào được thêm
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm địa chỉ đầu tiên
          </Button>
        </Paper>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên người nhận"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Thành phố"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                margin="normal"
                placeholder="Ví dụ: Cần Thơ, Hồ Chí Minh..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phường/Xã"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                required
                margin="normal"
                placeholder="Ví dụ: Ninh Kiều, Bến Nghé..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ cụ thể"
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
                margin="normal"
                multiline
                rows={2}
                placeholder="Ví dụ: 25/132 Đ.3/2, 123 Đường Lê Lợi..."
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Đặt làm địa chỉ mặc định"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} disabled={dialogLoading}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={dialogLoading}
          >
            {dialogLoading ? (
              <CircularProgress size={20} />
            ) : (
              editingAddress ? 'Cập nhật' : 'Thêm mới'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar cho tất cả thông báo địa chỉ */}
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

export default AddressManager;
