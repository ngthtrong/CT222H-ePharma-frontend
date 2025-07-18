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
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import ProductCard from '../components/ProductCard';
import { productAPI, categoryAPI } from '../api';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data...');
      
      // Fetch all products first
      const productsResponse = await productAPI.getProducts({ limit: 24 });
      console.log('Products response:', productsResponse.data);
      
      let allProducts = [];
      if (productsResponse.data) {
        // Handle different response structures
        if (productsResponse.data.success) {
          allProducts = productsResponse.data.data || [];
        } else if (productsResponse.data.data) {
          allProducts = productsResponse.data.data || [];
        } else if (Array.isArray(productsResponse.data)) {
          allProducts = productsResponse.data;
        } else {
          allProducts = productsResponse.data.products || [];
        }
      }
      
      console.log('All products:', allProducts);
      
      // Distribute products into different categories
      setFeaturedProducts(allProducts.slice(0, 8));
      setDiscountedProducts(allProducts.slice(8, 16));
      setBestSellingProducts(allProducts.slice(16, 24));
      
      // Fetch categories
      try {
        const categoriesResponse = await categoryAPI.getCategories();
        console.log('Categories response:', categoriesResponse.data);
        
        let allCategories = [];
        if (categoriesResponse.data) {
          if (categoriesResponse.data.success) {
            allCategories = categoriesResponse.data.data || [];
          } else if (categoriesResponse.data.data) {
            allCategories = categoriesResponse.data.data || [];
          } else if (Array.isArray(categoriesResponse.data)) {
            allCategories = categoriesResponse.data;
          }
        }
        
        setCategories(allCategories.slice(0, 6));
      } catch (catError) {
        console.error('Error fetching categories:', catError);
        // Don't fail the whole page if categories fail
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Không thể tải dữ liệu trang chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Carousel settings
  const heroCarouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
  };

  const productSliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  // Mock data for hero banners
  const heroBanners = [
    {
      id: 1,
      image: 'https://via.placeholder.com/1200x400/0D47A1/FFFFFF?text=Khuyen+mai+lon+cuoi+nam',
      title: 'Khuyến mãi lớn cuối năm',
      subtitle: 'Giảm giá lên đến 50% cho tất cả sản phẩm',
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/1200x400/2E7D32/FFFFFF?text=San+pham+moi+ve',
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
        <Button onClick={fetchData} sx={{ ml: 2 }}>
          Thử lại
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Hero Section - Banner Carousel */}
      <Box sx={{ mb: 4 }}>
        <Slider {...heroCarouselSettings}>
          {heroBanners.map((banner) => (
            <Box key={banner.id}>
              <Paper
                sx={{
                  height: { xs: 250, md: 400 },
                  backgroundImage: `url(${banner.image})`,
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
                <Box sx={{ position: 'relative', zIndex: 1, p: 2 }}>
                  <Typography 
                    variant="h2" 
                    component="h1" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '2rem', md: '3rem' },
                      fontWeight: 'bold'
                    }}
                  >
                    {banner.title}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    component="p"
                    sx={{ 
                      fontSize: { xs: '1rem', md: '1.5rem' }
                    }}
                  >
                    {banner.subtitle}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          ))}
        </Slider>
      </Box>

      {/* Categories Section */}
      {categories.length > 0 && (
        <Container maxWidth="lg" sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            textAlign="center"
            sx={{ mb: 4 }}
          >
            Danh mục nổi bật
          </Typography>
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid item xs={6} sm={4} md={2} key={category._id || category.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onClick={() => navigate(`/category/${category.slug || category._id}`)}
                >
                  <CardMedia
                    component="img"
                    height="120"
                    image={category.image || 'https://via.placeholder.com/200x120/e3f2fd/1976d2?text=Category'}
                    alt={category.name}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2" textAlign="center" fontWeight="medium">
                      {category.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {/* Product Sliders */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom 
              sx={{ mb: 3 }}
            >
              Sản phẩm nổi bật
            </Typography>
            {featuredProducts.length <= 4 ? (
              <Grid container spacing={2}>
                {featuredProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={3} key={product._id || product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Slider {...productSliderSettings}>
                {featuredProducts.map((product) => (
                  <Box key={product._id || product.id} sx={{ px: 1 }}>
                    <ProductCard product={product} />
                  </Box>
                ))}
              </Slider>
            )}
          </Box>
        )}

        {/* Discounted Products */}
        {discountedProducts.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom 
              sx={{ mb: 3 }}
            >
              Khuyến mãi hot
            </Typography>
            {discountedProducts.length <= 4 ? (
              <Grid container spacing={2}>
                {discountedProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={3} key={product._id || product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Slider {...productSliderSettings}>
                {discountedProducts.map((product) => (
                  <Box key={product._id || product.id} sx={{ px: 1 }}>
                    <ProductCard product={product} />
                  </Box>
                ))}
              </Slider>
            )}
          </Box>
        )}

        {/* Best Selling Products */}
        {bestSellingProducts.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom 
              sx={{ mb: 3 }}
            >
              Bán chạy nhất
            </Typography>
            {bestSellingProducts.length <= 4 ? (
              <Grid container spacing={2}>
                {bestSellingProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={3} key={product._id || product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Slider {...productSliderSettings}>
                {bestSellingProducts.map((product) => (
                  <Box key={product._id || product.id} sx={{ px: 1 }}>
                    <ProductCard product={product} />
                  </Box>
                ))}
              </Slider>
            )}
          </Box>
        )}

        {/* Fallback when no products */}
        {featuredProducts.length === 0 && discountedProducts.length === 0 && bestSellingProducts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" gutterBottom>
              Chưa có sản phẩm nào
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Hệ thống đang cập nhật sản phẩm mới
            </Typography>
            <Button
              variant="contained"
              onClick={fetchData}
            >
              Tải lại
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;
