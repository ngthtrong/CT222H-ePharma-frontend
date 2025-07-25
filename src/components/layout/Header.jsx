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
  Tabs,
  Tab,
  Container,
  Divider,
  TextField,
  Autocomplete,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ShoppingCart,
  Search as SearchIcon,
  Person as PersonIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getParentCategories } from '../../api/categoryApi';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);

  // Function to generate breadcrumb based on current path
  const generateBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [];

    // Always add home
    breadcrumbs.push({ label: 'Trang chủ', path: '/' });

    if (path.startsWith('/product/') && path !== '/product') {
      // Product detail page - note: /product/:slug not /products/:slug
      breadcrumbs.push({ label: 'Sản phẩm', path: '/products' });
      // For now, just show "Chi tiết sản phẩm" - could be enhanced to show actual product name
      breadcrumbs.push({ label: 'Chi tiết sản phẩm', path: path, isActive: true });
    } else if (path === '/products') {
      breadcrumbs.push({ label: 'Sản phẩm', path: '/products', isActive: true });
    } else if (path === '/cart') {
      breadcrumbs.push({ label: 'Giỏ hàng', path: '/cart', isActive: true });
    } else if (path === '/profile') {
      breadcrumbs.push({ label: 'Thông tin tài khoản', path: '/profile', isActive: true });
    } else if (path === '/login') {
      breadcrumbs.push({ label: 'Đăng nhập', path: '/login', isActive: true });
    } else if (path === '/register') {
      breadcrumbs.push({ label: 'Đăng ký', path: '/register', isActive: true });
    } else if (path === '/admin') {
      breadcrumbs.push({ label: 'Trang quản trị', path: '/admin', isActive: true });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const shouldShowBreadcrumbs = location.pathname !== '/' && breadcrumbs.length > 1;

  // Fetch parent categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching parent categories...');
        const categoriesData = await getParentCategories();
        console.log('Categories data received in Header:', categoriesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching parent categories:', error);
        setCategories([]); // Set empty array on error
      }
    };
    fetchCategories();
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (event, value) => {
    if (value) {
      navigate(`/products?search=${encodeURIComponent(value)}`);
    }
  };

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  return (
    <>
      {/* Main Header */}
      <AppBar position="sticky" sx={{ bgcolor: 'primary.main', boxShadow: 'none' }}>
        <Container maxWidth="xl" sx={{ py: { xs: 1, md: 2 } }}>
          {/* Top Row - Logo and Search */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', width: '100%', flexDirection: { xs: 'column-reverse', md: 'row' }, alignItems: 'start' }}>

              {/* Logo */}
              <Box sx={{
                display: { xs: 'none', md: 'flex' },
                flexShrink: 0,
                width: { md: '187px' },
                justifyContent: 'center'
              }}>
                <Typography
                  variant="h4"
                  component={RouterLink}
                  to="/"
                  sx={{
                    color: 'white',
                    textDecoration: 'none', fontWeight: 'bold', height: '63px', display: 'flex', alignItems: 'center', cursor: 'pointer'
                  }}
                >
                  WellVerse
                </Typography>
              </Box>

              {/* Search Section */}
              <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr' }}>
                {/* Search Bar */}
                <Box sx={{
                  position: { xs: 'absolute', md: 'relative' },
                  bottom: { xs: '-30px', md: '0' },
                  left: { xs: '0', md: 'auto' },
                  width: '100%', px: { xs: 2, md: 0 },
                  dropShadow: { xs: '0 4px 6px -1px rgb(0 0 0 / 0.1)', md: 'none' }
                }}>
                  <Box sx={{ mx: 'auto', width: '100%' }}>
                    <Box sx={{ position: 'relative', color: 'text.secondary' }}>
                      <IconButton
                        sx={{
                          position: 'absolute', left: 0,
                          top: 0,
                          zIndex: 10,
                          height: '40px', px: 1,
                          py: '10px', color: 'text.primary'
                        }}
                      >
                        <SearchIcon />
                      </IconButton>

                      <Autocomplete
                        freeSolo
                        options={[]}
                        onInputChange={(event, newInputValue) => {
                          // Handle input change for suggestions
                        }}
                        onChange={handleSearch}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Bạn đang tìm gì hôm nay..."
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'white', borderRadius: '4px', border: 0,
                                height: '40px', pl: '40px', pr: '14px', fontSize: '14px', fontWeight: 500,
                                color: 'text.secondary', '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'transparent',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  border: 0
                                }
                              },
                              '& .MuiInputBase-input': {
                                p: 0
                              }
                            }}
                            InputProps={{
                              ...params.InputProps,
                              type: 'search',
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Popular Search Keywords */}
                <Box sx={{
                  mt: '3px',
                  display: { xs: 'none', md: 'flex' },
                  height: '20px', flexWrap: 'wrap', gap: 3,
                  fontSize: '12px', color: 'white', overflow: 'hidden'
                }}>
                  {['vitamin D3 K2', 'sữa dinh dưỡng', 'khẩu trang', 'kem chống nắng', 'collagen', 'giải nhiệt'].map((keyword) => (
                    <Box key={keyword} sx={{ height: '20px' }}>
                      <Typography
                        component={RouterLink}
                        to={`/products?search=${encodeURIComponent(keyword)}`}
                        sx={{
                          fontSize: '14px', lineHeight: '20px', color: 'white', textDecoration: 'none', '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        {keyword}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* User Actions */}
            <Box sx={{
              position: { xs: 'fixed', md: 'static' },
              top: { xs: 0, md: 'auto' },
              zIndex: { xs: 10, md: 'auto' },
              display: 'flex', width: { xs: '100%', md: 'auto' },
              minWidth: { xs: '340px', md: '286px' },
              flexDirection: { xs: 'row-reverse', md: 'row' },
              gap: 3,
              textAlign: 'right', pl: { md: 1.5 },
              pr: { md: 0 }
            }}>

              {/* Action Icons */}
              <Box sx={{
                display: 'grid',
                width: { xs: '132px', md: '88px' },
                gridTemplateColumns: { xs: 'repeat(3, 1fr)', md: 'repeat(2, 1fr)' },
                justifyItems: 'end', gap: 1
              }}>

                {/* Notification Icon */}
                <Box sx={{
                  position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: { xs: '36px', md: '40px' },
                  height: { xs: '36px', md: '40px' },
                  borderRadius: '50%', border: 0,
                  bgcolor: { xs: 'white', md: 'transparent' },
                  color: { xs: 'text.primary', md: 'white' },
                  p: 1
                }}>
                  <IconButton color="inherit" size="small">
                    <Badge badgeContent={0} color="secondary">
                      <Box sx={{ width: 24, height: 24 }}>
                        {/* Bell Icon */}
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M6.95393 3.1172C8.30955 1.76158 10.1482 1 12.0653 1C13.9824 1 15.8211 1.76158 17.1767 3.1172C18.5323 4.47282 19.2939 6.31144 19.2939 8.22857V12.8155C19.3203 14.9394 19.9145 17.0177 21.0149 18.8345C21.1645 19.0816 21.1694 19.3901 21.0276 19.6417C20.8858 19.8933 20.6194 20.049 20.3306 20.049H3.8C3.51119 20.049 3.2448 19.8933 3.10303 19.6417C2.96125 19.3901 2.9661 19.0816 3.11572 18.8345C4.21611 17.0176 4.81032 14.9394 4.83673 12.8155V8.22857C4.83673 6.31144 5.59831 4.47282 6.95393 3.1172Z" fill="currentColor" />
                          <path d="M9.46999 21.0857C9.66082 21.6213 10.0127 22.0848 10.4774 22.4125C10.942 22.7402 11.4967 22.9161 12.0653 22.9161C12.6339 22.9161 13.1886 22.7402 13.6532 22.4125C14.1179 22.0848 14.4698 21.6213 14.6606 21.0857H9.46999Z" fill="currentColor" />
                        </svg>
                      </Box>
                    </Badge>
                  </IconButton>
                </Box>

                {/* Cart Icon */}
                <Box sx={{
                  position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: { xs: '36px', md: '40px' },
                  height: { xs: '36px', md: '40px' },
                  borderRadius: '50%', border: 0,
                  bgcolor: { xs: 'white', md: 'transparent' },
                  color: { xs: 'text.primary', md: 'white' },
                  p: 1
                }}>
                  <IconButton
                    component={RouterLink}
                    to="/cart"
                    color="inherit"
                    size="small"
                  >
                    <Badge badgeContent={totalItems} color="secondary">
                      <ShoppingCart />
                    </Badge>
                  </IconButton>
                </Box>
              </Box>

              {/* Login/User Button */}
              <Box sx={{
                position: 'relative', flex: 1,
                gap: 1,
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'end'
              }}>
                <Box sx={{
                  position: 'absolute', bottom: '6px', left: 0,
                  top: '6px', display: { xs: 'none', md: 'inline-block' },
                  borderLeft: '1px solid rgba(255,255,255,0.3)'
                }} />

                {isAuthenticated ? (
                  <Button
                    color="inherit"
                    onClick={handleMenuOpen}
                    startIcon={<PersonIcon />}
                    sx={{
                      textTransform: 'none', bgcolor: 'white', color: 'text.primary', border: '1px solid', borderColor: 'grey.200', borderRadius: '20px', px: 2,
                      py: 1,
                      height: '36px', '&:hover': {
                        bgcolor: 'grey.50', color: 'primary.main'
                      }
                    }}
                  >
                    {user?.name || 'Tài khoản'}
                  </Button>
                ) : (
                  <Button
                    component={RouterLink}
                    to="/login"
                    startIcon={<PersonIcon />}
                    sx={{
                      textTransform: 'none', bgcolor: 'white', color: 'text.primary', border: '1px solid', borderColor: 'grey.200', borderRadius: '20px', px: 2,
                      py: 1,
                      height: '36px', '&:hover': {
                        bgcolor: 'grey.50', color: 'primary.main'
                      }
                    }}
                  >
                    Login / Sign up
                  </Button>
                )}

                {/* User Menu */}
                {isAuthenticated && (
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom', horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top', horizontal: 'right',
                    }}
                  >
                    <MenuItem component={RouterLink} to="/orders" onClick={handleMenuClose}>
                      Đơn hàng
                    </MenuItem>
                    <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
                      Thông tin tài khoản
                    </MenuItem>
                    {user?.roles?.includes('admin') && (
                      <MenuItem component={RouterLink} to="/admin" onClick={handleMenuClose}>
                        Trang Admin
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                  </Menu>
                )}
              </Box>
            </Box>
          </Box>
        </Container>

        {/* Bottom Row - Categories Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Container maxWidth="xl">
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '187px 1fr', alignItems: 'center', gap: { md: 2, lg: 2 }
            }}>

              {/* Category Menu Button */}
              <Box>
                <Button
                  startIcon={
                    <Box sx={{ width: 20, height: 20 }}>
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.2188 11.2222H2.78125C2.34977 11.2222 2 11.5704 2 11.9999C2 12.4295 2.34977 12.7777 2.78125 12.7777H21.2188C21.6502 12.7777 22 12.4295 22 11.9999C22 11.5704 21.6502 11.2222 21.2188 11.2222Z" fill="currentColor" />
                        <path d="M21.2188 5H2.78125C2.34977 5 2 5.34821 2 5.77777C2 6.20733 2.34977 6.55554 2.78125 6.55554H21.2188C21.6502 6.55554 22 6.20733 22 5.77777C22 5.34821 21.6502 5 21.2188 5Z" fill="currentColor" />
                        <path d="M21.2188 17.4446H2.78125C2.34977 17.4446 2 17.7928 2 18.2223C2 18.6519 2.34977 19.0001 2.78125 19.0001H21.2188C21.6502 19.0001 22 18.6519 22 18.2223C22 17.7928 21.6502 17.4446 21.2188 17.4446Z" fill="currentColor" />
                      </svg>
                    </Box>
                  }
                  sx={{
                    bgcolor: 'white', color: 'text.primary', border: '1px solid', borderColor: 'grey.200', borderRadius: '4px', width: '187px', justifyContent: 'flex-start', px: 2,
                    py: 1,
                    height: '36px', textTransform: 'none', fontSize: '16px', '&:hover': {
                      bgcolor: 'grey.50', color: 'primary.main'
                    }
                  }}
                >
                  <Box sx={{ ml: 1, userSelect: 'none' }}>Danh mục</Box>
                </Button>
              </Box>

              {/* Categories List */}
              <Box sx={{ position: 'relative', fontSize: '14px', color: 'white' }}>
                <Box sx={{
                  display: 'flex', gap: { md: 3, lg: 5 },
                  overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none'
                }}>
                  {Array.isArray(categories) && categories.map((category) => (
                    <Box key={category.id} sx={{ flexShrink: 0 }}>
                      <Typography
                        component={RouterLink}
                        to={`/products?category=${category.slug}`}
                        sx={{
                          display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500,
                          color: 'white', textDecoration: 'none', whiteSpace: 'nowrap', '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        {category.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Container>


          {shouldShowBreadcrumbs && (
            <Box sx={{ bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider', py: 1.5 }}>
              <Container maxWidth="xl">
                <Breadcrumbs
                  separator={<NavigateNextIcon fontSize="small" />}
                  sx={{
                    '& .MuiBreadcrumbs-ol': {
                      alignItems: 'center'
                    }
                  }}
                >
                  {breadcrumbs.map((crumb, index) => (
                    crumb.isActive ? (
                      <Typography
                        key={index}
                        color="text.primary"
                        sx={{ fontWeight: 500 }}
                      >
                        {crumb.label}
                      </Typography>
                    ) : (
                      <Link
                        key={index}
                        component={RouterLink}
                        to={crumb.path}
                        underline="hover"
                        color="inherit"
                        sx={{
                          fontSize: '0.875rem',
                          '&:hover': { color: 'primary.main' }
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
        </Box>
      </AppBar>

    </>
  );
};

export default Header;
