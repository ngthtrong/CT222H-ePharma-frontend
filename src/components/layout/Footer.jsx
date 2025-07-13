import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#f5f5f5', // Màu xám nhạt theo đặc tả
        color: '#424242', // Màu text secondary
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              WellVerse
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: '#424242' }}>
              Hệ thống nhà thuốc trực tuyến hàng đầu với các sản phẩm chăm sóc sức khỏe chất lượng cao và dịch vụ khách hàng tuyệt vời.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: '#424242', '&:hover': { color: '#0D47A1' } }}>
                <FacebookIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: '#424242', '&:hover': { color: '#0D47A1' } }}>
                <TwitterIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: '#424242', '&:hover': { color: '#0D47A1' } }}>
                <InstagramIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: '#424242', '&:hover': { color: '#0D47A1' } }}>
                <EmailIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom color="#212121" fontWeight="medium">
              Liên kết nhanh
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="#424242" underline="hover" sx={{ '&:hover': { color: '#0D47A1' } }}>
                Trang chủ
              </Link>
              <Link href="/products" color="#424242" underline="hover" sx={{ '&:hover': { color: '#0D47A1' } }}>
                Sản phẩm
              </Link>
              <Link href="/category/duoc-pham" color="#424242" underline="hover" sx={{ '&:hover': { color: '#0D47A1' } }}>
                Dược phẩm
              </Link>
              <Link href="/category/cham-soc-ca-nhan" color="#424242" underline="hover" sx={{ '&:hover': { color: '#0D47A1' } }}>
                Chăm sóc cá nhân
              </Link>
              <Link href="/category/thiet-bi-y-te" color="#424242" underline="hover" sx={{ '&:hover': { color: '#0D47A1' } }}>
                Thiết bị y tế
              </Link>
            </Box>
          </Grid>

          {/* Customer Service */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom color="#212121" fontWeight="medium">
              Dịch vụ khách hàng
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/help" color="#424242" underline="hover" sx={{ '&:hover': { color: '#0D47A1' } }}>
                Trợ giúp
              </Link>
              <Link href="/returns" color="#424242" underline="hover" sx={{ '&:hover': { color: '#0D47A1' } }}>
                Chính sách đổi trả
              </Link>
              <Link href="/shipping" color="#424242" underline="hover" sx={{ '&:hover': { color: '#0D47A1' } }}>
                Vận chuyển
              </Link>
              <Link href="/privacy" color="#424242" underline="hover" sx={{ '&:hover': { color: '#0D47A1' } }}>
                Chính sách bảo mật
              </Link>
              <Link href="/terms" color="#424242" underline="hover" sx={{ '&:hover': { color: '#0D47A1' } }}>
                Điều khoản sử dụng
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom color="#212121" fontWeight="medium">
              Thông tin liên hệ
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon sx={{ fontSize: '1.2rem', color: '#0D47A1' }} />
                <Typography variant="body2" color="#424242">
                  123 Đường ABC, Quận 1, TP.HCM
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ fontSize: '1.2rem', color: '#0D47A1' }} />
                <Typography variant="body2" color="#424242">
                  Hotline: 1900-6750
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ fontSize: '1.2rem', color: '#0D47A1' }} />
                <Typography variant="body2" color="#424242">
                  info@wellverse.com
                </Typography>
              </Box>
              <Typography variant="body2" color="#424242">
                🕒 Hoạt động 24/7
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />

        {/* Copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Typography variant="body2" color="#424242">
            © 2024 WellVerse. Tất cả quyền được bảo lưu.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 1, sm: 0 } }}>
            <Link href="/privacy" color="#424242" underline="hover" variant="body2" sx={{ '&:hover': { color: '#0D47A1' } }}>
              Chính sách bảo mật
            </Link>
            <Link href="/terms" color="#424242" underline="hover" variant="body2" sx={{ '&:hover': { color: '#0D47A1' } }}>
              Điều khoản sử dụng
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
