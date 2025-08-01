import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  CheckCircle as CompleteIcon,
  Schedule as PendingIcon,
  Build as ProcessingIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { orderAPI } from '../api/orderApi';
import { formatCurrency } from '../utils/formatters';
import { useSnackbar } from '../hooks/useSnackbar';

const OrderDetailPage = () => {
  const navigate = useNavigate();
  const { orderCode } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const { showError, showSuccess, snackbar, hideSnackbar } = useSnackbar();

  // Check if this is a newly created order
  const isNewOrder = location.state?.orderCreated;

  // Order status configurations
  const orderStatuses = {
    PENDING: { label: 'Chờ xử lý', color: 'warning', icon: <PendingIcon /> },
    PROCESSING: { label: 'Đang xử lý', color: 'info', icon: <ProcessingIcon /> },
    SHIPPED: { label: 'Đang giao', color: 'primary', icon: <ShippingIcon /> },
    COMPLETED: { label: 'Hoàn thành', color: 'success', icon: <CompleteIcon /> },
    CANCELLED: { label: 'Đã hủy', color: 'error', icon: <CancelIcon /> },
  };

  const paymentStatuses = {
    UNPAID: { label: 'Chưa thanh toán', color: 'error' },
    PAID: { label: 'Đã thanh toán', color: 'success' },
  };

  const paymentMethods = {
    COD: 'Thanh toán khi nhận hàng',
    MOMO: 'MoMo',
    BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  };

  // Order status steps
  const getOrderSteps = () => {
    const allSteps = [
      { key: 'PENDING', label: 'Đơn hàng đã được tạo' },
      { key: 'PROCESSING', label: 'Đang xử lý' },
      { key: 'SHIPPED', label: 'Đang giao hàng' },
      { key: 'COMPLETED', label: 'Hoàn thành' },
    ];

    if (order?.status === 'CANCELLED') {
      return [
        { key: 'PENDING', label: 'Đơn hàng đã được tạo' },
        { key: 'CANCELLED', label: 'Đã hủy' },
      ];
    }

    return allSteps;
  };

  const getActiveStep = () => {
    if (!order) return 0;
    
    const steps = getOrderSteps();
    const currentStepIndex = steps.findIndex(step => step.key === order.status);
    return currentStepIndex >= 0 ? currentStepIndex : 0;
  };

  useEffect(() => {
    if (orderCode) {
      fetchOrderDetail();
    }
    
    // Hiển thị thông báo thành công nếu được chuyển hướng từ checkout
    if (location.state?.showSuccessMessage && location.state?.orderCreated) {
      const orderData = location.state?.orderData;
      const successMessage = orderData 
        ? `✅ Đặt hàng thành công! Đơn hàng #${orderData.orderCode} đã được tạo với tổng giá trị ${formatCurrency(orderData.totalAmount)}. Cảm ơn bạn đã mua sắm tại cửa hàng!`
        : '✅ Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại cửa hàng chúng tôi!';
      
      showSuccess(successMessage, 6000); // Show for 6 seconds
    }
  }, [orderCode, location.state]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getUserOrderByCode(orderCode);
      
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        showError(response.data.message || 'Không thể tải chi tiết đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching order detail:', error);
      showError('Lỗi khi tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      showError('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }

    try {
      setLoading(true);
      const response = await orderAPI.cancelOrder(orderCode, cancelReason);
      
      if (response.data.success) {
        showSuccess('Hủy đơn hàng thành công');
        setCancelDialogOpen(false);
        setCancelReason('');
        fetchOrderDetail();
      } else {
        showError(response.data.message || 'Không thể hủy đơn hàng');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      showError('Lỗi khi hủy đơn hàng');
    } finally {
      setLoading(false);
    }
  };

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

  const canCancelOrder = () => {
    return order && (order.status === 'PENDING' || order.status === 'PROCESSING');
  };

  if (loading && !order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Không tìm thấy đơn hàng #{orderCode}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Success message for new orders */}
      {(isNewOrder || location.state?.orderCreated) && order && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Typography variant="h6" component="div" sx={{ mb: 1 }}>
            🎉 Đặt hàng thành công!
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi. Đơn hàng #{order.orderCode} 
            với tổng giá trị <strong>{formatCurrency(order.totalAmount)}</strong> đã được tạo thành công.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            📱 Chúng tôi đã gửi thông báo xác nhận đến tài khoản của bạn. 
            Đơn hàng sẽ được xử lý trong vòng 1-2 giờ làm việc.
          </Typography>
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/orders')}
          color="primary"
        >
          Quay lại danh sách đơn hàng
        </Button>
      </Box>

      <Typography variant="h4" component="h1" gutterBottom>
        Chi tiết đơn hàng #{order.orderCode}
      </Typography>

      <Grid container spacing={3}>
        {/* Order Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Trạng thái đơn hàng
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Chip
                label={orderStatuses[order.status]?.label || order.status}
                color={orderStatuses[order.status]?.color || 'default'}
                icon={orderStatuses[order.status]?.icon}
                size="medium"
              />
              <Chip
                label={paymentStatuses[order.paymentStatus]?.label || order.paymentStatus}
                color={paymentStatuses[order.paymentStatus]?.color || 'default'}
                variant="outlined"
                size="medium"
              />
            </Box>

            <Stepper activeStep={getActiveStep()} alternativeLabel>
              {getOrderSteps().map((step) => (
                <Step key={step.key}>
                  <StepLabel
                    StepIconProps={{
                      style: {
                        color: step.key === order.status ? 
                          (orderStatuses[step.key]?.color === 'error' ? '#f44336' : '#2196f3') : 
                          undefined
                      }
                    }}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Grid>

        {/* Order Info */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Order Details */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thông tin đơn hàng
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Mã đơn hàng
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {order.orderCode}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ngày đặt hàng
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(order.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phương thức thanh toán
                  </Typography>
                  <Typography variant="body1">
                    {paymentMethods[order.paymentMethod] || order.paymentMethod}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật lần cuối
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(order.updatedAt)}
                  </Typography>
                </Grid>
                {order.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Ghi chú
                    </Typography>
                    <Typography variant="body1">
                      {order.notes}
                    </Typography>
                  </Grid>
                )}
                {order.cancelReason && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Lý do hủy
                    </Typography>
                    <Typography variant="body1" color="error">
                      {order.cancelReason}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Shipping Address */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Địa chỉ giao hàng
              </Typography>
              {order.shippingAddress ? (
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {order.shippingAddress.recipientName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.shippingAddress.phoneNumber}
                  </Typography>
                  <Typography variant="body2">
                    {[
                      order.shippingAddress.street,
                      order.shippingAddress.ward,
                      order.shippingAddress.city
                    ].filter(Boolean).join(', ')}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có thông tin địa chỉ
                </Typography>
              )}
            </Paper>

            {/* Order Items */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sản phẩm đã đặt
              </Typography>
              <List>
                {order.items?.map((item, index) => (
                  <ListItem key={index} divider={index < order.items.length - 1} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          {item.productName}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Số lượng: {item.quantity} x {formatCurrency(item.priceAtPurchase)}
                        </Typography>
                      }
                    />
                    <Typography variant="subtitle1" fontWeight="medium">
                      {formatCurrency(item.itemTotal)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Stack>
        </Grid>

        {/* Order Summary & Actions */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Order Summary */}
            <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
              <Typography variant="h6" gutterBottom>
                Tóm tắt đơn hàng
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Tạm tính:</Typography>
                <Typography variant="body2">
                  {formatCurrency(order.subtotal)}
                </Typography>
              </Box>
              
              {order.shippingFee > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Phí vận chuyển:</Typography>
                  <Typography variant="body2">
                    {formatCurrency(order.shippingFee)}
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Tổng cộng:</Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(order.totalAmount)}
                </Typography>
              </Box>
            </Paper>

            {/* Actions */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thao tác
              </Typography>
              
              <Stack spacing={2}>
                {canCancelOrder() && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={loading}
                    fullWidth
                  >
                    Hủy đơn hàng
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                  fullWidth
                >
                  In đơn hàng
                </Button>
                
                <Button
                  variant="contained"
                  onClick={() => navigate('/products')}
                  fullWidth
                >
                  Tiếp tục mua sắm
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Hủy đơn hàng</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Bạn có chắc chắn muốn hủy đơn hàng #{order.orderCode}?
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Lý do hủy đơn hàng"
            type="text"
            fullWidth
            variant="outlined"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Vui lòng nhập lý do hủy đơn hàng..."
            multiline
            rows={3}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Không
          </Button>
          <Button
            onClick={handleCancelOrder}
            color="error"
            variant="contained"
            disabled={loading || !cancelReason.trim()}
          >
            {loading ? <CircularProgress size={20} /> : 'Hủy đơn hàng'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={hideSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            fontSize: '1rem',
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrderDetailPage;
