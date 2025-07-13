import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const ProductCard = ({ product, onAddToCart }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const getDiscountedPrice = (price, discount) => {
    return price * (1 - discount / 100);
  };

  const hasDiscount = product.discount && product.discount > 0;

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': { 
          boxShadow: 6,
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease-in-out',
        },
      }}
    >
      {/* Hình ảnh sản phẩm */}
      <CardMedia
        component="img"
        height="200"
        image={product.image || 'https://via.placeholder.com/300x200'}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {/* Tên sản phẩm - tối đa 2 dòng */}
        <Typography 
          variant="body1" 
          fontWeight="medium"
          gutterBottom
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '2.5rem',
            lineHeight: 1.2,
          }}
        >
          {product.name}
        </Typography>

        {/* Giá */}
        <Box sx={{ mt: 'auto', mb: 2 }}>
          {hasDiscount ? (
            <Box>
              {/* Giá cũ - gạch ngang */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ 
                  textDecoration: 'line-through',
                  fontSize: '0.875rem',
                }}
              >
                {formatPrice(product.price)}
              </Typography>
              {/* Giá mới - màu đỏ, to */}
              <Typography 
                color="error" 
                variant="h6"
                fontWeight="bold"
              >
                {formatPrice(getDiscountedPrice(product.price, product.discount))}
              </Typography>
            </Box>
          ) : (
            <Typography 
              variant="h6" 
              color="primary"
              fontWeight="bold"
            >
              {formatPrice(product.price)}
            </Typography>
          )}
        </Box>

        {/* Nút "Thêm vào giỏ" */}
        <Button
          variant="contained"
          startIcon={<AddShoppingCartIcon />}
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart && onAddToCart(product);
          }}
          sx={{
            textTransform: 'none',
            fontWeight: 'medium',
          }}
        >
          Thêm vào giỏ
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
