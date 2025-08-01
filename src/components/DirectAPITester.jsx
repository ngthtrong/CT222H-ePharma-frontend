import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { adminAPI } from '../../api/adminApi';

const DirectAPITester = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const testAPI = async (apiName, apiCall) => {
    setLoading(prev => ({ ...prev, [apiName]: true }));
    try {
      const result = await apiCall();
      setResults(prev => ({
        ...prev,
        [apiName]: { status: 'success', data: result, timestamp: new Date() }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [apiName]: { status: 'error', error: error.message, timestamp: new Date() }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [apiName]: false }));
    }
  };

  const testEndpoints = () => {
    // Test basic dashboard endpoints
    testAPI('getDashboardStats', () => adminAPI.getDashboardStats());
    testAPI('getRecentOrders', () => adminAPI.getRecentOrders(5));
    testAPI('getTopProducts', () => adminAPI.getTopProducts(5));
    
    // Test advanced analytics endpoints
    testAPI('getAdvancedDashboard', () => 
      adminAPI.getAdvancedDashboard(dateRange.startDate, dateRange.endDate)
    );
    testAPI('getRealTimeMetrics', () => adminAPI.getRealTimeMetrics());
    
    // Test alternative endpoints
    testAPI('getAdvancedDashboardAlternative', () => 
      adminAPI.getAdvancedDashboardAlternative(dateRange.startDate, dateRange.endDate)
    );
    testAPI('getRealTimeMetricsAlternative', () => 
      adminAPI.getRealTimeMetricsAlternative()
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Direct API Endpoint Tester
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              label="Từ ngày"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Đến ngày"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button 
              variant="contained" 
              onClick={testEndpoints}
              fullWidth
            >
              Test All API Endpoints
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        {Object.entries(results).map(([apiName, result]) => (
          <Grid item xs={12} md={6} key={apiName}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{apiName}</Typography>
                  <Chip 
                    label={result.status} 
                    color={result.status === 'success' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {result.timestamp.toLocaleString()}
                </Typography>
                
                {result.status === 'success' ? (
                  <Alert severity="success">
                    <Typography variant="body2">
                      ✅ API call successful
                    </Typography>
                    <details style={{ marginTop: '8px' }}>
                      <summary>View response data</summary>
                      <pre style={{ 
                        fontSize: '11px', 
                        overflow: 'auto', 
                        maxHeight: '150px',
                        background: '#f5f5f5',
                        padding: '8px',
                        borderRadius: '4px',
                        marginTop: '8px'
                      }}>
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </Alert>
                ) : (
                  <Alert severity="error">
                    <Typography variant="body2">
                      ❌ Error: {result.error}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {Object.keys(results).length === 0 && (
        <Alert severity="info">
          Click "Test All API Endpoints" to start testing the dashboard APIs
        </Alert>
      )}
    </Box>
  );
};

export default DirectAPITester;
