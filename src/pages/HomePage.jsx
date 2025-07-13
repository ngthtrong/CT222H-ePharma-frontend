import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Paper,
} from '@mui/material';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ProductCard from '../components/ProductCard';

// Import CSS cho slick carousel
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HomePage = () => {
  // Hero banners
  const heroBanners = [
    {
      id: 1,
      title: 'Khuyến mãi lớn cuối năm',
      subtitle: 'Giảm giá đến 50% cho tất cả sản phẩm chăm sóc sức khỏe',
      image: 'https://via.placeholder.com/1200x400/0D47A1/ffffff?text=Khuyến+mãi+lớn',
      cta: 'Mua ngay',
    },
    {
      id: 2,
      title: 'Dược phẩm chính hãng',
      subtitle: 'Đảm bảo chất lượng từ các thương hiệu uy tín',
      image: 'https://via.placeholder.com/1200x400/2e7d32/ffffff?text=Dược+phẩm+chính+hãng',
      cta: 'Xem ngay',
    },
    {
      id: 3,
      title: 'Giao hàng miễn phí',
      subtitle: 'Miễn phí vận chuyển cho đơn hàng từ 300.000đ',
      image: 'https://via.placeholder.com/1200x400/f57c00/ffffff?text=Giao+hàng+miễn+phí',
      cta: 'Đặt hàng',
    },
  ];

  // Danh mục nổi bật
  const featuredCategories = [
    {
      id: 1,
      name: 'Dược phẩm',
      image: 'https://via.placeholder.com/300x200/e3f2fd/0D47A1?text=Dược+phẩm',
      slug: 'duoc-pham',
    },
    {
      id: 2,
      name: 'Chăm sóc cá nhân',
      image: 'https://via.placeholder.com/300x200/f3e5f5/7b1fa2?text=Chăm+sóc+cá+nhân',
      slug: 'cham-soc-ca-nhan',
    },
    {
      id: 3,
      name: 'Thiết bị y tế',
      image: 'https://via.placeholder.com/300x200/e8f5e8/2e7d32?text=Thiết+bị+y+tế',
      slug: 'thiet-bi-y-te',
    },
    {
      id: 4,
      name: 'Vitamin & Thực phẩm chức năng',
      image: 'https://via.placeholder.com/300x200/fff3e0/f57c00?text=Vitamin',
      slug: 'vitamin-tpcn',
    },
  ];

  // Sản phẩm khuyến mãi
  const saleProducts = [
    {
      id: 1,
      name: 'Paracetamol 500mg - Hộp 100 viên',
      price: 25000,
      discount: 20,
      image: 'https://via.placeholder.com/300x300/ffffff/0D47A1?text=Paracetamol',
    },
    {
      id: 2,
      name: 'Vitamin C 1000mg - Chai 60 viên',
      price: 150000,
      discount: 15,
      image: 'https://via.placeholder.com/300x300/ffffff/f57c00?text=Vitamin+C',
    },
    {
      id: 3,
      name: 'Kem chống nắng SPF50+ - Tuýp 50ml',
      price: 320000,
      discount: 25,
      image: 'https://via.placeholder.com/300x300/ffffff/7b1fa2?text=Kem+chống+nắng',
    },
    {
      id: 4,
      name: 'Máy đo huyết áp điện tử',
      price: 850000,
      discount: 10,
      image: 'https://via.placeholder.com/300x300/ffffff/2e7d32?text=Máy+đo+HA',
    },
  ];

  // Sản phẩm bán chạy
  const bestSellingProducts = [
    {
      id: 5,
      name: 'Dầu gội đầu trị gàu - Chai 400ml',
      price: 180000,
      image: 'https://via.placeholder.com/300x300/ffffff/0D47A1?text=Dầu+gội',
    },
    {
      id: 6,
      name: 'Thuốc ho Prospan - Chai 100ml',
      price: 95000,
      image: 'https://via.placeholder.com/300x300/ffffff/d32f2f?text=Thuốc+ho',
    },
    {
      id: 7,
      name: 'Khẩu trang y tế 4 lớp - Hộp 50 cái',
      price: 45000,
      image: 'https://via.placeholder.com/300x300/ffffff/2e7d32?text=Khẩu+trang',
    },
    {
      id: 8,
      name: 'Gel rửa tay khô 75% - Chai 500ml',
      price: 65000,
      image: 'https://via.placeholder.com/300x300/ffffff/7b1fa2?text=Gel+rửa+tay',
    },
  ];

  const features = [
    {
      icon: <LocalShippingIcon fontSize="large" />,
      title: 'Giao hàng nhanh chóng',
      description: 'Giao hàng trong 2-4 giờ tại TP.HCM và Hà Nội',
    },
    {
      icon: <VerifiedUserIcon fontSize="large" />,
      title: 'Sản phẩm chính hãng',
      description: '100% sản phẩm chính hãng từ các nhà sản xuất uy tín',
    },
    {
      icon: <SecurityIcon fontSize="large" />,
      title: 'Thanh toán an toàn',
      description: 'Bảo mật thông tin thanh toán với công nghệ mã hóa',
    },
    {
      icon: <SupportAgentIcon fontSize="large" />,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ dược sĩ hỗ trợ tư vấn mọi lúc',
    },
  ];

  // Carousel settings
  const heroSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  const productSliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  const handleAddToCart = (product) => {
    console.log('Thêm vào giỏ hàng:', product);
    // TODO: Implement add to cart logic
  };

  return (
    <Box sx={{ backgroundColor: '#f4f6f8' }}>
      {/* Hero Section - Banner carousel */}
      <Box sx={{ mb: 4 }}>
        <Slider {...heroSettings}>
          {heroBanners.map((banner) => (
            <Box key={banner.id}>
              <Paper
                sx={{
                  position: 'relative',
                  backgroundColor: 'grey.800',
                  color: '#fff',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundImage: `url(${banner.image})`,
                  height: { xs: 300, md: 400 },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: 0,
                    backgroundColor: 'rgba(0,0,0,.3)',
                  }}
                />
                <Container maxWidth="lg">
                  <Box
                    sx={{
                      position: 'relative',
                      pt: { xs: 6, md: 8 },
                      pb: { xs: 6, md: 8 },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      height: { xs: 300, md: 400 },
                    }}
                  >
                    <Typography component="h1" variant="h3" color="inherit" gutterBottom>
                      {banner.title}
                    </Typography>
                    <Typography variant="h5" color="inherit" paragraph>
                      {banner.subtitle}
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      component={Link}
                      to="/products"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        mt: 2,
                        backgroundColor: '#fff',
                        color: '#0D47A1',
                        maxWidth: 200,
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                        },
                      }}
                    >
                      {banner.cta}
                    </Button>
                  </Box>
                </Container>
              </Paper>
            </Box>
          ))}
        </Slider>
      </Box>

      <Container maxWidth="lg">
        {/* Danh mục nổi bật */}
        <Box sx={{ my: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom textAlign="center" color="#212121">
            Danh mục nổi bật
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {featuredCategories.map((category) => (
              <Grid item xs={6} md={3} key={category.id}>
                <Card 
                  component={Link}
                  to={`/category/${category.slug}`}
                  sx={{
                    textDecoration: 'none',
                    height: '100%',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease-in-out',
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="150"
                    image={category.image}
                    alt={category.name}
                  />
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h6" fontWeight="medium" color="#212121">
                      {category.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ my: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom textAlign="center" color="#212121">
            Tại sao chọn WellVerse?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                  }}
                >
                  <Box sx={{ color: '#0D47A1', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom color="#212121">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="#424242" textAlign="center">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Product Sliders */}
        {/* Khuyến mãi hot */}
        <Box sx={{ my: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom color="#212121">
            🔥 Khuyến mãi hot
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Slider {...productSliderSettings}>
              {saleProducts.map((product) => (
                <Box key={product.id} sx={{ px: 1 }}>
                  <ProductCard product={product} onAddToCart={handleAddToCart} />
                </Box>
              ))}
            </Slider>
          </Box>
        </Box>

        {/* Bán chạy nhất */}
        <Box sx={{ my: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom color="#212121">
            📈 Bán chạy nhất
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Slider {...productSliderSettings}>
              {bestSellingProducts.map((product) => (
                <Box key={product.id} sx={{ px: 1 }}>
                  <ProductCard product={product} onAddToCart={handleAddToCart} />
                </Box>
              ))}
            </Slider>
          </Box>
        </Box>

        {/* Call to Action */}
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: '#fff',
            my: 6,
            border: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="h4" gutterBottom color="#212121">
            Bắt đầu chăm sóc sức khỏe ngay hôm nay!
          </Typography>
          <Typography variant="body1" color="#424242" paragraph>
            Đăng ký tài khoản để nhận được những ưu đãi đặc biệt và cập nhật sản phẩm mới nhất
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" component={Link} to="/register">
              Đăng ký ngay
            </Button>
            <Button variant="outlined" size="large" component={Link} to="/products">
              Xem sản phẩm
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage;
