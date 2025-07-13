import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  Divider,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Mock data for cart items
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Paracetamol 500mg - Hộp 20 viên',
      price: 15000,
      quantity: 11,
      image: '/api/placeholder/100/100',
      category: 'Dược phẩm'
    },
    {
      id: 2,
      name: 'Vitamin C 1000mg - Hộp 30 viên',
      price: 45000,
      quantity: 7,
      image: '/api/placeholder/100/100',
      category: 'Thực phẩm chức năng'
    },
    {
      id: 3,
      name: 'Khẩu trang y tế 4 lớp - Hộp 50 cái',
      price: 85000,
      quantity: 6,
      image: '/api/placeholder/100/100',
      category: 'Thiết bị y tế'
    },
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShippingFee = () => {
    return 30000;
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout...');
    // TODO: Implement checkout logic
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  if (cartItems.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Giỏ hàng trống
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleContinueShopping}
          >
            Tiếp tục mua sắm
          </Button>
        </Paper>
      </Box>
    );
  }

  // Mobile Cart Item Component
  const MobileCartItem = ({ item }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <CardMedia
            component="img"
            image={item.image}
            alt={item.name}
            sx={{
              width: 80,
              height: 80,
              objectFit: 'cover',
              borderRadius: 1,
              flexShrink: 0
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {item.category}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  size="small"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                  sx={{ width: 60, '& input': { textAlign: 'center' } }}
                  inputProps={{ min: 1, type: 'number' }}
                />
                <IconButton
                  size="small"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" color="text.secondary">
                  {item.price.toLocaleString('vi-VN')}đ
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                </Typography>
              </Box>
              
              <IconButton
                color="error"
                onClick={() => removeItem(item.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Typography 
        variant="h4" 
        fontWeight="bold" 
        gutterBottom
        sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}
      >
        Giỏ hàng của bạn
      </Typography>
      
      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} lg={8}>
          {isMobile ? (
            // Mobile View
            <Box>
              {cartItems.map((item) => (
                <MobileCartItem key={item.id} item={item} />
              ))}
            </Box>
          ) : (
            // Desktop View
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sản phẩm</TableCell>
                    <TableCell align="center">Số lượng</TableCell>
                    <TableCell align="right">Giá</TableCell>
                    <TableCell align="right">Tổng</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            component="img"
                            src={item.image}
                            alt={item.name}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 1,
                            }}
                          />
                          <Box>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.category}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <TextField
                            size="small"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            sx={{ width: 60, '& input': { textAlign: 'center' } }}
                            inputProps={{ min: 1, type: 'number' }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {item.price.toLocaleString('vi-VN')}đ
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1" fontWeight="medium">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => removeItem(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handleContinueShopping}
              sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
            >
              Tiếp tục mua sắm
            </Button>
          </Box>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Tóm tắt đơn hàng
              </Typography>
              
              <Stack spacing={1} sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Tạm tính:</Typography>
                  <Typography>{getTotalPrice().toLocaleString('vi-VN')}đ</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Phí vận chuyển:</Typography>
                  <Typography>{getShippingFee().toLocaleString('vi-VN')}đ</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight="bold">
                    Tổng cộng:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {(getTotalPrice() + getShippingFee()).toLocaleString('vi-VN')}đ
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleCheckout}
                sx={{ mb: 2 }}
              >
                Tiến hành đặt hàng
              </Button>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                Miễn phí vận chuyển cho đơn hàng từ 200.000đ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CartPage;
