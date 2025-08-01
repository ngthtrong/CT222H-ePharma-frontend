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
  Chip,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  LocalOffer,
  Star,
  Category,
  ShoppingBag,
  Whatshot,
  ArrowForward,
  CheckCircle,
  Speed,
  LocalShipping,
  Support,
  Security,
  Inventory,
  People,
  ThumbUp,
  AccessTime,
  Store,
  Loyalty,
  Verified,
  Computer,
  Checkroom,
  Home,
  MenuBook,
  SportsFootball,
  Face,
  DirectionsCar,
  Toys,
  LocalHospital,
  Storefront,
  Payment,
  SupportAgent,
  VerifiedUser,
  FlashOn,
  Assignment,
  Groups,
  Favorite,
  HeadsetMic,
} from '@mui/icons-material';
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

      // Fetch all products first
      const productsResponse = await productAPI.getProducts({ limit: 24 });

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

      // Distribute products into different categories
      setFeaturedProducts(allProducts.slice(0, 8));
      setDiscountedProducts(allProducts.slice(8, 16));
      setBestSellingProducts(allProducts.slice(16, 24));

      // Fetch categories
      try {
        const categoriesResponse = await categoryAPI.getCategories();

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
        // Don't fail the whole page if categories fail
      }

    } catch (error) {
      setError('Không thể tải dữ liệu trang chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Category icons mapping
  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('điện tử') || name.includes('máy tính') || name.includes('laptop')) {
      return <Computer sx={{ fontSize: '28px' }} />;
    } else if (name.includes('thời trang') || name.includes('áo') || name.includes('quần')) {
      return <Checkroom sx={{ fontSize: '28px' }} />;
    } else if (name.includes('gia dụng') || name.includes('nhà bếp')) {
      return <Home sx={{ fontSize: '28px' }} />;
    } else if (name.includes('sách') || name.includes('văn phòng phẩm')) {
      return <MenuBook sx={{ fontSize: '28px' }} />;
    } else if (name.includes('thể thao') || name.includes('gym')) {
      return <SportsFootball sx={{ fontSize: '28px' }} />;
    } else if (name.includes('làm đẹp') || name.includes('mỹ phẩm')) {
      return <Face sx={{ fontSize: '28px' }} />;
    } else if (name.includes('ô tô') || name.includes('xe máy')) {
      return <DirectionsCar sx={{ fontSize: '28px' }} />;
    } else if (name.includes('đồ chơi') || name.includes('trẻ em')) {
      return <Toys sx={{ fontSize: '28px' }} />;
    } else if (name.includes('sức khỏe') || name.includes('y tế')) {
      return <LocalHospital sx={{ fontSize: '28px' }} />;
    } else {
      return <Storefront sx={{ fontSize: '28px' }} />;
    }
  };

  // Services data
  const services = [
    {
      icon: <LocalShipping sx={{ fontSize: '32px' }} />,
      title: 'Giao hàng nhanh',
      description: 'Giao hàng trong ngày tại TP.HCM và các tỉnh thành lớn'
    },
    {
      icon: <VerifiedUser sx={{ fontSize: '32px' }} />,
      title: 'Thanh toán an toàn',
      description: 'Bảo mật SSL 256-bit, hỗ trợ nhiều hình thức thanh toán'
    },
    {
      icon: <HeadsetMic sx={{ fontSize: '32px' }} />,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ tư vấn chuyên nghiệp, nhiệt tình'
    },
    {
      icon: <Verified sx={{ fontSize: '32px' }} />,
      title: 'Chính hãng 100%',
      description: 'Cam kết sản phẩm chính hãng, bảo hành đầy đủ'
    },
    {
      icon: <FlashOn sx={{ fontSize: '32px' }} />,
      title: 'Giá tốt nhất',
      description: 'Cam kết giá tốt nhất thị trường, hoàn tiền nếu thấy rẻ hơn'
    },
    {
      icon: <Assignment sx={{ fontSize: '32px' }} />,
      title: 'Đổi trả dễ dàng',
      description: '30 ngày đổi trả miễn phí, không cần lý do'
    },
    {
      icon: <Groups sx={{ fontSize: '32px' }} />,
      title: 'Cộng đồng lớn',
      description: 'Hơn 100,000 khách hàng tin tựng và sử dụng'
    },
    {
      icon: <Favorite sx={{ fontSize: '32px' }} />,
      title: 'Dịch vụ tận tâm',
      description: 'Luôn đặt khách hàng làm trung tâm trong mọi hoạt động'
    }
  ];

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
      img: 'https://cdn.nhathuoclongchau.com.vn/unsafe/1920x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/Top_Banner1440x414_424904014f.png', alt: 'Hero Banner 1',
    },
    {
      img: 'https://cdn.nhathuoclongchau.com.vn/unsafe/2560x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/banner_desktop_fb383b0f89.png', alt: 'Hero Banner 2',
    },
    {
      img: 'https://cdn.nhathuoclongchau.com.vn/unsafe/2560x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/Ruot_2062e1ea49.png', alt: 'Hero Banner 3',
    },
  ];

  const renderProductSlider = (products, title, icon, description) => (
    <Box sx={{ my: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon && React.cloneElement(icon, { sx: { mr: 1, color: 'primary.main' } })}
          <Box>
            <Typography variant="h4" component="h2" sx={{ fontWeight: '700', color: 'text.primary' }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {description}
              </Typography>
            )}
          </Box>
        </Box>
        <Button 
          endIcon={<ArrowForward />} 
          color="primary"
          onClick={() => navigate('/products')}
          sx={{ fontWeight: 'medium' }}
        >
          Xem tất cả
        </Button>
      </Box>
      {products.length > 0 ? (
        <Slider {...productSliderSettings}>
          {products.map((product) => (
            <Box key={product._id || product.id} sx={{ p: 1 }}>
              <ProductCard product={product} />
            </Box>
          ))}
        </Slider>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Không có sản phẩm để hiển thị
          </Typography>
        </Box>
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Category sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h4" component="h2" sx={{ fontWeight: '700', color: 'text.primary' }}>
              Danh mục nổi bật
            </Typography>
          </Box>
          <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
            {categories.map((category) => (
              <Grid 
                size={{ xs: 6, sm: 4, md: 2 }} 
                key={category._id || category.id} 
                sx={{ 
                  display: 'flex',
                  '& > *': { width: '100%' }
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    minHeight: 180,
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: `0 4px 20px ${theme.palette.primary.main}20`,
                      transform: 'translateY(-2px)',
                      cursor: 'pointer',
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                  onClick={() => navigate(`/products?category=${category.slug}`)}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: `0 4px 15px ${theme.palette.primary.main}40`,
                      transition: 'all 0.3s ease',
                      flexShrink: 0,
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: `0 6px 20px ${theme.palette.primary.main}50`,
                      },
                    }}
                  >
                    {getCategoryIcon(category.name)}
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'medium', 
                        color: 'text.primary',
                        fontSize: '0.875rem',
                        lineHeight: 1.3,
                        minHeight: '2.6em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        mb: category.productCount ? 0.5 : 0,
                      }}
                    >
                      {category.name}
                    </Typography>
                    {category.productCount && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          display: 'block',
                        }}
                      >
                        {category.productCount} sản phẩm
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Flash Sale / Discounted Products */}
        <Box 
          sx={{ 
            my: 4, 
            p: 4, 
            background: `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.secondary.main}25)`,
            borderRadius: 3,
            border: `2px solid ${theme.palette.secondary.main}30`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Whatshot sx={{ mr: 1, color: 'secondary.main' }} />
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: '700', 
                color: 'text.primary',
                mr: 2
              }}
            >
              Khuyến mãi hot
            </Typography>
            <Chip 
              label="Giảm đến 50%" 
              color="secondary" 
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          {discountedProducts.length > 0 ? (
            <Slider {...productSliderSettings}>
              {discountedProducts.map((product) => (
                <Box key={product._id || product.id} sx={{ p: 1 }}>
                  <ProductCard product={product} />
                </Box>
              ))}
            </Slider>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Hiện tại chưa có sản phẩm khuyến mãi
              </Typography>
            </Box>
          )}
        </Box>

        {/* Best Selling Products */}
        {renderProductSlider(
          bestSellingProducts, 
          'Sản phẩm bán chạy', 
          <TrendingUp />,
          'Những sản phẩm được yêu thích nhất'
        )}

        {/* Featured Products */}
        {renderProductSlider(
          featuredProducts, 
          'Sản phẩm nổi bật', 
          <Star />,
          'Những sản phẩm được đề xuất dành cho bạn'
        )}

        {/* Services Section */}
        <Box sx={{ my: 6 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: '700', color: 'text.primary', mb: 1 }}>
              Tại sao chọn chúng tôi?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cam kết mang đến trải nghiệm mua sắm tốt nhất
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {services.map((service, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: `0 8px 25px ${theme.palette.primary.main}20`,
                      transform: 'translateY(-4px)',
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: `0 4px 15px ${theme.palette.primary.main}40`,
                    }}
                  >
                    {service.icon}
                  </Box>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: '600', mb: 1, color: 'text.primary' }}>
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {service.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Statistics Section */}
        <Box 
          sx={{ 
            my: 6, 
            p: 4, 
            background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.primary.main}20)`,
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" component="h2" sx={{ fontWeight: '700', color: 'text.primary', mb: 4 }}>
            Thống kê ấn tượng
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: '700', color: 'primary.main', mb: 1 }}>
                  1000+
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sản phẩm
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: '700', color: 'primary.main', mb: 1 }}>
                  500+
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Khách hàng
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: '700', color: 'primary.main', mb: 1 }}>
                  99%
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Hài lòng
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: '700', color: 'primary.main', mb: 1 }}>
                  24/7
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Hỗ trợ
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
