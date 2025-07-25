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
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import ProductCard from '../components/ProductCard';
import { productAPI, categoryAPI } from '../api';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { getImageSrc } from '../utils/imageUtils';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
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
    autoplaySpeed: 3000,
  };

  const productSliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // Mock data for hero banners
  const heroBanners = [
    {
      img: 'https://cdn.nhathuoclongchau.com.vn/unsafe/1920x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/Top_Banner1440x414_424904014f.png',
      alt: 'Hero Banner 1',
    },
    {
      img: 'https://cdn.nhathuoclongchau.com.vn/unsafe/2560x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/banner_desktop_fb383b0f89.png',
      alt: 'Hero Banner 2',
    },
    {
      img: 'https://cdn.nhathuoclongchau.com.vn/unsafe/2560x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/Ruot_2062e1ea49.png',
      alt: 'Hero Banner 3',
    },
  ];

  const renderProductSlider = (products, title) => (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: '700', mb: 2 }}>
        {title}
      </Typography>
      {products.length > 0 ? (
        <Slider {...productSliderSettings}>
          {products.map((product) => (
            <Box key={product._id || product.id} sx={{ p: 1 }}>
              <ProductCard product={product} />
            </Box>
          ))}
        </Slider>
      ) : (
        <Typography>Không có sản phẩm để hiển thị.</Typography>
      )}
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Hero Banner Carousel */}
      <Box sx={{ mb: 4 }}>
        <Slider {...heroCarouselSettings}>
          {heroBanners.map((banner, index) => (
            <Box key={index} sx={{ '&:focus': { outline: 'none' } }}>
              <CardMedia
                component="img"
                image={banner.img}
                alt={banner.alt}
                sx={{ width: '100%', height: { xs: 200, sm: 300, md: 400 }, objectFit: 'cover' }}
              />
            </Box>
          ))}
        </Slider>
      </Box>

      <Container maxWidth="lg">
        {/* Featured Categories */}
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: '700', mb: 2 }}>
            Danh mục nổi bật
          </Typography>
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid item xs={6} sm={4} md={2} key={category._id || category.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: 3,
                      cursor: 'pointer',
                    },
                  }}
                  onClick={() => navigate(`/category/${category.slug}`)}
                >
                  {category.image ? (
                    <CardMedia
                      component="img"
                      image={category.image}
                      alt={category.name}
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        mx: 'auto', 
                        mb: 1, 
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 1,
                        bgcolor: 'grey.100',
                        border: '1px solid',
                        borderColor: 'grey.300',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'grey.500',
                        fontSize: '12px'
                      }}
                    >
                      No Image
                    </Box>
                  )}
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {category.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Flash Sale / Discounted Products */}
        <Box sx={{ my: 4, p: 3, bgcolor: 'secondary.light', borderRadius: 2 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: '700', mb: 2, color: 'secondary.contrastText' }}>
            Khuyến mãi hot
          </Typography>
          {discountedProducts.length > 0 ? (
            <Slider {...productSliderSettings}>
              {discountedProducts.map((product) => (
                <Box key={product._id || product.id} sx={{ p: 1 }}>
                  <ProductCard product={product} />
                </Box>
              ))}
            </Slider>
          ) : (
            <Typography>Không có sản phẩm khuyến mãi.</Typography>
          )}
        </Box>

        {/* Best Selling Products */}
        {renderProductSlider(bestSellingProducts, 'Sản phẩm bán chạy')}

        {/* Featured Products */}
        {renderProductSlider(featuredProducts, 'Sản phẩm nổi bật')}

        {/* Featured Brands (Placeholder) */}
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: '700', mb: 2 }}>
            Thương hiệu nổi bật
          </Typography>
          <Grid container spacing={2}>
            {/* Placeholder for brand logos */}
            {[...Array(6)].map((_, index) => (
              <Grid item xs={4} sm={2} key={index}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 80,
                  }}
                >
                  <Typography>Brand {index + 1}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
