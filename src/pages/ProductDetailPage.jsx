import React, { useState, useEffect } from 'react';
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
  Chip,
  TextField,
  CircularProgress,
  Alert,
  Container,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  AddShoppingCart as AddShoppingCartIcon,
  FavoriteBorder as FavoriteBorderIcon,
  NavigateNext as NavigateNextIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { productAPI } from '../api';
import { useCart } from '../contexts/CartContext';
import { getImageSrc, handleImageError } from '../utils/imageUtils';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const theme = useTheme();
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getProductBySlug(slug);
        const productData = response.data?.data || response.data;
        setProduct(productData);
        if (productData?.images?.length > 0) {
          setSelectedImageIndex(0);
        }
      } catch (error) {
        setError('Không thể tải thông tin sản phẩm.');
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product._id, quantity);
      // Optionally, show a success notification
    } catch (err) {
      console.error("Failed to add to cart", err);
      // Optionally, show an error notification
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Sản phẩm không tồn tại.'}</Alert>
      </Container>
    );
  }

  const { name, images, price, discountPercent, stockQuantity, brand, description, components, usageGuide } = product;
  const hasDiscount = discountPercent && discountPercent > 0;
  const discountedPrice = hasDiscount ? price * (1 - discountPercent / 100) : price;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Grid container spacing={4}>
          {/* Left Column: Product Images */}
          <Grid item xs={12} md={5}>
            <Box sx={{ mb: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
              <img
                src={getImageSrc(images?.[selectedImageIndex], 400, 400)}
                alt={`${name} - view ${selectedImageIndex + 1}`}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                onError={handleImageError}
              />
            </Box>
            <Grid container spacing={1}>
              {images?.map((img, index) => (
                <Grid item xs={3} key={index}>
                  <Box
                    component="img"
                    src={img}
                    alt={`${name} thumbnail ${index + 1}`}
                    onClick={() => setSelectedImageIndex(index)}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 1,
                      border: index === selectedImageIndex ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Right Column: Product Info & Actions */}
          <Grid item xs={12} md={7}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
              <Link underline="hover" color="inherit" href="/">Trang chủ</Link>
              <Link underline="hover" color="inherit" href="/products">Sản phẩm</Link>
              <Typography color="text.primary">{name}</Typography>
            </Breadcrumbs>

            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body2" component="span">Thương hiệu: <Link href="#" underline="hover">{brand || 'N/A'}</Link></Typography>
              <Divider orientation="vertical" flexItem />
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" component="span">Tình trạng:</Typography>
                <Chip label={stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'} color={stockQuantity > 0 ? 'success' : 'error'} size="small" />
              </Box>
            </Box>

            <Box sx={{ my: 2 }}>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountedPrice)}
              </Typography>
              {hasDiscount && (
                <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
              <Typography>Số lượng:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <IconButton onClick={handleDecrement} size="small"><RemoveIcon /></IconButton>
                <TextField
                  value={quantity}
                  onChange={handleQuantityChange}
                  size="small"
                  inputProps={{ style: { textAlign: 'center', width: 40 }, readOnly: true }}
                  sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } } }}
                />
                <IconButton onClick={handleIncrement} size="small"><AddIcon /></IconButton>
              </Box>
            </Box>

            <Button
              variant="contained"
              size="large"
              startIcon={<AddShoppingCartIcon />}
              onClick={handleAddToCart}
              disabled={stockQuantity === 0}
              sx={{ mt: 2, mb: 2, width: { xs: '100%', sm: 'auto' } }}
            >
              Thêm vào giỏ hàng
            </Button>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mt: 2 }}>
              <Typography sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} /> Cam kết chính hãng 100%</Typography>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}><CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} /> Giao hàng nhanh toàn quốc</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Bottom Section: Detailed Info */}
        <Box sx={{ mt: 5 }}>
          <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
            <Tab label="Mô tả sản phẩm" />
            <Tab label="Thành phần" />
            <Tab label="Hướng dẫn sử dụng" />
            <Tab label="Đánh giá" />
          </Tabs>
          <Paper variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 2 }}>
            {activeTab === 0 && <Typography>{description || 'Chưa có mô tả cho sản phẩm này.'}</Typography>}
            {activeTab === 1 && <Typography>{components || 'Thông tin thành phần chưa được cập nhật.'}</Typography>}
            {activeTab === 2 && <Typography>{usageGuide || 'Hướng dẫn sử dụng chưa được cập nhật.'}</Typography>}
            {activeTab === 3 && <Typography>Tính năng đánh giá đang được phát triển.</Typography>}
          </Paper>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProductDetailPage;
