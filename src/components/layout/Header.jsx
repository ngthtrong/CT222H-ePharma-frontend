import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  TextField,
  Autocomplete,
  Badge,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  
  // Mock data
  const cartItemCount = 3;
  const isLoggedIn = false; // Thay đổi thành true để test trạng thái đã đăng nhập
  const userName = "Nguyễn Văn A";
  
  // Mock search suggestions
  const searchSuggestions = [
    'Paracetamol',
    'Vitamin C',
    'Thuốc cảm cúm',
    'Kem chống nắng',
    'Sữa rửa mặt',
    'Băng gạc y tế'
  ];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue)}`);
    }
  };

  const menuItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Sản phẩm', path: '/products' },
  ];

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
        {/* Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            minWidth: { xs: 80, sm: 120 },
          }}
        >
          WellVerse
        </Typography>

        {/* Search Bar - Chỉ hiển thị trên desktop */}
        {!isMobile && (
          <Box 
            component="form" 
            onSubmit={handleSearch}
            sx={{ 
              flexGrow: 1, 
              mx: 3,
              maxWidth: 600,
            }}
          >
            <Autocomplete
              freeSolo
              options={searchSuggestions}
              value={searchValue}
              onInputChange={(event, newValue) => {
                setSearchValue(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }} />,
                  }}
                />
              )}
            />
          </Box>
        )}

        {/* Hotline - Chỉ hiển thị trên desktop */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
            <PhoneIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
            <Box>
              <Typography variant="caption" display="block">
                Hotline
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                1900-6750
              </Typography>
            </Box>
          </Box>
        )}

        {/* User Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Cart */}
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/cart')}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={cartItemCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {/* User Account */}
          {isLoggedIn ? (
            <Chip
              avatar={<Avatar sx={{ width: 28, height: 28 }}>{userName.charAt(0)}</Avatar>}
              label={isMobile ? '' : userName}
              onClick={handleUserMenuOpen}
              onDelete={handleUserMenuOpen}
              deleteIcon={<KeyboardArrowDownIcon />}
              variant="outlined"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
                '& .MuiChip-deleteIcon': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />
          ) : (
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                textTransform: 'none',
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            >
              Đăng nhập
            </Button>
          )}

          {/* Mobile Menu */}
          {isMobile && (
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
          )}

          {/* Desktop Navigation - Ẩn trên mobile */}
          {!isMobile && (
            <Box sx={{ display: 'flex', ml: 2 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  component={Link}
                  to={item.path}
                  sx={{ 
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
        </Box>

        {/* Mobile Menu */}
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
          {/* Search cho mobile */}
          <Box sx={{ p: 2, minWidth: 250 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm..."
              variant="outlined"
              size="small"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                  handleMenuClose();
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>
          <Divider />
          
          {menuItems.map((item) => (
            <MenuItem
              key={item.path}
              onClick={() => {
                navigate(item.path);
                handleMenuClose();
              }}
            >
              {item.label}
            </MenuItem>
          ))}
          
          {!isLoggedIn && (
            <>
              <Divider />
              <MenuItem onClick={() => { navigate('/login'); handleMenuClose(); }}>
                Đăng nhập
              </MenuItem>
              <MenuItem onClick={() => { navigate('/register'); handleMenuClose(); }}>
                Đăng ký
              </MenuItem>
            </>
          )}
        </Menu>

        {/* User Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
            Tài khoản của tôi
          </MenuItem>
          <MenuItem onClick={() => { navigate('/orders'); handleUserMenuClose(); }}>
            Đơn hàng
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { handleUserMenuClose(); }}>
            Đăng xuất
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
