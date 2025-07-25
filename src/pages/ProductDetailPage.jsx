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
  NavigateBefore as NavigateBeforeIcon,
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

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? (images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === (images?.length || 1) - 1 ? 0 : prev + 1
    );
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
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            alignItems: 'flex-start'
          }}
        >
          {/* Left Column: Product Images (40%) */}
          <Box 
            sx={{ 
              width: { xs: '100%', md: '40%' },
              flexShrink: 0
            }}
          >
            <Box sx={{ mb: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
              <img
                src={getImageSrc(images?.[selectedImageIndex], 400, 400)}
                alt={`${name} - view ${selectedImageIndex + 1}`}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                onError={handleImageError}
              />
              
              {/* Navigation Arrows - only show if more than 1 image */}
              {images && images.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePrevImage}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: 8,
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                      boxShadow: 1,
                    }}
                    size="small"
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                  
                  <IconButton
                    onClick={handleNextImage}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      right: 8,
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                      boxShadow: 1,
                    }}
                    size="small"
                  >
                    <NavigateNextIcon />
                  </IconButton>
                  
                  {/* Image counter */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                    }}
                  >
                    {selectedImageIndex + 1} / {images.length}
                  </Box>
                </>
              )}
            </Box>
            
            {/* Thumbnail Carousel */}
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 1, 
                overflowX: 'auto',
                paddingBottom: 1,
                '&::-webkit-scrollbar': {
                  height: 6,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'grey.200',
                  borderRadius: 3,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'grey.400',
                  borderRadius: 3,
                  '&:hover': {
                    backgroundColor: 'grey.500',
                  },
                },
              }}
            >
              {images?.map((img, index) => (
                <Box
                  key={index}
                  component="img"
                  src={img}
                  alt={`${name} thumbnail ${index + 1}`}
                  onClick={() => setSelectedImageIndex(index)}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: index === selectedImageIndex 
                      ? `2px solid ${theme.palette.primary.main}` 
                      : `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.light,
                      transform: 'scale(1.05)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Right Column: Product Info & Actions (60%) */}
          <Box 
            sx={{ 
              width: { xs: '100%', md: '60%' },
              flex: 1
            }}
          >
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
              <Link underline="hover" color="inherit" href="/">Trang chủ</Link>
              <Link underline="hover" color="inherit" href="/products">Sản phẩm</Link>
              <Typography color="text.primary">{name}</Typography>
            </Breadcrumbs>

            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" component="span">
                Mã SKU: <strong>{product.sku || product._id}</strong>
              </Typography>
              <Divider orientation="vertical" flexItem />
              <Typography variant="body2" component="span">
                Thương hiệu: <Link href="#" underline="hover">{brand || 'N/A'}</Link>
              </Typography>
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

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>Số lượng:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  onClick={handleDecrement} 
                  size="small"
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`, 
                    borderRadius: '4px 0 0 4px',
                    borderRight: 'none'
                  }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <TextField
                  value={quantity}
                  onChange={handleQuantityChange}
                  size="small"
                  inputProps={{ 
                    style: { textAlign: 'center', width: 60, height: 20 },
                    min: 1
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 0,
                      '& fieldset': { 
                        borderLeft: 'none',
                        borderRight: 'none'
                      } 
                    } 
                  }}
                />
                <IconButton 
                  onClick={handleIncrement} 
                  size="small"
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`, 
                    borderRadius: '0 4px 4px 0',
                    borderLeft: 'none'
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Button
              variant="contained"
              size="large"
              startIcon={<AddShoppingCartIcon />}
              onClick={handleAddToCart}
              disabled={stockQuantity === 0}
              sx={{ 
                mt: 2, 
                mb: 3, 
                width: { xs: '100%', sm: '300px' }, 
                height: 48,
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              Thêm vào giỏ hàng
            </Button>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mt: 2, backgroundColor: 'grey.50' }}>
              <Typography sx={{ display: 'flex', alignItems: 'center', mb: 1, fontSize: '0.9rem' }}>
                <CheckCircleOutlineIcon color="success" sx={{ mr: 1, fontSize: '1.2rem' }} /> 
                Cam kết chính hãng 100%
              </Typography>
              <Typography sx={{ display: 'flex', alignItems: 'center', mb: 1, fontSize: '0.9rem' }}>
                <CheckCircleOutlineIcon color="success" sx={{ mr: 1, fontSize: '1.2rem' }} /> 
                Giao hàng nhanh toàn quốc
              </Typography>
              <Typography sx={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                <CheckCircleOutlineIcon color="success" sx={{ mr: 1, fontSize: '1.2rem' }} /> 
                Đổi trả trong 30 ngày
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Bottom Section: Detailed Info (Full Width) */}
        <Box sx={{ mt: 6 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            indicatorColor="primary" 
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Mô tả sản phẩm" sx={{ fontWeight: 500 }} />
            <Tab label="Thành phần" sx={{ fontWeight: 500 }} />
            <Tab label="Hướng dẫn sử dụng" sx={{ fontWeight: 500 }} />
            <Tab label="Đánh giá của khách hàng" sx={{ fontWeight: 500 }} />
          </Tabs>
          <Paper variant="outlined" sx={{ p: 4, mt: 0, borderRadius: '0 0 8px 8px', borderTop: 'none', minHeight: 200 }}>
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Mô tả sản phẩm
                </Typography>
                <Typography sx={{ lineHeight: 1.7, fontSize: '1rem' }}>
                  {description || 'Chưa có mô tả cho sản phẩm này.'}
                </Typography>
              </Box>
            )}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Thành phần
                </Typography>
                <Typography sx={{ lineHeight: 1.7, fontSize: '1rem' }}>
                  {components || 'Thông tin thành phần chưa được cập nhật.'}
                </Typography>
              </Box>
            )}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Hướng dẫn sử dụng
                </Typography>
                <Typography sx={{ lineHeight: 1.7, fontSize: '1rem' }}>
                  {usageGuide || 'Hướng dẫn sử dụng chưa được cập nhật.'}
                </Typography>
              </Box>
            )}
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Đánh giá của khách hàng
                </Typography>
                <Typography sx={{ lineHeight: 1.7, fontSize: '1rem', fontStyle: 'italic', color: 'text.secondary' }}>
                  Tính năng đánh giá đang được phát triển. Sẽ sớm có mặt để bạn có thể xem và chia sẻ trải nghiệm về sản phẩm.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProductDetailPage;
