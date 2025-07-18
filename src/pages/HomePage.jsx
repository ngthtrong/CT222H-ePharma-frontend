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
      
      // Fetch featured products
      const productsResponse = await productAPI.getProducts({ limit: 8, featured: true });
      if (productsResponse.data && productsResponse.data.success) {
        setFeaturedProducts(productsResponse.data.data.slice(0, 8));
      } else {
        setFeaturedProducts(productsResponse.data.products || productsResponse.data.slice(0, 8));
      }
      
      // Fetch discounted products
      const discountedResponse = await productAPI.getProducts({ limit: 8, discounted: true });
      if (discountedResponse.data && discountedResponse.data.success) {
        setDiscountedProducts(discountedResponse.data.data.slice(0, 8));
      } else {
        setDiscountedProducts(discountedResponse.data.products || discountedResponse.data.slice(0, 8));
      }
      
      // Fetch best selling products
      const bestSellingResponse = await productAPI.getProducts({ limit: 8, bestSelling: true });
      if (bestSellingResponse.data && bestSellingResponse.data.success) {
        setBestSellingProducts(bestSellingResponse.data.data.slice(0, 8));
      } else {
        setBestSellingProducts(bestSellingResponse.data.products || bestSellingResponse.data.slice(0, 8));
      }
      
      // Fetch categories
      const categoriesResponse = await categoryAPI.getCategories();
      if (categoriesResponse.data && categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.data.slice(0, 6));
      } else {
        setCategories(categoriesResponse.data.slice(0, 6));
      }
      
    } catch (error) {
      setError('Không thể tải dữ liệu trang chủ');
      console.error('Error fetching home page data:', error);
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
    infinite: true,
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
                  height: 400,
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
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h2" component="h1" gutterBottom>
                    {banner.title}
                  </Typography>
                  <Typography variant="h5" component="p">
                    {banner.subtitle}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          ))}
        </Slider>
      </Box>

      {/* Categories Section */}
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

      {/* Product Sliders */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        {/* Hot Deals Slider */}
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
            <Slider {...productSliderSettings}>
              {discountedProducts.map((product) => (
                <Box key={product._id || product.id} sx={{ px: 1 }}>
                  <ProductCard product={product} />
                </Box>
              ))}
            </Slider>
          </Box>
        )}

        {/* Best Selling Slider */}
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
            <Slider {...productSliderSettings}>
              {bestSellingProducts.map((product) => (
                <Box key={product._id || product.id} sx={{ px: 1 }}>
                  <ProductCard product={product} />
                </Box>
              ))}
            </Slider>
          </Box>
        )}

        {/* Featured Products Slider */}
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
            <Slider {...productSliderSettings}>
              {featuredProducts.map((product) => (
                <Box key={product._id || product.id} sx={{ px: 1 }}>
                  <ProductCard product={product} />
                </Box>
              ))}
            </Slider>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;
