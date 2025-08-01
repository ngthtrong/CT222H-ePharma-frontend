import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Chip,
  Avatar,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  ShoppingCart,
  AttachMoney,
  Assessment,
  GetApp,
  Refresh,
  PictureAsPdf,
  TableChart,
  ShowChart,
  Group,
  Category,
  Schedule,
  Analytics,
  FileDownload,
  Update,
  Timeline,
  LocalShipping,
  Inventory,
} from '@mui/icons-material';
import { Line, Doughnut, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { adminAPI } from '../../api/adminApi';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  BarElement
);

const AdminDashboard = () => {
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Export dialog state
  const [exportDialog, setExportDialog] = useState(false);
  const [exportType, setExportType] = useState('revenue');
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportLoading, setExportLoading] = useState(false);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Auto-refresh interval
  const intervalRef = useRef(null);

  // Utility functions
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    // Làm tròn số đến hàng nghìn
    const roundedAmount = Math.round(amount / 1000) * 1000;
    return new Intl.NumberFormat('vi-VN').format(roundedAmount) + ' ₫';
  };

  const formatAverageOrderValue = (amount) => {
    if (!amount) return '0 ₫';
    // Làm tròn cho average order value đến hàng trăm
    const roundedAmount = Math.round(amount / 100) * 100;
    return new Intl.NumberFormat('vi-VN').format(roundedAmount) + ' ₫';
  };

  const formatNumber = (number) => {
    if (!number) return '0';
    return new Intl.NumberFormat('vi-VN').format(number);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Load dashboard data from new REST endpoints
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use the main dashboard stats endpoint from the guide
      const response = await adminAPI.getDashboardStats();
      
      if (response.data && response.data.success) {
        setDashboardData(response.data.data);
        setLastUpdated(new Date(response.data.data.lastUpdated));
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showSnackbar('Không thể tải dữ liệu dashboard: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      
      // Use the refresh endpoint from the guide via adminAPI
      const response = await adminAPI.refreshDashboard();
      
      if (response.data && response.data.success) {
        setDashboardData(response.data.data);
        setLastUpdated(new Date(response.data.data.lastUpdated));
        showSnackbar('Dashboard đã được cập nhật thành công', 'success');
      } else {
        throw new Error(response.data.message || 'Refresh failed');
      }
      
    } catch (error) {
      console.error('Refresh error:', error);
      showSnackbar('Không thể làm mới dữ liệu: ' + error.message, 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      // Simple export functionality - can be enhanced later
      const csvData = generateCSVReport();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSnackbar('Báo cáo đã được xuất thành công!', 'success');
      setExportDialog(false);
      
    } catch (error) {
      console.error('Export error:', error);
      showSnackbar('Không thể xuất báo cáo: ' + error.message, 'error');
    } finally {
      setExportLoading(false);
    }
  };

  // Generate simple CSV report
  const generateCSVReport = () => {
    if (!dashboardData) return '';
    
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Revenue', dashboardData.totalRevenue || 0],
      ['Total Orders', dashboardData.totalOrders || 0],
      ['Average Order Value', dashboardData.averageOrderValue || 0],
      ['Conversion Rate', (dashboardData.conversionRate || 0) + '%'],
      ['High Value Customers', dashboardData.customerSegments?.highValueCustomers || 0],
      ['Medium Value Customers', dashboardData.customerSegments?.mediumValueCustomers || 0],
      ['Low Value Customers', dashboardData.customerSegments?.lowValueCustomers || 0],
    ];
    
    let csv = headers.join(',') + '\n';
    csv += rows.map(row => row.join(',')).join('\n');
    
    return csv;
  };

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Revenue trend chart data
  const revenueChartData = {
    labels: dashboardData?.revenueMetrics?.map(item => 
      new Date(item.date).toLocaleDateString('vi-VN')
    ) || [],
    datasets: [
      {
        label: 'Doanh thu (₫)',
        data: dashboardData?.revenueMetrics?.map(item => item.revenue) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.1,
        fill: true,
      },
    ],
  };

  // Category performance chart data
  const categoryChartData = {
    labels: dashboardData?.categoryPerformance?.map(cat => cat.categoryName) || [],
    datasets: [
      {
        data: dashboardData?.categoryPerformance?.map(cat => cat.revenue) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
      },
    ],
  };

  // Customer segments pie chart data
  const customerSegmentsData = {
    labels: ['Khách hàng giá trị cao', 'Khách hàng trung bình', 'Khách hàng thấp'],
    datasets: [
      {
        data: [
          dashboardData?.customerSegments?.highValueCustomers || 0,
          dashboardData?.customerSegments?.mediumValueCustomers || 0,
          dashboardData?.customerSegments?.lowValueCustomers || 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
        ],
      },
    ],
  };

  // Effect hooks
  useEffect(() => {
    loadDashboardData();
    
    // Setup auto-refresh every 5 minutes (optional)
    intervalRef.current = setInterval(() => {
      if (!loading && !refreshing) {
        loadDashboardData();
      }
    }, 5 * 60 * 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (loading && !dashboardData) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        sx={{ textAlign: 'center' }}
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
          📊 Đang tải Dashboard...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vui lòng chờ trong giây lát
        </Typography>
        <LinearProgress 
          sx={{ 
            width: 200, 
            mt: 2,
            borderRadius: 2,
            height: 6
          }} 
        />
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={loadDashboardData}
              disabled={loading}
            >
              Thử lại
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            Không thể tải dữ liệu Dashboard
          </Typography>
          <Typography variant="body2">
            Vui lòng kiểm tra kết nối mạng hoặc liên hệ quản trị viên hệ thống.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Refresh Loading Indicator */}
      {refreshing && (
        <LinearProgress 
          sx={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1301,
            height: 3
          }} 
        />
      )}
      
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            📊 Dashboard Analytics
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Tổng quan và phân tích dữ liệu kinh doanh theo thời gian thực
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Last Updated */}
          {lastUpdated && (
            <Chip
              icon={<Schedule />}
              label={`Cập nhật: ${formatDate(lastUpdated)}`}
              variant="outlined"
              size="small"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            />
          )}
          
          {/* Refresh Button */}
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Đang làm mới...' : 'Làm mới'}
          </Button>
          
          {/* Export Button */}
          <Button
            variant="contained"
            startIcon={<GetApp />}
            onClick={() => setExportDialog(true)}
          >
            Xuất báo cáo
          </Button>
        </Box>
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Tổng Doanh Thu
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formatCurrency(dashboardData?.totalRevenue)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {(dashboardData?.revenueGrowthRate || 0) >= 0 ? (
                      <TrendingUp sx={{ mr: 0.5, fontSize: 16 }} />
                    ) : (
                      <TrendingDown sx={{ mr: 0.5, fontSize: 16 }} />
                    )}
                    <Typography variant="body2">
                      {(dashboardData?.revenueGrowthRate || 0).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AttachMoney sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Tổng Đơn Hàng
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formatNumber(dashboardData?.totalOrders)}
                  </Typography>
                  <Typography variant="body2">
                    30 ngày gần nhất
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <ShoppingCart sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Order Value */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Giá Trị TB/Đơn
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formatAverageOrderValue(dashboardData?.averageOrderValue)}
                  </Typography>
                  <Typography variant="body2">
                    Tỷ lệ chuyển đổi: {(dashboardData?.conversionRate || 0).toFixed(1)}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <Assessment sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Conversion Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Tỷ lệ chuyển đổi
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {(dashboardData?.conversionRate || 0).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2">
                    Tổng phân khúc khách hàng
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <People sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Trend Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <ShowChart sx={{ mr: 1, color: 'primary.main' }} />
              Xu Hướng Doanh Thu
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={revenueChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Category Performance Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <Category sx={{ mr: 1, color: 'primary.main' }} />
              Hiệu Suất Danh Mục
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut data={categoryChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Customer Segments & Top Products */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Customer Segments */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <Group sx={{ mr: 1, color: 'primary.main' }} />
              Phân Khúc Khách Hàng
            </Typography>
            
            <Stack spacing={2} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>High Value</Typography>
                <Chip label={dashboardData?.customerSegments?.highValueCustomers || 0} color="primary" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Medium Value</Typography>
                <Chip label={dashboardData?.customerSegments?.mediumValueCustomers || 0} color="info" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Low Value</Typography>
                <Chip label={dashboardData?.customerSegments?.lowValueCustomers || 0} color="warning" />
              </Box>
            </Stack>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tỷ lệ chuyển đổi tổng thể
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {(dashboardData?.conversionRate || 0).toFixed(1)}%
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <Inventory sx={{ mr: 1, color: 'primary.main' }} />
              Top Sản Phẩm Bán Chạy
            </Typography>
            <TableContainer sx={{ maxHeight: 250 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Sản phẩm</strong></TableCell>
                    <TableCell align="right"><strong>Số lượng bán</strong></TableCell>
                    <TableCell align="right"><strong>Doanh thu</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData?.topProducts?.map((product, index) => (
                    <TableRow key={product.productId} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ 
                            mr: 2, 
                            bgcolor: `hsl(${index * 60}, 70%, 50%)`,
                            width: 32,
                            height: 32,
                            fontSize: '0.875rem'
                          }}>
                            {product.productName?.charAt(0) || '?'}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {product.productName || 'Không xác định'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={formatNumber(product.quantitySold)} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          {formatCurrency(product.revenue)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {(!dashboardData?.topProducts || dashboardData.topProducts.length === 0) && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Không có dữ liệu sản phẩm bán chạy
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Orders */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <LocalShipping sx={{ mr: 1, color: 'primary.main' }} />
          Đơn Hàng Gần Đây
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><strong>Mã đơn hàng</strong></TableCell>
                <TableCell><strong>Khách hàng</strong></TableCell>
                <TableCell align="right"><strong>Tổng tiền</strong></TableCell>
                <TableCell align="center"><strong>Trạng thái</strong></TableCell>
                <TableCell align="right"><strong>Ngày tạo</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardData?.recentOrders?.map((order) => (
                <TableRow key={order.orderId} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {order.orderCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.customerName || 'Unknown Customer'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {formatCurrency(order.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={order.status}
                      color={
                        order.status === 'COMPLETED' ? 'success' :
                        order.status === 'PENDING' ? 'warning' :
                        order.status === 'CANCELLED' ? 'error' :
                        order.status === 'PROCESSING' ? 'info' :
                        order.status === 'SHIPPED' ? 'primary' : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(order.createdAt)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {(!dashboardData?.recentOrders || dashboardData.recentOrders.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Không có dữ liệu đơn hàng gần đây
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <FileDownload sx={{ mr: 1 }} />
          Xuất Báo Cáo Dashboard
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Loại báo cáo</InputLabel>
                <Select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                  label="Loại báo cáo"
                >
                  <MenuItem value="revenue">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ShowChart sx={{ mr: 1, color: 'primary.main' }} />
                      Báo cáo Doanh thu
                    </Box>
                  </MenuItem>
                  <MenuItem value="orders">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ShoppingCart sx={{ mr: 1, color: 'info.main' }} />
                      Báo cáo Đơn hàng
                    </Box>
                  </MenuItem>
                  <MenuItem value="products">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Inventory sx={{ mr: 1, color: 'success.main' }} />
                      Báo cáo Sản phẩm
                    </Box>
                  </MenuItem>
                  <MenuItem value="customers">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <People sx={{ mr: 1, color: 'warning.main' }} />
                      Báo cáo Khách hàng
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Định dạng</InputLabel>
                <Select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  label="Định dạng"
                >
                  <MenuItem value="csv">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TableChart sx={{ mr: 1, color: 'success.main' }} />
                      CSV (.csv)
                    </Box>
                  </MenuItem>
                  <MenuItem value="excel">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TableChart sx={{ mr: 1, color: 'info.main' }} />
                      Excel (.xlsx)
                    </Box>
                  </MenuItem>
                  <MenuItem value="pdf">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PictureAsPdf sx={{ mr: 1, color: 'error.main' }} />
                      PDF (.pdf)
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Hủy</Button>
          <Button 
            onClick={handleExport} 
            variant="contained" 
            disabled={exportLoading}
            startIcon={exportLoading ? <CircularProgress size={16} /> : <GetApp />}
          >
            {exportLoading ? 'Đang xuất...' : 'Xuất báo cáo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
