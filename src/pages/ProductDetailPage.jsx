import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  IconButton,
  TextField,
  Breadcrumbs,
  Link as MuiLink,
  Tabs,
  Tab,
  Paper,
  Divider,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [mainImage, setMainImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock product data
  const product = {
    id: 1,
    name: 'Paracetamol 500mg - Hộp 100 viên',
    brand: 'Traphaco',
    price: 25000,
    discount: 20,
    inStock: true,
    stockCount: 150,
    images: [
      'https://via.placeholder.com/500x500/ffffff/0D47A1?text=Paracetamol+1',
      'https://via.placeholder.com/500x500/ffffff/f57c00?text=Paracetamol+2',
      'https://via.placeholder.com/500x500/ffffff/2e7d32?text=Paracetamol+3',
      'https://via.placeholder.com/500x500/ffffff/7b1fa2?text=Paracetamol+4',
    ],
    description: `Paracetamol 500mg là thuốc giảm đau, hạ sốt phổ biến và an toàn. 
    Sản phẩm được sản xuất bởi Traphaco - một trong những công ty dược phẩm uy tín hàng đầu Việt Nam.`,
    ingredients: [
      'Paracetamol 500mg',
      'Tá dược: Tinh bột ngô, Povidone K30, Acid stearic, Talc'
    ],
    usage: `
    - Người lớn và trẻ em trên 12 tuổi: 1-2 viên/lần, 3-4 lần/ngày
    - Trẻ em 6-12 tuổi: 1/2 - 1 viên/lần, 3-4 lần/ngày
    - Không quá 4g/ngày (8 viên)
    - Uống sau ăn
    `,
    reviews: [
      {
        id: 1,
        user: 'Nguyễn Văn A',
        rating: 5,
        comment: 'Thuốc rất hiệu quả, giá cả hợp lý',
        date: '2024-01-15'
      },
      {
        id: 2,
        user: 'Trần Thị B',
        rating: 4,
        comment: 'Chất lượng tốt, giao hàng nhanh',
        date: '2024-01-10'
      }
    ]
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const getDiscountedPrice = (price, discount) => {
    return price * (1 - discount / 100);
  };

  const hasDiscount = product.discount && product.discount > 0;
  const finalPrice = hasDiscount ? getDiscountedPrice(product.price, product.discount) : product.price;

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, Math.min(product.stockCount, prev + delta)));
  };

  const handleAddToCart = () => {
    console.log('Thêm vào giỏ hàng:', { product, quantity });
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <MuiLink component={Link} to="/" color="#424242" underline="hover">
            Trang chủ
          </MuiLink>
          <MuiLink component={Link} to="/products" color="#424242" underline="hover">
            Sản phẩm
          </MuiLink>
          <MuiLink component={Link} to="/category/duoc-pham" color="#424242" underline="hover">
            Dược phẩm
          </MuiLink>
          <Typography color="#212121">
            {product.name}
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Cột trái - Hình ảnh sản phẩm */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, backgroundColor: '#fff' }}>
              {/* Ảnh chính */}
              <Box sx={{ mb: 2 }}>
                <img
                  src={product.images[mainImage]}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </Box>
              
              {/* Ảnh thumbnail */}
              <Grid container spacing={1}>
                {product.images.map((image, index) => (
                  <Grid item xs={3} key={index}>
                    <Box
                      onClick={() => setMainImage(index)}
                      sx={{
                        cursor: 'pointer',
                        border: mainImage === index ? '2px solid #0D47A1' : '1px solid #e0e0e0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        '&:hover': {
                          opacity: 0.8
                        }
                      }}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '80px',
                          objectFit: 'cover'
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Cột phải - Thông tin và hành động */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, backgroundColor: '#fff' }}>
              {/* Tên sản phẩm */}
              <Typography variant="h4" gutterBottom color="#212121">
                {product.name}
              </Typography>

              {/* Thương hiệu và tình trạng */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="#424242">
                  Thương hiệu: <strong>{product.brand}</strong>
                </Typography>
                <Typography variant="body2" color={product.inStock ? 'success.main' : 'error.main'}>
                  {product.inStock ? `Còn hàng (${product.stockCount} sản phẩm)` : 'Hết hàng'}
                </Typography>
              </Box>

              {/* Giá */}
              <Box sx={{ mb: 3 }}>
                {hasDiscount ? (
                  <Box>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ textDecoration: 'line-through' }}
                    >
                      {formatPrice(product.price)}
                    </Typography>
                    <Typography variant="h4" color="error" fontWeight="bold">
                      {formatPrice(finalPrice)}
                    </Typography>
                    <Typography variant="body2" color="error">
                      Tiết kiệm {formatPrice(product.price - finalPrice)} (-{product.discount}%)
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {formatPrice(product.price)}
                  </Typography>
                )}
              </Box>

              {/* Bộ chọn số lượng */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom color="#212121">
                  Số lượng:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    sx={{ border: '1px solid #e0e0e0' }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    size="small"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setQuantity(Math.max(1, Math.min(product.stockCount, value)));
                    }}
                    sx={{ width: 80, '& input': { textAlign: 'center' } }}
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stockCount}
                    sx={{ border: '1px solid #e0e0e0' }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Nút hành động */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  sx={{ flexGrow: 1 }}
                >
                  Thêm vào giỏ hàng
                </Button>
                <IconButton
                  size="large"
                  onClick={() => setIsFavorite(!isFavorite)}
                  sx={{ 
                    border: '1px solid #e0e0e0',
                    color: isFavorite ? 'error.main' : 'text.secondary'
                  }}
                >
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Box>

              {/* Thông tin ngắn */}
              <Typography variant="body2" color="#424242">
                {product.description}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Phần thông tin chi tiết */}
        <Paper sx={{ mt: 4, backgroundColor: '#fff' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Mô tả chi tiết" />
            <Tab label="Thành phần" />
            <Tab label="Hướng dẫn sử dụng" />
            <Tab label={`Đánh giá (${product.reviews.length})`} />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <Typography variant="body1" color="#424242" sx={{ lineHeight: 1.8 }}>
              {product.description}
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom color="#212121">
              Thành phần:
            </Typography>
            <ul>
              {product.ingredients.map((ingredient, index) => (
                <li key={index}>
                  <Typography variant="body1" color="#424242">
                    {ingredient}
                  </Typography>
                </li>
              ))}
            </ul>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom color="#212121">
              Cách sử dụng:
            </Typography>
            <Typography variant="body1" color="#424242" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
              {product.usage}
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Box>
              {product.reviews.map((review) => (
                <Box key={review.id} sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" gutterBottom color="#212121">
                    {review.user}
                  </Typography>
                  <Typography variant="body2" color="#424242" paragraph>
                    {review.comment}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {review.date}
                  </Typography>
                </Box>
              ))}
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProductDetailPage;
