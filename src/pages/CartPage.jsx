import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../api';

const CartPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      if (response.data && response.data.success) {
        setCartItems(response.data.data.items || []);
      } else {
        setCartItems(response.data.items || []);
      }
    } catch (error) {
      setError('Không thể tải giỏ hàng');
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      await cartAPI.updateCartItem(productId, newQuantity);
      setCartItems(prev => 
        prev.map(item => 
          item.productId._id === productId || item.productId.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating cart item:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeItem = async (productId) => {
    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      await cartAPI.removeFromCart(productId);
      setCartItems(prev => 
        prev.filter(item => 
          item.productId._id !== productId && item.productId.id !== productId
        )
      );
    } catch (error) {
      console.error('Error removing cart item:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.productId.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = subtotal > 500000 ? 0 : 30000; // Free shipping over 500k
  const total = subtotal + shippingFee;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Giỏ hàng trống
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/products')}
          >
            Tiếp tục mua sắm
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Giỏ hàng của bạn
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Bạn có {cartItems.length} sản phẩm trong giỏ hàng
      </Typography>

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 2 }}>
            {!isMobile ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sản phẩm</TableCell>
                      <TableCell align="center">Số lượng</TableCell>
                      <TableCell align="right">Đơn giá</TableCell>
                      <TableCell align="right">Tổng tiền</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cartItems.map((item) => {
                      const product = item.productId;
                      const productId = product._id || product.id;
                      const isUpdating = updating[productId];
                      
                      return (
                        <TableRow key={productId}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CardMedia
                                component="img"
                                sx={{
                                  width: 80,
                                  height: 80,
                                  borderRadius: 1,
                                  mr: 2,
                                }}
                                image={product.images?.[0] || 'https://via.placeholder.com/80'}
                                alt={product.name}
                              />
                              <Box>
                                <Typography variant="body1" fontWeight="medium">
                                  {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {product.category?.name || 'Sản phẩm'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <IconButton
                                size="small"
                                onClick={() => updateQuantity(productId, item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                              >
                                <RemoveIcon />
                              </IconButton>
                              <TextField
                                size="small"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newQuantity = parseInt(e.target.value) || 1;
                                  if (newQuantity > 0) {
                                    updateQuantity(productId, newQuantity);
                                  }
                                }}
                                sx={{ width: 60, mx: 1 }}
                                inputProps={{ min: 1, style: { textAlign: 'center' } }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => updateQuantity(productId, item.quantity + 1)}
                                disabled={isUpdating}
                              >
                                <AddIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1">
                              {product.price?.toLocaleString('vi-VN')}đ
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight="medium">
                              {(product.price * item.quantity).toLocaleString('vi-VN')}đ
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              onClick={() => removeItem(productId)}
                              disabled={isUpdating}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              // Mobile layout
              <Stack spacing={2}>
                {cartItems.map((item) => {
                  const product = item.productId;
                  const productId = product._id || product.id;
                  const isUpdating = updating[productId];
                  
                  return (
                    <Card key={productId} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', mb: 2 }}>
                          <CardMedia
                            component="img"
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 1,
                              mr: 2,
                            }}
                            image={product.images?.[0] || 'https://via.placeholder.com/80'}
                            alt={product.name}
                          />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {product.category?.name || 'Sản phẩm'}
                            </Typography>
                            <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                              {product.price?.toLocaleString('vi-VN')}đ
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(productId, item.quantity - 1)}
                              disabled={isUpdating || item.quantity <= 1}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <TextField
                              size="small"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value) || 1;
                                if (newQuantity > 0) {
                                  updateQuantity(productId, newQuantity);
                                }
                              }}
                              sx={{ width: 60, mx: 1 }}
                              inputProps={{ min: 1, style: { textAlign: 'center' } }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(productId, item.quantity + 1)}
                              disabled={isUpdating}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight="medium" sx={{ mr: 1 }}>
                              {(product.price * item.quantity).toLocaleString('vi-VN')}đ
                            </Typography>
                            <IconButton
                              color="error"
                              onClick={() => removeItem(productId)}
                              disabled={isUpdating}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={clearCart}
                startIcon={<DeleteIcon />}
              >
                Xóa tất cả
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Tóm tắt đơn hàng
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Tạm tính:</Typography>
              <Typography>{subtotal.toLocaleString('vi-VN')}đ</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Phí vận chuyển:</Typography>
              <Typography>
                {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}đ`}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Tổng cộng:</Typography>
              <Typography variant="h6" color="primary">
                {total.toLocaleString('vi-VN')}đ
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{ mb: 2 }}
              onClick={() => navigate('/checkout')}
            >
              Tiến hành đặt hàng
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => navigate('/products')}
            >
              Tiếp tục mua sắm
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;
