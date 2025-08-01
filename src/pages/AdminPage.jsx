import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Menu,
  MenuItem,
  Chip,
  Paper,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Inventory,
  ShoppingCart,
  Category,
  People,
  LocalOffer,
  Assessment,
  Notifications,
  RateReview,
  Logout,
  AccountCircle,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin, requireAdminAuth } from '../utils/adminUtils';

// Import admin components
import AdminDashboard from './admin/AdminDashboard';
import NewAdvancedDashboard from './admin/NewAdvancedDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminCategories from './admin/AdminCategories';
import AdminUsers from './admin/AdminUsers';
import AdminNotifications from './admin/AdminNotifications';

const drawerWidth = 280;

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  // Kiểm tra quyền admin khi component mount
  useEffect(() => {
    if (!requireAdminAuth(navigate)) {
      return;
    }
  }, [navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/admin/dashboard',
    },
    {
      text: 'Quản lý Sản phẩm',
      icon: <Inventory />,
      path: '/admin/products',
    },
    {
      text: 'Quản lý Đơn hàng',
      icon: <ShoppingCart />,
      path: '/admin/orders',
    },
    {
      text: 'Quản lý Danh mục',
      icon: <Category />,
      path: '/admin/categories',
    },
    {
      text: 'Quản lý Người dùng',
      icon: <People />,
      path: '/admin/users',
    },
    {
      text: 'Khuyến mãi',
      icon: <LocalOffer />,
      path: '/admin/promotions',
    },
    {
      text: 'Đánh giá',
      icon: <RateReview />,
      path: '/admin/reviews',
    },
    {
      text: 'Báo cáo',
      icon: <Assessment />,
      path: '/admin/reports',
    },
    {
      text: 'Thông báo',
      icon: <Notifications />,
      path: '/admin/notifications',
    },
  ];

  const drawer = (
    <Box>
      <Box sx={{ 
        backgroundColor: 'primary.main', 
        color: 'white', 
        p: 2,
        textAlign: 'center'
      }}>
        <Typography variant="h6" component="div">
          🛡️ Quản Trị Admin
        </Typography>
      </Box>
      <Divider />
      <List sx={{ py: 0 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false); // Close mobile drawer after navigation
              }}
              sx={{
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // Kiểm tra quyền admin trong render
  if (!isAdmin()) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="error" gutterBottom>
            Truy cập bị từ chối
          </Typography>
          <Typography variant="body1">
            Bạn không có quyền truy cập vào trang quản trị.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 200px)' }}>
      {/* Admin Sidebar */}
      <Box
        component="nav"
        sx={{ 
          width: { xs: 0, md: drawerWidth }, 
          flexShrink: { md: 0 },
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Paper 
          elevation={2}
          sx={{ 
            height: '100%',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            backgroundColor: 'primary.main', 
            color: 'white', 
            p: 2,
            textAlign: 'center'
          }}>
            <Typography variant="h6" component="div">
              🛡️ Quản Trị Admin
            </Typography>
          </Box>
          <Divider />
          <List sx={{ py: 0 }}>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  onClick={() => navigate(item.path)}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: 500
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Mobile Menu Toggle */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', top: 80, left: 16, zIndex: 1000 }}>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            }
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            top: 64
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Admin Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          ml: { xs: 0, md: 2 },
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          minHeight: 'calc(100vh - 200px)'
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<NewAdvancedDashboard />} />
          <Route path="dashboard-classic" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="promotions" element={
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" color="primary" gutterBottom>
                🚧 Quản lý Khuyến mãi
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tính năng đang được phát triển...
              </Typography>
            </Paper>
          } />
          <Route path="reviews" element={
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" color="primary" gutterBottom>
                ⭐ Quản lý Đánh giá
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tính năng đang được phát triển...
              </Typography>
            </Paper>
          } />
          <Route path="reports" element={
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" color="primary" gutterBottom>
                📊 Báo cáo
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tính năng đang được phát triển...
              </Typography>
            </Paper>
          } />
          <Route path="notifications" element={<AdminNotifications />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default AdminPage;