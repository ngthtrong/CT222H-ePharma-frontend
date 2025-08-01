import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Container,
  Divider,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
  MenuList,
  Paper,
  Portal,
  Popper,
  ClickAwayListener,
  Grow,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart,
  Person as PersonIcon,
  NavigateNext as NavigateNextIcon,
  AdminPanelSettings as AdminIcon,
  History as HistoryIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getCategoriesWithChildren } from '../../api/categoryApi';
import { isAdmin } from '../../utils/adminUtils';
import SearchBar from '../SearchBar';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  
  // State management
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryDropdowns, setCategoryDropdowns] = useState({});
  const [categoryAnchors, setCategoryAnchors] = useState({});
  const [hoverTimeouts, setHoverTimeouts] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Breadcrumb generation
  const generateBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [{ label: 'Trang chủ', path: '/' }];

    if (path.startsWith('/product/') && path !== '/product') {
      breadcrumbs.push({ label: 'Sản phẩm', path: '/products' });
      breadcrumbs.push({ label: 'Chi tiết sản phẩm', path: path, isActive: true });
    } else if (path === '/products') {
      breadcrumbs.push({ label: 'Sản phẩm', path: '/products', isActive: true });
    } else if (path === '/cart') {
      breadcrumbs.push({ label: 'Giỏ hàng', path: '/cart', isActive: true });
    } else if (path === '/profile') {
      breadcrumbs.push({ label: 'Thông tin tài khoản', path: '/profile', isActive: true });
    } else if (path === '/orders') {
      breadcrumbs.push({ label: 'Đơn hàng của tôi', path: '/orders', isActive: true });
    } else if (path === '/login') {
      breadcrumbs.push({ label: 'Đăng nhập', path: '/login', isActive: true });
    } else if (path === '/register') {
      breadcrumbs.push({ label: 'Đăng ký', path: '/register', isActive: true });
    } else if (path.startsWith('/admin')) {
      breadcrumbs.push({ label: 'Quản trị', path: '/admin' });
      
      const adminRoutes = {
        '/admin': 'Dashboard',
        '/admin/dashboard': 'Dashboard',
        '/admin/products': 'Quản lý Sản phẩm',
        '/admin/orders': 'Quản lý Đơn hàng',
        '/admin/categories': 'Quản lý Danh mục',
        '/admin/users': 'Quản lý Người dùng'
      };
      
      if (adminRoutes[path]) {
        breadcrumbs.push({ label: adminRoutes[path], path: path, isActive: true });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const shouldShowBreadcrumbs = location.pathname !== '/' && breadcrumbs.length > 1;

  // Fetch categories with children
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategoriesWithChildren();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(hoverTimeouts).forEach(timeoutId => {
        if (timeoutId) clearTimeout(timeoutId);
      });
    };
  }, [hoverTimeouts]);

  // Event handlers
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    showSnackbar('Đăng xuất thành công', 'success');
    navigate('/');
  };

  // Category dropdown handlers
  const handleCategoryMouseEnter = (categoryId, event) => {
    // Store anchor element for positioning
    setCategoryAnchors(prev => ({ ...prev, [categoryId]: event.currentTarget }));
    
    // Clear any existing timeout for this category
    if (hoverTimeouts[categoryId]) {
      clearTimeout(hoverTimeouts[categoryId]);
      setHoverTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[categoryId];
        return newTimeouts;
      });
    }
    
    // Show dropdown immediately
    setCategoryDropdowns(prev => ({ ...prev, [categoryId]: true }));
  };

  const handleCategoryMouseLeave = (categoryId) => {
    // Set timeout to hide dropdown
    const timeoutId = setTimeout(() => {
      setCategoryDropdowns(prev => {
        const newState = { ...prev };
        delete newState[categoryId];
        return newState;
      });
      setHoverTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[categoryId];
        return newTimeouts;
      });
    }, 200);
    
    setHoverTimeouts(prev => ({ ...prev, [categoryId]: timeoutId }));
  };

  const handleSubmenuMouseEnter = (categoryId) => {
    // Clear timeout and keep dropdown open
    if (hoverTimeouts[categoryId]) {
      clearTimeout(hoverTimeouts[categoryId]);
      setHoverTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[categoryId];
        return newTimeouts;
      });
    }
    setCategoryDropdowns(prev => ({ ...prev, [categoryId]: true }));
  };

  const handleSubmenuMouseLeave = (categoryId) => {
    // Hide dropdown immediately when leaving submenu
    setCategoryDropdowns(prev => {
      const newState = { ...prev };
      delete newState[categoryId];
      return newState;
    });
  };

  const handleDropdownClose = (categoryId) => {
    setCategoryDropdowns(prev => {
      const newState = { ...prev };
      delete newState[categoryId];
      return newState;
    });
  };

  return (
    <>
      {/* Main Header */}
      <AppBar position="sticky" sx={{ 
        bgcolor: 'primary.main', 
        boxShadow: 2,
        zIndex: 1200 // Ensure header is above most content
      }}>
        <Container maxWidth="xl">
          {/* Top Section */}
          <Box sx={{ py: { xs: 1, md: 2 } }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2, md: 3 }
            }}>
              
              {/* Logo */}
              <Box sx={{ 
                order: { xs: 1, md: 1 },
                flexShrink: 0 
              }}>
                <Typography
                  variant="h4"
                  component={RouterLink}
                  to="/"
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    '&:hover': { opacity: 0.9 }
                  }}
                >
                  WellVerse
                </Typography>
              </Box>

              {/* Search Bar */}
              <Box sx={{ 
                order: { xs: 3, md: 2 },
                flex: 1,
                maxWidth: { xs: '100%', md: '600px' },
                width: '100%'
              }}>
                <SearchBar 
                  placeholder="Bạn đang tìm gì hôm nay..."
                  fullWidth
                  size="medium"
                  sx={{
                    '& .MuiTextField-root': {
                      '& .MuiOutlinedInput-root': {
                        height: '48px',
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        '& fieldset': {
                          borderColor: 'transparent',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'white',
                        }
                      }
                    }
                  }}
                />
              </Box>

              {/* User Actions */}
              <Box sx={{ 
                order: { xs: 2, md: 3 },
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                width: { xs: '100%', md: 'auto' },
                justifyContent: { xs: 'space-between', md: 'flex-end' }
              }}>
                
                {/* Notification Icon */}
                <IconButton 
                  sx={{ 
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <Badge badgeContent={0} color="secondary">
                    <Box sx={{ width: 24, height: 24 }}>
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M6.95393 3.1172C8.30955 1.76158 10.1482 1 12.0653 1C13.9824 1 15.8211 1.76158 17.1767 3.1172C18.5323 4.47282 19.2939 6.31144 19.2939 8.22857V12.8155C19.3203 14.9394 19.9145 17.0177 21.0149 18.8345C21.1645 19.0816 21.1694 19.3901 21.0276 19.6417C20.8858 19.8933 20.6194 20.049 20.3306 20.049H3.8C3.51119 20.049 3.2448 19.8933 3.10303 19.6417C2.96125 19.3901 2.9661 19.0816 3.11572 18.8345C4.21611 17.0176 4.81032 14.9394 4.83673 12.8155V8.22857C4.83673 6.31144 5.59831 4.47282 6.95393 3.1172Z" fill="currentColor" />
                        <path d="M9.46999 21.0857C9.66082 21.6213 10.0127 22.0848 10.4774 22.4125C10.942 22.7402 11.4967 22.9161 12.0653 22.9161C12.6339 22.9161 13.1886 22.7402 13.6532 22.4125C14.1179 22.0848 14.4698 21.6213 14.6606 21.0857H9.46999Z" fill="currentColor" />
                      </svg>
                    </Box>
                  </Badge>
                </IconButton>

                {/* Cart Icon */}
                <IconButton
                  component={RouterLink}
                  to="/cart"
                  sx={{ 
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <Badge badgeContent={totalItems} color="secondary">
                    <ShoppingCart />
                  </Badge>
                </IconButton>

                {/* User Menu */}
                {isAuthenticated ? (
                  <>
                    <Button
                      onClick={handleUserMenuOpen}
                      startIcon={<PersonIcon />}
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: '24px',
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                      }}
                    >
                      {user?.name || 'Tài khoản'}
                    </Button>
                    
                    <Menu
                      anchorEl={userMenuAnchor}
                      open={Boolean(userMenuAnchor)}
                      onClose={handleUserMenuClose}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      PaperProps={{
                        sx: { mt: 1, minWidth: 200, borderRadius: 2 }
                      }}
                    >
                      <MenuItem component={RouterLink} to="/orders" onClick={handleUserMenuClose}>
                        Đơn hàng
                      </MenuItem>
                      <MenuItem component={RouterLink} to="/search-history" onClick={handleUserMenuClose}>
                        <HistoryIcon sx={{ mr: 1, fontSize: 20 }} />
                        Lịch sử tìm kiếm
                      </MenuItem>
                      <MenuItem component={RouterLink} to="/profile" onClick={handleUserMenuClose}>
                        Thông tin tài khoản
                      </MenuItem>
                      {isAdmin() && <Divider />}
                      {isAdmin() && (
                        <MenuItem 
                          component={RouterLink} 
                          to="/admin" 
                          onClick={handleUserMenuClose}
                          sx={{ color: 'error.main', fontWeight: 'bold' }}
                        >
                          <AdminIcon sx={{ mr: 1, fontSize: 20 }} />
                          Trang Quản Trị
                        </MenuItem>
                      )}
                      <Divider />
                      <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                        Đăng xuất
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button
                    component={RouterLink}
                    to="/login"
                    startIcon={<PersonIcon />}
                    sx={{
                      color: 'primary.main',
                      bgcolor: 'white',
                      borderRadius: '24px',
                      px: 3,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': { 
                        bgcolor: 'grey.100',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    Đăng nhập
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          {/* Categories Navigation Bar */}
          <Box sx={{ 
            display: { xs: 'none', md: 'block' },
            borderTop: '1px solid rgba(255,255,255,0.2)',
            py: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              
              {/* Category Menu Button */}
              <Button
                component={RouterLink}
                to="/products"
                startIcon={<MenuIcon />}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  borderRadius: '8px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  minWidth: '140px',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                Danh mục
              </Button>

              {/* Categories List */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                flex: 1,
                overflow: 'hidden'
              }}>
                <Box sx={{
                  display: 'flex',
                  gap: 4,
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                  py: 1
                }}>
                  {Array.isArray(categories) && categories.map((category) => {
                    const categoryId = category._id || category.id;
                    const hasChildren = category.children && category.children.length > 0;
                    
                    return (
                      <Box 
                        key={categoryId}
                        sx={{ position: 'relative', flexShrink: 0 }}
                        onMouseEnter={(e) => hasChildren && handleCategoryMouseEnter(categoryId, e)}
                        onMouseLeave={() => hasChildren && handleCategoryMouseLeave(categoryId)}
                      >
                        <Button
                          component={hasChildren ? 'button' : RouterLink}
                          to={!hasChildren ? `/products?category=${categoryId}` : undefined}
                          onClick={hasChildren ? (e) => handleCategoryMouseEnter(categoryId, e) : undefined}
                          endIcon={hasChildren ? <ArrowDownIcon sx={{ fontSize: 16 }} /> : null}
                          sx={{
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '14px',
                            whiteSpace: 'nowrap',
                            minWidth: 'auto',
                            px: 2,
                            py: 1,
                            borderRadius: '20px',
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.1)',
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {category.name}
                        </Button>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>

        {/* Breadcrumbs */}
        {shouldShowBreadcrumbs && (
          <Box sx={{ 
            bgcolor: 'background.paper', 
            borderTop: `1px solid ${theme.palette.divider}`,
            py: 2,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
          }}>
            <Container maxWidth="xl">
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" sx={{ color: 'primary.main' }} />}
                sx={{
                  '& .MuiBreadcrumbs-ol': { 
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  },
                  '& .MuiBreadcrumbs-separator': { 
                    color: 'primary.main',
                    mx: 1
                  }
                }}
              >
                {breadcrumbs.map((crumb, index) => (
                  crumb.isActive ? (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: '14px',
                        fontWeight: 600,
                        boxShadow: `0 2px 8px ${theme.palette.primary.main}30`
                      }}
                    >
                      {crumb.label}
                    </Box>
                  ) : (
                    <Link
                      key={index}
                      component={RouterLink}
                      to={crumb.path}
                      underline="none"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '14px',
                        fontWeight: 500,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          color: 'primary.main',
                          bgcolor: 'primary.50',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      {crumb.label}
                    </Link>
                  )
                ))}
              </Breadcrumbs>
            </Container>
          </Box>
        )}
      </AppBar>

      {/* Category Dropdowns using Portal for proper z-index layering */}
      {Array.isArray(categories) && categories.map((category) => {
        const categoryId = category._id || category.id;
        const hasChildren = category.children && category.children.length > 0;
        
        return hasChildren && categoryDropdowns[categoryId] && categoryAnchors[categoryId] ? (
          <Portal key={`dropdown-${categoryId}`}>
            <Popper
              open={Boolean(categoryDropdowns[categoryId])}
              anchorEl={categoryAnchors[categoryId]}
              placement="bottom-start"
              sx={{ zIndex: 9999 }}
              modifiers={[
                {
                  name: 'offset',
                  options: {
                    offset: [0, 8],
                  },
                },
              ]}
            >
              <ClickAwayListener onClickAway={() => handleDropdownClose(categoryId)}>
                <Grow in={Boolean(categoryDropdowns[categoryId])} timeout={200}>
                  <Paper
                    sx={{
                      minWidth: 220,
                      maxWidth: 300,
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      backgroundColor: 'white'
                    }}
                    onMouseEnter={() => handleSubmenuMouseEnter(categoryId)}
                    onMouseLeave={() => handleSubmenuMouseLeave(categoryId)}
                  >
                    <MenuList sx={{ p: 1 }}>
                      {/* Parent category */}
                      <MenuItem
                        component={RouterLink}
                        to={`/products?category=${categoryId}`}
                        sx={{
                          fontWeight: 600,
                          color: 'primary.main',
                          borderRadius: 1,
                          mb: 1,
                          '&:hover': {
                            bgcolor: 'primary.50'
                          }
                        }}
                      >
                        Tất cả {category.name}
                      </MenuItem>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      {/* Subcategories */}
                      {category.children.map((child) => (
                        <MenuItem
                          key={child._id || child.id}
                          component={RouterLink}
                          to={`/products?category=${child._id || child.id}`}
                          sx={{
                            fontSize: '14px',
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: 'grey.50',
                              color: 'primary.main'
                            }
                          }}
                        >
                          {child.name}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Paper>
                </Grow>
              </ClickAwayListener>
            </Popper>
          </Portal>
        ) : null;
      })}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Header;
