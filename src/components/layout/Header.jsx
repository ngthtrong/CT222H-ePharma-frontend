import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { 
  ShoppingCart, 
  Search as SearchIcon, 
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getParentCategories } from '../../api/categoryApi';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);

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
      <AppBar position="sticky" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar sx={{ minHeight: '80px' }}>
          {/* Logo */}
          <Typography
            variant="h5"
            component={RouterLink}
            to="/"
            sx={{ 
              color: 'inherit', 
              textDecoration: 'none',
              fontWeight: 'bold',
              mr: 4,
              minWidth: 'fit-content'
            }}
          >
            WellVerse
          </Typography>

          {/* Search Bar - Chiếm diện tích lớn nhất */}
          <Box sx={{ flexGrow: 1, maxWidth: 600, mx: 2 }}>
            <Autocomplete
              freeSolo
              options={[]} // Có thể thêm gợi ý tìm kiếm sau
              onInputChange={(event, newInputValue) => {
                // Handle input change for suggestions
              }}
              onChange={handleSearch}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="medium"
                  variant="outlined"
                  placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.light',
                      },
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    type: 'search',
                    startAdornment: (
                      <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                    ),
                  }}
                />
              )}
            />
          </Box>

          {/* User Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Tài khoản */}
            {isAuthenticated ? (
              <Button
                color="inherit"
                onClick={handleMenuOpen}
                startIcon={<PersonIcon />}
                sx={{ textTransform: 'none', px: 2 }}
              >
                {user?.name || 'Tài khoản'}
              </Button>
            ) : (
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                startIcon={<PersonIcon />}
                sx={{ textTransform: 'none', px: 2 }}
              >
                Tài khoản
              </Button>
            )}

            {/* Giỏ hàng */}
            <IconButton
              component={RouterLink}
              to="/cart"
              aria-label="show cart items"
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Badge badgeContent={totalItems} color="secondary">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* User Menu */}
            {isAuthenticated && (
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
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
        </Toolbar>

        {/* Navigation Categories */}
        <Box sx={{ bgcolor: 'primary.dark', px: 2 }}>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Category Tabs - Chỉ hiển thị danh mục gốc */}
              <Tabs
                value={selectedCategory}
                onChange={handleCategoryChange}
                sx={{
                  '& .MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.8)',
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 3,
                  },
                  '& .Mui-selected': {
                    color: 'white !important',
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'secondary.main',
                  },
                }}
              >
                {Array.isArray(categories) && categories.map((category, index) => (
                  <Tab 
                    key={category.id} 
                    label={category.name}
                    component={RouterLink}
                    to={`/products?category=${category.slug}`}
                  />
                ))}
              </Tabs>
            </Box>
          </Container>
        </Box>
      </AppBar>
    </>
  );
};

export default Header;
