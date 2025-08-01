import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ExpandMore,
  Api,
  CheckCircle,
  Error,
  Warning,
  Info,
  Code,
  Settings,
  DataUsage,
  Assessment,
  Schedule,
} from '@mui/icons-material';
import dashboardManager from '../../utils/dashboardManager';

const DashboardAPITester = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState({});
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const testAPI = async (endpoint, apiCall) => {
    setLoading(prev => ({ ...prev, [endpoint]: true }));
    try {
      const result = await apiCall();
      setTestResults(prev => ({
        ...prev,
        [endpoint]: { status: 'success', data: result, timestamp: new Date() }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [endpoint]: { status: 'error', error: error.message, timestamp: new Date() }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [endpoint]: false }));
    }
  };

  const apiEndpoints = [
    {
      category: 'Dashboard Cơ Bản',
      icon: <Assessment />,
      endpoints: [
        {
          name: 'getDashboardStats',
          description: 'Lấy thống kê tổng quan dashboard',
          endpoint: '/admin/dashboard/stats',
          test: () => dashboardManager.getDashboardStats()
        },
        {
          name: 'getRecentOrders',
          description: 'Lấy danh sách đơn hàng gần đây',
          endpoint: '/admin/dashboard/recent-orders',
          test: () => dashboardManager.getRecentOrders(5)
        },
        {
          name: 'getTopProducts',
          description: 'Lấy top sản phẩm bán chạy',
          endpoint: '/admin/dashboard/top-products',
          test: () => dashboardManager.getTopProducts(5)
        }
      ]
    },
    {
      category: 'Analytics Nâng Cao',
      icon: <DataUsage />,
      endpoints: [
        {
          name: 'getAdvancedMetrics',
          description: 'Lấy metrics phân tích nâng cao',
          endpoint: '/admin/analytics/dashboard',
          test: () => dashboardManager.getAdvancedMetrics(dateRange.startDate, dateRange.endDate)
        },
        {
          name: 'getRealTimeMetrics',
          description: 'Lấy metrics real-time',
          endpoint: '/admin/analytics/realtime',
          test: () => dashboardManager.getRealTimeMetrics()
        }
      ]
    },
    {
      category: 'WebSocket',
      icon: <Schedule />,
      endpoints: [
        {
          name: 'WebSocket Connection',
          description: 'Kiểm tra kết nối WebSocket',
          endpoint: 'ws://localhost:8080/ws/dashboard',
          test: () => {
            const status = dashboardManager.getConnectionStatus();
            return Promise.resolve(status);
          }
        },
        {
          name: 'Connect Dashboard WebSocket',
          description: 'Kết nối WebSocket dashboard',
          endpoint: 'Dashboard WebSocket',
          test: () => {
            dashboardManager.connectDashboardWebSocket();
            return Promise.resolve({ message: 'WebSocket connection initiated' });
          }
        }
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle />;
      case 'error': return <Error />;
      case 'warning': return <Warning />;
      default: return <Info />;
    }
  };

  const formatResult = (result) => {
    if (typeof result === 'object') {
      return JSON.stringify(result, null, 2);
    }
    return String(result);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        🔧 Dashboard API Tester
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Test các API endpoints của dashboard để kiểm tra kết nối và dữ liệu
      </Typography>

      {/* Date Range Selector */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Cài đặt Test</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Từ ngày"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Đến ngày"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              fullWidth
              sx={{ height: '56px' }}
              onClick={() => {
                // Test all endpoints
                apiEndpoints.forEach(category => {
                  category.endpoints.forEach(endpoint => {
                    testAPI(endpoint.name, endpoint.test);
                  });
                });
              }}
            >
              Test Tất Cả API
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* API Categories */}
      {apiEndpoints.map((category) => (
        <Accordion key={category.category} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {category.icon}
              <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                {category.category}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {category.endpoints.map((endpoint) => (
                <Grid item xs={12} key={endpoint.name}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {endpoint.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {endpoint.description}
                          </Typography>
                          <Chip
                            icon={<Code />}
                            label={endpoint.endpoint}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                        
                        <Box sx={{ ml: 2 }}>
                          <Button
                            variant="contained"
                            size="small"
                            disabled={loading[endpoint.name]}
                            onClick={() => testAPI(endpoint.name, endpoint.test)}
                          >
                            {loading[endpoint.name] ? 'Testing...' : 'Test'}
                          </Button>
                        </Box>
                      </Box>

                      {/* Test Result */}
                      {testResults[endpoint.name] && (
                        <Box sx={{ mt: 2 }}>
                          <Divider sx={{ mb: 2 }} />
                          <Alert 
                            severity={getStatusColor(testResults[endpoint.name].status)}
                            icon={getStatusIcon(testResults[endpoint.name].status)}
                          >
                            <Typography variant="subtitle2" gutterBottom>
                              Kết quả test ({testResults[endpoint.name].timestamp.toLocaleTimeString()})
                            </Typography>
                            
                            {testResults[endpoint.name].status === 'success' ? (
                              <Box>
                                <Typography variant="body2" gutterBottom>
                                  ✅ API hoạt động tốt
                                </Typography>
                                <details>
                                  <summary>Xem dữ liệu trả về</summary>
                                  <pre style={{ 
                                    fontSize: '12px', 
                                    background: '#f5f5f5', 
                                    padding: '8px', 
                                    borderRadius: '4px',
                                    marginTop: '8px',
                                    overflow: 'auto',
                                    maxHeight: '200px'
                                  }}>
                                    {formatResult(testResults[endpoint.name].data)}
                                  </pre>
                                </details>
                              </Box>
                            ) : (
                              <Typography variant="body2">
                                ❌ Lỗi: {testResults[endpoint.name].error}
                              </Typography>
                            )}
                          </Alert>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* WebSocket Status */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          WebSocket Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Alert severity={dashboardManager.isConnected() ? 'success' : 'warning'}>
              <Typography variant="subtitle2">
                Dashboard WebSocket: {dashboardManager.isConnected() ? 'Đã kết nối' : 'Chưa kết nối'}
              </Typography>
            </Alert>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              variant="outlined"
              onClick={() => {
                if (dashboardManager.isConnected()) {
                  dashboardManager.disconnect();
                } else {
                  dashboardManager.connectDashboardWebSocket();
                }
              }}
            >
              {dashboardManager.isConnected() ? 'Ngắt kết nối' : 'Kết nối'} WebSocket
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Instructions */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          📝 Hướng dẫn sử dụng:
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Nhấn "Test" để kiểm tra từng API endpoint</li>
            <li>Nhấn "Test Tất Cả API" để kiểm tra tất cả endpoints cùng lúc</li>
            <li>Kiểm tra kết nối WebSocket ở phần WebSocket Status</li>
            <li>Dữ liệu trả về sẽ hiển thị trong các card kết quả</li>
            <li>API có thể fallback sang alternative endpoints nếu primary không hoạt động</li>
          </ul>
        </Typography>
      </Alert>
    </Box>
  );
};

export default DashboardAPITester;
