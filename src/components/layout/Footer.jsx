import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  Twitter as TwitterIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Store as StoreIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();

  const services = [
    { icon: <ShippingIcon />, text: 'Giao hàng nhanh' },
    { icon: <SecurityIcon />, text: 'Thanh toán an toàn' },
    { icon: <SupportIcon />, text: 'Hỗ trợ 24/7' },
    { icon: <StoreIcon />, text: 'Chính hãng 100%' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main}05, ${theme.palette.primary.main}10)`,
        borderTop: `2px solid ${theme.palette.primary.main}20`,
        mt: 'auto',
      }}
    >
      {/* Services Banner */}
      <Box sx={{ 
        bgcolor: 'white', 
        py: 3,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {services.map((service, index) => (
              <Grid size={{ xs: 6, md: 3 }} key={index}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'primary.50',
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <Box sx={{ 
                    color: 'primary.main',
                    '& .MuiSvgIcon-root': { fontSize: '28px' }
                  }}>
                    {service.icon}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {service.text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Main Footer */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'primary.main',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <StoreIcon sx={{ fontSize: '32px' }} />
                WellVerse
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
                Chuỗi cửa hàng uy tín, cung cấp sản phẩm chất lượng cao với dịch vụ tận tâm. 
                Cam kết mang đến trải nghiệm mua sắm tốt nhất cho khách hàng.
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { icon: <FacebookIcon />, color: '#1877F2' },
                { icon: <InstagramIcon />, color: '#E4405F' },
                { icon: <YouTubeIcon />, color: '#FF0000' },
                { icon: <TwitterIcon />, color: '#1DA1F2' },
              ].map((social, index) => (
                <IconButton 
                  key={index}
                  sx={{
                    bgcolor: 'white',
                    border: `2px solid ${social.color}20`,
                    color: social.color,
                    '&:hover': {
                      bgcolor: social.color,
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 15px ${social.color}40`
                    }
                  }}
                  size="small"
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 3,
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 40,
                  height: 3,
                  bgcolor: 'primary.main',
                  borderRadius: 2
                }
              }}
            >
              Liên kết nhanh
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                'Về chúng tôi',
                'Sản phẩm',
                'Khuyến mãi',
                'Tin tức',
                'Liên hệ'
              ].map((text, index) => (
                <Link 
                  key={index}
                  href="#" 
                  color="text.secondary" 
                  underline="none"
                  sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(8px)'
                    }
                  }}
                >
                  {text}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Support */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 3,
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 40,
                  height: 3,
                  bgcolor: 'primary.main',
                  borderRadius: 2
                }
              }}
            >
              Hỗ trợ khách hàng
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                'Hướng dẫn mua hàng',
                'Chính sách đổi trả',
                'Chính sách bảo mật',
                'Điều khoản sử dụng',
                'Câu hỏi thường gặp'
              ].map((text, index) => (
                <Link 
                  key={index}
                  href="#" 
                  color="text.secondary" 
                  underline="none"
                  sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(8px)'
                    }
                  }}
                >
                  {text}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 3,
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 40,
                  height: 3,
                  bgcolor: 'primary.main',
                  borderRadius: 2
                }
              }}
            >
              Thông tin liên hệ
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {[
                { icon: <PhoneIcon />, text: 'Hotline: 1900 1009', color: '#25D366' },
                { icon: <EmailIcon />, text: 'support@wellverse.vn', color: '#EA4335' },
                { icon: <LocationIcon />, text: '123 Đường ABC, Quận 1, TP.HCM', color: '#4285F4' }
              ].map((contact, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: contact.color + '10',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: contact.color,
                      flexShrink: 0,
                      mt: 0.2
                    }}
                  >
                    {contact.icon}
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      lineHeight: 1.6,
                      fontWeight: 500,
                      flex: 1
                    }}
                  >
                    {contact.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ 
          my: 4, 
          borderColor: theme.palette.primary.main + '20',
          borderWidth: 1 
        }} />

        {/* Copyright */}
        <Box sx={{ 
          textAlign: 'center',
          p: 3,
          borderRadius: 2,
          bgcolor: 'white',
          boxShadow: `0 2px 10px ${theme.palette.primary.main}10`
        }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontWeight: 500,
              '& strong': {
                color: 'primary.main',
                fontWeight: 700
              }
            }}
          >
            © 2025 <strong>WellVerse</strong>. Tất cả quyền được bảo lưu. 
            Thiết kế với ❤️ tại Việt Nam.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
