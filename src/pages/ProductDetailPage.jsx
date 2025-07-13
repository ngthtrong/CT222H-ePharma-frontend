import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  IconButton,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Rating,
  Chip,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  AddShoppingCart as AddShoppingCartIcon,
  FavoriteBorder as FavoriteBorderIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';

const ProductDetailPage = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);

  // Mock product data
  const product = {
    id: 1,
    name: 'Paracetamol 500mg - Hộp 20 viên',
    brand: 'Abbott',
    price: 15000,
    originalPrice: 20000,
    inStock: true,
    stockCount: 50,
    rating: 4.5,
    reviewCount: 234,
    images: [
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
    ],
    description: 'Thuốc giảm đau, hạ sốt hiệu quả. Thành phần chính là Paracetamol 500mg.',
    ingredients: 'Paracetamol 500mg, Tá dược vừa đủ',
    instructions: 'Uống 1-2 viên mỗi lần, cách 4-6 giờ. Không quá 8 viên trong 24 giờ.',
    specifications: {
      'Dạng bào chế': 'Viên nén',
      'Quy cách đóng gói': 'Hộp 2 vỉ x 10 viên',
      'Xuất xứ': 'Việt Nam',
      'Hạn sử dụng': '36 tháng',
    },
  };

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    console.log('Added to cart:', { productId: product.id, quantity });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link color="inherit" href="/">
          Trang chủ
        </Link>
        <Link color="inherit" href="/products">
          Sản phẩm
        </Link>
        <Typography color="text.primary">
          {product.name}
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Left Column - Images */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {product.images.map((image, index) => (
              <Box
                key={index}
                onClick={() => setSelectedImage(index)}
                sx={{
                  cursor: 'pointer',
                  border: selectedImage === index ? '2px solid' : '1px solid',
                  borderColor: selectedImage === index ? 'primary.main' : 'grey.300',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Right Column - Product Info */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {product.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Thương hiệu: {product.brand}
            </Typography>
            <Chip
              label={product.inStock ? 'Còn hàng' : 'Hết hàng'}
              color={product.inStock ? 'success' : 'error'}
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Rating value={product.rating} precision={0.1} readOnly />
            <Typography variant="body2" color="text.secondary">
              ({product.reviewCount} đánh giá)
            </Typography>
          </Box>

          {/* Price */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" color="error" fontWeight="bold">
              {product.price.toLocaleString('vi-VN')}đ
            </Typography>
            {product.originalPrice && (
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
              >
                {product.originalPrice.toLocaleString('vi-VN')}đ
              </Typography>
            )}
          </Box>

          {/* Quantity Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant="body1" fontWeight="medium">
              Số lượng:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
              <IconButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                <RemoveIcon />
              </IconButton>
              <TextField
                value={quantity}
                size="small"
                sx={{
                  width: '60px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { border: 'none' },
                  },
                  '& input': { textAlign: 'center' },
                }}
              />
              <IconButton onClick={() => handleQuantityChange(1)}>
                <AddIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary">
              ({product.stockCount} sản phẩm có sẵn)
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddShoppingCartIcon />}
              onClick={handleAddToCart}
              disabled={!product.inStock}
              sx={{ flex: 1 }}
            >
              Thêm vào giỏ hàng
            </Button>
            <IconButton
              size="large"
              sx={{ border: 1, borderColor: 'grey.300' }}
            >
              <FavoriteBorderIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      {/* Product Details Tabs */}
      <Paper sx={{ mt: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Mô tả chi tiết" />
          <Tab label="Thành phần" />
          <Tab label="Hướng dẫn sử dụng" />
          <Tab label="Thông số kỹ thuật" />
          <Tab label={`Đánh giá (${product.reviewCount})`} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Typography variant="body1">
              {product.description}
            </Typography>
          )}
          {activeTab === 1 && (
            <Typography variant="body1">
              {product.ingredients}
            </Typography>
          )}
          {activeTab === 2 && (
            <Typography variant="body1">
              {product.instructions}
            </Typography>
          )}
          {activeTab === 3 && (
            <Box>
              {Object.entries(product.specifications).map(([key, value]) => (
                <Box key={key} sx={{ display: 'flex', py: 1, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ minWidth: 150 }}>
                    {key}:
                  </Typography>
                  <Typography variant="body2">{value}</Typography>
                </Box>
              ))}
            </Box>
          )}
          {activeTab === 4 && (
            <Typography variant="body1">
              Phần đánh giá sẽ được bổ sung sau...
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductDetailPage;
