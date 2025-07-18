import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Paper } from '@mui/material';
import { productAPI, categoryAPI } from '../api';

const APIDebugger = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const testAPI = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      console.log('🔄 Testing API...');
      
      // Test products
      const productsResponse = await productAPI.getProducts({ limit: 3 });
      console.log('📦 Products response:', productsResponse);
      
      // Test categories
      const categoriesResponse = await categoryAPI.getCategories();
      console.log('📁 Categories response:', categoriesResponse);
      
      setResults({
        products: productsResponse.data,
        categories: categoriesResponse.data,
      });
      
    } catch (error) {
      console.error('❌ API Test Error:', error);
      setError(`API Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI(); // Auto-run on mount
  }, []);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        API Debug Panel
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testAPI} 
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={20} /> : 'Test API'}
      </Button>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {results && (
        <Box>
          <Typography variant="h6" gutterBottom>
            API Results:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ 
            backgroundColor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.8rem'
          }}>
            {JSON.stringify(results, null, 2)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default APIDebugger;
