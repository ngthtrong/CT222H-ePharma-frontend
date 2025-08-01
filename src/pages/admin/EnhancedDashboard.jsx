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
  IconButton,
  Tooltip,
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
  LinearProgress,
  Badge,
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
  Wifi,
  WifiOff,
  Circle,
  ShowChart,
  Group,
  Category,
  Schedule,
  Analytics,
  FileDownload,
  Update,
  Notifications,
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

// Import our enhanced WebSocket hook and dashboard manager
import { useWebSocketDashboard } from '../../hooks/useWebSocketDashboard';
import dashboardManager from '../../utils/dashboardManager';
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

const EnhancedDashboard = () => {
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // Export dialog state
  const [exportDialog, setExportDialog] = useState(false);
  const [exportType, setExportType] = useState('revenue');
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportLoading, setExportLoading] = useState(false);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // WebSocket hook for real-time data
  const { connected, realTimeData, error: wsError } = useWebSocketDashboard();

  // Auto-refresh interval
  const intervalRef = useRef(null);

  // Utility functions
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('vi-VN').format(number);
  };

  // Load dashboard data using the enhanced dashboard manager
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use dashboard manager for API calls
      const [stats, recentOrders, topProducts, advancedMetrics] = await Promise.all([
        dashboardManager.getDashboardStats(),
        dashboardManager.getRecentOrders(10),
        dashboardManager.getTopProducts(10),
        dashboardManager.getAdvancedMetrics(dateRange.startDate, dateRange.endDate)
      ]);

      setDashboardData({
        stats,
        recentOrders,
        topProducts,
        ...advancedMetrics
      });
      
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showSnackbar('Không thể tải dữ liệu dashboard: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load real-time metrics
  const loadRealTimeMetrics = async () => {
    try {
      const metrics = await dashboardManager.getRealTimeMetrics();
      setRealTimeMetrics(metrics);
    } catch (error) {
      console.error('Error loading real-time metrics:', error);
      // Don't show error for real-time metrics as WebSocket might provide this data
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      let response;
      const { startDate, endDate } = dateRange;
      
      // Choose the right export function based on type and format
      switch (exportType) {
        case 'revenue':
          if (exportFormat === 'excel') {
            try {
              response = await adminAPI.exportRevenueExcel(startDate, endDate);
            } catch (error) {
              response = await adminAPI.exportRevenueExcelAlternative(startDate, endDate);
            }
          } else {
            response = await adminAPI.exportRevenuePdf(startDate, endDate);
          }
          break;
          
        case 'products':
          if (exportFormat === 'excel') {
            response = await adminAPI.exportProductsExcel(startDate, endDate);
          } else {
            response = await adminAPI.exportProductsPdf(startDate, endDate);
          }
          break;
          
        case 'orders':
          if (exportFormat === 'excel') {
            response = await adminAPI.exportOrdersExcel(startDate, endDate);
          } else {
            response = await adminAPI.exportOrdersPdf(startDate, endDate);
          }
          break;
          
        default:
          throw new Error('Invalid export type');
      }

      // Handle blob download
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${exportType}-report-${startDate}-to-${endDate}.${exportFormat === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      showSnackbar('Báo cáo đã được xuất thành công!', 'success');
      
    } catch (error) {
      console.error('Error exporting report:', error);
      showSnackbar('Không thể xuất báo cáo: ' + error.message, 'error');
    } finally {
      setExportLoading(false);
      setExportDialog(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadDashboardData(),
      loadRealTimeMetrics()
    ]);
    setRefreshing(false);
    showSnackbar('Dữ liệu đã được cập nhật!', 'success');
  };

  // Setup auto-refresh and data loading
  useEffect(() => {
    // Load initial data
    loadDashboardData();
    loadRealTimeMetrics();
    
    // Setup auto-refresh every 5 minutes for dashboard data
    intervalRef.current = setInterval(() => {
      loadDashboardData();
    }, 5 * 60 * 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dateRange]);

  // Handle WebSocket error
  useEffect(() => {
    if (wsError && !wsError.includes('disabled')) {
      showSnackbar(`WebSocket: ${wsError}`, 'warning');
    }
  }, [wsError]);

  // Update real-time data from WebSocket
  useEffect(() => {
    if (realTimeData) {
      setRealTimeMetrics(prevMetrics => ({
        ...prevMetrics,
        ...realTimeData,
        timestamp: realTimeData.timestamp || Date.now()
      }));
    }
  }, [realTimeData]);

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.parsed.y && typeof context.parsed.y === 'number') {
              return formatCurrency(context.parsed.y);
            }
            return context.parsed.y;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const revenueChartData = {
    labels: dashboardData?.dailyRevenue?.map(item => 
      new Date(item.date).toLocaleDateString('vi-VN')
    ) || [],
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: dashboardData?.dailyRevenue?.map(item => item.revenue) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const categoryChartData = {
    labels: dashboardData?.topCategories?.map(cat => cat.categoryName) || [],
    datasets: [
      {
        data: dashboardData?.topCategories?.map(cat => cat.revenue) || [],
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

  const hourlyOrdersData = {
    labels: realTimeMetrics?.hourlyOrders?.map(item => item.hour) || 
            Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`),
    datasets: [
      {
        label: 'Số đơn hàng',
        data: realTimeMetrics?.hourlyOrders?.map(item => item.orderCount) || 
              Array(24).fill(0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const productChartData = {
    labels: dashboardData?.topProducts?.map(product => product.productName) || [],
    datasets: [
      {
        label: 'Số lượng bán',
        data: dashboardData?.topProducts?.map(product => product.quantitySold) || [],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

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
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
      },
    ],
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Đang tải dữ liệu dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            📊 Dashboard Analytics
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Tổng quan và phân tích dữ liệu kinh doanh
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* WebSocket Status */}
          <Tooltip title={connected ? 'Real-time kết nối' : 'Chế độ offline'}>
            <Chip
              icon={connected ? <Wifi /> : <WifiOff />}
              label={connected ? 'Real-time' : 'Offline'}
              color={connected ? 'success' : 'default'}
              variant="outlined"
            />
          </Tooltip>
          
          {/* Last Updated */}
          {lastUpdated && (
            <Chip
              icon={<Schedule />}
              label={`Cập nhật: ${lastUpdated.toLocaleTimeString('vi-VN')}`}
              variant="outlined"
            />
          )}
          
          {/* Date Range Selector */}
          <TextField
            label="Từ ngày"
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="Đến ngày"
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          
          {/* Action Buttons */}
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Đang tải...' : 'Làm mới'}
          </Button>
          
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={() => setExportDialog(true)}
          >
            Xuất báo cáo
          </Button>
        </Box>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Tổng Doanh Thu
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(dashboardData?.totalRevenue || 0)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +{dashboardData?.revenueGrowthRate?.toFixed(1) || 0}%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 60, height: 60 }}>
                  <AttachMoney sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Tổng Đơn Hàng
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatNumber(dashboardData?.totalOrders || 0)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Circle sx={{ color: realTimeMetrics ? 'success.main' : 'grey.400', fontSize: 8, mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      24h: {realTimeMetrics?.ordersLast24h || 0}
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
                  <ShoppingCart sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Order Value */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Giá Trị TB/Đơn
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(dashboardData?.averageOrderValue || 0)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <ShowChart sx={{ color: 'info.main', fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="info.main">
                      Tỷ lệ chuyển đổi: {dashboardData?.conversionRate?.toFixed(1) || 0}%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 60, height: 60 }}>
                  <Assessment sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Người Dùng Hoạt Động
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatNumber(dashboardData?.activeCustomers || 0)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Circle sx={{ color: connected ? 'success.main' : 'grey.400', fontSize: 8, mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      Online: {realTimeMetrics?.activeUsersOnline || 0}
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 60, height: 60 }}>
                  <People sx={{ fontSize: 30 }} />
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
              <Timeline sx={{ mr: 1, color: 'primary.main' }} />
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
              <Doughnut data={categoryChartData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Real-time Analytics & Customer Segments */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Hourly Orders Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <Schedule sx={{ mr: 1, color: 'primary.main' }} />
              Đơn Hàng Theo Giờ (Real-time)
              {connected && <Badge color="success" variant="dot" sx={{ ml: 1 }} />}
            </Typography>
            <Box sx={{ height: 260 }}>
              <Bar data={hourlyOrdersData} options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } }
              }} />
            </Box>
            {realTimeMetrics?.peakHour && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Giờ cao điểm: <strong>{realTimeMetrics.peakHour}</strong>
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Customer Segments */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <Group sx={{ mr: 1, color: 'primary.main' }} />
              Phân Khúc Khách Hàng
            </Typography>
            <Box sx={{ height: 260, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Pie data={customerSegmentsData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Products & Recent Orders */}
      <Grid container spacing={3}>
        {/* Top Products Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <Inventory sx={{ mr: 1, color: 'primary.main' }} />
              Top Sản Phẩm Bán Chạy
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar 
                data={productChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  scales: { x: { beginAtZero: true } }
                }} 
              />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Orders Table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <LocalShipping sx={{ mr: 1, color: 'primary.main' }} />
              Đơn Hàng Gần Đây
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mã đơn</TableCell>
                    <TableCell>Khách hàng</TableCell>
                    <TableCell align="right">Giá trị</TableCell>
                    <TableCell>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData?.recentOrders?.slice(0, 8).map((order) => (
                    <TableRow key={order.orderId} hover>
                      <TableCell>{order.orderCode}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          size="small"
                          color={
                            order.status === 'COMPLETED' ? 'success' :
                            order.status === 'PENDING' ? 'warning' :
                            order.status === 'CANCELLED' ? 'error' : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Xuất Báo Cáo</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Loại báo cáo</InputLabel>
              <Select
                value={exportType}
                label="Loại báo cáo"
                onChange={(e) => setExportType(e.target.value)}
              >
                <MenuItem value="revenue">Báo cáo doanh thu</MenuItem>
                <MenuItem value="products">Báo cáo sản phẩm</MenuItem>
                <MenuItem value="orders">Báo cáo đơn hàng</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Định dạng</InputLabel>
              <Select
                value={exportFormat}
                label="Định dạng"
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <MenuItem value="excel">
                  <TableChart sx={{ mr: 1 }} /> Excel (.xlsx)
                </MenuItem>
                <MenuItem value="pdf">
                  <PictureAsPdf sx={{ mr: 1 }} /> PDF (.pdf)
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Hủy</Button>
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={exportLoading}
            startIcon={exportLoading ? <CircularProgress size={20} /> : <GetApp />}
          >
            {exportLoading ? 'Đang xuất...' : 'Xuất báo cáo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedDashboard;
