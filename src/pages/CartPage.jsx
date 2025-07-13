import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  IconButton,
  TextField,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Paper,
} from '@mui/material';
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Paracetamol 500mg - Hộp 100 viên',
      price: 20000, // Giá sau giảm
      originalPrice: 25000,
      discount: 20,
      image: 'https://via.placeholder.com/80x80/ffffff/0D47A1?text=P',
      quantity: 2,
      inStock: true,
    },
    {
      id: 2,
      name: 'Vitamin C 1000mg - Chai 60 viên',
      price: 127500,
      originalPrice: 150000,
      discount: 15,
      image: 'https://via.placeholder.com/80x80/ffffff/f57c00?text=V',
      quantity: 1,
      inStock: true,
    },
    {
      id: 3,
      name: 'Kem chống nắng SPF50+ - Tuýp 50ml',
      price: 240000,
      originalPrice: 320000,
      discount: 25,
      image: 'https://via.placeholder.com/80x80/ffffff/7b1fa2?text=K',
      quantity: 1,
      inStock: true,
    }
  ]);

  const shippingFee = 25000;
  const freeShippingThreshold = 300000;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const currentShippingFee = subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const total = subtotal + currentShippingFee;
  const totalSavings = cartItems.reduce((sum, item) => {
    const savings = (item.originalPrice - item.price) * item.quantity;
    return sum + savings;
  }, 0);

  return (
    <Box sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom color="#212121">
          Giỏ hàng của bạn
        </Typography>

        {cartItems.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: '#fff' }}>
            <ShoppingCartIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="#424242" gutterBottom>
              Giỏ hàng của bạn đang trống
            </Typography>
            <Typography variant="body2" color="#424242" paragraph>
              Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/products"
              startIcon={<ShoppingCartIcon />}
            >
              Tiếp tục mua sắm
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {/* Cột trái - Danh sách sản phẩm */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ backgroundColor: '#fff' }}>
                <List>
                  {cartItems.map((item, index) => (
                    <Box key={item.id}>
                      <ListItem sx={{ py: 2, px: 3 }}>
                        <ListItemAvatar>
                          <Avatar
                            src={item.image}
                            alt={item.name}
                            variant="rounded"
                            sx={{ width: 80, height: 80, mr: 2 }}
                          />
                        </ListItemAvatar>
                        
                        <ListItemText
                          primary={
                            <Typography variant="h6" color="#212121">
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              {/* Giá */}
                              <Box sx={{ mb: 2 }}>
                                {item.discount > 0 ? (
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ textDecoration: 'line-through' }}
                                    >
                                      {formatPrice(item.originalPrice)}
                                    </Typography>
                                    <Typography variant="h6" color="error" fontWeight="medium">
                                      {formatPrice(item.price)}
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography variant="h6" color="primary">
                                    {formatPrice(item.price)}
                                  </Typography>
                                )}
                              </Box>

                              {/* Bộ chọn số lượng */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  sx={{ border: '1px solid #e0e0e0' }}
                                >
                                  <RemoveIcon />
                                </IconButton>
                                <TextField
                                  size="small"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 1;
                                    updateQuantity(item.id, value);
                                  }}
                                  sx={{ width: 60, '& input': { textAlign: 'center' } }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  sx={{ border: '1px solid #e0e0e0' }}
                                >
                                  <AddIcon />
                                </IconButton>
                              </Box>

                              <Typography variant="body2" color="#424242">
                                Thành tiền: <strong>{formatPrice(item.price * item.quantity)}</strong>
                              </Typography>
                            </Box>
                          }
                        />

                        {/* Nút xóa */}
                        <IconButton
                          onClick={() => removeItem(item.id)}
                          color="error"
                          sx={{ ml: 2 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                      {index < cartItems.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Cột phải - Tóm tắt đơn hàng */}
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  position: 'sticky', 
                  top: 20,
                  backgroundColor: '#fff'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom color="#212121">
                    Tóm tắt đơn hàng
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="#424242">
                        Tạm tính ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm):
                      </Typography>
                      <Typography variant="body2" color="#424242">
                        {formatPrice(subtotal)}
                      </Typography>
                    </Box>

                    {totalSavings > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="success.main">
                          Tiết kiệm:
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          -{formatPrice(totalSavings)}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="#424242">
                        Phí vận chuyển:
                      </Typography>
                      <Typography variant="body2" color={currentShippingFee === 0 ? "success.main" : "#424242"}>
                        {currentShippingFee === 0 ? 'Miễn phí' : formatPrice(currentShippingFee)}
                      </Typography>
                    </Box>

                    {subtotal < freeShippingThreshold && (
                      <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
                        Mua thêm {formatPrice(freeShippingThreshold - subtotal)} để được miễn phí vận chuyển
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" color="#212121">
                      Tổng cộng:
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {formatPrice(total)}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    sx={{ mb: 2 }}
                  >
                    Tiến hành đặt hàng
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    component={Link}
                    to="/products"
                  >
                    Tiếp tục mua sắm
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default CartPage;
