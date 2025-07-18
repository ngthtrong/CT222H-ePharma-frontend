import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Container,
  CircularProgress,
  Alert,
} from '@mui/material';
import ProductCard from '../components/ProductCard';
import { productAPI, categoryAPI } from '../services/api';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured products
      const productsResponse = await productAPI.getProducts({ limit: 8, featured: true });
      setFeaturedProducts(productsResponse.data.products || productsResponse.data.slice(0, 8));
      
      // Fetch categories
      const categoriesResponse = await categoryAPI.getCategories();
      setCategories(categoriesResponse.data.slice(0, 6));
      
    } catch (error) {
      setError('Không thể tải dữ liệu trang chủ');
      console.error('Error fetching home page data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ mb: 4 }}>
        <Paper
          sx={{
            height: 400,
            backgroundImage: `url(${heroBanners[0].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h2" component="h1" gutterBottom>
              {heroBanners[0].title}
            </Typography>
            <Typography variant="h5" component="p">
              {heroBanners[0].subtitle}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center">
          Danh mục sản phẩm
        </Typography>
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={6} sm={4} md={2} key={category.id}>
              <Card
                sx={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={category.image || '/api/placeholder/200/200'}
                  alt={category.name}
                />
                <CardContent>
                  <Typography variant="h6" component="div">
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.count || 0} sản phẩm
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center">
          Sản phẩm nổi bật
        </Typography>
        <Grid container spacing={3}>
          {featuredProducts.map((product) => (
            <Grid item xs={6} sm={4} md={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
