import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  People,
  ShoppingCart,
  Inventory,
  AttachMoney,
} from '@mui/icons-material';
import { getDashboardStats, getRecentOrders, getTopProducts } from '../../api/adminApi';
import { formatCurrency } from '../../utils/formatters';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [statsData, ordersData, productsData] = await Promise.all([
        getDashboardStats(),
        getRecentOrders(10),
        getTopProducts(10),
      ]);
      
      if (statsData.success) {
        setStats(statsData.data);
      }
      
      if (ordersData.success) {
        setRecentOrders(ordersData.data);
      }
      
      if (productsData.success) {
        setTopProducts(productsData.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" component="div" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getOrderStatusChip = (status) => {
    const statusConfig = {
      PENDING: { label: 'Chờ xử lý', color: 'warning' },
      PROCESSING: { label: 'Đang xử lý', color: 'info' },
      SHIPPED: { label: 'Đã giao', color: 'primary' },
      COMPLETED: { label: 'Hoàn thành', color: 'success' },
      CANCELLED: { label: 'Đã hủy', color: 'error' },
    };

    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Quản trị
      </Typography>
      
      {/* Thống kê tổng quan */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3} key="total-revenue">
          <StatCard
            title="Tổng doanh thu"
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={<AttachMoney fontSize="large" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} key="today-orders">
          <StatCard
            title="Đơn hàng hôm nay"
            value={stats?.todayOrders || 0}
            icon={<ShoppingCart fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} key="new-customers">
          <StatCard
            title="Khách hàng mới"
            value={stats?.newCustomers || 0}
            icon={<People fontSize="large" />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} key="total-products">
          <StatCard
            title="Sản phẩm"
            value={stats?.totalProducts || 0}
            icon={<Inventory fontSize="large" />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Đơn hàng gần đây */}
        <Grid item xs={12} md={8} key="recent-orders">
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Đơn hàng gần đây
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <Box
                    key={order._id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2">
                        #{order.orderCode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.user?.fullName || 'Khách hàng'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="subtitle2">
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                      {getOrderStatusChip(order.status)}
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa có đơn hàng nào
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Sản phẩm bán chạy */}
        <Grid item xs={12} md={4} key="top-products">
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sản phẩm bán chạy
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <Box
                    key={product._id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        minWidth: '24px',
                        mr: 2,
                        color: index < 3 ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {index + 1}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" noWrap>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Đã bán: {product.soldCount || 0}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa có dữ liệu bán hàng
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
