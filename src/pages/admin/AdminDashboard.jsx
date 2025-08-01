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
  ButtonGroup,
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
  DateRange,
  PictureAsPdf,
  TableChart,
  Wifi,
  WifiOff,
  Circle,
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
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
import { getAdvancedDashboardData, getRealTimeMetricsData, exportReport } from '../../api/adminApi';
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

const AdminDashboard = () => {
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [exportDialog, setExportDialog] = useState(false);
  const [exportType, setExportType] = useState('revenue');
  const [exportFormat, setExportFormat] = useState('excel');
  
  // WebSocket hook for real-time data
  const { connected, realTimeData, error: wsError } = useWebSocketAnalytics();

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const data = await getAdvancedDashboardData(dateRange.startDate, dateRange.endDate);
      setDashboardData(data);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setSnackbar({
        open: true,
        message: 'Không thể tải dữ liệu dashboard: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load real-time metrics (fallback if WebSocket fails)
  const loadRealTimeData = async () => {
    try {
      await getRealTimeMetricsData();
    } catch (error) {
      console.error('Error loading real-time data:', error);
    }
  };

  // Export reports
  const handleExport = async () => {
    try {
      const blob = await exportReport(exportType, exportFormat, dateRange.startDate, dateRange.endDate);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${exportType}_report_${dateRange.startDate}_${dateRange.endDate}.${exportFormat === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: 'Báo cáo đã được tải xuống thành công!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: 'Không thể xuất báo cáo: ' + error.message,
        severity: 'error'
      });
    } finally {
      setExportDialog(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    loadDashboardData();
    loadRealTimeData();
  };

  // Effect hooks
  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  // Show WebSocket error if present
  useEffect(() => {
    if (wsError) {
      setSnackbar({
        open: true,
        message: `WebSocket Error: ${wsError}`,
        severity: 'warning'
      });
    }
  }, [wsError]);

  // Chart configurations
  const revenueChartData = {
    labels: dashboardData?.dailyRevenue?.map(item => new Date(item.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: dashboardData?.dailyRevenue?.map(item => item.revenue) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
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
        ],
      },
    ],
  };

  const hourlyOrdersData = {
    labels: realTimeData?.hourlyOrders?.map(item => item.hour) || [],
    datasets: [
      {
        label: 'Đơn hàng theo giờ',
        data: realTimeData?.hourlyOrders?.map(item => item.orderCount) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Analytics Dashboard',
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
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          📊 Advanced Dashboard
        </Typography>
        
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Connection Status */}
          <Chip
            icon={connected ? <Wifi /> : <WifiOff />}
            label={connected ? 'Real-time' : 'Offline'}
            color={connected ? 'success' : 'default'}
            size="small"
          />
          
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
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            startIcon={<GetApp />}
            onClick={() => setExportDialog(true)}
          >
            Xuất báo cáo
          </Button>
        </Stack>
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="overline">
                    Tổng Doanh Thu
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    {dashboardData?.totalRevenue?.toLocaleString('vi-VN')} VNĐ
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {dashboardData?.revenueGrowthRate >= 0 ? (
                      <TrendingUp sx={{ color: 'success.main', mr: 0.5 }} />
                    ) : (
                      <TrendingDown sx={{ color: 'error.main', mr: 0.5 }} />
                    )}
                    <Typography variant="body2" sx={{ 
                      color: dashboardData?.revenueGrowthRate >= 0 ? 'success.main' : 'error.main',
                      fontWeight: 'bold'
                    }}>
                      {dashboardData?.revenueGrowthRate?.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
                  <AttachMoney sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="overline">
                    Tổng Đơn Hàng
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                    {dashboardData?.totalOrders?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hôm nay: {realTimeData?.ordersLast24h || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 60, height: 60 }}>
                  <ShoppingCart sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Order Value */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="overline">
                    Giá Trị Đơn Hàng TB
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                    {dashboardData?.averageOrderValue?.toLocaleString('vi-VN')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    VNĐ / đơn hàng
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 60, height: 60 }}>
                  <Assessment sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Customers */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="overline">
                    Khách Hàng Hoạt Động
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                    {dashboardData?.activeCustomers || 0}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Circle sx={{ color: connected ? 'success.main' : 'grey.400', fontSize: 8, mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      Online: {realTimeData?.activeUsersOnline || 0}
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
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              📈 Xu Hướng Doanh Thu
            </Typography>
            <Line data={revenueChartData} options={chartOptions} />
          </Paper>
        </Grid>

        {/* Category Performance */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              🏷️ Hiệu Suất Danh Mục
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut data={categoryChartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Real-time Analytics & Customer Segments */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Hourly Orders */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                ⏰ Đơn Hàng Theo Giờ (24h qua)
              </Typography>
              <Chip
                label={`Giờ cao điểm: ${realTimeData?.peakHour || 'N/A'}`}
                color="primary"
                size="small"
              />
            </Box>
            <Bar data={hourlyOrdersData} options={{ ...chartOptions, maintainAspectRatio: false }} />
          </Paper>
        </Grid>

        {/* Customer Segments */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              👥 Phân Khúc Khách Hàng
            </Typography>
            <Stack spacing={2}>
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
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tỷ lệ chuyển đổi
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {dashboardData?.conversionRate?.toFixed(1)}%
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Categories Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          🏆 Top Danh Mục Sản Phẩm
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Danh Mục</strong></TableCell>
                <TableCell align="right"><strong>Số Lượng Bán</strong></TableCell>
                <TableCell align="right"><strong>Doanh Thu</strong></TableCell>
                <TableCell align="right"><strong>Tỷ Lệ</strong></TableCell>
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
                        {category.categoryName.charAt(0)}
                      </Avatar>
                      {category.categoryName}
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
                      {category.revenue?.toLocaleString('vi-VN')} VNĐ
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {((category.revenue / dashboardData.totalRevenue) * 100).toFixed(1)}%
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Xuất Báo Cáo</DialogTitle>
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
                  <MenuItem value="revenue">Báo cáo Doanh thu</MenuItem>
                  <MenuItem value="products">Hiệu suất Sản phẩm</MenuItem>
                  <MenuItem value="orders">Thống kê Đơn hàng</MenuItem>
                  <MenuItem value="users">Phân tích Người dùng</MenuItem>
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
                      <TableChart sx={{ mr: 1 }} />
                      Excel (.xlsx)
                    </Box>
                  </MenuItem>
                  <MenuItem value="pdf">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PictureAsPdf sx={{ mr: 1 }} />
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
          <Button onClick={handleExport} variant="contained">Xuất báo cáo</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
