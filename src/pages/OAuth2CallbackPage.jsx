import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Alert, Paper, Button } from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { oauth2Auth } from '../utils/oauth2Auth';

const OAuth2CallbackPage = () => {
  const navigate = useNavigate();
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const { processOAuth2Callback } = useAuth();
  
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          // Handle OAuth2 error from provider
          setStatus('error');
          const errorMessage = oauth2Auth.getErrorMessage(error, provider);
          setMessage(errorDescription || errorMessage);
          
          // Clean up OAuth2 state
          oauth2Auth.clearState();
          
          // Redirect to login page after showing error
          setTimeout(() => {
            navigate('/login', { 
              replace: true,
              state: { oauth2Error: errorMessage }
            });
          }, 4000);
          return;
        }

        if (!code || !state) {
          setStatus('error');
          setMessage('Thiếu thông tin xác thực. Vui lòng thử lại.');
          
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
          return;
        }

        // Process OAuth2 callback
        const result = await processOAuth2Callback(provider, code, state);
        
        if (result.success) {
          setStatus('success');
          setMessage(`Đăng nhập với ${provider} thành công! Đang chuyển hướng...`);
          
          // Clean up OAuth2 state
          oauth2Auth.clearState();
          
          // Redirect to home page or intended destination
          setTimeout(() => {
            const from = sessionStorage.getItem('oauth2_redirect_after');
            sessionStorage.removeItem('oauth2_redirect_after');
            navigate(from || '/', { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result.error || `Đăng nhập với ${provider} thất bại`);
          
          // Clean up OAuth2 state
          oauth2Auth.clearState();
          
          setTimeout(() => {
            navigate('/login', { 
              replace: true,
              state: { oauth2Error: result.error }
            });
          }, 4000);
        }

      } catch (error) {
        console.error('OAuth2 callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Có lỗi xảy ra trong quá trình xác thực');
        
        // Clean up OAuth2 state
        oauth2Auth.clearState();
        
        setTimeout(() => {
          navigate('/login', { 
            replace: true,
            state: { oauth2Error: error.message }
          });
        }, 4000);
      }
    };

    handleCallback();
  }, [provider, searchParams, processOAuth2Callback, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Đang xử lý đăng nhập...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng đợi trong giây lát
            </Typography>
          </Box>
        );
      
      case 'success':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
            <CircularProgress size={24} sx={{ ml: 1 }} />
          </Box>
        );
      
      case 'error':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {message}
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Bạn sẽ được chuyển về trang đăng nhập trong giây lát...
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/login', { replace: true })}
              size="small"
            >
              Quay lại đăng nhập
            </Button>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
          Xác thực OAuth2
        </Typography>
        
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          Đang xử lý đăng nhập với {provider}
        </Typography>

        {renderContent()}
      </Paper>
    </Box>
  );
};

export default OAuth2CallbackPage;
