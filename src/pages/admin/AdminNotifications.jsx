import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useAdminNotifications } from '../../hooks/useNotifications';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
  getNotificationTypeColor,
  getNotificationTypeIcon,
} from '../../api/notificationApi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const AdminNotifications = () => {
  const {
    notifications,
    loading,
    error,
    sending,
    sendNewNotification,
    removeNotification,
    refresh,
    setError
  } = useAdminNotifications();

  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'GENERAL',
    userId: '',
    relatedId: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, notificationId: null });
  const [viewDialog, setViewDialog] = useState({ open: false, notification: null });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền đầy đủ tiêu đề và nội dung',
        severity: 'error'
      });
      return;
    }

    try {
      const notificationData = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        relatedId: formData.relatedId.trim() || null,
        userId: formData.userId.trim() || null
      };

      await sendNewNotification(notificationData);
      
      setSnackbar({
        open: true,
        message: formData.userId 
          ? 'Thông báo đã được gửi đến user'
          : 'Thông báo đã được broadcast đến tất cả user',
        severity: 'success'
      });

      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'GENERAL',
        userId: '',
        relatedId: ''
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Gửi thông báo thất bại',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await removeNotification(notificationId);
      setSnackbar({
        open: true,
        message: 'Xóa thông báo thành công',
        severity: 'success'
      });
      setDeleteDialog({ open: false, notificationId: null });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Xóa thông báo thất bại',
        severity: 'error'
      });
    }
  };

  const getTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: vi 
      });
    } catch {
      return 'Không rõ';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary">
          🔔 Quản lý Thông báo
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={refresh}
          disabled={loading}
        >
          Làm mới
        </Button>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Gửi thông báo" />
            <Tab label="Danh sách thông báo" />
          </Tabs>
        </Box>

        {/* Tab 1: Gửi thông báo */}
        {activeTab === 0 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tạo thông báo mới
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tiêu đề thông báo"
                    value={formData.title}
                    onChange={handleInputChange('title')}
                    required
                    inputProps={{ maxLength: 200 }}
                    helperText={`${formData.title.length}/200 ký tự`}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nội dung thông báo"
                    value={formData.message}
                    onChange={handleInputChange('message')}
                    required
                    multiline
                    rows={4}
                    inputProps={{ maxLength: 1000 }}
                    helperText={`${formData.message.length}/1000 ký tự`}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Loại thông báo</InputLabel>
                    <Select
                      value={formData.type}
                      onChange={handleInputChange('type')}
                      label="Loại thông báo"
                    >
                      {Object.entries(NOTIFICATION_TYPE_LABELS).map(([key, label]) => (
                        <MenuItem key={key} value={key}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>{getNotificationTypeIcon(key)}</Typography>
                            <Typography>{label}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="User ID (để trống = gửi tất cả)"
                    value={formData.userId}
                    onChange={handleInputChange('userId')}
                    placeholder="Để trống để gửi broadcast"
                    helperText="Nhập ID user cụ thể hoặc để trống để gửi cho tất cả"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Related ID (tùy chọn)"
                    value={formData.relatedId}
                    onChange={handleInputChange('relatedId')}
                    placeholder="ID đơn hàng, sản phẩm liên quan..."
                    helperText="ID của đối tượng liên quan (đơn hàng, sản phẩm, v.v.)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
                    disabled={sending}
                    sx={{ minWidth: 200 }}
                  >
                    {sending ? 'Đang gửi...' : (formData.userId ? 'Gửi thông báo' : 'Gửi broadcast')}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        )}

        {/* Tab 2: Danh sách thông báo */}
        {activeTab === 1 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Danh sách thông báo ({notifications.length})
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : notifications.length === 0 ? (
              <Alert severity="info">
                Chưa có thông báo nào được tạo
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Loại</TableCell>
                      <TableCell>Tiêu đề</TableCell>
                      <TableCell>Người nhận</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Thời gian</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <Chip
                            size="small"
                            label={NOTIFICATION_TYPE_LABELS[notification.type]}
                            color={getNotificationTypeColor(notification.type)}
                            icon={<Typography>{getNotificationTypeIcon(notification.type)}</Typography>}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {notification.title}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {notification.userName || 'Tất cả user'}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            size="small"
                            label={notification.isRead ? 'Đã đọc' : 'Chưa đọc'}
                            color={notification.isRead ? 'success' : 'warning'}
                            variant="outlined"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {getTimeAgo(notification.createdAt)}
                          </Typography>
                        </TableCell>
                        
                        <TableCell align="center">
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              size="small"
                              onClick={() => setViewDialog({ open: true, notification })}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, notificationId: notification.id })}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, notificationId: null })}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa thông báo này không? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, notificationId: null })}>
            Hủy
          </Button>
          <Button
            onClick={() => handleDelete(deleteDialog.notificationId)}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, notification: null })}
        maxWidth="md"
        fullWidth
      >
        {viewDialog.notification && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography>{getNotificationTypeIcon(viewDialog.notification.type)}</Typography>
                <Typography variant="h6">
                  {viewDialog.notification.title}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {viewDialog.notification.message}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Loại:</Typography>
                  <Typography variant="body2">
                    {NOTIFICATION_TYPE_LABELS[viewDialog.notification.type]}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Người nhận:</Typography>
                  <Typography variant="body2">
                    {viewDialog.notification.userName || 'Tất cả user'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Trạng thái:</Typography>
                  <Typography variant="body2">
                    {viewDialog.notification.isRead ? 'Đã đọc' : 'Chưa đọc'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Thời gian tạo:</Typography>
                  <Typography variant="body2">
                    {new Date(viewDialog.notification.createdAt).toLocaleString('vi-VN')}
                  </Typography>
                </Grid>
                
                {viewDialog.notification.relatedId && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Related ID:</Typography>
                    <Typography variant="body2">
                      {viewDialog.notification.relatedId}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialog({ open: false, notification: null })}>
                Đóng
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminNotifications;
