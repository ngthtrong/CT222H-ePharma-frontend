import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Security as SecurityIcon,
  Api as ApiIcon,
  AccountCircle as UserIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { oauth2Auth } from '../utils/oauth2Auth';

const OAuth2DemoPage = () => {
  const { user, isAuthenticated, oauth2Login } = useAuth();
  const [oauth2Status, setOauth2Status] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check OAuth2 status when component mounts
    checkOAuth2Status();
  }, []);

  const checkOAuth2Status = async () => {
    try {
      const status = await oauth2Auth.getStatus();
      setOauth2Status(status);
    } catch (error) {
      console.error('Error checking OAuth2 status:', error);
    }
  };

  const handleGoogleDemo = async () => {
    try {
      setLoading(true);
      await oauth2Login('google');
    } catch (error) {
      console.error('Google demo error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookDemo = async () => {
    try {
      setLoading(true);
      await oauth2Login('facebook');
    } catch (error) {
      console.error('Facebook demo error:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <SecurityIcon color="primary" />,
      title: 'State Parameter Validation',
      description: 'CSRF protection với state parameter'
    },
    {
      icon: <ApiIcon color="primary" />,
      title: 'Backend Integration',
      description: 'Hoàn toàn tích hợp với Spring Boot backend'
    },
    {
      icon: <UserIcon color="primary" />,
      title: 'User Account Linking',
      description: 'Tự động link account dựa trên email'
    },
    {
      icon: <CheckIcon color="success" />,
      title: 'JWT Token Generation',
      description: 'Tạo JWT token tương tự traditional login'
    }
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" textAlign="center">
        🔐 OAuth2 Integration Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
        Demonstration of OAuth2 authentication with Google and Facebook
      </Typography>

      {/* Current User Status */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          👤 Current Authentication Status
        </Typography>
        
        {isAuthenticated && user ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Logged in as:</strong> {user.fullName} ({user.email})
            </Typography>
            <Typography variant="body2">
              <strong>Authentication Method:</strong> {user.authProvider || 'local'}
            </Typography>
            <Typography variant="body2">
              <strong>Role:</strong> {user.role}
            </Typography>
          </Alert>
        ) : (
          <Alert severity="info">
            Not authenticated. Try the OAuth2 login buttons below.
          </Alert>
        )}
      </Paper>

      {/* OAuth2 Demo Buttons */}
      {!isAuthenticated && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            🚀 Try OAuth2 Login
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click the buttons below to test OAuth2 authentication flow
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleDemo}
              disabled={loading}
              sx={{ 
                flex: 1,
                py: 1.5,
                borderColor: '#4285f4',
                color: '#4285f4',
                '&:hover': {
                  borderColor: '#3367d6',
                  backgroundColor: 'rgba(66, 133, 244, 0.04)'
                }
              }}
            >
              Login with Google
            </Button>
            <Button
              variant="outlined"
              startIcon={<FacebookIcon />}
              onClick={handleFacebookDemo}
              disabled={loading}
              sx={{ 
                flex: 1,
                py: 1.5,
                color: '#1877F2',
                borderColor: '#1877F2',
                '&:hover': {
                  borderColor: '#166fe5',
                  backgroundColor: 'rgba(24, 119, 242, 0.04)'
                }
              }}
            >
              Login with Facebook
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary">
            Note: OAuth2 login requires proper backend configuration with Google and Facebook apps.
          </Typography>

          {/* Temporary test button for successful OAuth2 flow */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              🧪 Test OAuth2 Success Flow (Development Only):
            </Typography>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              onClick={() => {
                // Simulate successful OAuth2 callback
                const testToken = 'test-jwt-token-' + Date.now();
                const testUser = {
                  id: 'test-user-id',
                  fullName: 'Test User',
                  email: 'test@example.com',
                  role: 'USER',
                  authProvider: 'google'
                };
                
                // Navigate to success page with test data
                const params = new URLSearchParams({
                  token: testToken,
                  user: JSON.stringify(testUser),
                  provider: 'google'
                });
                
                window.location.href = `/auth/oauth2/success?${params.toString()}`;
              }}
            >
              Test OAuth2 Success Flow
            </Button>
          </Box>
        </Paper>
      )}

      {/* OAuth2 Status */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          🔧 OAuth2 Backend Status
        </Typography>
        
        {oauth2Status ? (
          <>
            <Alert severity={oauth2Status.success ? 'success' : 'error'} sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Status:</strong> {oauth2Status.message}
              </Typography>
              {oauth2Status.data && (
                <Typography variant="body2">
                  <strong>Available Providers:</strong> {oauth2Status.data}
                </Typography>
              )}
            </Alert>
            
            {oauth2Status.success && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>⚠️ Backend Configuration Issue:</strong> OAuth2 providers are configured but callback URL needs to redirect to frontend.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Current: Backend redirects to backend URL<br />
                  Needed: Backend should redirect to <code>http://localhost:5173/auth/oauth2/success</code>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  See <strong>BACKEND-OAUTH2-FIX-NEEDED.md</strong> for implementation details.
                </Typography>
              </Alert>
            )}
          </>
        ) : (
          <Alert severity="info">
            Checking OAuth2 backend status...
          </Alert>
        )}
      </Paper>

      {/* Features Grid */}
      <Typography variant="h6" gutterBottom>
        ✨ OAuth2 Features Implemented
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={1} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="subtitle2" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Implementation Details */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🛠️ Technical Implementation
        </Typography>
        
        <List dense>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="OAuth2 Authentication Class"
              secondary="Utility class handling OAuth2 flow and state management"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="Callback Page Handler"
              secondary="Dedicated page for processing OAuth2 callbacks"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="AuthContext Integration"
              secondary="Seamless integration with existing authentication system"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="API Integration"
              secondary="Complete API integration with backend OAuth2 endpoints"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary">
          <strong>API Endpoints:</strong><br />
          • GET /auth/oauth2/login/{'{provider}'} - Get authorization URL<br />
          • POST /auth/oauth2/callback/{'{provider}'} - Process callback<br />
          • GET /auth/oauth2/status - Check OAuth2 status
        </Typography>
      </Paper>
    </Box>
  );
};

export default OAuth2DemoPage;
