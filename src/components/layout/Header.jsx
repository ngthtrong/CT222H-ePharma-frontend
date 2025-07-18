import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Box,
  IconButton,
  Badge,
  Button,
  Autocomplete,
  Avatar,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [cartItemCount] = useState(3); // Mock data

  // Mock search suggestions
  const searchSuggestions = [
    'Paracetamol',
    'Vitamin C',
    'Thuốc cảm cúm',
    'Khẩu trang y tế',
    'Dầu gội đầu',
  ];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleAdminClick = () => {
    navigate('/admin');
    handleMenuClose();
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'primary.main' }}>
      <Toolbar 
        sx={{ 
          justifyContent: 'space-between', 
          py: 1,
          px: { xs: 1, sm: 2, md: 3 },
          minHeight: { xs: 56, sm: 64 }
        }}
      >
        {/* Logo */}
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 'bold',
            cursor: 'pointer',
            color: 'white',
            minWidth: 'fit-content',
            mr: { xs: 1, sm: 2, md: 3 },
            fontSize: { xs: '1.2rem', sm: '1.5rem' }
          }}
          onClick={handleLogoClick}
        >
          WellVerse
        </Typography>

        {/* Search Bar */}
        <Box sx={{ 
          flexGrow: 1, 
          maxWidth: { xs: 'none', md: 600 }, 
          mx: { xs: 1, sm: 2 },
          display: { xs: 'none', sm: 'block' }
        }}>
          <Autocomplete
            freeSolo
            options={searchSuggestions}
            value={searchValue}
            onInputChange={(event, newInputValue) => {
              setSearchValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Tìm kiếm sản phẩm..."
                variant="outlined"
                size="small"
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      border: 'none',
                    },
                  },
                }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <IconButton size="small" sx={{ color: 'primary.main' }}>
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />
            )}
          />
        </Box>

        {/* Mobile Search Icon */}
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <IconButton sx={{ color: 'white' }}>
            <SearchIcon />
          </IconButton>
        </Box>

        {/* Right Section */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2 },
          minWidth: 'fit-content'
        }}>
          {/* Hotline */}
          <Box sx={{ 
            display: { xs: 'none', lg: 'flex' }, 
            alignItems: 'center', 
            gap: 1 
          }}>
            <PhoneIcon sx={{ color: 'white' }} />
            <Typography variant="body2" sx={{ color: 'white' }}>
              1900 1009
            </Typography>
          </Box>

          {/* Cart */}
          <IconButton onClick={handleCartClick} sx={{ color: 'white' }}>
            <Badge badgeContent={cartItemCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {/* User Actions */}
          {isAuthenticated ? (
            <>
              <Chip
                avatar={<Avatar sx={{ width: 24, height: 24 }}>{user?.name?.charAt(0) || 'U'}</Avatar>}
                label={user?.name || 'User'}
                onClick={handleMenuOpen}
                deleteIcon={<KeyboardArrowDownIcon />}
                onDelete={handleMenuOpen}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  display: { xs: 'none', md: 'flex' },
                  '& .MuiChip-deleteIcon': {
                    color: 'white',
                  },
                }}
              />
              {/* Mobile User Avatar */}
              <IconButton
                onClick={handleMenuOpen}
                sx={{ 
                  color: 'white',
                  display: { xs: 'flex', md: 'none' }
                }}
              >
                <Avatar sx={{ width: 32, height: 32 }}>{user?.name?.charAt(0) || 'U'}</Avatar>
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
                <MenuItem onClick={handleProfileClick}>Tài khoản của tôi</MenuItem>
                <MenuItem onClick={handleMenuClose}>Đơn hàng</MenuItem>
                {user?.role === 'admin' && (
                  <MenuItem onClick={handleAdminClick}>Quản trị</MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="outlined"
              onClick={handleLoginClick}
              sx={{
                color: 'white',
                borderColor: 'white',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 },
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
              startIcon={<PersonIcon sx={{ display: { xs: 'none', sm: 'block' } }} />}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Đăng nhập
              </Box>
              <PersonIcon sx={{ display: { xs: 'block', sm: 'none' } }} />
            </Button>
          )}
        </Box>
      </Toolbar>
      
      {/* Mobile Search Bar */}
      <Box sx={{ 
        display: { xs: 'block', sm: 'none' },
        px: 2,
        pb: 1
      }}>
        <TextField
          placeholder="Tìm kiếm sản phẩm..."
          variant="outlined"
          size="small"
          fullWidth
          sx={{
            backgroundColor: 'white',
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: 'none',
              },
            },
          }}
          InputProps={{
            endAdornment: (
              <IconButton size="small" sx={{ color: 'primary.main' }}>
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </Box>
    </AppBar>
  );
};

export default Header;
