import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  TablePagination,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../api/adminApi';
import { getOrderStatusInfo, getPaymentStatusInfo, formatDate, formatCurrency } from '../../utils/adminUtils';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const orderStatuses = [
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'PROCESSING', label: 'Đang xử lý' },
    { value: 'SHIPPED', label: 'Đã giao' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ];

  const paymentStatuses = [
    { value: 'PENDING', label: 'Chờ thanh toán' },
    { value: 'PAID', label: 'Đã thanh toán' },
    { value: 'FAILED', label: 'Thanh toán thất bại' },
    { value: 'REFUNDED', label: 'Đã hoàn tiền' },
  ];

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, statusFilter, searchQuery, startDate, endDate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter,
        search: searchQuery,
        startDate,
        endDate,
      };
      
      const response = await adminAPI.getAllOrders(params);
      
      if (response.data.success) {
        setOrders(response.data.data || []);
        setTotalOrders(response.data.total || 0);
      } else {
        setError(response.data.message || 'Không thể tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNotes('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
    setNewStatus('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Call API theo đúng spec trong tài liệu hướng dẫn
      const response = await adminAPI.updateOrderStatus(selectedOrder.id, {
        status: newStatus,
        notes: statusNotes
      });
      
      if (response.data.success) {
        setSuccess('Cập nhật trạng thái đơn hàng thành công');
        handleCloseDialog();
        fetchOrders();
      } else {
        setError(response.data.message || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Lỗi khi cập nhật trạng thái đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await adminAPI.deleteOrder(orderId);
      
      if (response.data.success) {
        setSuccess('Xóa đơn hàng thành công');
        fetchOrders();
      } else {
        setError(response.data.message || 'Không thể xóa đơn hàng');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Lỗi khi xóa đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchOrders();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    const statusConfig = orderStatuses.find(s => s.value === status) || 
      { label: status, color: 'default' };
    return <Chip label={statusConfig.label} color={statusConfig.color} size="small" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Quản lý đơn hàng
      </Typography>

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

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              size="small"
              placeholder="Mã đơn hàng hoặc tên khách hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {orderStatuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              size="small"
              label="Từ ngày"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              size="small"
              label="Đến ngày"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              fullWidth
            >
              Tìm kiếm
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã đơn hàng</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Ngày đặt</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái đơn hàng</TableCell>
              <TableCell>Thanh toán</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {order.orderCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.customerInfo?.fullName || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.customerInfo?.email || order.customerInfo?.phoneNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    {order.items?.length || 0} sản phẩm
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {formatCurrency(order.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getOrderStatusInfo(order.status).text} 
                      color={getOrderStatusInfo(order.status).color}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getPaymentStatusInfo(order.paymentStatus).text}
                      color={getPaymentStatusInfo(order.paymentStatus).color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewOrder(order)}
                      >
                        Xem
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        Xóa
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Không có đơn hàng nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalOrders}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </TableContainer>

      {/* Order Detail Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Chi tiết đơn hàng #{selectedOrder?.orderCode}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              {/* Order Info */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Thông tin khách hàng
                      </Typography>
                      <Typography variant="body2">
                        <strong>Họ tên:</strong> {selectedOrder.customerInfo?.fullName || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedOrder.customerInfo?.email || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>SĐT:</strong> {selectedOrder.customerInfo?.phoneNumber || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Địa chỉ giao hàng
                      </Typography>
                      <Typography variant="body2">
                        <strong>Người nhận:</strong> {selectedOrder.shippingAddress?.recipientName || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>SĐT:</strong> {selectedOrder.shippingAddress?.phoneNumber || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Địa chỉ:</strong> {selectedOrder.shippingAddress?.address || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phường/Xã:</strong> {selectedOrder.shippingAddress?.ward || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Quận/Huyện:</strong> {selectedOrder.shippingAddress?.district || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Tỉnh/TP:</strong> {selectedOrder.shippingAddress?.province || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Order Summary */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Thông tin đơn hàng
                      </Typography>
                      <Typography variant="body2">
                        <strong>Mã đơn:</strong> {selectedOrder.orderCode}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Ngày đặt:</strong> {formatDate(selectedOrder.createdAt)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Trạng thái thanh toán:</strong> 
                        <Chip 
                          label={getPaymentStatusInfo(selectedOrder.paymentStatus).text}
                          color={getPaymentStatusInfo(selectedOrder.paymentStatus).color}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Tổng tiền
                      </Typography>
                      <Typography variant="body2">
                        <strong>Tạm tính:</strong> {formatCurrency(selectedOrder.subtotal || 0)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phí vận chuyển:</strong> {formatCurrency(selectedOrder.shippingFee || 0)}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        <strong>Tổng cộng:</strong> {formatCurrency(selectedOrder.totalAmount)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Order Items */}
              <Typography variant="h6" gutterBottom>
                Sản phẩm đặt hàng
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sản phẩm</TableCell>
                      <TableCell>Giá</TableCell>
                      <TableCell>Số lượng</TableCell>
                      <TableCell>Thành tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2">
                            {item.productName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {formatCurrency(item.totalPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Order Status Update */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Cập nhật trạng thái đơn hàng
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Trạng thái đơn hàng</InputLabel>
                      <Select
                        value={newStatus}
                        label="Trạng thái đơn hàng"
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        {orderStatuses.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Ghi chú thay đổi"
                      multiline
                      rows={2}
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      fullWidth
                      placeholder="Nhập ghi chú cho việc thay đổi trạng thái..."
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Current Notes */}
              {selectedOrder.notes && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Ghi chú đơn hàng
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    {selectedOrder.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Đóng
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={loading || newStatus === selectedOrder?.status}
          >
            {loading ? <CircularProgress size={20} /> : 'Cập nhật trạng thái'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrders;
