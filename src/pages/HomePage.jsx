import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Container,
} from '@mui/material';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  // Mock data for hero banners
  const heroBanners = [
    {
      id: 1,
      image: '/api/placeholder/1200/400',
      title: 'Khuyến mãi lớn cuối năm',
      subtitle: 'Giảm giá lên đến 50% cho tất cả sản phẩm',
    },
    {
      id: 2,
      image: '/api/placeholder/1200/400',
      title: 'Sản phẩm mới về',
      subtitle: 'Bộ sưu tập chăm sóc sức khỏe mới nhất',
    },
  ];

  // Mock data for categories
  const categories = [
    { id: 1, name: 'Dược phẩm', image: '/api/placeholder/200/200', count: 150 },
    { id: 2, name: 'Chăm sóc cá nhân', image: '/api/placeholder/200/200', count: 89 },
    { id: 3, name: 'Thiết bị y tế', image: '/api/placeholder/200/200', count: 45 },
    { id: 4, name: 'Thực phẩm chức năng', image: '/api/placeholder/200/200', count: 78 },
    { id: 5, name: 'Mẹ và bé', image: '/api/placeholder/200/200', count: 112 },
    { id: 6, name: 'Làm đẹp', image: '/api/placeholder/200/200', count: 67 },
  ];

  // Mock data for featured products
  const featuredProducts = [
    {
      id: 1,
      name: 'Paracetamol 500mg - Hộp 20 viên',
      price: 15000,
      originalPrice: 20000,
      image: '/api/placeholder/300/200',
    },
    {
      id: 2,
      name: 'Vitamin C 1000mg - Chai 60 viên',
      price: 120000,
      image: '/api/placeholder/300/200',
    },
    {
      id: 3,
      name: 'Thuốc cảm cúm 999 - Hộp 10 gói',
      price: 45000,
      originalPrice: 55000,
      image: '/api/placeholder/300/200',
    },
    {
      id: 4,
      name: 'Khẩu trang y tế 4 lớp - Hộp 50 chiếc',
      price: 85000,
      image: '/api/placeholder/300/200',
    },
  ];

  const bestSellingProducts = [
    {
      id: 5,
      name: 'Dầu gội đầu Clear Men - Chai 650ml',
      price: 159000,
      originalPrice: 189000,
      image: '/api/placeholder/300/200',
    },
    {
      id: 6,
      name: 'Kem đánh răng Colgate - Tuýp 200g',
      price: 45000,
      image: '/api/placeholder/300/200',
    },
    {
      id: 7,
      name: 'Sữa rửa mặt Cetaphil - Chai 125ml',
      price: 249000,
      image: '/api/placeholder/300/200',
    },
    {
      id: 8,
      name: 'Nhiệt kế điện tử Omron - 1 chiếc',
      price: 350000,
      originalPrice: 420000,
      image: '/api/placeholder/300/200',
    },
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box sx={{ mb: { xs: 3, md: 4 }, mx: { xs: -1, sm: -2, md: -3 } }}>
        <Paper
          sx={{
            height: { xs: 250, sm: 300, md: 400 },
            backgroundImage: `url(${heroBanners[0].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            borderRadius: 0,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1, px: 2 }}>
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              gutterBottom
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
              }}
            >
              {heroBanners[0].title}
            </Typography>
            <Typography 
              variant="h5"
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
              }}
            >
              {heroBanners[0].subtitle}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Categories Section */}
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          gutterBottom 
          sx={{ 
            mb: 3, 
            textAlign: 'center',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          Danh mục nổi bật
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {categories.map((category) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={category.id}>
              <Card
                sx={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="120"
                  image={category.image}
                  alt={category.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography 
                    variant="body1" 
                    fontWeight="medium" 
                    gutterBottom
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    {category.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    {category.count} sản phẩm
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Featured Products Section */}
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          gutterBottom 
          sx={{ 
            mb: 3,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          Khuyến mãi hot
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {featuredProducts.map((product) => (
            <Grid item xs={6} sm={4} md={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Best Selling Products Section */}
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          gutterBottom 
          sx={{ 
            mb: 3,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          Bán chạy nhất
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {bestSellingProducts.map((product) => (
            <Grid item xs={6} sm={4} md={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default HomePage;
