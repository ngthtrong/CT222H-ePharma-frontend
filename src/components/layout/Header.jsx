import React, { useState } from 'react';
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
  Avatar,
  TextField,
  Autocomplete,
} from '@mui/material';
import { ShoppingCart, Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);

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
      // Assuming 'value' is the search query string
      navigate(`/products?search=${encodeURIComponent(value)}`);
    }
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'primary.main' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
        >
          WellVerse
        </Typography>

        {/* Search Bar */}
        <Box sx={{ minWidth: 300, mr: 2 }}>
           <Autocomplete
            freeSolo
            options={[]} // You can populate this with search suggestions later
            onInputChange={(event, newInputValue) => {
              // Handle input change for suggestions if needed
            }}
            onChange={handleSearch}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                variant="outlined"
                placeholder="Tìm kiếm sản phẩm..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 1,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
                InputProps={{
                  ...params.InputProps,
                  type: 'search',
                  startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                }}
              />
            )}
          />
        </Box>

        <Button color="inherit" component={RouterLink} to="/products">
          Sản phẩm
        </Button>

        <IconButton
          component={RouterLink}
          to="/cart"
          aria-label="show cart items"
          color="inherit"
        >
          <Badge badgeContent={totalItems} color="error">
            <ShoppingCart />
          </Badge>
        </IconButton>

        {isAuthenticated ? (
          <>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0, ml: 2 }}>
              <Avatar alt={user?.name || 'User'} src={user?.avatarUrl || '/static/images/avatar/2.jpg'} />
            </IconButton>
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
              <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
                Thông tin tài khoản
              </MenuItem>
              <MenuItem component={RouterLink} to="/orders" onClick={handleMenuClose}>
                Lịch sử đơn hàng
              </MenuItem>
              {user?.roles?.includes('admin') && (
                 <MenuItem component={RouterLink} to="/admin" onClick={handleMenuClose}>
                    Trang Admin
                 </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
            </Menu>
          </>
        ) : (
          <Box>
            <Button color="inherit" component={RouterLink} to="/login">
              Đăng nhập
            </Button>
            <Button color="inherit" component={RouterLink} to="/register">
              Đăng ký
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
