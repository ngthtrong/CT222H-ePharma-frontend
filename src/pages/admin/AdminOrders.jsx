import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Stack,
  Snackbar,
  Alert,
  TablePagination,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  CheckCircle as CompleteIcon,
  Schedule as PendingIcon,
  Build as ProcessingIcon,
} from '@mui/icons-material';
import { orderAPI } from '../../api/orderApi';
import { useSnackbar } from '../../hooks/useSnackbar';
import { formatCurrency } from '../../utils/formatters';
import orderWorkflow, { 
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  getAvailableStatuses,
  canTransitionToStatus,
  getStatusTransitionAction,
  validateStatusTransition,
  getOrderPriority,
  getRecommendedAction
} from '../../utils/orderWorkflow';
import { useOrderIcons } from '../../hooks/useOrderIcons';
import OrderWorkflowDialog from '../../components/OrderWorkflowDialog';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openWorkflowDialog, setOpenWorkflowDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Icons hook
  const { getOrderStatusIcon } = useOrderIcons();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Snackbar hook
  const { snackbar, hideSnackbar, showSuccess, showError, showWarning } = useSnackbar();

  // Status update form
  const [statusFormData, setStatusFormData] = useState({
    status: '',
    notes: '',
    trackingNumber: '', // Add tracking number for SHIPPED status
  });

  // Additional state for bulk operations and enhanced filtering
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkDialog, setShowBulkDialog] = useState(false);

  // Order status configurations using utility
  const orderStatuses = ORDER_STATUSES;
  const paymentStatuses = PAYMENT_STATUSES;
  const paymentMethods = PAYMENT_METHODS;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Build filters
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (paymentStatusFilter) filters.paymentStatus = paymentStatusFilter;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (searchQuery) filters.search = searchQuery;
      
      const response = await orderAPI.getAllOrders(filters);
      
      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        showError(response.data.message || 'Không thể tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (order) => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrderById(order.id);
      
      if (response.data.success) {
        setSelectedOrder(response.data.data);
        setOpenDetailDialog(true);
      } else {
        showError('Không thể tải chi tiết đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      showError('Lỗi khi tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusDialog = (order) => {
    setSelectedOrder(order);
    setStatusFormData({
      status: order.status,
      notes: '',
      trackingNumber: order.trackingNumber || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
    setStatusFormData({ 
      status: '', 
      notes: '', 
      trackingNumber: '' 
    });
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async () => {
    try {
      if (!selectedOrder || !statusFormData.status) {
        showError('Vui lòng chọn trạng thái mới');
        return;
      }

      // Use utility for validation
      const validation = validateStatusTransition(
        selectedOrder.status, 
        statusFormData.status, 
        selectedOrder, 
        statusFormData
      );

      if (!validation.valid) {
        showError(validation.errors.join('. '));
        return;
      }

      setLoading(true);
      
      const updateData = {
        status: statusFormData.status,
        notes: statusFormData.notes || null
      };

      // Add tracking number if status is SHIPPED
      if (statusFormData.status === 'SHIPPED' && statusFormData.trackingNumber) {
        updateData.trackingNumber = statusFormData.trackingNumber;
      }

      const response = await orderAPI.updateOrderStatus(
        selectedOrder.id,
        statusFormData.status,
        statusFormData.notes || null
      );
      
      if (response.data.success) {
        showSuccess(`Đã cập nhật trạng thái đơn hàng thành "${orderStatuses[statusFormData.status]?.label}"`);
        handleCloseDialog();
        fetchOrders();
      } else {
        showError(response.data.message || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Lỗi khi cập nhật trạng thái đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusUpdate = async (orderId, paymentStatus) => {
    try {
      setLoading(true);
      
      const response = await orderAPI.updatePaymentStatus(orderId, paymentStatus);
      
      if (response.data.success) {
        showSuccess('Cập nhật trạng thái thanh toán thành công');
        fetchOrders();
      } else {
        showError(response.data.message || 'Không thể cập nhật trạng thái thanh toán');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      showError('Lỗi khi cập nhật trạng thái thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      try {
        setLoading(true);
        
        const response = await orderAPI.deleteOrder(orderId);
        
        if (response.data.success) {
          showSuccess('Xóa đơn hàng thành công');
          fetchOrders();
        } else {
          showError(response.data.message || 'Không thể xóa đơn hàng');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        showError('Lỗi khi xóa đơn hàng');
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter and sort orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.shippingAddress?.recipientName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesPaymentStatus = !paymentStatusFilter || order.paymentStatus === paymentStatusFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  // Pagination
  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPaymentStatusFilter('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  // Remove old functions and use utility versions
  // const getAvailableStatuses, canTransitionToStatus, etc. are now imported

  // Get status transition description using utility
  const getStatusTransitionDescription = (currentStatus, newStatus) => {
    const action = getStatusTransitionAction(currentStatus, newStatus);
    return action?.description || '';
  };

  // Quick action functions
  const handleQuickStatusUpdate = async (order, newStatus) => {
    try {
      if (!canTransitionToStatus(order.status, newStatus)) {
        showError(`Không thể chuyển từ ${orderStatuses[order.status]?.label} sang ${orderStatuses[newStatus]?.label}`);
        return;
      }

      // For SHIPPED status, need tracking number
      if (newStatus === 'SHIPPED') {
        handleOpenStatusDialog(order);
        setStatusFormData(prev => ({ ...prev, status: newStatus }));
        return;
      }

      setLoading(true);
      
      const response = await orderAPI.updateOrderStatus(order.id, newStatus, null);
      
      if (response.data.success) {
        showSuccess(`Đã cập nhật trạng thái đơn hàng thành "${orderStatuses[newStatus]?.label}"`);
        fetchOrders();
      } else {
        showError(response.data.message || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Lỗi khi cập nhật trạng thái đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Get order priority based on status and time using utility
  // const getOrderPriority is now imported from utility

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Quản lý đơn hàng</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="info"
            onClick={() => setOpenWorkflowDialog(true)}
          >
            Xem quy trình
          </Button>
          <Button
            variant="outlined"
            onClick={fetchOrders}
            disabled={loading}
          >
            Làm mới
          </Button>
        </Box>
      </Box>

      {/* Order Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(orderStatuses).map(([status, config]) => {
          const count = orders.filter(order => order.status === status).length;
          const percentage = orders.length > 0 ? (count / orders.length * 100).toFixed(1) : 0;
          
          return (
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={status}>
              <Card 
                sx={{ 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 3 },
                  border: statusFilter === status ? 2 : 0,
                  borderColor: statusFilter === status ? config.color + '.main' : 'transparent'
                }}
                onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              >
                <CardContent sx={{ pb: '16px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    {getOrderStatusIcon(status)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {count}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {config.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {percentage}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm đơn hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {Object.entries(orderStatuses).map(([status, config]) => (
                    <MenuItem key={status} value={status}>
                      {config.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Thanh toán</InputLabel>
                <Select
                  value={paymentStatusFilter}
                  label="Thanh toán"
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {Object.entries(paymentStatuses).map(([status, config]) => (
                    <MenuItem key={status} value={status}>
                      {config.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                type="date"
                label="Từ ngày"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                type="date"
                label="Đến ngày"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 1 }}>
              <Stack direction="column" spacing={1} alignItems="stretch">
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={!searchQuery && !statusFilter && !paymentStatusFilter && !startDate && !endDate}
                  fullWidth
                >
                  Xóa lọc
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {filteredOrders.length} đơn hàng
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã đơn hàng</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thanh toán</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                      {order.orderCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {order.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.shippingAddress?.city}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" color="primary">
                      {formatCurrency(order.totalAmount)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {paymentMethods[order.paymentMethod]?.label || order.paymentMethod}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={orderStatuses[order.status]?.label || order.status}
                        color={orderStatuses[order.status]?.color || 'default'}
                        size="small"
                        icon={getOrderStatusIcon(order.status)}
                      />
                      {getOrderPriority(order) === 'high' && (
                        <Chip label="Ưu tiên" color="error" size="small" variant="outlined" />
                      )}
                      {getOrderPriority(order) === 'medium' && (
                        <Chip label="Chú ý" color="warning" size="small" variant="outlined" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={paymentStatuses[order.paymentStatus]?.label || order.paymentStatus}
                      color={paymentStatuses[order.paymentStatus]?.color || 'default'}
                      size="small"
                      onClick={() => {
                        if (order.paymentStatus === 'UNPAID') {
                          handlePaymentStatusUpdate(order.id, 'PAID');
                        }
                      }}
                      sx={{ 
                        cursor: order.paymentStatus === 'UNPAID' ? 'pointer' : 'default',
                        '&:hover': order.paymentStatus === 'UNPAID' ? { opacity: 0.8 } : {}
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(order.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        onClick={() => handleViewOrder(order)}
                        color="primary"
                        size="small"
                        title="Xem chi tiết"
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      {/* Quick action buttons based on current status */}
                      {getAvailableStatuses(order.status).map((nextStatus) => (
                        <IconButton
                          key={nextStatus}
                          onClick={() => handleQuickStatusUpdate(order, nextStatus)}
                          color={orderStatuses[nextStatus]?.color || 'default'}
                          size="small"
                          title={`Chuyển sang: ${orderStatuses[nextStatus]?.label}`}
                        >
                          {getOrderStatusIcon(nextStatus)}
                        </IconButton>
                      ))}
                      
                      <IconButton
                        onClick={() => handleOpenStatusDialog(order)}
                        color="info"
                        size="small"
                        disabled={!getAvailableStatuses(order.status).length}
                        title="Cập nhật trạng thái với ghi chú"
                      >
                        <EditIcon />
                      </IconButton>
                      
                      <IconButton
                        onClick={() => handleDeleteOrder(order.id)}
                        color="error"
                        size="small"
                        title="Xóa đơn hàng"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {searchQuery || statusFilter || paymentStatusFilter ? 
                    'Không tìm thấy đơn hàng phù hợp' : 
                    'Chưa có đơn hàng nào'
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          component="div"
          count={filteredOrders.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </TableContainer>

      {/* Status Update Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          Cập nhật trạng thái đơn hàng #{selectedOrder?.orderCode}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {/* Current Status Info */}
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Trạng thái hiện tại
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label={orderStatuses[selectedOrder?.status]?.label}
                  color={orderStatuses[selectedOrder?.status]?.color}
                  icon={orderStatuses[selectedOrder?.status]?.icon}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {orderStatuses[selectedOrder?.status]?.description}
              </Typography>
            </Box>

            {/* New Status Selection */}
            <FormControl fullWidth>
              <InputLabel>Trạng thái mới</InputLabel>
              <Select
                value={statusFormData.status}
                label="Trạng thái mới"
                onChange={(e) => setStatusFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                {getAvailableStatuses(selectedOrder?.status || '').map((status) => (
                  <MenuItem key={status} value={status}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getOrderStatusIcon(status)}
                      <Box>
                        <Typography variant="body2">
                          {orderStatuses[status]?.label || status}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getStatusTransitionDescription(selectedOrder?.status, status)}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Tracking Number for SHIPPED status */}
            {statusFormData.status === 'SHIPPED' && (
              <TextField
                label="Mã vận đơn *"
                value={statusFormData.trackingNumber}
                onChange={(e) => setStatusFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                fullWidth
                required
                placeholder="VD: VTP123456789"
                helperText="Nhập mã vận đơn của đơn vị vận chuyển"
              />
            )}

            {/* Notes */}
            <TextField
              label="Ghi chú (tùy chọn)"
              value={statusFormData.notes}
              onChange={(e) => setStatusFormData(prev => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={3}
              fullWidth
              placeholder="Thêm ghi chú về việc cập nhật trạng thái..."
            />

            {/* Status change preview */}
            {statusFormData.status && statusFormData.status !== selectedOrder?.status && (
              <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Xem trước thay đổi
                </Typography>
                <Typography variant="body2">
                  <strong>Từ:</strong> {orderStatuses[selectedOrder?.status]?.label}
                  {' → '}
                  <strong>Sang:</strong> {orderStatuses[statusFormData.status]?.label}
                </Typography>
                {getStatusTransitionDescription(selectedOrder?.status, statusFormData.status) && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {getStatusTransitionDescription(selectedOrder?.status, statusFormData.status)}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={
              loading || 
              !statusFormData.status || 
              statusFormData.status === selectedOrder?.status ||
              (statusFormData.status === 'SHIPPED' && !statusFormData.trackingNumber)
            }
          >
            {loading ? <CircularProgress size={20} /> : 'Cập nhật trạng thái'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog 
        open={openDetailDialog} 
        onClose={handleCloseDetailDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Chi tiết đơn hàng #{selectedOrder?.orderCode}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={3}>
                {/* Order Info */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin đơn hàng
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Mã đơn hàng: <strong>{selectedOrder.orderCode}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ngày tạo: {formatDate(selectedOrder.createdAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cập nhật: {formatDate(selectedOrder.updatedAt)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={orderStatuses[selectedOrder.status]?.label}
                      color={orderStatuses[selectedOrder.status]?.color}
                      icon={getOrderStatusIcon(selectedOrder.status)}
                    />
                    <Chip
                      label={paymentStatuses[selectedOrder.paymentStatus]?.label}
                      color={paymentStatuses[selectedOrder.paymentStatus]?.color}
                    />
                  </Box>

                  {/* Status Flow Visualization */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Trạng thái có thể chuyển:
                    </Typography>
                    {getAvailableStatuses(selectedOrder.status).length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {getAvailableStatuses(selectedOrder.status).map((nextStatus) => (
                          <Chip
                            key={nextStatus}
                            label={orderStatuses[nextStatus]?.label}
                            variant="outlined"
                            color={orderStatuses[nextStatus]?.color}
                            icon={getOrderStatusIcon(nextStatus)}
                            size="small"
                            onClick={() => {
                              handleCloseDetailDialog();
                              handleQuickStatusUpdate(selectedOrder, nextStatus);
                            }}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Không thể chuyển trạng thái
                      </Typography>
                    )}
                  </Box>

                  {selectedOrder.trackingNumber && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Mã vận đơn:</strong> {selectedOrder.trackingNumber}
                    </Typography>
                  )}

                  {selectedOrder.notes && (
                    <Typography variant="body2">
                      <strong>Ghi chú:</strong> {selectedOrder.notes}
                    </Typography>
                  )}
                </Grid>

                {/* Customer Info */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin khách hàng
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tên:</strong> {selectedOrder.userName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Người nhận:</strong> {selectedOrder.shippingAddress?.recipientName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>SĐT:</strong> {selectedOrder.shippingAddress?.phoneNumber}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Địa chỉ:</strong> {[
                      selectedOrder.shippingAddress?.street,
                      selectedOrder.shippingAddress?.ward,
                      selectedOrder.shippingAddress?.city
                    ].filter(Boolean).join(', ')}
                  </Typography>
                </Grid>

                {/* Order Items */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Sản phẩm đã đặt
                  </Typography>
                  <List>
                    {selectedOrder.items?.map((item, index) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={item.productName}
                          secondary={`Số lượng: ${item.quantity} x ${formatCurrency(item.priceAtPurchase)}`}
                        />
                        <Typography variant="subtitle2">
                          {formatCurrency(item.itemTotal)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Tạm tính:</Typography>
                    <Typography>{formatCurrency(selectedOrder.subtotal)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Phí vận chuyển:</Typography>
                    <Typography>{formatCurrency(selectedOrder.shippingFee || 0)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Tổng cộng:</Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Đóng</Button>
          {selectedOrder && getAvailableStatuses(selectedOrder.status).length > 0 && (
            <Button
              variant="contained"
              onClick={() => {
                handleCloseDetailDialog();
                handleOpenStatusDialog(selectedOrder);
              }}
            >
              Cập nhật trạng thái
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={hideSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Order Workflow Dialog */}
      <OrderWorkflowDialog
        open={openWorkflowDialog}
        onClose={() => setOpenWorkflowDialog(false)}
        currentStatus={selectedOrder?.status || 'PENDING'}
      />
    </Box>
  );
};

export default AdminOrders;
