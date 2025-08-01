import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Alert, Paper, Button } from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { oauth2Auth } from '../utils/oauth2Auth';

const OAuth2SuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { processOAuth2Callback } = useAuth();
  
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleDirectCallback = async () => {
      try {
        // Extract data from URL parameters (for direct backend redirect)
        const token = searchParams.get('token');
        const userDataParam = searchParams.get('user');
        const error = searchParams.get('error');
        const provider = searchParams.get('provider') || 'google';

        if (error) {
          setStatus('error');
          const errorMessage = oauth2Auth.getErrorMessage(error, provider);
          setMessage(errorMessage);
          
          setTimeout(() => {
            navigate('/login', { 
              replace: true,
              state: { oauth2Error: errorMessage }
            });
          }, 4000);
          return;
        }

        if (token && userDataParam) {
          // Backend sent token and user data directly
          try {
            const userData = JSON.parse(decodeURIComponent(userDataParam));
            
            // Store authentication data
            localStorage.setItem('accessToken', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Update auth context
            // This will trigger AuthContext to update state
            setStatus('success');
            setMessage(`Đăng nhập với ${provider} thành công! Đang chuyển hướng...`);
            
            // Clean up OAuth2 state
            oauth2Auth.clearState();
            
            // Redirect to intended destination
            setTimeout(() => {
              const from = sessionStorage.getItem('oauth2_redirect_after');
              sessionStorage.removeItem('oauth2_redirect_after');
              
              // Force page reload to update auth context
              window.location.href = from || '/';
            }, 2000);
            
          } catch (parseError) {
            throw new Error('Lỗi xử lý dữ liệu người dùng');
          }
        } else {
          throw new Error('Thiếu thông tin xác thực');
        }

      } catch (error) {
        console.error('OAuth2 direct callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Có lỗi xảy ra trong quá trình xác thực');
        
        oauth2Auth.clearState();
        
        setTimeout(() => {
          navigate('/login', { 
            replace: true,
            state: { oauth2Error: error.message }
          });
        }, 4000);
      }
    };

    handleDirectCallback();
  }, [searchParams, navigate]);

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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Đang chuyển hướng...
            </Typography>
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
          Đang hoàn tất quá trình đăng nhập
        </Typography>

        {renderContent()}
      </Paper>
    </Box>
  );
};

export default OAuth2SuccessPage;
