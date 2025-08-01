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
  IconButton,
  Tooltip,
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
import { useWebSocketAnalytics } from '../../hooks/useWebSocketAnalytics';

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

const NewAdvancedDashboard = () => {
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
  const { connected, realTimeData, error: wsError } = useWebSocketAnalytics();

  // Auto-refresh interval
  const intervalRef = useRef(null);

  // Load advanced dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try primary API first, fallback to alternative
      let response;
      try {
        response = await adminAPI.getAdvancedDashboard(dateRange.startDate, dateRange.endDate);
      } catch (error) {
        console.warn('Primary API failed, trying alternative:', error);
        response = await adminAPI.getAdvancedDashboardAlternative(dateRange.startDate, dateRange.endDate);
      }
      
      if (response.data && response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setDashboardData(response.data);
      }
      
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
      // Try primary API first, fallback to alternative
      let response;
      try {
        response = await adminAPI.getRealTimeMetrics();
      } catch (error) {
        console.warn('Primary real-time API failed, trying alternative:', error);
        response = await adminAPI.getRealTimeMetricsAlternative();
      }
      
      if (response.data && response.data.success) {
        setRealTimeMetrics(response.data.data);
      } else {
        setRealTimeMetrics(response.data);
      }
      
    } catch (error) {
      console.error('Error loading real-time metrics:', error);
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
            try {
              response = await adminAPI.exportProductsExcel(startDate, endDate);
            } catch (error) {
              response = await adminAPI.exportProductPerformanceExcelAlternative(startDate, endDate);
            }
          } else {
            response = await adminAPI.exportProductsPdf(startDate, endDate);
          }
          break;
          
        case 'orders':
          response = exportFormat === 'excel' 
            ? await adminAPI.exportOrdersExcel(startDate, endDate)
            : await adminAPI.exportOrdersPdf(startDate, endDate);
          break;
          
        case 'users':
          response = exportFormat === 'excel' 
            ? await adminAPI.exportUsersExcel(startDate, endDate)
            : await adminAPI.exportUsersPdf(startDate, endDate);
          break;
          
        default:
          throw new Error('Invalid export type');
      }

      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${exportType}_report_${startDate}_${endDate}.${exportFormat === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showSnackbar('Báo cáo đã được tải xuống thành công!', 'success');
      setExportDialog(false);
      
    } catch (error) {
      console.error('Export error:', error);
      showSnackbar('Không thể xuất báo cáo: ' + error.message, 'error');
    } finally {
      setExportLoading(false);
    }
  };

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDashboardData(), loadRealTimeMetrics()]);
    setRefreshing(false);
    showSnackbar('Dữ liệu đã được cập nhật!', 'success');
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Setup auto-refresh
  useEffect(() => {
    // Load initial data
    loadDashboardData();
    loadRealTimeMetrics();
    
    // Setup auto-refresh every 30 seconds
    intervalRef.current = setInterval(() => {
      loadRealTimeMetrics();
    }, 30000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dateRange]);

  // Handle WebSocket error
  useEffect(() => {
    if (wsError) {
      showSnackbar(`WebSocket Error: ${wsError}`, 'warning');
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
    labels: realTimeMetrics?.hourlyOrders?.map(item => item.hour) || [],
    datasets: [
      {
        label: 'Đơn hàng theo giờ',
        data: realTimeMetrics?.hourlyOrders?.map(item => item.orderCount) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const customerSegmentData = {
    labels: ['High Value', 'Medium Value', 'Low Value'],
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  if (loading && !dashboardData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
            📊 Advanced Analytics Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Tổng quan chi tiết về hiệu suất kinh doanh và phân tích thời gian thực
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Real-time Connection Status */}
          <Chip
            icon={connected ? <Wifi /> : <WifiOff />}
            label={connected ? 'Real-time Connected' : 'Offline Mode'}
            color={connected ? 'success' : 'default'}
            size="small"
          />
          
          {/* Last Updated */}
          {lastUpdated && (
            <Chip
              icon={<Schedule />}
              label={`Cập nhật: ${lastUpdated.toLocaleTimeString('vi-VN')}`}
              variant="outlined"
              size="small"
            />
          )}
        </Stack>
      </Box>

      {/* Control Panel */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          {/* Date Range Selectors */}
          <TextField
            type="date"
            label="Từ ngày"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="Đến ngày"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          
          {/* Action Buttons */}
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Đang cập nhật...' : 'Làm mới'}
          </Button>
          
          <Button
            variant="contained"
            startIcon={<GetApp />}
            onClick={() => setExportDialog(true)}
            color="success"
          >
            Xuất báo cáo
          </Button>
        </Stack>
      </Paper>

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
                    {dashboardData?.totalRevenue?.toLocaleString('vi-VN') || '0'} ₫
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
                    {dashboardData?.totalOrders?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2">
                    Hôm nay: {realTimeMetrics?.ordersLast24h || 0}
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
                    Giá Trị ĐH Trung Bình
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {dashboardData?.averageOrderValue?.toLocaleString('vi-VN') || '0'} ₫
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

        {/* Active Customers */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Khách Hàng Hoạt Động
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {dashboardData?.activeCustomers || 0}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Circle sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 8, mr: 0.5 }} />
                    <Typography variant="body2">
                      Online: {realTimeMetrics?.activeUsersOnline || 0}
                    </Typography>
                  </Box>
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

      {/* Real-time Analytics & Customer Segments */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Hourly Orders Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <Analytics sx={{ mr: 1, color: 'primary.main' }} />
                Đơn Hàng Theo Giờ (24h qua)
              </Typography>
              <Chip
                label={`Giờ cao điểm: ${realTimeMetrics?.peakHour || 'N/A'}`}
                color="primary"
                size="small"
                icon={<Schedule />}
              />
            </Box>
            <Box sx={{ height: 250 }}>
              <Bar data={hourlyOrdersData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

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
      </Grid>

      {/* Top Categories Performance Table */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <Category sx={{ mr: 1, color: 'primary.main' }} />
          Top Danh Mục Sản Phẩm
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><strong>Danh Mục</strong></TableCell>
                <TableCell align="right"><strong>Số Lượng Bán</strong></TableCell>
                <TableCell align="right"><strong>Doanh Thu</strong></TableCell>
                <TableCell align="right"><strong>Tỷ Lệ (%)</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardData?.topCategories?.map((category, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ 
                        mr: 2, 
                        bgcolor: `hsl(${index * 60}, 70%, 50%)`,
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem'
                      }}>
                        {category.categoryName?.charAt(0) || '?'}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {category.categoryName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={category.totalSold?.toLocaleString() || 0} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {category.revenue?.toLocaleString('vi-VN') || 0} ₫
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {dashboardData?.totalRevenue ? 
                        ((category.revenue / dashboardData.totalRevenue) * 100).toFixed(1) : 0}%
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {(!dashboardData?.topCategories || dashboardData.topCategories.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Không có dữ liệu danh mục sản phẩm
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <FileDownload sx={{ mr: 1 }} />
          Xuất Báo Cáo Analytics
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
                  <MenuItem value="revenue">📊 Báo cáo Doanh thu</MenuItem>
                  <MenuItem value="products">📈 Hiệu suất Sản phẩm</MenuItem>
                  <MenuItem value="orders">🛒 Thống kê Đơn hàng</MenuItem>
                  <MenuItem value="users">👥 Phân tích Người dùng</MenuItem>
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
                  <MenuItem value="excel">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TableChart sx={{ mr: 1, color: 'success.main' }} />
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

export default NewAdvancedDashboard;
