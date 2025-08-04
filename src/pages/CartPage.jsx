import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { getImageSrc, handleImageError } from '../utils/imageUtils';
import { formatCurrency, createSlug } from '../utils/formatters';

const CartPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user } = useAuth();
  
  const { 
    items: cartItems, 
    totalItems, 
    totalAmount, 
    loading, 
    error, 
    updateCartItem, 
    removeFromCart,
    clearCart,
    fetchCart
  } = useCart();

  const [updateLoading, setUpdateLoading] = useState({});
  const [quantities, setQuantities] = useState({});

  // Initialize quantities from cart items
  useEffect(() => {
    const newQuantities = {};
    cartItems.forEach(item => {
      newQuantities[item.productId] = item.quantity;
    });
    setQuantities(newQuantities);
  }, [cartItems]);

  // Handle quantity change
  const handleQuantityChange = (productId, newQuantity) => {
    const quantity = Math.max(1, parseInt(newQuantity) || 1);
    setQuantities(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  // Update cart item quantity
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdateLoading(prev => ({ ...prev, [productId]: true }));
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdateLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (productId) => {
    try {
      setUpdateLoading(prev => ({ ...prev, [productId]: true }));
      await removeFromCart(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setUpdateLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
  };

  // Continue shopping
  const handleContinueShopping = () => {
    navigate('/products');
  };

  // Proceed to checkout
  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    navigate('/checkout');
  };

  // Loading state
  if (loading && cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Empty cart state
  if (!loading && cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Giỏ hàng trống
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </Typography>
          <Button
            variant="contained"
            startIcon={<ShoppingBagIcon />}
            onClick={handleContinueShopping}
            size="large"
          >
            Tiếp tục mua sắm
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Giỏ hàng
          </Typography>
          <Chip 
            label={`${totalItems} sản phẩm`} 
            color="primary" 
            variant="outlined"
          />
        </Stack>
        
        {/* User info */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {isAuthenticated ? (
              <>Đăng nhập với: <strong>{user?.email}</strong></>
            ) : (
              <>Giỏ hàng khách - <Button size="small" onClick={() => navigate('/login')}>Đăng nhập</Button></>
            )}
          </Typography>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6">
                Sản phẩm trong giỏ hàng
              </Typography>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={handleClearCart}
                disabled={loading}
              >
                Xóa tất cả
              </Button>
            </Stack>

            <Stack spacing={2}>
              {cartItems.map((item) => (
                <Card key={item.productId} variant="outlined">
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      {/* Product Image */}
                      <Grid item xs={12} sm={3}>
                        <Link
                          to={`/product/${item.productSlug || createSlug(item.productName)}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <CardMedia
                            component="img"
                            sx={{ 
                              width: '100%', 
                              height: 120, 
                              objectFit: 'cover',
                              borderRadius: 1,
                              cursor: 'pointer',
                              transition: 'transform 0.2s ease',
                              '&:hover': {
                                transform: 'scale(1.05)'
                              }
                            }}
                            src={getImageSrc(item.productImage)}
                            alt={item.productName}
                            onError={handleImageError}
                          />
                        </Link>
                      </Grid>

                      {/* Product Info */}
                      <Grid item xs={12} sm={4}>
                        <Link
                          to={`/product/${item.productSlug || createSlug(item.productName)}`}
                          style={{ 
                            textDecoration: 'none', 
                            color: 'inherit',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                color: 'primary.main',
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {item.productName}
                          </Typography>
                        </Link>
                        <Typography variant="body2" color="text.secondary">
                          ID: {item.productId}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {item.discountedPrice && item.discountedPrice < item.productPrice ? (
                            <>
                              <Typography variant="h6" color="primary">
                                {formatCurrency(item.discountedPrice)}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ textDecoration: 'line-through' }}
                                color="text.secondary"
                              >
                                {formatCurrency(item.productPrice)}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="h6" color="primary">
                              {formatCurrency(item.productPrice)}
                            </Typography>
                          )}
                        </Box>
                      </Grid>

                      {/* Quantity Controls */}
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2" gutterBottom>
                          Số lượng
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newQty = Math.max(1, quantities[item.productId] - 1);
                              handleQuantityChange(item.productId, newQty);
                              handleUpdateQuantity(item.productId, newQty);
                            }}
                            disabled={updateLoading[item.productId] || quantities[item.productId] <= 1}
                          >
                            <RemoveIcon />
                          </IconButton>
                          
                          <TextField
                            type="number"
                            value={quantities[item.productId] || item.quantity}
                            onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                            onBlur={(e) => {
                              const newQty = Math.max(1, parseInt(e.target.value) || 1);
                              if (newQty !== item.quantity) {
                                handleUpdateQuantity(item.productId, newQty);
                              }
                            }}
                            size="small"
                            sx={{ width: 80 }}
                            inputProps={{ min: 1, style: { textAlign: 'center' } }}
                            disabled={updateLoading[item.productId]}
                          />
                          
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newQty = quantities[item.productId] + 1;
                              handleQuantityChange(item.productId, newQty);
                              handleUpdateQuantity(item.productId, newQty);
                            }}
                            disabled={updateLoading[item.productId]}
                          >
                            <AddIcon />
                          </IconButton>
                        </Stack>
                      </Grid>

                      {/* Subtotal & Actions */}
                      <Grid item xs={12} sm={2}>
                        <Stack alignItems="flex-end" spacing={1}>
                          <Typography variant="h6" color="primary">
                            {formatCurrency(item.subtotal)}
                          </Typography>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleRemoveItem(item.productId)}
                            disabled={updateLoading[item.productId]}
                          >
                            {updateLoading[item.productId] ? (
                              <CircularProgress size={20} />
                            ) : (
                              <DeleteIcon />
                            )}
                          </IconButton>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Tóm tắt đơn hàng
            </Typography>
            
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Số lượng sản phẩm:</Typography>
                <Typography>{totalItems}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Tạm tính:</Typography>
                <Typography>{formatCurrency(totalAmount)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Phí vận chuyển:</Typography>
                <Typography color="success.main">Miễn phí</Typography>
              </Box>
              
              <Divider />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Tổng cộng:</Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(totalAmount)}
                </Typography>
              </Box>
              
              <Stack spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0}
                >
                  {isAuthenticated ? 'Thanh toán' : 'Đăng nhập để thanh toán'}
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={handleContinueShopping}
                >
                  Tiếp tục mua sắm
                </Button>
              </Stack>

              {/* Authentication reminder */}
              {!isAuthenticated && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Đăng nhập để lưu giỏ hàng và theo dõi đơn hàng của bạn
                </Alert>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;
