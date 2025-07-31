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
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  CheckCircle as CompleteIcon,
  Schedule as PendingIcon,
  Build as ProcessingIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../api/orderApi';
import { formatCurrency } from '../utils/formatters';
import { useSnackbar } from '../hooks/useSnackbar';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({});
  const { showError, showSuccess } = useSnackbar();

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getUserOrders();
      
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

  const handleCancelOrder = async (orderCode) => {
    const reason = prompt('Vui lòng nhập lý do hủy đơn hàng:');
    if (!reason) return;

    try {
      setLoading(true);
      const response = await orderAPI.cancelOrder(orderCode, reason);
      
      if (response.data.success) {
        showSuccess('Hủy đơn hàng thành công');
        fetchOrders();
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

  const toggleOrderExpanded = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
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

  const canCancelOrder = (order) => {
    return order.status === 'PENDING' || order.status === 'PROCESSING';
  };

  if (loading && orders.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Lịch sử đơn hàng
      </Typography>

      {orders.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Bạn chưa có đơn hàng nào. 
          <Button
            color="primary"
            onClick={() => navigate('/products')}
            sx={{ ml: 1 }}
          >
            Mua sắm ngay
          </Button>
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" component="div">
                        Đơn hàng #{order.orderCode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Đặt ngày: {formatDate(order.createdAt)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip
                        label={orderStatuses[order.status]?.label || order.status}
                        color={orderStatuses[order.status]?.color || 'default'}
                        size="small"
                        icon={orderStatuses[order.status]?.icon}
                      />
                      <Chip
                        label={paymentStatuses[order.paymentStatus]?.label || order.paymentStatus}
                        color={paymentStatuses[order.paymentStatus]?.color || 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Tổng tiền
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Phương thức thanh toán
                      </Typography>
                      <Typography variant="body2">
                        {paymentMethods[order.paymentMethod] || order.paymentMethod}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Địa chỉ giao hàng
                      </Typography>
                      <Typography variant="body2">
                        {order.shippingAddress?.city || 'N/A'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => navigate(`/orders/${order.orderCode}`)}
                        >
                          Xem chi tiết
                        </Button>
                        
                        {canCancelOrder(order) && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleCancelOrder(order.orderCode)}
                            disabled={loading}
                          >
                            Hủy đơn
                          </Button>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>

                  {/* Expandable order items */}
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => toggleOrderExpanded(order.id)}
                      endIcon={
                        <ExpandMoreIcon 
                          sx={{
                            transform: expandedOrders[order.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                          }}
                        />
                      }
                    >
                      {expandedOrders[order.id] ? 'Ẩn' : 'Xem'} sản phẩm ({order.items?.length || 0} sản phẩm)
                    </Button>
                    
                    <Collapse in={expandedOrders[order.id]} timeout="auto" unmountOnExit>
                      <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 2 }} />
                        {order.items?.map((item, index) => (
                          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                            <Box>
                              <Typography variant="subtitle2">{item.productName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Số lượng: {item.quantity} x {formatCurrency(item.priceAtPurchase)}
                              </Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(item.itemTotal)}
                            </Typography>
                          </Box>
                        ))}
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Tạm tính:</Typography>
                          <Typography variant="body2">{formatCurrency(order.subtotal)}</Typography>
                        </Box>
                        
                        {order.shippingFee > 0 && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Phí vận chuyển:</Typography>
                            <Typography variant="body2">{formatCurrency(order.shippingFee)}</Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1" fontWeight="bold">Tổng cộng:</Typography>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary">
                            {formatCurrency(order.totalAmount)}
                          </Typography>
                        </Box>
                      </Box>
                    </Collapse>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default OrderHistoryPage;
